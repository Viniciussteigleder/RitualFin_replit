"use server";

import { db } from "@/lib/db";
import { transactions, accounts, rules } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, desc, asc, ne, isNull, or, count } from "drizzle-orm";
import { auth } from "@/auth";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays, parseISO, subDays } from "date-fns";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CockpitFilters {
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
  type?: "Despesa" | "Receita";
  fixVar?: "Fixo" | "Variável";
  recurring?: boolean;
  appCategory?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  merchant?: string;
  uncategorizedOnly?: boolean;
}

export interface ExecutiveKPI {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  delta: number;
  deltaPercent: number;
  trend: "up" | "down" | "stable";
  isPositive: boolean; // Whether up is good or bad
  format: "currency" | "number" | "percent";
  sparkline?: number[];
  drillPath?: string;
}

export interface CategoryBreakdown {
  category: string;
  level: "appCategory" | "category1" | "category2" | "category3";
  total: number;
  count: number;
  percentage: number;
  previousTotal: number;
  delta: number;
  deltaPercent: number;
  trend: "up" | "down" | "stable";
  color?: string;
  children?: CategoryBreakdown[];
}

export interface MerchantInsight {
  name: string;
  total: number;
  count: number;
  avgTransaction: number;
  frequency: number; // avg days between transactions
  categories: string[];
  isRecurring: boolean;
  firstSeen: Date;
  lastSeen: Date;
  trend: "up" | "down" | "stable";
  previousTotal: number;
  deltaPercent: number;
  concentrationRisk: number; // % of total spend
}

export interface RecurringInsight {
  name: string;
  monthlyAmount: number;
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
  nextExpected?: Date;
  dayOfMonth?: number;
  category: string;
  confidence: number;
  priceHistory: { date: Date; amount: number }[];
  priceChange?: number; // % change in price over time
  isSubscription: boolean;
  cancelRecommendation?: string;
}

export interface TrendDataPoint {
  period: string; // YYYY-MM or YYYY-Www
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  fixedExpense: number;
  variableExpense: number;
  recurringExpense: number;
  transactionCount: number;
}

export interface Anomaly {
  id: string;
  type: "spike" | "drop" | "missing_income" | "duplicate" | "category_drift" | "new_merchant" | "unusual_amount";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  amount?: number;
  category?: string;
  merchant?: string;
  date?: Date;
  evidence: string[];
  actionUrl?: string;
}

export interface Insight {
  id: string;
  type: "observation" | "risk" | "opportunity" | "recommendation";
  priority: number; // 1-100, higher = more important
  title: string;
  description: string;
  impact?: number; // € amount
  category?: string;
  merchant?: string;
  evidence: string[];
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  confidence: number; // 0-100
}

export interface CockpitData {
  kpis: ExecutiveKPI[];
  breakdown: CategoryBreakdown[];
  trends: TrendDataPoint[];
  merchants: MerchantInsight[];
  recurring: RecurringInsight[];
  anomalies: Anomaly[];
  insights: Insight[];
  dataQuality: {
    totalTransactions: number;
    categorizedPercent: number;
    merchantNormalized: number;
    dateRange: { from: Date; to: Date };
    lastUpdated: Date;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const buildBaseConditions = (userId: string, filters: CockpitFilters) => {
  const conditions = [eq(transactions.userId, userId)];

  if (filters.startDate) {
    conditions.push(gte(transactions.paymentDate, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(transactions.paymentDate, filters.endDate));
  }
  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type));
  }
  if (filters.fixVar) {
    conditions.push(eq(transactions.fixVar, filters.fixVar));
  }
  if (filters.recurring !== undefined) {
    conditions.push(eq(transactions.recurringFlag, filters.recurring));
  }
  if (filters.appCategory) {
    if (filters.appCategory === "OPEN") {
      conditions.push(isNull(transactions.appCategoryName));
    } else {
      conditions.push(eq(transactions.appCategoryName, filters.appCategory));
    }
  }
  if (filters.category1) {
    if (filters.category1 === "OPEN") {
      conditions.push(isNull(transactions.category1));
    } else {
      conditions.push(sql`CAST(${transactions.category1} AS text) = ${filters.category1}`);
    }
  }
  if (filters.category2) {
    conditions.push(eq(transactions.category2, filters.category2));
  }
  if (filters.category3) {
    conditions.push(eq(transactions.category3, filters.category3));
  }
  if (filters.merchant) {
    conditions.push(
      or(
        eq(transactions.aliasDesc, filters.merchant),
        eq(transactions.descNorm, filters.merchant)
      )!
    );
  }
  if (filters.uncategorizedOnly) {
    conditions.push(
      or(
        isNull(transactions.category1),
        eq(sql`CAST(${transactions.category1} AS text)`, "OPEN")
      )!
    );
  }

