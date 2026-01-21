/**
 * Database health check script
 * Checks for long-running queries and table locks before migrations
 */

import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

interface QueryActivity {
  pid: number;
  duration: string;
  query: string;
  state: string;
}

interface TableLock {
  relation: string;
  mode: string;
  granted: boolean;
}

async function checkLongRunningQueries(): Promise<QueryActivity[]> {
  const result = await db.execute<QueryActivity>(sql`
    SELECT 
      pid,
      now() - query_start as duration,
      query,
      state
    FROM pg_stat_activity
    WHERE state != 'idle'
      AND query NOT LIKE '%pg_stat_activity%'
      AND query_start < now() - interval '1 minute'
    ORDER BY duration DESC;
  `);

  return result.rows;
}

async function checkTableLocks(): Promise<TableLock[]> {
  const result = await db.execute<TableLock>(sql`
    SELECT 
      c.relname as relation,
      l.mode,
      l.granted
    FROM pg_locks l
    JOIN pg_class c ON l.relation = c.oid
    WHERE c.relkind = 'r'
      AND c.relname NOT LIKE 'pg_%'
    ORDER BY c.relname, l.mode;
  `);

  return result.rows;
}

async function checkDatabaseSize(): Promise<string> {
  const result = await db.execute<{ size: string }>(sql`
    SELECT pg_size_pretty(pg_database_size(current_database())) as size;
  `);

  return result.rows[0]?.size || 'unknown';
}

async function checkConnectionCount(): Promise<number> {
  const result = await db.execute<{ count: number }>(sql`
    SELECT count(*) as count
    FROM pg_stat_activity
    WHERE datname = current_database();
  `);

  return result.rows[0]?.count || 0;
}

async function main() {
  console.log('🔍 Database Health Check\n');

  try {
    // Check database size
    const dbSize = await checkDatabaseSize();
    console.log(`📊 Database Size: ${dbSize}`);

    // Check connection count
    const connections = await checkConnectionCount();
    console.log(`🔌 Active Connections: ${connections}\n`);

    // Check for long-running queries
    console.log('⏱️  Long-Running Queries (>1 minute):');
    const longQueries = await checkLongRunningQueries();
    
    if (longQueries.length === 0) {
      console.log('  ✅ No long-running queries');
    } else {
      console.log(`  ⚠️  Found ${longQueries.length} long-running queries:`);
      longQueries.forEach((q, i) => {
        console.log(`\n  Query ${i + 1}:`);
        console.log(`    PID: ${q.pid}`);
        console.log(`    Duration: ${q.duration}`);
        console.log(`    State: ${q.state}`);
        console.log(`    Query: ${q.query.substring(0, 100)}...`);
      });
    }

    // Check for table locks
    console.log('\n🔒 Table Locks:');
    const locks = await checkTableLocks();
    
    if (locks.length === 0) {
      console.log('  ✅ No table locks');
    } else {
      const ungrantedLocks = locks.filter(l => !l.granted);
      
      if (ungrantedLocks.length > 0) {
        console.log(`  ⚠️  Found ${ungrantedLocks.length} ungranted locks:`);
        ungrantedLocks.forEach(l => {
          console.log(`    - ${l.relation}: ${l.mode}`);
        });
      } else {
        console.log(`  ℹ️  ${locks.length} granted locks (normal)`);
      }
    }

    // Summary
    console.log('\n📋 Summary:');
    const hasIssues = longQueries.length > 0 || locks.some(l => !l.granted);
    
    if (hasIssues) {
      console.log('  ⚠️  Issues detected - consider waiting before migration');
      process.exit(1);
    } else {
      console.log('  ✅ Database is healthy - safe to proceed with migration');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
}

main();
