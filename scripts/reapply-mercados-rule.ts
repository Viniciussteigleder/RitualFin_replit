import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { transactions } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  console.log("🔄 Re-aplicando regras de Mercados...\n");

  // Update all transactions that match the Mercados keywords
  const keywords = ["REWE", "EDEKA", "ALDI", "LIDL", "NETTO", "NORMA", "DM", "DM-DROGERIE", "ROSSMANN", "MUELLER", "MÜLLER", "ASIA MARKT", "BACKSTUBE", "BAECKEREI", "IHLE", "WUENSCHE", "FRUCHTWERK"];

  let totalUpdated = 0;

  for (const keyword of keywords) {
    console.log(`\n📝 Processando keyword: "${keyword}"`);
    
    // Find all transactions containing this keyword
    const txs = await db
      .select()
      .from(transactions)
      .limit(1000);

    const matching = txs.filter((tx) =>
      tx.descNorm && tx.descNorm.toUpperCase().includes(keyword)
    );

    console.log(`   Encontradas ${matching.length} transações`);

    for (const tx of matching) {
      // Update to use the correct hierarchy
      await db
        .update(transactions)
        .set({
          category1: "Mercados",
          category2: "Alimentação",
          category3: "Supermercado",
        })
        .where(eq(transactions.id, tx.id));

      totalUpdated++;
    }
  }

  console.log(`\n✅ Total de transações atualizadas: ${totalUpdated}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