  // Standard exclusions
  conditions.push(eq(transactions.internalTransfer, false));
  conditions.push(sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`);
  conditions.push(sql`${transactions.display} <> 'no'`);

  return conditions;
};

const calculateTrend = (current: number, previous: number): "up" | "down" | "stable" => {
  if (previous === 0) return current > 0 ? "up" : "stable";
  const change = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(change) < 5) return "stable";
  return change > 0 ? "up" : "down";
};

const calculateMedian = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const calculateMAD = (arr: number[], median: number): number => {
  if (arr.length === 0) return 0;
  const deviations = arr.map((x) => Math.abs(x - median));
  return calculateMedian(deviations);
};

// ============================================================================
// CORE DATA FETCHING
// ============================================================================

export async function getExecutiveKPIs(filters: CockpitFilters): Promise<ExecutiveKPI[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = buildBaseConditions(userId, filters);

  // Calculate period duration for previous period comparison
  const startDate = filters.startDate || startOfMonth(new Date());
  const endDate = filters.endDate || endOfMonth(new Date());
  const daysDiff = differenceInDays(endDate, startDate) + 1;

  const prevStartDate = subDays(startDate, daysDiff);
  const prevEndDate = subDays(endDate, daysDiff);
  const prevConditions = buildBaseConditions(userId, { ...filters, startDate: prevStartDate, endDate: prevEndDate });

  // Parallel queries for current and previous periods
  const [currentData, prevData, monthlyTrend] = await Promise.all([
    // Current period aggregates
    db.select({
      totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END), 0)`,
      totalExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)), 0)`,
      netResult: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      txCount: sql<number>`COUNT(*)`,
      fixedExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 AND ${transactions.fixVar} = 'Fixo' THEN ${transactions.amount} ELSE 0 END)), 0)`,
      variableExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 AND ${transactions.fixVar} = 'Variável' THEN ${transactions.amount} ELSE 0 END)), 0)`,
      recurringExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 AND ${transactions.recurringFlag} = true THEN ${transactions.amount} ELSE 0 END)), 0)`,
      avgTransaction: sql<number>`COALESCE(AVG(ABS(${transactions.amount})), 0)`,
      categoryCount: sql<number>`COUNT(DISTINCT ${transactions.appCategoryName})`,
      uncategorizedCount: sql<number>`COUNT(CASE WHEN ${transactions.category1} IS NULL OR ${transactions.category1} = 'OPEN' THEN 1 END)`,
    })
      .from(transactions)
      .where(and(...conditions)),

    // Previous period aggregates
    db.select({
      totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END), 0)`,
      totalExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)), 0)`,
      netResult: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      txCount: sql<number>`COUNT(*)`,
      fixedExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 AND ${transactions.fixVar} = 'Fixo' THEN ${transactions.amount} ELSE 0 END)), 0)`,
      variableExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 AND ${transactions.fixVar} = 'Variável' THEN ${transactions.amount} ELSE 0 END)), 0)`,
      recurringExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 AND ${transactions.recurringFlag} = true THEN ${transactions.amount} ELSE 0 END)), 0)`,
    })
      .from(transactions)
      .where(and(...prevConditions)),

    // Last 6 months sparkline data (for expense trend)
    db.select({
      month: sql<string>`TO_CHAR(date_trunc('month', ${transactions.paymentDate}), 'YYYY-MM')`,
      total: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)), 0)`,
    })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.paymentDate, subMonths(startDate, 6)),
          lte(transactions.paymentDate, endDate),
          eq(transactions.internalTransfer, false),
          sql`${transactions.display} <> 'no'`
        )
      )
      .groupBy(sql`TO_CHAR(date_trunc('month', ${transactions.paymentDate}), 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(date_trunc('month', ${transactions.paymentDate}), 'YYYY-MM')`)
  ]);

  const curr = currentData[0];
  const prev = prevData[0];
  const sparkline = monthlyTrend.map((m) => Number(m.total));

  const buildKPI = (
    id: string,
    label: string,
    value: number,
    previousValue: number,
    format: ExecutiveKPI["format"],
    isPositiveUp: boolean,
    spark?: number[]
  ): ExecutiveKPI => {
    const delta = value - previousValue;
    const deltaPercent = previousValue !== 0 ? (delta / Math.abs(previousValue)) * 100 : 0;
    const trend = calculateTrend(value, previousValue);
    const isPositive = isPositiveUp ? trend === "up" : trend === "down";

    return {
      id,
      label,
      value,
      previousValue,
      delta,
      deltaPercent,
      trend,
      isPositive: trend === "stable" ? true : isPositive,
      format,
      sparkline: spark,
    };
  };

  // Calculate savings rate
  const savingsRate = Number(curr.totalIncome) > 0
    ? ((Number(curr.totalIncome) - Number(curr.totalExpense)) / Number(curr.totalIncome)) * 100
    : 0;
  const prevSavingsRate = Number(prev.totalIncome) > 0
    ? ((Number(prev.totalIncome) - Number(prev.totalExpense)) / Number(prev.totalIncome)) * 100
    : 0;

  return [
    buildKPI("net_result", "Resultado Líquido", Number(curr.netResult), Number(prev.netResult), "currency", true),
    buildKPI("total_expense", "Total Despesas", Number(curr.totalExpense), Number(prev.totalExpense), "currency", false, sparkline),
    buildKPI("total_income", "Total Receitas", Number(curr.totalIncome), Number(prev.totalIncome), "currency", true),
    buildKPI("savings_rate", "Taxa Poupança", savingsRate, prevSavingsRate, "percent", true),
    buildKPI("fixed_expense", "Despesas Fixas", Number(curr.fixedExpense), Number(prev.fixedExpense), "currency", false),
    buildKPI("variable_expense", "Despesas Variáveis", Number(curr.variableExpense), Number(prev.variableExpense), "currency", false),
    buildKPI("recurring_expense", "Recorrentes", Number(curr.recurringExpense), Number(prev.recurringExpense), "currency", false),
    buildKPI("tx_count", "Transações", Number(curr.txCount), Number(prev.txCount), "number", true),
    buildKPI("avg_transaction", "Média/Transação", Number(curr.avgTransaction), 0, "currency", false),
    buildKPI("category_count", "Categorias Ativas", Number(curr.categoryCount), 0, "number", true),
  ];
}

