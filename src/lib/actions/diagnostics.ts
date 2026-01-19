"use server";

/**
 * COMPREHENSIVE DATA INTEGRITY DIAGNOSTICS
 *
 * UX Design Credits:
 * - Jakob Nielsen (10 Usability Heuristics)
 * - Don Norman (Design of Everyday Things)
 * - Steve Krug (Don't Make Me Think)
 *
 * Architecture:
 * - Modular diagnostic functions
 * - Severity-based categorization (Critical > High > Medium > Low)
 * - Actionable recommendations
 */

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  transactions,
  rules,
  ingestionBatches,
  ingestionItems,
  taxonomyLeaf,
  taxonomyLevel2,
  taxonomyLevel1,
  appCategoryLeaf,
  appCategory
} from "@/lib/db/schema";
import { eq, sql, and, isNull, isNotNull, count, desc, asc } from "drizzle-orm";

// ============================================================================
// TYPES
// ============================================================================

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface DiagnosticIssue {
  id: string;
  category: DiagnosticCategory;
  severity: Severity;
  title: string;
  description: string;
  affectedCount: number;
  samples: any[];
  recommendation: string;
  autoFixable: boolean;
}

export interface DiagnosticCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface DiagnosticResult {
  success: boolean;
  timestamp: string;
  duration: number;
  summary: {
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    healthScore: number; // 0-100
  };
  categories: {
    imports: CategoryResult;
    rules: CategoryResult;
    categorization: CategoryResult;
    financial: CategoryResult;
    taxonomy: CategoryResult;
  };
  issues: DiagnosticIssue[];
}

export interface CategoryResult {
  name: string;
  icon: string;
  status: "healthy" | "warning" | "critical";
  issueCount: number;
  checksRun: number;
  checksPassed: number;
}

// ============================================================================
// DIAGNOSTIC CATEGORIES
// ============================================================================

const CATEGORIES = {
  imports: {
    id: "imports",
    name: "Integridade de Importação",
    icon: "FileUp",
    description: "Verifica consistência entre arquivos CSV e dados importados"
  },
  rules: {
    id: "rules",
    name: "Consistência de Regras",
    icon: "Sparkles",
    description: "Analisa regras de categorização e suas aplicações"
  },
  categorization: {
    id: "categorization",
    name: "Saúde da Categorização",
    icon: "Tags",
    description: "Verifica integridade das categorias atribuídas"
  },
  financial: {
    id: "financial",
    name: "Integridade Financeira",
    icon: "DollarSign",
    description: "Detecta anomalias em valores e tipos de transação"
  },
  taxonomy: {
    id: "taxonomy",
    name: "Estrutura Taxonômica",
    icon: "GitBranch",
    description: "Valida hierarquia de categorias e relacionamentos"
  }
} as const;

// ============================================================================
// MAIN DIAGNOSTIC FUNCTION
// ============================================================================

export async function runFullDiagnostics(): Promise<DiagnosticResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const startTime = Date.now();
  const issues: DiagnosticIssue[] = [];

  // Run all diagnostic checks in parallel
  const [
    importIssues,
    ruleIssues,
    categorizationIssues,
    financialIssues,
    taxonomyIssues
  ] = await Promise.all([
    runImportDiagnostics(userId),
    runRuleDiagnostics(userId),
    runCategorizationDiagnostics(userId),
    runFinancialDiagnostics(userId),
    runTaxonomyDiagnostics(userId)
  ]);

  issues.push(...importIssues.issues, ...ruleIssues.issues, ...categorizationIssues.issues,
              ...financialIssues.issues, ...taxonomyIssues.issues);

  // Calculate summary
  const critical = issues.filter(i => i.severity === "critical").length;
  const high = issues.filter(i => i.severity === "high").length;
  const medium = issues.filter(i => i.severity === "medium").length;
  const low = issues.filter(i => i.severity === "low").length;
  const info = issues.filter(i => i.severity === "info").length;

  // Health score: 100 - (critical*25 + high*10 + medium*5 + low*2)
  const healthScore = Math.max(0, Math.min(100,
    100 - (critical * 25) - (high * 10) - (medium * 5) - (low * 2)
  ));

  return {
    success: true,
    timestamp: new Date().toISOString(),
    duration: Date.now() - startTime,
    summary: {
      totalIssues: issues.length,
      critical,
      high,
      medium,
      low,
      info,
      healthScore
    },
    categories: {
      imports: importIssues.categoryResult,
      rules: ruleIssues.categoryResult,
      categorization: categorizationIssues.categoryResult,
      financial: financialIssues.categoryResult,
      taxonomy: taxonomyIssues.categoryResult
    },
    issues
  };
}

