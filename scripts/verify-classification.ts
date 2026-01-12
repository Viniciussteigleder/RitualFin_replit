import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('📊 Verifying classification results...\\n');

// Check overall stats
const stats = await sql`
  SELECT 
    COUNT(*) as total,
    COUNT(leaf_id) as has_leaf_id,
    COUNT(app_category_id) as has_app_category,
    COUNT(matched_keyword) as has_keyword,
    COUNT(CASE WHEN leaf_id IS NOT NULL THEN 1 END) as classified,
    COUNT(CASE WHEN leaf_id IS NULL THEN 1 END) as unclassified
  FROM transactions
`;

console.log('Overall Statistics:');
console.table(stats);

// Check category breakdown
console.log('\\n📋 Category Breakdown (Level 1):');
const categoryBreakdown = await sql`
  SELECT 
    COALESCE(t1.nivel_1_pt, 'OPEN') as category,
    COUNT(*) as count,
    SUM(ABS(amount)) as total_amount
  FROM transactions t
  LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
  LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
  LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
  WHERE t.type = 'Despesa'
  AND t.display != 'no'
  GROUP BY COALESCE(t1.nivel_1_pt, 'OPEN')
  ORDER BY SUM(ABS(amount)) DESC
  LIMIT 10
`;

console.table(categoryBreakdown);

// Check app_category distribution
console.log('\\n📦 App Category Distribution:');
const appCategoryDist = await sql`
  SELECT 
    COALESCE(app_category_name, 'OPEN') as app_category,
    COUNT(*) as count
  FROM transactions
  GROUP BY COALESCE(app_category_name, 'OPEN')
  ORDER BY COUNT(*) DESC
  LIMIT 10
`;

console.table(appCategoryDist);

// Check matched keywords
console.log('\\n🔑 Top Matched Keywords:');
const topKeywords = await sql`
  SELECT 
    matched_keyword,
    COUNT(*) as count
  FROM transactions
  WHERE matched_keyword IS NOT NULL
  GROUP BY matched_keyword
  ORDER BY COUNT(*) DESC
  LIMIT 10
`;

console.table(topKeywords);

// Sample classified transactions
console.log('\\n✅ Sample Classified Transactions:');
const samples = await sql`
  SELECT 
    desc_norm,
    COALESCE(t1.nivel_1_pt, 'OPEN') as level_1,
    COALESCE(t2.nivel_2_pt, 'OPEN') as level_2,
    COALESCE(tl.nivel_3_pt, 'OPEN') as level_3,
    COALESCE(t.app_category_name, 'OPEN') as app_category,
    t.matched_keyword
  FROM transactions t
  LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
  LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
  LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
  WHERE t.leaf_id IS NOT NULL
  LIMIT 5
`;

console.table(samples);

console.log('\\n✅ Verification complete!');
