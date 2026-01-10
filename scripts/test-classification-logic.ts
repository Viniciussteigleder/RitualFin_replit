import { matchRules } from "../src/lib/rules/engine";
import { Rule } from "../src/lib/db/schema";

/**
 * TEST SUITE: CLASSIFICATION ENGINE
 * Este script testa se as regras de IA estão categorizando corretamente 
 * descrições reais com base na lógica do motor de regras.
 */

const mockRules: Partial<Rule>[] = [
  {
    id: "system-mercados",
    name: "Mercados",
    // Adding all keywords used in test cases
    keyWords: "REWE;EDEKA;LIDL;ALDI;DM-DROGERIE;NETTO",
    category1: "Mercados",
    category2: "Alimentação",
    category3: "Supermercado",
    priority: 900,
    strict: true,
    isSystem: true
  },
  {
    id: "system-interno",
    name: "Interno",
    keyWords: "AMEX - ZAHLUNG",
    category1: "Interno",
    category2: "Transferencias",
    priority: 1000,
    strict: true,
    isSystem: true
  }
];

const testCases = [
  // Happy Path - Mercados (Plural Check)
  { desc: "LIDL SAGT DANKE 1234", expectedCat1: "Mercados", expectedCat2: "Alimentação", expectedCat3: "Supermercado" },
  { desc: "REWE SUPERMARKT MUNCHEN", expectedCat1: "Mercados", expectedCat2: "Alimentação", expectedCat3: "Supermercado" },
  { desc: "A compra no dm-drogerie foi boa", expectedCat1: "Mercados", expectedCat3: "Supermercado" },
  
  // Case Insensitivity
  { desc: "aldi sued filiale", expectedCat1: "Mercados", expectedCat2: "Alimentação" },
  { desc: "Netto Marken-Discount", expectedCat1: "Mercados", expectedCat2: "Alimentação" },

  // System Rules - Interno
  { desc: "AMEX - ZAHLUNG JANUAR", expectedCat1: "Interno", expectedCat2: "Transferencias" },
  
  // No Match
  { desc: "COMPRA DESCONHECIDA NA LOJA X", expectedCat1: null, expectedCat2: null }
];

function runTests() {
  console.log("🧪 SUITE 1: Motor de Classificação (Logica Pura)\n");
  let passed = 0;
  let failed = 0;

  testCases.forEach((tc, index) => {
    const result = matchRules(tc.desc, mockRules as Rule[]);
    const applied = result.appliedRule;

    const cat1Match = applied?.category1 === tc.expectedCat1 || (applied === undefined && tc.expectedCat1 === null);
    const cat2Match = !tc.expectedCat2 || applied?.category2 === tc.expectedCat2;
    // Note: cat3 check depends on if the mock rule has cat3. The Mercado mock rule has it.
    
    if (cat1Match && cat2Match) {
      // console.log(`✅ Teste ${index + 1}: PASS - "${tc.desc}"`);
      passed++;
    } else {
      console.log(`❌ Teste ${index + 1}: FAILED - "${tc.desc}"`);
      console.log(`   Esperado: ${tc.expectedCat1} / ${tc.expectedCat2}`);
      console.log(`   Recebido: ${applied?.category1} / ${applied?.category2}`);
      failed++;
    }
  });

  console.log(`\n📊 Resultado: ${passed} passaram, ${failed} falharam.`);
  
  if (failed === 0) {
    console.log("🚀 STATUS: MODELO DE CLASSIFICAÇÃO APROVADO");
  } else {
    console.log("⚠️ STATUS: REVISÃO NECESSÁRIA NO MODELO");
    process.exit(1); 
  }
}

runTests();
