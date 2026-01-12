import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function reclassifyWithTaxonomy() {
  console.log("🔍 Re-classifying ALL transactions with taxonomy integration...\\n");

  // Get all active rules, ordered by priority
  const allRules = await sql`
    SELECT * FROM rules 
    WHERE active = true 
    ORDER BY priority DESC
  `;

  console.log(`📋 Found ${allRules.length} active classification rules`);

  // Get ALL transactions
  const allTransactions = await sql`
    SELECT * FROM transactions
  `;

  console.log(`📊 Found ${allTransactions.length} total transactions to classify\\n`);

  let classified = 0;
  let unmatched = 0;
  let appCategoryPopulated = 0;

  for (const transaction of allTransactions) {
    let matched = false;

    for (const rule of allRules) {
      if (!rule.key_words) continue;

      // Split keywords by semicolon and clean them
      const keywords = rule.key_words.split(";").map((k: string) => k.trim()).filter((k: string) => k);
      const negativeKeywords = rule.key_words_negative 
        ? rule.key_words_negative.split(";").map((k: string) => k.trim()).filter((k: string) => k)
        : [];

      // Get the description (prefer normalized, fallback to raw)
      const description = (transaction.desc_norm || transaction.desc_raw || "").toLowerCase();
      
      // Check if description matches any keyword (case-insensitive)
      const matchedKeyword = keywords.find((keyword: string) => 
        description.includes(keyword.toLowerCase())
      );

      // Check for negative matches (exclusions)
      const hasNegativeMatch = negativeKeywords.length > 0 && negativeKeywords.some((keyword: string) =>
        description.includes(keyword.toLowerCase())
      );

      if (matchedKeyword && !hasNegativeMatch) {
        // Get app_category info if leaf_id exists
        let appCategoryId = null;
        let appCategoryName = null;
        
        if (rule.leaf_id) {
          const appCatResult = await sql`
            SELECT acl.app_cat_id, ac.name
            FROM app_category_leaf acl
            JOIN app_category ac ON acl.app_cat_id = ac.app_cat_id
            WHERE acl.leaf_id = ${rule.leaf_id}
            LIMIT 1
          `;
          
          if (appCatResult.length > 0) {
            appCategoryId = appCatResult[0].app_cat_id;
            appCategoryName = appCatResult[0].name;
            appCategoryPopulated++;
          }
        }

        // Apply the classification from this rule
        await sql`
          UPDATE transactions
          SET 
            category_1 = ${rule.category_1},
            category_2 = ${rule.category_2},
            category_3 = ${rule.category_3},
            type = ${rule.type},
            fix_var = ${rule.fix_var},
            leaf_id = ${rule.leaf_id},
            matched_keyword = ${matchedKeyword},
            app_category_id = ${appCategoryId},
            app_category_name = ${appCategoryName},
            rule_id_applied = ${rule.id},
            classified_by = 'AUTO_KEYWORDS',
            needs_review = false
          WHERE id = ${transaction.id}
        `;

        const shortDesc = transaction.desc_norm?.substring(0, 50) || '';
        console.log(`✅ ${shortDesc} → ${rule.category_1} > ${rule.category_2} [${matchedKeyword}]`);
        
        classified++;
        matched = true;
        break; // Stop at first rule match (highest priority)
      }
    }

    if (!matched) {
      unmatched++;
      // Optionally log unmatched for debugging
      if (unmatched <= 10) { // Only show first 10
        const shortDesc = transaction.desc_norm?.substring(0, 60) || '';
        console.log(`⚠️  Unmatched: "${shortDesc}"`);
      }
    }
  }

  console.log(`\\n📈 Results:`);
  console.log(`   ✅ Classified: ${classified}`);
  console.log(`   📦 With App Category: ${appCategoryPopulated}`);
  console.log(`   ⚠️  Unmatched: ${unmatched}`);
  console.log(`   📊 Success Rate: ${((classified / allTransactions.length) * 100).toFixed(1)}%`);
  
  return { classified, appCategoryPopulated, unmatched, total: allTransactions.length };
}

async function main() {
  console.log("🚀 Starting enhanced transaction classification...\\n");
  
  try {
    const results = await reclassifyWithTaxonomy();
    
    console.log("\\n✨ Classification complete!");
    console.log(`\\n📊 Final Stats:`);
    console.log(`   Total: ${results.total}`);
    console.log(`   Classified: ${results.classified} (${((results.classified / results.total) * 100).toFixed(1)}%)`);
    console.log(`   With Taxonomy: ${results.appCategoryPopulated}`);
    console.log(`   Unmatched: ${results.unmatched}`);
  } catch (error) {
    console.error("\\n❌ Failed:", error);
    process.exit(1);
  }
}

main();
