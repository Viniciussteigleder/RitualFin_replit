"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { goals, categoryGoals, transactions } from "@/lib/db/schema";
import { eq, and, sql, gte, lte, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type Goal = typeof goals.$inferSelect;
export type CategoryGoal = typeof categoryGoals.$inferSelect;

export interface CreateGoalData {
  month: string; // YYYY-MM format
  estimatedIncome: number;
  categoryTargets: {
    category1: string;
    targetAmount: number;
  }[];
}

export async function getGoals() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.query.goals.findMany({
    where: eq(goals.userId, session.user.id),
    with: {
      categoryGoals: true,
    },
    orderBy: (goals, { desc }) => [desc(goals.month)],
  });
}

export async function getGoalByMonth(month: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return await db.query.goals.findFirst({
    where: and(eq(goals.userId, session.user.id), eq(goals.month, month)),
    with: {
      categoryGoals: true,
    },
  });
}

export async function getGoalWithActuals(month: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const goal = await getGoalByMonth(month);
  if (!goal) return null;

  // Calculate actual spending for each category
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0);

  const actuals = await db
    .select({
      category1: transactions.category1,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, "Despesa"),
        gte(transactions.paymentDate, startDate),
        lte(transactions.paymentDate, endDate),
        eq(transactions.internalTransfer, false),
        sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
        ne(transactions.display, "no")
      )
    )
    .groupBy(transactions.category1);

  const actualsMap = actuals.reduce(
    (acc, a) => {
      if (a.category1) {
        acc[a.category1] = Math.abs(Number(a.total));
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate actual income
  const [incomeResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, "Receita"),
        gte(transactions.paymentDate, startDate),
        lte(transactions.paymentDate, endDate),
        ne(transactions.display, "no")
      )
    );

  const actualIncome = Number(incomeResult?.total || 0);

  return {
    ...goal,
    actualIncome,
    categoryGoalsWithActuals: goal.categoryGoals.map((cg) => ({
      ...cg,
      actual: actualsMap[cg.category1] || 0,
      percentage:
        cg.targetAmount > 0
          ? ((actualsMap[cg.category1] || 0) / cg.targetAmount) * 100
          : 0,
    })),
  };
}

export async function createGoal(data: CreateGoalData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    // Check if goal for this month already exists
    const existing = await db.query.goals.findFirst({
      where: and(
        eq(goals.userId, session.user.id),
        eq(goals.month, data.month)
      ),
    });

    if (existing) {
      return { success: false, error: "Já existe uma meta para este mês" };
    }

    const totalPlanned = data.categoryTargets.reduce(
      (sum, ct) => sum + ct.targetAmount,
      0
    );

    const [goal] = await db
      .insert(goals)
      .values({
        userId: session.user.id,
        month: data.month,
        estimatedIncome: data.estimatedIncome,
        totalPlanned,
      })
      .returning();

    // Insert category goals
    if (data.categoryTargets.length > 0) {
      await db.insert(categoryGoals).values(
        data.categoryTargets.map((ct) => ({
          goalId: goal.id,
          category1: ct.category1 as any,
          targetAmount: ct.targetAmount,
        }))
      );
    }

    revalidatePath("/goals");
    return { success: true, goal };
  } catch (error) {
    console.error("[createGoal] Error:", error);
    return { success: false, error: "Erro ao criar meta" };
  }
}

export async function updateGoal(
  id: string,
  data: Partial<{
    estimatedIncome: number;
    categoryTargets: {
      category1: string;
      targetAmount: number;
    }[];
  }>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const goal = await db.query.goals.findFirst({
      where: and(eq(goals.id, id), eq(goals.userId, session.user.id)),
    });

    if (!goal) {
      return { success: false, error: "Meta não encontrada" };
    }

    const updates: any = {};
    if (data.estimatedIncome !== undefined) {
      updates.estimatedIncome = data.estimatedIncome;
    }

    if (data.categoryTargets) {
      // Delete existing category goals and recreate
      await db.delete(categoryGoals).where(eq(categoryGoals.goalId, id));

      if (data.categoryTargets.length > 0) {
        await db.insert(categoryGoals).values(
          data.categoryTargets.map((ct) => ({
            goalId: id,
            category1: ct.category1 as any,
            targetAmount: ct.targetAmount,
          }))
        );
      }

      updates.totalPlanned = data.categoryTargets.reduce(
        (sum, ct) => sum + ct.targetAmount,
        0
      );
    }

    if (Object.keys(updates).length > 0) {
      await db.update(goals).set(updates).where(eq(goals.id, id));
    }

    revalidatePath("/goals");
    return { success: true };
  } catch (error) {
    console.error("[updateGoal] Error:", error);
    return { success: false, error: "Erro ao atualizar meta" };
  }
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    // Category goals will be deleted by cascade
    await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)));

    revalidatePath("/goals");
    return { success: true };
  } catch (error) {
    console.error("[deleteGoal] Error:", error);
    return { success: false, error: "Erro ao excluir meta" };
  }
}

export async function getMonthlyProjection() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const daysPassed = now.getDate();
  const daysRemaining = daysInMonth - daysPassed;

  // Get current month spending
  const [spendingResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, "Despesa"),
        gte(transactions.paymentDate, startOfMonth),
        lte(transactions.paymentDate, now),
        eq(transactions.internalTransfer, false),
        sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
        ne(transactions.display, "no")
      )
    );

  const currentSpending = Math.abs(Number(spendingResult?.total || 0));
  const dailyAverage = daysPassed > 0 ? currentSpending / daysPassed : 0;
  const projectedTotal = currentSpending + dailyAverage * daysRemaining;

  // Get current month income
  const [incomeResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, "Receita"),
        gte(transactions.paymentDate, startOfMonth),
        lte(transactions.paymentDate, now),
        ne(transactions.display, "no")
      )
    );

  const currentIncome = Number(incomeResult?.total || 0);

  // Get total balance
  const [balanceResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.userId, session.user.id));

  const totalBalance = Number(balanceResult?.total || 0);
  const projectedBalance = totalBalance - dailyAverage * daysRemaining;

  return {
    currentSpending,
    dailyAverage,
    projectedTotal,
    currentIncome,
    totalBalance,
    projectedBalance,
    daysRemaining,
    daysPassed,
    daysInMonth,
  };
}
