import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { transactions } = await import("../src/lib/db/schema");
  const { sql, desc } = await import("drizzle-orm");

  console.log("🔍 Verificando TODAS as transações agrupadas por category1...\n");

  const results = await db
    .select({
      category: transactions.category1,
      total: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .groupBy(transactions.category1)
    .orderBy(desc(sql`COALESCE(SUM(ABS(${transactions.amount})), 0)`));

  console.log("📊 Todas as categorias (ordenadas por total):\n");
  results.forEach((r) => {
    console.log(`"${r.category || "null"}": ${r.count} transações, Total: €${Number(r.total).toFixed(2)}`);
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
