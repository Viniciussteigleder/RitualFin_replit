/**
 * Sync Local Database to Production (Vercel)
 * 
 * This script exports all data from the local database and imports it to production.
 * It handles users, rules, transactions, settings, and accounts.
 */

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "../src/lib/db/schema.js";
import { eq, sql } from "drizzle-orm";
import dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import ws from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

interface ExportedData {
  users: any[];
  settings: any[];
  accounts: any[];
  rules: any[];
  transactions: any[];
  taxonomyLevel1: any[];
  taxonomyLevel2: any[];
  taxonomyLeaf: any[];
  appCategory: any[];
  leafToAppCategory: any[];
}

async function connectToDatabase(envFile: string) {
  // Load environment variables
  dotenv.config({ path: path.join(__dirname, "..", envFile) });
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(`DATABASE_URL not found in ${envFile}`);
  }

  console.log(`📡 Connecting to database from ${envFile}...`);
  
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });
  
  return { db, pool };
}

async function exportData(db: any): Promise<ExportedData> {
  console.log("\n📤 Exporting data from LOCAL database...\n");

  // Export users
  console.log("  → Exporting users...");
  const users = await db.select().from(schema.users);
  console.log(`    ✓ ${users.length} users exported`);

  // Export settings
  console.log("  → Exporting settings...");
  const settings = await db.select().from(schema.settings);
  console.log(`    ✓ ${settings.length} settings exported`);

  // Export accounts
  console.log("  → Exporting accounts...");
  const accounts = await db.select().from(schema.accounts);
  console.log(`    ✓ ${accounts.length} accounts exported`);

  // Export rules
  console.log("  → Exporting rules...");
  const rules = await db.select().from(schema.rules);
  console.log(`    ✓ ${rules.length} rules exported`);

  // Export transactions
  console.log("  → Exporting transactions...");
  const transactions = await db.select().from(schema.transactions);
  console.log(`    ✓ ${transactions.length} transactions exported`);

  // Export taxonomy data
  console.log("  → Exporting taxonomy level 1...");
  const taxonomyLevel1 = await db.select().from(schema.taxonomyLevel1);
  console.log(`    ✓ ${taxonomyLevel1.length} taxonomy level 1 exported`);

  console.log("  → Exporting taxonomy level 2...");
  const taxonomyLevel2 = await db.select().from(schema.taxonomyLevel2);
  console.log(`    ✓ ${taxonomyLevel2.length} taxonomy level 2 exported`);

  console.log("  → Exporting taxonomy leaf...");
  const taxonomyLeaf = await db.select().from(schema.taxonomyLeaf);
  console.log(`    ✓ ${taxonomyLeaf.length} taxonomy leaf exported`);

  console.log("  → Exporting app category...");
  const appCategory = await db.select().from(schema.appCategory);
  console.log(`    ✓ ${appCategory.length} app category exported`);

  console.log("  → Exporting leaf to app category...");
  const leafToAppCategory = await db.select().from(schema.leafToAppCategory);
  console.log(`    ✓ ${leafToAppCategory.length} leaf to app category exported`);

  return {
    users,
    settings,
    accounts,
    rules,
    transactions,
    taxonomyLevel1,
    taxonomyLevel2,
    taxonomyLeaf,
    appCategory,
    leafToAppCategory,
  };
}

