
// import { db } from "@/lib/db"; <-- Removed
import { 
  transactions, 
  transactionEvidenceLink, 
  ingestionBatches, 
  ingestionItems,
  sourceCsvSparkasse,
  sourceCsvMm,
  sourceCsvAmex,
  printSessions,
  printLineItems,
  ocrExtractions, // New
  attachments,    // New
  accountBalanceSnapshots // New
} from "@/lib/db/schema";
// import { sql } from "drizzle-orm";

export async function resetDatabaseCore(db: any) {
  console.log("!!! RESETTING DATABASE CORE - STARTED !!!");

  try {
    // 0. Delete Attachments & OCR (Deepest dependencies)
    await db.delete(ocrExtractions);
    
    // accountBalanceSnapshots depends on attachments? Yes, attachmentId.
    // If we delete attachments, we might need to clear snapshots or update them. 
    // Let's wipe them for a full clean reset.
    await db.delete(accountBalanceSnapshots);

    await db.delete(attachments);

    // 1. Delete dependent tables first
    await db.delete(transactionEvidenceLink);
    await db.delete(printLineItems);
    await db.delete(printSessions);
    // await db.delete(accountBalanceSnapshots); 

    // 2. Delete Transactions
    await db.delete(transactions);

    // 3. Delete Source CSV Staging
    await db.delete(sourceCsvSparkasse);
    await db.delete(sourceCsvMm);
    await db.delete(sourceCsvAmex);

    // 4. Delete Ingestion Items
    await db.delete(ingestionItems);

    // 5. Delete Batches
    await db.delete(ingestionBatches);

    console.log("!!! RESETTING DATABASE CORE - COMPLETED !!!");

    return { success: true, message: "Base de dados resetada com sucesso." };
  } catch (error) {
    console.error("Reset failed", error);
    return { success: false, message: "Falha ao resetar banco de dados." };
  }
}
