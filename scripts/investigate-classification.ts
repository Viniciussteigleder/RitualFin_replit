import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🔍 Investigating specific transactions...\n');

// Check the two specific transactions
const transaction1 = await sql`
  SELECT 
    id,
    desc_raw,
    desc_norm,
    alias_desc,
    category_1,
    category_2,
    category_3,
    leaf_id,
    classified_by,
    rule_id_applied,
    confidence
  FROM transactions
  WHERE id = '21193ec0-aa39-47f9-82c7-c8589ff95e64'
`;

const transaction2 = await sql`
  SELECT 
    id,
    desc_raw,
    desc_norm,
    alias_desc,
    category_1,
    category_2,
    category_3,
    leaf_id,
    classified_by,
    rule_id_applied,
    confidence
  FROM transactions
  WHERE id = '24460da2-60ad-4988-88c9-359d95b1a379'
`;

console.log('✅ CORRECT Transaction (21193ec0):');
console.table(transaction1);

console.log('\n❌ INCORRECT Transaction (24460da2):');
console.table(transaction2);

// Get the rules applied to these transactions
if (transaction1[0]?.rule_id_applied) {
  console.log('\n📋 Rule applied to CORRECT transaction:');
  const rule1 = await sql`
    SELECT * FROM rules WHERE id = ${transaction1[0].rule_id_applied}
  `;
  console.table(rule1);
}

if (transaction2[0]?.rule_id_applied) {
  console.log('\n📋 Rule applied to INCORRECT transaction:');
  const rule2 = await sql`
    SELECT * FROM rules WHERE id = ${transaction2[0].rule_id_applied}
  `;
  console.table(rule2);
}

// Check if there's a leaf_id and get the taxonomy
if (transaction1[0]?.leaf_id) {
  console.log('\n🌳 Taxonomy for CORRECT transaction:');
  const taxonomy1 = await sql`
    SELECT 
      tl.nivel_3_pt as level_3,
      t2.nivel_2_pt as level_2,
      t1.nivel_1_pt as level_1
    FROM taxonomy_leaf tl
    JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    WHERE tl.leaf_id = ${transaction1[0].leaf_id}
  `;
  console.table(taxonomy1);
}

if (transaction2[0]?.leaf_id) {
  console.log('\n🌳 Taxonomy for INCORRECT transaction:');
  const taxonomy2 = await sql`
    SELECT 
      tl.nivel_3_pt as level_3,
      t2.nivel_2_pt as level_2,
      t1.nivel_1_pt as level_1
    FROM taxonomy_leaf tl
    JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    WHERE tl.leaf_id = ${transaction2[0].leaf_id}
  `;
  console.table(taxonomy2);
}

// Check for any rules that might be causing the issue
console.log('\n🔍 Checking all active rules with keywords related to markets/supermarkets:');
const marketRules = await sql`
  SELECT 
    id,
    category_1,
    category_2,
    category_3,
    key_words,
    key_words_negative,
    priority,
    is_system,
    leaf_id
  FROM rules
  WHERE 
    active = true
    AND (
      key_words ILIKE '%aldi%'
      OR key_words ILIKE '%edeka%'
      OR key_words ILIKE '%lidl%'
      OR key_words ILIKE '%rewe%'
      OR key_words ILIKE '%netto%'
      OR key_words ILIKE '%mercado%'
      OR key_words ILIKE '%supermercado%'
    )
  ORDER BY priority DESC
`;

console.table(marketRules);
