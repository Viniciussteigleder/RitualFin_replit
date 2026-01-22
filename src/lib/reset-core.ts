
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
  accountBalanceSnapshots, // New
  budgets,
  calendarEvents,
  goals,
  categoryGoals,
  rituals,
  ritualGoals
} from "@/lib/db/schema";
// import { sql } from "drizzle-orm";

export async function resetDatabaseCore(db: any) {
  console.log("!!! RESETTING DATABASE CORE - STARTED !!!");

  try {
    // 0. Delete Attachments & OCR (Deepest dependencies)
    await db.delete(ocrExtractions);
    
    // Deleting planning/ritual data
    await db.delete(categoryGoals);
    await db.delete(goals);
    await db.delete(budgets);
    await db.delete(ritualGoals);
    await db.delete(rituals);
    await db.delete(calendarEvents);
    
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
