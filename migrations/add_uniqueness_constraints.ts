/**
 * Migration: Add uniqueness constraints
 * Ensures data integrity at database level
 */

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export async function up() {
  console.log('🔒 Adding uniqueness constraints...\n');

  // 1. Add unique constraint on ingestion_items fingerprint per batch
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_ingestion_items_batch_fingerprint
    ON ingestion_items(batch_id, item_fingerprint);
  `);
  console.log('✅ Added unique constraint: ingestion_items(batch_id, item_fingerprint)');

  // 2. Ensure transactions key is unique per user (already exists, verify)
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS transactions_unique_key_per_user
    ON transactions(user_id, key);
  `);
  console.log('✅ Verified unique constraint: transactions(user_id, key)');

  // 3. Add unique constraint on source CSV tables
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_sparkasse_unique_row
    ON source_csv_sparkasse(user_id, key)
    WHERE key IS NOT NULL;
  `);
  console.log('✅ Added unique constraint: source_csv_sparkasse(user_id, key)');

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mm_unique_row
    ON source_csv_mm(user_id, key)
    WHERE key IS NOT NULL;
  `);
  console.log('✅ Added unique constraint: source_csv_mm(user_id, key)');

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_amex_unique_row
    ON source_csv_amex(user_id, key)
    WHERE key IS NOT NULL;
  `);
  console.log('✅ Added unique constraint: source_csv_amex(user_id, key)');

  // 4. Add unique constraint on batch file hash
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_batch_file_hash
    ON ingestion_batches(user_id, file_hash_sha256)
    WHERE file_hash_sha256 IS NOT NULL;
  `);
  console.log('✅ Added unique constraint: ingestion_batches(user_id, file_hash_sha256)');

  console.log('\n✨ Uniqueness constraints added successfully');
}

export async function down() {
  console.log('🔓 Removing uniqueness constraints...\n');

  await db.execute(sql`DROP INDEX IF EXISTS idx_ingestion_items_batch_fingerprint;`);
  await db.execute(sql`DROP INDEX IF EXISTS idx_sparkasse_unique_row;`);
  await db.execute(sql`DROP INDEX IF EXISTS idx_mm_unique_row;`);
  await db.execute(sql`DROP INDEX IF EXISTS idx_amex_unique_row;`);
  await db.execute(sql`DROP INDEX IF EXISTS idx_batch_file_hash;`);

  console.log('✅ Uniqueness constraints removed');
}
