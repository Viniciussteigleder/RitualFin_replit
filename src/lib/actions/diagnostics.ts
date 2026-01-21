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
import type { DiagnosticStage } from "@/lib/diagnostics/catalog-core";
import { getCatalogItemCore } from "@/lib/diagnostics/catalog-core";
import {
  detectDateFormatDrift,
  detectNumberLocaleDrift,
  detectReplacementChar,
  getColumnCount,
  pickFirstPresent,
} from "@/lib/diagnostics/detectors";

// ============================================================================
// TYPES
// ============================================================================

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface DiagnosticIssue {
  id: string;
  category: DiagnosticCategory;
  severity: Severity;
  stage?: DiagnosticStage;
  title: string;
  description: string;
  affectedCount: number;
  samples: any[];
  recommendation: string;
  autoFixable: boolean;
  confidenceLabel?: "raw-backed" | "DB-only (low confidence)";
  includeInHealthScore?: boolean;
  howWeKnow?: string;
  approach?: string;
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
    lineage: CategoryResult;
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

export type DiagnosticsScope =
  | { kind: "all_recent"; recentBatches?: number }
  | { kind: "batch"; batchId: string }
  | { kind: "date_range"; from: string; to: string };

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
  },
  lineage: {
    id: "lineage",
    name: "Rastreabilidade de Dados",
    icon: "Link",
    description: "Verifica cadeia de evidências e origem das transações"
  }
} as const;

// ============================================================================
// MAIN DIAGNOSTIC FUNCTION
// ============================================================================

export async function runFullDiagnostics(scope: DiagnosticsScope = { kind: "all_recent", recentBatches: 10 }): Promise<DiagnosticResult> {
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
    taxonomyIssues,
    lineageIssues
  ] = await Promise.all([
    runImportDiagnostics(userId, scope),
    runRuleDiagnostics(userId),
    runCategorizationDiagnostics(userId),
    runFinancialDiagnostics(userId),
    runTaxonomyDiagnostics(userId),
    runDataLineageDiagnostics(userId)
  ]);

  issues.push(...importIssues.issues, ...ruleIssues.issues, ...categorizationIssues.issues,
              ...financialIssues.issues, ...taxonomyIssues.issues, ...lineageIssues.issues);

  const enrichedIssues = issues.map(enrichIssueFromCatalog);

  // Calculate summary
  const critical = enrichedIssues.filter(i => i.severity === "critical").length;
  const high = enrichedIssues.filter(i => i.severity === "high").length;
  const medium = enrichedIssues.filter(i => i.severity === "medium").length;
  const low = enrichedIssues.filter(i => i.severity === "low").length;
  const info = enrichedIssues.filter(i => i.severity === "info").length;

  const scoreEligible = enrichedIssues.filter((i) => i.includeInHealthScore !== false);
  const scoreCritical = scoreEligible.filter(i => i.severity === "critical").length;
  const scoreHigh = scoreEligible.filter(i => i.severity === "high").length;
  const scoreMedium = scoreEligible.filter(i => i.severity === "medium").length;
  const scoreLow = scoreEligible.filter(i => i.severity === "low").length;

  // Health score: 100 - (critical*25 + high*10 + medium*5 + low*2)
  const healthScore = Math.max(
    0,
    Math.min(100, 100 - (scoreCritical * 25) - (scoreHigh * 10) - (scoreMedium * 5) - (scoreLow * 2))
  );

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
      taxonomy: taxonomyIssues.categoryResult,
      lineage: lineageIssues.categoryResult
    },
    issues: enrichedIssues
  };
}

// ============================================================================
// IMPORT DIAGNOSTICS
// ============================================================================

