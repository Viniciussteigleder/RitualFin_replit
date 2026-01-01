import { parse } from "csv-parse/sync";
import type { ParsedTransaction } from "./csv-parser";

export type SparkasseStage =
  | "file_intake"
  | "encoding_handling"
  | "csv_parse"
  | "header_validation"
  | "row_normalization"
  | "db_insert";

export type SparkasseErrorCode =
  | "FILE_EMPTY"
  | "FILE_TOO_LARGE"
  | "ENCODING_DETECT_FAILED"
  | "CSV_PARSE_FAILED"
  | "DELIMITER_MISMATCH"
  | "HEADER_MISSING_REQUIRED"
  | "ROW_PARSE_FAILED"
  | "DATE_PARSE_FAILED"
  | "AMOUNT_PARSE_FAILED"
  | "DB_INSERT_FAILED"
  | "UNKNOWN";

export interface SparkasseError {
  code: SparkasseErrorCode;
  message: string;
  details?: Record<string, unknown>;
  hint?: string;
}

export interface SparkasseRowError {
  rowNumber: number;
  field: string;
  value: string;
  code: SparkasseErrorCode;
  message: string;
}

export interface SparkasseDiagnostics {
  uploadAttemptId: string;
  userId: string;
  createdAt: Date;
  source: "Sparkasse";
  filename: string;
  mimeType?: string;
  sizeBytes: number;
  encodingUsed?: string;
  delimiterUsed?: string;
  headerFound: string[];
  requiredMissing: string[];
  rowsTotal: number;
  rowsPreview: Array<Record<string, string>>;
  stage: SparkasseStage;
  errorCode?: SparkasseErrorCode;
  errorMessage?: string;
  errorDetails?: Record<string, unknown>;
  rowErrors: SparkasseRowError[];
  stacktrace?: string;
  warnings?: string[];
  dateFallbackCount?: number;
}

export interface SparkassePipelineResult {
  success: boolean;
  transactions: ParsedTransaction[];
  errors: string[];
  rowsTotal: number;
  rowsImported: number;
  monthAffected: string;
  diagnostics: SparkasseDiagnostics;
  error?: SparkasseError;
}

export interface SparkassePipelineInput {
  uploadAttemptId: string;
  userId: string;
  filename: string;
  buffer?: Buffer;
  csvContent?: string;
  encodingHint?: string;
  sizeBytes?: number;
  importDate?: Date;
  mimeType?: string;
}

const SPARKASSE_DELIMITER = ";";
const FAILURE_RATE_THRESHOLD = 0.05;
const REPLACEMENT_RATIO_THRESHOLD = 0.005;
const DELIMITER_MISMATCH_THRESHOLD = 0.8;

const REQUIRED_HEADERS = [
  "Auftragskonto",
  "Buchungstag",
  "Valutadatum",
  "Buchungstext",
  "Verwendungszweck",
  "Beguenstigter/Zahlungspflichtiger",
  "Kontonummer/IBAN",
  "Betrag",
  "Waehrung",
  "Info"
];

const countReplacementChars = (text: string) => {
  let count = 0;
  for (const ch of text) {
    if (ch === "\uFFFD") count += 1;
  }
  return count;
};

const normalizeHeader = (value: string) =>
  value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();

const normalizeHeaderKey = (value: string) =>
  normalizeHeader(value)
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");

const formatAmountNormalized = (amount: number): string => {
  const rounded = Math.round(amount * 100) / 100;
  return rounded.toFixed(2).replace(/-0\\.00$/, "0.00");
};

const formatDateIso = (date: Date): string => date.toISOString().split("T")[0];

const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const buildKey = (base: {
  keyDesc: string;
  amount: number;
  bookingDate: Date;
  reference?: string;
}): string => {
  const parts = [
    base.keyDesc,
    formatAmountNormalized(base.amount),
    formatDateIso(base.bookingDate),
  ];
  if (base.reference) {
    parts.push(base.reference);
  }
  return parts.join(" -- ");
};

const buildKeyDescSparkasse = (fields: {
  beguenstigter: string;
  verwendungszweck: string;
  buchungstext: string;
  kontonummerIban: string;
}): string => {
  const parts = [
    fields.beguenstigter,
    fields.verwendungszweck,
    fields.buchungstext,
    fields.kontonummerIban,
    `Sparkasse - ${fields.beguenstigter}`
  ];
  let keyDesc = parts.join(" -- ");

  if (fields.beguenstigter.toLowerCase().includes("american express")) {
    keyDesc += " -- pagamento Amex";
  }
  if (fields.beguenstigter.toLowerCase().includes("deutsche kreditbank")) {
    keyDesc += " -- pagamento M&M";
  }

  return keyDesc;
};

