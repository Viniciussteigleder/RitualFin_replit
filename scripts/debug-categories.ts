
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

import { transactions, rules } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
    const { db } = await import("../src/lib/db");
    
    const txCats = await db.selectDistinct({ cat: transactions.category1 }).from(transactions);
    const ruleCats = await db.selectDistinct({ cat: rules.category1 }).from(rules);
    
    console.log("--- Existing Transaction Categories ---");
    txCats.forEach(c => console.log(c.cat));

    console.log("\n--- Existing Rule Categories ---");
    ruleCats.forEach(c => console.log(c.cat));
}

main().catch(console.error);
