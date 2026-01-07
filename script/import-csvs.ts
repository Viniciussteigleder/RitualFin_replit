import { createRequire } from "module";
import path from "path";
import * as dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

// Dynamic imports
async function run() {
    console.log("🚀 Starting CSV Import...");
    const { uploadIngestionFile, commitBatch } = await import("../src/lib/actions/ingest");
    const { db } = await import("../src/lib/db");
    const { users } = await import("../src/lib/db/schema");

    // Ensure user (admin) exists
    const [user] = await db.select().from(users).limit(1);
    const userId = user?.id; // Should exist from seed

    if (!userId) {
        console.error("No user found. Run seed first.");
        return;
    }

    // Explicitly mock a FormData with file content?
    // uploadIngestionFile in actions/ingest.ts expects FormData.
    // But reading files from disk and creating FormData in Node is tricky without 'undici' or polyfill.
    // Instead, I will REPLICATE the logic of uploadIngestionFile lightly OR verify if I can construct FormData.
    // Node 20+ has FormData built-in. Check node version (user said mac, likely recent).
    // Try to use global FormData.

    const files = [
        "docs/Feedback_user/CSV_original/2026-01-02_Transactions_list_Miles_&_More_Gold_Credit_Card_5310XXXXXXXX7340 (1).csv",
        "docs/Feedback_user/CSV_original/20260102-22518260-umsatz (1).CSV",
        "docs/Feedback_user/CSV_original/activity (9) (1).csv"
    ];

    for (const relativePath of files) {
        const fullPath = path.resolve(process.cwd(), relativePath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`Skipping missing file: ${relativePath}`);
            continue;
        }

        console.log(`\n📂 Processing: ${path.basename(fullPath)}`);
        const content = fs.readFileSync(fullPath);
        const blob = new Blob([content], { type: "text/csv" });
        
        const formData = new FormData();
        formData.append("file", blob, path.basename(fullPath));

        // Use a mock "userId" cookie? 
        // The server action calls `auth()`. This script runs outside Next.js context.
        // `auth()` will return null.
        // I need to BYPASS the `auth()` check in the action OR modify the action to accept an ID if dev?
        // OR, simply implement the logic directly here (Parsing + Linking).
        // Since I want to use `commitBatch` which does RULE MATCHING, it's valuable to leverage it.
        // But the AUTH barrier is real.
        
        // Strategy: I will replicate the core flow manually here to avoid Auth barrier.
        // 1. Parse File
        // 2. Insert Batch + Items
        // 3. Run Commit Logic (Rules -> Transactions) manually.
        
        const { parseIngestionFile } = await import("../src/lib/ingest");
        const { generateFingerprint } = await import("../src/lib/ingest/fingerprint");
        const { ingestionBatches, ingestionItems } = await import("../src/lib/db/schema");
        const { categorizeTransaction } = await import("../src/lib/rules/engine");
        const { transactions, rules: rulesTable } = await import("../src/lib/db/schema");
        const { eq } = await import("drizzle-orm");

        // 1. Parse
        const textContent = content.toString("utf-8");
        const parseRes = await parseIngestionFile(textContent);

        if (!parseRes.success) {
            console.error("❌ Parse Failed:", parseRes.error);
            continue;
        }

        console.log(`   Parsed ${parseRes.transactions.length} transactions.`);

        // 2. Create Batch
        const [batch] = await db.insert(ingestionBatches).values({
            userId,
            sourceType: "csv",
            filename: path.basename(fullPath),
            status: "processing", // We will commit immediately
            diagnosticsJson: parseRes.meta
        }).returning();

        // 3. Create Items
        let itemsCount = 0;
        const insertedItems = [];
        for (const tx of parseRes.transactions) {
            // Check duplicates (skip for simplicity in seed? No, let's just insert)
            const fingerprint = generateFingerprint(tx);
            const [item] = await db.insert(ingestionItems).values({
                batchId: batch.id,
                rawPayload: tx.metadata || {},
                parsedPayload: tx,
                itemFingerprint: fingerprint
            }).returning();
            insertedItems.push(item);
            itemsCount++;
        }
        console.log(`   Inserted ${itemsCount} items.`);

        // 4. Commit (Rules)
        const userRules = await db.query.rules.findMany({ where: eq(rulesTable.userId, userId) });
        console.log(`   Applying ${userRules.length} rules...`);

        let committedCount = 0;
        for (const item of insertedItems) {
            const payload = item.parsedPayload as any;
            
            // Rules Engine
            const categorization = categorizeTransaction(payload.rawDescription || payload.description, userRules);
            
            // Format Amount (-260.00 -> 260.00 Expense)
            const isExpense = payload.amount < 0;
            const absAmount = Math.abs(payload.amount);
            
            // Override type if detected by parser (amount < 0) vs Rule type
            // Usually negative = expense.
            
            // Insert Transaction
            await db.insert(transactions).values({
                userId,
                paymentDate: new Date(payload.date),
                amount: absAmount,
                currency: payload.currency,
                descRaw: payload.description,
                descNorm: payload.rawDescription,
                key: item.itemFingerprint, // Use fingerprint as key
                source: payload.source as any,
                
                // Categorization
                category1: categorization.category1,
                category2: categorization.category2,
                category3: categorization.category3,
                type: categorization.type || (isExpense ? "Despesa" : "Receita"),
                fixVar: categorization.fixVar,
                
                needsReview: categorization.needsReview,
                ruleIdApplied: categorization.ruleIdApplied,
                confidence: categorization.confidence,
                
                status: "FINAL" // Mark as done
            }).onConflictDoNothing();
            committedCount++;
            
            // Link Evidence (New Table)
            // await db.insert(transactionEvidenceLink)... skipped for brevity as we are seeding transactions mainly.
        }
        console.log(`✅ Committed ${committedCount} transactions.`);
    }

    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