export async function getCategoryBreakdown(filters: CockpitFilters): Promise<CategoryBreakdown[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = buildBaseConditions(userId, filters);

  // Get current period breakdown by appCategory
  const results = await db
    .select({
      category: sql<string>`COALESCE(${transactions.appCategoryName}, 'Não Categorizado')`,
      total: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)), 0)`,
      income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(sql`COALESCE(${transactions.appCategoryName}, 'Não Categorizado')`)
    .orderBy(desc(sql`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)), 0)`));

  const totalExpense = results.reduce((acc, r) => acc + Number(r.total), 0);

  return results.map((r) => ({
    category: r.category,
    level: "appCategory" as const,
    total: Number(r.total),
    count: Number(r.count),
    percentage: totalExpense > 0 ? (Number(r.total) / totalExpense) * 100 : 0,
    previousTotal: 0,
    delta: 0,
    deltaPercent: 0,
    trend: "stable" as const,
  }));
}

export async function getTrendData(filters: CockpitFilters, months: number = 12): Promise<TrendDataPoint[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const startDate = filters.startDate || subMonths(new Date(), months);
  const endDate = filters.endDate || new Date();

  const monthExpr = sql<string>`TO_CHAR(date_trunc('month', ${transactions.paymentDate}), 'YYYY-MM')`;

  const results = await db
    .select({
      period: monthExpr,
      income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END), 0)`,
      expense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)), 0)`,
      net: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      fixedExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 AND ${transactions.fixVar} = 'Fixo' THEN ${transactions.amount} ELSE 0 END)), 0)`,
      variableExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 AND ${transactions.fixVar} = 'Variável' THEN ${transactions.amount} ELSE 0 END)), 0)`,
      recurringExpense: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 AND ${transactions.recurringFlag} = true THEN ${transactions.amount} ELSE 0 END)), 0)`,
      transactionCount: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.paymentDate, startDate),
        lte(transactions.paymentDate, endDate),
        eq(transactions.internalTransfer, false),
        sql`${transactions.display} <> 'no'`
      )
    )
    .groupBy(monthExpr)
    .orderBy(monthExpr);

  return results.map((r) => {
    const income = Number(r.income);
    const expense = Number(r.expense);
    return {
      period: r.period,
      income,
      expense,
      net: Number(r.net),
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
      fixedExpense: Number(r.fixedExpense),
      variableExpense: Number(r.variableExpense),
      recurringExpense: Number(r.recurringExpense),
      transactionCount: Number(r.transactionCount),
    };
  });
}

