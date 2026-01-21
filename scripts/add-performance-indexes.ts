/**
 * Performance Optimization: Database Indexes
 * 
 * This script creates composite indexes for common query patterns
 * to significantly improve query performance on the transactions table.
 * 
 * Run with: npx tsx scripts/add-performance-indexes.ts
 */

import 'dotenv/config'; // Load .env file
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function addPerformanceIndexes() {
  console.log('🚀 Adding performance indexes...\n');

  try {
    // Index 1: User + Payment Date (most common query pattern)
    console.log('Creating index: idx_transactions_user_date...');
    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_date 
      ON transactions(user_id, payment_date DESC)
    `);
    console.log('✅ idx_transactions_user_date created\n');

    // Index 2: User + Needs Review (for pending transactions)
    console.log('Creating index: idx_transactions_user_review...');
    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_review 
      ON transactions(user_id, needs_review) 
      WHERE needs_review = true
    `);
    console.log('✅ idx_transactions_user_review created\n');

    // Index 3: User + Category + Date (for category filtering)
    console.log('Creating index: idx_transactions_user_category...');
    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_category 
      ON transactions(user_id, category_1, payment_date DESC)
    `);
    console.log('✅ idx_transactions_user_category created\n');

    // Index 4: User + Source + Date (for account filtering)
    console.log('Creating index: idx_transactions_user_source...');
    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_source 
      ON transactions(user_id, source, payment_date DESC)
    `);
    console.log('✅ idx_transactions_user_source created\n');

    // Index 5: User + App Category (for dashboard aggregations)
    console.log('Creating index: idx_transactions_user_app_category...');
    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_app_category 
      ON transactions(user_id, app_category_name, payment_date DESC)
    `);
    console.log('✅ idx_transactions_user_app_category created\n');

    console.log('🎉 All indexes created successfully!');
    console.log('\n📊 Verifying indexes...');

    // Verify indexes were created
    const indexes = await db.execute(sql`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'transactions' 
      AND indexname LIKE 'idx_transactions_%'
      ORDER BY indexname
    `);

    console.log('\nCreated indexes:');
    indexes.rows.forEach((row: any) => {
      console.log(`  - ${row.indexname}`);
    });

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

addPerformanceIndexes()
  .then(() => {
    console.log('\n✅ Index creation complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Index creation failed:', error);
    process.exit(1);
  });
