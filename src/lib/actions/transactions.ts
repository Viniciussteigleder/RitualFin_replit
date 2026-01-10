"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, accounts, ingestionBatches, aliasAssets } from "@/lib/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // 1. Total Balance
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

  // 4. Daily Forecast (derived from last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [last30DaysSpend] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, "Despesa"),
      gte(transactions.paymentDate, thirtyDaysAgo)
    ));
  
  const dailySpend = Math.abs(Number(last30DaysSpend?.total || 0)) / 30;

  // 5. Month-to-Date Spend (Start of month to Today)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const [mtdRes] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, "Despesa"),
      gte(transactions.paymentDate, startOfMonth)
    ));

  const spentMonthToDate = Math.abs(Number(mtdRes?.total || 0));

  // 6. Projected Spend calculation
  const remainingDays = endOfMonth.getDate() - now.getDate();
  const projectedSpend = spentMonthToDate + (dailySpend * remainingDays);

  // 7. Budget / Remaining (Mocked Goal for now, should fetch from goals table)
  // Fetch specific monthly goal or default to 5000 if not set
  // In a real scenario: await db.select().from(goals)...
  const monthlyGoal = 5000; 
  const remainingBudget = monthlyGoal - spentMonthToDate;

  // 8. Category Breakdown for Charts
  const categoryData = await db
    .select({ 
      name: transactions.category1, 
      value: sql<number>`SUM(ABS(${transactions.amount}))` 
    })
    .from(transactions)
    .where(and(
       eq(transactions.userId, userId),
       eq(transactions.type, "Despesa"),
       gte(transactions.paymentDate, startOfMonth)
    ))
    .groupBy(transactions.category1)
    .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`))
    .limit(5);

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
