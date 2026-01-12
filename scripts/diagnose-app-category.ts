import { db } from "@/lib/db";
import { rules } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function diagnoseAppCategoryIssues() {
  console.log("🔍 Diagnosing App Category Issues...\n");

  // Query to find rules with categories but no app_category
  const rulesWithoutAppCategory = await db
    .select({
      id: rules.id,
      userId: rules.userId,
      category1: rules.category1,
      category2: rules.category2,
      category3: rules.category3,
      leafId: rules.leafId,
      keyWords: rules.keyWords,
      priority: rules.priority,
      appCategoryId: sql<string | null>`app_category.app_cat_id`,
      appCategoryName: sql<string | null>`app_category.name`,
      leafNivel3: sql<string | null>`taxonomy_leaf.nivel_3_pt`,
      level2Nivel2: sql<string | null>`taxonomy_level_2.nivel_2_pt`,
      level1Nivel1: sql<string | null>`taxonomy_level_1.nivel_1_pt`,
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
    );

  // Separate rules by app_category status
  const withoutAppCat = rulesWithoutAppCategory.filter(r => !r.appCategoryName);
  const withAppCat = rulesWithoutAppCategory.filter(r => r.appCategoryName);

  console.log("📊 Summary:");
  console.log(`Total rules: ${rulesWithoutAppCategory.length}`);
  console.log(`Rules WITH app_category: ${withAppCat.length}`);
  console.log(`Rules WITHOUT app_category: ${withoutAppCat.length}\n`);

  // Check specific IDs mentioned by user
  console.log("🔎 Checking specific IDs:");
  const id1 = rulesWithoutAppCategory.find(r => r.id.startsWith("e4c24e3f"));
  const id2 = rulesWithoutAppCategory.find(r => r.id.startsWith("ba583849"));

  if (id1) {
    console.log("\n📌 ID: e4c24e3f (without app category):");
    console.log(`  Category1: ${id1.category1}`);
    console.log(`  Category2: ${id1.category2}`);
    console.log(`  Category3: ${id1.category3}`);
    console.log(`  Leaf ID: ${id1.leafId}`);
    console.log(`  Leaf Nivel3: ${id1.leafNivel3}`);
    console.log(`  Level2 Nivel2: ${id1.level2Nivel2}`);
    console.log(`  Level1 Nivel1: ${id1.level1Nivel1}`);
    console.log(`  App Category: ${id1.appCategoryName || "❌ MISSING"}`);
  }

  if (id2) {
    console.log("\n📌 ID: ba583849 (with app category):");
    console.log(`  Category1: ${id2.category1}`);
    console.log(`  Category2: ${id2.category2}`);
    console.log(`  Category3: ${id2.category3}`);
    console.log(`  Leaf ID: ${id2.leafId}`);
    console.log(`  Leaf Nivel3: ${id2.leafNivel3}`);
    console.log(`  Level2 Nivel2: ${id2.level2Nivel2}`);
    console.log(`  Level1 Nivel1: ${id2.level1Nivel1}`);
    console.log(`  App Category: ${id2.appCategoryName || "❌ MISSING"}`);
  }

  // Analyze patterns
  console.log("\n\n🔍 Analyzing patterns in rules WITHOUT app_category:");
  console.log("─".repeat(80));
  
  const withoutAppCatButHasCategories = withoutAppCat.filter(r => r.category1);
  const withoutAppCatAndNoLeafId = withoutAppCat.filter(r => !r.leafId);
  const withoutAppCatButHasLeafId = withoutAppCat.filter(r => r.leafId);

  console.log(`\nRules with category1 but no app_category: ${withoutAppCatButHasCategories.length}`);
  console.log(`Rules without leaf_id: ${withoutAppCatAndNoLeafId.length}`);
  console.log(`Rules with leaf_id but no app_category: ${withoutAppCatButHasLeafId.length}`);

  if (withoutAppCatButHasLeafId.length > 0) {
    console.log("\n⚠️ SYSTEMATIC ISSUE DETECTED:");
    console.log(`${withoutAppCatButHasLeafId.length} rules have leaf_id but no app_category mapping!`);
    console.log("\nSample rules:");
    withoutAppCatButHasLeafId.slice(0, 5).forEach(r => {
      console.log(`\n  ID: ${r.id.slice(0, 8)}`);
      console.log(`    Keywords: ${r.keyWords}`);
      console.log(`    Category1: ${r.category1}`);
      console.log(`    Leaf ID: ${r.leafId}`);
      console.log(`    Taxonomy: ${r.level1Nivel1} → ${r.level2Nivel2} → ${r.leafNivel3}`);
      console.log(`    App Category: ❌ MISSING (should be linked via app_category_leaf)`);
    });
  }

  // Check app_category_leaf table
  console.log("\n\n🔍 Checking app_category_leaf table:");
  const appCategoryLeafCount = await db.execute(sql`SELECT COUNT(*) as count FROM app_category_leaf`);
  console.log(`Total app_category_leaf mappings: ${appCategoryLeafCount.rows[0].count}`);

  // Check if leaf_ids from rules exist in app_category_leaf
  const leafIdsFromRules = withoutAppCatButHasLeafId.map(r => r.leafId).filter(Boolean);
  if (leafIdsFromRules.length > 0) {
    console.log(`\nChecking if ${leafIdsFromRules.length} leaf_ids have app_category mappings...`);
    
    const mappingsExist = await db.execute(
      sql`SELECT leaf_id FROM app_category_leaf WHERE leaf_id = ANY(${leafIdsFromRules})`
    );
    
    console.log(`Found ${mappingsExist.rows.length} mappings in app_category_leaf`);
    console.log(`Missing ${leafIdsFromRules.length - mappingsExist.rows.length} mappings`);
  }

  console.log("\n\n✅ Diagnosis complete!");
  process.exit(0);
}

diagnoseAppCategoryIssues().catch(console.error);