export async function getMerchantInsights(filters: CockpitFilters, limit: number = 30): Promise<MerchantInsight[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = buildBaseConditions(userId, { ...filters, type: "Despesa" });
  const merchantLabel = sql<string>`COALESCE(${transactions.aliasDesc}, ${transactions.descNorm})`;

  const results = await db
    .select({
      name: merchantLabel,
      total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)`,
      count: sql<number>`COUNT(*)`,
      avgTransaction: sql<number>`COALESCE(ABS(AVG(${transactions.amount})), 0)`,
      categories: sql<string>`STRING_AGG(DISTINCT COALESCE(${transactions.appCategoryName}, 'N/A'), ', ')`,
      hasRecurring: sql<boolean>`BOOL_OR(${transactions.recurringFlag})`,
      firstSeen: sql<Date>`MIN(${transactions.paymentDate})`,
      lastSeen: sql<Date>`MAX(${transactions.paymentDate})`,
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(merchantLabel)
    .orderBy(desc(sql`COALESCE(ABS(SUM(${transactions.amount})), 0)`))
    .limit(limit);

  // Calculate total for concentration risk
  const totalSpend = results.reduce((acc, r) => acc + Number(r.total), 0);

  return results.map((r) => {
    const count = Number(r.count);
    const firstSeen = new Date(r.firstSeen);
    const lastSeen = new Date(r.lastSeen);
    const daysBetween = differenceInDays(lastSeen, firstSeen);
    const frequency = count > 1 && daysBetween > 0 ? daysBetween / (count - 1) : 0;

    return {
      name: r.name || "Sem descrição",
      total: Number(r.total),
      count,
      avgTransaction: Number(r.avgTransaction),
      frequency: Math.round(frequency),
      categories: r.categories?.split(", ") || [],
      isRecurring: Boolean(r.hasRecurring),
      firstSeen,
      lastSeen,
      trend: "stable" as const,
      previousTotal: 0,
      deltaPercent: 0,
      concentrationRisk: totalSpend > 0 ? (Number(r.total) / totalSpend) * 100 : 0,
    };
  });
}

export async function getRecurringInsights(filters: CockpitFilters): Promise<RecurringInsight[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = buildBaseConditions(userId, { ...filters, recurring: true });
  const merchantLabel = sql<string>`COALESCE(${transactions.aliasDesc}, ${transactions.descNorm})`;

  const results = await db
    .select({
      name: merchantLabel,
      total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)`,
      count: sql<number>`COUNT(*)`,
      avgAmount: sql<number>`COALESCE(ABS(AVG(${transactions.amount})), 0)`,
      category: sql<string>`MODE() WITHIN GROUP (ORDER BY ${transactions.appCategoryName})`,
      avgConfidence: sql<number>`COALESCE(AVG(${transactions.recurringConfidence}), 0)`,
      dayOfMonth: sql<number>`MODE() WITHIN GROUP (ORDER BY ${transactions.recurringDayOfMonth})`,
      lastDate: sql<Date>`MAX(${transactions.paymentDate})`,
      firstDate: sql<Date>`MIN(${transactions.paymentDate})`,
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(merchantLabel)
    .orderBy(desc(sql`COALESCE(ABS(SUM(${transactions.amount})), 0)`))
    .limit(50);

  return results.map((r) => {
    const count = Number(r.count);
    const firstDate = new Date(r.firstDate);
    const lastDate = new Date(r.lastDate);
    const monthsBetween = Math.max(1, differenceInDays(lastDate, firstDate) / 30);
    const monthlyAmount = count > 0 ? Number(r.total) / Math.max(1, monthsBetween) : Number(r.avgAmount);

    // Determine frequency based on average interval
    let frequency: RecurringInsight["frequency"] = "monthly";
    if (count > 1) {
      const avgInterval = differenceInDays(lastDate, firstDate) / (count - 1);
      if (avgInterval <= 2) frequency = "daily";
      else if (avgInterval <= 9) frequency = "weekly";
      else if (avgInterval <= 18) frequency = "biweekly";
      else if (avgInterval <= 45) frequency = "monthly";
      else if (avgInterval <= 100) frequency = "quarterly";
      else frequency = "yearly";
    }

    return {
      name: r.name || "Sem descrição",
      monthlyAmount,
      frequency,
      dayOfMonth: r.dayOfMonth ? Number(r.dayOfMonth) : undefined,
      category: r.category || "N/A",
      confidence: Number(r.avgConfidence) || 70,
      priceHistory: [],
      isSubscription: true,
    };
  });
}

// ============================================================================
// INSIGHTS & ANOMALY DETECTION
// ============================================================================

export async function detectAnomalies(filters: CockpitFilters): Promise<Anomaly[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const anomalies: Anomaly[] = [];

  // Get historical data for anomaly detection
  const startDate = filters.startDate || subMonths(new Date(), 6);
  const endDate = filters.endDate || new Date();

  // 1. Detect spending spikes by category
  const categoryMonthly = await db
    .select({
      category: sql<string>`COALESCE(${transactions.appCategoryName}, 'Outros')`,
      month: sql<string>`TO_CHAR(date_trunc('month', ${transactions.paymentDate}), 'YYYY-MM')`,
      total: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.paymentDate, subMonths(startDate, 6)),
        lte(transactions.paymentDate, endDate),
        eq(transactions.internalTransfer, false),
        sql`${transactions.display} <> 'no'`
      )
    )
    .groupBy(
      sql`COALESCE(${transactions.appCategoryName}, 'Outros')`,
      sql`TO_CHAR(date_trunc('month', ${transactions.paymentDate}), 'YYYY-MM')`
    );

  // Group by category and detect spikes using MAD (Median Absolute Deviation)
  const categoryGroups = new Map<string, number[]>();
  categoryMonthly.forEach((row) => {
    const arr = categoryGroups.get(row.category) || [];
    arr.push(Number(row.total));
    categoryGroups.set(row.category, arr);
  });

  categoryGroups.forEach((values, category) => {
    if (values.length < 3) return;

    const median = calculateMedian(values);
    const mad = calculateMAD(values, median);
    const threshold = median + 3 * mad * 1.4826; // 1.4826 is the consistency constant for normal distribution

    const latestValue = values[values.length - 1];
    if (latestValue > threshold && latestValue > median * 1.5) {
      const spike = ((latestValue - median) / median) * 100;
      anomalies.push({
        id: `spike_${category}`,
        type: "spike",
        severity: spike > 100 ? "high" : spike > 50 ? "medium" : "low",
        title: `Pico em ${category}`,
        description: `Gastos ${spike.toFixed(0)}% acima da mediana histórica`,
        amount: latestValue - median,
        category,
        evidence: [
          `Valor atual: €${latestValue.toFixed(2)}`,
          `Mediana histórica: €${median.toFixed(2)}`,
          `Limiar: €${threshold.toFixed(2)}`,
        ],
        actionUrl: `/analyticsnextlevel?view=breakdown&appCategory=${encodeURIComponent(category)}`,
      });
    }
  });

  // 2. Detect large individual transactions
  const largeTransactions = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      description: sql<string>`COALESCE(${transactions.aliasDesc}, ${transactions.descNorm})`,
      category: transactions.appCategoryName,
      date: transactions.paymentDate,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.paymentDate, startDate),
        lte(transactions.paymentDate, endDate),
        sql`ABS(${transactions.amount}) > 500`,
        eq(transactions.internalTransfer, false)
      )
    )
    .orderBy(desc(sql`ABS(${transactions.amount})`))
    .limit(5);

  largeTransactions.forEach((tx) => {
    anomalies.push({
      id: `large_${tx.id}`,
      type: "unusual_amount",
      severity: Math.abs(Number(tx.amount)) > 1000 ? "high" : "medium",
      title: "Transação de alto valor",
      description: `${tx.description}: €${Math.abs(Number(tx.amount)).toFixed(2)}`,
      amount: Math.abs(Number(tx.amount)),
      merchant: tx.description,
      category: tx.category || undefined,
      date: tx.date ? new Date(tx.date) : undefined,
      evidence: [],
    });
  });

  // 3. Detect uncategorized transactions
  const uncategorizedCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.paymentDate, startDate),
        lte(transactions.paymentDate, endDate),
        or(isNull(transactions.category1), eq(sql`CAST(${transactions.category1} AS text)`, "OPEN"))
      )
    );

  const uncatCount = Number(uncategorizedCount[0]?.count || 0);
  if (uncatCount > 5) {
    anomalies.push({
      id: "uncategorized_batch",
      type: "category_drift",
      severity: uncatCount > 20 ? "high" : uncatCount > 10 ? "medium" : "low",
      title: "Transações não categorizadas",
      description: `${uncatCount} transações aguardando categorização`,
      evidence: ["Categorização incompleta afeta qualidade das análises"],
      actionUrl: "/confirm",
    });
  }

  return anomalies.slice(0, 10);
}

