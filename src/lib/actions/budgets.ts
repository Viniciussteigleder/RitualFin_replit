"use server";

import { db } from "@/lib/db";
import { budgets, transactions } from "@/lib/db/schema";
import { eq, and, sql, gte, lte, ne } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type Budget = typeof budgets.$inferSelect;

export interface BudgetWithSpent extends Budget {
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
}

export async function getBudgets(month?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const conditions = [eq(budgets.userId, session.user.id)];
  if (month) {
    conditions.push(eq(budgets.month, month));
  }

  return await db.query.budgets.findMany({
    where: and(...conditions),
  });
}

export async function getBudgetsWithSpent(month?: string): Promise<BudgetWithSpent[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;
  const userBudgets = await getBudgets(month);

  const budgetsWithSpent = await Promise.all(
    userBudgets.map(async (budget) => {
      // Parse month to get date range
      const [year, monthNum] = budget.month.split("-").map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);

      const [result] = await db
        .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.category1, budget.category1),
            eq(transactions.type, "Despesa"),
            gte(transactions.paymentDate, startDate),
            lte(transactions.paymentDate, endDate),
            ne(transactions.display, "no")
          )
        );

      const spent = Math.abs(Number(result?.total || 0));
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const remaining = budget.amount - spent;
      const isOverBudget = spent > budget.amount;

      return {
        ...budget,
        spent,
        percentage,
        remaining,
        isOverBudget,
      };
    })
  );

  return budgetsWithSpent;
}

export async function createBudget(data: {
  month: string;
  category1: string;
  amount: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    // Check if budget for this category and month already exists
    const existing = await db.query.budgets.findFirst({
      where: and(
        eq(budgets.userId, session.user.id),
        eq(budgets.month, data.month),
        eq(budgets.category1, data.category1 as any)
      ),
    });

    if (existing) {
      return { success: false, error: "Já existe um orçamento para esta categoria neste mês" };
    }

    const [budget] = await db
      .insert(budgets)
      .values({
        userId: session.user.id,
        month: data.month,
        category1: data.category1 as any,
        amount: data.amount,
      })
      .returning();

    revalidatePath("/budgets");
    return { success: true, budget };
  } catch (error) {
    console.error("[createBudget] Error:", error);
    return { success: false, error: "Erro ao criar orçamento" };
  }
}

export async function updateBudget(id: string, amount: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const [budget] = await db
      .update(budgets)
      .set({ amount })
      .where(and(eq(budgets.id, id), eq(budgets.userId, session.user.id)))
      .returning();

    revalidatePath("/budgets");
    return { success: true, budget };
  } catch (error) {
    console.error("[updateBudget] Error:", error);
    return { success: false, error: "Erro ao atualizar orçamento" };
  }
}

export async function deleteBudget(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, session.user.id)));

    revalidatePath("/budgets");
    return { success: true };
  } catch (error) {
    console.error("[deleteBudget] Error:", error);
    return { success: false, error: "Erro ao excluir orçamento" };
  }
}

export async function copyBudgetsToNextMonth(currentMonth: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  const userId = session.user.id;

  try {
    const currentBudgets = await getBudgets(currentMonth);

    if (currentBudgets.length === 0) {
      return { success: false, error: "Nenhum orçamento encontrado para copiar" };
    }

    // Calculate next month
    const [year, month] = currentMonth.split("-").map(Number);
    const nextDate = new Date(year, month, 1);
    const nextMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

    // Check if budgets already exist for next month
    const existingNextMonth = await getBudgets(nextMonth);
    if (existingNextMonth.length > 0) {
      return { success: false, error: "Já existem orçamentos para o próximo mês" };
    }

    // Copy budgets
    await db.insert(budgets).values(
      currentBudgets.map((b) => ({
        userId,
        month: nextMonth,
        category1: b.category1,
        amount: b.amount,
      }))
    );

    revalidatePath("/budgets");
    return { success: true, message: `${currentBudgets.length} orçamentos copiados para ${nextMonth}` };
  } catch (error) {
    console.error("[copyBudgetsToNextMonth] Error:", error);
    return { success: false, error: "Erro ao copiar orçamentos" };
  }
}

