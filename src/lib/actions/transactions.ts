"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, accounts, ingestionBatches, aliasAssets, rules, budgets } from "@/lib/db/schema";
import { eq, desc, sql, and, gte, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  TransactionUpdateSchema, 
  TransactionDetailsUpdateSchema,
  TransactionConfirmSchema, 
  TransactionDeleteSchema,
  BulkConfirmSchema,
  Result,
  success,
  error,
  validate 
} from "@/lib/validators";
import { z } from "zod";
import { Errors, logError, sanitizeError } from "@/lib/errors";
import { ensureOpenCategory } from "@/lib/actions/setup-open";
import { buildLeafHierarchyMaps } from "@/lib/taxonomy/hierarchy";
import { applyCategorization } from "@/lib/actions/categorization";

export async function getDashboardData(date?: Date) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // Date Logic
  const now = new Date();
  const targetDate = date || now;
  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

  // 1. Total Balance (Global)
  // Balance should reflect actual bank state, so we generally DO NOT filter by display='no' here, 
  // unless 'display=no' implies it's not a real transaction. 
  // Given 'Internal Transfer', it's net 0 usually? Or moving money. 
  // Let's keep balance authoritative.
  const [balanceRes] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  
  const totalBalance = Number(balanceRes?.total || 0);

  // 2. Pending Transactions Count
  const [pendingRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId), 
      eq(transactions.needsReview, true),
      ne(transactions.display, "no")
    ));
  
  const pendingCount = Number(pendingRes?.count || 0);

  // 3. Last Sync
  const [lastBatch] = await db
    .select({ importedAt: ingestionBatches.importedAt })
    .from(ingestionBatches)
    .where(eq(ingestionBatches.userId, userId))
    .orderBy(desc(ingestionBatches.importedAt))
    .limit(1);

  // 4. Daily Spend (Avg last 30 days from target date)
  const thirtyDaysAgo = new Date(targetDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [last30DaysSpend] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, "Despesa"),
      gte(transactions.paymentDate, thirtyDaysAgo),
      sql`${transactions.paymentDate} <= ${targetDate}`,
      ne(transactions.display, "no")
    ));
  
  const dailySpend = Math.abs(Number(last30DaysSpend?.total || 0)) / 30;

  // 5. Month-to-Date / Month Total Spend
  const [mtdRes] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, "Despesa"),
      gte(transactions.paymentDate, startOfMonth),
      sql`${transactions.paymentDate} <= ${endOfMonth}`, // Use endOfMonth to support past months fully
      eq(transactions.internalTransfer, false),
      sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
      ne(transactions.display, "no")
    ));

  const spentMonthToDate = Math.abs(Number(mtdRes?.total || 0));

  // 6. Projected Spend calculation
  // If viewing past month: Projected = Actual (since month is over).
  // If viewing current month: Actual + (Daily * Remaining).
  let projectedSpend = spentMonthToDate;
  if (targetDate.getMonth() === now.getMonth() && targetDate.getFullYear() === now.getFullYear()) {
      const remainingDays = endOfMonth.getDate() - now.getDate();
      projectedSpend = spentMonthToDate + (dailySpend * Math.max(0, remainingDays));
  } else if (targetDate < now) {
      // Past month, projection IS the total.
      projectedSpend = spentMonthToDate;
  }

  // 7. Budget / Remaining
  const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
  const [budgetRes] = await db
    .select({ total: sql<number>`COALESCE(SUM(${budgets.amount}), 0)` })
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.month, monthKey)));

  const monthlyGoal = Number(budgetRes?.total || 0);
  const remainingBudget = monthlyGoal - spentMonthToDate;

  // 8. Category Breakdown
  const categoryLabel = sql<string>`COALESCE(${transactions.appCategoryName}, CAST(${transactions.category1} AS text), 'OPEN')`;

  const categoryData = await db
    .select({ 
      name: categoryLabel, 
      value: sql<number>`ABS(SUM(${transactions.amount}))`
    })
    .from(transactions)
    .where(and(
       eq(transactions.userId, userId),
       eq(transactions.type, "Despesa"),
       gte(transactions.paymentDate, startOfMonth),
       sql`${transactions.paymentDate} <= ${endOfMonth}`,
       eq(transactions.internalTransfer, false),
       sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
       ne(transactions.display, "no")
    ))
    .groupBy(categoryLabel)
    .orderBy(desc(sql`ABS(SUM(${transactions.amount}))`))
    .limit(20);

  return {
    totalBalance,
    pendingCount,
    lastSync: lastBatch?.importedAt || null,
    dailyForecast: dailySpend,
    metrics: {
        spentMonthToDate,
        projectedSpend,
        remainingBudget,
        monthlyGoal
    },
    categoryData: categoryData.map(c => ({ name: c.name, value: Number(c.value) }))
  };
}

