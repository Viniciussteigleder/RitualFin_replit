"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, taxonomyLeaf, taxonomyLevel2, taxonomyLevel1, appCategoryLeaf, appCategory, rules } from "@/lib/db/schema";
import { eq, and, sql, desc, inArray, ne, gte, lte } from "drizzle-orm";
import { ensureOpenCategory } from "@/lib/actions/setup-open";

export interface DiscoveryCandidate {
    description: string;
    count: number;
    sampleId: string;
    sampleDate: Date;
    sampleAmount: number;
    totalAbsAmount: number;
    lastSeen: Date;
    sampleKeyDesc: string | null;
    currentCategory1: string | null;
    currentAppCategory: string | null;
}

export interface TaxonomyOption {
    leafId: string;
    label: string; // "AppCat > Cat1 > Cat2 > Leaf"
    appCategory: string;
    category1: string;
    category2: string;
    category3: string; 
}

export type DiscoveryFilters = {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  minAbsAmount?: number;
  maxAbsAmount?: number;
  sortBy?: "count" | "totalAbsAmount" | "lastSeen";
  sortDir?: "asc" | "desc";
  limit?: number;
};

export async function getDiscoveryCandidates(filters: DiscoveryFilters = {}): Promise<DiscoveryCandidate[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const ensured = await ensureOpenCategory();
    if (!ensured.openLeafId) return [];

    const limit = Math.max(1, Math.min(200, Math.floor(filters.limit ?? 50)));

    // STRICT: Discovery only for truly unclassified (OPEN) cases.
    const conditions: any[] = [
      eq(transactions.userId, session.user.id),
      eq(transactions.leafId, ensured.openLeafId),
      sql`${transactions.display} != 'no'`,
    ];

    if (filters.dateFrom) {
      conditions.push(gte(transactions.paymentDate, new Date(`${filters.dateFrom}T00:00:00.000Z`)));
    }
    if (filters.dateTo) {
      conditions.push(lte(transactions.paymentDate, new Date(`${filters.dateTo}T23:59:59.999Z`)));
    }

    const txs = await db
      .select({
        descNorm: transactions.descNorm,
        descRaw: transactions.descRaw,
        id: transactions.id,
        date: transactions.paymentDate,
        amount: transactions.amount,
        keyDesc: transactions.keyDesc,
        cat1: transactions.category1,
        leafId: transactions.leafId,
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.paymentDate))
      .limit(2000);

    // Group by description to find frequency
    const grouped = new Map<string, DiscoveryCandidate>();

    for (const tx of txs) {
        // Use normalized description for grouping
        const key = (tx.descNorm || tx.descRaw || "Sem descrição").toUpperCase();
        const absAmount = Math.abs(Number(tx.amount));

        if (filters.minAbsAmount !== undefined && absAmount < filters.minAbsAmount) continue;
        if (filters.maxAbsAmount !== undefined && absAmount > filters.maxAbsAmount) continue;

        if (grouped.has(key)) {
            const existing = grouped.get(key)!;
            existing.count++;
            existing.totalAbsAmount += absAmount;
            if (tx.date > existing.lastSeen) existing.lastSeen = tx.date;
        } else {
            grouped.set(key, {
                description: key,
                count: 1,
                sampleId: tx.id,
                sampleDate: tx.date,
                sampleAmount: Number(tx.amount),
                totalAbsAmount: absAmount,
                lastSeen: tx.date,
                sampleKeyDesc: tx.keyDesc ?? null,
                currentCategory1: tx.cat1,
                currentAppCategory: null // Need join to get this, keeping simple for now
            });
        }
    }

    const sortBy = filters.sortBy ?? "count";
    const sortDir = filters.sortDir ?? "desc";
    const dir = sortDir === "asc" ? 1 : -1;

    const sorted = Array.from(grouped.values()).sort((a, b) => {
      if (sortBy === "count") return dir * (a.count - b.count);
      if (sortBy === "totalAbsAmount") return dir * (a.totalAbsAmount - b.totalAbsAmount);
      return dir * (a.lastSeen.getTime() - b.lastSeen.getTime());
    });

    return sorted.slice(0, limit);
}

