
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDiagnostics() {
  console.log("Starting Diagnostics Suite...");

  // Dynamic imports to ensure env vars form correct order
  const { db } = await import("../src/lib/db/index");
  const { eq, sum } = await import("drizzle-orm");
  const { users, ingestionBatches, transactions, transactionEvidenceLink, ingestionItems } = await import("../src/lib/db/schema");
  const { uploadIngestionFileCore, commitBatchCore, rollbackBatchCore } = await import("../src/lib/actions/ingest");
  const { categorizeTransaction } = await import("../src/lib/rules/engine");

  // 0. Setup Context
  const email = "vinicius.steigleder@gmail.com";
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    console.error(`User ${email} not found. Ensure seed-user.ts has run.`);
    process.exit(1);
  }
  const userId = user.id;
  console.log(`Context: User ID ${userId}`);

  const fixturePath = path.join(__dirname, "fixtures/diagnostics_suite_sparkasse.csv");
  if (!fs.existsSync(fixturePath)) {
    console.error("Fixture not found:", fixturePath);
    process.exit(1);
  }
  const buffer = fs.readFileSync(fixturePath);
  const fileSize = buffer.length;

  // =========================================================================================
  // D1 & D3: IMPORT IDEMPOTENCY & LEDGER INTEGRITY
  // =========================================================================================
  console.log("\n--- [D1/D3] Testing Import Idempotency & Ledger Integrity ---");

  // Step 2: First Import
  console.log("1. Importing fixture (First Run)...");
  const upload1 = await uploadIngestionFileCore(userId, buffer, "diagnostics_suite.csv");
  if (!upload1.success || !upload1.batchId) {
    console.error("Upload failed:", upload1);
    process.exit(1);
  }
  const batchId1 = upload1.batchId;
  console.log(`   Batch Created: ${batchId1}`);

  const commit1 = await commitBatchCore(userId, batchId1);
  if (!commit1.success) {
    console.error("Commit failed:", commit1);
    process.exit(1);
  }
  console.log(`   Commit Success. New Items: ${commit1.importedCount}`);

  // Ledger Check
  const txCount1 = await db.select({ count: sql<number>`count(*)` }).from(transactions).where(eq(transactions.uploadId, batchId1));
  const txTotal1 = await db.select({ total: sum(transactions.amount) }).from(transactions).where(eq(transactions.uploadId, batchId1));
  
  const count1Value = Number(txCount1[0].count);
  console.log(`   Ledger Count: ${count1Value}`);
  console.log(`   Ledger Total: ${txTotal1[0].total}`);

  // The fixture has 3 lines. 1 and 2 are duplicates. 3 is distinct.
  // Sparkasse dedupe logic is based on 'uniqueKey' which is userId+Key.
  // Key is constructed from contents. Row 1 and 2 are identical content, so identical Key.
  // So Row 2 should be skipped as duplicate of Row 1 (within source_csv table logic).
  // Row 3 is unique.
  // Total transactions imported should be 2.
  if (count1Value !== 2) {
      console.warn("WARNING: Expected 2 transactions (due to dedupe), got " + count1Value);
  } else {
      console.log("   Deduplication Verified (Row 1 and Row 2 treated as same key).");
  }

  // Step 3: Second Import (Idempotency)
  console.log("2. Re-importing same file (Idempotency Check)...");
  const upload2 = await uploadIngestionFileCore(userId, buffer, "diagnostics_suite.csv");
  const batchId2 = (upload2 as any).batchId;
  console.log(`   Batch 2 Created: ${batchId2}`);
  const upload2Res = upload2 as any; 
  console.log(`   Upload 2 Result: New=${upload2Res.newItems}, Duplicates=${upload2Res.duplicates}`);

  // If idempotency works, all rows in upload2 should be duplicates of existing rows in DB.
  // NOTE: uploadIngestionFileCore checks against source_csv_sparkasse table.
  
  if (upload2Res.newItems !== 0) {
      console.error("FAIL: Idempotency failed. Re-upload detected " + upload2Res.newItems + " new items.");
  } else {
      console.log("   PASS: Re-upload detected 0 new items.");
  }
  
  // D4: PROVENANCE
  console.log("\n--- [D4] Testing Provenance ---");
  const provenanceSample = await db.select().from(transactionEvidenceLink)
      .leftJoin(ingestionItems, eq(transactionEvidenceLink.ingestionItemId, ingestionItems.id))
      .where(eq(ingestionItems.batchId, batchId1))
      .limit(1);
      
  if (provenanceSample.length > 0) {
      console.log("   PASS: Provenance link found for batch transactions.");
  } else {
      console.error("FAIL: No provenance link found!");
  }

  // D2: RULES DETERMINISM & CORRECTNESS
  console.log("\n--- [D2] Testing Rules Engine Determinism ---");
  const testRuleBase = {
      userId,
      active: true,
      priority: 900,
      strict: true,
      category1: "Alimentação",
      category2: "Mercado",
      keyWords: "REWE SAGT DANKE",
      type: "Despesa",
      fixVar: "Variável",
      createdAt: new Date()
  };
  const rulesList: any[] = [
      { ...testRuleBase, id: "rule-test-1", leafId: null }
  ];
  
  const inputDesc = "REWE SAGT DANKE -- 12345";
  const run1 = categorizeTransaction(inputDesc, rulesList);
  const run2 = categorizeTransaction(inputDesc, rulesList);
  
  if (JSON.stringify(run1) === JSON.stringify(run2)) {
      console.log("   PASS: Rules are deterministic.");
  } else {
      console.error("FAIL: Rules not deterministic.");
  }
  
  if (run1.appliedRule?.ruleId === "rule-test-1") {
       console.log("   PASS: High priority rule matched correctly.");
  } else {
       console.error("FAIL: Rule failed to match. Result:", JSON.stringify(run1, null, 2));
       console.error("Rule tested:", JSON.stringify(rulesList[0], null, 2));
  }

  // D3: UNDO / ROLLBACK
  console.log("\n--- [D3/G3] Testing Rollback/Undo ---");
  const rollback1 = await rollbackBatchCore(userId, batchId1);
  console.log("   Rollback Result:", rollback1);
  
  const txCountAfterRollback = await db.select({ count: sql<number>`count(*)` }).from(transactions).where(eq(transactions.uploadId, batchId1));
  const countAfter = Number(txCountAfterRollback[0].count);
  
  if (countAfter === 0) {
      console.log("   PASS: Rollback deleted all transactions.");
  } else {
      console.error(`FAIL: Rollback left ${countAfter} transactions.`);
  }

  // Cleanup
  // We must delete source_csv entries first if there is no CASCADE. The error suggested constraint violation on source_csv_sparkasse.
  // We need to import the table object.
  const { sourceCsvSparkasse } = await import("../src/lib/db/schema");
  await db.delete(sourceCsvSparkasse).where(eq(sourceCsvSparkasse.batchId, batchId1));
  await db.delete(sourceCsvSparkasse).where(eq(sourceCsvSparkasse.batchId, batchId2));

  await db.delete(ingestionBatches).where(eq(ingestionBatches.id, batchId1));
  await db.delete(ingestionBatches).where(eq(ingestionBatches.id, batchId2));
  
  console.log("\n--- Diagnostics Complete ---");
  process.exit(0);
}

runDiagnostics().catch(e => {
    console.error(e);
    process.exit(1);
});
