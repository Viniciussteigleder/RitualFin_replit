"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, rules, aliasAssets } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
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
      columns: {
        id: true,
        manualOverride: true,
        classifiedBy: true,
        keyDesc: true,
        descNorm: true,
        descRaw: true,
        type: true,
        fixVar: true,
        aliasDesc: true,
      },
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

/**
 * M6: Diagnose inconsistent transactions
 * Finds transactions where appCategoryName != OPEN but category1 = OPEN
 */
export async function diagnoseInconsistentTransactions() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated", inconsistencies: [] };
  }

  const userId = session.user.id;

  // Find transactions with inconsistent classification
  const allTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    columns: {
      id: true,
      descNorm: true,
      descRaw: true,
      category1: true,
      appCategoryName: true,
      needsReview: true,
      confidence: true,
      ruleIdApplied: true,
    },
  });

  const inconsistencies = allTransactions.filter(tx => {
    // Case 1: appCategoryName is set but category1 is OPEN
    if (tx.appCategoryName && tx.appCategoryName !== "OPEN" && tx.category1 === "OPEN") {
      return true;
    }
    // Case 2: category1 is set but appCategoryName is null/OPEN
    if (tx.category1 && tx.category1 !== "OPEN" && (!tx.appCategoryName || tx.appCategoryName === "OPEN")) {
      return true;
    }
    // Case 3: needsReview = true but has high-confidence strict rule match
    if (tx.needsReview && tx.ruleIdApplied && tx.confidence && tx.confidence >= 85) {
      return true;
    }
    return false;
  });

  return {
    success: true,
    total: allTransactions.length,
    inconsistentCount: inconsistencies.length,
    inconsistencies: inconsistencies.map(tx => ({
      id: tx.id,
      descNorm: tx.descNorm,
      category1: tx.category1,
      appCategoryName: tx.appCategoryName,
      needsReview: tx.needsReview,
      confidence: tx.confidence,
      ruleIdApplied: tx.ruleIdApplied,
    }))
  };
}

/**
 * M7: Fix inconsistent transactions by re-categorizing them
 */
export async function fixInconsistentTransactions() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.id;

  // First diagnose
  const diagnosis = await diagnoseInconsistentTransactions();
  if (!diagnosis.success) {
    return diagnosis;
  }

  if (diagnosis.inconsistentCount === 0) {
    return { success: true, message: "No inconsistencies found", fixed: 0 };
  }

  // Re-run categorization for inconsistent transactions only
  const userRules = await db.query.rules.findMany({
    where: eq(rules.userId, userId),
  });

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
    return { success: false, error: "OPEN leaf hierarchy not found" };
  }

  let fixed = 0;

  for (const inconsistency of diagnosis.inconsistencies) {
    const tx = await db.query.transactions.findFirst({
      where: eq(transactions.id, inconsistency.id),
      columns: {
        id: true,
        keyDesc: true,
        descNorm: true,
        descRaw: true,
        aliasDesc: true,
      },
    });

    if (!tx) continue;

    const keyDesc = tx.keyDesc || tx.descNorm || tx.descRaw || "";
    const aliasMatch = matchAlias(keyDesc, userAliases);
    const categorization = categorizeTransaction(keyDesc, userRules, {
      autoConfirmHighConfidence: true,
      confidenceThreshold: 80
    });

    const resolution = resolveLeafFromMatches({
      matches: (categorization as any).matches,
      openLeafId,
      taxonomyByLeafId,
      taxonomyByPathKey,
      confidence: categorization.confidence ?? 0,
      needsReview: categorization.needsReview ?? true,
      ruleIdApplied: (categorization as any).ruleIdApplied ?? null,
      matchedKeyword: (categorization as any).matchedKeyword ?? null,
    });

    const hierarchy = taxonomyByLeafId.get(resolution.leafId) ?? openHierarchy;

    await db
      .update(transactions)
      .set({
        category1: hierarchy.category1 as any,
        category2: hierarchy.category2,
        category3: hierarchy.category3,
        leafId: resolution.leafId,
        appCategoryId: hierarchy.appCategoryId,
        appCategoryName: hierarchy.appCategoryName ?? hierarchy.category1,
        needsReview: resolution.needsReview,
        confidence: resolution.confidence,
        ruleIdApplied: resolution.ruleIdApplied,
        matchedKeyword: resolution.matchedKeyword,
        aliasDesc: aliasMatch ? aliasMatch.aliasDesc : tx.aliasDesc,
      })
      .where(eq(transactions.id, tx.id));

    fixed++;
  }

  return {
    success: true,
    total: diagnosis.inconsistentCount,
    fixed,
    message: `Fixed ${fixed} of ${diagnosis.inconsistentCount} inconsistent transactions`
  };
}

