import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { transactions } = await import("../src/lib/db/schema");
  const { sql } = await import("drizzle-orm");

  console.log("🔍 Verificando TODAS as transações com 'Mercado' (singular ou plural)...\n");

  // Get all transactions with category1 containing 'Mercado'
  const allTx = await db
    .select({
      id: transactions.id,
      descNorm: transactions.descNorm,
      category1: transactions.category1,
      category2: transactions.category2,
      category3: transactions.category3,
      amount: transactions.amount,
    })
    .from(transactions)
    .limit(1000);

  // Filter in JavaScript since we can't use LIKE on enum
  const mercadoTx = allTx.filter((tx) => 
    tx.category1 && (tx.category1.toLowerCase().includes('mercado'))
  );

  console.log(`📊 Total de transações com 'Mercado': ${mercadoTx.length}\n`);

  // Group by exact category1 value
  const byCategory = mercadoTx.reduce((acc, tx) => {
    const cat = tx.category1 || "null";
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(tx);
    return acc;
  }, {} as Record<string, typeof mercadoTx>);

  Object.entries(byCategory).forEach(([cat, txs]) => {
    console.log(`\n📁 Category1 = "${cat}": ${txs.length} transações`);
    console.log(`   Primeiras 3 transações:`);
    txs.slice(0, 3).forEach((tx) => {
      console.log(`   - ${tx.descNorm} | Cat2: ${tx.category2 || "NULL"} | Cat3: ${tx.category3 || "NULL"} | €${tx.amount}`);
    });
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