export async function getSpendAveragesLastMonths(date?: Date, months: number = 3) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const safeMonths = Math.max(1, Math.min(12, Math.floor(months)));
  const target = date || new Date();
  const start = new Date(target.getFullYear(), target.getMonth() - (safeMonths - 1), 1);
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59, 999);

  const baseWhere = and(
    eq(transactions.userId, userId),
    eq(transactions.type, "Despesa"),
    gte(transactions.paymentDate, start),
    sql`${transactions.paymentDate} <= ${end}`,
    eq(transactions.internalTransfer, false),
    sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
    ne(transactions.display, "no")
  );

  const queryFor = async (label: any) => {
    const rows = await db
      .select({
        name: label,
        total: sql<number>`ABS(SUM(${transactions.amount}))`,
      })
      .from(transactions)
      .where(baseWhere)
      .groupBy(label)
      .orderBy(desc(sql`ABS(SUM(${transactions.amount}))`))
      .limit(50);

    return rows.map((r) => ({
      name: String(r.name),
      average: Number(r.total) / safeMonths,
      total: Number(r.total),
    }));
  };

  const appCategoryLabel = sql<string>`COALESCE(${transactions.appCategoryName}, 'OPEN')`;
  const category1Label = sql<string>`COALESCE(CAST(${transactions.category1} AS text), 'OPEN')`;
  const category2Label = sql<string>`COALESCE(${transactions.category2}, 'OPEN')`;
  const category3Label = sql<string>`COALESCE(${transactions.category3}, 'OPEN')`;

  const [appCategory, category1, category2, category3] = await Promise.all([
    queryFor(appCategoryLabel),
    queryFor(category1Label),
    queryFor(category2Label),
    queryFor(category3Label),
  ]);

  return {
    months: safeMonths,
    range: { start, end },
    appCategory,
    category1,
    category2,
    category3,
  };
}


export async function getPendingTransactions() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  return await db.query.transactions.findMany({
    where: (tx, { eq, and, ne }) => and(
        eq(tx.userId, userId), 
        eq(tx.needsReview, true),
        ne(tx.display, "no")
    ),
    orderBy: [desc(transactions.paymentDate)],
    columns: {
      id: true,
      paymentDate: true,
      descRaw: true,
      descNorm: true,
      keyDesc: true,
      simpleDesc: true,
      aliasDesc: true,
      amount: true,
      currency: true,
      type: true,
      fixVar: true,
      category1: true,
      category2: true,
      category3: true,
      appCategoryName: true,
      needsReview: true,
      manualOverride: true,
      classifiedBy: true,
      confidence: true,
      ruleIdApplied: true,
      matchedKeyword: true,
      conflictFlag: true,
      classificationCandidates: true,
      recurringFlag: true,
      source: true,
      display: true,
    },
    with: {
      rule: true,
      evidenceLinks: {
        with: {
          ingestionItem: true
        }
      }
    }
  });
}

