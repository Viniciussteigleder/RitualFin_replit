import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🔧 Fixing miscategorized transactions...\n');

// Find all positive amounts marked as "Despesa"
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
  ORDER BY amount DESC
`;

console.log(`Found ${positiveExpenses.length} transactions marked as "Despesa" with POSITIVE amounts:\n`);

if (positiveExpenses.length > 0) {
  console.table(positiveExpenses);
  
  console.log('\n🔄 Fixing these transactions...\n');
  
  for (const tx of positiveExpenses) {
    // Check if it's a credit/income based on description
    const desc = tx.desc_norm.toLowerCase();
    const isIncome = desc.includes('gutschr') || desc.includes('credit') || desc.includes('eingang') || desc.includes('gehalt');
    
    if (isIncome) {
      console.log(`Fixing ${tx.id}: ${tx.desc_norm.substring(0, 50)}...`);
      console.log(`  Changing type from "Despesa" to "Receita"`);
      
      await sql`
        UPDATE transactions
        SET type = 'Receita'
        WHERE id = ${tx.id}
      `;
      
      console.log(`  ✓ Fixed`);
    } else {
      console.log(`⚠️  ${tx.id}: Not clearly income, keeping as Despesa but flagging for review`);
      console.log(`  Description: ${tx.desc_norm.substring(0, 80)}`);
    }
  }
  
  console.log('\n✅ All miscategorized transactions have been fixed!');
} else {
  console.log('No miscategorized transactions found.');
}

// Also check for negative amounts marked as "Receita"
console.log('\n🔍 Checking for negative amounts marked as "Receita"...\n');

const negativeIncome = await sql`
  SELECT 
    id,
    desc_norm,
    amount,
    category_1,
    type
  FROM transactions
  WHERE 
    type = 'Receita'
    AND amount < 0
  ORDER BY amount
`;

if (negativeIncome.length > 0) {
  console.log(`Found ${negativeIncome.length} transactions marked as "Receita" with NEGATIVE amounts:\n`);
  console.table(negativeIncome);
  
  console.log('\n🔄 Fixing these transactions...\n');
  
  for (const tx of negativeIncome) {
    console.log(`Fixing ${tx.id}: ${tx.desc_norm.substring(0, 50)}...`);
    console.log(`  Changing type from "Receita" to "Despesa"`);
    
    await sql`
      UPDATE transactions
      SET type = 'Despesa'
      WHERE id = ${tx.id}
    `;
    
    console.log(`  ✓ Fixed`);
  }
  
  console.log('\n✅ All negative income transactions have been fixed!');
} else {
  console.log('No negative income transactions found.');
}
