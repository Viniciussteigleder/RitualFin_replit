import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

// Dynamic imports later inside function
import { sql } from "drizzle-orm";

async function runFinancialCheck() {
  const { db } = await import("../src/lib/db");
  const { transactions } = await import("../src/lib/db/schema");

  console.log("💰 SUITE 3: Teste de Consistência Financeira\n");

  // 1. Soma Total Bruta (Raw Sum)
  const rawTotalResult = await db.execute(sql`SELECT SUM(ABS(amount)) as total FROM transactions`);
  const rawTotal = Number(rawTotalResult.rows[0].total);

  // 2. Soma Agrupada por Categoria (Analytics Logic)
  const groupedTotalResult = await db.execute(sql`
    SELECT SUM(cat_total) as grand_total FROM (
      SELECT category_1, SUM(ABS(amount)) as cat_total 
      FROM transactions 
      GROUP BY category_1
    ) sub
  `);
  const groupedTotal = Number(groupedTotalResult.rows[0].grand_total);

  console.log(`💵 Total Bruto (Tabela Inteira): €${rawTotal.toFixed(2)}`);
  console.log(`📊 Total Agrupado (Analytics):    €${groupedTotal.toFixed(2)}`);
  
  const diff = Math.abs(rawTotal - groupedTotal);
  
  if (diff < 0.10) {
    console.log("✅ Check Financeiro: SUCESSO. Balanço perfeito (dentro da tolerância de float).");
  } else {
    console.log(`❌ Check Financeiro: FALHA. Diferença de €${diff.toFixed(2)} encontrada.`);
    console.log("   Possível causa: Transações com category_1 NULL que o GROUP BY pode estar ignorando ou tratando diferente.");
    process.exit(1);
  }
}

runFinancialCheck().catch(console.error);
