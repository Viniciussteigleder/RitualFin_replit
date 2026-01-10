
import dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });
dotenv.config({ path: ".env.local" });
dotenv.config();

const { db } = await import("../src/lib/db");
import { transactions, aliasAssets } from "../src/lib/db/schema";
import { like } from "drizzle-orm";

async function main() {
    const txs = await db.select({ 
        id: transactions.id, 
        descRaw: transactions.descRaw, 
        aliasDesc: transactions.aliasDesc 
    })
    .from(transactions)
    .where(like(transactions.descRaw, "%AMZN%"))
    .limit(5);

// Check alias assets for Amazon
    const amznAlias = await db.select().from(aliasAssets).where(like(aliasAssets.aliasDesc, "Amazon"));
    console.log("Amazon Alias Asset:", amznAlias);
    process.exit(0);
}

main();
