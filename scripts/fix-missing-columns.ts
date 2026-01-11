import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🔍 Checking for missing columns in transactions table...\n');

// Define all columns that should exist based on schema.ts
const requiredColumns = [
  { name: 'display', type: 'text', default: "'yes'::text", notNull: true },
  { name: 'conflict_flag', type: 'boolean', default: 'false', notNull: true },
  { name: 'classification_candidates', type: 'jsonb', default: null, notNull: false },
];

// Get current columns
const currentColumns = await sql`
  SELECT column_name, data_type, column_default, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'transactions'
`;

const currentColumnNames = currentColumns.map((col: any) => col.column_name);

console.log(`Found ${currentColumns.length} columns in transactions table\n`);

// Check for missing columns
const missingColumns = requiredColumns.filter(
  req => !currentColumnNames.includes(req.name)
);

if (missingColumns.length === 0) {
  console.log('✅ All required columns exist!');
} else {
  console.log(`⚠️  Found ${missingColumns.length} missing column(s):\n`);
  
  for (const col of missingColumns) {
    console.log(`  - ${col.name} (${col.type})`);
  }
  
  console.log('\n📝 Adding missing columns...\n');
  
  for (const col of missingColumns) {
    const notNullClause = col.notNull ? 'NOT NULL' : '';
    const defaultClause = col.default ? `DEFAULT ${col.default}` : '';
    
    const alterStatement = `ALTER TABLE transactions ADD COLUMN ${col.name} ${col.type} ${defaultClause} ${notNullClause}`.trim();
    
    console.log(`  Executing: ${alterStatement}`);
    
    try {
      await sql.unsafe(alterStatement);
      console.log(`  ✓ Added ${col.name}`);
    } catch (error: any) {
      console.error(`  ✗ Failed to add ${col.name}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Migration completed!');
}

// Verify final state
console.log('\n📊 Final verification...\n');
const finalColumns = await sql`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'transactions'
  AND column_name IN ('display', 'conflict_flag', 'classification_candidates')
`;

console.log('Required columns present:');
for (const req of requiredColumns) {
  const exists = finalColumns.some((col: any) => col.column_name === req.name);
  console.log(`  ${exists ? '✓' : '✗'} ${req.name}`);
}
