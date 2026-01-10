import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { transactions } = await import("../src/lib/db/schema");
  const { eq, sql } = await import("drizzle-orm");

  console.log("🔧 Corrigindo classificação de transações de Mercados...\n");

  // Step 1: Move category2 (Supermercado) to category3
  // Step 2: Set category2 to "Alimentação"
  
  const result = await db
    .update(transactions)
    .set({
      category3: sql`${transactions.category2}`, // Move "Supermercado" para category3
      category2: "Alimentação", // Define category2 como "Alimentação"
    })
    .where(eq(transactions.category1, "Mercados"))
    .returning({ id: transactions.id });

  console.log(`✅ ${result.length} transações de Mercados corrigidas!\n`);

  // Verify the fix
  const sample = await db
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
    .limit(5);

  console.log("📊 Verificação - Primeiras 5 transações após correção:\n");
  sample.forEach((tx) => {
    console.log(`ID: ${tx.id}`);
    console.log(`  Descrição: ${tx.aliasDesc || tx.descNorm}`);
    console.log(`  Category1: ${tx.category1}`);
    console.log(`  Category2: ${tx.category2} ✅`);
    console.log(`  Category3: ${tx.category3} ✅`);
    console.log("");
  });

  // Count verification
  const category2Counts = await db
    .select({
      category2: transactions.category2,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(eq(transactions.category1, "Mercados"))
    .groupBy(transactions.category2);

  console.log("\n📈 Distribuição por Category2 (Nível 1) após correção:");
  category2Counts.forEach((c) => {
    console.log(`  ${c.category2 || "NULL"}: ${c.count} transações`);
  });

  const category3Counts = await db
    .select({
      category3: transactions.category3,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(eq(transactions.category1, "Mercados"))
    .groupBy(transactions.category3);

  console.log("\n📈 Distribuição por Category3 (Nível 2) após correção:");
  category3Counts.forEach((c) => {
    console.log(`  ${c.category3 || "NULL"}: ${c.count} transações`);
  });

  console.log("\n✨ Correção concluída com sucesso!");
  console.log("📝 Hierarquia correta agora:");
  console.log("   Mercados → Alimentação → Supermercado → [Nome da Loja]");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
