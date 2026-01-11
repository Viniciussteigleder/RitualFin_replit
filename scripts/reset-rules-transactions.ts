
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // Load env vars first

import { db } from "@/lib/db";
import { transactions, rules, transactionEvidenceLink, printLineItems } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Starting database cleanup...");
  if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not set");
      process.exit(1);
  }

  try {
    // 1. Delete dependent tables if necessary
    console.log("Deleting transaction evidence links...");
    try { await db.delete(transactionEvidenceLink); } catch (e) { console.log("Evidence link deletion error/skip:", e.message); }

    console.log("Deleting print line items...");
    try { await db.delete(printLineItems); } catch (e) { console.log("Print line deletion error/skip (maybe table invalid):", e.message); }

    // 2. Delete Transactions
    console.log("Deleting transactions...");
    try { await db.delete(transactions); } catch (e) { 
        // If table schema changed in code but not in DB, Drizzle might issue 'DELETE FROM "transactions"'.
        // This should work unless table doesn't exist.
        console.log("Transactions deletion error:", e.message);
    }

    // 3. Delete Rules
    console.log("Deleting rules...");
    try { await db.delete(rules); } catch (e) { console.log("Rules deletion error:", e.message); }

    console.log("Successfully attempted deletion.");
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
