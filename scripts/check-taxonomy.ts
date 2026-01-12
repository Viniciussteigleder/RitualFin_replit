import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🌳 Checking taxonomy for supermarket categories...\n');

// Get the taxonomy for the supermarket leaf nodes
const taxonomy = await sql`
  SELECT 
    t1.nivel_1_pt as level_1,
    t2.nivel_2_pt as level_2,
    tl.nivel_3_pt as level_3,
    tl.leaf_id
  FROM taxonomy_leaf tl
  JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
  JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
  WHERE tl.nivel_3_pt IN ('ALDI', 'EDEKA', 'LIDL', 'NETTO', 'REWE', 'Outros mercados')
  ORDER BY tl.nivel_3_pt
`;

console.log('Current taxonomy structure:');
console.table(taxonomy);

console.log('\n📋 Expected structure (from user):');
console.log('Mercados → Alimentação → Supermercado → ALDI');
console.log('Mercados → Alimentação → Supermercado → EDEKA');
console.log('Mercados → Alimentação → Supermercado → LIDL');
console.log('Mercados → Alimentação → Supermercado → NETTO');
console.log('Mercados → Alimentação → Supermercado → Outros mercados');
console.log('Mercados → Alimentação → Supermercado → REWE');

// Check if the structure matches
const hasCorrectStructure = taxonomy.every((row: any) => 
  row.level_1 === 'Mercados' && 
  row.level_2 === 'Alimentação'
);

if (hasCorrectStructure) {
  console.log('\n✅ Taxonomy structure is CORRECT!');
} else {
  console.log('\n❌ Taxonomy structure needs fixing!');
  console.log('\nActual structure found:');
  taxonomy.forEach((row: any) => {
    console.log(`${row.level_1} → ${row.level_2} → ${row.level_3}`);
  });
}
