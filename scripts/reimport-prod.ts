
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log("🚀 STARTING FULL RE-IMPORT (PROD LOGIC) 🚀\n");

  const { db } = await import("../src/lib/db/db");
  const { transactions, ingestionBatches, ingestionItems, users } = await import("../src/lib/db/schema");
  const { uploadIngestionFileCore, commitBatchCore } = await import("../src/lib/actions/ingest");
  
  // 1. Get User
  const user = await db.query.users.findFirst();
  if (!user) {
      console.error("❌ No user found in DB. Cannot import.");
      process.exit(1);
  }
  const userId = user.id;
  console.log(`👤 Using User ID: ${userId} (${user.email})`);

  // 2. Clear Data
  console.log("🧹 Clearing old data...");
  try {
      await db.delete(transactions); 
      await db.delete(ingestionItems); 
      await db.delete(ingestionBatches);
  } catch (e) {
      console.error("Error clearing data:", e);
  }
  
  console.log("✅ Data cleared.");

  // 3. Import Files
  const filesDir = path.resolve(process.cwd(), "docs/Feedback_user/CSV_original");
  if (!fs.existsSync(filesDir)) {
      console.error("❌ Directory not found:", filesDir);
      process.exit(1);
  }

  const files = fs.readdirSync(filesDir).filter(f => f.toLowerCase().endsWith(".csv"));

  for (const file of files) {
      console.log(`\n📄 Processing: ${file}`);
      const filePath = path.join(filesDir, file);
      const buffer = fs.readFileSync(filePath);
      
      // A. Upload (Parse + Batch)
      console.log("   --- Uploading/Parsing ---");
      const uploadResult = await uploadIngestionFileCore(userId, buffer, file);
      
      if (!uploadResult.success || !uploadResult.batchId) {
          console.error(`   ❌ Upload Failed: ${uploadResult.error}`);
          continue;
      }
      console.log(`   ✅ Batch Created: ${uploadResult.batchId} (${uploadResult.newItems} items)`);

      // B. Commit (Classify + Link)
      console.log("   --- Committing (Classifying) ---");
      const commitResult = await commitBatchCore(userId, uploadResult.batchId);
      
      if (!commitResult.success) {
           console.error(`   ❌ Commit Failed: ${commitResult.error}`);
      } else {
           console.log(`   ✅ Committed: ${commitResult.importedCount} transactions.`);
      }
  }

  console.log("\n🎉 RE-IMPORT COMPLETE!");
  process.exit(0);
}

main().catch(console.error);
