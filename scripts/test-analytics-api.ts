import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { transactions } = await import("../src/lib/db/schema");
  const { sql, desc, eq } = await import("drizzle-orm");

  console.log("🔍 Testando o que a API de analytics retorna...\n");

  // Simulate what the analytics API does
  const results = await db
    .select({
      category: transactions.category1,
      total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .groupBy(transactions.category1)
    .orderBy(desc(sql`COALESCE(SUM(ABS(${transactions.amount})), 0)`));

  console.log("📊 Resultados da query (como a API retorna):\n");
  results.forEach((r) => {
    console.log(`Category: "${r.category}" | Total: €${Number(r.total).toFixed(2)} | Count: ${r.count}`);
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
