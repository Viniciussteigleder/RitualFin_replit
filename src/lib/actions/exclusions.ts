"use server";

import { db } from "@/lib/db";
import { exclusionRules, ExclusionRule, NewExclusionRule } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getExclusionRules(): Promise<ExclusionRule[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.query.exclusionRules.findMany({
    where: eq(exclusionRules.userId, session.user.id),
    orderBy: (er, { desc }) => [desc(er.createdAt)]
  });
}

export async function createExclusionRule(data: {
  name: string;
  category1?: string;
  category2?: string;
  appCategoryName?: string;
  isInternal?: boolean;
  excludeFromDashboard?: boolean;
  excludeFromAnalytics?: boolean;
  excludeFromTransactions?: boolean;
  excludeFromCalendar?: boolean;
  excludeFromBudgets?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db.insert(exclusionRules).values({
    userId: session.user.id,
    name: data.name,
    category1: data.category1,
    category2: data.category2,
    appCategoryName: data.appCategoryName,
    isInternal: data.isInternal,
    excludeFromDashboard: data.excludeFromDashboard ?? false,
    excludeFromAnalytics: data.excludeFromAnalytics ?? false,
    excludeFromTransactions: data.excludeFromTransactions ?? false,
    excludeFromCalendar: data.excludeFromCalendar ?? false,
    excludeFromBudgets: data.excludeFromBudgets ?? false,
  }).returning();

  revalidatePath("/settings/exclusions");
  return { success: true, data: result[0] };
}

export async function updateExclusionRule(id: string, data: Partial<Omit<NewExclusionRule, "userId" | "id">>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.update(exclusionRules)
    .set({ ...data, updatedAt: new Date() })
    .where(and(
      eq(exclusionRules.id, id),
      eq(exclusionRules.userId, session.user.id)
    ));

  revalidatePath("/settings/exclusions");
  return { success: true };
}

export async function deleteExclusionRule(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(exclusionRules).where(and(
    eq(exclusionRules.id, id),
    eq(exclusionRules.userId, session.user.id)
  ));

  revalidatePath("/settings/exclusions");
  return { success: true };
}

export async function toggleExclusionRule(id: string, active: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.update(exclusionRules)
    .set({ active, updatedAt: new Date() })
    .where(and(
      eq(exclusionRules.id, id),
      eq(exclusionRules.userId, session.user.id)
    ));

  revalidatePath("/settings/exclusions");
  return { success: true };
}

// Get active exclusion rules for a specific screen
export async function getActiveExclusionsForScreen(screen: "dashboard" | "analytics" | "transactions" | "calendar" | "budgets") {
  const session = await auth();
  if (!session?.user?.id) return [];

  const allRules = await db.query.exclusionRules.findMany({
    where: and(
      eq(exclusionRules.userId, session.user.id),
      eq(exclusionRules.active, true)
    )
  });

  // Filter by screen
  return allRules.filter(rule => {
    switch (screen) {
      case "dashboard": return rule.excludeFromDashboard;
      case "analytics": return rule.excludeFromAnalytics;
      case "transactions": return rule.excludeFromTransactions;
      case "calendar": return rule.excludeFromCalendar;
      case "budgets": return rule.excludeFromBudgets;
      default: return false;
    }
  });
}
