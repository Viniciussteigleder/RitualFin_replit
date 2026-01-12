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
    // conditions.push(eq(transactions.accountId, filters.accountId)); // Removed from schema
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

  // Exclude Internal transfers from analytics as per spec
  conditions.push(sql`${transactions.category1} NOT IN ('Interno', 'Transferências')`);


  // Determine current drill-down level and apply cumulative filters
  let currentLevel: DrillDownData["currentLevel"] = "category";
  const breadcrumb: DrillDownData["breadcrumb"] = [];

  // Apply filters cumulatively based on taxonomy hierarchy
  if (filters.category) {
    if (filters.category === "OPEN") {
      conditions.push(sql`${transactions.leafId} IS NULL`);
    } else {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM taxonomy_leaf tl
        JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
        JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
        WHERE tl.leaf_id = ${transactions.leafId}
        AND t1.nivel_1_pt = ${filters.category}
      )`);
    }
    breadcrumb.push({ label: "Categoria", value: filters.category });
    currentLevel = "level1";
  }

  if (filters.level1) {
    if (filters.level1 === "OPEN") {
      conditions.push(sql`${transactions.leafId} IS NULL`);
    } else {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM taxonomy_leaf tl
        JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
        WHERE tl.leaf_id = ${transactions.leafId}
        AND t2.nivel_2_pt = ${filters.level1}
      )`);
    }
    breadcrumb.push({ label: "Nível 1", value: filters.level1 });
    currentLevel = "level2";
  }

  if (filters.level2) {
    if (filters.level2 === "OPEN") {
      conditions.push(sql`${transactions.leafId} IS NULL`);
    } else {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM taxonomy_leaf tl
        WHERE tl.leaf_id = ${transactions.leafId}
        AND tl.nivel_3_pt = ${filters.level2}
      )`);
    }
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
    .select({ total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)` })
    .from(transactions)
    .where(and(...conditions));

  const totalAmount = Number(totalResult[0]?.total || 0);

  // Aggregate based on current level
  let aggregates: CategoryAggregate[] = [];

  if (currentLevel === "category") {
    // Group by Level 1 from taxonomy
    const results = await db
      .select({
        category: sql<string>`COALESCE(t1.nivel_1_pt, 'OPEN')`,
        total: sql<number>`COALESCE(ABS(SUM(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .leftJoin(sql`taxonomy_leaf tl`, sql`${transactions.leafId} = tl.leaf_id`)
      .leftJoin(sql`taxonomy_level_2 t2`, sql`tl.level_2_id = t2.level_2_id`)
      .leftJoin(sql`taxonomy_level_1 t1`, sql`t2.level_1_id = t1.level_1_id`)
      .where(and(...conditions))
      .groupBy(sql`COALESCE(t1.nivel_1_pt, 'OPEN')`)
      .orderBy(desc(sql`COALESCE(ABS(SUM(${transactions.amount})), 0)`));

    aggregates = results.map((r) => ({
      category: r.category || "OPEN",
      total: Number(r.total),
      count: Number(r.count),
      percentage: totalAmount > 0 ? (Number(r.total) / totalAmount) * 100 : 0,
    }));
  } else if (currentLevel === "level1") {
    // Group by Level 2 from taxonomy
    const results = await db
      .select({
        category: sql<string>`COALESCE(t2.nivel_2_pt, 'OPEN')`,
        total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .leftJoin(sql`taxonomy_leaf tl`, sql`${transactions.leafId} = tl.leaf_id`)
      .leftJoin(sql`taxonomy_level_2 t2`, sql`tl.level_2_id = t2.level_2_id`)
      .leftJoin(sql`taxonomy_level_1 t1`, sql`t2.level_1_id = t1.level_1_id`)
      .where(and(...conditions))
      .groupBy(sql`COALESCE(t2.nivel_2_pt, 'OPEN')`)
      .orderBy(desc(sql`COALESCE(SUM(ABS(${transactions.amount})), 0)`));

    aggregates = results.map((r) => ({
      category: r.category || "OPEN",
      total: Number(r.total),
      count: Number(r.count),
      percentage: totalAmount > 0 ? (Number(r.total) / totalAmount) * 100 : 0,
    }));
  } else if (currentLevel === "level2") {
    // Group by Leaf from taxonomy
    const results = await db
      .select({
        category: sql<string>`COALESCE(tl.nivel_3_pt, 'OPEN')`,
        total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .leftJoin(sql`taxonomy_leaf tl`, sql`${transactions.leafId} = tl.leaf_id`)
      .where(and(...conditions))
      .groupBy(sql`COALESCE(tl.nivel_3_pt, 'OPEN')`)
      .orderBy(desc(sql`COALESCE(SUM(ABS(${transactions.amount})), 0)`));

    aggregates = results.map((r) => ({
      category: r.category || "OPEN",
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