export async function getBudgetSummary(month: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const budgetsWithSpent = await getBudgetsWithSpent(month);

  const totalBudgeted = budgetsWithSpent.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overBudgetCount = budgetsWithSpent.filter((b) => b.isOverBudget).length;
  const healthyCount = budgetsWithSpent.filter((b) => b.percentage <= 80).length;

  return {
    totalBudgeted,
    totalSpent,
    totalRemaining,
    overallPercentage: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
    categoriesCount: budgetsWithSpent.length,
    overBudgetCount,
    healthyCount,
    status: overBudgetCount > 0 ? "warning" : totalSpent / totalBudgeted > 0.8 ? "attention" : "healthy",
  };
}

export interface CategorySpending {
  category1: string;
  lastMonth: number;
  threeMonthAvg: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  proposedBudget: number;
  confidence: "high" | "medium" | "low";
}

export interface BudgetProposal {
  categories: CategorySpending[];
  totalLastMonth: number;
  totalThreeMonthAvg: number;
  totalProposed: number;
  recommendations: string[];
}

export interface CategoryBreakdown {
  category1: string;
  total: number;
  avgMonthly: number;
  level2: {
    name: string;
    total: number;
    avgMonthly: number;
    level3: {
      name: string;
      total: number;
      avgMonthly: number;
    }[];
  }[];
}

/**
 * Get smart budget proposals based on past 3 months of spending
 * Analyzes spending patterns and provides intelligent budget recommendations
 */
export async function getBudgetProposals(): Promise<BudgetProposal | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const now = new Date();

  // Calculate date ranges for last month and past 3 months
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const threeMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  // Get spending by category for last month
  const lastMonthSpending = await db
    .select({
      category1: transactions.category1,
      total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "Despesa"),
        gte(transactions.paymentDate, lastMonthStart),
        lte(transactions.paymentDate, lastMonthEnd),
        ne(transactions.display, "no")
      )
    )
    .groupBy(transactions.category1);

  // Get spending by category for past 3 months
  const threeMonthSpending = await db
    .select({
      category1: transactions.category1,
      total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
      monthCount: sql<number>`COUNT(DISTINCT TO_CHAR(${transactions.paymentDate}, 'YYYY-MM'))`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "Despesa"),
        gte(transactions.paymentDate, threeMonthsAgoStart),
        lte(transactions.paymentDate, lastMonthEnd),
        ne(transactions.display, "no")
      )
    )
    .groupBy(transactions.category1);

  // Build category map
  const categoryMap = new Map<string, CategorySpending>();

  // Process 3-month data first
  for (const row of threeMonthSpending) {
    const cat = row.category1 || "OPEN";
    const monthCount = Math.max(1, Number(row.monthCount) || 1);
    const avg = Number(row.total) / monthCount;

    categoryMap.set(cat, {
      category1: cat,
      lastMonth: 0,
      threeMonthAvg: avg,
      trend: "stable",
      trendPercentage: 0,
      proposedBudget: avg,
      confidence: monthCount >= 3 ? "high" : monthCount >= 2 ? "medium" : "low",
    });
  }

  // Add last month data
  for (const row of lastMonthSpending) {
    const cat = row.category1 || "OPEN";
    const lastMonth = Number(row.total);
    const existing = categoryMap.get(cat);

    if (existing) {
      existing.lastMonth = lastMonth;

      // Calculate trend
      if (existing.threeMonthAvg > 0) {
        const diff = ((lastMonth - existing.threeMonthAvg) / existing.threeMonthAvg) * 100;
        existing.trendPercentage = diff;
        existing.trend = diff > 10 ? "up" : diff < -10 ? "down" : "stable";
      }

      // Propose budget: use 3-month avg with 10% buffer, but cap at 120% of avg
      existing.proposedBudget = Math.round(existing.threeMonthAvg * 1.1);
    } else {
      // Category only appeared last month
      categoryMap.set(cat, {
        category1: cat,
        lastMonth,
        threeMonthAvg: lastMonth, // Only 1 data point
        trend: "stable",
        trendPercentage: 0,
        proposedBudget: Math.round(lastMonth * 1.1),
        confidence: "low",
      });
    }
  }

  // Sort by proposed budget (highest first)
  const categories = Array.from(categoryMap.values())
    .filter((c) => c.proposedBudget > 0)
    .sort((a, b) => b.proposedBudget - a.proposedBudget);

  // Generate recommendations
  const recommendations: string[] = [];

  const increasingCategories = categories.filter((c) => c.trend === "up" && c.trendPercentage > 20);
  const decreasingCategories = categories.filter((c) => c.trend === "down" && c.trendPercentage < -20);
  const highSpendingCategories = categories.slice(0, 3);

  if (increasingCategories.length > 0) {
    recommendations.push(
      `Gastos aumentando em ${increasingCategories.map((c) => c.category1).join(", ")}. Considere revisar.`
    );
  }

  if (decreasingCategories.length > 0) {
    recommendations.push(
      `Boa redução em ${decreasingCategories.map((c) => c.category1).join(", ")}. Continue assim!`
    );
  }

  if (highSpendingCategories.length > 0) {
    recommendations.push(
      `Maiores gastos: ${highSpendingCategories.map((c) => c.category1).join(", ")}.`
    );
  }

  const totalLastMonth = categories.reduce((sum, c) => sum + c.lastMonth, 0);
  const totalThreeMonthAvg = categories.reduce((sum, c) => sum + c.threeMonthAvg, 0);
  const totalProposed = categories.reduce((sum, c) => sum + c.proposedBudget, 0);

  return {
    categories,
    totalLastMonth,
    totalThreeMonthAvg,
    totalProposed,
    recommendations,
  };
}