async function clearProductionData(db: any) {
  console.log("\n🗑️  Clearing PRODUCTION database (keeping schema)...\n");

  try {
    // Delete in reverse order of dependencies
    console.log("  → Deleting transactions...");
    await db.delete(schema.transactions);
    
    console.log("  → Deleting leaf to app category mappings...");
    await db.delete(schema.leafToAppCategory);
    
    console.log("  → Deleting app categories...");
    await db.delete(schema.appCategory);
    
    console.log("  → Deleting taxonomy leaf...");
    await db.delete(schema.taxonomyLeaf);
    
    console.log("  → Deleting taxonomy level 2...");
    await db.delete(schema.taxonomyLevel2);
    
    console.log("  → Deleting taxonomy level 1...");
    await db.delete(schema.taxonomyLevel1);
    
    console.log("  → Deleting rules...");
    await db.delete(schema.rules);
    
    console.log("  → Deleting accounts...");
    await db.delete(schema.accounts);
    
    console.log("  → Deleting settings...");
    await db.delete(schema.settings);
    
    console.log("  → Deleting OAuth accounts...");
    await db.delete(schema.oauthAccounts);
    
    console.log("  → Deleting sessions...");
    await db.delete(schema.sessions);
    
    console.log("  → Deleting users...");
    await db.delete(schema.users);

    console.log("\n  ✓ Production database cleared successfully");
  } catch (error) {
    console.error("  ✗ Error clearing production database:", error);
    throw error;
  }
}