export async function getTaxonomyOptions(): Promise<TaxonomyOption[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const rows = await db
        .select({
            leafId: taxonomyLeaf.leafId,
            leafName: taxonomyLeaf.nivel3Pt, 
            level2Name: taxonomyLevel2.nivel2Pt, 
            level1Name: taxonomyLevel1.nivel1Pt, 
            appCategoryName: appCategory.name,
        })
        .from(taxonomyLeaf)
        .leftJoin(taxonomyLevel2, eq(taxonomyLeaf.level2Id, taxonomyLevel2.level2Id))
        .leftJoin(taxonomyLevel1, eq(taxonomyLevel2.level1Id, taxonomyLevel1.level1Id))
        // Join App Category - this is critical for the "AppCat > Cat1" logic
        .leftJoin(appCategoryLeaf, and(eq(taxonomyLeaf.leafId, appCategoryLeaf.leafId), eq(appCategoryLeaf.userId, session.user.id)))
        .leftJoin(appCategory, and(eq(appCategoryLeaf.appCatId, appCategory.appCatId), eq(appCategory.userId, session.user.id)))
        .where(eq(taxonomyLeaf.userId, session.user.id));
    
    // Transform to options
    return rows.map(r => ({
        leafId: r.leafId,
        label: `${r.appCategoryName || 'OPEN'} > ${r.level1Name} > ${r.level2Name} > ${r.leafName}`,
        appCategory: r.appCategoryName || 'OPEN',
        category1: r.level1Name || 'OPEN',
        category2: r.level2Name || 'OPEN',
        category3: r.leafName || 'OPEN'
    })).sort((a, b) => a.label.localeCompare(b.label));
}

export type ConflictFilters = {
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "date" | "absAmount";
  sortDir?: "asc" | "desc";
  limit?: number;
};

export interface ConflictTransaction {
  id: string;
  paymentDate: Date;
  amount: number;
  descRaw: string;
  descNorm: string;
  aliasDesc: string | null;
  simpleDesc: string | null;
  keyDesc: string | null;
  classificationCandidates: Array<{
    leafId: string;
    ruleId: string;
    matchedKeyword: string | null;
    priority: number;
    strict: boolean;
    appCategoryName: string | null;
    category1: string;
    category2: string;
    category3: string;
    ruleKeyWords: string | null;
    ruleKeyWordsNegative: string | null;
  }>;
}

export async function getConflictTransactions(filters: ConflictFilters = {}): Promise<ConflictTransaction[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const limit = Math.max(1, Math.min(200, Math.floor(filters.limit ?? 50)));
  const sortBy = filters.sortBy ?? "date";
  const sortDir = filters.sortDir ?? "desc";

  const conditions: any[] = [
    eq(transactions.userId, session.user.id),
    eq(transactions.conflictFlag, true),
    sql`${transactions.display} != 'no'`,
  ];
  if (filters.dateFrom) conditions.push(gte(transactions.paymentDate, new Date(`${filters.dateFrom}T00:00:00.000Z`)));
  if (filters.dateTo) conditions.push(lte(transactions.paymentDate, new Date(`${filters.dateTo}T23:59:59.999Z`)));

  const rows = await db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: (t, { desc, asc }) =>
      sortBy === "absAmount"
        ? [sortDir === "desc" ? desc(sql`ABS(${t.amount})`) : asc(sql`ABS(${t.amount})`)]
        : [sortDir === "desc" ? desc(t.paymentDate) : asc(t.paymentDate)],
    columns: {
      id: true,
      paymentDate: true,
      amount: true,
      descRaw: true,
      descNorm: true,
      aliasDesc: true,
      simpleDesc: true,
      keyDesc: true,
      classificationCandidates: true,
    },
    limit,
  });

  const allRuleIds: string[] = [];
  for (const r of rows) {
    const candidates = Array.isArray(r.classificationCandidates) ? (r.classificationCandidates as any[]) : [];
    for (const c of candidates) {
      if (c?.ruleId) allRuleIds.push(String(c.ruleId));
    }
  }
  const uniqueRuleIds = Array.from(new Set(allRuleIds));

  const rulesById = new Map<string, { keyWords: string | null; keyWordsNegative: string | null }>();
  if (uniqueRuleIds.length) {
    const rs = await db
      .select({ id: rules.id, keyWords: rules.keyWords, keyWordsNegative: rules.keyWordsNegative })
      .from(rules)
      .where(inArray(rules.id, uniqueRuleIds));
    for (const r of rs) rulesById.set(r.id, { keyWords: r.keyWords ?? null, keyWordsNegative: r.keyWordsNegative ?? null });
  }

  return rows.map((tx) => {
    const candidates = Array.isArray(tx.classificationCandidates) ? (tx.classificationCandidates as any[]) : [];
    return {
      id: tx.id,
      paymentDate: tx.paymentDate as any,
      amount: Number(tx.amount),
      descRaw: tx.descRaw,
      descNorm: tx.descNorm,
      aliasDesc: tx.aliasDesc ?? null,
      simpleDesc: tx.simpleDesc ?? null,
      keyDesc: tx.keyDesc ?? null,
      classificationCandidates: candidates.map((c) => ({
        leafId: String(c.leafId),
        ruleId: String(c.ruleId),
        matchedKeyword: c.matchedKeyword ? String(c.matchedKeyword) : null,
        priority: Number(c.priority ?? 0),
        strict: Boolean(c.strict),
        appCategoryName: c.appCategoryName ? String(c.appCategoryName) : null,
        category1: String(c.category1),
        category2: String(c.category2),
        category3: String(c.category3),
        ruleKeyWords: rulesById.get(String(c.ruleId))?.keyWords ?? null,
        ruleKeyWordsNegative: rulesById.get(String(c.ruleId))?.keyWordsNegative ?? null,
      })),
    } satisfies ConflictTransaction;
  });
}

