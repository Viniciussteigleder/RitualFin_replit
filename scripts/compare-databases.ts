/**
 * Compare Local and Production Databases
 * 
 * This script shows what data exists in both databases for comparison
 */

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "../src/lib/db/schema.js";
import dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import ws from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

async function connectToDatabase(envFile: string) {
  dotenv.config({ path: path.join(__dirname, "..", envFile) });
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(`DATABASE_URL not found in ${envFile}`);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });
  
  return { db, pool };
}

async function getDatabaseStats(db: any, label: string) {
  console.log(`\n📊 ${label} Database Stats:`);
  console.log("─".repeat(60));

  try {
    const users = await db.select().from(schema.users);
    console.log(`   Users: ${users.length}`);
    
    const settings = await db.select().from(schema.settings);
    console.log(`   Settings: ${settings.length}`);
    
    const accounts = await db.select().from(schema.accounts);
    console.log(`   Accounts: ${accounts.length}`);
    
    const rules = await db.select().from(schema.rules);
    console.log(`   Rules: ${rules.length}`);
    
    const transactions = await db.select().from(schema.transactions);
    console.log(`   Transactions: ${transactions.length}`);
    
    const taxonomyLevel1 = await db.select().from(schema.taxonomyLevel1);
    console.log(`   Taxonomy Level 1: ${taxonomyLevel1.length}`);
    
    const taxonomyLevel2 = await db.select().from(schema.taxonomyLevel2);
    console.log(`   Taxonomy Level 2: ${taxonomyLevel2.length}`);
    
    const taxonomyLeaf = await db.select().from(schema.taxonomyLeaf);
    console.log(`   Taxonomy Leaf: ${taxonomyLeaf.length}`);
    
    const appCategory = await db.select().from(schema.appCategory);
    console.log(`   App Categories: ${appCategory.length}`);

    // Show sample user info if available
    if (users.length > 0) {
      console.log(`\n   Sample Users:`);
      users.slice(0, 3).forEach(user => {
        console.log(`      • ${user.email} (${user.name || 'No name'})`);
      });
    }

    // Show transaction date range if available
    if (transactions.length > 0) {
      const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
      const oldest = dates[0];
      const newest = dates[dates.length - 1];
      console.log(`\n   Transaction Date Range:`);
      console.log(`      From: ${oldest.toISOString().split('T')[0]}`);
      console.log(`      To: ${newest.toISOString().split('T')[0]}`);
    }

  } catch (error) {
    console.error(`   ❌ Error fetching stats: ${error}`);
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🔍 Compare Local vs Production Database                  ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  let localPool: any;
  let prodPool: any;

  try {
    // Connect to local database
    console.log("\n📡 Connecting to LOCAL database...");
    const { db: localDb, pool: lPool } = await connectToDatabase(".env.local");
    localPool = lPool;
    await getDatabaseStats(localDb, "LOCAL");

    // Connect to production database
    console.log("\n📡 Connecting to PRODUCTION database...");
    const { db: prodDb, pool: pPool } = await connectToDatabase(".env.production.local");
    prodPool = pPool;
    await getDatabaseStats(prodDb, "PRODUCTION");

    console.log("\n" + "─".repeat(60));
    console.log("\n💡 To sync local data to production, run:");
    console.log("   npm run db:sync-to-prod");
    console.log("\n⚠️  This will replace ALL production data with local data!");

  } catch (error) {
    console.error("\n❌ Comparison failed:", error);
    process.exit(1);
  } finally {
    if (localPool) await localPool.end();
    if (prodPool) await prodPool.end();
    process.exit(0);
  }
}

main();