async function importData(db: any, data: ExportedData) {
  console.log("\n📥 Importing data to PRODUCTION database...\n");

  try {
    // Import users first
    if (data.users.length > 0) {
      console.log("  → Importing users...");
      for (const user of data.users) {
        await db.insert(schema.users).values(user).onConflictDoNothing();
      }
      console.log(`    ✓ ${data.users.length} users imported`);
    }

    // Import settings
    if (data.settings.length > 0) {
      console.log("  → Importing settings...");
      for (const setting of data.settings) {
        await db.insert(schema.settings).values(setting).onConflictDoNothing();
      }
      console.log(`    ✓ ${data.settings.length} settings imported`);
    }

    // Import accounts
    if (data.accounts.length > 0) {
      console.log("  → Importing accounts...");
      for (const account of data.accounts) {
        await db.insert(schema.accounts).values(account).onConflictDoNothing();
      }
      console.log(`    ✓ ${data.accounts.length} accounts imported`);
    }

    // Import taxonomy level 1
    if (data.taxonomyLevel1.length > 0) {
      console.log("  → Importing taxonomy level 1...");
      for (const item of data.taxonomyLevel1) {
        await db.insert(schema.taxonomyLevel1).values(item).onConflictDoNothing();
      }
      console.log(`    ✓ ${data.taxonomyLevel1.length} taxonomy level 1 imported`);
    }

    // Import taxonomy level 2
    if (data.taxonomyLevel2.length > 0) {
      console.log("  → Importing taxonomy level 2...");
      for (const item of data.taxonomyLevel2) {
        await db.insert(schema.taxonomyLevel2).values(item).onConflictDoNothing();
      }
      console.log(`    ✓ ${data.taxonomyLevel2.length} taxonomy level 2 imported`);
    }

    // Import taxonomy leaf
    if (data.taxonomyLeaf.length > 0) {
      console.log("  → Importing taxonomy leaf...");
      for (const item of data.taxonomyLeaf) {
        await db.insert(schema.taxonomyLeaf).values(item).onConflictDoNothing();
      }
      console.log(`    ✓ ${data.taxonomyLeaf.length} taxonomy leaf imported`);
    }

    // Import app category
    if (data.appCategory.length > 0) {
      console.log("  → Importing app category...");
      for (const item of data.appCategory) {
        await db.insert(schema.appCategory).values(item).onConflictDoNothing();
      }
      console.log(`    ✓ ${data.appCategory.length} app category imported`);
    }

    // Import leaf to app category
    if (data.leafToAppCategory.length > 0) {
      console.log("  → Importing leaf to app category...");
      for (const item of data.leafToAppCategory) {
        await db.insert(schema.leafToAppCategory).values(item).onConflictDoNothing();
      }
      console.log(`    ✓ ${data.leafToAppCategory.length} leaf to app category imported`);
    }

    // Import rules
    if (data.rules.length > 0) {
      console.log("  → Importing rules...");
      for (const rule of data.rules) {
        await db.insert(schema.rules).values(rule).onConflictDoNothing();
      }
      console.log(`    ✓ ${data.rules.length} rules imported`);
    }

    // Import transactions (can be large, so we batch them)
    if (data.transactions.length > 0) {
      console.log("  → Importing transactions...");
      const batchSize = 100;
      for (let i = 0; i < data.transactions.length; i += batchSize) {
        const batch = data.transactions.slice(i, i + batchSize);
        for (const transaction of batch) {
          await db.insert(schema.transactions).values(transaction).onConflictDoNothing();
        }
        console.log(`    ⏳ Imported ${Math.min(i + batchSize, data.transactions.length)}/${data.transactions.length} transactions`);
      }
      console.log(`    ✓ ${data.transactions.length} transactions imported`);
    }

    console.log("\n  ✓ All data imported successfully");
  } catch (error) {
    console.error("  ✗ Error importing data:", error);
    throw error;
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🔄 Sync Local Database to Production (Vercel)            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  let localPool: any;
  let prodPool: any;

  try {
    // Step 1: Connect to local database
    const { db: localDb, pool: lPool } = await connectToDatabase(".env.local");
    localPool = lPool;

    // Step 2: Export data from local
    const exportedData = await exportData(localDb);

    // Step 3: Connect to production database
    const { db: prodDb, pool: pPool } = await connectToDatabase(".env.production.local");
    prodPool = pPool;

    // Step 4: Show warning and ask for confirmation
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║  ⚠️  WARNING: DESTRUCTIVE OPERATION                        ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("\n📊 Data to be synced:");
    console.log(`   • Users: ${exportedData.users.length}`);
    console.log(`   • Settings: ${exportedData.settings.length}`);
    console.log(`   • Accounts: ${exportedData.accounts.length}`);
    console.log(`   • Rules: ${exportedData.rules.length}`);
    console.log(`   • Transactions: ${exportedData.transactions.length}`);
    console.log(`   • Taxonomy Items: ${exportedData.taxonomyLevel1.length + exportedData.taxonomyLevel2.length + exportedData.taxonomyLeaf.length}`);
    console.log(`   • App Categories: ${exportedData.appCategory.length}`);
    
    console.log("\n⚠️  This will:");
    console.log("   1. DELETE ALL existing data in PRODUCTION database");
    console.log("   2. Replace it with data from your LOCAL database");
    console.log("   3. This action CANNOT be undone without a backup");
    
    console.log("\n❓ Do you want to continue? (yes/no): ");
    
    // Read user input
    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question("", (ans) => {
        rl.close();
        resolve(ans.toLowerCase().trim());
      });
    });

    if (answer !== "yes" && answer !== "y") {
      console.log("\n❌ Sync cancelled by user.");
      process.exit(0);
    }

    console.log("\n✅ Confirmation received. Starting sync...");

    // Step 5: Clear production database
    await clearProductionData(prodDb);

    // Step 6: Import data to production
    await importData(prodDb, exportedData);

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║  ✅ Sync completed successfully!                          ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("\n📊 Final Summary:");
    console.log(`   • Users: ${exportedData.users.length}`);
    console.log(`   • Settings: ${exportedData.settings.length}`);
    console.log(`   • Accounts: ${exportedData.accounts.length}`);
    console.log(`   • Rules: ${exportedData.rules.length}`);
    console.log(`   • Transactions: ${exportedData.transactions.length}`);
    console.log(`   • Taxonomy Items: ${exportedData.taxonomyLevel1.length + exportedData.taxonomyLevel2.length + exportedData.taxonomyLeaf.length}`);
    console.log(`   • App Categories: ${exportedData.appCategory.length}`);
    console.log("\n🌐 Your production database now matches your local database!");
    console.log("🔗 Visit: https://ritual-fin-replit.vercel.app to verify");

  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  } finally {
    // Close connections
    if (localPool) await localPool.end();
    if (prodPool) await prodPool.end();
    process.exit(0);
  }
}

main();
