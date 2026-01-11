import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('Adding classification_candidates column...\n');

try {
  // Try to add the column
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS classification_candidates jsonb`;
  console.log('✓ Column added successfully');
} catch (error: any) {
  console.error('✗ Error adding column:', error.message);
  console.error('Full error:', error);
}

// Verify
const check = await sql`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'transactions'
  AND column_name = 'classification_candidates'
`;

console.log(`\nVerification: ${check.length > 0 ? '✓ Column exists' : '✗ Column does not exist'}`);
