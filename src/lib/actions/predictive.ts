"use server";

import { db } from "@/lib/db";
import { transactions, budgets, calendarEvents } from "@/lib/db/schema";
import { eq, and, gte, lte, ne, sql, desc, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { startOfMonth, endOfMonth, differenceInDays, addMonths, format } from "date-fns";
import { getBudgetsWithSpent } from "./budgets";

export interface BurnRateInfo {
  category1: string;
  budgetAmount: number;
  spentSoFar: number;
  daysPassed: number;
  daysRemaining: number;
  dailyAverage: number;
  projectedEndAmount: number;
  burnRateStatus: "healthy" | "on-track" | "warning" | "overflow";
  projectedPercentage: number;
  daysUntilExhaustion: number | null;
}

/**
 * Calculates the current spending velocity (burn rate) for each budget category
 */
export async function getBudgetBurnRates(month?: string): Promise<BurnRateInfo[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const targetMonth = month || format(new Date(), "yyyy-MM");
  const budgetsWithSpent = await getBudgetsWithSpent(targetMonth);
  
  const now = new Date();
  const [year, monthNum] = targetMonth.split("-").map(Number);
  const start = startOfMonth(new Date(year, monthNum - 1));
  const end = endOfMonth(new Date(year, monthNum - 1));
  
  const totalDays = differenceInDays(end, start) + 1;
  const daysPassed = Math.min(totalDays, Math.max(1, differenceInDays(now, start)));
  const daysRemaining = totalDays - daysPassed;

  return budgetsWithSpent.map(b => {
    const dailyAverage = b.spent / daysPassed;
    const projectedEndAmount = dailyAverage * totalDays;
    const projectedPercentage = b.amount > 0 ? (projectedEndAmount / b.amount) * 100 : 0;
    
    let burnRateStatus: BurnRateInfo["burnRateStatus"] = "healthy";
    if (projectedPercentage > 100) burnRateStatus = "overflow";
    else if (projectedPercentage > 90) burnRateStatus = "warning";
    else if (projectedPercentage > 70) burnRateStatus = "on-track";

    const daysUntilExhaustion = projectedEndAmount > b.amount && dailyAverage > 0
      ? Math.max(0, Math.floor((b.amount - b.spent) / dailyAverage))
      : null;

    return {
      category1: b.category1,
      budgetAmount: b.amount,
      spentSoFar: b.spent,
      daysPassed,
      daysRemaining,
      dailyAverage,
      projectedEndAmount,
      burnRateStatus,
      projectedPercentage,
      daysUntilExhaustion
    };
  });
}

export interface RecurringPattern {
  descNorm: string;
  category1: string;
  averageAmount: number;
  frequency: "monthly" | "weekly" | "mixed";
  lastDate: Date;
  confidence: number;
  occurrenceCount: number;
  isAlreadyRecurring: boolean;
}

/**
 * Advanced pattern recognition to discover "Hidden Subscriptions" or recurring bills
 * that aren't yet in the calendar.
 */
export async function discoverRecurringPatterns(): Promise<RecurringPattern[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;
  const sixMonthsAgo = addMonths(new Date(), -6);

  // 1. Group transactions by normalized description and amount (approx)
  // We use a simplified grouping here since Drizzle sql is limited
  const candidates = await db.select({
    descNorm: transactions.descNorm,
    category1: transactions.category1,
    avgAmount: sql<number>`AVG(${transactions.amount})`,
    count: sql<number>`COUNT(*)`,
    minDate: sql<string>`MIN(${transactions.paymentDate})`,
    maxDate: sql<string>`MAX(${transactions.paymentDate})`,
  })
  .from(transactions)
  .where(and(
    eq(transactions.userId, userId),
    gte(transactions.paymentDate, sixMonthsAgo),
    ne(transactions.display, "no")
  ))
  .groupBy(transactions.descNorm, transactions.category1)
  .having(sql`COUNT(*) >= 3`)
  .orderBy(desc(sql`COUNT(*)`));

  // 2. Fetch existing recurring events to exclude them
  const existingEvents = await db.select({ name: calendarEvents.name })
    .from(calendarEvents)
    .where(eq(calendarEvents.userId, userId));
  
  const existingTitles = new Set(existingEvents.map(e => e.name.toLowerCase()));

  const patterns: RecurringPattern[] = [];

  for (const c of candidates) {
    if (!c.descNorm) continue;
    
    const isAlreadyRecurring = existingTitles.has(c.descNorm.toLowerCase());
    
    // Simple frequency detection based on count vs day range
    const firstDate = new Date(c.minDate);
    const lastDate = new Date(c.maxDate);
    const dayRange = differenceInDays(lastDate, firstDate);
    const count = Number(c.count);
    
    if (dayRange < 15 && count >= 3) continue; // Likely one-off burst

    const avgDaysBetween = dayRange / (count - 1);
    let frequency: RecurringPattern["frequency"] = "mixed";
    let confidence = 0.5;

    if (avgDaysBetween >= 25 && avgDaysBetween <= 35) {
      frequency = "monthly";
      confidence = 0.8;
    } else if (avgDaysBetween >= 6 && avgDaysBetween <= 8) {
      frequency = "weekly";
      confidence = 0.7;
    }

    patterns.push({
      descNorm: c.descNorm,
      category1: c.category1 || "Outros",
      averageAmount: Math.abs(Number(c.avgAmount)),
      frequency,
      lastDate,
      confidence,
      occurrenceCount: count,
      isAlreadyRecurring
    });
  }

  return patterns.filter(p => !p.isAlreadyRecurring && p.confidence > 0.6).slice(0, 10);
}
