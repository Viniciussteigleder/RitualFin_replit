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
  name: string;
  keywords: string;
  category1: string;
  category2?: string;
  type?: "Receita" | "Despesa";
  fixVar?: "Fixo" | "Variável";
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  try {
    await db.insert(rules).values({
      userId: session.user.id,
      name: data.name,
      keywords: data.keywords,
      category1: data.category1 as any, // Enum cast
      category2: data.category2,
      type: data.type || "Despesa",
      fixVar: data.fixVar || "Variável",
      active: true,
      priority: 950, // User rules have high priority
      ruleKey: `AUTO_${Date.now()}` // Unique key
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
 * Get all rules for the current user
 */
export async function getRules() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.query.rules.findMany({
    where: eq(rules.userId, session.user.id),
    orderBy: [desc(rules.priority)]
  });
}