export async function getTransactions(
  input: number | { limit?: number; sources?: string[] } = 50
) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;
  const limit = typeof input === "number" ? input : (input.limit ?? 50);
  const sources = typeof input === "number" ? undefined : input.sources;
  const sourceClause = sources?.length
    ? sql`AND t.source IN (${sql.join(sources.map((s) => sql`${s}`), sql`, `)})`
    : sql``;

  // Use raw SQL to get transactions with taxonomy data
  const result = await db.execute(sql`
    SELECT 
      t.*,
      COALESCE(t1.nivel_1_pt, 'OPEN') as level_1,
      COALESCE(t2.nivel_2_pt, 'OPEN') as level_2,
      COALESCE(tl.nivel_3_pt, 'OPEN') as level_3,
      COALESCE(t.app_category_name, 'OPEN') as app_category,
      t.matched_keyword,
      r.key_words as rule_keywords,
      r.category_1 as rule_category_1,
      r.category_2 as rule_category_2,
      r.category_3 as rule_category_3
    FROM transactions t
    LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
    LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    LEFT JOIN rules r ON t.rule_id_applied = r.id
    WHERE t.user_id = ${userId}
    AND t.display != 'no'
    ${sourceClause}
    ORDER BY t.payment_date DESC
    LIMIT ${limit}
  `);

  // Map snake_case to camelCase for UI compatibility
  return result.rows.map((row: any) => ({
    ...row,
    paymentDate: row.payment_date,
    descRaw: row.desc_raw,
    descNorm: row.desc_norm,
    simpleDesc: row.simple_desc,
    aliasDesc: row.alias_desc,
    leafId: row.leaf_id,
    classifiedBy: row.classified_by,
    recurringFlag: row.recurring_flag,
    recurringGroupId: row.recurring_group_id,
    recurringConfidence: row.recurring_confidence,
    recurringDayOfMonth: row.recurring_day_of_month,
    recurringDayWindow: row.recurring_day_window,
    fixVar: row.fix_var,
    category1: row.category_1,
    category2: row.category_2,
    category3: row.category_3,
    manualOverride: row.manual_override,
    internalTransfer: row.internal_transfer,
    excludeFromBudget: row.exclude_from_budget,
    needsReview: row.needs_review,
    ruleIdApplied: row.rule_id_applied,
    uploadId: row.upload_id,
    suggestedKeyword: row.suggested_keyword,
    matchedKeyword: row.matched_keyword,
    appCategoryId: row.app_category_id,
    appCategoryName: row.app_category_name,
    conflictFlag: row.conflict_flag,
    classificationCandidates: row.classification_candidates,
    userId: row.user_id,
    // Taxonomy fields
    level1: row.level_1,
    level2: row.level_2,
    level3: row.level_3,
    appCategory: row.app_category,
    // Rule fields
    ruleKeywords: row.rule_keywords,
    ruleCategory1: row.rule_category_1,
    ruleCategory2: row.rule_category_2,
    ruleCategory3: row.rule_category_3,
  }));
}

export async function updateTransactionCategory(
  transactionId: string, 
  data: { leafId: string }
): Promise<Result<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw Errors.authRequired();

    // Validate input
    const validated = validate(TransactionUpdateSchema, { transactionId, ...data });

    const ensured = await ensureOpenCategory();
    if (!ensured.openLeafId) throw new Error("OPEN taxonomy not initialized");

    const { byLeafId } = await buildLeafHierarchyMaps(session.user.id);
    const hierarchy = byLeafId.get(validated.leafId);
    if (!hierarchy) throw new Error("Invalid leafId (not found in taxonomy)");

    const isInterno = hierarchy.category1 === "Interno";
    const display = isInterno ? "no" : hierarchy.category2 === "Karlsruhe" ? "Casa Karlsruhe" : "yes";

    const update: any = {
      leafId: validated.leafId,
      category1: hierarchy.category1 as any,
      category2: hierarchy.category2,
      category3: hierarchy.category3,
      appCategoryId: hierarchy.appCategoryId,
      appCategoryName: hierarchy.appCategoryName ?? "OPEN",
      matchedKeyword: null,
      ruleIdApplied: null,
      confidence: null,
      needsReview: false,
      manualOverride: true,
      conflictFlag: false,
      classificationCandidates: null,
      classifiedBy: "MANUAL",
      internalTransfer: isInterno,
      excludeFromBudget: isInterno,
      display,
    };
    if (hierarchy.typeDefault) update.type = hierarchy.typeDefault;
    if (hierarchy.fixVarDefault) update.fixVar = hierarchy.fixVarDefault;

    await db.update(transactions).set(update).where(eq(transactions.id, validated.transactionId));

    revalidatePath("/transactions");
    revalidatePath("/");
    return success(undefined);
  } catch (err) {
    const errorId = logError(err, { action: 'updateTransactionCategory', transactionId });
    const sanitized = sanitizeError(err);
    return error(sanitized.message, errorId, sanitized.code);
  }
}

