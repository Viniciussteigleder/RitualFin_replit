"use server";

import { db } from "@/lib/db";
import { transactions, accounts } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { auth } from "@/auth";

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
  type?: "Despesa" | "Receita";
  fixVar?: "Fixo" | "Variável";
  recurring?: boolean;
  category?: string;
  level1?: string;
  level2?: string;
  level3?: string;
}

export interface CategoryAggregate {
  category: string;
  total: number;
  count: number;
  percentage: number;
  color?: string;
}

export interface DrillDownData {
  currentLevel: "category" | "level1" | "level2" | "level3" | "transactions";
  breadcrumb: { label: string; value: string | null }[];
  aggregates: CategoryAggregate[];
  transactions?: any[];
  totalAmount: number;
}

export async function getAnalyticsData(
  filters: AnalyticsFilters = {}
): Promise<DrillDownData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Build WHERE conditions
  const conditions = [eq(transactions.userId, userId)];
  
  if (filters.startDate) {
    conditions.push(gte(transactions.paymentDate, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(transactions.paymentDate, filters.endDate));
  }
  if (filters.accountId) {
    conditions.push(eq(transactions.accountId, filters.accountId));
  }
  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type));
  }
  if (filters.fixVar) {
    conditions.push(eq(transactions.fixVar, filters.fixVar));
  }
  if (filters.recurring !== undefined) {
    conditions.push(eq(transactions.recurringFlag, filters.recurring));
  }


  // Determine current drill-down level and apply cumulative filters
  let currentLevel: DrillDownData["currentLevel"] = "category";
  const breadcrumb: DrillDownData["breadcrumb"] = [];

  // Apply filters cumulatively based on hierarchy
  if (filters.category) {
    conditions.push(sql`${transactions.category1} = ${filters.category}`);
    breadcrumb.push({ label: "Categoria", value: filters.category });
    currentLevel = "level1";
  }

  if (filters.level1) {
    conditions.push(eq(transactions.category2, filters.level1));
    breadcrumb.push({ label: "Nível 1", value: filters.level1 });
    currentLevel = "level2";
  }

  if (filters.level2) {
    conditions.push(eq(transactions.category3, filters.level2));
    breadcrumb.push({ label: "Nível 2", value: filters.level2 });
    currentLevel = "level3";
  }

  if (filters.level3) {
    conditions.push(
      sql`COALESCE(${transactions.aliasDesc}, ${transactions.descNorm}) = ${filters.level3}`
    );
    breadcrumb.push({ label: "Nível 3", value: filters.level3 });
    currentLevel = "transactions";
  }


  // Get total for percentage calculation
  const totalResult = await db
    .select({ total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)` })
    .from(transactions)
    .where(and(...conditions));

  const totalAmount = Number(totalResult[0]?.total || 0);

  // Aggregate based on current level
  let aggregates: CategoryAggregate[] = [];

  if (currentLevel === "category") {
    // Group by category1
    const results = await db
      .select({
        category: transactions.category1,
        total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(transactions.category1)
      .orderBy(desc(sql`COALESCE(SUM(ABS(${transactions.amount})), 0)`));

    aggregates = results.map((r) => ({
      category: r.category || "Sem Categoria",
      total: Number(r.total),
      count: Number(r.count),
      percentage: totalAmount > 0 ? (Number(r.total) / totalAmount) * 100 : 0,
    }));
  } else if (currentLevel === "level1") {
    // Group by category2 (L1)
    const results = await db
      .select({
        category: transactions.category2,
        total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(transactions.category2)
      .orderBy(desc(sql`COALESCE(SUM(ABS(${transactions.amount})), 0)`));

    aggregates = results.map((r) => ({
      category: r.category || "Sem Subcategoria",
      total: Number(r.total),
      count: Number(r.count),
      percentage: totalAmount > 0 ? (Number(r.total) / totalAmount) * 100 : 0,
    }));
  } else if (currentLevel === "level2") {
    // Group by category3 (L2)
    const results = await db
      .select({
        category: transactions.category3,
        total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(transactions.category3)
      .orderBy(desc(sql`COALESCE(SUM(ABS(${transactions.amount})), 0)`));

    aggregates = results.map((r) => ({
      category: r.category || "Sem Nível 2",
      total: Number(r.total),
      count: Number(r.count),
      percentage: totalAmount > 0 ? (Number(r.total) / totalAmount) * 100 : 0,
    }));
  } else if (currentLevel === "level3") {
    // Group by aliasDesc or descNorm (L3)
    const results = await db
      .select({
        category: sql<string>`COALESCE(${transactions.aliasDesc}, ${transactions.descNorm})`,
        total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(sql`COALESCE(${transactions.aliasDesc}, ${transactions.descNorm})`)
      .orderBy(desc(sql`COALESCE(SUM(ABS(${transactions.amount})), 0)`))
      .limit(50);

    aggregates = results.map((r) => ({
      category: r.category || "Sem Descrição",
      total: Number(r.total),
      count: Number(r.count),
      percentage: totalAmount > 0 ? (Number(r.total) / totalAmount) * 100 : 0,
    }));
  }

  // If at transaction level, fetch actual transactions
  let transactionsList;
  if (currentLevel === "transactions") {
    transactionsList = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.paymentDate))
      .limit(200);
  }

  return {
    currentLevel,
    breadcrumb,
    aggregates,
    transactions: transactionsList,
    totalAmount,
  };
}

export async function getAccounts() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, session.user.id))
    .orderBy(accounts.name);
}