export type RecurringFilters = {
  dateFrom?: string;
  dateTo?: string;
  minOccurrences?: number;
  sortBy?: "occurrences" | "absAmount";
  sortDir?: "asc" | "desc";
  limit?: number;
};

export interface RecurringSuggestion {
  key: string;
  leafId: string;
  merchantKey: string;
  source: string | null;
  direction: "Despesa" | "Receita";
  appCategoryName: string;
  category1: string;
  category2: string;
  category3: string;
  absAmount: number;
  occurrences: number;
  sampleDate: Date;
  sampleKeyDesc: string | null;
  suggestedCadence: "monthly" | "quarterly" | "yearly" | "weekly" | "unknown";
  expectedDayOfMonth: number | null;
  expectedMonths: number[]; // 1..12, used for quarterly/yearly
  confidence: number; // 0..1
}

function modeNumber(nums: number[]) {
  const counts = new Map<number, number>();
  for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);
  let best = nums[0] ?? 0;
  let bestCount = 0;
  for (const [n, c] of counts.entries()) {
    if (c > bestCount) {
      best = n;
      bestCount = c;
    }
  }
  return best;
}

function modeString(values: string[]) {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [v, c] of counts.entries()) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

function cadenceFromDates(dates: Date[]) {
  if (dates.length < 3) {
    return { cadence: "unknown" as const, confidence: 0, expectedDayOfMonth: null as number | null, expectedMonths: [] as number[] };
  }

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const deltas = sorted.slice(1).map((d, i) => (d.getTime() - sorted[i]!.getTime()) / (1000 * 60 * 60 * 24));
  const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const variance = deltas.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / deltas.length;
  const stdev = Math.sqrt(variance);

  const days = sorted.map((d) => d.getUTCDate()).filter((n) => n >= 1 && n <= 31);
  const expectedDayOfMonth = days.length ? modeNumber(days) : null;

  const months = sorted.map((d) => d.getUTCMonth() + 1).filter((n) => n >= 1 && n <= 12);
  const uniqueMonths = Array.from(new Set(months)).sort((a, b) => a - b);

  const closeTo = (target: number, tolerance: number) => Math.abs(avg - target) <= tolerance;
  if (closeTo(7, 2)) {
    const confidence = Math.max(0, Math.min(1, 1 - stdev / 4));
    return { cadence: "weekly" as const, confidence, expectedDayOfMonth: null, expectedMonths: [] };
  }
  if (closeTo(30, 6)) {
    const confidence = Math.max(0, Math.min(1, 1 - stdev / 10));
    return { cadence: "monthly" as const, confidence, expectedDayOfMonth, expectedMonths: [] };
  }
  if (closeTo(91, 18)) {
    // Quarterly: infer "anchor" months by month%3
    const mods = months.map((m) => m % 3);
    const anchorMod = modeNumber(mods);
    const expectedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((m) => m % 3 === anchorMod);
    const confidence = Math.max(0, Math.min(1, 1 - stdev / 25));
    return { cadence: "quarterly" as const, confidence, expectedDayOfMonth, expectedMonths };
  }
  if (closeTo(365, 45)) {
    // Yearly: pick the most frequent month
    const expectedMonth = months.length ? modeNumber(months) : null;
    const confidence = Math.max(0, Math.min(1, 1 - stdev / 70));
    return { cadence: "yearly" as const, confidence, expectedDayOfMonth, expectedMonths: expectedMonth ? [expectedMonth] : uniqueMonths };
  }

  return {
    cadence: "unknown" as const,
    confidence: Math.max(0, Math.min(0.6, 1 - stdev / 30)),
    expectedDayOfMonth,
    expectedMonths: uniqueMonths,
  };
}

