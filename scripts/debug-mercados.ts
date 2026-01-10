import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { transactions } = await import("../src/lib/db/schema");
  const { eq, sql } = await import("drizzle-orm");

  console.log("🔍 Verificando classificação de transações de Mercado...\n");

  // Check current classification
  const mercadoTx = await db
    .select({
      id: transactions.id,
      descNorm: transactions.descNorm,
      aliasDesc: transactions.aliasDesc,
      category1: transactions.category1,
      category2: transactions.category2,
      category3: transactions.category3,
    })
    .from(transactions)
    .where(eq(transactions.category1, "Mercados"))
    .limit(20);

  console.log("📊 Primeiras 20 transações de 'Mercados':\n");
  mercadoTx.forEach((tx) => {
    console.log(`ID: ${tx.id}`);
    console.log(`  Descrição: ${tx.aliasDesc || tx.descNorm}`);
    console.log(`  Category1: ${tx.category1}`);
    console.log(`  Category2: ${tx.category2 || "❌ VAZIO"}`);
    console.log(`  Category3: ${tx.category3 || "❌ VAZIO"}`);
    console.log("");
  });

  // Count by category2
  const category2Counts = await db
    .select({
      category2: transactions.category2,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(eq(transactions.category1, "Mercados"))
    .groupBy(transactions.category2);

  console.log("\n📈 Distribuição por Category2 (Nível 1):");
  category2Counts.forEach((c) => {
    console.log(`  ${c.category2 || "NULL"}: ${c.count} transações`);
  });

  // Count by category3
  const category3Counts = await db
    .select({
      category3: transactions.category3,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(eq(transactions.category1, "Mercados"))
    .groupBy(transactions.category3);

  console.log("\n📈 Distribuição por Category3 (Nível 2):");
  category3Counts.forEach((c) => {
    console.log(`  ${c.category3 || "NULL"}: ${c.count} transações`);
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
