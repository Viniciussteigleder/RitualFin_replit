"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rules, appCategoryLeaf } from "@/lib/db/schema";
import { sql, eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function fixAppCategoryIssues() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const log = [];
  
  try {
    // 1. Get all rules with full taxonomy info to identify broken ones
    const allRules = await db.execute(sql`
      SELECT 
        r.id,
        r.user_id,
        r.category_1,
        r.leaf_id,
        r.key_words,
        t1.nivel_1_pt as level1_nivel1,
        acl.app_cat_id,
        ac.name as app_category_name
      FROM rules r
      LEFT JOIN taxonomy_leaf tl ON r.leaf_id = tl.leaf_id
      LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
      LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
      LEFT JOIN app_category_leaf acl ON tl.leaf_id = acl.leaf_id
      LEFT JOIN app_category ac ON acl.app_cat_id = ac.app_cat_id
      WHERE r.user_id = ${session.user.id} AND r.leaf_id IS NOT NULL
    `);

    // Filter for broken rules: Have leaf_id but no app_category
    const rulesWithoutAppCat = allRules.rows.filter(r => !r.app_category_name && r.leaf_id);
    const rulesWithAppCat = allRules.rows.filter(r => r.app_category_name && r.leaf_id);

    log.push(`Found ${rulesWithoutAppCat.length} broken rules out of ${allRules.rows.length} total.`);

    if (rulesWithoutAppCat.length === 0) {
      return { success: true, message: "No issues found to fix.", log };
    }

    // 2. Classify into Fixable vs Unfixable
    const fixes = [];
    const deletions = [];

    for (const rule of rulesWithoutAppCat) {
      // Logic: Find any other rule (or mapping) that relies on the same 'Category 1' (taxonomy level 1)
      // and see what App Category it uses.
      // Note: This relies on the assumption that Category 1 maps loosely to App Category.
      
      const match = rulesWithAppCat.find(r => 
        r.level1_nivel1 === rule.level1_nivel1 && 
        r.app_cat_id
      );

      if (match) {
        fixes.push({
          ruleId: rule.id,
          leafId: rule.leaf_id,
          appCatId: match.app_cat_id,
          appCatName: match.app_category_name,
        });
      } else {
        deletions.push(rule);
      }
    }

    // 3. Apply Fixes (Insert missing findings into app_category_leaf)
    let fixedCount = 0;
    for (const fix of fixes) {
      // Check if mapping exists (it shouldn't, based on query, but safety first)
      const existing = await db.execute(sql`
        SELECT id FROM app_category_leaf 
        WHERE leaf_id = ${fix.leafId} AND app_cat_id = ${fix.appCatId}
      `);

      if (existing.rows.length === 0) {
        await db.insert(appCategoryLeaf).values({
            userId: session.user.id,
            appCatId: fix.appCatId as string,
            leafId: fix.leafId as string
        });
        fixedCount++;
      }
    }
    log.push(`Fixed ${fixedCount} mappings.`);

    // 4. Delete unfixable rules
    let deletedCount = 0;
    for (const del of deletions) {
      await db.delete(rules).where(eq(rules.id, del.id as string));
      deletedCount++;
    }
    log.push(`Deleted ${deletedCount} unfixable rules.`);

    revalidatePath("/diagnose");
    revalidatePath("/settings/rules");

    return { 
      success: true, 
      message: `Operation complete. Fixed: ${fixedCount}, Deleted: ${deletedCount}`,
      log 
    };

  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message, log };
  }
}
