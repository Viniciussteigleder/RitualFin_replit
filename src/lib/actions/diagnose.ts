"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rules } from "@/lib/db/schema";
import { eq, sql, isNull, isNotNull, and } from "drizzle-orm";
import { auditDataIntegrity } from "./categorization";

export async function diagnoseAppCategoryIssues() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get all rules with full taxonomy info
  const allRules = await db
    .select({
      id: rules.id,
      category1: rules.category1,
      category2: rules.category2,
      category3: rules.category3,
      leafId: rules.leafId,
      keyWords: rules.keyWords,
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
    .where(eq(rules.userId, session.user.id));

  const withoutAppCat = allRules.filter(r => !r.appCategoryName);
  const withAppCat = allRules.filter(r => r.appCategoryName);
  const withoutAppCatButHasCategories = withoutAppCat.filter(r => r.category1);
  const withoutAppCatButHasLeafId = withoutAppCat.filter(r => r.leafId);

  const integrity = await auditDataIntegrity();

  return {
    total: allRules.length,
    withAppCategory: withAppCat.length,
    withoutAppCategory: withoutAppCat.length,
    withoutAppCatButHasCategories: withoutAppCatButHasCategories.length,
    withoutAppCatButHasLeafId: withoutAppCatButHasLeafId.length,
    sampleWithoutAppCat: withoutAppCat.slice(0, 10).map(r => ({
      id: r.id.slice(0, 8),
      category1: r.category1,
      leafId: r.leafId,
      keyWords: r.keyWords?.slice(0, 50),
    })),
    specificIds: {
      e4c24e3f: allRules.find(r => r.id.startsWith("e4c24e3f")),
      ba583849: allRules.find(r => r.id.startsWith("ba583849")),
    },
    integrity,
    topics: [
      {
        id: "neural-engine",
        title: "Neural Engine Coverage",
        icon: "Brain",
        rationale: "Ensures that automation rules are correctly mapped to App Categories for consistent reporting.",
        summary: `${allRules.length} rules analyzed. ${withAppCat.length} fully mapped (${Math.round((withAppCat.length / (allRules.length || 1)) * 100)}%).`,
        status: withoutAppCatButHasCategories.length > 0 ? "warning" : "success",
        details: {
          total: allRules.length,
          mapped: withAppCat.length,
          unmapped: withoutAppCat.length,
          critical: withoutAppCatButHasCategories.length
        }
      },
      {
        id: "taxonomy",
        title: "Taxonomy Architecture",
        icon: "Network",
        rationale: "Validates the 3-level hierarchy integrity and ensuring the OPEN fallback chain is consistent.",
        summary: "Checks the structural integrity of Nível 1, 2, and 3 relationships.",
        status: integrity.issues.some(i => i.table.includes("taxonomy")) ? "error" : "success",
      },
      {
        id: "transactions",
        title: "Transaction Alignment",
        icon: "RefreshCw",
        rationale: "Ensures transactions have consistent category names synchronized with their underlying taxonomy leaf.",
        summary: "Sync check between database fields and taxonomy definitions.",
        status: integrity.issues.some(i => i.table === "transactions") ? "error" : "success",
      }
    ]
  };
}
