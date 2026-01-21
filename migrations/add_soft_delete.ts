/**
 * Migration: Add soft delete to transactions
 * Adds deleted_at column for soft delete functionality
 */

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export async function up() {
  await db.execute(sql`
    ALTER TABLE transactions
    ADD COLUMN deleted_at TIMESTAMP;
  `);

  await db.execute(sql`
    CREATE INDEX idx_transactions_deleted_at
    ON transactions(deleted_at)
    WHERE deleted_at IS NOT NULL;
  `);

  console.log('✅ Added deleted_at column to transactions');
}

export async function down() {
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_transactions_deleted_at;
  `);

  await db.execute(sql`
    ALTER TABLE transactions
    DROP COLUMN deleted_at;
  `);

  console.log('✅ Removed deleted_at column from transactions');
}
