"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, rules, aliasAssets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { categorizeTransaction, matchAlias } from "@/lib/rules/engine";

/**
 * Server action to apply categorization to all transactions
 */
export async function applyCategorization() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  try {
    // Get all active rules for the user
    const userRules = await db.query.rules.findMany({
      where: eq(rules.userId, session.user.id),
    });

    // Get all aliases for the user
    const userAliases = await db.query.aliasAssets.findMany({
      where: eq(aliasAssets.userId, session.user.id),
    });

    // Get all transactions
    const allTransactions = await db.query.transactions.findMany({
      where: eq(transactions.userId, session.user.id),
    });

    let categorized = 0;
    let needsReview = 0;

    // Apply categorization to each transaction
    for (const tx of allTransactions) {
      const result = categorizeTransaction(tx.descNorm, userRules);
      const aliasMatch = matchAlias(tx.descNorm, userAliases);

      if (result.category1 || aliasMatch) {
        await db.update(transactions)
          .set({
            category1: result.category1 || tx.category1, // Preserve if not new match? Or update if result found. Engine returns partial with undefined if no match?
            // Actually result always returns basic structure. If match, it has values.
            // But if categorization result is found, use it. If not, we might still want to set alias.
            ...(result.category1 ? {
                category1: result.category1,
                category2: result.category2 || null,
                category3: result.category3 || null,
                type: result.type,
                fixVar: result.fixVar,
                ruleIdApplied: result.ruleIdApplied || null,
                confidence: result.confidence || 0,
                needsReview: result.needsReview !== undefined ? result.needsReview : true,
                classifiedBy: result.ruleIdApplied ? 'AUTO_KEYWORDS' : 'MANUAL',
            } : {}),
            aliasDesc: aliasMatch ? aliasMatch.aliasDesc : tx.aliasDesc, 
          })
          .where(eq(transactions.id, tx.id));

        if (result.ruleIdApplied) {
          categorized++;
        }
        // Count alias application? Maybe not in "categorized" strict sense but good to know working.
      }


    }

    return {
      success: true,
      total: allTransactions.length,
      categorized,
      needsReview,
    };
  } catch (error: any) {
    console.error('Error applying categorization:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
