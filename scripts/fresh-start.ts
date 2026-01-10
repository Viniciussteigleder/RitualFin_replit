
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

import fs from "fs";
import path from "path";
import crypto from "crypto";
// db import moved to main()
import { 
    sourceCsvSparkasse, 
    sourceCsvMm, 
    sourceCsvAmex, 
    transactions, 
    ingestionBatches, 
    users,
    rules,
    aliasAssets
} from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
// Correct Imports for Batch Parsers
import { parseSparkasseCSV } from "../src/lib/ingest/parsers/sparkasse";
import { parseMilesMoreCSV } from "../src/lib/ingest/parsers/miles-more";
import { parseAmexActivityCSV } from "../src/lib/ingest/parsers/amex";
import { execSync } from "child_process";

// Simple helper to parse generic DE amount for source table Raw value
function parseAmountDE(val: any): number | null {
    if (!val) return null;
    if (typeof val === 'number') return val;
    // "-260,00" -> -260.00
    // "1.000,00" -> 1000.00
    const clean = val.toString().replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? null : parsed;
}

function parseDateGeneric(val: any): Date | null {
    if (!val) return null;
    let str = val.toString();
    
    // Try DE format DD.MM.YYYY or DD.MM.YY
    if (str.includes(".")) {
        const parts = str.split(".");
        if (parts.length === 3) {
            let y = parseInt(parts[2]);
            if (!isNaN(y)) {
               if (y < 100) y += 2000;
               // YYYY-MM-DD
               const d = new Date(`${y}-${parts[1]}-${parts[0]}`);
               if (!isNaN(d.getTime())) return d;
            }
        }
    }
    
    // Try Slash DD/MM/YYYY
    if (str.includes("/")) {
        const parts2 = str.split("/");
        if (parts2.length === 3) { 
            let y = parseInt(parts2[2]);
             if (!isNaN(y)) {
               if (y < 100) y += 2000;
               const d = new Date(`${y}-${parts2[1]}-${parts2[0]}`);
               if (!isNaN(d.getTime())) return d;
            }
        }
    }

    // Fallback
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
    
    return null;
}


function dateToDbString(d: Date | null): string | null {
    if (!d) return null;
    return d.toISOString().split("T")[0];
}

