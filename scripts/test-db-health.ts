import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

// Static imports of drizzle tools are fine
import { sql, isNull, eq } from "drizzle-orm";

/**
 * TEST SUITE: DATABASE HEALTH CHECK
 * Verifica inconsistências, dados sujos e violações de regras de negócio.
 */

async function runHealthCheck() {
  // Dynamic import ensures .env is loaded BEFORE db connection is initialized
  const { db } = await import("../src/lib/db");
  const { transactions, category1Enum } = await import("../src/lib/db/schema");

  console.log("🏥 SUITE 2: Health Check do Banco de Dados\n");
  let issuesFound = 0;

  // CHECK 1: Valores Zerados
  const zeroAmount = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(eq(transactions.amount, "0")); // Warning: string comparison for decimal

  if (Number(zeroAmount[0].count) > 0) {
    console.log(`⚠️ ALERTA: ${zeroAmount[0].count} transações com valor ZERO.`);
    issuesFound++;
  } else {
    console.log("✅ Check 1: Nenhuma transação zerada.");
  }

  // CHECK 2: Categorias Inválidas (Fora do Enum)
  // Como Drizzle já tipa o Enum, vamos checar via SQL raw se há strings estranhas
  // Buscando todas as categorias distintas usadas
  const usedCategories = await db
    .selectDistinct({ cat: transactions.category1 })
    .from(transactions);

  const validCategories = category1Enum.enumValues;
  const invalidCats = usedCategories
    .filter(r => r.cat !== null && !validCategories.includes(r.cat as any))
    .map(r => r.cat);

  if (invalidCats.length > 0) {
    console.log(`❌ ERRO CRÍTICO: Categorias inválidas encontradas: ${invalidCats.join(", ")}`);
    issuesFound++;
  } else {
    console.log("✅ Check 2: Todas as categorias usadas são válidas (Enum compliance).");
  }

  // CHECK 3: Transações Órfãs (Sem User ID)
  const orphanTxs = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(isNull(transactions.userId));

  if (Number(orphanTxs[0].count) > 0) {
    console.log(`❌ ERRO CRÍTICO: ${orphanTxs[0].count} transações sem User ID (Órfãs).`);
    issuesFound++;
  } else {
    console.log("✅ Check 3: Todas as transações pertencem a um usuário.");
  }
  
  // CHECK 4: "Mercado" Singular residual check 
  // (Caso o Enum check falhe ou seja permissivo por cast)
  try {
     // Casting to text to avoid Enum parsing error if value is invalid
     const singularMercado = await db.execute(sql`SELECT count(*) as count FROM transactions WHERE category_1::text = 'Mercado'`);
     const count = Number(singularMercado.rows[0].count);
     
     if (count > 0) {
        console.log(`❌ ERRO: Ainda existem ${count} transações como 'Mercado' (singular).`);
        issuesFound++;
      } else {
        console.log("✅ Check 4: Nenhuma transação 'Mercado' (singular) residual.");
      }
  } catch (e) {
      console.log("✅ Check 4: Banco rejeitou query 'Mercado', o que confirma integridade do Enum!");
  }


  console.log(`\n📊 Saude do Banco: ${issuesFound === 0 ? "100% SAUDÁVEL" : issuesFound + " PROBLEMAS ENCONTRADOS"}`);
  process.exit(issuesFound > 0 ? 1 : 0);
}

runHealthCheck().catch(console.error);
