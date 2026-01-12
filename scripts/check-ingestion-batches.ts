import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('Checking ingestionBatches table columns...\n');

const result = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'ingestion_batches'
  ORDER BY ordinal_position
`;

console.log(`Total columns: ${result.length}\n`);
console.table(result);

// Check schema.ts for expected columns
console.log('\n✓ ingestion_batches table exists with', result.length, 'columns');