export async function generateInsights(filters: CockpitFilters): Promise<Insight[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const insights: Insight[] = [];

  // Get comprehensive data for insight generation
  const [kpis, breakdown, merchants, recurring] = await Promise.all([
    getExecutiveKPIs(filters),
    getCategoryBreakdown(filters),
    getMerchantInsights(filters, 10),
    getRecurringInsights(filters),
  ]);

  // 1. Savings Rate Insight
  const savingsKPI = kpis.find((k) => k.id === "savings_rate");
  if (savingsKPI) {
    if (savingsKPI.value < 0) {
      insights.push({
        id: "negative_savings",
        type: "risk",
        priority: 95,
        title: "Gastando mais do que ganha",
        description: `Taxa de poupança negativa de ${savingsKPI.value.toFixed(1)}%. Despesas excedem receitas.`,
        actionable: true,
        actionText: "Ver despesas",
        actionUrl: "/analyticsnextlevel?view=breakdown&type=expense",
        evidence: [`Delta: €${Math.abs(savingsKPI.delta).toFixed(2)} vs período anterior`],
        confidence: 100,
      });
    } else if (savingsKPI.value >= 20) {
      insights.push({
        id: "good_savings",
        type: "observation",
        priority: 60,
        title: "Boa taxa de poupança",
        description: `Você está economizando ${savingsKPI.value.toFixed(1)}% da sua renda - acima da meta recomendada de 20%.`,
        actionable: false,
        evidence: [],
        confidence: 100,
      });
    }
  }

  // 2. Top Category Concentration
  const topCategories = breakdown.slice(0, 3);
  const topCatTotal = topCategories.reduce((acc, c) => acc + c.percentage, 0);
  if (topCatTotal > 70) {
    insights.push({
      id: "category_concentration",
      type: "observation",
      priority: 70,
      title: "Concentração de gastos",
      description: `${topCatTotal.toFixed(0)}% dos gastos concentrados em ${topCategories.map((c) => c.category).join(", ")}`,
      evidence: topCategories.map((c) => `${c.category}: ${c.percentage.toFixed(1)}%`),
      actionable: true,
      actionText: "Analisar distribuição",
      actionUrl: "/analyticsnextlevel?view=breakdown",
      confidence: 95,
    });
  }

  // 3. Merchant Concentration Risk
  const topMerchant = merchants[0];
  if (topMerchant && topMerchant.concentrationRisk > 20) {
    insights.push({
      id: "merchant_concentration",
      type: "risk",
      priority: 75,
      title: `Alto gasto em ${topMerchant.name}`,
      description: `${topMerchant.concentrationRisk.toFixed(1)}% do total gasto com um único comerciante`,
      impact: topMerchant.total,
      merchant: topMerchant.name,
      evidence: [
        `Total: €${topMerchant.total.toFixed(2)}`,
        `${topMerchant.count} transações`,
        `Média: €${topMerchant.avgTransaction.toFixed(2)}/transação`,
      ],
      actionable: true,
      actionText: "Ver comerciante",
      actionUrl: `/analyticsnextlevel?view=merchants&merchant=${encodeURIComponent(topMerchant.name)}`,
      confidence: 90,
    });
  }

  // 4. Fixed vs Variable Ratio
  const fixedKPI = kpis.find((k) => k.id === "fixed_expense");
  const variableKPI = kpis.find((k) => k.id === "variable_expense");
  const expenseKPI = kpis.find((k) => k.id === "total_expense");

  if (fixedKPI && expenseKPI && expenseKPI.value > 0) {
    const fixedRatio = (fixedKPI.value / expenseKPI.value) * 100;
    if (fixedRatio > 70) {
      insights.push({
        id: "high_fixed_ratio",
        type: "risk",
        priority: 80,
        title: "Alta proporção de gastos fixos",
        description: `${fixedRatio.toFixed(0)}% das despesas são fixas, limitando flexibilidade financeira`,
        impact: fixedKPI.value,
        evidence: [
          `Fixos: €${fixedKPI.value.toFixed(2)}`,
          `Variáveis: €${(variableKPI?.value || 0).toFixed(2)}`,
        ],
        actionable: true,
        actionText: "Revisar fixos",
        actionUrl: "/analyticsnextlevel?view=breakdown&fixVar=Fixo",
        confidence: 95,
      });
    }
  }

  // 5. Recurring Expense Load
  const recurringKPI = kpis.find((k) => k.id === "recurring_expense");
  const incomeKPI = kpis.find((k) => k.id === "total_income");
  if (recurringKPI && incomeKPI && incomeKPI.value > 0) {
    const recurringRatio = (recurringKPI.value / incomeKPI.value) * 100;
    if (recurringRatio > 40) {
      insights.push({
        id: "high_recurring_load",
        type: "risk",
        priority: 85,
        title: "Carga alta de recorrentes",
        description: `${recurringRatio.toFixed(0)}% da renda comprometida com pagamentos recorrentes`,
        impact: recurringKPI.value,
        evidence: [
          `Total recorrente: €${recurringKPI.value.toFixed(2)}`,
          `Receita: €${incomeKPI.value.toFixed(2)}`,
        ],
        actionable: true,
        actionText: "Ver recorrentes",
        actionUrl: "/analyticsnextlevel?view=recurring",
        confidence: 95,
      });
    }
  }

  // 6. Quick Win: Low-hanging fruit for savings
  if (recurring.length > 0) {
    const subscriptions = recurring.filter((r) => r.monthlyAmount < 50 && r.monthlyAmount > 5);
    if (subscriptions.length >= 3) {
      const potentialSavings = subscriptions.slice(0, 5).reduce((acc, s) => acc + s.monthlyAmount, 0);
      insights.push({
        id: "subscription_review",
        type: "recommendation",
        priority: 65,
        title: "Revise suas assinaturas",
        description: `${subscriptions.length} assinaturas pequenas que podem ser otimizadas. Economia potencial: €${potentialSavings.toFixed(2)}/mês`,
        impact: potentialSavings * 12,
        evidence: subscriptions.slice(0, 3).map((s) => `${s.name}: €${s.monthlyAmount.toFixed(2)}/mês`),
        actionable: true,
        actionText: "Ver assinaturas",
        actionUrl: "/analyticsnextlevel?view=recurring",
        confidence: 80,
      });
    }
  }

  // Sort by priority
  return insights.sort((a, b) => b.priority - a.priority);
}

