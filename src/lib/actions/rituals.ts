"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rituals, ritualGoals, transactions } from "@/lib/db/schema";
import { eq, and, sql, desc, gte, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type Ritual = typeof rituals.$inferSelect;

export interface RitualWithStats extends Ritual {
  streak: number;
  lastCompleted: Date | null;
  isOverdue: boolean;
}

export async function getRituals(): Promise<RitualWithStats[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userRituals = await db.query.rituals.findMany({
    where: eq(rituals.userId, session.user.id),
    orderBy: [desc(rituals.completedAt)],
  });

  // Group by type and calculate streaks
  const ritualsByType = userRituals.reduce(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type].push(r);
      return acc;
    },
    {} as Record<string, typeof userRituals>
  );

  const ritualStats: RitualWithStats[] = [];

  for (const [type, typeRituals] of Object.entries(ritualsByType)) {
    const completed = typeRituals.filter((r) => r.completedAt);
    const lastCompleted =
      completed.length > 0 ? completed[0].completedAt : null;

    // Calculate streak
    let streak = 0;
    if (lastCompleted) {
      const sortedByDate = completed.sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime()
      );

      let expectedDate = new Date();
      const period = typeRituals[0]?.period || "daily";

      for (const ritual of sortedByDate) {
        const completedDate = new Date(ritual.completedAt!);
        const daysDiff = Math.floor(
          (expectedDate.getTime() - completedDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const maxDiff =
          period === "daily" ? 1 : period === "weekly" ? 7 : 30;

        if (daysDiff <= maxDiff) {
          streak++;
          expectedDate = completedDate;
        } else {
          break;
        }
      }
    }

    // Check if overdue
    const period = typeRituals[0]?.period || "daily";
    const now = new Date();
    let isOverdue = false;

    if (lastCompleted) {
      const daysSinceCompletion = Math.floor(
        (now.getTime() - new Date(lastCompleted).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      isOverdue =
        period === "daily"
          ? daysSinceCompletion > 1
          : period === "weekly"
            ? daysSinceCompletion > 7
            : daysSinceCompletion > 30;
    } else {
      isOverdue = true;
    }

    // Use the most recent ritual entry as the base
    const latestRitual = typeRituals[0];
    if (latestRitual) {
      ritualStats.push({
        ...latestRitual,
        streak,
        lastCompleted,
        isOverdue,
      });
    }
  }

  return ritualStats;
}

export async function completeRitual(type: string, notes?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    // Get the period from the most recent ritual of this type
    const existingRitual = await db.query.rituals.findFirst({
      where: and(
        eq(rituals.userId, session.user.id),
        eq(rituals.type, type)
      ),
      orderBy: [desc(rituals.createdAt)],
    });

    const period = existingRitual?.period || "daily";

    const [ritual] = await db
      .insert(rituals)
      .values({
        userId: session.user.id,
        type,
        period,
        completedAt: new Date(),
        notes,
      })
      .returning();

    revalidatePath("/rituals");
    return { success: true, ritual };
  } catch (error) {
    console.error("[completeRitual] Error:", error);
    return { success: false, error: "Erro ao completar ritual" };
  }
}

export async function createRitual(data: {
  type: string;
  period: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const [ritual] = await db
      .insert(rituals)
      .values({
        userId: session.user.id,
        type: data.type,
        period: data.period,
        notes: data.notes,
      })
      .returning();

    revalidatePath("/rituals");
    return { success: true, ritual };
  } catch (error) {
    console.error("[createRitual] Error:", error);
    return { success: false, error: "Erro ao criar ritual" };
  }
}

export async function getDailyRitualTasks() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get pending transactions count
  const [pendingResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.needsReview, true),
        ne(transactions.display, "no")
      )
    );

  // Get uncategorized transactions
  const [uncategorizedResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        sql`${transactions.category1} IS NULL`,
        ne(transactions.display, "no")
      )
    );

  // Get today's transactions
  const [todayResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        gte(transactions.importedAt, startOfDay),
        ne(transactions.display, "no")
      )
    );

  return {
    pendingReview: Number(pendingResult?.count || 0),
    uncategorized: Number(uncategorizedResult?.count || 0),
    todayTransactions: Number(todayResult?.count || 0),
    tasks: [
      {
        id: "review",
        name: "Revisar transações pendentes",
        count: Number(pendingResult?.count || 0),
        completed: Number(pendingResult?.count || 0) === 0,
        link: "/confirm",
      },
      {
        id: "categorize",
        name: "Categorizar transações",
        count: Number(uncategorizedResult?.count || 0),
        completed: Number(uncategorizedResult?.count || 0) === 0,
        link: "/transactions",
      },
      {
        id: "check-today",
        name: "Verificar movimentações do dia",
        count: Number(todayResult?.count || 0),
        completed: Number(todayResult?.count || 0) > 0,
        link: "/transactions",
      },
    ],
  };
}

