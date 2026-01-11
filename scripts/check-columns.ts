import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('Checking all columns in transactions table:\n');

const allColumns = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'transactions'
  ORDER BY ordinal_position
`;

console.log(`Total columns: ${allColumns.length}\n`);

// Check for our specific columns
const targetColumns = ['display', 'conflict_flag', 'classification_candidates'];

for (const target of targetColumns) {
  const found = allColumns.find((col: any) => col.column_name === target);
  if (found) {
    console.log(`✓ ${target} (${found.data_type})`);
  } else {
    console.log(`✗ ${target} - MISSING`);
  }
}
