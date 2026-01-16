"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureOpenCategory } from "@/lib/actions/setup-open";
import { randomUUID } from "crypto";

function dayOfMonth(date: Date) {
  return new Date(date).getUTCDate();
}

function mode(nums: number[]) {
  const counts = new Map<number, number>();
  for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);
  let best = nums[0] ?? 1;
  let bestCount = 0;
  for (const [n, c] of counts.entries()) {
    if (c > bestCount) {
      best = n;
      bestCount = c;
    }
  }
  return best;
}

export async function markRecurringGroup(input: {
  leafId: string;
  merchantKey: string;
  absAmount: number;
  confidence?: number; // 0..1
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const ensured = await ensureOpenCategory();
  if (!ensured.openLeafId) return { success: false as const, error: "OPEN taxonomy not initialized" };

  const absAmount = Math.round(Math.abs(Number(input.absAmount)) * 100) / 100;
  const merchantKey = (input.merchantKey || "").toString().slice(0, 50).toUpperCase().trim();
  if (!input.leafId || !merchantKey || !Number.isFinite(absAmount)) {
    return { success: false as const, error: "Invalid input" };
  }
  if (input.leafId === ensured.openLeafId) {
    return { success: false as const, error: "Recurring suggestions are only allowed for non-OPEN classifications" };
  }

  const tolerance = 0.01;
  const rows = await db
    .select({
      id: transactions.id,
      paymentDate: transactions.paymentDate,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.leafId, input.leafId),
        sql`${transactions.display} != 'no'`,
        sql`ABS(${transactions.amount}) BETWEEN ${absAmount - tolerance} AND ${absAmount + tolerance}`,
        sql`UPPER(COALESCE(${transactions.aliasDesc}, ${transactions.simpleDesc}, ${transactions.descNorm})) LIKE ${merchantKey + "%"}`
      )
    )
    .limit(1000);

  if (!rows.length) {
    return { success: false as const, error: "No matching transactions found for this group" };
  }

  const recurringGroupId = randomUUID();
  const days = rows.map((r) => dayOfMonth(r.paymentDate as any)).filter((d) => d >= 1 && d <= 31);
  const recurringDayOfMonth = days.length ? mode(days) : null;
  const recurringDayWindow = 3;

  await db
    .update(transactions)
    .set({
      recurringFlag: true,
      recurringGroupId,
      recurringConfidence: Math.max(0, Math.min(1, Number(input.confidence ?? 0.7))),
      recurringDayOfMonth,
      recurringDayWindow,
    })
    .where(inArray(transactions.id, rows.map((r) => r.id)));

  revalidatePath("/transactions");
  revalidatePath("/confirm");
  revalidatePath("/");

  return { success: true as const, updated: rows.length, recurringGroupId };
}
