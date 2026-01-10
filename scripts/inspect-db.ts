
import dotenv from 'dotenv';
import path from 'path';
import { desc, isNotNull } from "drizzle-orm";

// 1. Carregar variáveis ANTES de qualquer coisa
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function inspect() {
  console.log("\n🔍 --- INSPEÇÃO DO BANCO DE DADOS (Dinâmica) ---\n");

  if (!process.env.DATABASE_URL) {
      console.error("❌ ERRO: DATABASE_URL não encontrada no .env.local");
      process.exit(1);
  }

  // 2. Importar o DB DINAMICAMENTE
  const { db } = await import("../src/lib/db/index");
  const { transactions, rules } = await import("../src/lib/db/schema");

  // 1. Transactions
  console.log("📊 ÚLTIMAS 10 TRANSAÇÕES:");
  const txs = await db.select({
    id: transactions.id,
    descRaw: transactions.descRaw,
    keyDesc: transactions.keyDesc,
    descNorm: transactions.descNorm, // Also showing descNorm just in case
    amount: transactions.amount,
    date: transactions.paymentDate // Correct column name
  })
  .from(transactions)
  // Fix: Use correct column name for sorting
  .orderBy(desc(transactions.paymentDate))
  .limit(10);

  console.table(txs.map(t => ({
    "Data": t.date ? new Date(t.date).toLocaleDateString() : 'N/A',
    "Descrição Original": t.descRaw?.substring(0, 25) + "...",
    "Key Desc": t.keyDesc,
    "Valor": t.amount
  })));

  // 2. Rules
  console.log("\n📋 EXEMPLO DE 5 REGRAS (Key Words):");
  const rls = await db.select({
    name: rules.name,
    keywords: rules.keywords, 
    keyWords: rules.keyWords, // Legacy column? Let's check both
    category: rules.category1
  })
  .from(rules)
  .where(isNotNull(rules.keywords))
  .limit(5);

  console.table(rls.map(r => ({
      "Nome da Regra": r.name,
      "Keywords": r.keywords,
      "Categoria": r.category
  })));

  console.log("\n✅ Fim da inspeção.\n");
  process.exit(0);
}

inspect().catch(console.error);