// ============================================================================
// DATA QUALITY
// ============================================================================

export async function getDataQuality(filters: CockpitFilters) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = buildBaseConditions(userId, filters);

  const stats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      categorized: sql<number>`COUNT(CASE WHEN ${transactions.category1} IS NOT NULL AND ${transactions.category1} <> 'OPEN' THEN 1 END)`,
      normalized: sql<number>`COUNT(CASE WHEN ${transactions.aliasDesc} IS NOT NULL THEN 1 END)`,
      minDate: sql<Date>`MIN(${transactions.paymentDate})`,
      maxDate: sql<Date>`MAX(${transactions.paymentDate})`,
      lastImport: sql<Date>`MAX(${transactions.importedAt})`,
    })
    .from(transactions)
    .where(and(...conditions));

  const s = stats[0];
  const total = Number(s.total) || 1;

  return {
    totalTransactions: total,
    categorizedPercent: (Number(s.categorized) / total) * 100,
    merchantNormalized: (Number(s.normalized) / total) * 100,
    dateRange: {
      from: s.minDate ? new Date(s.minDate) : new Date(),
      to: s.maxDate ? new Date(s.maxDate) : new Date(),
    },
    lastUpdated: s.lastImport ? new Date(s.lastImport) : new Date(),
  };
}

