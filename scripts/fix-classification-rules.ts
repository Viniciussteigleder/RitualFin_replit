import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🗑️  Deleting incorrect classification rules...\n');

// These are the WRONG rules with category_1 = 'Alimentação' instead of 'Mercados'
const wrongRuleIds = [
  'ea3456c0-0574-4e47-a692-94f0e412b76f', // ALDI - Alimentação
  'f20e068a-cd8c-48a3-a4c8-dc1a70f28599', // EDEKA - Alimentação
  '2151893e-e6d7-423a-abf7-feeed628f092', // LIDL - Alimentação
  'e5f67b04-75f9-48b1-b811-d0b741ef0e87', // NETTO - Alimentação
  'e33b041f-9635-4166-abd0-9bda4565c4ad', // REWE - Alimentação
];

console.log('Rules to delete:');
for (const ruleId of wrongRuleIds) {
  const rule = await sql`SELECT id, category_1, category_2, category_3, key_words FROM rules WHERE id = ${ruleId}`;
  console.table(rule);
}

console.log('\n⚠️  These rules have category_1 = "Alimentação" but should use "Mercados"');
console.log('The correct system rules already exist with category_1 = "Mercado"\n');

// Delete the wrong rules
for (const ruleId of wrongRuleIds) {
  await sql`DELETE FROM rules WHERE id = ${ruleId}`;
  console.log(`✓ Deleted rule ${ruleId}`);
}

console.log('\n✅ All incorrect rules deleted!');

// Also fix the system rules to use 'Mercados' (plural) instead of 'Mercado' (singular)
console.log('\n🔧 Fixing system rules to use "Mercados" (plural)...\n');

const systemRules = await sql`
  SELECT id, category_1, key_words
  FROM rules
  WHERE is_system = true
  AND category_1 = 'Mercado'
`;

console.log(`Found ${systemRules.length} system rules with category_1 = 'Mercado'`);

for (const rule of systemRules) {
  await sql`UPDATE rules SET category_1 = 'Mercados' WHERE id = ${rule.id}`;
  console.log(`✓ Updated rule ${rule.id} (${rule.key_words}): Mercado → Mercados`);
}

console.log('\n✅ All system rules updated to use "Mercados"!');

// Verify final state
console.log('\n📊 Final state of supermarket rules:');
const finalRules = await sql`
  SELECT 
    id,
    category_1,
    category_2,
    category_3,
    key_words,
    is_system,
    priority
  FROM rules
  WHERE 
    active = true
    AND (
      key_words ILIKE '%aldi%'
      OR key_words ILIKE '%edeka%'
      OR key_words ILIKE '%lidl%'
      OR key_words ILIKE '%rewe%'
      OR key_words ILIKE '%netto%'
    )
  ORDER BY category_1, category_3
`;

console.table(finalRules);
