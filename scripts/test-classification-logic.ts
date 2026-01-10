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
    keyWords: "REWE;EDEKA;LIDL;ALDI",
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
  { desc: "LIDL SAGT DANKE 1234", expectedCat1: "Mercados", expectedCat2: "Alimentação" },
  { desc: "REWE SUPERMARKT MUNCHEN", expectedCat1: "Mercados", expectedCat3: "Supermercado" },
  { desc: "EDEKA DIREKT", expectedCat1: "Mercados", expectedCat2: "Alimentação" },
  { desc: "AMEX - ZAHLUNG JANUAR", expectedCat1: "Interno", expectedCat2: "Transferencias" },
  { desc: "COMPRA DESCONHECIDA", expectedCat1: null, expectedCat2: null } // Deve falhar graciosamente
];

function runTests() {
  console.log("🧪 Iniciando Testes de Classificação (Logica Pura)...\n");
  let passed = 0;

  testCases.forEach((tc, index) => {
    const result = matchRules(tc.desc, mockRules as Rule[]);
    const applied = result.appliedRule;

    const cat1Match = applied?.category1 === tc.expectedCat1 || (applied === undefined && tc.expectedCat1 === null);
    
    if (cat1Match) {
      console.log(`✅ Teste ${index + 1}: "${tc.desc}" -> ${applied?.category1 || "NULL"}`);
      passed++;
    } else {
      console.log(`❌ Teste ${index + 1}: FAILED! "${tc.desc}"`);
      console.log(`   Esperado: ${tc.expectedCat1}, Recebido: ${applied?.category1}`);
    }
  });

  console.log(`\n📊 Resultado: ${passed}/${testCases.length} testes passaram.`);
  
  if (passed === testCases.length) {
    console.log("🚀 Lógica do motor está sólida!");
  }
}

runTests();
