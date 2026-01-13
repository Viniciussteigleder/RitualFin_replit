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
            eq(transactions.userId, session.user.id),
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
        userId: session.user.id,
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