async function runImportDiagnostics(userId: string, scope: DiagnosticsScope) {
  const issues: DiagnosticIssue[] = [];
  let checksRun = 0;
  let checksPassed = 0;

  const batchIds = await resolveScopeBatchIds(userId, scope);
  const primaryBatchId = batchIds[0];

  // FILE-001 (raw-backed): encoding suspicion via replacement char
  checksRun++;
  if (primaryBatchId) {
    const rows = await db
      .select({
        id: ingestionItems.id,
        batchId: ingestionItems.batchId,
        rowIndex: ingestionItems.rowIndex,
        rawColumnsJson: ingestionItems.rawColumnsJson,
        rawPayload: ingestionItems.rawPayload,
      })
      .from(ingestionItems)
      .where(eq(ingestionItems.batchId, primaryBatchId))
      .limit(600);

    const hit = rows
      .filter((r) => detectReplacementChar((r.rawColumnsJson as any) ?? (r.rawPayload as any)))
      .slice(0, 5)
      .map((r) => ({
        ingestionItemId: r.id,
        batchId: r.batchId,
        rowIndex: r.rowIndex,
        rawColumns: r.rawColumnsJson ?? r.rawPayload,
      }));

    if (hit.length > 0) {
      issues.push({
        id: "FILE-001",
        category: CATEGORIES.imports,
        severity: "high",
        title: "Possível problema de encoding (caractere de substituição)",
        description: "Algumas linhas parecem conter caracteres corrompidos (�), sugerindo encoding errado.",
        affectedCount: hit.length,
        samples: hit,
        recommendation: "Reimportar/reprocessar com encoding correto.",
        autoFixable: false,
      });
    } else {
      checksPassed++;
    }
  } else {
    checksPassed++;
  }

  // FILE-003 (raw-backed): variable column counts (sample-based)
  checksRun++;
  if (primaryBatchId) {
    const rows = await db
      .select({
        id: ingestionItems.id,
        batchId: ingestionItems.batchId,
        rowIndex: ingestionItems.rowIndex,
        rawColumnsJson: ingestionItems.rawColumnsJson,
      })
      .from(ingestionItems)
      .where(eq(ingestionItems.batchId, primaryBatchId))
      .limit(800);

    const counts = rows.map((r) => ({
      ingestionItemId: r.id,
      batchId: r.batchId,
      rowIndex: r.rowIndex,
      columnCount: getColumnCount((r.rawColumnsJson as any) ?? null),
      rawColumns: r.rawColumnsJson,
    }));
    const nonZero = counts.filter((c) => c.columnCount > 0);
    const distinct = new Set(nonZero.map((c) => c.columnCount));
    if (distinct.size > 1) {
      const sorted = [...distinct].sort((a, b) => a - b);
      const min = sorted[0]!;
      const max = sorted[sorted.length - 1]!;
      const outliers = nonZero.filter((c) => c.columnCount === min || c.columnCount === max).slice(0, 5);
      issues.push({
        id: "FILE-003",
        category: CATEGORIES.imports,
        severity: "high",
        title: "Contagem de colunas variável por linha",
        description: `A contagem de colunas varia nas amostras (min=${min}, max=${max}).`,
        affectedCount: outliers.length,
        samples: outliers,
        recommendation: "Revisar delimitador/aspas e reprocessar; ver linhas outlier no diff viewer.",
        autoFixable: false,
      });
    } else {
      checksPassed++;
    }
  } else {
    checksPassed++;
  }

  // PAR-013 (raw-backed): locale number drift
  checksRun++;
  if (primaryBatchId) {
    const rows = await db
      .select({
        id: ingestionItems.id,
        batchId: ingestionItems.batchId,
        rowIndex: ingestionItems.rowIndex,
        rawColumnsJson: ingestionItems.rawColumnsJson,
      })
      .from(ingestionItems)
      .where(eq(ingestionItems.batchId, primaryBatchId))
      .limit(1000);

    const amountStrings = rows
      .map((r) => pickFirstPresent((r.rawColumnsJson as any) ?? null, ["Betrag", "Amount", "amount", "betrag"]))
      .filter(Boolean);
    const drift = detectNumberLocaleDrift(amountStrings);
    if (drift.drift) {
      const examples = rows
        .map((r) => ({
          ingestionItemId: r.id,
          batchId: r.batchId,
          rowIndex: r.rowIndex,
          amountRaw: pickFirstPresent((r.rawColumnsJson as any) ?? null, ["Betrag", "Amount", "amount", "betrag"]),
          rawColumns: r.rawColumnsJson,
        }))
        .filter((x) => !!x.amountRaw)
        .slice(0, 8);

      issues.push({
        id: "PAR-013",
        category: CATEGORIES.imports,
        severity: "medium",
        title: "Drift de locale numérico no mesmo batch",
        description: `Padrões mistos detectados (EU=${drift.eu}, US=${drift.us}).`,
        affectedCount: drift.eu + drift.us,
        samples: examples,
        recommendation: "Ajustar separadores decimais/milhares e reprocessar o batch.",
        autoFixable: false,
      });
    } else {
      checksPassed++;
    }
  } else {
    checksPassed++;
  }

  // PAR-016 (raw-backed): date format drift
  checksRun++;
  if (primaryBatchId) {
    const rows = await db
      .select({
        id: ingestionItems.id,
        batchId: ingestionItems.batchId,
        rowIndex: ingestionItems.rowIndex,
        rawColumnsJson: ingestionItems.rawColumnsJson,
      })
      .from(ingestionItems)
      .where(eq(ingestionItems.batchId, primaryBatchId))
      .limit(1000);

    const dateStrings = rows
      .map((r) =>
        pickFirstPresent((r.rawColumnsJson as any) ?? null, ["Buchungstag", "Valutadatum", "Datum", "Authorised on", "Processed on"])
      )
      .filter(Boolean);

    const drift = detectDateFormatDrift(dateStrings);
    if (drift.drift) {
      const examples = rows
        .map((r) => ({
          ingestionItemId: r.id,
          batchId: r.batchId,
          rowIndex: r.rowIndex,
          dateRaw: pickFirstPresent((r.rawColumnsJson as any) ?? null, ["Buchungstag", "Valutadatum", "Datum", "Authorised on", "Processed on"]),
          rawColumns: r.rawColumnsJson,
        }))
        .filter((x) => !!x.dateRaw)
        .slice(0, 8);

      issues.push({
        id: "PAR-016",
        category: CATEGORIES.imports,
        severity: "medium",
        title: "Drift de formato de data no mesmo batch",
        description: `Múltiplos formatos detectados (known=${drift.distinctKnownFormats}).`,
        affectedCount: dateStrings.length,
        samples: examples,
        recommendation: "Definir date_format e reprocessar; se necessário, separar o arquivo.",
        autoFixable: false,
      });
    } else {
      checksPassed++;
    }
  } else {
    checksPassed++;
  }

  // BCH-002 (raw-backed-ish): sum mismatch parsed vs DB, uses upload_id (batch id) on transactions
  checksRun++;
  if (primaryBatchId) {
    const sums = await db.execute(sql`
      SELECT
        ib.id AS batch_id,
        COALESCE(
          SUM(
            CASE
              WHEN (ii.parsed_payload->>'amount') ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN (ii.parsed_payload->>'amount')::numeric
              ELSE 0
            END
          ),
          0
        ) AS parsed_sum,
        COALESCE(SUM(t.amount), 0) AS db_sum,
        COUNT(ii.id)::int AS parsed_count,
        COUNT(t.id)::int AS db_count
      FROM ingestion_batches ib
      LEFT JOIN ingestion_items ii ON ii.batch_id = ib.id
      LEFT JOIN transactions t ON t.upload_id = ib.id
      WHERE ib.user_id = ${userId}
        AND ib.id = ${primaryBatchId}
      GROUP BY ib.id
    `);

    const row = sums.rows[0] as any;
    const parsedSum = Number(row?.parsed_sum ?? 0);
    const dbSum = Number(row?.db_sum ?? 0);
    const diff = Math.abs(parsedSum - dbSum);
    if (diff > 0.01 && (Math.abs(parsedSum) > 0.01 || Math.abs(dbSum) > 0.01)) {
      issues.push({
        id: "BCH-002",
        category: CATEGORIES.imports,
        severity: "high",
        title: "Mismatch de soma (Parsed vs DB) por batch",
        description: `parsed_sum=${parsedSum.toFixed(2)} vs db_sum=${dbSum.toFixed(2)} (diff=${diff.toFixed(2)}).`,
        affectedCount: Number(row?.db_count ?? 0),
        samples: [],
        recommendation: "Inspecionar exemplos no drill-down e reprocessar o batch (locale/sinal).",
        autoFixable: false,
      });
    } else {
      checksPassed++;
    }
  } else {
    checksPassed++;
  }

  // BCH-003 (raw-backed): duplicate file hash across batches
  checksRun++;
  const dupBatches = await db.execute(sql`
    SELECT file_hash_sha256, COUNT(*)::int AS cnt
    FROM ingestion_batches
    WHERE user_id = ${userId}
      AND file_hash_sha256 IS NOT NULL
    GROUP BY file_hash_sha256
    HAVING COUNT(*) > 1
    LIMIT 20
  `);
  if (dupBatches.rows.length > 0) {
    issues.push({
      id: "BCH-003",
      category: CATEGORIES.imports,
      severity: "medium",
      title: "Possível import duplicado (mesmo file hash)",
      description: "Um ou mais hashes de arquivo aparecem em múltiplos batches.",
      affectedCount: dupBatches.rows.length,
      samples: dupBatches.rows.slice(0, 5),
      recommendation: "Identificar duplicados pelo hash e fazer rollback/quarentena do duplicado.",
      autoFixable: false,
    });
  } else {
    checksPassed++;
  }

  // Check 0: Missing provenance linkage (raw-backed via batch + fingerprint join)
  checksRun++;
  const missingLinks = await db.execute(sql`
    SELECT
      t.id AS transaction_id,
      t.key_desc,
      t.amount,
      t.payment_date,
      t.upload_id AS batch_id,
      ii.id AS ingestion_item_id,
      ii.raw_row_hash
    FROM transactions t
    JOIN ingestion_items ii
      ON ii.batch_id = t.upload_id
     AND ii.item_fingerprint = t.key
    WHERE t.user_id = ${userId}
      AND t.upload_id IS NOT NULL
      AND t.ingestion_item_id IS NULL
    LIMIT 20
  `);

  if (missingLinks.rows.length > 0) {
    issues.push({
      id: "BCH-001",
      category: CATEGORIES.imports,
      severity: "high",
      title: "Transações sem link de evidência (raw-backed)",
      description:
        "Existem transações importadas que conseguem ser reconciliadas com uma linha bruta (batch_id + fingerprint), mas não possuem linkage persistido (ingestion_item_id / transaction_evidence_link).",
      affectedCount: missingLinks.rows.length,
      samples: missingLinks.rows.slice(0, 5).map((r: any) => ({
        transactionId: r.transaction_id,
        batchId: r.batch_id,
        ingestionItemId: r.ingestion_item_id,
        rawRowHash: r.raw_row_hash,
        keyDesc: r.key_desc,
        amount: r.amount,
        paymentDate: r.payment_date,
      })),
      recommendation:
        "Execute o backfill de proveniência (admin) para preencher ingestion_item_id e criar transaction_evidence_link. Depois re-execute os diagnósticos.",
      autoFixable: false,
    });
  } else {
    checksPassed++;
  }

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

function enrichIssueFromCatalog(issue: DiagnosticIssue): DiagnosticIssue {
  const catalog = getCatalogItemCore(issue.id);
  if (!catalog) {
    return {
      ...issue,
      confidenceLabel: "DB-only (low confidence)",
      includeInHealthScore: false,
    };
  }

  return {
    ...issue,
    stage: catalog.stage,
    howWeKnow: issue.howWeKnow ?? catalog.howWeKnowPt,
    approach: issue.approach ?? catalog.approachPt,
    recommendation: issue.recommendation || catalog.recommendedActionPt,
    confidenceLabel: "raw-backed",
    includeInHealthScore: catalog.includeInHealthScoreByDefault,
  };
}

async function resolveScopeBatchIds(userId: string, scope: DiagnosticsScope): Promise<string[]> {
  if (scope.kind === "batch") return [scope.batchId];

  if (scope.kind === "date_range") {
    const from = new Date(scope.from);
    const to = new Date(scope.to);
    const rows = await db.execute(sql`
      SELECT DISTINCT ib.id
      FROM ingestion_batches ib
      JOIN transactions t ON t.upload_id = ib.id
      WHERE ib.user_id = ${userId}
        AND t.payment_date >= ${from}
        AND t.payment_date <= ${to}
      ORDER BY ib.created_at DESC
      LIMIT 50
    `);
    return (rows.rows as any[]).map((r) => r.id);
  }

  const limit = Math.max(1, Math.min(50, scope.recentBatches ?? 10));
  const rows = await db.execute(sql`
    SELECT id
    FROM ingestion_batches
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
  return (rows.rows as any[]).map((r) => r.id);
}

export async function getRecentBatchesForDiagnostics(
  limit: number = 20
): Promise<Array<{ id: string; filename: string | null; createdAt: string }>> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const rows = await db.execute(sql`
    SELECT id, filename, created_at
    FROM ingestion_batches
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${Math.max(1, Math.min(50, limit))}
  `);

  return (rows.rows as any[]).map((r) => ({
    id: r.id,
    filename: r.filename ?? null,
    createdAt: r.created_at?.toISOString?.() ?? String(r.created_at),
  }));
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

  // Check 5: Statistical Anomaly Detection (Z-score outliers)
  // W. Edwards Deming: Statistical process control for transaction values
  checksRun++;
  const statsResult = await db.execute(sql`
    SELECT AVG(ABS(amount)) as avg_amount,
           STDDEV(ABS(amount)) as stddev_amount
    FROM transactions
    WHERE user_id = ${userId}
    AND ABS(amount) > 1
  `);

  const avgAmount = parseFloat((statsResult.rows[0] as any)?.avg_amount || "0");
  const stddevAmount = parseFloat((statsResult.rows[0] as any)?.stddev_amount || "0");

  if (avgAmount > 0 && stddevAmount > 0) {
    // Find transactions more than 4 standard deviations from mean (extreme outliers)
    const zScoreThreshold = avgAmount + (4 * stddevAmount);
    const extremeOutliers = await db.execute(sql`
      SELECT id, key_desc, amount, payment_date, source,
             (ABS(amount) - ${avgAmount}) / ${stddevAmount} as z_score
      FROM transactions
      WHERE user_id = ${userId}
      AND ABS(amount) > ${zScoreThreshold}
      ORDER BY ABS(amount) DESC
      LIMIT 20
    `);

    if (extremeOutliers.rows.length > 0) {
      issues.push({
        id: "FIN-005",
        category: CATEGORIES.financial,
        severity: "critical",
        title: "Outliers Estatísticos Extremos",
        description: `Transações > 4σ da média (média: €${avgAmount.toFixed(2)}, threshold: €${zScoreThreshold.toFixed(2)})`,
        affectedCount: extremeOutliers.rows.length,
        samples: extremeOutliers.rows.slice(0, 5).map((r: any) => ({
          id: r.id,
          keyDesc: r.key_desc?.substring(0, 50),
          amount: r.amount,
          date: r.payment_date,
          source: r.source,
          zScore: parseFloat(r.z_score || "0").toFixed(2)
        })),
        recommendation: "Verifique se os valores estão corretos - possível erro de parsing",
        autoFixable: false
      });
    } else {
      checksPassed++;
    }
  } else {
    checksPassed++;
  }

  // Check 6: Supermarket/Retail Category-Value Validation
  // Michael Stonebraker: Schema enforcement on parsed amounts
  checksRun++;
  const suspiciousRetail = await db.execute(sql`
    SELECT id, key_desc, amount, payment_date, source, app_category_name
    FROM transactions
    WHERE user_id = ${userId}
    AND ABS(amount) > 500
    AND (
      LOWER(key_desc) LIKE '%rewe%'
      OR LOWER(key_desc) LIKE '%lidl%'
      OR LOWER(key_desc) LIKE '%aldi%'
      OR LOWER(key_desc) LIKE '%edeka%'
      OR LOWER(key_desc) LIKE '%netto%'
      OR LOWER(key_desc) LIKE '%dm drogerie%'
      OR LOWER(key_desc) LIKE '%rossmann%'
      OR LOWER(key_desc) LIKE '%mueller%'
    )
    ORDER BY ABS(amount) DESC
    LIMIT 20
  `);

  if (suspiciousRetail.rows.length > 0) {
    issues.push({
      id: "FIN-006",
      category: CATEGORIES.financial,
      severity: "critical",
      title: "Supermercado/Varejo com Valor Anômalo",
      description: "Transações > €500 em supermercados/drogarias (valor típico: €10-€150)",
      affectedCount: suspiciousRetail.rows.length,
      samples: suspiciousRetail.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 50),
        amount: r.amount,
        date: r.payment_date,
        source: r.source
      })),
      recommendation: "CRÍTICO: Verifique se o valor foi parseado corretamente do CSV original",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 7: Merchant-based Outlier Detection
  // Gene Kim: Observability into transaction patterns per merchant
  checksRun++;
  const merchantOutliers = await db.execute(sql`
    WITH merchant_stats AS (
      SELECT
        CASE
          WHEN LOWER(key_desc) LIKE '%rewe%' THEN 'REWE'
          WHEN LOWER(key_desc) LIKE '%lidl%' THEN 'LIDL'
          WHEN LOWER(key_desc) LIKE '%aldi%' THEN 'ALDI'
          WHEN LOWER(key_desc) LIKE '%edeka%' THEN 'EDEKA'
          WHEN LOWER(key_desc) LIKE '%amazon%' THEN 'AMAZON'
          WHEN LOWER(key_desc) LIKE '%paypal%' THEN 'PAYPAL'
          ELSE 'OTHER'
        END as merchant,
        AVG(ABS(amount)) as avg_amount,
        MAX(ABS(amount)) as max_amount,
        COUNT(*) as tx_count
      FROM transactions
      WHERE user_id = ${userId}
      GROUP BY 1
      HAVING COUNT(*) >= 3
    )
    SELECT t.id, t.key_desc, t.amount, t.payment_date, t.source,
           ms.merchant, ms.avg_amount as merchant_avg, ms.max_amount as merchant_max
    FROM transactions t
    JOIN merchant_stats ms ON (
      CASE
        WHEN LOWER(t.key_desc) LIKE '%rewe%' THEN 'REWE'
        WHEN LOWER(t.key_desc) LIKE '%lidl%' THEN 'LIDL'
        WHEN LOWER(t.key_desc) LIKE '%aldi%' THEN 'ALDI'
        WHEN LOWER(t.key_desc) LIKE '%edeka%' THEN 'EDEKA'
        WHEN LOWER(t.key_desc) LIKE '%amazon%' THEN 'AMAZON'
        WHEN LOWER(t.key_desc) LIKE '%paypal%' THEN 'PAYPAL'
        ELSE 'OTHER'
      END = ms.merchant
    )
    WHERE t.user_id = ${userId}
    AND ms.merchant != 'OTHER'
    AND ABS(t.amount) > ms.avg_amount * 10
    ORDER BY ABS(t.amount) DESC
    LIMIT 20
  `);

  if (merchantOutliers.rows.length > 0) {
    issues.push({
      id: "FIN-007",
      category: CATEGORIES.financial,
      severity: "high",
      title: "Transação 10x Acima da Média do Estabelecimento",
      description: "Transações muito acima do padrão histórico para o mesmo comerciante",
      affectedCount: merchantOutliers.rows.length,
      samples: merchantOutliers.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 50),
        amount: r.amount,
        merchant: r.merchant,
        merchantAvg: parseFloat(r.merchant_avg || "0").toFixed(2),
        ratio: (Math.abs(r.amount) / parseFloat(r.merchant_avg || "1")).toFixed(1) + "x"
      })),
      recommendation: "Compare com o CSV original - possível erro de parsing",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 8: Description pattern anomalies (fabricated patterns)
  // Dr. Edgar Codd: Data integrity validation
  checksRun++;
  const suspiciousPatterns = await db.execute(sql`
    SELECT id, key_desc, amount, payment_date, source
    FROM transactions
    WHERE user_id = ${userId}
    AND (
      -- Pattern: "SAGT DANKE" not matching typical sources
      (LOWER(key_desc) LIKE '%sagt danke%'
       AND LOWER(key_desc) NOT LIKE '%lidl sagt danke%'
       AND LOWER(key_desc) NOT LIKE '%dm %sagt danke%')
      -- Pattern: Date pattern in key_desc (column shift indicator)
      OR key_desc ~ '^\d{2}/\d{2}/\d{4}'
      OR key_desc ~ '^\d{2}\.\d{2}\.\d{4}'
      -- Pattern: Account numbers in description
      OR key_desc ~ '^-\d{5,}'
    )
    LIMIT 20
  `);

  if (suspiciousPatterns.rows.length > 0) {
    issues.push({
      id: "FIN-008",
      category: CATEGORIES.financial,
      severity: "critical",
      title: "Padrão de Descrição Suspeito",
      description: "Descrições com padrões anômalos (possível parsing incorreto)",
      affectedCount: suspiciousPatterns.rows.length,
      samples: suspiciousPatterns.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 80),
        amount: r.amount,
        date: r.payment_date,
        source: r.source
      })),
      recommendation: "CRÍTICO: Revalide o CSV fonte - provável corrupção no parsing",
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

export async function getAffectedRecords(
  issueId: string,
  limitOrParams: number | { limit?: number; scope?: DiagnosticsScope } = 50
): Promise<any[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const limit = typeof limitOrParams === "number" ? limitOrParams : (limitOrParams.limit ?? 50);
  const scope = typeof limitOrParams === "number" ? undefined : limitOrParams.scope;
  const batchIds = scope ? await resolveScopeBatchIds(userId, scope) : [];
  const primaryBatchId = batchIds[0];

  switch (issueId) {
    case "FILE-001":
    case "FILE-003":
    case "PAR-013":
    case "PAR-016": {
      if (!primaryBatchId) return [];
      const rows = await db.execute(sql`
        SELECT
          ii.id AS id,
          ii.batch_id,
          ii.row_index,
          ii.raw_columns_json,
          ii.parsed_payload
        FROM ingestion_items ii
        JOIN ingestion_batches ib ON ii.batch_id = ib.id
        WHERE ib.user_id = ${userId}
          AND ii.batch_id = ${primaryBatchId}
        LIMIT ${limit}
      `);
      return rows.rows;
    }

    case "BCH-001": {
      const rows = await db.execute(sql`
        SELECT
          t.id AS id,
          t.upload_id AS batch_id,
          t.key AS fingerprint,
          t.key_desc,
          t.amount,
          t.payment_date,
          ii.id AS ingestion_item_id,
          ii.row_index,
          ii.raw_columns_json,
          ii.parsed_payload
        FROM transactions t
        JOIN ingestion_items ii
          ON ii.batch_id = t.upload_id
         AND ii.item_fingerprint = t.key
        WHERE t.user_id = ${userId}
          AND t.upload_id IS NOT NULL
          AND t.ingestion_item_id IS NULL
        LIMIT ${limit}
      `);
      return rows.rows;
    }

    case "BCH-002": {
      if (!primaryBatchId) return [];
      const rows = await db.execute(sql`
        SELECT
          t.id AS id,
          t.upload_id AS batch_id,
          t.ingestion_item_id,
          t.key_desc,
          t.amount AS db_amount,
          t.payment_date,
          ii.raw_columns_json,
          ii.parsed_payload
        FROM transactions t
        LEFT JOIN ingestion_items ii ON ii.id = t.ingestion_item_id
        WHERE t.user_id = ${userId}
          AND t.upload_id = ${primaryBatchId}
        ORDER BY ABS(t.amount) DESC
        LIMIT ${limit}
      `);
      return rows.rows;
    }

    case "BCH-003": {
      const rows = await db.execute(sql`
        SELECT id, filename, created_at, status, file_hash_sha256
        FROM ingestion_batches
        WHERE user_id = ${userId}
          AND file_hash_sha256 IN (
            SELECT file_hash_sha256
            FROM ingestion_batches
            WHERE user_id = ${userId}
              AND file_hash_sha256 IS NOT NULL
            GROUP BY file_hash_sha256
            HAVING COUNT(*) > 1
          )
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);
      return rows.rows;
    }

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

// ============================================================================
// DATA LINEAGE & TRANSACTION INVESTIGATION (TOP 5 IMMEDIATE ACTIONS)
// ============================================================================

/**
 * ACTION 1: Query database for suspicious transaction and trace its lineage
 * Dr. Edgar Codd: Full data provenance tracking
 */
export interface TransactionLineage {
  transaction: {
    id: string;
    keyDesc: string;
    amount: number;
    date: string;
    source: string;
    key: string;
    descRaw: string;
    uploadId: string | null;
    importedAt: string;
  } | null;
  ingestionItem: {
    id: string;
    batchId: string;
    fingerprint: string;
    status: string;
    rawPayload: any;
    parsedPayload: any;
  } | null;
  ingestionBatch: {
    id: string;
    filename: string;
    sourceType: string;
    sourceFormat: string;
    status: string;
    importedAt: string;
    diagnosticsJson: any;
  } | null;
  evidenceChain: string[];
  anomalies: string[];
}

export async function investigateTransaction(transactionId: string): Promise<TransactionLineage> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const anomalies: string[] = [];
  const evidenceChain: string[] = [];

  // Step 1: Get transaction details
  const txResult = await db.execute(sql`
    SELECT id, key_desc, amount, payment_date, source, key, desc_raw, upload_id, imported_at
    FROM transactions
    WHERE id = ${transactionId} AND user_id = ${userId}
  `);

  const tx = txResult.rows[0] as any;
  if (!tx) {
    return { transaction: null, ingestionItem: null, ingestionBatch: null, evidenceChain: [], anomalies: ["Transaction not found"] };
  }

  evidenceChain.push(`Transaction found: ${tx.id}`);

  // Step 2: Find evidence link
  const evidenceLinkResult = await db.execute(sql`
    SELECT tel.ingestion_item_id, tel.match_confidence, tel.is_primary
    FROM transaction_evidence_link tel
    WHERE tel.transaction_id = ${transactionId}
  `);

  let ingestionItem = null;
  let ingestionBatch = null;

  if (evidenceLinkResult.rows.length > 0) {
    const link = evidenceLinkResult.rows[0] as any;
    evidenceChain.push(`Evidence link found: ${link.ingestion_item_id} (confidence: ${link.match_confidence}%)`);

    // Step 3: Get ingestion item
    const itemResult = await db.execute(sql`
      SELECT id, batch_id, item_fingerprint, status, raw_payload, parsed_payload, source
      FROM ingestion_items
      WHERE id = ${link.ingestion_item_id}
    `);

    if (itemResult.rows.length > 0) {
      const item = itemResult.rows[0] as any;
      ingestionItem = {
        id: item.id,
        batchId: item.batch_id,
        fingerprint: item.item_fingerprint,
        status: item.status,
        rawPayload: item.raw_payload,
        parsedPayload: item.parsed_payload
      };
      evidenceChain.push(`Ingestion item found: ${item.id}`);

      // Validate raw vs parsed
      if (item.raw_payload && item.parsed_payload) {
        const rawAmount = item.raw_payload?.amount || item.raw_payload?.Betrag;
        const parsedAmount = item.parsed_payload?.amount;
        if (rawAmount && parsedAmount && Math.abs(parseFloat(rawAmount) - parseFloat(parsedAmount)) > 0.01) {
          anomalies.push(`Amount mismatch: raw=${rawAmount}, parsed=${parsedAmount}`);
        }
      }

      // Step 4: Get ingestion batch
      const batchResult = await db.execute(sql`
        SELECT id, filename, source_type, source_format, status, imported_at, diagnostics_json
        FROM ingestion_batches
        WHERE id = ${item.batch_id}
      `);

      if (batchResult.rows.length > 0) {
        const batch = batchResult.rows[0] as any;
        ingestionBatch = {
          id: batch.id,
          filename: batch.filename,
          sourceType: batch.source_type,
          sourceFormat: batch.source_format,
          status: batch.status,
          importedAt: batch.imported_at,
          diagnosticsJson: batch.diagnostics_json
        };
        evidenceChain.push(`Batch found: ${batch.filename} (${batch.source_format})`);
      } else {
        anomalies.push(`Batch not found for item ${item.batch_id} - ORPHAN ITEM`);
      }
    } else {
      anomalies.push(`Ingestion item not found: ${link.ingestion_item_id} - BROKEN LINK`);
    }
  } else {
    anomalies.push("No evidence link found - transaction may have been created without CSV import");
  }

  // Additional anomaly checks
  if (Math.abs(tx.amount) > 1000 && tx.key_desc?.toLowerCase().includes("rewe")) {
    anomalies.push(`SUSPICIOUS: REWE transaction with €${Math.abs(tx.amount)} (typical: €10-€150)`);
  }

  return {
    transaction: {
      id: tx.id,
      keyDesc: tx.key_desc,
      amount: tx.amount,
      date: tx.payment_date,
      source: tx.source,
      key: tx.key,
      descRaw: tx.desc_raw,
      uploadId: tx.upload_id,
      importedAt: tx.imported_at
    },
    ingestionItem,
    ingestionBatch,
    evidenceChain,
    anomalies
  };
}

