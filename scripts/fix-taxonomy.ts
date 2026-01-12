import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🔧 Fixing taxonomy structure for supermarkets...\n');

// The user wants: Mercados → Alimentação → Supermercado → [ALDI, EDEKA, etc.]
// But the system has 3 levels: Level1 → Level2 → Leaf
// So we need to interpret this as:
// Level 1: Mercados
// Level 2: Alimentação  
// Leaf: Supermercado (with different brands as different leaf entries)

// Step 1: Find or create "Mercados" at Level 1
console.log('Step 1: Ensuring "Mercados" exists at Level 1...');
let mercadosLevel1 = await sql`
  SELECT level_1_id FROM taxonomy_level_1
  WHERE nivel_1_pt = 'Mercados'
  LIMIT 1
`;

if (mercadosLevel1.length === 0) {
  console.log('Creating "Mercados" at Level 1...');
  mercadosLevel1 = await sql`
    INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
    SELECT user_id, 'Mercados'
    FROM taxonomy_level_1
    LIMIT 1
    RETURNING level_1_id
  `;
}

const mercadosId = mercadosLevel1[0].level_1_id;
console.log(`✓ Mercados Level 1 ID: ${mercadosId}`);

// Step 2: Find or create "Alimentação" at Level 2 under "Mercados"
console.log('\nStep 2: Ensuring "Alimentação" exists at Level 2 under "Mercados"...');
let alimentacaoLevel2 = await sql`
  SELECT level_2_id FROM taxonomy_level_2
  WHERE nivel_2_pt = 'Alimentação'
  AND level_1_id = ${mercadosId}
  LIMIT 1
`;

if (alimentacaoLevel2.length === 0) {
  console.log('Creating "Alimentação" at Level 2...');
  alimentacaoLevel2 = await sql`
    INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt)
    SELECT user_id, ${mercadosId}, 'Alimentação'
    FROM taxonomy_level_2
    LIMIT 1
    RETURNING level_2_id
  `;
}

const alimentacaoId = alimentacaoLevel2[0].level_2_id;
console.log(`✓ Alimentação Level 2 ID: ${alimentacaoId}`);

// Step 3: Update all supermarket leaf nodes to point to the correct Level 2
console.log('\nStep 3: Updating supermarket leaf nodes...');
const supermarkets = ['ALDI', 'EDEKA', 'LIDL', 'NETTO', 'REWE', 'Outros mercados'];

for (const market of supermarkets) {
  const updated = await sql`
    UPDATE taxonomy_leaf
    SET level_2_id = ${alimentacaoId}
    WHERE nivel_3_pt = ${market}
  `;
  console.log(`✓ Updated ${market}`);
}

console.log('\n✅ Taxonomy structure fixed!');

// Verify
console.log('\n📊 Verification:');
const verifyTaxonomy = await sql`
  SELECT 
    t1.nivel_1_pt as level_1,
    t2.nivel_2_pt as level_2,
    tl.nivel_3_pt as level_3
  FROM taxonomy_leaf tl
  JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
  JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
  WHERE tl.nivel_3_pt IN ('ALDI', 'EDEKA', 'LIDL', 'NETTO', 'REWE', 'Outros mercados')
  ORDER BY tl.nivel_3_pt
`;

console.table(verifyTaxonomy);