export interface HistoricalComparison {
  month: string;
  category1: string;
  spent: number;
}

export interface MonthlyComparison {
  category1: string;
  currentMonth: number;
  lastMonth: number;
  threeMonthAvg: number;
  changeFromLastMonth: number;
  changeFromAvg: number;
}

/**
 * Get historical comparison: current month vs last month vs 3-month average
 */
export async function getHistoricalComparison(currentMonth: string): Promise<MonthlyComparison[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  // Parse current month
  const [year, month] = currentMonth.split("-").map(Number);
  const currentStart = new Date(year, month - 1, 1);
  const currentEnd = new Date(year, month, 0);
  const lastMonthStart = new Date(year, month - 2, 1);
  const lastMonthEnd = new Date(year, month - 1, 0);
  const threeMonthsStart = new Date(year, month - 4, 1);

  // Get current month spending
  const currentSpending = await db
    .select({
      category1: transactions.category1,
      total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "Despesa"),
        gte(transactions.paymentDate, currentStart),
        lte(transactions.paymentDate, currentEnd),
        ne(transactions.display, "no")
      )
    )
    .groupBy(transactions.category1);

  // Get last month spending
  const lastMonthSpending = await db
    .select({
      category1: transactions.category1,
      total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "Despesa"),
        gte(transactions.paymentDate, lastMonthStart),
        lte(transactions.paymentDate, lastMonthEnd),
        ne(transactions.display, "no")
      )
    )
    .groupBy(transactions.category1);

  // Get 3-month average (excluding current month)
  const threeMonthSpending = await db
    .select({
      category1: transactions.category1,
      total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
      monthCount: sql<number>`COUNT(DISTINCT TO_CHAR(${transactions.paymentDate}, 'YYYY-MM'))`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "Despesa"),
        gte(transactions.paymentDate, threeMonthsStart),
        lte(transactions.paymentDate, lastMonthEnd),
        ne(transactions.display, "no")
      )
    )
    .groupBy(transactions.category1);

  // Build comparison map
  const comparisonMap = new Map<string, MonthlyComparison>();

  // Process current month
  for (const row of currentSpending) {
    const cat = row.category1 || "OPEN";
    comparisonMap.set(cat, {
      category1: cat,
      currentMonth: Number(row.total),
      lastMonth: 0,
      threeMonthAvg: 0,
      changeFromLastMonth: 0,
      changeFromAvg: 0,
    });
  }

  // Add last month data
  for (const row of lastMonthSpending) {
    const cat = row.category1 || "OPEN";
    const existing = comparisonMap.get(cat);
    if (existing) {
      existing.lastMonth = Number(row.total);
    } else {
      comparisonMap.set(cat, {
        category1: cat,
        currentMonth: 0,
        lastMonth: Number(row.total),
        threeMonthAvg: 0,
        changeFromLastMonth: 0,
        changeFromAvg: 0,
      });
    }
  }

  // Add 3-month average
  for (const row of threeMonthSpending) {
    const cat = row.category1 || "OPEN";
    const monthCount = Math.max(1, Number(row.monthCount) || 1);
    const avg = Number(row.total) / monthCount;
    const existing = comparisonMap.get(cat);
    if (existing) {
      existing.threeMonthAvg = avg;
    } else {
      comparisonMap.set(cat, {
        category1: cat,
        currentMonth: 0,
        lastMonth: 0,
        threeMonthAvg: avg,
        changeFromLastMonth: 0,
        changeFromAvg: 0,
      });
    }
  }

  // Calculate changes
  for (const comparison of comparisonMap.values()) {
    if (comparison.lastMonth > 0) {
      comparison.changeFromLastMonth =
        ((comparison.currentMonth - comparison.lastMonth) / comparison.lastMonth) * 100;
    }
    if (comparison.threeMonthAvg > 0) {
      comparison.changeFromAvg =
        ((comparison.currentMonth - comparison.threeMonthAvg) / comparison.threeMonthAvg) * 100;
    }
  }

  return Array.from(comparisonMap.values())
    .filter((c) => c.currentMonth > 0 || c.lastMonth > 0 || c.threeMonthAvg > 0)
    .sort((a, b) => b.currentMonth - a.currentMonth);
}

