import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🔄 Backfilling app_category data for existing transactions...\n');

// Step 1: Update app_category info from taxonomy
console.log('Step 1: Populating app_category from taxonomy...');

const updated = await sql`
  UPDATE transactions t
  SET 
    app_category_id = acl.app_cat_id,
    app_category_name = ac.name
  FROM app_category_leaf acl
  JOIN app_category ac ON acl.app_cat_id = ac.app_cat_id
  WHERE t.leaf_id = acl.leaf_id
  AND t.app_category_id IS NULL
`;

console.log(`✓ Updated ${updated.length} transactions with app_category`);

// Step 2: Update matched_keyword from rules
console.log('\nStep 2: Populating matched_keyword from rules...');

const keywordUpdated = await sql`
  UPDATE transactions t
  SET matched_keyword = r.key_words
  FROM rules r
  WHERE t.rule_id_applied = r.id
  AND t.matched_keyword IS NULL
  AND r.key_words IS NOT NULL
`;

console.log(`✓ Updated ${keywordUpdated.length} transactions with matched_keyword`);

// Step 3: Verify results
console.log('\n📊 Verification:');

const stats = await sql`
  SELECT 
    COUNT(*) as total,
    COUNT(leaf_id) as has_leaf_id,
    COUNT(app_category_id) as has_app_category,
    COUNT(matched_keyword) as has_keyword,
    COUNT(rule_id_applied) as has_rule,
    COUNT(CASE WHEN leaf_id IS NOT NULL AND app_category_id IS NULL THEN 1 END) as missing_app_category,
    COUNT(CASE WHEN rule_id_applied IS NOT NULL AND matched_keyword IS NULL THEN 1 END) as missing_keyword
  FROM transactions
`;

console.table(stats);

if (Number(stats[0].missing_app_category) > 0) {
  console.log(`\n⚠️  ${stats[0].missing_app_category} transactions have leaf_id but no app_category`);
  console.log('Checking if these leaf_ids exist in app_category_leaf...');
  
  const missing = await sql`
    SELECT DISTINCT t.leaf_id, tl.nivel_3_pt
    FROM transactions t
    LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
    LEFT JOIN app_category_leaf acl ON t.leaf_id = acl.leaf_id
    WHERE t.leaf_id IS NOT NULL 
    AND t.app_category_id IS NULL
    AND acl.leaf_id IS NULL
    LIMIT 10
  `;
  
  if (missing.length > 0) {
    console.log('\nLeaf IDs missing from app_category_leaf:');
    console.table(missing);
  }
}

console.log('\n✅ Backfill complete!');
