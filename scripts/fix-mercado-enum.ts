import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🔧 Fixing category_1 enum: Mercado → Mercados\n');

// Step 1: Add the new enum value "Mercados"
console.log('Step 1: Adding "Mercados" to the enum...');
try {
  await sql`ALTER TYPE category_1 ADD VALUE IF NOT EXISTS 'Mercados'`;
  console.log('✓ Added "Mercados" to enum');
} catch (error: any) {
  console.log(`⚠️  ${error.message}`);
}

// Step 2: Update all transactions using "Mercado" to "Mercados"
console.log('\nStep 2: Updating transactions...');
const transactionsUpdated = await sql`
  UPDATE transactions
  SET category_1 = 'Mercados'
  WHERE category_1 = 'Mercado'
`;
console.log(`✓ Updated ${transactionsUpdated.length} transactions`);

// Step 3: Update all rules using "Mercado" to "Mercados"
console.log('\nStep 3: Updating rules...');
const rulesUpdated = await sql`
  UPDATE rules
  SET category_1 = 'Mercados'
  WHERE category_1 = 'Mercado'
`;
console.log(`✓ Updated ${rulesUpdated.length} rules`);

// Step 4: Update budgets if any
console.log('\nStep 4: Updating budgets...');
const budgetsUpdated = await sql`
  UPDATE budgets
  SET category_1 = 'Mercados'
  WHERE category_1 = 'Mercado'
`;
console.log(`✓ Updated ${budgetsUpdated.length} budgets`);

// Step 5: Update calendar_events if any
console.log('\nStep 5: Updating calendar events...');
const eventsUpdated = await sql`
  UPDATE calendar_events
  SET category_1 = 'Mercados'
  WHERE category_1 = 'Mercado'
`;
console.log(`✓ Updated ${eventsUpdated.length} calendar events`);

// Step 6: Update category_goals if any
console.log('\nStep 6: Updating category goals...');
const goalsUpdated = await sql`
  UPDATE category_goals
  SET category_1 = 'Mercados'
  WHERE category_1 = 'Mercado'
`;
console.log(`✓ Updated ${goalsUpdated.length} category goals`);

console.log('\n✅ All data updated from "Mercado" to "Mercados"!');

// Verify
console.log('\n📊 Verification:');
const mercadoCount = await sql`SELECT COUNT(*) as count FROM transactions WHERE category_1 = 'Mercado'`;
const mercadosCount = await sql`SELECT COUNT(*) as count FROM transactions WHERE category_1 = 'Mercados'`;

console.log(`Transactions with "Mercado": ${mercadoCount[0].count}`);
console.log(`Transactions with "Mercados": ${mercadosCount[0].count}`);

// Note: We cannot remove the old enum value because PostgreSQL doesn't support removing enum values
console.log('\n⚠️  Note: The old "Mercado" value remains in the enum (PostgreSQL limitation)');
console.log('   but all data has been migrated to "Mercados"');