export async function updateTransactionDetails(
  transactionId: string,
  data: z.infer<typeof TransactionDetailsUpdateSchema>
): Promise<Result<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw Errors.authRequired();

    const validated = validate(TransactionDetailsUpdateSchema, { ...data, transactionId });

    const update: any = {
      manualOverride: true,
      classifiedBy: "MANUAL",
      needsReview: false,
      conflictFlag: false,
    };

    if (validated.leafId) update.leafId = validated.leafId;
    if (validated.appCategory) update.appCategoryName = validated.appCategory;
    if (validated.category1) update.category1 = validated.category1;
    if (validated.category2) update.category2 = validated.category2;
    if (validated.category3) update.category3 = validated.category3;
    if (validated.type) update.type = validated.type;
    if (validated.fixVar) update.fixVar = validated.fixVar;
    if (validated.recurring !== undefined) update.recurringFlag = validated.recurring;

    await db.update(transactions)
      .set(update)
      .where(and(
        eq(transactions.id, validated.transactionId),
        eq(transactions.userId, session.user.id)
      ));

    revalidatePath("/transactions");
    revalidatePath("/");
    return success(undefined);
  } catch (err) {
    const errorId = logError(err, { action: 'updateTransactionDetails', transactionId });
    const sanitized = sanitizeError(err);
    return error(sanitized.message, errorId, sanitized.code);
  }
}

export async function confirmTransaction(transactionId: string): Promise<Result<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw Errors.authRequired();

    const validated = validate(TransactionConfirmSchema, { transactionId });

    const existing = await db.query.transactions.findFirst({
      where: and(eq(transactions.id, validated.transactionId), eq(transactions.userId, session.user.id)),
      columns: { conflictFlag: true },
    });
    if (!existing) throw new Error("Transaction not found");
    if (existing.conflictFlag) throw new Error("Resolva o conflito de regras antes de confirmar.");

    await db.update(transactions)
      .set({ needsReview: false, conflictFlag: false })
      .where(eq(transactions.id, validated.transactionId));

    revalidatePath("/confirm");
    revalidatePath("/transactions");
    return success(undefined);
  } catch (err) {
    const errorId = logError(err, { action: 'confirmTransaction', transactionId });
    const sanitized = sanitizeError(err);
    return error(sanitized.message, errorId, sanitized.code);
  }
}

export async function confirmHighConfidenceTransactions(threshold = 80): Promise<Result<{ count: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw Errors.authRequired();

    const validated = validate(BulkConfirmSchema, { threshold });

    const result = await db.update(transactions)
      .set({ needsReview: false })
      .where(and(
        eq(transactions.userId, session.user.id),
        eq(transactions.needsReview, true),
        eq(transactions.conflictFlag, false),
        sql`${transactions.confidence} >= ${validated.threshold}`
      ));

    revalidatePath("/confirm");
    revalidatePath("/transactions");
    revalidatePath("/");
    
    return success({ count: result.rowCount || 0 });
  } catch (err) {
    const errorId = logError(err, { action: 'confirmHighConfidenceTransactions', threshold });
    const sanitized = sanitizeError(err);
    return error(sanitized.message, errorId, sanitized.code);
  }
}

export async function deleteTransaction(transactionId: string): Promise<Result<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw Errors.authRequired();

    const validated = validate(TransactionDeleteSchema, { transactionId });

    await db.delete(transactions)
      .where(eq(transactions.id, validated.transactionId));

    revalidatePath("/transactions");
    revalidatePath("/");
    return success(undefined);
  } catch (err) {
    const errorId = logError(err, { action: 'deleteTransaction', transactionId });
    const sanitized = sanitizeError(err);
    return error(sanitized.message, errorId, sanitized.code);
  }
}

export async function getAliases() {
  const session = await auth();
  if (!session?.user?.id) return [];
  
  return await db.query.aliasAssets.findMany({
    where: eq(aliasAssets.userId, session.user.id),
  });
}

/**
 * PERFORMANCE: Fetch only aliases used in the provided transactions
 * Reduces payload by ~80% (500 aliases → ~20 visible)
 */