/**
 * Comprehensive Data Integrity Audit
 * Expert Panel: Dr. Martin Kleppmann (Data Integrity), Markus Winand (DB Forensics), Dr. Fei-Fei Li (Classification)
 *
 * Checks:
 * 1. app_category_leaf integrity - OPEN leaf links
 * 2. taxonomy hierarchy integrity - FK consistency
 * 3. transactions table integrity - leaf_id vs category consistency
 * 4. rules table integrity - leaf_id validity
 */
export async function auditDataIntegrity() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated", issues: [] };
  }

  const userId = session.user.id;
  const issues: Array<{
    type: string;
    severity: "critical" | "high" | "medium" | "low";
    table: string;
    description: string;
    affectedIds: string[];
    suggestedFix: string;
  }> = [];

  // ============================================================
  // AUDIT 1: app_category_leaf integrity
  // ============================================================

  // 1a. Find OPEN leaf linked to non-OPEN app_category
  const openLeafWithWrongAppCat = await db.execute(sql`
    SELECT
      acl.id as link_id,
      acl.leaf_id,
      ac.name as app_category_name,
      tl.nivel_3_pt as leaf_name,
      t2.nivel_2_pt as level_2_name,
      t1.nivel_1_pt as level_1_name
    FROM app_category_leaf acl
    JOIN taxonomy_leaf tl ON acl.leaf_id = tl.leaf_id
    JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    JOIN app_category ac ON acl.app_cat_id = ac.app_cat_id
    WHERE acl.user_id = ${userId}
    AND t1.nivel_1_pt = 'OPEN' AND t2.nivel_2_pt = 'OPEN' AND tl.nivel_3_pt = 'OPEN'
    AND ac.name != 'OPEN'
  `);

  if (openLeafWithWrongAppCat.rows.length > 0) {
    issues.push({
      type: "OPEN_LEAF_WRONG_APP_CATEGORY",
      severity: "critical",
      table: "app_category_leaf",
      description: `OPEN leaf is linked to non-OPEN app_category: ${openLeafWithWrongAppCat.rows.map((r: any) => r.app_category_name).join(", ")}`,
      affectedIds: openLeafWithWrongAppCat.rows.map((r: any) => r.link_id),
      suggestedFix: "Delete incorrect app_category_leaf links and ensure OPEN leaf links only to OPEN app_category"
    });
  }

  // 1b. Find non-OPEN leaves linked to OPEN app_category
  const nonOpenLeafWithOpenAppCat = await db.execute(sql`
    SELECT
      acl.id as link_id,
      acl.leaf_id,
      ac.name as app_category_name,
      tl.nivel_3_pt as leaf_name,
      t1.nivel_1_pt as level_1_name
    FROM app_category_leaf acl
    JOIN taxonomy_leaf tl ON acl.leaf_id = tl.leaf_id
    JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    JOIN app_category ac ON acl.app_cat_id = ac.app_cat_id
    WHERE acl.user_id = ${userId}
    AND (t1.nivel_1_pt != 'OPEN' OR tl.nivel_3_pt != 'OPEN')
    AND ac.name = 'OPEN'
  `);

  if (nonOpenLeafWithOpenAppCat.rows.length > 0) {
    issues.push({
      type: "NON_OPEN_LEAF_WITH_OPEN_APP_CATEGORY",
      severity: "high",
      table: "app_category_leaf",
      description: `Non-OPEN leaves linked to OPEN app_category: ${nonOpenLeafWithOpenAppCat.rows.length} links`,
      affectedIds: nonOpenLeafWithOpenAppCat.rows.map((r: any) => r.link_id),
      suggestedFix: "Create proper app_category for these leaves or update links"
    });
  }

  // 1c. Find orphan app_category_leaf links (leaf_id not in taxonomy_leaf)
  const orphanAppCategoryLinks = await db.execute(sql`
    SELECT acl.id as link_id, acl.leaf_id
    FROM app_category_leaf acl
    LEFT JOIN taxonomy_leaf tl ON acl.leaf_id = tl.leaf_id
    WHERE acl.user_id = ${userId}
    AND tl.leaf_id IS NULL
  `);

  if (orphanAppCategoryLinks.rows.length > 0) {
    issues.push({
      type: "ORPHAN_APP_CATEGORY_LEAF_LINK",
      severity: "high",
      table: "app_category_leaf",
      description: `app_category_leaf links pointing to non-existent taxonomy_leaf: ${orphanAppCategoryLinks.rows.length} links`,
      affectedIds: orphanAppCategoryLinks.rows.map((r: any) => r.link_id),
      suggestedFix: "Delete orphan app_category_leaf links"
    });
  }

  // ============================================================
  // AUDIT 2: taxonomy hierarchy integrity
  // ============================================================

  // 2a. Find leaves with broken level_2_id references
  const leavesWithBrokenLevel2 = await db.execute(sql`
    SELECT tl.leaf_id, tl.nivel_3_pt, tl.level_2_id
    FROM taxonomy_leaf tl
    LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    WHERE tl.user_id = ${userId}
    AND t2.level_2_id IS NULL
  `);

  if (leavesWithBrokenLevel2.rows.length > 0) {
    issues.push({
      type: "LEAF_BROKEN_LEVEL2_FK",
      severity: "critical",
      table: "taxonomy_leaf",
      description: `Leaves with broken level_2_id foreign key: ${leavesWithBrokenLevel2.rows.length} leaves`,
      affectedIds: leavesWithBrokenLevel2.rows.map((r: any) => r.leaf_id),
      suggestedFix: "Fix or delete leaves with broken level_2 references"
    });
  }

  // 2b. Find level_2 with broken level_1_id references
  const level2WithBrokenLevel1 = await db.execute(sql`
    SELECT t2.level_2_id, t2.nivel_2_pt, t2.level_1_id
    FROM taxonomy_level_2 t2
    LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    WHERE t2.user_id = ${userId}
    AND t1.level_1_id IS NULL
  `);

  if (level2WithBrokenLevel1.rows.length > 0) {
    issues.push({
      type: "LEVEL2_BROKEN_LEVEL1_FK",
      severity: "critical",
      table: "taxonomy_level_2",
      description: `Level 2 entries with broken level_1_id foreign key: ${level2WithBrokenLevel1.rows.length} entries`,
      affectedIds: level2WithBrokenLevel1.rows.map((r: any) => r.level_2_id),
      suggestedFix: "Fix or delete level_2 entries with broken level_1 references"
    });
  }

  // 2c. Validate OPEN chain exists and is consistent
  const openChainValidation = await db.execute(sql`
    SELECT
      tl.leaf_id,
      tl.nivel_3_pt as leaf_name,
      t2.nivel_2_pt as level_2_name,
      t1.nivel_1_pt as level_1_name
    FROM taxonomy_leaf tl
    JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    WHERE tl.user_id = ${userId}
    AND (tl.nivel_3_pt = 'OPEN' OR t2.nivel_2_pt = 'OPEN' OR t1.nivel_1_pt = 'OPEN')
  `);

  const openEntries = openChainValidation.rows as any[];
  const inconsistentOpenEntries = openEntries.filter(
    (r) => !(r.leaf_name === "OPEN" && r.level_2_name === "OPEN" && r.level_1_name === "OPEN")
  );

  if (inconsistentOpenEntries.length > 0) {
    issues.push({
      type: "INCONSISTENT_OPEN_CHAIN",
      severity: "high",
      table: "taxonomy_*",
      description: `Inconsistent OPEN chain - partial OPEN in hierarchy: ${inconsistentOpenEntries.map((r) => `${r.level_1_name}>${r.level_2_name}>${r.leaf_name}`).join(", ")}`,
      affectedIds: inconsistentOpenEntries.map((r) => r.leaf_id),
      suggestedFix: "OPEN should be consistent across all three levels"
    });
  }

  // ============================================================
  // AUDIT 3: transactions table integrity
  // ============================================================

  // 3a. Transactions where leaf_id = OPEN but app_category_name != OPEN
  const txOpenLeafWrongAppCat = await db.execute(sql`
    SELECT
      t.id,
      t.desc_norm,
      t.leaf_id,
      t.app_category_name,
      t.category_1,
      tl.nivel_3_pt as actual_leaf_name
    FROM transactions t
    LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
    WHERE t.user_id = ${userId}
    AND tl.nivel_3_pt = 'OPEN'
    AND t.app_category_name IS NOT NULL
    AND t.app_category_name != 'OPEN'
  `);

  if (txOpenLeafWrongAppCat.rows.length > 0) {
    issues.push({
      type: "TX_OPEN_LEAF_WRONG_APP_CATEGORY",
      severity: "critical",
      table: "transactions",
      description: `Transactions with OPEN leaf_id but non-OPEN app_category_name: ${txOpenLeafWrongAppCat.rows.length} transactions`,
      affectedIds: txOpenLeafWrongAppCat.rows.map((r: any) => r.id),
      suggestedFix: "Set app_category_name to OPEN for these transactions or re-classify"
    });
  }

  // 3b. Transactions where category_1 != OPEN but leaf_id points to OPEN
  const txCategory1NotOpenButLeafOpen = await db.execute(sql`
    SELECT
      t.id,
      t.desc_norm,
      t.leaf_id,
      t.category_1,
      tl.nivel_3_pt as actual_leaf_name
    FROM transactions t
    LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
    WHERE t.user_id = ${userId}
    AND tl.nivel_3_pt = 'OPEN'
    AND t.category_1 IS NOT NULL
    AND CAST(t.category_1 AS text) != 'OPEN'
  `);

  if (txCategory1NotOpenButLeafOpen.rows.length > 0) {
    issues.push({
      type: "TX_CATEGORY1_LEAF_MISMATCH",
      severity: "critical",
      table: "transactions",
      description: `Transactions with OPEN leaf but non-OPEN category_1: ${txCategory1NotOpenButLeafOpen.rows.length} transactions`,
      affectedIds: txCategory1NotOpenButLeafOpen.rows.map((r: any) => r.id),
      suggestedFix: "Re-derive category_1 from leaf hierarchy or re-classify"
    });
  }

  // 3c. Transactions with leaf_id that doesn't exist in taxonomy_leaf
  const txOrphanLeafId = await db.execute(sql`
    SELECT t.id, t.desc_norm, t.leaf_id
    FROM transactions t
    LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
    WHERE t.user_id = ${userId}
    AND t.leaf_id IS NOT NULL
    AND tl.leaf_id IS NULL
  `);

  if (txOrphanLeafId.rows.length > 0) {
    issues.push({
      type: "TX_ORPHAN_LEAF_ID",
      severity: "high",
      table: "transactions",
      description: `Transactions with leaf_id pointing to non-existent taxonomy_leaf: ${txOrphanLeafId.rows.length} transactions`,
      affectedIds: txOrphanLeafId.rows.map((r: any) => r.id),
      suggestedFix: "Re-classify these transactions to valid leaf or OPEN"
    });
  }

  // ============================================================
  // AUDIT 4: rules table integrity
  // ============================================================

  // 4a. Rules with leaf_id pointing to non-existent leaves
  const rulesOrphanLeafId = await db.execute(sql`
    SELECT r.id, r.key_words, r.leaf_id
    FROM rules r
    LEFT JOIN taxonomy_leaf tl ON r.leaf_id = tl.leaf_id
    WHERE r.user_id = ${userId}
    AND r.leaf_id IS NOT NULL
    AND r.leaf_id != 'open'
    AND tl.leaf_id IS NULL
  `);

  if (rulesOrphanLeafId.rows.length > 0) {
    issues.push({
      type: "RULE_ORPHAN_LEAF_ID",
      severity: "high",
      table: "rules",
      description: `Rules with leaf_id pointing to non-existent taxonomy_leaf: ${rulesOrphanLeafId.rows.length} rules`,
      affectedIds: rulesOrphanLeafId.rows.map((r: any) => r.id),
      suggestedFix: "Update rules to point to valid leaf_id or clear leaf_id"
    });
  }

  // 4b. Rules with category1 that doesn't match the leaf's taxonomy
  const rulesCategoryLeafMismatch = await db.execute(sql`
    SELECT
      r.id,
      r.key_words,
      r.category_1 as rule_category1,
      t1.nivel_1_pt as leaf_category1,
      r.leaf_id
    FROM rules r
    JOIN taxonomy_leaf tl ON r.leaf_id = tl.leaf_id
    JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    WHERE r.user_id = ${userId}
    AND r.leaf_id IS NOT NULL
    AND r.category_1 IS NOT NULL
    AND CAST(r.category_1 AS text) != t1.nivel_1_pt
  `);

  if (rulesCategoryLeafMismatch.rows.length > 0) {
    issues.push({
      type: "RULE_CATEGORY_LEAF_MISMATCH",
      severity: "medium",
      table: "rules",
      description: `Rules where category_1 doesn't match leaf's taxonomy: ${rulesCategoryLeafMismatch.rows.length} rules`,
      affectedIds: rulesCategoryLeafMismatch.rows.map((r: any) => r.id),
      suggestedFix: "Update rule category_1 to match leaf taxonomy or clear leaf_id"
    });
  }

  // ============================================================
  // Summary
  // ============================================================

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const highCount = issues.filter((i) => i.severity === "high").length;
  const mediumCount = issues.filter((i) => i.severity === "medium").length;

  return {
    success: true,
    summary: {
      totalIssues: issues.length,
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: issues.filter((i) => i.severity === "low").length,
    },
    issues,
    recommendation: criticalCount > 0
      ? "CRITICAL issues found - run fixDataIntegrityIssues() immediately"
      : highCount > 0
        ? "HIGH severity issues found - review and fix soon"
        : issues.length > 0
          ? "Minor issues found - review when convenient"
          : "No data integrity issues detected"
  };
}