/**
 * ACTION 2 & 3: Find suspicious transactions and trace to source
 */
export async function findSuspiciousTransactions(options: {
  minAmount?: number;
  merchantPattern?: string;
  dateRange?: { from: string; to: string };
}): Promise<any[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const { minAmount = 500, merchantPattern, dateRange } = options;

  let query = sql`
    SELECT t.id, t.key_desc, t.amount, t.payment_date, t.source, t.key,
           t.desc_raw, t.upload_id, t.imported_at,
           tel.ingestion_item_id,
           ib.filename as batch_filename,
           ib.source_format
    FROM transactions t
    LEFT JOIN transaction_evidence_link tel ON t.id = tel.transaction_id
    LEFT JOIN ingestion_items ii ON tel.ingestion_item_id = ii.id
    LEFT JOIN ingestion_batches ib ON ii.batch_id = ib.id
    WHERE t.user_id = ${userId}
    AND ABS(t.amount) >= ${minAmount}
  `;

  if (merchantPattern) {
    query = sql`${query} AND LOWER(t.key_desc) LIKE ${`%${merchantPattern.toLowerCase()}%`}`;
  }

  query = sql`${query} ORDER BY ABS(t.amount) DESC LIMIT 50`;

  const result = await db.execute(query);
  return result.rows;
}

