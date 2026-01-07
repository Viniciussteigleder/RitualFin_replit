import { createRequire } from "module";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function check() {
  const { db } = await import("../src/lib/db");
  const { users, transactions, rules, taxonomyLevel1, taxonomyLeaf } = await import("../src/lib/db/schema");
  const { count } = await import("drizzle-orm");

  const [u] = await db.select({ count: count() }).from(users);
  const [t] = await db.select({ count: count() }).from(transactions);
  const [r] = await db.select({ count: count() }).from(rules);
  const [l1] = await db.select({ count: count() }).from(taxonomyLevel1);
  const [leaf] = await db.select({ count: count() }).from(taxonomyLeaf);

  console.log("📊 DB Stats:");
  console.log(`Users: ${u.count}`);
  console.log(`Transactions: ${t.count}`);
  console.log(`Rules: ${r.count}`);
  console.log(`Taxonomy L1: ${l1.count}`);
  console.log(`Taxonomy Leaf: ${leaf.count}`);
  
  process.exit(0);
}

check().catch(console.error);
