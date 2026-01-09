"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, rules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { categorizeTransaction } from "@/lib/rules/engine";

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

    // Get all transactions
    const allTransactions = await db.query.transactions.findMany({
      where: eq(transactions.userId, session.user.id),
    });

    let categorized = 0;
    let needsReview = 0;

    // Apply categorization to each transaction
    for (const tx of allTransactions) {
      const result = categorizeTransaction(tx.descNorm, userRules);

      if (result.category1) {
        await db.update(transactions)
          .set({
            category1: result.category1,
            category2: result.category2 || null,
            category3: result.category3 || null,
            type: result.type,
            fixVar: result.fixVar,
            ruleIdApplied: result.ruleIdApplied || null,
            confidence: result.confidence || 0,
            needsReview: result.needsReview !== undefined ? result.needsReview : true,
            classifiedBy: result.ruleIdApplied ? 'RULE' : 'MANUAL',
          })
          .where(eq(transactions.id, tx.id));

        if (result.ruleIdApplied) {
          categorized++;
        }

        if (result.needsReview) {
          needsReview++;
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