/**
 * ACTION 4: Data Lineage Diagnostic Check
 * Finds transactions without proper evidence chain
 */
export async function runDataLineageDiagnostics(userId: string) {
  const issues: DiagnosticIssue[] = [];
  let checksRun = 0;
  let checksPassed = 0;

  // Check 1: Transactions without evidence link
  checksRun++;
  const orphanTransactions = await db.execute(sql`
    SELECT t.id, t.key_desc, t.amount, t.payment_date, t.source, t.imported_at
    FROM transactions t
    LEFT JOIN transaction_evidence_link tel ON t.id = tel.transaction_id
    WHERE t.user_id = ${userId}
    AND tel.transaction_id IS NULL
    ORDER BY t.imported_at DESC
    LIMIT 50
  `);

  if (orphanTransactions.rows.length > 0) {
    issues.push({
      id: "LIN-001",
      category: { id: "lineage", name: "Rastreabilidade", icon: "Link", description: "Rastreabilidade de dados" },
      severity: "high",
      title: "Transações sem Vínculo de Evidência",
      description: "Transações sem link para ingestion_item (não rastreáveis ao CSV original)",
      affectedCount: orphanTransactions.rows.length,
      samples: orphanTransactions.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        keyDesc: r.key_desc?.substring(0, 50),
        amount: r.amount,
        source: r.source,
        importedAt: r.imported_at
      })),
      recommendation: "Estas transações não podem ser verificadas contra o CSV original",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 2: Broken evidence links
  checksRun++;
  const brokenLinks = await db.execute(sql`
    SELECT tel.transaction_id, tel.ingestion_item_id
    FROM transaction_evidence_link tel
    LEFT JOIN ingestion_items ii ON tel.ingestion_item_id = ii.id
    WHERE ii.id IS NULL
    LIMIT 20
  `);

  if (brokenLinks.rows.length > 0) {
    issues.push({
      id: "LIN-002",
      category: { id: "lineage", name: "Rastreabilidade", icon: "Link", description: "Rastreabilidade de dados" },
      severity: "critical",
      title: "Links de Evidência Quebrados",
      description: "Links apontando para ingestion_items inexistentes",
      affectedCount: brokenLinks.rows.length,
      samples: brokenLinks.rows.slice(0, 5),
      recommendation: "Dados corrompidos - links órfãos precisam ser removidos",
      autoFixable: true
    });
  } else {
    checksPassed++;
  }

  // Check 3: Ingestion items without transactions
  checksRun++;
  const uncommittedItems = await db.execute(sql`
    SELECT ii.id, ii.batch_id, ii.item_fingerprint, ii.status,
           ib.filename, ib.source_format
    FROM ingestion_items ii
    JOIN ingestion_batches ib ON ii.batch_id = ib.id
    LEFT JOIN transaction_evidence_link tel ON ii.id = tel.ingestion_item_id
    WHERE ib.user_id = ${userId}
    AND ib.status = 'committed'
    AND tel.ingestion_item_id IS NULL
    LIMIT 50
  `);

  if (uncommittedItems.rows.length > 0) {
    issues.push({
      id: "LIN-003",
      category: { id: "lineage", name: "Rastreabilidade", icon: "Link", description: "Rastreabilidade de dados" },
      severity: "medium",
      title: "Itens de Ingestão não Vinculados",
      description: "Itens do CSV commitados mas sem transação correspondente",
      affectedCount: uncommittedItems.rows.length,
      samples: uncommittedItems.rows.slice(0, 5).map((r: any) => ({
        itemId: r.id,
        filename: r.filename,
        format: r.source_format
      })),
      recommendation: "Possível falha no commitBatch - itens perdidos",
      autoFixable: false
    });
  } else {
    checksPassed++;
  }

  // Check 4: Batches with parsing errors
  checksRun++;
  const errorBatches = await db.execute(sql`
    SELECT id, filename, source_format, status, diagnostics_json, imported_at
    FROM ingestion_batches
    WHERE user_id = ${userId}
    AND (status = 'error' OR diagnostics_json::text LIKE '%error%')
    ORDER BY imported_at DESC
    LIMIT 20
  `);

  if (errorBatches.rows.length > 0) {
    issues.push({
      id: "LIN-004",
      category: { id: "lineage", name: "Rastreabilidade", icon: "Link", description: "Rastreabilidade de dados" },
      severity: "high",
      title: "Batches com Erros de Parsing",
      description: "Lotes de importação que falharam ou tiveram erros",
      affectedCount: errorBatches.rows.length,
      samples: errorBatches.rows.slice(0, 5).map((r: any) => ({
        id: r.id,
        filename: r.filename,
        format: r.source_format,
        status: r.status
      })),
      recommendation: "Revise os arquivos CSV e tente reimportar",
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
      name: "Rastreabilidade",
      icon: "Link",
      status,
      issueCount: issues.length,
      checksRun,
      checksPassed
    }
  };
}

// ============================================================================
// PRE-COMMIT VALIDATION (ACTION 5)
// ============================================================================

export interface PreCommitValidationResult {
  valid: boolean;
  warnings: Array<{ code: string; message: string; severity: Severity; sample?: any }>;
  errors: Array<{ code: string; message: string; sample?: any }>;
  stats: {
    totalItems: number;
    suspiciousItems: number;
    outlierItems: number;
    duplicateRisk: number;
  };
}

/**
 * Validates parsed transactions BEFORE committing to database
 * W. Edwards Deming: Quality gate before data enters the system
 */
export async function validatePreCommit(parsedTransactions: any[]): Promise<PreCommitValidationResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const warnings: PreCommitValidationResult["warnings"] = [];
  const errors: PreCommitValidationResult["errors"] = [];

  // Get user's historical stats for comparison
  const statsResult = await db.execute(sql`
    SELECT
      AVG(ABS(amount)) as avg_amount,
      STDDEV(ABS(amount)) as stddev_amount,
      MAX(ABS(amount)) as max_amount,
      COUNT(*) as total_count
    FROM transactions
    WHERE user_id = ${userId}
    AND ABS(amount) > 1
  `);

  const userStats = statsResult.rows[0] as any;
  const avgAmount = parseFloat(userStats?.avg_amount || "100");
  const stddevAmount = parseFloat(userStats?.stddev_amount || "200");
  const maxHistorical = parseFloat(userStats?.max_amount || "5000");

  let suspiciousCount = 0;
  let outlierCount = 0;
  let duplicateRiskCount = 0;

  for (const tx of parsedTransactions) {
    const amount = Math.abs(tx.amount || 0);
    const keyDesc = (tx.keyDesc || tx.description || "").toLowerCase();

    // Check 1: Statistical outlier (> 4σ)
    if (stddevAmount > 0 && amount > avgAmount + (4 * stddevAmount)) {
      outlierCount++;
      warnings.push({
        code: "PRE-001",
        message: `Outlier estatístico: €${amount.toFixed(2)} (média: €${avgAmount.toFixed(2)}, 4σ: €${(avgAmount + 4*stddevAmount).toFixed(2)})`,
        severity: "high",
        sample: { keyDesc: tx.keyDesc?.substring(0, 50), amount }
      });
    }

    // Check 2: Retail value anomaly
    const retailPatterns = ["rewe", "lidl", "aldi", "edeka", "netto", "dm ", "rossmann", "mueller"];
    const isRetail = retailPatterns.some(p => keyDesc.includes(p));
    if (isRetail && amount > 500) {
      suspiciousCount++;
      errors.push({
        code: "PRE-002",
        message: `Supermercado com valor suspeito: €${amount.toFixed(2)} (máx típico: €150)`,
        sample: { keyDesc: tx.keyDesc?.substring(0, 50), amount }
      });
    }

    // Check 3: Exceeds historical max by 2x
    if (amount > maxHistorical * 2) {
      warnings.push({
        code: "PRE-003",
        message: `Valor 2x maior que histórico máximo: €${amount.toFixed(2)} (máx histórico: €${maxHistorical.toFixed(2)})`,
        severity: "medium",
        sample: { keyDesc: tx.keyDesc?.substring(0, 50), amount }
      });
    }

    // Check 4: Suspicious description patterns
    if (keyDesc.match(/^\d{2}[./]\d{2}[./]\d{2,4}/) || keyDesc.match(/^-\d{5,}/)) {
      errors.push({
        code: "PRE-004",
        message: "Descrição começa com padrão de data ou número negativo - possível column shift",
        sample: { keyDesc: tx.keyDesc?.substring(0, 80) }
      });
    }

    // Check 5: Duplicate fingerprint risk
    if (tx.key) {
      const existingResult = await db.execute(sql`
        SELECT id FROM transactions WHERE user_id = ${userId} AND key = ${tx.key} LIMIT 1
      `);
      if (existingResult.rows.length > 0) {
        duplicateRiskCount++;
        warnings.push({
          code: "PRE-005",
          message: "Transação com fingerprint já existente - possível duplicata",
          severity: "medium",
          sample: { keyDesc: tx.keyDesc?.substring(0, 50), key: tx.key?.substring(0, 30) }
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    stats: {
      totalItems: parsedTransactions.length,
      suspiciousItems: suspiciousCount,
      outlierItems: outlierCount,
      duplicateRisk: duplicateRiskCount
    }
  };
}

// ============================================================================
// RE-IMPORT SIMULATION
// ============================================================================

export interface ReimportSimulationResult {
  safe: boolean;
  currentState: {
    totalTransactions: number;
    totalBatches: number;
    uniqueFingerprints: number;
  };
  projectedImpact: {
    transactionsToDelete: number;
    batchesToDelete: number;
    orphanRulesAffected: number;
  };
  warnings: string[];
  recommendations: string[];
}

/**
 * Simulates what would happen if user deletes all data and reimports
 * Barbara Liskov: Contract verification before destructive operations
 */
export async function simulateReimport(): Promise<ReimportSimulationResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Get current state
  const txCountResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM transactions WHERE user_id = ${userId}
  `);
  const totalTransactions = parseInt((txCountResult.rows[0] as any)?.count || "0");

  const batchCountResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM ingestion_batches WHERE user_id = ${userId}
  `);
  const totalBatches = parseInt((batchCountResult.rows[0] as any)?.count || "0");

  const fingerprintResult = await db.execute(sql`
    SELECT COUNT(DISTINCT key) as count FROM transactions WHERE user_id = ${userId}
  `);
  const uniqueFingerprints = parseInt((fingerprintResult.rows[0] as any)?.count || "0");

  // Check for manual overrides that would be lost
  const manualOverrideResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM transactions
    WHERE user_id = ${userId} AND manual_override = true
  `);
  const manualOverrides = parseInt((manualOverrideResult.rows[0] as any)?.count || "0");

  if (manualOverrides > 0) {
    warnings.push(`${manualOverrides} transações com override manual serão perdidas`);
    recommendations.push("Exporte as transações com manual_override antes de deletar");
  }

  // Check for rules that reference transactions
  const rulesWithMatchesResult = await db.execute(sql`
    SELECT COUNT(DISTINCT r.id) as count
    FROM rules r
    JOIN transactions t ON t.rule_id_applied = r.id
    WHERE r.user_id = ${userId}
  `);
  const rulesWithMatches = parseInt((rulesWithMatchesResult.rows[0] as any)?.count || "0");

  // Check for recurring groups
  const recurringGroupsResult = await db.execute(sql`
    SELECT COUNT(DISTINCT recurring_group_id) as count
    FROM transactions
    WHERE user_id = ${userId}
    AND recurring_group_id IS NOT NULL
  `);
  const recurringGroups = parseInt((recurringGroupsResult.rows[0] as any)?.count || "0");

  if (recurringGroups > 0) {
    warnings.push(`${recurringGroups} grupos recorrentes serão perdidos`);
    recommendations.push("Grupos recorrentes precisarão ser re-detectados após reimportação");
  }

  // Check for evidence links
  const evidenceLinksResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM transaction_evidence_link tel
    JOIN transactions t ON tel.transaction_id = t.id
    WHERE t.user_id = ${userId}
  `);
  const evidenceLinks = parseInt((evidenceLinksResult.rows[0] as any)?.count || "0");

  if (evidenceLinks < totalTransactions * 0.9) {
    warnings.push(`Apenas ${((evidenceLinks/totalTransactions)*100).toFixed(0)}% das transações têm rastreabilidade completa`);
  }

  // Check for potential duplicates after reimport
  const duplicateRiskResult = await db.execute(sql`
    SELECT key, COUNT(*) as count
    FROM transactions
    WHERE user_id = ${userId}
    GROUP BY key
    HAVING COUNT(*) > 1
  `);

  if (duplicateRiskResult.rows.length > 0) {
    warnings.push(`${duplicateRiskResult.rows.length} fingerprints duplicados existem - reimportação pode criar mais duplicatas`);
    recommendations.push("Resolva duplicatas antes de reimportar");
  }

  const safe = warnings.length === 0;

  if (safe) {
    recommendations.push("Sistema está pronto para reimportação segura");
    recommendations.push("Recomendado: faça backup das regras personalizadas primeiro");
  }

  return {
    safe,
    currentState: {
      totalTransactions,
      totalBatches,
      uniqueFingerprints
    },
    projectedImpact: {
      transactionsToDelete: totalTransactions,
      batchesToDelete: totalBatches,
      orphanRulesAffected: rulesWithMatches
    },
    warnings,
    recommendations
  };
}

// ============================================================================
// EXTENDED DRILL-DOWN FOR NEW CHECKS
// ============================================================================

export async function getAffectedRecordsExtended(issueId: string, limit: number = 50): Promise<any[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  switch (issueId) {
    case "FIN-005": // Statistical outliers
      const statsResult = await db.execute(sql`
        SELECT AVG(ABS(amount)) as avg, STDDEV(ABS(amount)) as std
        FROM transactions WHERE user_id = ${userId} AND ABS(amount) > 1
      `);
      const avg = parseFloat((statsResult.rows[0] as any)?.avg || "0");
      const std = parseFloat((statsResult.rows[0] as any)?.std || "0");
      const threshold = avg + (4 * std);

      const fin005 = await db.execute(sql`
        SELECT t.id, t.key_desc, t.amount, t.payment_date, t.source,
               tel.ingestion_item_id, ib.filename
        FROM transactions t
        LEFT JOIN transaction_evidence_link tel ON t.id = tel.transaction_id
        LEFT JOIN ingestion_items ii ON tel.ingestion_item_id = ii.id
        LEFT JOIN ingestion_batches ib ON ii.batch_id = ib.id
        WHERE t.user_id = ${userId}
        AND ABS(t.amount) > ${threshold}
        ORDER BY ABS(t.amount) DESC
        LIMIT ${limit}
      `);
      return fin005.rows;

    case "FIN-006": // Retail anomalies
      const fin006 = await db.execute(sql`
        SELECT t.id, t.key_desc, t.amount, t.payment_date, t.source,
               tel.ingestion_item_id, ib.filename, ii.raw_payload
        FROM transactions t
        LEFT JOIN transaction_evidence_link tel ON t.id = tel.transaction_id
        LEFT JOIN ingestion_items ii ON tel.ingestion_item_id = ii.id
        LEFT JOIN ingestion_batches ib ON ii.batch_id = ib.id
        WHERE t.user_id = ${userId}
        AND ABS(t.amount) > 500
        AND (LOWER(t.key_desc) LIKE '%rewe%' OR LOWER(t.key_desc) LIKE '%lidl%'
             OR LOWER(t.key_desc) LIKE '%aldi%' OR LOWER(t.key_desc) LIKE '%edeka%')
        ORDER BY ABS(t.amount) DESC
        LIMIT ${limit}
      `);
      return fin006.rows;

    case "FIN-007": // Merchant outliers
      const fin007 = await db.execute(sql`
        WITH merchant_stats AS (
          SELECT
            CASE
              WHEN LOWER(key_desc) LIKE '%rewe%' THEN 'REWE'
              WHEN LOWER(key_desc) LIKE '%lidl%' THEN 'LIDL'
              WHEN LOWER(key_desc) LIKE '%aldi%' THEN 'ALDI'
              ELSE 'OTHER'
            END as merchant,
            AVG(ABS(amount)) as avg_amount
          FROM transactions WHERE user_id = ${userId}
          GROUP BY 1 HAVING COUNT(*) >= 3
        )
        SELECT t.id, t.key_desc, t.amount, t.payment_date, t.source,
               ms.merchant, ms.avg_amount,
               tel.ingestion_item_id, ib.filename
        FROM transactions t
        JOIN merchant_stats ms ON (
          CASE
            WHEN LOWER(t.key_desc) LIKE '%rewe%' THEN 'REWE'
            WHEN LOWER(t.key_desc) LIKE '%lidl%' THEN 'LIDL'
            WHEN LOWER(t.key_desc) LIKE '%aldi%' THEN 'ALDI'
            ELSE 'OTHER'
          END = ms.merchant
        )
        LEFT JOIN transaction_evidence_link tel ON t.id = tel.transaction_id
        LEFT JOIN ingestion_items ii ON tel.ingestion_item_id = ii.id
        LEFT JOIN ingestion_batches ib ON ii.batch_id = ib.id
        WHERE t.user_id = ${userId}
        AND ms.merchant != 'OTHER'
        AND ABS(t.amount) > ms.avg_amount * 10
        ORDER BY ABS(t.amount) DESC
        LIMIT ${limit}
      `);
      return fin007.rows;

    case "FIN-008": // Suspicious patterns
      const fin008 = await db.execute(sql`
        SELECT t.id, t.key_desc, t.amount, t.payment_date, t.source,
               tel.ingestion_item_id, ib.filename, ii.raw_payload
        FROM transactions t
        LEFT JOIN transaction_evidence_link tel ON t.id = tel.transaction_id
        LEFT JOIN ingestion_items ii ON tel.ingestion_item_id = ii.id
        LEFT JOIN ingestion_batches ib ON ii.batch_id = ib.id
        WHERE t.user_id = ${userId}
        AND (
          (LOWER(t.key_desc) LIKE '%sagt danke%'
           AND LOWER(t.key_desc) NOT LIKE '%lidl sagt danke%')
          OR t.key_desc ~ '^\d{2}/\d{2}/\d{4}'
          OR t.key_desc ~ '^\d{2}\.\d{2}\.\d{4}'
          OR t.key_desc ~ '^-\d{5,}'
        )
        LIMIT ${limit}
      `);
      return fin008.rows;

    case "LIN-001": // Orphan transactions
      const lin001 = await db.execute(sql`
        SELECT t.id, t.key_desc, t.amount, t.payment_date, t.source, t.imported_at
        FROM transactions t
        LEFT JOIN transaction_evidence_link tel ON t.id = tel.transaction_id
        WHERE t.user_id = ${userId}
        AND tel.transaction_id IS NULL
        ORDER BY t.imported_at DESC
        LIMIT ${limit}
      `);
      return lin001.rows;

    default:
      // Fall back to original getAffectedRecords
      return getAffectedRecords(issueId, limit);
  }
}
