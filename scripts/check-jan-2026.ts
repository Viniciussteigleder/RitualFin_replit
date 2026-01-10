import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { transactions } = await import("../src/lib/db/schema");
  const { sql, and, gte, lte } = await import("drizzle-orm");

  console.log("🔍 Verificando transações de Janeiro 2026...\n");

  const jan2026 = await db
    .select()
    .from(transactions)
    .where(
      and(
        gte(transactions.paymentDate, new Date("2026-01-01")),
        lte(transactions.paymentDate, new Date("2026-01-31"))
      )
    )
    .limit(100);

  console.log(`📊 Total de transações em Janeiro 2026: ${jan2026.length}\n`);

  // Group by category1
  const byCategory = jan2026.reduce((acc, tx) => {
    const cat = tx.category1 || "null";
    if (!acc[cat]) {
      acc[cat] = { count: 0, total: 0, transactions: [] };
    }
    acc[cat].count++;
    acc[cat].total += Math.abs(tx.amount);
    acc[cat].transactions.push(tx);
    return acc;
  }, {} as Record<string, { count: number; total: number; transactions: typeof jan2026 }>);

  Object.entries(byCategory).forEach(([cat, data]) => {
    console.log(`\n📁 Category1 = "${cat}": ${data.count} transações, Total: €${data.total.toFixed(2)}`);
    if (data.count <= 5) {
      data.transactions.forEach((tx) => {
        console.log(`   - ${tx.descNorm} | €${tx.amount}`);
      });
    }
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