export async function getRecurringSuggestions(filters: RecurringFilters = {}): Promise<RecurringSuggestion[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const ensured = await ensureOpenCategory();
  if (!ensured.openLeafId) return [];

  const limit = Math.max(1, Math.min(200, Math.floor(filters.limit ?? 50)));
  const minOccurrences = Math.max(3, Math.min(24, Math.floor(filters.minOccurrences ?? 3)));
  const sortBy = filters.sortBy ?? "occurrences";
  const sortDir = filters.sortDir ?? "desc";
  const dir = sortDir === "asc" ? 1 : -1;

  const conditions: any[] = [
    eq(transactions.userId, session.user.id),
    ne(transactions.leafId, ensured.openLeafId),
    sql`${transactions.display} != 'no'`,
  ];
  if (filters.dateFrom) conditions.push(gte(transactions.paymentDate, new Date(`${filters.dateFrom}T00:00:00.000Z`)));
  if (filters.dateTo) conditions.push(lte(transactions.paymentDate, new Date(`${filters.dateTo}T23:59:59.999Z`)));

  const rows = await db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: (t, { desc }) => [desc(t.paymentDate)],
    columns: {
      id: true,
      paymentDate: true,
      amount: true,
      type: true,
      leafId: true,
      source: true,
      keyDesc: true,
      aliasDesc: true,
      simpleDesc: true,
      descNorm: true,
      appCategoryName: true,
      category1: true,
      category2: true,
      category3: true,
    },
    limit: 5000,
  });

  const groupKeyFor = (tx: any) => {
    const merchant = (tx.aliasDesc || tx.simpleDesc || tx.descNorm || "").toString().slice(0, 50).toUpperCase();
    const abs = Math.round(Math.abs(Number(tx.amount)) * 100) / 100;
    const direction = (tx.type || (Number(tx.amount) < 0 ? "Despesa" : "Receita")).toString();
    return `${tx.leafId}|${direction}|${abs}|${merchant}`;
  };

  const groups = new Map<string, { meta: any; dates: Date[]; sources: string[] }>();
  for (const tx of rows) {
    if (!tx.leafId) continue;
    const key = groupKeyFor(tx);
    const existing = groups.get(key);
    if (existing) {
      existing.dates.push(new Date(tx.paymentDate as any));
      if (tx.source) existing.sources.push(String(tx.source));
    } else {
      groups.set(key, {
        meta: tx,
        dates: [new Date(tx.paymentDate as any)],
        sources: tx.source ? [String(tx.source)] : [],
      });
    }
  }

  const suggestions: RecurringSuggestion[] = [];
  for (const [key, g] of groups.entries()) {
    if (g.dates.length < minOccurrences) continue;
    const absAmount = Math.round(Math.abs(Number(g.meta.amount)) * 100) / 100;
    const merchantKey = (g.meta.aliasDesc || g.meta.simpleDesc || g.meta.descNorm || "")
      .toString()
      .slice(0, 50)
      .toUpperCase();
    const cadence = cadenceFromDates(g.dates);
    const sourceLabel = modeString(g.sources);
    const direction = (g.meta.type || (Number(g.meta.amount) < 0 ? "Despesa" : "Receita")) as "Despesa" | "Receita";

    suggestions.push({
      key,
      leafId: String(g.meta.leafId),
      merchantKey,
      source: sourceLabel,
      direction,
      appCategoryName: g.meta.appCategoryName || "OPEN",
      category1: g.meta.category1 || "OPEN",
      category2: g.meta.category2 || "OPEN",
      category3: g.meta.category3 || "OPEN",
      absAmount,
      occurrences: g.dates.length,
      sampleDate: g.dates.sort((a, b) => b.getTime() - a.getTime())[0]!,
      sampleKeyDesc: g.meta.keyDesc ?? null,
      suggestedCadence: cadence.cadence,
      expectedDayOfMonth: cadence.expectedDayOfMonth,
      expectedMonths: cadence.expectedMonths,
      confidence: cadence.confidence,
    });
  }

  const sorted = suggestions.sort((a, b) => {
    if (sortBy === "absAmount") return dir * (a.absAmount - b.absAmount);
    return dir * (a.occurrences - b.occurrences);
  });

  return sorted.slice(0, limit);
}
