/**
 * Seed Script: Accounts
 *
 * Migrates existing accountSource strings to structured accounts table.
 * Maps transactions.accountSource → accounts.accountId
 *
 * Run: tsx server/seeds/002_accounts.ts
 */

import { db, pool } from "../db.js";
import { accounts, transactions } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const DEMO_USER_ID = "e9d1c9aa-fa90-4483-b132-b06db86792ac";

interface AccountMapping {
  accountSource: string;
  name: string;
  type: "credit_card" | "debit_card" | "bank_account" | "cash";
  accountNumber: string | null;
  icon: string;
  color: string;
}

function parseAccountSource(accountSource: string): AccountMapping {
  const source = accountSource.trim();

  // Pattern 1: "Amex - Name (1234)"
  const amexMatch = source.match(/Amex - (.+?) \((\d+)\)/i);
  if (amexMatch) {
    const [, name, lastDigits] = amexMatch;
    return {
      accountSource: source,
      name: `Amex - ${name}`,
      type: "credit_card",
      accountNumber: lastDigits,
      icon: "credit-card",
      color: "#3b82f6" // Blue
    };
  }

  // Pattern 2: "Sparkasse - 1234"
  const sparkasseMatch = source.match(/Sparkasse - (\d+)/i);
  if (sparkasseMatch) {
    const [, lastDigits] = sparkasseMatch;
    return {
      accountSource: source,
      name: `Sparkasse (${lastDigits})`,
      type: "bank_account",
      accountNumber: lastDigits,
      icon: "landmark",
      color: "#ef4444" // Red
    };
  }

  // Pattern 3: "M&M" or "Miles & More..."
  if (source.toLowerCase().includes("miles") || source.toLowerCase().includes("m&m")) {
    // Extract card number if present (e.g., "Miles & More Gold Credit Card;5310XXXXXXXX7340")
    const cardMatch = source.match(/(\d{4}X*\d{4})/);
    const lastDigits = cardMatch ? cardMatch[1].replace(/X/g, "").slice(-4) : null;

    return {
      accountSource: source,
      name: lastDigits ? `Miles & More (${lastDigits})` : "Miles & More",
      type: "credit_card",
      accountNumber: lastDigits,
      icon: "plane",
      color: "#8b5cf6" // Purple
    };
  }

  // Default: Unknown account
  return {
    accountSource: source,
    name: source.length > 30 ? source.substring(0, 30) + "..." : source,
    type: "credit_card",
    accountNumber: null,
    icon: "credit-card",
    color: "#6b7280" // Gray
  };
}

async function seedAccounts() {
  try {
    console.log("💳 Seeding accounts from existing transactions...\n");

    // Step 1: Get distinct accountSource values
    console.log("1️⃣ Analyzing existing accountSource values...");

    const distinctSources = await db
      .select({ accountSource: transactions.accountSource })
      .from(transactions)
      .where(eq(transactions.userId, DEMO_USER_ID))
      .groupBy(transactions.accountSource);

    console.log(`   Found ${distinctSources.length} distinct account sources\n`);

    if (distinctSources.length === 0) {
      console.log("⚠️  No transactions found. Skipping account creation.");
      return;
    }

    // Step 2: Create accounts
    console.log("2️⃣ Creating accounts...\n");

    const accountMappings: Map<string, string> = new Map(); // accountSource → accountId

    for (const { accountSource } of distinctSources) {
      if (!accountSource) continue;

      const mapping = parseAccountSource(accountSource);

      // Check if account already exists
      const existing = await db.query.accounts.findFirst({
        where: eq(accounts.name, mapping.name)
      });

      if (existing) {
        console.log(`   ⚠️  ${mapping.name} (already exists, skipping)`);
        accountMappings.set(accountSource, existing.id);
        continue;
      }

      // Create new account
      const [created] = await db.insert(accounts).values({
        userId: DEMO_USER_ID,
        name: mapping.name,
        type: mapping.type,
        accountNumber: mapping.accountNumber,
        icon: mapping.icon,
        color: mapping.color,
        isActive: true
      }).returning();

      accountMappings.set(accountSource, created.id);

      console.log(`   ✅ ${mapping.name.padEnd(30)} | ${mapping.type.padEnd(15)} | ${mapping.color}`);
    }

    console.log(`\n3️⃣ Linking transactions to accounts...`);

    // Step 3: Update transactions with accountId
    let updatedCount = 0;

    for (const [accountSource, accountId] of Array.from(accountMappings.entries())) {
      const result = await db
        .update(transactions)
        .set({ accountId })
        .where(eq(transactions.accountSource, accountSource));

      updatedCount += result.rowCount || 0;
    }

    console.log(`   ✅ Updated ${updatedCount} transactions\n`);

    console.log("4️⃣ Summary:");
    console.log(`   Accounts created: ${accountMappings.size}`);
    console.log(`   Transactions linked: ${updatedCount}`);

    console.log("\n✅ Seed completed!\n");

  } catch (error: any) {
    console.error("❌ Seed failed:", error.message);
    throw error;
  } finally {
    if (pool) await pool.end();
  }
}

// Run seed
seedAccounts().catch(console.error);