/**
 * Fix critical data integrity issues automatically
 */
export async function fixDataIntegrityIssues() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.id;
  const fixes: string[] = [];

  // Fix 1: Remove incorrect app_category_leaf links for OPEN leaf
  const fix1 = await db.execute(sql`
    DELETE FROM app_category_leaf
    WHERE id IN (
      SELECT acl.id
      FROM app_category_leaf acl
      JOIN taxonomy_leaf tl ON acl.leaf_id = tl.leaf_id
      JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
      JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
      JOIN app_category ac ON acl.app_cat_id = ac.app_cat_id
      WHERE acl.user_id = ${userId}
      AND t1.nivel_1_pt = 'OPEN' AND t2.nivel_2_pt = 'OPEN' AND tl.nivel_3_pt = 'OPEN'
      AND ac.name != 'OPEN'
    )
  `);
  fixes.push(`Removed ${fix1.rowCount || 0} incorrect OPEN leaf app_category links`);

  // Fix 2: Update transactions with OPEN leaf but wrong app_category_name
  const fix2 = await db.execute(sql`
    UPDATE transactions t
    SET
      app_category_name = 'OPEN',
      category_1 = 'OPEN',
      category_2 = 'OPEN',
      category_3 = 'OPEN'
    FROM taxonomy_leaf tl
    WHERE t.leaf_id = tl.leaf_id
    AND t.user_id = ${userId}
    AND tl.nivel_3_pt = 'OPEN'
    AND (t.app_category_name != 'OPEN' OR CAST(t.category_1 AS text) != 'OPEN')
  `);
  fixes.push(`Fixed ${fix2.rowCount || 0} transactions with OPEN leaf but wrong categories`);

  // Fix 3: Re-run setup-open to ensure proper OPEN linkage
  const { ensureOpenCategoryCore } = await import("@/lib/actions/setup-open");
  await ensureOpenCategoryCore(userId);
  fixes.push("Re-validated OPEN category chain");

  return {
    success: true,
    fixes,
    message: "Data integrity fixes applied. Run auditDataIntegrity() to verify."
  };
}