async function main() {
    console.log("🚀 STARTING FRESH START ETL");
    
    // Dynamic import to allow dotenv loading first
    const { db } = await import("../src/lib/db");

    // 1. Get User
    const user = await db.query.users.findFirst({
        where: eq(users.email, "vinicius.steigleder@gmail.com") 
    });
    if (!user) throw new Error("User not found: vinicius.steigleder@gmail.com");
    const userId = user.id;
    console.log(`👤 User: ${userId}`);

    // 2. Clear Data
    console.log("🧹 Clearing Data...");
    await db.delete(transactions);
    await db.delete(sourceCsvSparkasse);
    await db.delete(sourceCsvMm);
    await db.delete(sourceCsvAmex);
    // await db.delete(ingestionBatches); // Optional but good for clean slate
    console.log("✅ Data Cleared.");

    // 3. Process Files
    const files = [
        { type: "Sparkasse", path: "docs/Feedback_user/CSV_original/20260102-22518260-umsatz (1).CSV" },
        { type: "M&M", path: "docs/Feedback_user/CSV_original/2026-01-02_Transactions_list_Miles_&_More_Gold_Credit_Card_5310XXXXXXXX7340 (1).csv" },
        { type: "Amex", path: "docs/Feedback_user/CSV_original/activity (9) (1).csv" }
    ];

    const txToInsert: any[] = [];
    const BATCH_SIZE = 100;

    for (const file of files) {
        if (!fs.existsSync(file.path)) {
            console.warn(`⚠️ File not found: ${file.path}`);
            continue;
        }
        console.log(`\n📄 Processing ${file.type}: ${file.path}`);
        const content = fs.readFileSync(file.path, 'utf-8');
        
        // Parse using component parsers
        let result: any;
        if (file.type === "Sparkasse") result = await parseSparkasseCSV(content);
        else if (file.type === "M&M") result = await parseMilesMoreCSV(content);
        else if (file.type === "Amex") result = await parseAmexActivityCSV(content);

        if (!result || !result.success) {
            console.error(`❌ Parse failed for ${file.type}:`, result?.errors);
            continue;
        }

        console.log(`   Found ${result.transactions.length} rows.`);

        // Process Parsed Txs
        for (const tx of result.transactions) {
            const row = tx.metadata || {};
            const rowFingerprint = crypto.createHash("sha256").update(JSON.stringify(row)).digest("hex");
            
            // Populate Source Table
            try {
                if (file.type === "Sparkasse") {
                     await db.insert(sourceCsvSparkasse).values({
                         userId,
                         key: tx.key,
                         keyDesc: tx.keyDesc,
                         rowFingerprint,
                         auftragskonto: row["Auftragskonto"],
                         buchungstag: dateToDbString(parseDateGeneric(row["Buchungstag"])),
                         valutadatum: dateToDbString(parseDateGeneric(row["Valutadatum"])),
                         buchungstext: row["Buchungstext"],
                         verwendungszweck: row["Verwendungszweck"],
                         glaeubigerId: row["Glaeubiger ID"] || row["Glaeubiger-ID"], // common var
                         mandatsreferenz: row["Mandatsreferenz"],
                         kundenreferenz: row["Kundenreferenz (End-to-End)"],
                         sammlerreferenz: row["Sammlerreferenz"],
                         lastschrifteinreicherId: row["Lastschrifteinreicher-ID"],
                         beguenstigterZahlungspflichtiger: row["Beguenstigter/Zahlungspflichtiger"],
                         iban: row["IBAN"] || row["Kontonummer/IBAN"],
                         bic: row["BIC"],
                         betrag: parseAmountDE(row["Betrag"]),
                         waehrung: row["Waehrung"],
                         info: row["Info"]
                     }).onConflictDoNothing();
                } else if (file.type === "M&M") {
                     await db.insert(sourceCsvMm).values({
                         userId,
                         key: tx.key,
                         keyDesc: tx.keyDesc,
                         rowFingerprint,
                         authorisedOn: dateToDbString(parseDateGeneric(row["Authorised on"])),
                         processedOn: dateToDbString(parseDateGeneric(row["Processed on"])),
                         amount: parseAmountDE(row["Amount"]),
                         currency: row["Currency"],
                         description: row["Description"],
                         paymentType: row["Payment type"],
                         status: row["Status"]
                     }).onConflictDoNothing();
                } else if (file.type === "Amex") {
                     // Amex parser logic maps keys. "Datum", "Beschreibung", "Betrag".
                     await db.insert(sourceCsvAmex).values({
                         userId,
                         key: tx.key,
                         keyDesc: tx.keyDesc,
                         rowFingerprint,
                         datum: dateToDbString(parseDateGeneric(row["Datum"])),
                         beschreibung: row["Beschreibung"],
                         betrag: parseAmountDE(row["Betrag"]),
                         referenz: row["Referenz"],
                         karteninhaber: row["Karteninhaber"],
                         kartennummer: row["Kartennummer"],
                         ort: row["Ort"],
                         staat: row["Staat"]
                     }).onConflictDoNothing();
                }

                // Add to Tx List
                txToInsert.push({
                    userId,
                    paymentDate: tx.date,
                    amount: tx.amount, // Correctly inverted by parser for Amex
                    currency: tx.currency,
                    descRaw: tx.descRaw,
                    descNorm: tx.descNorm, // Used for rules
                    key: tx.key,
                    keyDesc: tx.keyDesc,
                    source: file.type === "M&M" ? "M&M" : file.type,
                    needsReview: true, // Will update in categorization
                    importedAt: new Date(),
                    // ... other fields default (recurringFlag false, etc)
                });

            } catch (e) {
                console.error(`Row Error in ${file.type}:`, e);
            }
        }
    }

    // 4. Batch Insert Transactions
    console.log(`\n📦 Inserting ${txToInsert.length} transactions...`);
    for (let i = 0; i < txToInsert.length; i += BATCH_SIZE) {
        const chunk = txToInsert.slice(i, i + BATCH_SIZE);
        await db.insert(transactions).values(chunk).onConflictDoNothing();
        process.stdout.write(".");
    }
    console.log("\n✅ Transactions Inserted.");
    
    // 5. Seed Rules
    console.log("\n🌱 Seeding Rules...");
    try {
        execSync("npx tsx scripts/seed-excel-rules.ts", { stdio: 'inherit' });
    } catch (e) {
        console.log("Seeding script execution finished (check output above).");
    }

    // 6. Categorize
    console.log("\n🧠 Running Categorization...");
    const allRules = await db.query.rules.findMany({ where: eq(rules.userId, userId) });
    const allAliases = await db.query.aliasAssets.findMany({ where: eq(aliasAssets.userId, userId) });
    const allTxs = await db.query.transactions.findMany({ where: eq(transactions.userId, userId) });

    let updatedCount = 0;
    
    // Create Map for batch updates if possible, or loop update
    // Loop update is safer for logic
    for (const tx of allTxs) {
        const descMatch = (tx.keyDesc || tx.descNorm || "").toUpperCase();
        let updateData: any = {};

        // Alias
        const alias = allAliases.find(a => descMatch.includes((a.aliasKey||"").toUpperCase()));
        if (alias) {
            updateData.aliasDesc = alias.aliasDesc;
        }

        // Rule
        const rule = allRules.find(r => {
            if (!r.keywords) return false;
            return descMatch.includes(r.keywords.toUpperCase());
        });

        if (rule) {
            updateData.category1 = rule.category1;
            updateData.category2 = rule.category2;
            updateData.type = rule.type;
            updateData.ruleIdApplied = rule.id; 
            updateData.needsReview = false;
        }

        if (Object.keys(updateData).length > 0) {
            await db.update(transactions)
               .set(updateData)
               .where(eq(transactions.id, tx.id));
            updatedCount++;
        }
    }
    console.log(`✅ Categorized ${updatedCount} transactions.`);
    console.log("\n🎉 DONE.");
}

main().catch(console.error);
