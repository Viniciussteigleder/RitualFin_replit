import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🔧 Adding new columns to transactions table...\n');

// Add matched_keyword column
console.log('Step 1: Adding matched_keyword column...');
try {
  await sql`
    ALTER TABLE transactions 
    ADD COLUMN IF NOT EXISTS matched_keyword text
  `;
  console.log('✓ matched_keyword column added');
} catch (error: any) {
  console.log(`⚠️  ${error.message}`);
}

// Add app_category_id column
console.log('\nStep 2: Adding app_category_id column...');
try {
  await sql`
    ALTER TABLE transactions 
    ADD COLUMN IF NOT EXISTS app_category_id varchar
  `;
  console.log('✓ app_category_id column added');
} catch (error: any) {
  console.log(`⚠️  ${error.message}`);
}

// Add app_category_name column
console.log('\nStep 3: Adding app_category_name column...');
try {
  await sql`
    ALTER TABLE transactions 
    ADD COLUMN IF NOT EXISTS app_category_name text
  `;
  console.log('✓ app_category_name column added');
} catch (error: any) {
  console.log(`⚠️  ${error.message}`);
}

console.log('\n✅ Schema update complete!');

// Verify columns exist
console.log('\n📊 Verifying new columns...');
const columns = await sql`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'transactions' 
  AND column_name IN ('matched_keyword', 'app_category_id', 'app_category_name')
  ORDER BY column_name
`;

console.table(columns);

if (columns.length === 3) {
  console.log('\n✅ All columns verified successfully!');
} else {
  console.log(`\n⚠️  Expected 3 columns, found ${columns.length}`);
}
