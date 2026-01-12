import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🔍 Investigating figure inconsistencies...\n');

// Get current month transactions
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

console.log(`Checking transactions for: ${startOfMonth.toISOString().split('T')[0]} to ${endOfMonth.toISOString().split('T')[0]}\n`);

// Method 1: Dashboard "Gasto Acumulado" calculation (CORRECT)
const method1 = await sql`
  SELECT 
    COALESCE(SUM(amount), 0) as total
  FROM transactions
  WHERE 
    type = 'Despesa'
    AND payment_date >= ${startOfMonth}
    AND payment_date <= ${endOfMonth}
    AND category_1 NOT IN ('Interno', 'Transferências')
    AND display != 'no'
`;

console.log('Method 1 - Dashboard "Gasto Acumulado" (SUM then ABS):');
console.log(`  Raw sum: ${method1[0].total}`);
console.log(`  Absolute: ${Math.abs(Number(method1[0].total))} €`);

// Method 2: Category breakdown (WRONG - using ABS first)
const method2 = await sql`
  SELECT 
    category_1,
    SUM(ABS(amount)) as total,
    COUNT(*) as count
  FROM transactions
  WHERE 
    type = 'Despesa'
    AND payment_date >= ${startOfMonth}
    AND payment_date <= ${endOfMonth}
    AND category_1 NOT IN ('Interno', 'Transferências')
    AND display != 'no'
  GROUP BY category_1
  ORDER BY SUM(ABS(amount)) DESC
`;

console.log('\nMethod 2 - Category Breakdown (ABS then SUM - WRONG):');
let totalMethod2 = 0;
method2.forEach((row: any) => {
  console.log(`  ${row.category_1}: ${row.total} € (${row.count} transactions)`);
  totalMethod2 += Number(row.total);
});
console.log(`  TOTAL: ${totalMethod2} €`);

// Method 3: CORRECT category breakdown (SUM then ABS)
const method3 = await sql`
  SELECT 
    category_1,
    ABS(SUM(amount)) as total,
    COUNT(*) as count
  FROM transactions
  WHERE 
    type = 'Despesa'
    AND payment_date >= ${startOfMonth}
    AND payment_date <= ${endOfMonth}
    AND category_1 NOT IN ('Interno', 'Transferências')
    AND display != 'no'
  GROUP BY category_1
  ORDER BY ABS(SUM(amount)) DESC
`;

console.log('\nMethod 3 - Category Breakdown (SUM then ABS - CORRECT):');
let totalMethod3 = 0;
method3.forEach((row: any) => {
  console.log(`  ${row.category_1}: ${row.total} € (${row.count} transactions)`);
  totalMethod3 += Number(row.total);
});
console.log(`  TOTAL: ${totalMethod3} €`);

// Check for positive amounts in Despesa transactions
console.log('\n⚠️  Checking for POSITIVE amounts in Despesa transactions:');
const positiveExpenses = await sql`
  SELECT 
    id,
    desc_norm,
    amount,
    category_1,
    type
  FROM transactions
  WHERE 
    type = 'Despesa'
    AND amount > 0
    AND payment_date >= ${startOfMonth}
    AND payment_date <= ${endOfMonth}
    AND category_1 NOT IN ('Interno', 'Transferências')
    AND display != 'no'
  ORDER BY amount DESC
  LIMIT 10
`;

if (positiveExpenses.length > 0) {
  console.log(`Found ${positiveExpenses.length} transactions marked as "Despesa" but with POSITIVE amounts:`);
  console.table(positiveExpenses);
} else {
  console.log('No positive amounts found in Despesa transactions.');
}

// Summary
console.log('\n📊 SUMMARY:');
console.log(`Dashboard shows: ${Math.abs(Number(method1[0].total))} €`);
console.log(`Categories (WRONG calc): ${totalMethod2} €`);
console.log(`Categories (CORRECT calc): ${totalMethod3} €`);
console.log(`\nDiscrepancy: ${Math.abs(totalMethod2 - Math.abs(Number(method1[0].total)))} €`);
