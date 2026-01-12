"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, rules, aliasAssets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { categorizeTransaction, matchAlias } from "@/lib/rules/engine";
import { ensureOpenCategory } from "@/lib/actions/setup-open";

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

    const { openLeafId } = await ensureOpenCategory();
    
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
            category1: result.category1 || tx.category1, 
            ...(result.category1 ? {
                category1: result.category1,
                category2: result.category2 || null,
                category3: result.category3 || null,
                type: result.type,
                fixVar: result.fixVar,
                ruleIdApplied: result.ruleIdApplied || null,
                leafId: result.leafId || null,
                confidence: result.confidence || 0,
                needsReview: result.needsReview !== undefined ? result.needsReview : true,
                classifiedBy: result.ruleIdApplied ? 'AUTO_KEYWORDS' : 'MANUAL',
            } : {}),
            aliasDesc: aliasMatch ? aliasMatch.aliasDesc : tx.aliasDesc, 
          })
          .where(eq(transactions.id, tx.id));

        if (result.ruleIdApplied) categorized++;
      } else {
         // NO MATCH FOUND - Use OPEN Category fallback
         // Only apply if transaction is not manually classified/reviewed
         if (tx.classifiedBy !== 'MANUAL' && (!tx.category1 || tx.category1 === 'Outros')) {
             await db.update(transactions)
                .set({
                    category1: "OPEN" as any, // Cast because we runtime-migrated the enum
                    category2: "OPEN",
                    category3: "OPEN", 
                    leafId: openLeafId,
                    ruleIdApplied: null,
                    confidence: 0,
                    needsReview: true,
                    classifiedBy: 'AUTO_KEYWORDS' // Use valid enum, confidence 0 indicates fallback
                })
                .where(eq(transactions.id, tx.id));
         }
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
