
import { readFile } from "fs/promises";
import { join } from "path";
import { uploadIngestionFileCore, commitBatchCore } from "../src/lib/actions/ingest";
import { db } from "../src/lib/db";
import { ingestionBatches } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const userId = "6119b450-d6e2-441c-a987-b793dc9e282c";
    const filename = "2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv";
    const filePath = join(process.cwd(), "attached_assets", filename);

    console.log(`Reading file: ${filePath}`);
    const buffer = await readFile(filePath);

    console.log("Starting uploadIngestionFileCore...");
    const uploadResult = await uploadIngestionFileCore(userId, buffer, filename);

    if (!uploadResult.success) {
        console.error("Upload failed:", uploadResult.error);
        if (uploadResult.details) console.error("Details:", uploadResult.details);
        return;
    }

    console.log("Upload successful!");
    console.log(`Batch ID: ${uploadResult.batchId}`);
    console.log(`New Items: ${uploadResult.newItems}`);
    console.log(`Duplicates: ${uploadResult.duplicates}`);
    console.log(`Format detected: ${uploadResult.format}`);

    if (uploadResult.newItems === 0) {
        console.log("No new items to commit. Exiting.");
        return;
    }

    console.log("Starting commitBatchCore...");
    const commitResult = await commitBatchCore(userId, uploadResult.batchId);

    if (commitResult.error) {
        console.error("Commit failed:", commitResult.error);
        return;
    }

    console.log("Commit successful!");
    console.log(`Imported Count: ${commitResult.importedCount}`);
}

main().catch(console.error);
