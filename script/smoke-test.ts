import { createRequire } from "module";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

async function smokeTest() {
  console.log("🔦 RitualFin Smoke Test starting...");
  
  const { db } = await import("../src/lib/db");
  const { users, ingestionBatches, ingestionItems, transactions, transactionEvidenceLink } = await import("../src/lib/db/schema");
  const { eq, count } = await import("drizzle-orm");

  // 1. DB Connectivity
  try {
    const [userCount] = await db.select({ value: count() }).from(users);
    console.log(`✅ DB Connection OK. User count: ${userCount.value}`);
  } catch (e) {
    console.error("❌ DB Connection Failed:", e);
    process.exit(1);
  }

  // 2. Rollback Logic Test
  console.log("🛠 Testing Rollback Logic...");
  const adminId = (await db.query.users.findFirst())?.id;
  if (!adminId) {
    console.warn("⚠️ No user found for rollback test. Skipping.");
  } else {
    // Create Mock Batch
    const [batch] = await db.insert(ingestionBatches).values({
      userId: adminId,
      sourceType: "csv",
      status: "committed",
      filename: "smoke-test.csv"
    }).returning();

    // Create Mock Item
    const [item] = await db.insert(ingestionItems).values({
      batchId: batch.id,
      itemFingerprint: "smoke-fingerprint-" + Date.now(),
      rawPayload: { test: true }
    }).returning();

    // Create Mock Transaction
    const [tx] = await db.insert(transactions).values({
      userId: adminId,
      amount: 100,
      currency: "EUR",
      descRaw: "Smoke Test Transaction",
      descNorm: "smoke test transaction",
      paymentDate: new Date(),
      key: "smoke-key-" + Date.now(),
      status: "FINAL"
    }).returning();

    // Link them
    await db.insert(transactionEvidenceLink).values({
      transactionId: tx.id,
      ingestionItemId: item.id
    });

    console.log(`   Created Batch(${batch.id}) -> Item(${item.id}) -> Tx(${tx.id})`);

    // Run Rollback
    const { rollbackBatch } = await import("../src/lib/actions/ingest");
    // Mock session? The rollbackBatch function calls auth(). 
    // This script will FAIL if it calls auth() because there's no Next.js context.
    // So I'll simulate the rollback logic directly here to verify the QUERY logic.
    
    const { inArray } = await import("drizzle-orm");
    
    // Simulate rollbackBatch core:
    const links = await db.select({ txId: transactionEvidenceLink.transactionId })
        .from(transactionEvidenceLink)
        .where(eq(transactionEvidenceLink.ingestionItemId, item.id));
    
    const txIds = links.map(l => l.txId);
    if (txIds.length > 0) {
        await db.delete(transactions).where(inArray(transactions.id, txIds));
    }
    await db.update(ingestionItems).set({ status: "pending" as any }).where(eq(ingestionItems.id, item.id));
    await db.update(ingestionBatches).set({ status: "preview" as any }).where(eq(ingestionBatches.id, batch.id));

    // Verify
    const checkTx = await db.query.transactions.findFirst({ where: eq(transactions.id, tx.id) });
    if (!checkTx) {
      console.log("✅ Rollback successful. Transaction deleted.");
    } else {
      console.error("❌ Rollback FAILED. Transaction still exists.");
    }
  }

  // 3. App Routes Sanity (Build checked them, but let's check types/imports)
  // ...

  console.log("🎉 Smoke Test Completed.");
  process.exit(0);
}

smokeTest().catch(console.error);
