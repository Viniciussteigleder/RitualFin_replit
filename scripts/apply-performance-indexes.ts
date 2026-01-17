#!/usr/bin/env tsx

/**
 * Apply performance optimization indexes to the database
 * Run with: npm run db:optimize
 */

import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function applyPerformanceIndexes() {
  console.log("🚀 Applying performance optimization indexes...\n");

  const migrationPath = path.join(__dirname, "../migrations/performance_indexes.sql");
  const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

  // Split by semicolon and filter out comments/empty lines
  const statements = migrationSQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    try {
      console.log(`Executing: ${statement.substring(0, 60)}...`);
      await db.execute(sql.raw(statement));
      successCount++;
      console.log("✅ Success\n");
    } catch (error: any) {
      errorCount++;
      console.error(`❌ Error: ${error.message}\n`);
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`\n🎯 Performance indexes applied successfully!`);
  
  process.exit(0);
}

applyPerformanceIndexes().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
