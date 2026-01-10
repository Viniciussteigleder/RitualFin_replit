"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, accounts, ingestionBatches, aliasAssets } from "@/lib/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
  const [balanceRes] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  
  const totalBalance = Number(balanceRes?.total || 0);

  // 2. Pending Transactions Count
  const [pendingRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.needsReview, true)));
  
  const pendingCount = Number(pendingRes?.count || 0);

  // 3. Last Sync
  const [lastBatch] = await db
    .select({ importedAt: ingestionBatches.importedAt })
    .from(ingestionBatches)
    .where(eq(ingestionBatches.userId, userId))
    .orderBy(desc(ingestionBatches.importedAt))
    .limit(1);

  // 4. Daily Spend (Avg last 30 days from target date? Or just global avg? Let's use 30 days ending at target date for context)
  const thirtyDaysAgo = new Date(targetDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [last30DaysSpend] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, "Despesa"),
      gte(transactions.paymentDate, thirtyDaysAgo),
      sql`${transactions.paymentDate} <= ${targetDate}`
    ));
  
  const dailySpend = Math.abs(Number(last30DaysSpend?.total || 0)) / 30;

  // 5. Month-to-Date / Month Total Spend
  // Filter out internal transfers from spend calculation? User said "categoria interno nao é contabilizado". THIS IS KEY.
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
      sql`${transactions.category1} NOT IN ('Interno', 'Transferências')`
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
      value: sql<number>`SUM(ABS(${transactions.amount}))` 
    })
    .from(transactions)
    .where(and(
       eq(transactions.userId, userId),
       eq(transactions.type, "Despesa"),
       gte(transactions.paymentDate, startOfMonth),
       sql`${transactions.paymentDate} <= ${endOfMonth}`,
       sql`${transactions.category1} NOT IN ('Interno', 'Transferências')`
    ))
    .groupBy(transactions.category1)
    .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`))
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
    where: (tx, { eq, and }) => and(eq(tx.userId, userId), eq(tx.needsReview, true)),
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

  // TODO: Add filtering and pagination support
  return await db.query.transactions.findMany({
    where: (tx, { eq }) => eq(tx.userId, userId),
    orderBy: [desc(transactions.paymentDate)],
    limit: limit,
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
      manualOverride: true
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
        .set({ needsReview: false })
        .where(eq(transactions.id, transactionId));

    revalidatePath("/transactions");
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
    const ruleKey = `QUICK_${Date.now()}`;
    const [insertedRule] = await db.insert(rules).values({
      userId: session.user.id,
      name: `Quick Rule: ${keyword}`,
      keywords: keyword,
      category1: category,
      active: true,
      priority: 999, // High priority
      ruleKey: ruleKey
    }).returning();

    if (!insertedRule) throw new Error("Failed to create rule");

    // 2. Update Transaction
    await db.update(transactions)
      .set({
        category1: category,
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
