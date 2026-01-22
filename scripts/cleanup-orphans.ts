
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { notInArray } from "drizzle-orm";

async function cleanupOrphans() {
  console.log("🧹 Starting Orphan Cleanup...");
  
  // Dynamic imports after env loaded
  const { db } = await import("../src/lib/db/db");
  const { ingestionBatches, sourceCsvSparkasse, sourceCsvMm, sourceCsvAmex } = await import("../src/lib/db/schema");


  // 1. Get all valid (committed) batch IDs
  // Actually, we want to keep rows for batches that are 'committed' OR 'preview' (active session).
  // But wait, user said "Miles and more shows duplicates but not in extract". 
  // This implies there are rows in source_csv_mm tied to a batch that was maybe deleted or is in a weird state.
  // The safest strict cleanup is: Delete source rows where batchId does not exist in ingestionBatches table.
  // AND Delete source rows where batchId exists but batch status is 'error' or 'processing' (stuck).
  // Ideally, 'preview' batches should be kept if the user is currently looking at them. But if they are old 'preview' batches that were abandoned, they lock the rows.
  
  // Strategy:
  // - Find batches that are NOT in ingestion_batches (Pure Orphans). Delete them.
  
  const allBatches = await db.select({ id: ingestionBatches.id, status: ingestionBatches.status }).from(ingestionBatches);
  const validBatchIds = allBatches.map(b => b.id);
  const committedBatchIds = allBatches.filter(b => b.status === "committed").map(b => b.id);
  
  console.log(`Found ${validBatchIds.length} total batches (${committedBatchIds.length} committed).`);

  // Helper for cleanup
  const cleanTable = async (tableName: string, tableObj: any) => {
      // 1. Delete Pure Orphans (Batch ID not in ingestion_batches)
      // Note: inArray with empty array throws error in some versions, check length
      let deletedOrphans = 0;
      if (validBatchIds.length > 0) {
          const res = await db.delete(tableObj).where(notInArray(tableObj.batchId, validBatchIds));
          // delete returns result with count in some drivers, or we just trust run.
          // drizzle-orm delete result is driver dependent. 
          // For node-postgres: result.rowCount
          deletedOrphans = (res as any).rowCount;
      } else {
          // If no batches exist at all, delete everything
          const res = await db.delete(tableObj);
          deletedOrphans = (res as any).rowCount;
      }
      console.log(`- ${tableName}: Deleted ${deletedOrphans} pure orphans (batch deleted).`);
      
      // 2. Delete "Stuck" Batches leftovers?
      // If a batch is in 'preview' but the user abandoned it, those rows are "reserved".
      // If the user re-uploads the same file, it generates a NEW batch ID.
      // The NEW batch sees the OLD source rows (from the abandoned preview) and marks them as duplicates.
      // This is the "Zombie" problem.
      
      // FIX: We should ideally delete source rows for any batch that is NOT 'committed'.
      // CAUTION: If the user is staring at a 'preview' screen RIGHT NOW, this will nuke their data.
      // But the user complained about duplicates preventing them from working.
      // So wiping all non-committed source rows is the brute force fix to clear the slate.
      
      if (committedBatchIds.length > 0) {
          const res = await db.delete(tableObj).where(notInArray(tableObj.batchId, committedBatchIds));
          console.log(`- ${tableName}: Deleted ${(res as any).rowCount} non-committed rows (abandoned previews).`);
      } else {
          // If no committed batches, delete everything to be safe
           const res = await db.delete(tableObj);
           console.log(`- ${tableName}: Deleted ${(res as any).rowCount} rows (no committed batches exist).`);
      }
  };

  await cleanTable("source_csv_sparkasse", sourceCsvSparkasse);
  await cleanTable("source_csv_mm", sourceCsvMm);
  await cleanTable("source_csv_amex", sourceCsvAmex);

  console.log("✅ Cleanup Complete. All non-committed source data removed.");
  process.exit(0);
}

cleanupOrphans().catch(console.error);