const buildSimpleDescSparkasse = (beguenstigter: string, verwendungszweck: string): string => {
  if (verwendungszweck && verwendungszweck.trim().length > 0) {
    return `${beguenstigter} -- ${verwendungszweck}`;
  }
  return beguenstigter;
};

const parseDateSparkasse = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.trim() === "") return null;
  const parts = dateStr.trim().split(".");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  let year = parseInt(parts[2], 10);
  if (year < 100) {
    year += year < 50 ? 2000 : 1900;
  }
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
};

const parseAmountSparkasse = (amountStr: string): number | null => {
  if (!amountStr || amountStr.trim() === "") return null;
  const normalized = amountStr.trim().replace(/\./g, "").replace(",", ".");
  const amount = parseFloat(normalized);
  return Number.isFinite(amount) ? amount : null;
};

const decodeWithFallback = (input: SparkassePipelineInput) => {
  if (input.buffer) {
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(input.buffer);
      const replacementRatio = countReplacementChars(text) / Math.max(text.length, 1);
      if (replacementRatio > REPLACEMENT_RATIO_THRESHOLD) {
        const latinText = new TextDecoder("latin1").decode(input.buffer);
        return { text: latinText, encodingUsed: "latin1" };
      }
      return { text, encodingUsed: "utf-8" };
    } catch {
      const latinText = new TextDecoder("latin1").decode(input.buffer);
      return { text: latinText, encodingUsed: "latin1" };
    }
  }

  const fallbackText = input.csvContent || "";
  const replacementRatio = countReplacementChars(fallbackText) / Math.max(fallbackText.length, 1);
  if (replacementRatio > REPLACEMENT_RATIO_THRESHOLD) {
    return { text: fallbackText, encodingUsed: input.encodingHint || "unknown", failed: true };
  }
  return { text: fallbackText, encodingUsed: input.encodingHint || "utf-8" };
};

const parseSparkasseRecords = (csvContent: string) =>
  parse(csvContent, {
    delimiter: SPARKASSE_DELIMITER,
    relax_quotes: true,
    trim: true,
    skip_empty_lines: true
  }) as string[][];

const mapHeaders = (headerRow: string[]) => {
  const header = headerRow.map((value) => value.replace(/^\uFEFF/, "").trim());
  const headerMap: Record<string, number> = {};
  header.forEach((value, index) => {
    headerMap[normalizeHeaderKey(value)] = index;
  });
  const missingRequired = REQUIRED_HEADERS.filter((required) => {
    const normalizedRequired = normalizeHeaderKey(required);
    return headerMap[normalizedRequired] === undefined;
  });
  return { header, headerMap, missingRequired };
};

const getHeaderIndex = (headerMap: Record<string, number>, headerName: string) =>
  headerMap[normalizeHeaderKey(headerName)];