/**
 * Apply budget proposals - creates budgets from the proposed values
 */
export async function applyBudgetProposals(month: string, proposals: { category1: string; amount: number }[]) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  const userId = session.user.id;

  try {
    // Delete existing budgets for the month
    await db.delete(budgets).where(and(eq(budgets.userId, userId), eq(budgets.month, month)));

    // Insert new budgets
    if (proposals.length > 0) {
      await db.insert(budgets).values(
        proposals.map((p) => ({
          userId,
          month,
          category1: p.category1 as any,
          amount: p.amount,
        }))
      );
    }

    revalidatePath("/budgets");
    return { success: true, message: `${proposals.length} orçamentos aplicados` };
  } catch (error) {
    console.error("[applyBudgetProposals] Error:", error);
    return { success: false, error: "Erro ao aplicar orçamentos" };
  }
}

/**
 * Get breakdown for a specific category1 into level 2 and 3
 */
export async function getCategoryBreakdown(category1: string, months: number = 3): Promise<CategoryBreakdown | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0);

  const results = await db
    .select({
      category1: transactions.category1,
      category2: transactions.category2,
      category3: transactions.category3,
      total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.category1, category1 as any),
        eq(transactions.type, "Despesa"),
        gte(transactions.paymentDate, startDate),
        lte(transactions.paymentDate, endDate),
        ne(transactions.display, "no")
      )
    )
    .groupBy(transactions.category1, transactions.category2, transactions.category3);

  if (results.length === 0) return null;

  const total = results.reduce((sum, r) => sum + Number(r.total), 0);
  const avgMonthly = total / months;

  const level2Map = new Map<string, { name: string; total: number; level3Map: Map<string, number> }>();

  for (const row of results) {
    const l2Name = row.category2 || "Outros";
    const l3Name = row.category3 || "Outros";
    const rowTotal = Number(row.total);

    if (!level2Map.has(l2Name)) {
      level2Map.set(l2Name, { name: l2Name, total: 0, level3Map: new Map() });
    }

    const l2Data = level2Map.get(l2Name)!;
    l2Data.total += rowTotal;
    l2Data.level3Map.set(l3Name, (l2Data.level3Map.get(l3Name) || 0) + rowTotal);
  }

  const level2 = Array.from(level2Map.values()).map(l2 => ({
    name: l2.name,
    total: l2.total,
    avgMonthly: l2.total / months,
    level3: Array.from(l2.level3Map.entries()).map(([name, total]) => ({
      name,
      total,
      avgMonthly: total / months
    })).sort((a, b) => b.total - a.total)
  })).sort((a, b) => b.total - a.total);

  return {
    category1,
    total,
    avgMonthly,
    level2
  };
}