// ============================================================================
// FULL COCKPIT DATA LOADER
// ============================================================================

export async function getCockpitData(filters: CockpitFilters): Promise<CockpitData> {
  const [kpis, breakdown, trends, merchants, recurring, anomalies, insights, dataQuality] = await Promise.all([
    getExecutiveKPIs(filters),
    getCategoryBreakdown(filters),
    getTrendData(filters),
    getMerchantInsights(filters),
    getRecurringInsights(filters),
    detectAnomalies(filters),
    generateInsights(filters),
    getDataQuality(filters),
  ]);

  return {
    kpis,
    breakdown,
    trends,
    merchants,
    recurring,
    anomalies,
    insights,
    dataQuality,
  };
}

// ============================================================================
// COMPARISON DATA
// ============================================================================

export interface PeriodComparison {
  currentPeriod: { label: string; start: Date; end: Date };
  previousPeriod: { label: string; start: Date; end: Date };
  metrics: {
    id: string;
    label: string;
    current: number;
    previous: number;
    delta: number;
    deltaPercent: number;
  }[];
  categoryDiffs: {
    category: string;
    current: number;
    previous: number;
    delta: number;
    deltaPercent: number;
    isNew: boolean;
    isGone: boolean;
  }[];
}

export async function getPeriodComparison(filters: CockpitFilters): Promise<PeriodComparison> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const startDate = filters.startDate || startOfMonth(new Date());
  const endDate = filters.endDate || endOfMonth(new Date());
  const daysDiff = differenceInDays(endDate, startDate) + 1;

  const prevStartDate = subDays(startDate, daysDiff);
  const prevEndDate = subDays(endDate, daysDiff);

  const [currentKPIs, prevKPIs, currentBreakdown, prevBreakdown] = await Promise.all([
    getExecutiveKPIs(filters),
    getExecutiveKPIs({ ...filters, startDate: prevStartDate, endDate: prevEndDate }),
    getCategoryBreakdown(filters),
    getCategoryBreakdown({ ...filters, startDate: prevStartDate, endDate: prevEndDate }),
  ]);

  // Build category diff
  const categoryMap = new Map<string, { current: number; previous: number }>();
  currentBreakdown.forEach((c) => {
    categoryMap.set(c.category, { current: c.total, previous: 0 });
  });
  prevBreakdown.forEach((c) => {
    const existing = categoryMap.get(c.category);
    if (existing) {
      existing.previous = c.total;
    } else {
      categoryMap.set(c.category, { current: 0, previous: c.total });
    }
  });

  const categoryDiffs = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      current: data.current,
      previous: data.previous,
      delta: data.current - data.previous,
      deltaPercent: data.previous !== 0 ? ((data.current - data.previous) / data.previous) * 100 : data.current > 0 ? 100 : 0,
      isNew: data.previous === 0 && data.current > 0,
      isGone: data.current === 0 && data.previous > 0,
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    currentPeriod: {
      label: format(startDate, "MMM yyyy"),
      start: startDate,
      end: endDate,
    },
    previousPeriod: {
      label: format(prevStartDate, "MMM yyyy"),
      start: prevStartDate,
      end: prevEndDate,
    },
    metrics: currentKPIs.slice(0, 6).map((kpi) => {
      const prevKPI = prevKPIs.find((p) => p.id === kpi.id);
      return {
        id: kpi.id,
        label: kpi.label,
        current: kpi.value,
        previous: prevKPI?.value || 0,
        delta: kpi.delta,
        deltaPercent: kpi.deltaPercent,
      };
    }),
    categoryDiffs,
  };
}