// ============================================================================
// IMPORT DIAGNOSTICS
// ============================================================================

async function runImportDiagnostics(userId: string) {
  const issues: DiagnosticIssue[] = [];
  let checksRun = 0;
  let checksPassed = 0;

  // Check 1: Column shift detection (date in keyDesc)
  checksRun++;
  const dateInKeyDesc = await db.execute(sql`
    SELECT id, key_desc, amount, payment_date, source
    FROM transactions
    WHERE user_id = ${userId}
    AND (key_desc ~ '^\d{2}\.\d{2}\.\d{2,4}'
         OR key_desc ~ ' -- \d{2}\.\d{2}\.\d{2,4} -- ')
    LIMIT 20
  `);

  if (dateInKeyDesc.rows.length > 0) {
    issues.push({
      id: "IMP-001",
      category: CATEGORIES.imports,
      severity: "critical",
      title: "Deslocamento de Colunas Detectado",
      description: "key_desc contém padrão de data, indicando colunas deslocadas no CSV",
      affectedCount: dateInKeyDesc.rows.length,
      samples: dateInKeyDesc.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 80),
        amount: r.amount,
        date: r.payment_date
      })),
      recommendation: "Re-exporte o CSV do banco e verifique alinhamento das colunas",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 2: Amount mismatch in keyDesc
  checksRun++;
  const amountMismatch = await db.execute(sql`
    SELECT t.id, t.key_desc, t.amount, t.payment_date, t.source
    FROM transactions t
    WHERE t.user_id = ${userId}
    AND t.source = 'Sparkasse'
    AND t.key_desc ~ '\b[0-9]{4,}\b'
    LIMIT 100
  `);

  const mismatchedAmounts: any[] = [];
  for (const tx of amountMismatch.rows as any[]) {
    const keyDesc = tx.key_desc || "";
    const amount = Math.abs(tx.amount || 0);
    const numbers = keyDesc.match(/\b\d{4,}\b/g) || [];

    for (const numStr of numbers) {
      const num = parseFloat(numStr);
      if (num >= 100 && num <= 50000 && Math.abs(num - amount) > 50 && Math.abs(num - amount) / Math.max(amount, 1) > 0.1) {
        mismatchedAmounts.push({
          id: tx.id,
          keyDesc: keyDesc.substring(0, 80),
          amount: tx.amount,
          foundInKeyDesc: numStr
        });
        break;
      }
    }
  }

  if (mismatchedAmounts.length > 0) {
    issues.push({
      id: "IMP-002",
      category: CATEGORIES.imports,
      severity: "high",
      title: "Valor Divergente em key_desc",
      description: "key_desc menciona valor diferente do amount da transação",
      affectedCount: mismatchedAmounts.length,
      samples: mismatchedAmounts.slice(0, 5),
      recommendation: "Verifique se houve mistura de dados entre transações",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 3: Duplicate fingerprints
  checksRun++;
  const duplicates = await db.execute(sql`
    SELECT key, COUNT(*) as count, ARRAY_AGG(id) as ids
    FROM transactions
    WHERE user_id = ${userId}
    AND key IS NOT NULL
    GROUP BY key
    HAVING COUNT(*) > 1
    LIMIT 10
  `);

  if (duplicates.rows.length > 0) {
    issues.push({
      id: "IMP-003",
      category: CATEGORIES.imports,
      severity: "medium",
      title: "Fingerprints Duplicados",
      description: "Transações com mesmo fingerprint (possível duplicação)",
      affectedCount: duplicates.rows.length,
      samples: duplicates.rows.slice(0, 5).map((r: any) => ({
        key: r.key?.substring(0, 40),
        count: r.count,
        ids: r.ids?.slice(0, 3)
      })),
      recommendation: "Revise transações duplicadas e remova se necessário",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  // Check 4: Orphan ingestion items
  checksRun++;
  const orphanItems = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM ingestion_items ii
    LEFT JOIN ingestion_batches ib ON ii.batch_id = ib.id
    WHERE ib.id IS NULL
    AND ii.user_id = ${userId}
  `);

  const orphanCount = (orphanItems.rows[0] as any)?.count || 0;
  if (orphanCount > 0) {
    issues.push({
      id: "IMP-004",
      category: CATEGORIES.imports,
      severity: "low",
      title: "Itens de Ingestão Órfãos",
      description: "Itens sem batch associado",
      affectedCount: parseInt(orphanCount),
      samples: [],
      recommendation: "Limpar registros órfãos do banco",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  const status: CategoryResult["status"] = issues.some(i => i.severity === "critical") ? "critical"
               : issues.some(i => i.severity === "high") ? "warning" : "healthy";

  return {
    issues,
    categoryResult: {
      name: CATEGORIES.imports.name,
      icon: CATEGORIES.imports.icon,
      status,
      issueCount: issues.length,
      checksRun,
      checksPassed
    }
  };
}

// ============================================================================
// RULE DIAGNOSTICS
// ============================================================================

async function runRuleDiagnostics(userId: string) {
  const issues: DiagnosticIssue[] = [];
  let checksRun = 0;
  let checksPassed = 0;

  // Check 1: Rules without any matches
  checksRun++;
  const deadRules = await db.execute(sql`
    SELECT r.id, r.key_words, r.category_1, r.priority,
           (SELECT COUNT(*) FROM transactions t WHERE t.user_id = ${userId} AND t.rule_id_applied = r.id) as match_count
    FROM rules r
    WHERE r.user_id = ${userId}
    AND r.active = true
    HAVING (SELECT COUNT(*) FROM transactions t WHERE t.user_id = ${userId} AND t.rule_id_applied = r.id) = 0
    LIMIT 20
  `);

  if (deadRules.rows.length > 0) {
    issues.push({
      id: "RUL-001",
      category: CATEGORIES.rules,
      severity: "low",
      title: "Regras sem Correspondências",
      description: "Regras ativas que nunca foram aplicadas",
      affectedCount: deadRules.rows.length,
      samples: deadRules.rows.slice(0, 5).map((r: any) => ({
        id: r.id?.substring(0, 8),
        keyWords: r.key_words?.substring(0, 50),
        category1: r.category_1
      })),
      recommendation: "Considere desativar ou ajustar palavras-chave",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 2: Rules with orphan leaf_id
  checksRun++;
  const orphanLeafRules = await db.execute(sql`
    SELECT r.id, r.key_words, r.leaf_id
    FROM rules r
    LEFT JOIN taxonomy_leaf tl ON r.leaf_id = tl.leaf_id
    WHERE r.user_id = ${userId}
    AND r.leaf_id IS NOT NULL
    AND r.leaf_id != 'open'
    AND tl.leaf_id IS NULL
    LIMIT 10
  `);

  if (orphanLeafRules.rows.length > 0) {
    issues.push({
      id: "RUL-002",
      category: CATEGORIES.rules,
      severity: "high",
      title: "Regras com leaf_id Inválido",
      description: "Regras apontando para folhas inexistentes na taxonomia",
      affectedCount: orphanLeafRules.rows.length,
      samples: orphanLeafRules.rows.slice(0, 5).map((r: any) => ({
        id: r.id?.substring(0, 8),
        keyWords: r.key_words?.substring(0, 50),
        leafId: r.leaf_id
      })),
      recommendation: "Atualize leaf_id para valor válido ou OPEN",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  // Check 3: Overlapping keywords
  checksRun++;
  const allRules = await db.execute(sql`
    SELECT id, key_words, priority, category_1
    FROM rules
    WHERE user_id = ${userId}
    AND active = true
    AND key_words IS NOT NULL
  `);

  const overlaps: any[] = [];
  const rulesArray = allRules.rows as any[];
  for (let i = 0; i < rulesArray.length; i++) {
    for (let j = i + 1; j < rulesArray.length; j++) {
      const kw1 = (rulesArray[i].key_words || "").toLowerCase().split(/[;,]/);
      const kw2 = (rulesArray[j].key_words || "").toLowerCase().split(/[;,]/);
      const overlap = kw1.filter((k: string) => kw2.some((k2: string) => k.trim() === k2.trim() && k.trim().length > 3));
      if (overlap.length > 0 && rulesArray[i].category_1 !== rulesArray[j].category_1) {
        overlaps.push({
          rule1: { id: rulesArray[i].id?.substring(0, 8), category: rulesArray[i].category_1 },
          rule2: { id: rulesArray[j].id?.substring(0, 8), category: rulesArray[j].category_1 },
          overlappingKeywords: overlap.slice(0, 3)
        });
      }
    }
    if (overlaps.length >= 10) break;
  }

  if (overlaps.length > 0) {
    issues.push({
      id: "RUL-003",
      category: CATEGORIES.rules,
      severity: "medium",
      title: "Keywords Sobrepostas",
      description: "Regras com mesmas palavras-chave mas categorias diferentes",
      affectedCount: overlaps.length,
      samples: overlaps.slice(0, 5),
      recommendation: "Revise prioridades ou especifique melhor as keywords",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 4: Category mismatch between rule and leaf
  checksRun++;
  const categoryMismatch = await db.execute(sql`
    SELECT r.id, r.key_words, r.category_1 as rule_category,
           t1.nivel_1_pt as leaf_category, r.leaf_id
    FROM rules r
    JOIN taxonomy_leaf tl ON r.leaf_id = tl.leaf_id
    JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    WHERE r.user_id = ${userId}
    AND r.leaf_id IS NOT NULL
    AND CAST(r.category_1 AS text) != t1.nivel_1_pt
    LIMIT 10
  `);

  if (categoryMismatch.rows.length > 0) {
    issues.push({
      id: "RUL-004",
      category: CATEGORIES.rules,
      severity: "high",
      title: "Categoria Divergente da Taxonomia",
      description: "category_1 da regra não corresponde à hierarquia do leaf_id",
      affectedCount: categoryMismatch.rows.length,
      samples: categoryMismatch.rows.slice(0, 5).map((r: any) => ({
        id: r.id?.substring(0, 8),
        ruleCategory: r.rule_category,
        leafCategory: r.leaf_category,
        leafId: r.leaf_id
      })),
      recommendation: "Sincronize category_1 com a taxonomia do leaf_id",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  const status: CategoryResult["status"] = issues.some(i => i.severity === "critical") ? "critical"
               : issues.some(i => i.severity === "high") ? "warning" : "healthy";

  return {
    issues,
    categoryResult: {
      name: CATEGORIES.rules.name,
      icon: CATEGORIES.rules.icon,
      status,
      issueCount: issues.length,
      checksRun,
      checksPassed
    }
  };
}

// ============================================================================
// CATEGORIZATION DIAGNOSTICS
// ============================================================================

async function runCategorizationDiagnostics(userId: string) {
  const issues: DiagnosticIssue[] = [];
  let checksRun = 0;
  let checksPassed = 0;

  // Check 1: OPEN leaf with non-OPEN app_category_name
  checksRun++;
  const openLeafWrongCategory = await db.execute(sql`
    SELECT t.id, t.key_desc, t.leaf_id, t.app_category_name, t.category_1, tl.nivel_3_pt
    FROM transactions t
    JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
    WHERE t.user_id = ${userId}
    AND tl.nivel_3_pt = 'OPEN'
    AND t.app_category_name IS NOT NULL
    AND t.app_category_name != 'OPEN'
    LIMIT 20
  `);

  if (openLeafWrongCategory.rows.length > 0) {
    issues.push({
      id: "CAT-001",
      category: CATEGORIES.categorization,
      severity: "critical",
      title: "OPEN com Categoria Atribuída",
      description: "Transações com leaf_id OPEN mas app_category_name diferente",
      affectedCount: openLeafWrongCategory.rows.length,
      samples: openLeafWrongCategory.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 50),
        appCategoryName: r.app_category_name,
        leafName: r.nivel_3_pt
      })),
      recommendation: "Defina app_category_name como OPEN ou reclassifique",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  // Check 2: category_1 != OPEN but leaf is OPEN
  checksRun++;
  const category1LeafMismatch = await db.execute(sql`
    SELECT t.id, t.key_desc, t.leaf_id, t.category_1, tl.nivel_3_pt
    FROM transactions t
    JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
    WHERE t.user_id = ${userId}
    AND tl.nivel_3_pt = 'OPEN'
    AND t.category_1 IS NOT NULL
    AND CAST(t.category_1 AS text) != 'OPEN'
    LIMIT 20
  `);

  if (category1LeafMismatch.rows.length > 0) {
    issues.push({
      id: "CAT-002",
      category: CATEGORIES.categorization,
      severity: "critical",
      title: "Category_1 Incompatível com Leaf",
      description: "category_1 diferente de OPEN mas leaf_id aponta para OPEN",
      affectedCount: category1LeafMismatch.rows.length,
      samples: category1LeafMismatch.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 50),
        category1: r.category_1,
        leafName: r.nivel_3_pt
      })),
      recommendation: "Rederive category_1 a partir do leaf_id",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  // Check 3: NULL leaf_id
  checksRun++;
  const nullLeafId = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM transactions
    WHERE user_id = ${userId}
    AND leaf_id IS NULL
  `);

  const nullCount = parseInt((nullLeafId.rows[0] as any)?.count || "0");
  if (nullCount > 0) {
    issues.push({
      id: "CAT-003",
      category: CATEGORIES.categorization,
      severity: "medium",
      title: "Transações sem leaf_id",
      description: "Transações sem classificação taxonômica atribuída",
      affectedCount: nullCount,
      samples: [],
      recommendation: "Execute reclassificação ou atribua OPEN",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  // Check 4: Low confidence unreviewed
  checksRun++;
  const lowConfidence = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM transactions
    WHERE user_id = ${userId}
    AND confidence < 50
    AND needs_review = true
    AND manual_override = false
  `);

  const lowConfCount = parseInt((lowConfidence.rows[0] as any)?.count || "0");
  if (lowConfCount > 10) {
    issues.push({
      id: "CAT-004",
      category: CATEGORIES.categorization,
      severity: "low",
      title: "Baixa Confiança Pendente",
      description: "Muitas transações com baixa confiança aguardando revisão",
      affectedCount: lowConfCount,
      samples: [],
      recommendation: "Revise na página /confirm ou crie novas regras",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 5: Orphan leaf_id in transactions
  checksRun++;
  const orphanLeafTx = await db.execute(sql`
    SELECT t.id, t.key_desc, t.leaf_id
    FROM transactions t
    LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
    WHERE t.user_id = ${userId}
    AND t.leaf_id IS NOT NULL
    AND tl.leaf_id IS NULL
    LIMIT 10
  `);

  if (orphanLeafTx.rows.length > 0) {
    issues.push({
      id: "CAT-005",
      category: CATEGORIES.categorization,
      severity: "high",
      title: "leaf_id Órfão em Transações",
      description: "Transações apontando para folhas inexistentes",
      affectedCount: orphanLeafTx.rows.length,
      samples: orphanLeafTx.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 50),
        leafId: r.leaf_id
      })),
      recommendation: "Reclassifique transações para leaf_id válido",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  const status: CategoryResult["status"] = issues.some(i => i.severity === "critical") ? "critical"
               : issues.some(i => i.severity === "high") ? "warning" : "healthy";

  return {
    issues,
    categoryResult: {
      name: CATEGORIES.categorization.name,
      icon: CATEGORIES.categorization.icon,
      status,
      issueCount: issues.length,
      checksRun,
      checksPassed
    }
  };
}

// ============================================================================
// FINANCIAL DIAGNOSTICS
// ============================================================================

async function runFinancialDiagnostics(userId: string) {
  const issues: DiagnosticIssue[] = [];
  let checksRun = 0;
  let checksPassed = 0;

  // Check 1: GEHALT (salary) as expense
  checksRun++;
  const gehaltExpense = await db.execute(sql`
    SELECT id, key_desc, amount, payment_date
    FROM transactions
    WHERE user_id = ${userId}
    AND LOWER(key_desc) LIKE '%gehalt%'
    AND amount < 0
    LIMIT 10
  `);

  if (gehaltExpense.rows.length > 0) {
    issues.push({
      id: "FIN-001",
      category: CATEGORIES.financial,
      severity: "critical",
      title: "Salário como Despesa",
      description: "Transações GEHALT (salário) registradas com valor negativo",
      affectedCount: gehaltExpense.rows.length,
      samples: gehaltExpense.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 50),
        amount: r.amount,
        date: r.payment_date
      })),
      recommendation: "Verifique sinal do valor ou classificação",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 2: Type/amount sign mismatch
  checksRun++;
  const typeMismatch = await db.execute(sql`
    SELECT id, key_desc, amount, type
    FROM transactions
    WHERE user_id = ${userId}
    AND ((type = 'Receita' AND amount < 0) OR (type = 'Despesa' AND amount > 0))
    LIMIT 20
  `);

  if (typeMismatch.rows.length > 0) {
    issues.push({
      id: "FIN-002",
      category: CATEGORIES.financial,
      severity: "high",
      title: "Tipo/Sinal Inconsistente",
      description: "Receita com valor negativo ou Despesa com valor positivo",
      affectedCount: typeMismatch.rows.length,
      samples: typeMismatch.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 50),
        amount: r.amount,
        type: r.type
      })),
      recommendation: "Corrija o tipo ou o sinal do valor",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  // Check 3: Large unreviewed transactions
  checksRun++;
  const largeUnreviewed = await db.execute(sql`
    SELECT id, key_desc, amount, payment_date, needs_review
    FROM transactions
    WHERE user_id = ${userId}
    AND ABS(amount) > 1000
    AND needs_review = true
    AND manual_override = false
    ORDER BY ABS(amount) DESC
    LIMIT 10
  `);

  if (largeUnreviewed.rows.length > 0) {
    issues.push({
      id: "FIN-003",
      category: CATEGORIES.financial,
      severity: "medium",
      title: "Transações Grandes Pendentes",
      description: "Transações > €1000 aguardando revisão",
      affectedCount: largeUnreviewed.rows.length,
      samples: largeUnreviewed.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 50),
        amount: r.amount,
        date: r.payment_date
      })),
      recommendation: "Revise e confirme transações de alto valor",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 4: Potential duplicates (same amount, date, similar description)
  checksRun++;
  const potentialDupes = await db.execute(sql`
    SELECT payment_date::date as tx_date, amount, COUNT(*) as count,
           ARRAY_AGG(DISTINCT SUBSTRING(key_desc, 1, 30)) as descriptions
    FROM transactions
    WHERE user_id = ${userId}
    GROUP BY payment_date::date, amount
    HAVING COUNT(*) > 1 AND ABS(amount) > 10
    ORDER BY count DESC
    LIMIT 10
  `);

  if (potentialDupes.rows.length > 0) {
    issues.push({
      id: "FIN-004",
      category: CATEGORIES.financial,
      severity: "medium",
      title: "Possíveis Duplicatas",
      description: "Transações com mesmo valor e data",
      affectedCount: potentialDupes.rows.length,
      samples: potentialDupes.rows.slice(0, 5).map((r: any) => ({
        date: r.tx_date,
        amount: r.amount,
        count: r.count,
        descriptions: r.descriptions?.slice(0, 2)
      })),
      recommendation: "Revise e remova duplicatas se confirmado",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  const status: CategoryResult["status"] = issues.some(i => i.severity === "critical") ? "critical"
               : issues.some(i => i.severity === "high") ? "warning" : "healthy";

  return {
    issues,
    categoryResult: {
      name: CATEGORIES.financial.name,
      icon: CATEGORIES.financial.icon,
      status,
      issueCount: issues.length,
      checksRun,
      checksPassed
    }
  };
}

// ============================================================================
// TAXONOMY DIAGNOSTICS
// ============================================================================

async function runTaxonomyDiagnostics(userId: string) {
  const issues: DiagnosticIssue[] = [];
  let checksRun = 0;
  let checksPassed = 0;

  // Check 1: Broken hierarchy (leaf -> level2)
  checksRun++;
  const brokenLevel2 = await db.execute(sql`
    SELECT tl.leaf_id, tl.nivel_3_pt, tl.level_2_id
    FROM taxonomy_leaf tl
    LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    WHERE tl.user_id = ${userId}
    AND t2.level_2_id IS NULL
    LIMIT 10
  `);

  if (brokenLevel2.rows.length > 0) {
    issues.push({
      id: "TAX-001",
      category: CATEGORIES.taxonomy,
      severity: "critical",
      title: "Hierarquia Quebrada (Leaf→Level2)",
      description: "Folhas apontando para level_2 inexistente",
      affectedCount: brokenLevel2.rows.length,
      samples: brokenLevel2.rows.slice(0, 5).map((r: any) => ({
        leafId: r.leaf_id,
        leafName: r.nivel_3_pt,
        level2Id: r.level_2_id
      })),
      recommendation: "Recrie a hierarquia ou delete folhas órfãs",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 2: Inconsistent OPEN chain
  checksRun++;
  const inconsistentOpen = await db.execute(sql`
    SELECT tl.leaf_id, tl.nivel_3_pt, t2.nivel_2_pt, t1.nivel_1_pt
    FROM taxonomy_leaf tl
    JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    WHERE tl.user_id = ${userId}
    AND (tl.nivel_3_pt = 'OPEN' OR t2.nivel_2_pt = 'OPEN' OR t1.nivel_1_pt = 'OPEN')
    AND NOT (tl.nivel_3_pt = 'OPEN' AND t2.nivel_2_pt = 'OPEN' AND t1.nivel_1_pt = 'OPEN')
    LIMIT 10
  `);

  if (inconsistentOpen.rows.length > 0) {
    issues.push({
      id: "TAX-002",
      category: CATEGORIES.taxonomy,
      severity: "high",
      title: "Cadeia OPEN Inconsistente",
      description: "OPEN parcial na hierarquia (deve ser completo)",
      affectedCount: inconsistentOpen.rows.length,
      samples: inconsistentOpen.rows.slice(0, 5).map((r: any) => ({
        leafId: r.leaf_id,
        level3: r.nivel_3_pt,
        level2: r.nivel_2_pt,
        level1: r.nivel_1_pt
      })),
      recommendation: "OPEN deve ser consistente em todos os níveis",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  // Check 3: OPEN leaf linked to wrong app_category
  checksRun++;
  const openWrongAppCat = await db.execute(sql`
    SELECT acl.id as link_id, acl.leaf_id, ac.name as app_category_name
    FROM app_category_leaf acl
    JOIN taxonomy_leaf tl ON acl.leaf_id = tl.leaf_id
    JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    JOIN app_category ac ON acl.app_cat_id = ac.app_cat_id
    WHERE acl.user_id = ${userId}
    AND tl.nivel_3_pt = 'OPEN' AND t2.nivel_2_pt = 'OPEN' AND t1.nivel_1_pt = 'OPEN'
    AND ac.name != 'OPEN'
    LIMIT 10
  `);

  if (openWrongAppCat.rows.length > 0) {
    issues.push({
      id: "TAX-003",
      category: CATEGORIES.taxonomy,
      severity: "critical",
      title: "OPEN Vinculado a App Category Errado",
      description: "Leaf OPEN linkado a app_category diferente de OPEN",
      affectedCount: openWrongAppCat.rows.length,
      samples: openWrongAppCat.rows.slice(0, 5).map((r: any) => ({
        linkId: r.link_id,
        leafId: r.leaf_id,
        appCategoryName: r.app_category_name
      })),
      recommendation: "Remova links incorretos ou corrija app_category",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  // Check 4: Missing OPEN leaf
  checksRun++;
  const openLeaf = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM taxonomy_leaf tl
    JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    WHERE tl.user_id = ${userId}
    AND tl.nivel_3_pt = 'OPEN' AND t2.nivel_2_pt = 'OPEN' AND t1.nivel_1_pt = 'OPEN'
  `);

  const openCount = parseInt((openLeaf.rows[0] as any)?.count || "0");
  if (openCount === 0) {
    issues.push({
      id: "TAX-004",
      category: CATEGORIES.taxonomy,
      severity: "critical",
      title: "Leaf OPEN Ausente",
      description: "Não existe folha OPEN na taxonomia",
      affectedCount: 1,
      samples: [],
      recommendation: "Execute ensureOpenCategory() para criar",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  const status: CategoryResult["status"] = issues.some(i => i.severity === "critical") ? "critical"
               : issues.some(i => i.severity === "high") ? "warning" : "healthy";

  return {
    issues,
    categoryResult: {
      name: CATEGORIES.taxonomy.name,
      icon: CATEGORIES.taxonomy.icon,
      status,
      issueCount: issues.length,
      checksRun,
      checksPassed
    }
  };
}

// ============================================================================
// AUTO-FIX FUNCTIONS
// ============================================================================

// ============================================================================
// HISTORY TRACKING
// ============================================================================

// In-memory history (in production, store in DB)
const diagnosticHistory: Map<string, DiagnosticResult[]> = new Map();

export async function getDiagnosticHistory(): Promise<DiagnosticResult[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return diagnosticHistory.get(session.user.id) || [];
}

export async function saveDiagnosticResult(result: DiagnosticResult): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const userId = session.user.id;
  const history = diagnosticHistory.get(userId) || [];

  // Keep last 10 results
  history.unshift(result);
  if (history.length > 10) history.pop();

  diagnosticHistory.set(userId, history);
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export async function exportDiagnosticsCSV(result: DiagnosticResult): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const lines: string[] = [];

  // Header
  lines.push("ID,Categoria,Severidade,Título,Descrição,Afetados,Recomendação,Auto-Fix");

  // Data
  for (const issue of result.issues) {
    lines.push([
      issue.id,
      `"${issue.category.name}"`,
      issue.severity,
      `"${issue.title}"`,
      `"${issue.description}"`,
      issue.affectedCount,
      `"${issue.recommendation}"`,
      issue.autoFixable ? "Sim" : "Não"
    ].join(","));
  }

  return lines.join("\n");
}

export async function exportDiagnosticsJSON(result: DiagnosticResult): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return JSON.stringify(result, null, 2);
}

// ============================================================================
// BULK FIX
// ============================================================================

export async function bulkFixIssues(issueIds: string[]): Promise<{
  success: boolean;
  results: Array<{ id: string; success: boolean; message: string; fixed: number }>
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const results: Array<{ id: string; success: boolean; message: string; fixed: number }> = [];

  for (const issueId of issueIds) {
    try {
      const result = await autoFixIssue(issueId);
      results.push({ id: issueId, ...result });
    } catch (error: any) {
      results.push({ id: issueId, success: false, message: error.message, fixed: 0 });
    }
  }

  return { success: results.every(r => r.success), results };
}

// ============================================================================
// GET AFFECTED RECORDS (for drill-down)
// ============================================================================

export async function getAffectedRecords(issueId: string, limit: number = 50): Promise<any[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  switch (issueId) {
    case "CAT-001":
      const cat001 = await db.execute(sql`
        SELECT t.id, t.key_desc, t.amount, t.payment_date, t.leaf_id, t.app_category_name
        FROM transactions t
        JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
        WHERE t.user_id = ${userId}
        AND tl.nivel_3_pt = 'OPEN'
        AND t.app_category_name IS NOT NULL
        AND t.app_category_name != 'OPEN'
        LIMIT ${limit}
      `);
      return cat001.rows;

    case "CAT-002":
      const cat002 = await db.execute(sql`
        SELECT t.id, t.key_desc, t.amount, t.payment_date, t.leaf_id, t.category_1
        FROM transactions t
        JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
        WHERE t.user_id = ${userId}
        AND tl.nivel_3_pt = 'OPEN'
        AND t.category_1 IS NOT NULL
        AND CAST(t.category_1 AS text) != 'OPEN'
        LIMIT ${limit}
      `);
      return cat002.rows;

    case "FIN-001":
      const fin001 = await db.execute(sql`
        SELECT id, key_desc, amount, payment_date, type, category_1
        FROM transactions
        WHERE user_id = ${userId}
        AND LOWER(key_desc) LIKE '%gehalt%'
        AND amount < 0
        LIMIT ${limit}
      `);
      return fin001.rows;

    case "FIN-002":
      const fin002 = await db.execute(sql`
        SELECT id, key_desc, amount, payment_date, type
        FROM transactions
        WHERE user_id = ${userId}
        AND ((type = 'Receita' AND amount < 0) OR (type = 'Despesa' AND amount > 0))
        LIMIT ${limit}
      `);
      return fin002.rows;

    default:
      return [];
  }
}

// ============================================================================
// AUTO-FIX FUNCTIONS
// ============================================================================

export async function autoFixIssue(issueId: string): Promise<{ success: boolean; message: string; fixed: number }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  switch (issueId) {
    case "CAT-001": // OPEN leaf with non-OPEN app_category_name
      const result1 = await db.execute(sql`
        UPDATE transactions t
        SET app_category_name = 'OPEN'
        FROM taxonomy_leaf tl
        WHERE t.leaf_id = tl.leaf_id
        AND t.user_id = ${userId}
        AND tl.nivel_3_pt = 'OPEN'
        AND t.app_category_name IS NOT NULL
        AND t.app_category_name != 'OPEN'
      `);
      return { success: true, message: "app_category_name definido como OPEN", fixed: result1.rowCount || 0 };

    case "CAT-002": // category_1 != OPEN but leaf is OPEN
      const result2 = await db.execute(sql`
        UPDATE transactions t
        SET category_1 = 'OPEN', category_2 = 'OPEN', category_3 = 'OPEN'
        FROM taxonomy_leaf tl
        WHERE t.leaf_id = tl.leaf_id
        AND t.user_id = ${userId}
        AND tl.nivel_3_pt = 'OPEN'
        AND CAST(t.category_1 AS text) != 'OPEN'
      `);
      return { success: true, message: "Categorias sincronizadas com OPEN", fixed: result2.rowCount || 0 };

    case "FIN-002": // Type/amount sign mismatch
      const result3 = await db.execute(sql`
        UPDATE transactions
        SET type = CASE WHEN amount > 0 THEN 'Receita' ELSE 'Despesa' END
        WHERE user_id = ${userId}
        AND ((type = 'Receita' AND amount < 0) OR (type = 'Despesa' AND amount > 0))
      `);
      return { success: true, message: "Tipos corrigidos baseado no sinal", fixed: result3.rowCount || 0 };

    case "TAX-003": // OPEN leaf linked to wrong app_category
      const result4 = await db.execute(sql`
        DELETE FROM app_category_leaf acl
        USING taxonomy_leaf tl, taxonomy_level_2 t2, taxonomy_level_1 t1, app_category ac
        WHERE acl.leaf_id = tl.leaf_id
        AND tl.level_2_id = t2.level_2_id
        AND t2.level_1_id = t1.level_1_id
        AND acl.app_cat_id = ac.app_cat_id
        AND acl.user_id = ${userId}
        AND tl.nivel_3_pt = 'OPEN' AND t2.nivel_2_pt = 'OPEN' AND t1.nivel_1_pt = 'OPEN'
        AND ac.name != 'OPEN'
      `);
      return { success: true, message: "Links incorretos removidos", fixed: result4.rowCount || 0 };

    default:
      return { success: false, message: `Correção automática não disponível para ${issueId}`, fixed: 0 };
  }
}
