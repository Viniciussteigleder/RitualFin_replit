import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

interface Issue {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  table: string;
  description: string;
  affectedCount: number;
  samples: any[];
  suggestedFix: string;
}

async function auditForUser(userId: string, userName: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`AUDITING USER: ${userName} (${userId})`);
  console.log("=".repeat(60));

  const issues: Issue[] = [];

  // ============================================================
  // AUDIT 1: app_category_leaf integrity
  // ============================================================
  console.log("\n[1] Checking app_category_leaf integrity...");

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
      description: `OPEN leaf linked to non-OPEN app_category`,
      affectedCount: openLeafWithWrongAppCat.rows.length,
      samples: openLeafWithWrongAppCat.rows.slice(0, 3),
      suggestedFix: "DELETE incorrect app_category_leaf links"
    });
  }

  // 1b. Find orphan app_category_leaf links
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
      description: `Links pointing to non-existent taxonomy_leaf`,
      affectedCount: orphanAppCategoryLinks.rows.length,
      samples: orphanAppCategoryLinks.rows.slice(0, 3),
      suggestedFix: "DELETE orphan app_category_leaf links"
    });
  }

  // ============================================================
  // AUDIT 2: taxonomy hierarchy integrity
  // ============================================================
  console.log("[2] Checking taxonomy hierarchy integrity...");

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
      description: `Leaves with broken level_2_id foreign key`,
      affectedCount: leavesWithBrokenLevel2.rows.length,
      samples: leavesWithBrokenLevel2.rows.slice(0, 3),
      suggestedFix: "Fix or delete leaves with broken level_2 references"
    });
  }

  // 2b. Validate OPEN chain exists and is consistent
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
      description: `Partial OPEN in hierarchy`,
      affectedCount: inconsistentOpenEntries.length,
      samples: inconsistentOpenEntries.slice(0, 3),
      suggestedFix: "OPEN should be consistent across all three levels"
    });
  }

  // ============================================================
  // AUDIT 3: transactions table integrity
  // ============================================================
  console.log("[3] Checking transactions table integrity...");

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
      description: `OPEN leaf_id but non-OPEN app_category_name`,
      affectedCount: txOpenLeafWrongAppCat.rows.length,
      samples: txOpenLeafWrongAppCat.rows.slice(0, 5),
      suggestedFix: "Set app_category_name to OPEN or re-classify"
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
      description: `OPEN leaf but non-OPEN category_1`,
      affectedCount: txCategory1NotOpenButLeafOpen.rows.length,
      samples: txCategory1NotOpenButLeafOpen.rows.slice(0, 5),
      suggestedFix: "Re-derive category_1 from leaf hierarchy"
    });
  }

  // 3c. Transactions with leaf_id that doesn't exist
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
      description: `leaf_id pointing to non-existent taxonomy_leaf`,
      affectedCount: txOrphanLeafId.rows.length,
      samples: txOrphanLeafId.rows.slice(0, 5),
      suggestedFix: "Re-classify to valid leaf or OPEN"
    });
  }

  // 3d. Transactions with NULL leaf_id (should always have at least OPEN)
  const txNullLeafId = await db.execute(sql`
    SELECT t.id, t.desc_norm, t.category_1, t.app_category_name
    FROM transactions t
    WHERE t.user_id = ${userId}
    AND t.leaf_id IS NULL
  `);

  if (txNullLeafId.rows.length > 0) {
    issues.push({
      type: "TX_NULL_LEAF_ID",
      severity: "medium",
      table: "transactions",
      description: `Transactions with NULL leaf_id`,
      affectedCount: txNullLeafId.rows.length,
      samples: txNullLeafId.rows.slice(0, 5),
      suggestedFix: "Assign OPEN leaf_id or run categorization"
    });
  }

  // ============================================================
  // AUDIT 4: rules table integrity
  // ============================================================
  console.log("[4] Checking rules table integrity...");

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
      description: `Rules with leaf_id pointing to non-existent taxonomy_leaf`,
      affectedCount: rulesOrphanLeafId.rows.length,
      samples: rulesOrphanLeafId.rows.slice(0, 5),
      suggestedFix: "Update rules to point to valid leaf_id"
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
      description: `Rules where category_1 doesn't match leaf's taxonomy`,
      affectedCount: rulesCategoryLeafMismatch.rows.length,
      samples: rulesCategoryLeafMismatch.rows.slice(0, 5),
      suggestedFix: "Update rule category_1 to match leaf taxonomy"
    });
  }

  // ============================================================
  // Report
  // ============================================================
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const highCount = issues.filter((i) => i.severity === "high").length;
  const mediumCount = issues.filter((i) => i.severity === "medium").length;

  console.log(`\n${"─".repeat(60)}`);
  console.log("AUDIT RESULTS:");
  console.log(`─`.repeat(60));

  if (issues.length === 0) {
    console.log("  No data integrity issues found!");
  } else {
    console.log(`  Total issues: ${issues.length}`);
    console.log(`  Critical: ${criticalCount} | High: ${highCount} | Medium: ${mediumCount}`);
    console.log("");

    for (const issue of issues) {
      const severityIcon = issue.severity === "critical" ? "X" : issue.severity === "high" ? "!" : "~";
      console.log(`  [${severityIcon}] ${issue.type}`);
      console.log(`      Table: ${issue.table} | Affected: ${issue.affectedCount}`);
      console.log(`      ${issue.description}`);
      if (issue.samples.length > 0) {
        console.log(`      Samples:`);
        for (const sample of issue.samples.slice(0, 3)) {
          console.log(`        ${JSON.stringify(sample)}`);
        }
      }
      console.log(`      Fix: ${issue.suggestedFix}`);
      console.log("");
    }
  }

  return { userId, userName, issues, criticalCount, highCount, mediumCount };
}

async function main() {
  console.log("DATA INTEGRITY AUDIT");
  console.log("====================");
  console.log(`Started: ${new Date().toISOString()}\n`);

  // Get all users
  const allUsers = await db.select().from(users);
  console.log(`Found ${allUsers.length} user(s) to audit.\n`);

  const results = [];
  for (const user of allUsers) {
    const result = await auditForUser(user.id, user.name || user.email || "Unknown");
    results.push(result);
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("OVERALL SUMMARY");
  console.log("=".repeat(60));

  const totalCritical = results.reduce((sum, r) => sum + r.criticalCount, 0);
  const totalHigh = results.reduce((sum, r) => sum + r.highCount, 0);
  const totalMedium = results.reduce((sum, r) => sum + r.mediumCount, 0);
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);

  console.log(`\nUsers audited: ${results.length}`);
  console.log(`Total issues: ${totalIssues}`);
  console.log(`  Critical: ${totalCritical}`);
  console.log(`  High: ${totalHigh}`);
  console.log(`  Medium: ${totalMedium}`);

  if (totalCritical > 0) {
    console.log(`\nRECOMMENDATION: CRITICAL issues found - run fix script immediately!`);
  } else if (totalHigh > 0) {
    console.log(`\nRECOMMENDATION: HIGH severity issues found - review and fix soon.`);
  } else if (totalIssues > 0) {
    console.log(`\nRECOMMENDATION: Minor issues found - review when convenient.`);
  } else {
    console.log(`\nAll data integrity checks passed!`);
  }

  console.log(`\nCompleted: ${new Date().toISOString()}`);
  process.exit(totalCritical > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
