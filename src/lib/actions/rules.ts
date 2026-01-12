"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, rules } from "@/lib/db/schema";
import { eq, and, sql, desc, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

  // Fetch uncategorized transactions
  // Note: This is a somewhat naive implementation. 
  // Ideally we'd use robust text analysis, but for now we'll do frequency analysis of tokens.
  const uncategorized = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.user.id),
      // We look for 'Outros' or null
      eq(transactions.category1, 'Outros')
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
 * Create a new official rule
 */
export async function createRule(data: {
  keyWords: string;
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
    await db.insert(rules).values({
      userId: session.user.id,
      keyWords: data.keyWords,
      category1: data.category1 as any, 
      category2: data.category2,
      category3: data.category3, // Added category3
      type: data.type || "Despesa",
      fixVar: data.fixVar || "Variável",
      active: true,
      priority: 950, 
      leafId: data.leafId || "open" // Use provided leafId
    });

    revalidatePath("/admin/rules");
    revalidatePath("/admin/import");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create rule:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all rules for the current user with app category information
 */
export async function getRules() {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Fetch rules with app category information via joins
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
      appCategoryId: sql<string | null>`app_category.app_cat_id`,
      appCategoryName: sql<string | null>`app_category.name`,
    })
    .from(rules)
    .leftJoin(
      sql`taxonomy_leaf`,
      sql`rules.leaf_id = taxonomy_leaf.leaf_id`
    )
    .leftJoin(
      sql`taxonomy_level_2`,
      sql`taxonomy_leaf.level_2_id = taxonomy_level_2.level_2_id`
    )
    .leftJoin(
      sql`taxonomy_level_1`,
      sql`taxonomy_level_2.level_1_id = taxonomy_level_1.level_1_id`
    )
    .leftJoin(
      sql`app_category_leaf`,
      sql`taxonomy_leaf.leaf_id = app_category_leaf.leaf_id`
    )
    .leftJoin(
      sql`app_category`,
      sql`app_category_leaf.app_cat_id = app_category.app_cat_id`
    )
    .where(eq(rules.userId, session.user.id))
    .orderBy(desc(rules.priority));

  return rulesData;
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
        for (const r of rulesData) {
            // Clean data
            // Clean data
            const payload = {
                userId: session.user.id,
                // name: r.name || r.Name || "Regra Importada",
                keyWords: r.keywords || r.Keywords || r.keyWords || "",
                category1: r.category1 || r.Category1 || "Outros",
                category2: r.category2 || r.Category2 || null,
                priority: parseInt(r.priority || r.Priority || "500"),
                active: r.active === true || r.active === "true" || r.Active === true,
                // ruleKey: r.ruleKey || r.RuleKey || `IMPORT_${Date.now()}_${Math.random()}`
                leafId: "open"
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
import { categorizeTransaction, AI_SEED_RULES } from "@/lib/rules/engine";

export async function reApplyAllRules() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // 1. Fetch all rules (Active and for this user)
  const userRules = await db.query.rules.findMany({ 
    where: and(eq(rules.userId, userId), eq(rules.active, true)) 
  });
  
  // Map seeds to expected format
  const seedRules = AI_SEED_RULES.map((r, i) => ({
    ...r,
    id: `seed-${i}`,
    userId: userId,
    // ruleKey: `SEED-${r.name}`,
    active: true,
    createdAt: new Date(),
    keyWords: r.keyWords,
    category2: r.category2 || null,
    category3: null
  } as any));

  const effectiveRules = [...userRules, ...seedRules];

  // 2. Fetch all transactions that don't have manualOverride
  const txs = await db.query.transactions.findMany({
    where: and(eq(transactions.userId, userId), eq(transactions.manualOverride, false))
  });

  // 3. Re-categorize each transaction
  let updatedCount = 0;
  for (const tx of txs) {
    const categorization = categorizeTransaction(tx.descNorm || tx.descRaw || "", effectiveRules);
    
    if (categorization.category1) {
      await db.update(transactions)
        .set({
           category1: categorization.category1,
           category2: categorization.category2 || null,
           category3: categorization.category3 || null,
           type: categorization.type as any,
           fixVar: categorization.fixVar as any,
           ruleIdApplied: categorization.ruleIdApplied && !categorization.ruleIdApplied.startsWith("seed-") ? categorization.ruleIdApplied : null,
           needsReview: categorization.needsReview,
           confidence: categorization.confidence
        })
        .where(eq(transactions.id, tx.id));
      updatedCount++;
    }
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/admin/rules");
  return { success: true, updatedCount };
}