export function runSparkasseParsePipeline(input: SparkassePipelineInput): SparkassePipelineResult {
  const now = new Date();
  const sizeBytes = input.sizeBytes ?? input.buffer?.length ?? input.csvContent?.length ?? 0;
  const fallbackDate = input.importDate || now;

  const diagnostics: SparkasseDiagnostics = {
    uploadAttemptId: input.uploadAttemptId,
    userId: input.userId,
    createdAt: now,
    source: "Sparkasse",
    filename: input.filename,
    mimeType: input.mimeType,
    sizeBytes,
    headerFound: [],
    requiredMissing: [],
    rowsTotal: 0,
    rowsPreview: [],
    stage: "file_intake",
    rowErrors: [],
    warnings: []
  };

  if (sizeBytes <= 0) {
    const error: SparkasseError = {
      code: "FILE_EMPTY",
      message: "Arquivo CSV vazio",
      hint: "Exporte novamente o CSV do Sparkasse e tente de novo."
    };
    diagnostics.stage = "file_intake";
    diagnostics.errorCode = error.code;
    diagnostics.errorMessage = error.message;
    return {
      success: false,
      transactions: [],
      errors: [error.message],
      rowsTotal: 0,
      rowsImported: 0,
      monthAffected: "",
      diagnostics,
      error
    };
  }

  diagnostics.stage = "encoding_handling";
  const decoded = decodeWithFallback(input);
  diagnostics.encodingUsed = decoded.encodingUsed;
  if (decoded.failed) {
    const error: SparkasseError = {
      code: "ENCODING_DETECT_FAILED",
      message: "Não foi possível detectar a codificação do CSV",
      hint: "Tente exportar o arquivo novamente ou envie em UTF-8.",
      details: { encodingHint: input.encodingHint }
    };
    diagnostics.errorCode = error.code;
    diagnostics.errorMessage = error.message;
    diagnostics.errorDetails = error.details;
    return {
      success: false,
      transactions: [],
      errors: [error.message],
      rowsTotal: 0,
      rowsImported: 0,
      monthAffected: "",
      diagnostics,
      error
    };
  }

  diagnostics.stage = "csv_parse";
  let records: string[][] = [];
  try {
    records = parseSparkasseRecords(decoded.text);
  } catch (err: any) {
    const error: SparkasseError = {
      code: "CSV_PARSE_FAILED",
      message: "Falha ao ler o CSV do Sparkasse",
      hint: "Confirme se o arquivo esta separado por ponto e virgula (;).",
      details: { error: err?.message }
    };
    diagnostics.errorCode = error.code;
    diagnostics.errorMessage = error.message;
    diagnostics.errorDetails = error.details;
    diagnostics.stacktrace = err?.stack;
    return {
      success: false,
      transactions: [],
      errors: [error.message],
      rowsTotal: 0,
      rowsImported: 0,
      monthAffected: "",
      diagnostics,
      error
    };
  }

  const columnCounts = records.map((row) => row.length);
  const singleColumnRows = columnCounts.filter((count) => count <= 1).length;
  diagnostics.delimiterUsed = SPARKASSE_DELIMITER;
  if (records.length > 0 && singleColumnRows / records.length >= DELIMITER_MISMATCH_THRESHOLD) {
    const error: SparkasseError = {
      code: "DELIMITER_MISMATCH",
      message: "Delimitador inválido para CSV do Sparkasse",
      hint: "O arquivo deve usar ponto e virgula (;).",
      details: { columnCountsSample: columnCounts.slice(0, 10) }
    };
    diagnostics.errorCode = error.code;
    diagnostics.errorMessage = error.message;
    diagnostics.errorDetails = error.details;
    return {
      success: false,
      transactions: [],
      errors: [error.message],
      rowsTotal: Math.max(records.length - 1, 0),
      rowsImported: 0,
      monthAffected: "",
      diagnostics,
      error
    };
  }

  diagnostics.stage = "header_validation";
  const headerRow = records[0] || [];
  const { header, headerMap, missingRequired } = mapHeaders(headerRow);
  diagnostics.headerFound = header;
  diagnostics.requiredMissing = missingRequired;

  if (missingRequired.length > 0) {
    const error: SparkasseError = {
      code: "HEADER_MISSING_REQUIRED",
      message: "Faltam colunas obrigatórias do Sparkasse",
      hint: "Confirme se o CSV foi exportado no formato completo do Sparkasse.",
      details: { missingRequired }
    };
    diagnostics.errorCode = error.code;
    diagnostics.errorMessage = error.message;
    diagnostics.errorDetails = error.details;
    return {
      success: false,
      transactions: [],
      errors: [error.message],
      rowsTotal: Math.max(records.length - 1, 0),
      rowsImported: 0,
      monthAffected: "",
      diagnostics,
      error
    };
  }

  diagnostics.stage = "row_normalization";
  const transactions: ParsedTransaction[] = [];
  const errors: string[] = [];
  const months = new Set<string>();
  const rowErrors: SparkasseRowError[] = [];
  let fallbackDateCount = 0;

  const rows = records.slice(1);
  diagnostics.rowsTotal = rows.length;

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const getValue = (name: string) => {
      const idx = getHeaderIndex(headerMap, name);
      return idx === undefined ? "" : (row[idx] ?? "");
    };

    const auftragskonto = getValue("Auftragskonto");
    const buchungstag = getValue("Buchungstag");
    const verwendungszweck = getValue("Verwendungszweck");
    const buchungstext = getValue("Buchungstext");
    const beguenstigter = getValue("Beguenstigter/Zahlungspflichtiger");
    const kontonummerIban = getValue("Kontonummer/IBAN");
    const betragStr = getValue("Betrag");
    const waehrung = getValue("Waehrung") || "EUR";
    const kundenreferenz = getValue("Kundenreferenz (End-to-End)");
    const mandatsreferenz = getValue("Mandatsreferenz");
    const sammlerreferenz = getValue("Sammlerreferenz");
    const glaeubigerId = getValue("Glaeubiger ID");

    let paymentDate = parseDateSparkasse(buchungstag);
    if (!paymentDate) {
      paymentDate = fallbackDate;
      fallbackDateCount += 1;
    }

    const amount = parseAmountSparkasse(betragStr);
    if (amount === null) {
      rowErrors.push({
        rowNumber,
        field: "Betrag",
        value: betragStr,
        code: "AMOUNT_PARSE_FAILED",
        message: "Valor inválido"
      });
      return;
    }

    const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, "0")}`;
    months.add(monthKey);

    const keyDesc = buildKeyDescSparkasse({
      beguenstigter,
      verwendungszweck,
      buchungstext,
      kontonummerIban: kontonummerIban || auftragskonto
    });
    const simpleDesc = buildSimpleDescSparkasse(beguenstigter, verwendungszweck);
    const descRaw = simpleDesc;
    const descNorm = normalizeText(keyDesc);
    const reference = kundenreferenz || mandatsreferenz || sammlerreferenz || glaeubigerId || undefined;
    const key = buildKey({
      keyDesc,
      amount,
      bookingDate: paymentDate,
      reference
    });

    const ibanSource = auftragskonto || kontonummerIban;
    const ibanLast4 = ibanSource ? ibanSource.replace(/\s+/g, "").slice(-4) : "";
    const accountSource = ibanLast4 ? `Sparkasse - ${ibanLast4}` : "Sparkasse";

    transactions.push({
      source: "Sparkasse",
      paymentDate,
      bookingDate: paymentDate,
      descRaw,
      descNorm,
      amount,
      currency: waehrung,
      foreignAmount: undefined,
      foreignCurrency: undefined,
      exchangeRate: undefined,
      key,
      accountSource,
      keyDesc,
      simpleDesc,
      rawDescription: descRaw
    });
  });

  diagnostics.rowErrors = rowErrors;
  diagnostics.dateFallbackCount = fallbackDateCount;
  if (fallbackDateCount > 0) {
    diagnostics.warnings?.push("Algumas linhas sem data válida usaram a data de importação.");
  }
  diagnostics.rowsPreview = transactions.slice(0, 20).map((tx) => ({
    bookingDate: formatDateIso(tx.bookingDate),
    amount: tx.amount.toString(),
    currency: tx.currency,
    keyDesc: tx.keyDesc,
    simpleDesc: tx.simpleDesc,
    accountSource: tx.accountSource
  }));

  if (rowErrors.length > 0) {
    const failureRate = rows.length > 0 ? rowErrors.length / rows.length : 0;
    const summary = `Linhas com erro: ${rowErrors.length}`;
    errors.push(summary);
    if (failureRate > FAILURE_RATE_THRESHOLD) {
      const uniqueCodes = new Set(rowErrors.map((row) => row.code));
      const dominantCode =
        uniqueCodes.size === 1
          ? Array.from(uniqueCodes)[0]
          : uniqueCodes.has("DATE_PARSE_FAILED")
          ? "DATE_PARSE_FAILED"
          : uniqueCodes.has("AMOUNT_PARSE_FAILED")
          ? "AMOUNT_PARSE_FAILED"
          : "ROW_PARSE_FAILED";
      const error: SparkasseError = {
        code: dominantCode,
        message: "Muitas linhas invalidas no CSV do Sparkasse",
        hint: "Revise o arquivo exportado e tente novamente.",
        details: { failureRate, rowErrors: rowErrors.slice(0, 10) }
      };
      diagnostics.errorCode = error.code;
      diagnostics.errorMessage = error.message;
      diagnostics.errorDetails = error.details;
      return {
        success: false,
        transactions: [],
        errors: [error.message],
        rowsTotal: rows.length,
        rowsImported: 0,
        monthAffected: "",
        diagnostics,
        error
      };
    }
  }

  const monthsArray = Array.from(months).sort();
  const monthAffected = monthsArray.length > 0 ? monthsArray[monthsArray.length - 1] : "";

  return {
    success: transactions.length > 0,
    transactions,
    errors,
    rowsTotal: rows.length,
    rowsImported: transactions.length,
    monthAffected,
    diagnostics
  };
}
