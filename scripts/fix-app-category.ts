import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function fixAppCategoryMappings() {
  console.log("🔧 Fixing App Category Mappings...\n");

  try {
    // Step 1: Get all rules with their current app_category status
    console.log("📊 Step 1: Analyzing current state...");
    const allRules = await db.execute(sql`
      SELECT 
        r.id,
        r.user_id,
        r.category_1,
        r.leaf_id,
        r.key_words,
        tl.nivel_3_pt as leaf_nivel3,
        t2.nivel_2_pt as level2_nivel2,
        t1.nivel_1_pt as level1_nivel1,
        acl.app_cat_id,
        ac.name as app_category_name
      FROM rules r
      LEFT JOIN taxonomy_leaf tl ON r.leaf_id = tl.leaf_id
      LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
      LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
      LEFT JOIN app_category_leaf acl ON tl.leaf_id = acl.leaf_id
      LEFT JOIN app_category ac ON acl.app_cat_id = ac.app_cat_id
    `);

    const rulesWithoutAppCat = allRules.rows.filter(r => !r.app_category_name && r.leaf_id);
    const rulesWithAppCat = allRules.rows.filter(r => r.app_category_name && r.leaf_id);

    console.log(`Total rules: ${allRules.rows.length}`);
    console.log(`Rules WITH app_category: ${rulesWithAppCat.length}`);
    console.log(`Rules WITHOUT app_category (but have leaf_id): ${rulesWithoutAppCat.length}\n`);

    if (rulesWithoutAppCat.length === 0) {
      console.log("✅ No issues found! All rules have app_category mappings.");
      process.exit(0);
    }

    // Step 2: For each rule without app_category, find a matching rule with app_category
    console.log("🔍 Step 2: Finding matching app_category for each rule...\n");
    
    const fixes = [];
    const cannotFix = [];

    for (const rule of rulesWithoutAppCat) {
      // Try to find a rule with the same level1_nivel1 that HAS an app_category
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
          level1: rule.level1_nivel1,
          keywords: rule.key_words
        });
      } else {
        cannotFix.push({
          ruleId: rule.id,
          leafId: rule.leaf_id,
          level1: rule.level1_nivel1,
          keywords: rule.key_words
        });
      }
    }

    console.log(`✅ Can fix: ${fixes.length} rules`);
    console.log(`❌ Cannot fix: ${cannotFix.length} rules\n`);

    // Step 3: Create missing app_category_leaf mappings
    if (fixes.length > 0) {
      console.log("💾 Step 3: Creating missing app_category_leaf mappings...\n");
      
      for (const fix of fixes) {
        // Check if mapping already exists
        const existing = await db.execute(sql`
          SELECT id FROM app_category_leaf 
          WHERE leaf_id = ${fix.leafId} AND app_cat_id = ${fix.appCatId}
        `);

        if (existing.rows.length === 0) {
          // Get user_id for the mapping
          const userResult = await db.execute(sql`
            SELECT user_id FROM taxonomy_leaf WHERE leaf_id = ${fix.leafId}
          `);
          
          if (userResult.rows.length > 0) {
            const userId = userResult.rows[0].user_id;
            
            await db.execute(sql`
              INSERT INTO app_category_leaf (user_id, app_cat_id, leaf_id)
              VALUES (${userId}, ${fix.appCatId}, ${fix.leafId})
            `);
            
            console.log(`  ✅ Created mapping: ${fix.leafId.slice(0, 8)} → ${fix.appCatName}`);
          }
        } else {
          console.log(`  ⏭️  Mapping already exists for ${fix.leafId.slice(0, 8)}`);
        }
      }
    }

    // Step 4: Delete rules that cannot be fixed
    if (cannotFix.length > 0) {
      console.log(`\n🗑️  Step 4: Deleting ${cannotFix.length} rules that cannot be fixed...\n`);
      
      for (const rule of cannotFix) {
        await db.execute(sql`DELETE FROM rules WHERE id = ${rule.ruleId}`);
        console.log(`  🗑️  Deleted rule ${rule.ruleId.slice(0, 8)}: ${rule.keywords?.slice(0, 50)}`);
      }
    }

    // Step 5: Verify the fix
    console.log("\n✅ Step 5: Verifying fix...\n");
    const verification = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(ac.name) as with_app_cat
      FROM rules r
      LEFT JOIN taxonomy_leaf tl ON r.leaf_id = tl.leaf_id
      LEFT JOIN app_category_leaf acl ON tl.leaf_id = acl.leaf_id
      LEFT JOIN app_category ac ON acl.app_cat_id = ac.app_cat_id
      WHERE r.leaf_id IS NOT NULL
    `);

    console.log(`Total rules with leaf_id: ${verification.rows[0].total}`);
    console.log(`Rules with app_category: ${verification.rows[0].with_app_cat}`);
    
    if (verification.rows[0].total === verification.rows[0].with_app_cat) {
      console.log("\n🎉 SUCCESS! All rules now have app_category mappings!");
    } else {
      console.log("\n⚠️  Warning: Some rules still missing app_category");
    }

    console.log("\n✅ Cleanup complete!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixAppCategoryMappings();
