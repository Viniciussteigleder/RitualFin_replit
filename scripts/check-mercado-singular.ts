import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { transactions } = await import("../src/lib/db/schema");
  const { sql } = await import("drizzle-orm");

  console.log("🔍 Verificando todas as variações de 'Mercado'...\n");

  // Check all possible variations - get all categories first
  const allCategories = await db
    .select({
      category1: transactions.category1,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .groupBy(transactions.category1);

  console.log("📊 Todas as variações de 'Mercado' encontradas:");
  allCategories.forEach((c) => {
    console.log(`  "${c.category1}": ${c.count} transações`);
  });

  // Check "Mercado" (singular) specifically
  const mercadoSingular = await db
    .select({
      id: transactions.id,
      descNorm: transactions.descNorm,
      aliasDesc: transactions.aliasDesc,
      category1: transactions.category1,
      category2: transactions.category2,
      category3: transactions.category3,
    })
    .from(transactions)
    .where(sql`${transactions.category1} = 'Mercado'`)
    .limit(5);

  if (mercadoSingular.length > 0) {
    console.log("\n⚠️  ENCONTRADAS transações com 'Mercado' (singular):");
    mercadoSingular.forEach((tx) => {
      console.log(`\nID: ${tx.id}`);
      console.log(`  Descrição: ${tx.aliasDesc || tx.descNorm}`);
      console.log(`  Category1: ${tx.category1}`);
      console.log(`  Category2: ${tx.category2 || "NULL"}`);
      console.log(`  Category3: ${tx.category3 || "NULL"}`);
    });
  } else {
    console.log("\n✅ Nenhuma transação com 'Mercado' (singular) encontrada");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
