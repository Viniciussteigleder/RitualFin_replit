import dotenv from "dotenv";
dotenv.config(); // Load default .env, others via CLI

// Dynamic import for db
const { db } = await import("../src/lib/db");
import { transactions, rules, aliasAssets } from "../src/lib/db/schema";
import { categorizeTransaction, matchAlias } from "../src/lib/rules/engine";
import { eq } from "drizzle-orm";

async function main() {
    console.log("🔄 Starting full rule re-application...");

    const allTx = await db.select().from(transactions);
    console.log(`Found ${allTx.length} transactions.`);

    // Fetch user rules
    const userId = allTx[0]?.userId;
    if (!userId) {
        console.log("No transactions/user found.");
        process.exit(0);
    }
    
    // Fetch all rules and aliases for this user
    const userRules = await db.query.rules.findMany({
        where: eq(rules.userId, userId)
    });
    console.log(`Loaded ${userRules.length} rules.`);

    const userAliases = await db.query.aliasAssets.findMany({
        where: eq(aliasAssets.userId, userId)
    });
    console.log(`Loaded ${userAliases.length} aliases.`);

    let updatedCount = 0;

    for (const tx of allTx) {
        // 1. Check Alias
        const alias = matchAlias(tx.descNorm || tx.descRaw, userAliases);
        let aliasDesc = null;
        let logoUrl = null;

        if (alias) {
            aliasDesc = alias.aliasDesc;
            logoUrl = alias.logoUrl;
        }

        // 2. Check Rules
        // We only re-apply rules if it wasn't manually overridden or verified?
        // Let's re-apply to everything for this QA pass, except maybe manual overrides.
        if (tx.manualOverride) {
            // Only update alias if missing
            if (aliasDesc && !tx.aliasDesc) {
                 await db.update(transactions)
                    .set({ aliasDesc: aliasDesc })
                    .where(eq(transactions.id, tx.id));
                 updatedCount++;
            }
            continue;
        }

        const catResult = categorizeTransaction(tx.descNorm || tx.descRaw, userRules);

        // Prepare update
        const updates: any = {};
        
        if (aliasDesc) updates.aliasDesc = aliasDesc;
        
        if (catResult.ruleIdApplied) {
            updates.category1 = catResult.category1;
            updates.category2 = catResult.category2;
            updates.category3 = catResult.category3;
            updates.type = catResult.type;
            updates.fixVar = catResult.fixVar;
            updates.ruleIdApplied = catResult.ruleIdApplied;
            updates.needsReview = catResult.needsReview;
            updates.confidence = catResult.confidence;
            updates.suggestedKeyword = catResult.appliedRule?.matchedKeyword;
            
            // Internal Transfer Logic
            if (catResult.category1 === "Interno") {
                updates.internalTransfer = true;
                updates.excludeFromBudget = true;
            }
        }

        if (Object.keys(updates).length > 0) {
             await db.update(transactions)
                .set(updates)
                .where(eq(transactions.id, tx.id));
             updatedCount++;
        }
    }

    console.log(`✅ Updated ${updatedCount} transactions.`);
    process.exit(0);
}

main().catch(console.error);