export async function getWeeklyRitualTasks() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Get week's spending by category
  const categorySpending = await db
    .select({
      category: transactions.category1,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, "Despesa"),
        gte(transactions.paymentDate, startOfWeek),
        eq(transactions.internalTransfer, false),
        sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
        ne(transactions.display, "no")
      )
    )
    .groupBy(transactions.category1)
    .orderBy(sql`SUM(${transactions.amount}) ASC`)
    .limit(5);

  return {
    topCategories: categorySpending.map((c) => ({
      category: c.category || "Outros",
      amount: Math.abs(Number(c.total)),
    })),
    tasks: [
      {
        id: "review-categories",
        name: "Revisar gastos por categoria",
        completed: false,
        link: "/analytics",
      },
      {
        id: "check-recurring",
        name: "Verificar pagamentos recorrentes",
        completed: false,
        link: "/calendar",
      },
      {
        id: "update-rules",
        name: "Ajustar regras de categorização",
        completed: false,
        link: "/settings/rules",
      },
    ],
  };
}

export async function getMonthlyRitualTasks() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get month summary
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
        sql`${transactions.paymentDate} <= ${endOfMonth}`,
        eq(transactions.internalTransfer, false),
        sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
        ne(transactions.display, "no")
      )
    );

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
        sql`${transactions.paymentDate} <= ${endOfMonth}`,
        ne(transactions.display, "no")
      )
    );

  const monthSpending = Math.abs(Number(spendingResult?.total || 0));
  const monthIncome = Number(incomeResult?.total || 0);
  const savings = monthIncome - monthSpending;

  return {
    summary: {
      spending: monthSpending,
      income: monthIncome,
      savings,
      savingsRate: monthIncome > 0 ? (savings / monthIncome) * 100 : 0,
    },
    tasks: [
      {
        id: "review-month",
        name: "Revisar fechamento do mês",
        completed: false,
        link: "/analytics",
      },
      {
        id: "set-goals",
        name: "Definir metas para próximo mês",
        completed: false,
        link: "/goals",
      },
      {
        id: "export-report",
        name: "Exportar relatório mensal",
        completed: false,
        link: "/analytics",
      },
    ],
  };
}

// Ritual Goals Actions
export async function createRitualGoal(data: {
  ritualId?: string;
  ritualType: string;
  goalText: string;
  targetDate?: Date;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const [goal] = await db
      .insert(ritualGoals)
      .values({
        userId: session.user.id,
        ritualId: data.ritualId,
        ritualType: data.ritualType,
        goalText: data.goalText,
        targetDate: data.targetDate,
      })
      .returning();

    revalidatePath("/rituals");
    return { success: true, goal };
  } catch (error) {
    console.error("[createRitualGoal] Error:", error);
    return { success: false, error: "Erro ao criar meta" };
  }
}

export async function getRitualGoals(ritualType?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const whereConditions = [eq(ritualGoals.userId, session.user.id)];
  if (ritualType) {
    whereConditions.push(eq(ritualGoals.ritualType, ritualType));
  }

  return await db.query.ritualGoals.findMany({
    where: and(...whereConditions),
    orderBy: (ritualGoals, { desc }) => [desc(ritualGoals.createdAt)],
  });
}

export async function updateRitualGoal(
  id: string,
  data: {
    goalText?: string;
    completed?: boolean;
    targetDate?: Date;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const updates: any = { ...data };
    if (data.completed !== undefined && data.completed) {
      updates.completedAt = new Date();
    }

    await db
      .update(ritualGoals)
      .set(updates)
      .where(
        and(eq(ritualGoals.id, id), eq(ritualGoals.userId, session.user.id))
      );

    revalidatePath("/rituals");
    return { success: true };
  } catch (error) {
    console.error("[updateRitualGoal] Error:", error);
    return { success: false, error: "Erro ao atualizar meta" };
  }
}

export async function deleteRitualGoal(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    await db
      .delete(ritualGoals)
      .where(
        and(eq(ritualGoals.id, id), eq(ritualGoals.userId, session.user.id))
      );

    revalidatePath("/rituals");
    return { success: true };
  } catch (error) {
    console.error("[deleteRitualGoal] Error:", error);
    return { success: false, error: "Erro ao excluir meta" };
  }
}
