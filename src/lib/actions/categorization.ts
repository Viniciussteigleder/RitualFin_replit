"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, rules, aliasAssets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { categorizeTransaction, matchAlias } from "@/lib/rules/engine";
import { ensureOpenCategoryCore } from "@/lib/actions/setup-open";
import { buildLeafHierarchyMaps } from "@/lib/taxonomy/hierarchy";
import { resolveLeafFromMatches } from "@/lib/rules/leaf-resolution";

/**
 * Server action to apply categorization to all transactions
 */
export async function applyCategorizationCore(userId: string) {
  try {
    // Get all active rules for the user
    const userRules = await db.query.rules.findMany({
      where: eq(rules.userId, userId),
    });

    // Get all aliases for the user
    const userAliases = await db.query.aliasAssets.findMany({
      where: eq(aliasAssets.userId, userId),
    });

    const ensured = await ensureOpenCategoryCore(userId);
    const openLeafId = ensured.openLeafId;
    if (!openLeafId) {
      return { success: false, error: "OPEN leafId not available" };
    }

    const { byLeafId: taxonomyByLeafId, byPathKey: taxonomyByPathKey } = await buildLeafHierarchyMaps(userId);
    const openHierarchy = taxonomyByLeafId.get(openLeafId);
    if (!openHierarchy) {
      return { success: false, error: "OPEN leaf exists but was not found in taxonomy lookup" };
    }
    
    // Get all transactions
    const allTransactions = await db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
    });

    let categorized = 0;
    let needsReview = 0;

    // Apply categorization to each transaction
    for (const tx of allTransactions) {
      // Respect manual overrides - user request
      if (tx.manualOverride || (tx.classifiedBy as string) === 'MANUAL') {
          continue;
      }

      const keyDesc = tx.keyDesc || tx.descNorm || tx.descRaw || "";
      const result = categorizeTransaction(keyDesc, userRules);
      const aliasMatch = matchAlias(keyDesc, userAliases);

      const resolution = resolveLeafFromMatches({
        matches: (result as any).matches,
        openLeafId,
        taxonomyByLeafId,
        taxonomyByPathKey,
        confidence: result.confidence ?? 0,
        needsReview: result.needsReview ?? true,
        ruleIdApplied: (result as any).ruleIdApplied ?? null,
        matchedKeyword: (result as any).matchedKeyword ?? null,
      });

      const hierarchy = taxonomyByLeafId.get(resolution.leafId) ?? openHierarchy;
      const isInterno = hierarchy.category1 === "Interno";
      const display = isInterno ? "no" : hierarchy.category2 === "Karlsruhe" ? "Casa Karlsruhe" : "yes";

      await db.update(transactions)
        .set({
          leafId: resolution.leafId,
          category1: hierarchy.category1 as any,
          category2: hierarchy.category2,
          category3: hierarchy.category3,
          appCategoryId: hierarchy.appCategoryId,
          appCategoryName: hierarchy.appCategoryName ?? "OPEN",
          type: ((hierarchy.typeDefault as any) || (result.type as any) || tx.type) as any,
          fixVar: ((hierarchy.fixVarDefault as any) || (result.fixVar as any) || tx.fixVar) as any,
          ruleIdApplied: resolution.ruleIdApplied || null,
          matchedKeyword: resolution.matchedKeyword,
          confidence: resolution.confidence,
          needsReview: resolution.status === "MATCHED" ? resolution.needsReview : true,
          conflictFlag: resolution.status === "CONFLICT",
          classificationCandidates: resolution.status === "CONFLICT" ? resolution.candidates : null,
          classifiedBy: "AUTO_KEYWORDS",
          internalTransfer: isInterno,
          excludeFromBudget: isInterno,
          display,
          aliasDesc: aliasMatch ? aliasMatch.aliasDesc : tx.aliasDesc,
        })
        .where(eq(transactions.id, tx.id));

      if (resolution.status === "MATCHED" && resolution.ruleIdApplied) categorized++;
      if (resolution.status !== "MATCHED" || resolution.needsReview) needsReview++;
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

export async function applyCategorization() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  return applyCategorizationCore(session.user.id);
}
