"use server";

import { db } from "@/lib/db";
import { transactions, accounts } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { auth } from "@/auth";

export interface AnalyticsFilters {
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
}

export interface CategoryAggregate {
  category: string;
  total: number;
  count: number;
  percentage: number;
  color?: string;
}

export interface DrillDownData {
  currentLevel: "appCategory" | "category1" | "category2" | "category3" | "transactions";
  breadcrumb: { label: string; value: string | null }[];
  aggregates: CategoryAggregate[];
  transactions?: any[];
  totalAmount: number;
}

export interface MonthByMonthRow {
  month: string; // YYYY-MM
  total: number;
  count: number;
}

export interface TopAggregateRow {
  name: string;
  total: number;
  count: number;
}

const buildBaseConditions = (userId: string, filters: AnalyticsFilters) => {
  const conditions = [eq(transactions.userId, userId)];

  if (filters.startDate) {
    conditions.push(gte(transactions.paymentDate, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(transactions.paymentDate, filters.endDate));
  }
  if (filters.accountId) {
    // conditions.push(eq(transactions.accountId, filters.accountId)); // Removed from schema
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

  // Drilldown filters
  if (filters.appCategory) {
    if (filters.appCategory === "OPEN") conditions.push(sql`${transactions.appCategoryName} IS NULL`);
    else conditions.push(eq(transactions.appCategoryName, filters.appCategory));
  }
  if (filters.category1) {
    if (filters.category1 === "OPEN") conditions.push(sql`${transactions.category1} IS NULL`);
    else conditions.push(sql`CAST(${transactions.category1} AS text) = ${filters.category1}`);
  }
  if (filters.category2) {
    if (filters.category2 === "OPEN") conditions.push(sql`${transactions.category2} IS NULL`);
    else conditions.push(eq(transactions.category2, filters.category2));
  }
  if (filters.category3) {
    if (filters.category3 === "OPEN") conditions.push(sql`${transactions.category3} IS NULL`);
    else conditions.push(eq(transactions.category3, filters.category3));
  }

  // Exclude internal transfers from analytics as per contract
  conditions.push(eq(transactions.internalTransfer, false));
  conditions.push(sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`);
  conditions.push(sql`${transactions.display} <> 'no'`);

  return conditions;
};

export async function getAnalyticsData(
  filters: AnalyticsFilters = {}
): Promise<DrillDownData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const conditions = buildBaseConditions(userId, filters);


  // Determine current drill-down level and apply cumulative filters
  let currentLevel: DrillDownData["currentLevel"] = "appCategory";
  const breadcrumb: DrillDownData["breadcrumb"] = [];

  // Apply filters cumulatively based on UI hierarchy:
  // appCategory -> category1 -> category2 -> category3 -> transactions
  if (filters.appCategory) {
    // already applied in base conditions
    breadcrumb.push({ label: "App", value: filters.appCategory });
    currentLevel = "category1";
  }

  if (filters.category1) {
    // already applied in base conditions
    breadcrumb.push({ label: "Categoria 1", value: filters.category1 });
    currentLevel = "category2";
  }

  if (filters.category2) {
    // already applied in base conditions
    breadcrumb.push({ label: "Categoria 2", value: filters.category2 });
    currentLevel = "category3";
  }

  if (filters.category3) {
    // already applied in base conditions
    breadcrumb.push({ label: "Categoria 3", value: filters.category3 });
    currentLevel = "transactions";
  }


  // Get total for percentage calculation
  const totalResult = await db
    .select({ total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)` })
    .from(transactions)
    .where(and(...conditions));

  const totalAmount = Number(totalResult[0]?.total || 0);

  // Aggregate based on current level
  let aggregates: CategoryAggregate[] = [];

  if (currentLevel === "appCategory") {
    // Group by App Category
    const results = await db
      .select({
        category: sql<string>`COALESCE(${transactions.appCategoryName}, 'OPEN')`,
        total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(sql`COALESCE(${transactions.appCategoryName}, 'OPEN')`)
      .orderBy(desc(sql`COALESCE(ABS(SUM(${transactions.amount})), 0)`));

    aggregates = results.map((r) => ({
      category: r.category || "OPEN",
      total: Number(r.total),
      count: Number(r.count),
      percentage: totalAmount > 0 ? (Number(r.total) / totalAmount) * 100 : 0,
    }));
  } else if (currentLevel === "category1") {
    // Group by Category 1
    const results = await db
      .select({
        category: sql<string>`COALESCE(CAST(${transactions.category1} AS text), 'OPEN')`,
        total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(sql`COALESCE(CAST(${transactions.category1} AS text), 'OPEN')`)
      .orderBy(desc(sql`COALESCE(ABS(SUM(${transactions.amount})), 0)`));

    aggregates = results.map((r) => ({
      category: r.category || "OPEN",
      total: Number(r.total),
      count: Number(r.count),
      percentage: totalAmount > 0 ? (Number(r.total) / totalAmount) * 100 : 0,
    }));
  } else if (currentLevel === "category2") {
    // Group by Category 2
    const results = await db
      .select({
        category: sql<string>`COALESCE(${transactions.category2}, 'OPEN')`,
        total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(sql`COALESCE(${transactions.category2}, 'OPEN')`)
      .orderBy(desc(sql`COALESCE(ABS(SUM(${transactions.amount})), 0)`));

    aggregates = results.map((r) => ({
      category: r.category || "OPEN",
      total: Number(r.total),
      count: Number(r.count),
      percentage: totalAmount > 0 ? (Number(r.total) / totalAmount) * 100 : 0,
    }));
  } else if (currentLevel === "category3") {
    // Group by Category 3
    const results = await db
      .select({
        category: sql<string>`COALESCE(${transactions.category3}, 'OPEN')`,
        total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(sql`COALESCE(${transactions.category3}, 'OPEN')`)
      .orderBy(desc(sql`COALESCE(ABS(SUM(${transactions.amount})), 0)`))
      .limit(50);

    aggregates = results.map((r) => ({
      category: r.category || "OPEN",
      total: Number(r.total),
      count: Number(r.count),
      percentage: totalAmount > 0 ? (Number(r.total) / totalAmount) * 100 : 0,
    }));
  }

  // If at transaction level, fetch actual transactions
  let transactionsList;
  if (currentLevel === "transactions") {
    transactionsList = await db
      .select({
        id: transactions.id,
        paymentDate: transactions.paymentDate,
        descRaw: transactions.descRaw,
        descNorm: transactions.descNorm,
        keyDesc: transactions.keyDesc,
        simpleDesc: transactions.simpleDesc,
        aliasDesc: transactions.aliasDesc,
        amount: transactions.amount,
        currency: transactions.currency,
        type: transactions.type,
        fixVar: transactions.fixVar,
        appCategoryName: transactions.appCategoryName,
        category1: transactions.category1,
        category2: transactions.category2,
        category3: transactions.category3,
        confidence: transactions.confidence,
        needsReview: transactions.needsReview,
        manualOverride: transactions.manualOverride,
        classifiedBy: transactions.classifiedBy,
        recurringFlag: transactions.recurringFlag,
        source: transactions.source,
        display: transactions.display,
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.paymentDate))
      .limit(200);
  }

  return {
    currentLevel,
    breadcrumb,
    aggregates,
    transactions: transactionsList,
    totalAmount,
  };
}

export async function getAnalyticsMonthByMonth(filters: AnalyticsFilters = {}): Promise<MonthByMonthRow[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = buildBaseConditions(userId, filters);

  const monthExpr = sql<string>`TO_CHAR(date_trunc('month', ${transactions.paymentDate}), 'YYYY-MM')`;
  const rows = await db
    .select({
      month: monthExpr,
      total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(monthExpr)
    .orderBy(monthExpr);

  return rows.map((r) => ({
    month: String(r.month),
    total: Number(r.total),
    count: Number(r.count),
  }));
}

export async function getAnalyticsTopMerchants(
  filters: AnalyticsFilters = {},
  limit = 12
): Promise<TopAggregateRow[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = buildBaseConditions(userId, filters);
  const label = sql<string>`COALESCE(${transactions.aliasDesc}, ${transactions.descNorm})`;

  const rows = await db
    .select({
      name: label,
      total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(label)
    .orderBy(desc(sql`COALESCE(ABS(SUM(${transactions.amount})), 0)`))
    .limit(Math.max(3, Math.min(50, Math.floor(limit))));

  return rows.map((r) => ({
    name: String(r.name || "Sem descrição"),
    total: Number(r.total),
    count: Number(r.count),
  }));
}

export async function getAnalyticsRecurringSummary(
  filters: AnalyticsFilters = {},
  limit = 12
): Promise<TopAggregateRow[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = buildBaseConditions(userId, { ...filters, recurring: true });
  const label = sql<string>`COALESCE(${transactions.aliasDesc}, ${transactions.descNorm})`;

  const rows = await db
    .select({
      name: label,
      total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(label)
    .orderBy(desc(sql`COALESCE(ABS(SUM(${transactions.amount})), 0)`))
    .limit(Math.max(3, Math.min(50, Math.floor(limit))));

  return rows.map((r) => ({
    name: String(r.name || "Sem descrição"),
    total: Number(r.total),
    count: Number(r.count),
  }));
}

export async function getAccounts() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, session.user.id))
    .orderBy(accounts.name);
}
