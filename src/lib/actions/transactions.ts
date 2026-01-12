"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, accounts, ingestionBatches, aliasAssets, rules } from "@/lib/db/schema";
import { eq, desc, sql, and, gte, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  TransactionUpdateSchema, 
  TransactionConfirmSchema, 
  TransactionDeleteSchema,
  Result,
  success,
  error 
} from "@/lib/validators";

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
      // Exclude Internal/Transferências from main spend metrics too? 
      // User said "categoria interno nao é contabilizado pois sao transacoes internas". 
      // I should probably apply this broadly.
      // Assuming 'Interno' and 'Transferências' are the names.
      // Drizzle doesn't export notInArray by default in all versions, checking imports.
      // If not available, use sql.
      sql`${transactions.category1} NOT IN ('Interno', 'Transferências')`,
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
  const monthlyGoal = 5000; 
  const remainingBudget = monthlyGoal - spentMonthToDate;

  // 8. Category Breakdown
  const categoryData = await db
    .select({ 
      name: transactions.category1, 
      value: sql<number>`ABS(SUM(${transactions.amount}))` // Changed from SUM(ABS(...)) to ABS(SUM(...))
    })
    .from(transactions)
    .where(and(
       eq(transactions.userId, userId),
       eq(transactions.type, "Despesa"),
       gte(transactions.paymentDate, startOfMonth),
       sql`${transactions.paymentDate} <= ${endOfMonth}`,
       sql`${transactions.category1} NOT IN ('Interno', 'Transferências')`,
       ne(transactions.display, "no")
    ))
    .groupBy(transactions.category1)
    .orderBy(desc(sql`ABS(SUM(${transactions.amount}))`)) // Changed from SUM(ABS(...)) to ABS(SUM(...))
    .limit(20); // Increased limit for frontend filtering

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
    categoryData: categoryData.map(c => ({ name: c.name || "Outros", value: Number(c.value) }))
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

export async function getTransactions(limit = 50) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

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
  data: { category1: string; category2?: string; category3?: string }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.update(transactions)
    .set({
      category1: data.category1 as any,
      category2: data.category2,
      category3: data.category3,
      needsReview: false, // Auto-confirm on manual edit
      manualOverride: true,
      conflictFlag: false // Resolution clears conflict
    })
    .where(eq(transactions.id, transactionId));

  revalidatePath("/transactions");
  revalidatePath("/"); // Dashboard
  return { success: true };
}

export async function confirmTransaction(transactionId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await db.update(transactions)
        .set({ needsReview: false, conflictFlag: false })
        .where(eq(transactions.id, transactionId));

    revalidatePath("/confirm");
    revalidatePath("/transactions");
    return { success: true };
}

export async function confirmHighConfidenceTransactions(threshold = 80) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.update(transactions)
    .set({ needsReview: false })
    .where(and(
      eq(transactions.userId, session.user.id),
      eq(transactions.needsReview, true),
      sql`${transactions.confidence} >= ${threshold}`
    ));

  revalidatePath("/confirm");
  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTransaction(transactionId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await db.delete(transactions)
        .where(eq(transactions.id, transactionId));

    revalidatePath("/transactions");
    revalidatePath("/"); // Dashboard
    return { success: true };
}

export async function getAliases() {
  const session = await auth();
  if (!session?.user?.id) return [];
  
  return await db.query.aliasAssets.findMany({
    where: eq(aliasAssets.userId, session.user.id),
  });
}

export async function createRuleAndApply(
  transactionId: string,
  keyword: string,
  category: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // 1. Create Rule
    const [insertedRule] = await db.insert(rules).values({
      userId: session.user.id,
      keyWords: keyword,
      category1: category as any,
      active: true,
      priority: 999, 
      leafId: "open" 
    }).returning();

    if (!insertedRule) throw new Error("Failed to create rule");

    // 2. Update Transaction
    await db.update(transactions)
      .set({
        category1: category as any,
        needsReview: false,
        ruleIdApplied: insertedRule.id,
        manualOverride: false // It's rule based now, effectively
      })
      .where(eq(transactions.id, transactionId));

    revalidatePath("/transactions");
    revalidatePath("/");
    
    return { success: true, ruleId: insertedRule.id };
  } catch (error: any) {
    console.error("Quick Rule Error:", error);
    return { success: false, error: error.message };
  }
}
