
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

import { transactions, rules } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

// Mapeamento de categorias antigas -> novas
const categoryMapping: Record<string, string> = {
  // Manter as que já existem e estão corretas
  "Alimentação": "Alimentação",
  "Compras": "Compras",
  "Trabalho": "Trabalho",
  "Moradia": "Moradia",
  "Transporte": "Transporte",
  "Outros": "Outros",
  "Saúde": "Saúde",
  "Interno": "Interno",
  
  // Mapear antigas para novas
  "Mercado": "Mercados",
  "Receitas": "Renda Extra",
  "Lazer": "Lazer / Esporte",
  "Esportes": "Lazer / Esporte",
  "Finanças": "Financiamento",
  
  // Mapear categorias que não existem mais para "Outros"
  "Compras Online": "Compras",
  "Viagem": "Lazer / Esporte",
  "Roupas": "Compras",
  "Tecnologia": "Compras",
  "Energia": "Moradia",
  "Internet": "Moradia",
  "Educação": "Outros",
  "Presentes": "Compras",
  "Streaming": "Lazer / Esporte",
  "Academia": "Lazer / Esporte",
  "Investimentos": "Financiamento",
  "Assinaturas": "Outros",
  "Doações": "Outros",
  "Férias": "Lazer / Esporte",
  "Mobilidade": "Transporte",
  "Pets": "Outros",
  "Telefone": "Outros",
  "Transferências": "Interno",
  "Vendas": "Renda Extra"
};

async function main() {
    const { db } = await import("../src/lib/db");
    
    console.log("🔄 Migrando categorias...\n");
    
    // Migrar Regras
    console.log("📋 Migrando regras...");
    for (const [oldCat, newCat] of Object.entries(categoryMapping)) {
        const result = await db.execute(sql`
            UPDATE rules 
            SET category_1 = ${newCat}
            WHERE category_1 = ${oldCat}
        `);
        if (result.rowCount && result.rowCount > 0) {
            console.log(`  ✓ ${oldCat} → ${newCat} (${result.rowCount} regras)`);
        }
    }
    
    // Migrar Transações
    console.log("\n💳 Migrando transações...");
    for (const [oldCat, newCat] of Object.entries(categoryMapping)) {
        const result = await db.execute(sql`
            UPDATE transactions 
            SET category_1 = ${newCat}
            WHERE category_1 = ${oldCat}
        `);
        if (result.rowCount && result.rowCount > 0) {
            console.log(`  ✓ ${oldCat} → ${newCat} (${result.rowCount} transações)`);
        }
    }
    
    console.log("\n✅ Migração concluída!");
    
    // Verificar se ainda existem categorias não mapeadas
    const unmappedTx = await db.execute(sql`
        SELECT DISTINCT category_1 
        FROM transactions 
        WHERE category_1 NOT IN (
            'Alimentação', 'Mercados', 'Renda Extra', 'Outros', 
            'Lazer / Esporte', 'Compras', 'Financiamento', 'Interno',
            'Transporte', 'Moradia', 'Saúde', 'Trabalho'
        )
        AND category_1 IS NOT NULL
    `);
    
    const unmappedRules = await db.execute(sql`
        SELECT DISTINCT category_1 
        FROM rules 
        WHERE category_1 NOT IN (
            'Alimentação', 'Mercados', 'Renda Extra', 'Outros', 
            'Lazer / Esporte', 'Compras', 'Financiamento', 'Interno',
            'Transporte', 'Moradia', 'Saúde', 'Trabalho'
        )
        AND category_1 IS NOT NULL
    `);
    
    if (unmappedTx.rows.length > 0 || unmappedRules.rows.length > 0) {
        console.log("\n⚠️  Categorias não mapeadas encontradas:");
        if (unmappedTx.rows.length > 0) {
            console.log("  Transações:", unmappedTx.rows.map((r: any) => r.category_1));
        }
        if (unmappedRules.rows.length > 0) {
            console.log("  Regras:", unmappedRules.rows.map((r: any) => r.category_1));
        }
    } else {
        console.log("\n✅ Todas as categorias foram migradas com sucesso!");
        console.log("   Agora você pode executar: npx drizzle-kit push");
    }
}

main().catch(console.error);
