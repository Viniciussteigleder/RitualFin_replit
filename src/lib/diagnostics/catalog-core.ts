export type DiagnosticStage =
  | "raw"
  | "parsed"
  | "normalized"
  | "db"
  | "rules"
  | "categorization"
  | "taxonomy";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface DiagnosticStageCore {
  id: DiagnosticStage;
  titlePt: string;
  descriptionPt: string;
  approachPt: string;
}

export interface DiagnosticCatalogItemCore {
  id: string;
  stage: DiagnosticStage;
  severityDefault: Severity;
  includeInHealthScoreByDefault: boolean;
  titlePt: string;
  whatHappenedPt: string;
  howWeKnowPt: string;
  approachPt: string;
  recommendedActionPt: string;
}

export const DIAGNOSTIC_STAGES_CORE: DiagnosticStageCore[] = [
  {
    id: "raw",
    titlePt: "Raw Upload",
    descriptionPt: "Problemas no arquivo/linhas brutas antes do parsing.",
    approachPt: "Detectar inconsistências por linha (colunas, tokens, encoding) e amostrar evidências.",
  },
  {
    id: "parsed",
    titlePt: "Parsed",
    descriptionPt: "Erros e drift do parser (delimitador, aspas, datas, números).",
    approachPt: "Comparar padrões por batch e apontar linhas que fogem do padrão.",
  },
  {
    id: "normalized",
    titlePt: "Normalized",
    descriptionPt: "Normalização determinística (key_desc/fingerprint) e estabilidade.",
    approachPt: "Garantir que normalização é reprodutível por versão e não contamina campos.",
  },
  {
    id: "db",
    titlePt: "DB",
    descriptionPt: "Reconciliação entre ingestão e inserções no banco.",
    approachPt: "Reconciliar contagens/somas e garantir linkage batch+raw_row → transaction.",
  },
  {
    id: "rules",
    titlePt: "Rules",
    descriptionPt: "Consistência do motor de regras com evidência raw.",
    approachPt: "Somente diagnosticar regras quando houver raw evidence ligada à transação.",
  },
  {
    id: "categorization",
    titlePt: "Categorization",
    descriptionPt: "Derivações (leaf/appCategory) consistentes para inputs idênticos.",
    approachPt: "Amostrar canonical_desc/fingerprint e comparar outputs (com raw evidence).",
  },
  {
    id: "taxonomy",
    titlePt: "Taxonomy",
    descriptionPt: "Integridade estrutural da taxonomia usada por transações raw-backed.",
    approachPt: "Validar cadeia parent e referências somente quando há transações afetadas.",
  },
];

export const DIAGNOSTICS_CATALOG_CORE: Record<string, DiagnosticCatalogItemCore> = {
  "FILE-001": {
    id: "FILE-001",
    stage: "raw",
    severityDefault: "high",
    includeInHealthScoreByDefault: true,
    titlePt: "Possível problema de encoding (caractere de substituição)",
    whatHappenedPt: "Algumas linhas parecem conter caracteres corrompidos (�), sugerindo encoding errado.",
    howWeKnowPt: "Detectamos o token \\uFFFD nos valores brutos/colunas amostradas.",
    approachPt: "Escanear `raw_columns_json`/`raw_payload` por \\uFFFD e localizar colunas/linhas afetadas.",
    recommendedActionPt: "Reimportar com encoding correto (ex.: UTF-16LE/latin1) ou ajustar o parser.",
  },
  "FILE-003": {
    id: "FILE-003",
    stage: "raw",
    severityDefault: "high",
    includeInHealthScoreByDefault: true,
    titlePt: "Contagem de colunas variável por linha",
    whatHappenedPt: "Algumas linhas possuem número de colunas diferente do padrão do batch.",
    howWeKnowPt: "A contagem de chaves em `raw_columns_json` varia significativamente entre amostras.",
    approachPt: "Comparar distribuição de `Object.keys(raw_columns_json).length` por batch e amostrar outliers.",
    recommendedActionPt: "Validar delimitador/aspas e reparse do batch; revisar linhas outlier no diff viewer.",
  },
  "PAR-013": {
    id: "PAR-013",
    stage: "parsed",
    severityDefault: "medium",
    includeInHealthScoreByDefault: true,
    titlePt: "Drift de locale numérico no mesmo batch",
    whatHappenedPt: "O campo de valor usa padrões mistos (ex.: 2.194,14 vs 2,194.14).",
    howWeKnowPt: "Detectamos padrões conflitantes em strings brutas de valores dentro do mesmo batch.",
    approachPt: "Classificar strings brutas de valor por regex (EU/US/ambíguo) e amostrar conflitos.",
    recommendedActionPt: "Ajustar `decimal_sep`/`thousands_sep` e reparse do batch.",
  },
  "PAR-016": {
    id: "PAR-016",
    stage: "parsed",
    severityDefault: "medium",
    includeInHealthScoreByDefault: true,
    titlePt: "Drift de formato de data no mesmo batch",
    whatHappenedPt: "Datas no arquivo usam formatos diferentes (dd.mm.yy, dd/mm/yyyy, ISO).",
    howWeKnowPt: "Detectamos múltiplos formatos em campos brutos de data no mesmo batch.",
    approachPt: "Detectar formato por regex por linha e amostrar exemplos de cada formato.",
    recommendedActionPt: "Definir `date_format` correto e reparse; se export for inconsistente, dividir o arquivo.",
  },
  "BCH-001": {
    id: "BCH-001",
    stage: "db",
    severityDefault: "high",
    includeInHealthScoreByDefault: true,
    titlePt: "Transações sem link de evidência (raw-backed)",
    whatHappenedPt: "Há transações que podem ser reconciliadas com uma linha bruta, mas não têm linkage persistido.",
    howWeKnowPt:
      "JOIN `(transactions.upload_id, transactions.key)` → `(ingestion_items.batch_id, ingestion_items.item_fingerprint)` encontra match.",
    approachPt: "Backfill determinístico por batch+fingerprint e criação de `transaction_evidence_link`.",
    recommendedActionPt: "Executar backfill de proveniência; depois reexecutar diagnósticos.",
  },
  "BCH-002": {
    id: "BCH-002",
    stage: "db",
    severityDefault: "high",
    includeInHealthScoreByDefault: true,
    titlePt: "Mismatch de soma (Parsed vs DB) por batch",
    whatHappenedPt: "A soma dos valores importados não bate entre ingestão e transações gravadas.",
    howWeKnowPt: "Comparamos `SUM(ingestion_items.parsed_payload.amount)` vs `SUM(transactions.amount)` por batch.",
    approachPt: "Reconciliar por batch e amostrar linhas com maior diferença absoluta para inspeção.",
    recommendedActionPt: "Reprocessar batch e reimportar; checar drift de locale e sinais.",
  },
  "BCH-003": {
    id: "BCH-003",
    stage: "db",
    severityDefault: "medium",
    includeInHealthScoreByDefault: true,
    titlePt: "Possível import duplicado (mesmo file hash)",
    whatHappenedPt: "O mesmo arquivo parece ter sido importado mais de uma vez.",
    howWeKnowPt: "O `file_hash_sha256` se repete em múltiplos batches.",
    approachPt: "Agrupar batches por hash e listar ocorrências e status.",
    recommendedActionPt: "Quarentenar batches duplicados ou fazer rollback do duplicado.",
  },
};

export function getCatalogItemCore(issueId: string): DiagnosticCatalogItemCore | undefined {
  return DIAGNOSTICS_CATALOG_CORE[issueId];
}

