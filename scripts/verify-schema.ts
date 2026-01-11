import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('Checking transactions table columns...\n');

const result = await sql`
  SELECT column_name, data_type, column_default, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'transactions'
  ORDER BY ordinal_position
`;

console.log('Columns in transactions table:');
console.table(result);

// Check specifically for display and conflict_flag
const hasDisplay = result.some((row: any) => row.column_name === 'display');
const hasConflictFlag = result.some((row: any) => row.column_name === 'conflict_flag');

console.log(`\n✓ display column exists: ${hasDisplay}`);
console.log(`✓ conflict_flag column exists: ${hasConflictFlag}`);

if (!hasDisplay || !hasConflictFlag) {
  console.log('\n⚠️  Missing columns detected! Running migration...\n');
  
  if (!hasDisplay) {
    console.log('Adding display column...');
    await sql`ALTER TABLE transactions ADD COLUMN display text DEFAULT 'yes' NOT NULL`;
    console.log('✓ display column added');
  }
  
  if (!hasConflictFlag) {
    console.log('Adding conflict_flag column...');
    await sql`ALTER TABLE transactions ADD COLUMN conflict_flag boolean DEFAULT false NOT NULL`;
    console.log('✓ conflict_flag column added');
  }
  
  console.log('\n✅ All missing columns have been added!');
} else {
  console.log('\n✅ All required columns exist!');
}
