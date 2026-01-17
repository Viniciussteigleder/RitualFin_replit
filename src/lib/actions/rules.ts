"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, rules } from "@/lib/db/schema";
import { eq, and, desc, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureOpenCategory } from "@/lib/actions/setup-open";
import { buildLeafHierarchyMaps, taxonomyPathKey } from "@/lib/taxonomy/hierarchy";
import { applyCategorizationCore } from "@/lib/actions/categorization";

export interface RuleProposal {
  token: string;
  count: number;
  sampleDescription: string;
}

export interface SimulationResult {
  matchedCount: number;
  samples: {
    id: string;
    date: Date;
    description: string;
    amount: string;
    currentCategory: string | null;
  }[];
}

/**
 * access the database to find frequent words in uncategorized transactions
 */
export async function getRuleSuggestions(limit: number = 10): Promise<RuleProposal[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const ensured = await ensureOpenCategory();
  if (!ensured.openLeafId) return [];

  // Fetch uncategorized (OPEN) transactions
  // Note: This is a somewhat naive implementation. 
  // Ideally we'd use robust text analysis, but for now we'll do frequency analysis of tokens.
  const uncategorized = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.user.id),
      eq(transactions.leafId, ensured.openLeafId)
    ),
    limit: 500 // Limit sample size for performance
  });

  const wordCounts = new Map<string, { count: number; sample: string }>();
  const commonStopWords = new Set(['DE', 'DA', 'DO', 'EM', 'NO', 'NA', 'PAYPAL', 'VISA', 'CARD', 'EC', 'SEPA', 'UEBERWEISUNG', 'LASTSCHRIFT']);

  uncategorized.forEach(tx => {
    // Basic normalization
    const cleanDesc = (tx.descNorm || tx.descRaw || "")
      .toUpperCase()
      .replace(/[0-9]/g, '') // remove numbers
      .replace(/[^A-Z\s]/g, ' ') // remove special chars
      .replace(/\s+/g, ' ')
      .trim();

    const words = cleanDesc.split(' ');

    words.forEach(word => {
      if (word.length < 3) return; // Skip short words
      if (commonStopWords.has(word)) return;

      const current = wordCounts.get(word) || { count: 0, sample: tx.descNorm || tx.descRaw || "" };
      wordCounts.set(word, { count: current.count + 1, sample: current.sample });
    });
  });

  // Sort by frequency
  const proposals = Array.from(wordCounts.entries())
    .map(([token, data]) => ({
      token,
      count: data.count,
      sampleDescription: data.sample
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return proposals;
}

/**
 * Simulate a rule to see what it would catch
 */
export async function simulateRule(keyword: string): Promise<SimulationResult> {
  const session = await auth();
  if (!session?.user?.id) return { matchedCount: 0, samples: [] };

  if (!keyword || keyword.trim().length === 0) return { matchedCount: 0, samples: [] };

  // normalized simple ILIKE search
  const matches = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.user.id),
      // We search in descNorm
      like(transactions.descNorm, `%${keyword.toLowerCase()}%`)
    ),
    limit: 50, // Get up to 50 samples
    orderBy: [desc(transactions.paymentDate)]
  });

  return {
    matchedCount: matches.length, // This is count of fetched, not total. For total we'd need count() query. 
    // For UI "Preview", 50 is enough. If we hit 50, UI can say "50+ matches".
    samples: matches.map(tx => ({
      id: tx.id,
      date: new Date(tx.paymentDate),
      description: tx.descNorm || tx.descRaw || "No description",
      amount: tx.amount.toString(),
      currentCategory: tx.category1
    }))
  };
}

/**
 * Create a new official rule or merge keywords into existing rule with same leafId
 * Goal: One rule per category3 (leafId) with all keywords combined
 */
