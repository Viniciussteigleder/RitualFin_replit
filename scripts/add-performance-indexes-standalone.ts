/**
 * Performance Optimization: Database Indexes (Standalone)
 * 
 * This script creates composite indexes directly using DATABASE_URL
 * without requiring full environment validation.
 * 
 * Run with: DATABASE_URL="your_url" npx tsx scripts/add-performance-indexes-standalone.ts
 */

import { Client } from 'pg';

async function addPerformanceIndexes() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('\nUsage:');
    console.log('  DATABASE_URL="postgresql://..." npx tsx scripts/add-performance-indexes-standalone.ts');
    process.exit(1);
  }

  console.log('🚀 Adding performance indexes...\n');

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Index 1: User + Payment Date (most common query pattern)
    console.log('Creating index: idx_transactions_user_date...');
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_date 
      ON transactions(user_id, payment_date DESC)
    `);
    console.log('✅ idx_transactions_user_date created\n');

    // Index 2: User + Needs Review (for pending transactions)
    console.log('Creating index: idx_transactions_user_review...');
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_review 
      ON transactions(user_id, needs_review) 
      WHERE needs_review = true
    `);
    console.log('✅ idx_transactions_user_review created\n');

    // Index 3: User + Category + Date (for category filtering)
    console.log('Creating index: idx_transactions_user_category...');
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_category 
      ON transactions(user_id, category1, payment_date DESC)
    `);
    console.log('✅ idx_transactions_user_category created\n');

    // Index 4: User + Source + Date (for account filtering)
    console.log('Creating index: idx_transactions_user_source...');
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_source 
      ON transactions(user_id, source, payment_date DESC)
    `);
    console.log('✅ idx_transactions_user_source created\n');

    // Index 5: User + App Category (for dashboard aggregations)
    console.log('Creating index: idx_transactions_user_app_category...');
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_app_category 
      ON transactions(user_id, app_category_name, payment_date DESC)
    `);
    console.log('✅ idx_transactions_user_app_category created\n');

    console.log('🎉 All indexes created successfully!');
    console.log('\n📊 Verifying indexes...');

    // Verify indexes were created
    const result = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'transactions' 
      AND indexname LIKE 'idx_transactions_%'
      ORDER BY indexname
    `);

    console.log('\nCreated indexes:');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.indexname}`);
    });

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  } finally {
    await client.end();
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