export async function getAliasesForTransactions(transactions: Array<{ aliasDesc?: string | null }>) {
  const session = await auth();
  if (!session?.user?.id) return {};

  const aliasDescs = transactions
    .map(tx => tx.aliasDesc)
    .filter((desc): desc is string => Boolean(desc));

  if (aliasDescs.length === 0) return {};

  const aliases = await db.query.aliasAssets.findMany({
    where: and(
      eq(aliasAssets.userId, session.user.id),
      sql`${aliasAssets.aliasDesc} IN (${sql.join(aliasDescs.map(d => sql`${d}`), sql`, `)})`
    ),
    columns: {
      aliasDesc: true,
      logoUrl: true,
    }
  });

  return aliases.reduce((acc, alias) => {
    if (alias.logoUrl && alias.aliasDesc) {
      acc[alias.aliasDesc] = alias.logoUrl;
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * PERFORMANCE OPTIMIZATION: Consolidated spend averages for multiple periods
 * Reduces from 12 queries (3 periods × 4 category types) to 4 queries
 * by fetching 12-month data once and computing averages per period on server
 */
export async function getSpendAveragesAllPeriods(
  date?: Date,
  periods: number[] = [3, 6, 12]
) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // Use the longest period to fetch all data once
  const maxMonths = Math.max(...periods, 12);
  const target = date || new Date();
  const start = new Date(target.getFullYear(), target.getMonth() - (maxMonths - 1), 1);
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59, 999);

  const baseWhere = and(
    eq(transactions.userId, userId),
    eq(transactions.type, "Despesa"),
    gte(transactions.paymentDate, start),
    sql`${transactions.paymentDate} <= ${end}`,
    eq(transactions.internalTransfer, false),
    sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
    ne(transactions.display, "no")
  );

  // Fetch month-by-month totals per category (single query per category type)
  const monthExpr = sql<string>`TO_CHAR(date_trunc('month', ${transactions.paymentDate}), 'YYYY-MM')`;

  const queryMonthly = async (label: any) => {
    return await db
      .select({
        name: label,
        month: monthExpr,
        total: sql<number>`ABS(SUM(${transactions.amount}))`,
      })
      .from(transactions)
      .where(baseWhere)
      .groupBy(label, monthExpr)
      .orderBy(label, monthExpr);
  };

  const appCategoryLabel = sql<string>`COALESCE(${transactions.appCategoryName}, 'OPEN')`;
  const category1Label = sql<string>`COALESCE(CAST(${transactions.category1} AS text), 'OPEN')`;
  const category2Label = sql<string>`COALESCE(${transactions.category2}, 'OPEN')`;
  const category3Label = sql<string>`COALESCE(${transactions.category3}, 'OPEN')`;

  const [appCatMonthly, cat1Monthly, cat2Monthly, cat3Monthly] = await Promise.all([
    queryMonthly(appCategoryLabel),
    queryMonthly(category1Label),
    queryMonthly(category2Label),
    queryMonthly(category3Label),
  ]);

  // Aggregate per period
  const aggregateForPeriod = (
    monthlyData: { name: string; month: string; total: number }[],
    months: number
  ) => {
    const cutoffDate = new Date(target.getFullYear(), target.getMonth() - (months - 1), 1);
    const cutoffMonth = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, "0")}`;

    const filtered = monthlyData.filter(r => r.month >= cutoffMonth);
    const byName = new Map<string, number>();
    for (const r of filtered) {
      byName.set(r.name, (byName.get(r.name) || 0) + Number(r.total));
    }

    return Array.from(byName.entries())
      .map(([name, total]) => ({
        name,
        average: total / months,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 50);
  };

  const result: Record<number, {
    months: number;
    range: { start: Date; end: Date };
    appCategory: { name: string; average: number; total: number }[];
    category1: { name: string; average: number; total: number }[];
    category2: { name: string; average: number; total: number }[];
    category3: { name: string; average: number; total: number }[];
  }> = {};

  for (const months of periods) {
    const periodStart = new Date(target.getFullYear(), target.getMonth() - (months - 1), 1);
    result[months] = {
      months,
      range: { start: periodStart, end },
      appCategory: aggregateForPeriod(appCatMonthly.map(r => ({ ...r, total: Number(r.total) })), months),
      category1: aggregateForPeriod(cat1Monthly.map(r => ({ ...r, total: Number(r.total) })), months),
      category2: aggregateForPeriod(cat2Monthly.map(r => ({ ...r, total: Number(r.total) })), months),
      category3: aggregateForPeriod(cat3Monthly.map(r => ({ ...r, total: Number(r.total) })), months),
    };
  }

  return result;
}

/**
 * PERFORMANCE OPTIMIZATION: Lightweight transaction list for UI
 * Returns only essential fields for list view, reducing payload by ~60%
 * Full details should be fetched on-demand when drawer opens
 */
/**
 * Get all available filter options (categories and accounts) - M1/M10 fix
 * Fetches from ALL user transactions, not just currently loaded ones
 */
export async function getFilterOptions() {
  const session = await auth();
  if (!session?.user?.id) return { 
    categories: [], 
    accounts: [],
    appCategories: [],
    categories2: [],
    categories3: []
  };

  const userId = session.user.id;

  const result = await db.execute(sql`
    SELECT DISTINCT
      app_category_name as app_category,
      category_1 as category1,
      category_2 as category2,
      category_3 as category3,
      source as account
    FROM transactions
    WHERE user_id = ${userId}
    AND display != 'no'
  `);

  const appCategories = [...new Set(result.rows.map((r: any) => r.app_category).filter(Boolean))].sort() as string[];
  const categories1 = [...new Set(result.rows.map((r: any) => r.category1).filter(Boolean))].sort() as string[];
  const categories2 = [...new Set(result.rows.map((r: any) => r.category2).filter(Boolean))].sort() as string[];
  const categories3 = [...new Set(result.rows.map((r: any) => r.category3).filter(Boolean))].sort() as string[];
  const accounts = [...new Set(result.rows.map((r: any) => r.account).filter(Boolean))].sort() as string[];

  return { 
    appCategories,
    categories1,
    categories2,
    categories3,
    accounts 
  };
}

export async function getTransactionsForList(
  input: {
    limit?: number;
    sources?: string[];
    cursor?: string;
    search?: string;
    appCategories?: string[]; // Multiple app categories
    categories1?: string[];
    categories2?: string[];
    categories3?: string[];
    minAmount?: number;
    maxAmount?: number;
    dateFrom?: Date;
    dateTo?: Date;
    fixVar?: "Fixo" | "Variável";
    recurring?: boolean;
  } = {}
) {
  const session = await auth();
  if (!session?.user?.id) return { items: [], nextCursor: null, hasMore: false };

  const userId = session.user.id;
  const limit = input.limit ?? 50;
  const { 
    sources, 
    search, 
    appCategories,
    categories1, 
    categories2, 
    categories3, 
    minAmount, 
    maxAmount, 
    dateFrom, 
    dateTo,
    fixVar,
    recurring
  } = input;

  // Build dynamic WHERE clauses
  const sourceClause = sources?.length
    ? sql`AND t.source IN (${sql.join(sources.map((s) => sql`${s}`), sql`, `)})`
    : sql``;

  const cursorClause = input.cursor
    ? sql`AND (t.payment_date, t.id) < (${new Date(input.cursor.split('_')[0]!)}, ${input.cursor.split('_')[1]})`
    : sql``;

  // Search clause (desc_norm, desc_raw, alias_desc, category)
  const searchClause = search
    ? sql`AND (
        LOWER(t.desc_norm) LIKE ${`%${search.toLowerCase()}%`} OR
        LOWER(t.desc_raw) LIKE ${`%${search.toLowerCase()}%`} OR
        LOWER(t.alias_desc) LIKE ${`%${search.toLowerCase()}%`} OR
        LOWER(CAST(t.category_1 AS text)) LIKE ${`%${search.toLowerCase()}%`}
      )`
    : sql``;

  // appCategoryName filter
  const appCategoryClause = appCategories?.length
    ? sql`AND t.app_category_name IN (${sql.join(appCategories.map((c) => sql`${c}`), sql`, `)})`
    : sql``;

  // Category filters
  const category1Clause = categories1?.length
    ? sql`AND t.category_1 IN (${sql.join(categories1.map((c) => sql`${c}`), sql`, `)})`
    : sql``;

  const category2Clause = categories2?.length
    ? sql`AND t.category_2 IN (${sql.join(categories2.map((c) => sql`${c}`), sql`, `)})`
    : sql``;

  const category3Clause = categories3?.length
    ? sql`AND t.category_3 IN (${sql.join(categories3.map((c) => sql`${c}`), sql`, `)})`
    : sql``;

  // Fix/Var filter
  const fixVarClause = fixVar
    ? sql`AND t.fix_var = ${fixVar}`
    : sql``;

  // Recurring filter
  const recurringClause = recurring !== undefined
    ? sql`AND t.recurring_flag = ${recurring}`
    : sql``;

  // Amount range filter
  const minAmountClause = minAmount !== undefined
    ? sql`AND ABS(t.amount) >= ${minAmount}`
    : sql``;

  const maxAmountClause = maxAmount !== undefined
    ? sql`AND ABS(t.amount) <= ${maxAmount}`
    : sql``;

  // Date range filter
  const dateFromClause = dateFrom
    ? sql`AND t.payment_date >= ${dateFrom}`
    : sql``;

  const dateToClause = dateTo
    ? sql`AND t.payment_date <= ${dateTo}`
    : sql``;

  // Select only essential fields for list view
  const result = await db.execute(sql`
    SELECT
      t.id,
      t.payment_date,
      t.desc_raw,
      t.desc_norm,
      t.alias_desc,
      t.simple_desc,
      t.amount,
      t.type,
      t.source,
      t.needs_review,
      t.conflict_flag,
      t.recurring_flag,
      t.app_category_name,
      t.category_1,
      t.manual_override,
      COALESCE(t.app_category_name, 'OPEN') as app_category
    FROM transactions t
    WHERE t.user_id = ${userId}
    AND t.display != 'no'
    ${sourceClause}
    ${searchClause}
    ${appCategoryClause}
    ${category1Clause}
    ${category2Clause}
    ${category3Clause}
    ${fixVarClause}
    ${recurringClause}
    ${minAmountClause}
    ${maxAmountClause}
    ${dateFromClause}
    ${dateToClause}
    ${cursorClause}
    ORDER BY t.payment_date DESC, t.id DESC
    LIMIT ${limit + 1}
  `);

  const rows = result.rows as any[];
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map((row: any) => ({
    id: row.id,
    paymentDate: row.payment_date,
    descRaw: row.desc_raw,
    descNorm: row.desc_norm,
    aliasDesc: row.alias_desc,
    simpleDesc: row.simple_desc,
    amount: row.amount,
    type: row.type,
    source: row.source,
    needsReview: row.needs_review,
    conflictFlag: row.conflict_flag,
    recurringFlag: row.recurring_flag,
    appCategoryName: row.app_category_name,
    category1: row.category_1,
    manualOverride: row.manual_override,
    appCategory: row.app_category,
  }));

  const lastItem = items[items.length - 1];
  const nextCursor = hasMore && lastItem
    ? `${new Date(lastItem.paymentDate).toISOString()}_${lastItem.id}`
    : null;

  return { items, nextCursor, hasMore };
}

/**
 * Fetch full transaction details on demand (for drawer/detail view)
 */
export async function getTransactionDetail(transactionId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const result = await db.execute(sql`
    SELECT
      t.*,
      COALESCE(t1.nivel_1_pt, 'OPEN') as level_1,
      COALESCE(t2.nivel_2_pt, 'OPEN') as level_2,
      COALESCE(tl.nivel_3_pt, 'OPEN') as level_3,
      COALESCE(t.app_category_name, 'OPEN') as app_category,
      r.key_words as rule_keywords,
      r.category_1 as rule_category_1,
      r.category_2 as rule_category_2,
      r.category_3 as rule_category_3
    FROM transactions t
    LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
    LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    LEFT JOIN rules r ON t.rule_id_applied = r.id
    WHERE t.id = ${transactionId}
    AND t.user_id = ${session.user.id}
    LIMIT 1
  `);

  if (!result.rows.length) return null;

  const row = result.rows[0] as any;
  return {
    ...row,
    paymentDate: row.payment_date,
    descRaw: row.desc_raw,
    descNorm: row.desc_norm,
    simpleDesc: row.simple_desc,
    aliasDesc: row.alias_desc,
    leafId: row.leaf_id,
    classifiedBy: row.classified_by,
    recurringFlag: row.recurring_flag,
    recurringGroupId: row.recurring_group_id,
    recurringConfidence: row.recurring_confidence,
    recurringDayOfMonth: row.recurring_day_of_month,
    recurringDayWindow: row.recurring_day_window,
    fixVar: row.fix_var,
    category1: row.category_1,
    category2: row.category_2,
    category3: row.category_3,
    manualOverride: row.manual_override,
    internalTransfer: row.internal_transfer,
    excludeFromBudget: row.exclude_from_budget,
    needsReview: row.needs_review,
    ruleIdApplied: row.rule_id_applied,
    uploadId: row.upload_id,
    suggestedKeyword: row.suggested_keyword,
    matchedKeyword: row.matched_keyword,
    appCategoryId: row.app_category_id,
    appCategoryName: row.app_category_name,
    conflictFlag: row.conflict_flag,
    classificationCandidates: row.classification_candidates,
    userId: row.user_id,
    level1: row.level_1,
    level2: row.level_2,
    level3: row.level_3,
    appCategory: row.app_category,
    ruleKeywords: row.rule_keywords,
    ruleCategory1: row.rule_category_1,
    ruleCategory2: row.rule_category_2,
    ruleCategory3: row.rule_category_3,
  };
}

export async function createRuleAndApply(
  transactionId: string,
  keyword: string,
  leafId: string,
  keyWordsNegative?: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const ensured = await ensureOpenCategory();
    if (!ensured.openLeafId) throw new Error("OPEN taxonomy not initialized");

    const { byLeafId } = await buildLeafHierarchyMaps(session.user.id);
    const hierarchy = byLeafId.get(leafId);
    if (!hierarchy) throw new Error("Invalid leafId (not found in taxonomy)");

    // 1) Create or merge rule (one rule per leafId)
    const existingRule = await db.query.rules.findFirst({
      where: and(eq(rules.userId, session.user.id), eq(rules.leafId, leafId), eq(rules.active, true)),
    });

    const normalizedKeywords = keyword
      .split(";")
      .map((k) => k.trim().toUpperCase())
      .filter(Boolean);

    if (existingRule) {
      const existingKeywords =
        existingRule.keyWords?.split(";").map((k) => k.trim().toUpperCase()).filter(Boolean) || [];
      const combined = [...new Set([...existingKeywords, ...normalizedKeywords])].join("; ");

      let combinedNegative: string | null = existingRule.keyWordsNegative || null;
      if (keyWordsNegative) {
        const existingNeg =
          existingRule.keyWordsNegative?.split(";").map((k) => k.trim().toUpperCase()).filter(Boolean) || [];
        const nextNeg = keyWordsNegative.split(";").map((k) => k.trim().toUpperCase()).filter(Boolean);
        combinedNegative = [...new Set([...existingNeg, ...nextNeg])].join("; ") || null;
      }

      await db.update(rules)
        .set({
          keyWords: combined,
          keyWordsNegative: combinedNegative,
          category1: hierarchy.category1 as any,
          category2: hierarchy.category2,
          category3: hierarchy.category3,
          leafId,
          priority: Math.max(existingRule.priority ?? 950, 950),
        })
        .where(eq(rules.id, existingRule.id));
    } else {
      await db.insert(rules).values({
        userId: session.user.id,
        keyWords: normalizedKeywords.join("; "),
        keyWordsNegative: keyWordsNegative ? keyWordsNegative.toUpperCase() : null,
        category1: hierarchy.category1 as any,
        category2: hierarchy.category2,
        category3: hierarchy.category3,
        type: hierarchy.typeDefault || "Despesa",
        fixVar: hierarchy.fixVarDefault || "Variável",
        active: true,
        priority: 950,
        leafId,
      });
    }

    // 2) Apply categorization across transactions (respects manualOverride)
    await applyCategorization();

    revalidatePath("/transactions");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Quick Rule Error:", error);
    return { success: false, error: error.message };
  }
}