export async function createRule(data: {
  keyWords: string;
  keyWordsNegative?: string;
  category1: string;
  category2?: string;
  category3?: string;
  leafId?: string;
  type?: "Receita" | "Despesa";
  fixVar?: "Fixo" | "Variável";
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  try {
    const ensured = await ensureOpenCategory();
    if (!ensured.openLeafId) throw new Error("OPEN taxonomy not initialized");

    const effectiveLeafId = !data.leafId || data.leafId === "open" ? ensured.openLeafId : data.leafId;

    const { byLeafId } = await buildLeafHierarchyMaps(session.user.id);
    const hierarchy = byLeafId.get(effectiveLeafId);
    if (!hierarchy) throw new Error("Invalid leafId (not found in taxonomy)");

    // Check if a rule with same leafId already exists for this user
    const existingRule = await db.query.rules.findFirst({
      where: and(
        eq(rules.userId, session.user.id),
        eq(rules.leafId, effectiveLeafId),
        eq(rules.active, true)
      )
    });

    if (existingRule) {
      // Merge keywords into existing rule
      const existingKeywords = existingRule.keyWords?.split(";").map(k => k.trim().toUpperCase()).filter(k => k) || [];
      const newKeywords = data.keyWords.split(";").map(k => k.trim().toUpperCase()).filter(k => k);

      // Combine and deduplicate keywords
      const combinedKeywords = [...new Set([...existingKeywords, ...newKeywords])].join("; ");

      // Merge negative keywords if provided
      let combinedNegativeKeywords = existingRule.keyWordsNegative || "";
      if (data.keyWordsNegative) {
        const existingNegative = existingRule.keyWordsNegative?.split(";").map(k => k.trim().toUpperCase()).filter(k => k) || [];
        const newNegative = data.keyWordsNegative.split(";").map(k => k.trim().toUpperCase()).filter(k => k);
        combinedNegativeKeywords = [...new Set([...existingNegative, ...newNegative])].join("; ");
      }

      await db.update(rules)
        .set({
          keyWords: combinedKeywords,
          keyWordsNegative: combinedNegativeKeywords || null,
          category1: hierarchy.category1 as any,
          category2: hierarchy.category2,
          category3: hierarchy.category3,
        })
        .where(eq(rules.id, existingRule.id));

      revalidatePath("/settings/rules");
      revalidatePath("/confirm");
      revalidatePath("/transactions");

      return { success: true, merged: true, ruleId: existingRule.id };
    }

    // No existing rule, create new one
    const [newRule] = await db.insert(rules).values({
      userId: session.user.id,
      keyWords: data.keyWords.toUpperCase(),
      keyWordsNegative: data.keyWordsNegative?.toUpperCase() || null,
      category1: hierarchy.category1 as any,
      category2: hierarchy.category2,
      category3: hierarchy.category3,
      type: data.type || hierarchy.typeDefault || "Despesa",
      fixVar: data.fixVar || hierarchy.fixVarDefault || "Variável",
      active: true,
      priority: 950,
      leafId: effectiveLeafId
    }).returning({ id: rules.id });

    revalidatePath("/settings/rules");
    revalidatePath("/confirm");
    revalidatePath("/transactions");

    return { success: true, merged: false, ruleId: newRule.id };
  } catch (error: any) {
    console.error("Failed to create rule:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Merge keyword additions into an existing rule by rule id (no new rows).
 * Used for conflict-resolution workflows.
 */
export async function mergeRuleKeywordsById(input: {
  ruleId: string;
  addKeyWords?: string | null;
  addKeyWordsNegative?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Not authenticated" };

  const rule = await db.query.rules.findFirst({
    where: and(eq(rules.userId, session.user.id), eq(rules.id, input.ruleId)),
  });
  if (!rule) return { success: false as const, error: "Rule not found" };

  const merge = (existing: string | null, addition: string | null | undefined) => {
    const a = addition
      ? addition
          .split(";")
          .map((k) => k.trim().toUpperCase())
          .filter(Boolean)
      : [];
    const e = existing
      ? existing
          .split(";")
          .map((k) => k.trim().toUpperCase())
          .filter(Boolean)
      : [];
    return [...new Set([...e, ...a])].join("; ") || null;
  };

  const nextKeyWords = merge(rule.keyWords ?? null, input.addKeyWords);
  const nextNeg = merge(rule.keyWordsNegative ?? null, input.addKeyWordsNegative);

  await db
    .update(rules)
    .set({
      keyWords: nextKeyWords,
      keyWordsNegative: nextNeg,
    })
    .where(eq(rules.id, rule.id));

  revalidatePath("/settings/rules");
  revalidatePath("/confirm");
  revalidatePath("/transactions");

  return { success: true as const };
}

/**
 * Get all rules for the current user with app category information
 */
export async function getRules() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const ensured = await ensureOpenCategory();
  if (!ensured.openLeafId) return [];

  const { byLeafId: taxonomyByLeafId, byPathKey: taxonomyByPathKey } = await buildLeafHierarchyMaps(session.user.id);
  const openLeafId = ensured.openLeafId;
  const openHierarchy = taxonomyByLeafId.get(openLeafId);
  if (!openHierarchy) return [];

  const rulesData = await db
    .select({
      id: rules.id,
      userId: rules.userId,
      type: rules.type,
      fixVar: rules.fixVar,
      category1: rules.category1,
      category2: rules.category2,
      category3: rules.category3,
      priority: rules.priority,
      strict: rules.strict,
      isSystem: rules.isSystem,
      leafId: rules.leafId,
      keyWords: rules.keyWords,
      keyWordsNegative: rules.keyWordsNegative,
      active: rules.active,
      createdAt: rules.createdAt,
    })
    .from(rules)
    .where(eq(rules.userId, session.user.id))
    .orderBy(desc(rules.priority));

  return rulesData.map((r) => {
    const directLeafId = r.leafId && r.leafId !== "open" ? r.leafId : null;
    const pathLeafId =
      !directLeafId && r.category1 && r.category2 && r.category3
        ? taxonomyByPathKey.get(
            taxonomyPathKey({ category1: r.category1, category2: r.category2, category3: r.category3 })
          ) ?? null
        : null;

    const effectiveLeafId = directLeafId ?? pathLeafId ?? openLeafId;
    const hierarchy = taxonomyByLeafId.get(effectiveLeafId) ?? openHierarchy;

    return {
      ...r,
      appCategoryId: hierarchy.appCategoryId,
      appCategoryName: hierarchy.appCategoryName ?? "OPEN",
    };
  });
}

export async function updateRule(id: string, data: Partial<typeof rules.$inferInsert>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
     const toUpdate: any = { ...data };
     delete toUpdate.id; // Prevent ID update
     delete toUpdate.userId; // Prevent owner update

     await db.update(rules)
       .set(toUpdate)
       .where(and(eq(rules.id, id), eq(rules.userId, session.user.id)));

     revalidatePath("/rules");
     return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRule(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await db.delete(rules)
      .where(and(eq(rules.id, id), eq(rules.userId, session.user.id)));
    
    revalidatePath("/rules");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertRules(rulesData: any[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    let count = 0;
    try {
        const ensured = await ensureOpenCategory();
        if (!ensured.openLeafId) throw new Error("OPEN taxonomy not initialized");

        const { byLeafId: taxonomyByLeafId, byPathKey: taxonomyByPathKey } = await buildLeafHierarchyMaps(session.user.id);
        const openLeafId = ensured.openLeafId;
        const openHierarchy = taxonomyByLeafId.get(openLeafId);
        if (!openHierarchy) throw new Error("OPEN leaf exists but was not found in taxonomy lookup");

        for (const r of rulesData) {
            const rawCat1 = r.category1 || r.Category1 || null;
            const rawCat2 = r.category2 || r.Category2 || null;
            const rawCat3 = r.category3 || r.Category3 || null;

            const directLeafId = typeof r.leafId === "string" && r.leafId.length > 10 ? r.leafId : null;
            const pathLeafId =
              !directLeafId && rawCat1 && rawCat2 && rawCat3
                ? taxonomyByPathKey.get(
                    taxonomyPathKey({ category1: rawCat1, category2: rawCat2, category3: rawCat3 })
                  ) ?? null
                : null;

            const leafId = directLeafId ?? pathLeafId ?? openLeafId;
            const hierarchy = taxonomyByLeafId.get(leafId) ?? openHierarchy;

            const payload = {
              userId: session.user.id,
              keyWords: r.keywords || r.Keywords || r.keyWords || "",
              keyWordsNegative: r.keyWordsNegative || r.KeyWordsNegative || r.keyWords_negative || null,
              type: r.type || r.Type || hierarchy.typeDefault || "Despesa",
              fixVar: r.fixVar || r.FixVar || hierarchy.fixVarDefault || "Variável",
              category1: hierarchy.category1 as any,
              category2: hierarchy.category2,
              category3: hierarchy.category3,
              priority: parseInt(r.priority || r.Priority || "500"),
              active: r.active === true || r.active === "true" || r.Active === true,
              strict: Boolean(r.strict ?? r.Strict ?? false),
              isSystem: Boolean(r.isSystem ?? r.IsSystem ?? false),
              leafId,
            };

            // If ID exists and is valid UUID, try update, else insert
            if (r.id && r.id.length > 10) {
                 await db.update(rules)
                    .set(payload as any)
                    .where(and(eq(rules.id, r.id), eq(rules.userId, session.user.id)));
            } else {
                 await db.insert(rules).values(payload as any);
            }
            count++;
        }
        revalidatePath("/rules");
        return { success: true, count };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}
export async function reApplyAllRules() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const res = await applyCategorizationCore(session.user.id);

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/admin/rules");
  return res;
}

/**
 * Consolidate duplicate rules with same leafId
 * Merges all keywords into a single rule per leafId and deletes duplicates
 */
export async function consolidateDuplicateRules() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  try {
    // Get all active rules for user
    const allRules = await db.query.rules.findMany({
      where: and(eq(rules.userId, userId), eq(rules.active, true))
    });

    // Group rules by leafId
    const rulesByLeafId = new Map<string, typeof allRules>();
    for (const rule of allRules) {
      if (!rule.leafId) continue;
      const existing = rulesByLeafId.get(rule.leafId) || [];
      existing.push(rule);
      rulesByLeafId.set(rule.leafId, existing);
    }

    let mergedCount = 0;
    let deletedCount = 0;

    // Process each leafId group
    for (const [leafId, rulesGroup] of rulesByLeafId.entries()) {
      if (rulesGroup.length <= 1) continue; // No duplicates

      // Keep the first rule (oldest by createdAt or first in array)
      const keepRule = rulesGroup.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0];
      const duplicates = rulesGroup.slice(1);

      // Merge all keywords from duplicates into the keep rule
      const allKeywords = new Set<string>();
      const allNegativeKeywords = new Set<string>();

      for (const rule of rulesGroup) {
        if (rule.keyWords) {
          rule.keyWords.split(";").forEach(k => {
            const kw = k.trim().toUpperCase();
            if (kw) allKeywords.add(kw);
          });
        }
        if (rule.keyWordsNegative) {
          rule.keyWordsNegative.split(";").forEach(k => {
            const kw = k.trim().toUpperCase();
            if (kw) allNegativeKeywords.add(kw);
          });
        }
      }

      // Update the kept rule with merged keywords
      await db.update(rules)
        .set({
          keyWords: [...allKeywords].join("; "),
          keyWordsNegative: allNegativeKeywords.size > 0 ? [...allNegativeKeywords].join("; ") : null,
        })
        .where(eq(rules.id, keepRule.id));

      // Delete duplicate rules
      for (const dup of duplicates) {
        await db.delete(rules).where(eq(rules.id, dup.id));
        deletedCount++;
      }

      mergedCount++;
    }

    revalidatePath("/settings/rules");
    revalidatePath("/confirm");
    revalidatePath("/transactions");

    return {
      success: true,
      mergedCount,
      deletedCount,
      message: `Consolidated ${mergedCount} rule groups, deleted ${deletedCount} duplicate rules`
    };
  } catch (error: any) {
    console.error("Failed to consolidate rules:", error);
    return { success: false, error: error.message };
  }
}
