#!/usr/bin/env node

/**
 * API-level smoke tests for RitualFin core flows
 * Tests: DB connectivity, Create batch, Commit batch, Rollback batch
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/lib/db/index.js';
import { ingestionBatches, ingestionItems, transactions, transactionEvidenceLink } from '../src/lib/db/schema.js';
import { sql, eq } from 'drizzle-orm';

const TEST_USER_ID = 'smoke-test-user';
let testBatchId = null;
let testTransactionIds = [];

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  try {
    // Delete test transactions
    if (testTransactionIds.length > 0) {
      await db.delete(transactions).where(
        sql`${transactions.id} = ANY(${testTransactionIds})`
      );
    }
    // Delete test batch (cascade will delete items and evidence links)
    if (testBatchId) {
      await db.delete(ingestionBatches).where(eq(ingestionBatches.id, testBatchId));
    }
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('⚠️  Cleanup error:', error.message);
  }
}

async function testDbConnectivity() {
  console.log('\n📊 Test 1: Database Connectivity');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    return false;
  }
  
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL.substring(0, 30)}...`);
  
  try {
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
}

async function testCreateBatch() {
  console.log('\n📦 Test 2: Create Ingestion Batch');
  try {
    const [batch] = await db.insert(ingestionBatches).values({
      userId: TEST_USER_ID,
      sourceType: 'csv',
      fileName: 'smoke-test.csv',
      status: 'preview',
      totalRows: 3,
      validRows: 3,
      errorRows: 0,
    }).returning();

    testBatchId = batch.id;
    console.log(`✅ Batch created: ${testBatchId}`);

    // Create ingestion items
    const items = await db.insert(ingestionItems).values([
      {
        batchId: testBatchId,
        rowNumber: 1,
        rawData: { date: '2026-01-01', description: 'Test 1', amount: '-10.00' },
        parsedDate: new Date('2026-01-01'),
        parsedDescription: 'Test Transaction 1',
        parsedAmount: -10.00,
        status: 'valid',
      },
      {
        batchId: testBatchId,
        rowNumber: 2,
        rawData: { date: '2026-01-02', description: 'Test 2', amount: '-20.00' },
        parsedDate: new Date('2026-01-02'),
        parsedDescription: 'Test Transaction 2',
        parsedAmount: -20.00,
        status: 'valid',
      },
      {
        batchId: testBatchId,
        rowNumber: 3,
        rawData: { date: '2026-01-03', description: 'Test 3', amount: '50.00' },
        parsedDate: new Date('2026-01-03'),
        parsedDescription: 'Test Transaction 3',
        parsedAmount: 50.00,
        status: 'valid',
      },
    ]).returning();

    console.log(`✅ Created ${items.length} ingestion items`);
    return true;
  } catch (error) {
    console.error('❌ Create batch failed:', error.message);
    return false;
  }
}

async function testCommitBatch() {
  console.log('\n✅ Test 3: Commit Batch');
  try {
    // Get ingestion items
    const items = await db.select().from(ingestionItems).where(eq(ingestionItems.batchId, testBatchId));
    
    // Create transactions from items
    const transactionValues = items.map(item => ({
      userId: TEST_USER_ID,
      date: item.parsedDate,
      description: item.parsedDescription,
      amount: item.parsedAmount,
      source: 'Sparkasse',
      status: 'FINAL',
      receitaDespesa: item.parsedAmount > 0 ? 'Receita' : 'Despesa',
    }));

    const createdTransactions = await db.insert(transactions).values(transactionValues).returning();
    testTransactionIds = createdTransactions.map(t => t.id);
    
    console.log(`✅ Created ${createdTransactions.length} transactions`);

    // Create evidence links
    const evidenceLinks = items.map((item, idx) => ({
      transactionId: createdTransactions[idx].id,
      ingestionItemId: item.id,
    }));

    await db.insert(transactionEvidenceLink).values(evidenceLinks);
    console.log(`✅ Created ${evidenceLinks.length} evidence links`);

    // Update batch status to committed
    await db.update(ingestionBatches)
      .set({ 
        status: 'committed',
        committedAt: new Date(),
      })
      .where(eq(ingestionBatches.id, testBatchId));

    console.log('✅ Batch committed successfully');
    return true;
  } catch (error) {
    console.error('❌ Commit batch failed:', error.message);
    return false;
  }
}

async function testRollbackBatch() {
  console.log('\n🔄 Test 4: Rollback Batch');
  try {
    // Get evidence links for this batch
    const items = await db.select().from(ingestionItems).where(eq(ingestionItems.batchId, testBatchId));
    const itemIds = items.map(i => i.id);

    // Get transaction IDs from evidence links
    const evidenceLinks = await db.select()
      .from(transactionEvidenceLink)
      .where(sql`${transactionEvidenceLink.ingestionItemId} = ANY(${itemIds})`);

    const transactionIds = evidenceLinks.map(e => e.transactionId);
    console.log(`Found ${transactionIds.length} transactions to rollback`);

    // Delete evidence links
    await db.delete(transactionEvidenceLink)
      .where(sql`${transactionEvidenceLink.ingestionItemId} = ANY(${itemIds})`);
    console.log('✅ Deleted evidence links');

    // Delete transactions
    if (transactionIds.length > 0) {
      await db.delete(transactions)
        .where(sql`${transactions.id} = ANY(${transactionIds})`);
      console.log(`✅ Deleted ${transactionIds.length} transactions`);
    }

    // Update batch status to rolled_back
    await db.update(ingestionBatches)
      .set({ status: 'rolled_back' })
      .where(eq(ingestionBatches.id, testBatchId));

    console.log('✅ Batch rolled back successfully');

    // Verify transactions are gone
    const remainingTransactions = await db.select()
      .from(transactions)
      .where(sql`${transactions.id} = ANY(${transactionIds})`);

    if (remainingTransactions.length === 0) {
      console.log('✅ Verified: All transactions removed');
      return true;
    } else {
      console.error(`❌ Rollback verification failed: ${remainingTransactions.length} transactions still exist`);
      return false;
    }
  } catch (error) {
    console.error('❌ Rollback batch failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 RitualFin API Smoke Tests\n');
  console.log('=' .repeat(50));

  const results = {
    dbConnectivity: false,
    createBatch: false,
    commitBatch: false,
    rollbackBatch: false,
  };

  try {
    // Test 1: DB Connectivity
    results.dbConnectivity = await testDbConnectivity();
    if (!results.dbConnectivity) {
      throw new Error('Database connectivity test failed - aborting remaining tests');
    }

    // Test 2: Create Batch
    results.createBatch = await testCreateBatch();
    if (!results.createBatch) {
      throw new Error('Create batch test failed - aborting remaining tests');
    }

    // Test 3: Commit Batch
    results.commitBatch = await testCommitBatch();
    if (!results.commitBatch) {
      console.warn('⚠️  Commit batch test failed - skipping rollback test');
    } else {
      // Test 4: Rollback Batch
      results.rollbackBatch = await testRollbackBatch();
    }

  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
  } finally {
    await cleanup();
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 Test Summary:\n');
  console.log(`  DB Connectivity:  ${results.dbConnectivity ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Create Batch:     ${results.createBatch ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Commit Batch:     ${results.commitBatch ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Rollback Batch:   ${results.rollbackBatch ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = Object.values(results).every(r => r === true);
  console.log('\n' + '='.repeat(50));
  console.log(allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed');
  console.log('='.repeat(50));

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  cleanup().finally(() => process.exit(1));
});
