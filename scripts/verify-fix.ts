
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 1. Carregar variáveis
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verify() {
  console.log("🔍 --- VERIFICAÇÃO END-TO-END DE IMPORTAÇÃO E CLASSIFICAÇÃO ---\n");

  if (!process.env.DATABASE_URL) {
      console.error("❌ ERRO: DATABASE_URL não encontrada.");
      process.exit(1);
  }

  // 2. Importações Dinâmicas
  const { db } = await import("../src/lib/db/db");
  const { rules, aliasAssets } = await import("../src/lib/db/schema");
  const { parseIngestionFile } = await import("../src/lib/ingest/index");
  const { categorizeTransaction, matchAlias, AI_SEED_RULES } = await import("../src/lib/rules/engine");

  // 3. Preparar Regras e Aliases do Banco
  console.log("📥 Carregando Regras e Aliases...");
  const dbRules = await db.select().from(rules);
  const dbAliases = await db.select().from(aliasAssets);
  
  // Mesclar com Seed Rules para teste completo
  const seedRulesMapped = AI_SEED_RULES.map((r: any, i: number) => ({
      ...r, id: `seed-${i}`, active: true, keyWords: r.keywords
  }));
  const effectiveRules = [...dbRules, ...seedRulesMapped];
  
  console.log(`✅ ${dbRules.length} Regras DB + ${seedRulesMapped.length} Seed Rules carregadas.`);
  console.log(`✅ ${dbAliases.length} Aliases carregados.`);

  // 4. Testar os 3 Arquivos CSV Reais
  const filesDir = path.resolve(process.cwd(), "docs/Feedback_user/CSV_original");
  if (!fs.existsSync(filesDir)) {
      console.error("❌ Diretório CSV não encontrado:", filesDir);
      return;
  }

  const files = fs.readdirSync(filesDir).filter(f => f.toLowerCase().endsWith(".csv"));

  for (const file of files) {
      console.log(`\n📄 Processando: ${file}`);
      const content = fs.readFileSync(path.join(filesDir, file), "utf-8");
      
      // PARSE
      const result = await parseIngestionFile(content, file);
      
      if (!result.success) {
          console.error(`   ❌ Falha no parser: ${result.errors.join(", ")}`);
          continue;
      }

      console.log(`   ✅ Parser OK: ${result.transactions.length} transações encontradas.`);
      console.log(`   🔎 Verificando Amostra (Top 3) para Key_desc e Classificação:\n`);

      // TESTAR CLASSIFICAÇÃO
      const sample = result.transactions.slice(0, 3);
      const tableData = sample.map(tx => {
          const keyDesc = tx.keyDesc || "❌ NULL"; // Check logic
          
          // Simular ingestão (match alias e categorize)
          const aliasMatch = matchAlias(keyDesc, dbAliases);
          const catResult = categorizeTransaction(keyDesc, effectiveRules as any);

          return {
              "Fonte": tx.source,
              "Data": tx.date ? new Date(tx.date).toISOString().split('T')[0] : 'N/A',
              "Valor": tx.amount,
              "Key_desc (Rich)": keyDesc.length > 50 ? keyDesc.substring(0, 50) + "..." : keyDesc,
              "Alias": aliasMatch ? aliasMatch.aliasDesc : "-",
              "Categoria": catResult.category1 || "Outros",
              "Regra": catResult.ruleIdApplied ? "✅ Sim" : "❌ Não",
              "Tags": keyDesc.includes(" -- ") ? "✅ Sim" : "❌ Não" 
          };
      });

      console.table(tableData);
  }

  console.log("\n✅ Verificação concluída. Se 'Key_desc' está preenchido e 'Categoria' faz sentido, o fix funcionou.");
  process.exit(0);
}

verify().catch(console.error);
