
import { db } from "../src/lib/db";
import { accounts, transactions, ingestionBatches, ingestionItems, transactionEvidenceLink } from "../src/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { parseSparkasseCSV } from "../src/lib/ingest/parsers/sparkasse";
import { parseMilesMoreCSV } from "../src/lib/ingest/parsers/miles-more";
import { parseAmexActivityCSV } from "../src/lib/ingest/parsers/amex";
import fs from "fs";
import path from "path";
import { generateFingerprint } from "../src/lib/ingest/fingerprint";
import { categorizeTransaction } from "../src/lib/rules/engine";

async function main() {
    console.log("Starting full data wipe and re-import...");

    // 1. Wipe
    await db.delete(transactionEvidenceLink);
    await db.delete(transactions);
    await db.delete(ingestionItems);
    await db.delete(ingestionBatches);
    console.log("Wiped transactions, items, batches, and links.");

    // 2. Identify Accounts
    const allAccounts = await db.select().from(accounts);
    const sparkasseAccount = allAccounts.find(a => a.name.includes("Sparkasse"));
    const amexAccount = allAccounts.find(a => a.name.includes("American Express"));
    const milesAccount = allAccounts.find(a => a.name.includes("Miles & More"));

    if (!sparkasseAccount || !amexAccount || !milesAccount) {
        console.error("Required accounts not found in DB. Please create them first.");
        process.exit(1);
    }

    const userId = sparkasseAccount.userId; // Assume same user for all

    const files = [
        { 
            path: "attached_assets/20251229-22518260-umsatz_1767103688511.CSV", 
            parser: parseSparkasseCSV, 
            account: sparkasseAccount,
            source: "Sparkasse"
        },
        { 
            path: "attached_assets/activity_(8)_1766875792745.csv", 
            parser: parseAmexActivityCSV, 
            account: amexAccount,
            source: "Amex"
        },
        { 
            path: "attached_assets/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv", 
            parser: parseMilesMoreCSV, 
            account: milesAccount,
            source: "M&M"
        }
    ];

    for (const f of files) {
        console.log(`Processing ${f.source} from ${f.path}...`);
        const content = fs.readFileSync(path.resolve(process.cwd(), f.path), "utf-8");
        const result = await f.parser(content);

        if (!result.success) {
            console.error(`Failed to parse ${f.path}:`, result.errors);
            continue;
        }

        const [batch] = await db.insert(ingestionBatches).values({
            userId,
            filename: path.basename(f.path),
            status: "committed",
            sourceType: "csv"
        }).returning();

        console.log(`Created batch ${batch.id} with ${result.transactions.length} items.`);

        for (const tx of result.transactions) {
            const fingerprint = generateFingerprint(tx);
            
            // Insert Ingestion Item
            const [item] = await db.insert(ingestionItems).values({
                batchId: batch.id,
                itemFingerprint: fingerprint,
                rawPayload: tx.metadata || {},
                parsedPayload: tx,
                status: "imported",
                source: f.source
            }).returning();

            // Simple Categorization (No AI for script to keep it fast/deterministic)
            // In a real app we'd use the engine, but here we just want to restore data with correct signs
            const categorization = {
                type: tx.amount < 0 ? "Despesa" : "Receita",
                needsReview: true
            };

            // Insert Transaction (onConflictDoNothing to skip internal duplicates)
            const [newTx] = await db.insert(transactions).values({
                userId,
                accountId: f.account.id,
                paymentDate: tx.date,
                descRaw: tx.rawDescription || tx.description,
                descNorm: tx.description,
                amount: tx.amount, // number
                currency: tx.currency,
                type: categorization.type as any,
                needsReview: true,
                source: f.source as any,
                key: fingerprint
            }).onConflictDoNothing().returning();

            if (newTx) {
                // Link only if transaction was actually inserted
                await db.insert(transactionEvidenceLink).values({
                    transactionId: newTx.id,
                    ingestionItemId: item.id
                }).onConflictDoNothing();
            }
        }
        console.log(`Imported ${result.transactions.length} transactions for ${f.source}.`);
    }

    console.log("Full re-import completed successfully.");
    process.exit(0);
}

main().catch(console.error);
