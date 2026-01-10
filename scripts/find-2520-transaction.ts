import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { transactions } = await import("../src/lib/db/schema");
  const { sql } = await import("drizzle-orm");

  console.log("🔍 Procurando transação de €2520...\n");

  const tx2520 = await db
    .select()
    .from(transactions)
    .where(sql`ABS(${transactions.amount}) = 2520`)
    .limit(10);

  console.log(`📊 Encontradas ${tx2520.length} transações com valor €2520:\n`);

  tx2520.forEach((tx) => {
    console.log(`ID: ${tx.id}`);
    console.log(`  Descrição: ${tx.descNorm}`);
    console.log(`  Category1: "${tx.category1}"`);
    console.log(`  Category2: "${tx.category2 || "NULL"}"`);
    console.log(`  Category3: "${tx.category3 || "NULL"}"`);
    console.log(`  Amount: €${tx.amount}`);
    console.log(`  Date: ${tx.paymentDate}`);
    console.log("");
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
