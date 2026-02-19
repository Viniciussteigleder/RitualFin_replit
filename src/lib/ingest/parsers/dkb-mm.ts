/**
 * Parser for DKB / Miles & More Credit Card CSV exports.
 *
 * File characteristics (as of 2026-02 DKB migration):
 *   - Delimiter       : ;
 *   - Encoding        : UTF-8 (optional BOM stripped upstream)
 *   - Line endings    : \n or \r\n
 *   - Filename pattern: CreditCardTransactions_<masked>_<date>_*.csv
 *   - Date format     : M/D/YYYY  (e.g. "2/17/2026")
 *   - Amount format   : English dot-decimal, comma thousands (e.g. "-1,850", "-3,065.65")
 *   - Preamble        : Variable number of metadata lines before the transaction header
 *
 * Column layout (positional, 0-indexed after splitting by ;):
 *   0 - Voucher date      → transaction_date
 *   1 - Date of receipt   → posting_date
 *   2 - Reason for payment→ description_raw
 *   3 - Foreign currency  → original_currency
 *   4 - Amount            → original_amount
 *   5 - Exchange rate     → fx_rate
 *   6 - Amount (second)   → billing_amount
 *   7 - Currency          → billing_currency
 */

import { createHash } from "crypto";
import type { ParseResult, ParsedTransaction } from "../types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DKB_MM_FORMAT = "dkb_mm" as const;
export const DKB_MM_PARSER_VERSION = "v1.0.0";

const DELIMITER = ";";
const MIN_HEADER_COLUMNS = 6;

// Required header tokens (case-insensitive, trimmed).
const REQUIRED_TOKENS = ["voucher date", "date of receipt", "reason for payment"] as const;
// At least one of: "exchange rate", or both "amount" (×2) + "currency"
const OPTIONAL_TOKEN_EXCHANGE_RATE = "exchange rate";
const OPTIONAL_TOKEN_AMOUNT = "amount";
const OPTIONAL_TOKEN_CURRENCY = "currency";

// Metadata line patterns (best-effort, non-fatal)
const BILLING_DATE_RE = /^Billing date:\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*$/i;
const CARD_PRODUCT_RE = /^(Miles & More[^;]*)/i; // first field in card info line
// Footer sentinel – the "Balance:" line signals end of real data
const FOOTER_SENTINEL_RE = /^Balance:/i;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface DkbMmParseReport {
  file_name: string;
  header_row: number; // H: 1-based row where transaction header was found
  first_data_row: number; // D: H + 1
  total_data_rows_seen: number;
  imported_count: number;
  rejected_count: number;
  duplicate_skipped_count: number; // set by caller after dedup
  errors: DkbMmRowError[];
  statement_billing_date: string | null;
  metadata: DkbMmMetadata;
}

export interface DkbMmRowError {
  source_row_number: number;
  error_code: string;
  field?: string;
  raw_value?: string;
  message: string;
}

export interface DkbMmMetadata {
  card_holder?: string;
  masked_card_number?: string;
  customer_number?: string;
  card_product?: string;
}

export interface DkbMmParsedRow {
  source: "DKB-MM";
  source_file: string;
  source_row_number: number; // 1-based file line number
  statement_billing_date: string | null;
  transaction_date: string; // ISO: YYYY-MM-DD
  posting_date: string; // ISO: YYYY-MM-DD
  description_raw: string;
  original_amount: number | null;
  original_currency: string | null;
  fx_rate: number | null;
  billing_amount: number;
  billing_currency: string;
  import_fingerprint: string;
  metadata: DkbMmMetadata;
}

/**
 * Parse a DKB/Miles-&-More CSV string.
 *
 * @param content   Full file content as a UTF-8 string (BOM already stripped).
 * @param filename  Original filename for provenance tracking.
 * @returns ParseResult compatible with the existing ingest pipeline, plus
 *          a `dkbMmReport` field with the full audit report.
 */
export function parseDkbMmCSV(
  content: string,
  filename = "unknown.csv"
): ParseResult & { dkbMmReport: DkbMmParseReport } {
  const lines = content.split(/\r?\n/);

  // -------------------------------------------------------------------------
  // 1. Find the header row (H) – robust scan
  // -------------------------------------------------------------------------
  let headerRowIndex = -1; // 0-based index into `lines`
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (isTransactionHeader(line)) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    const report = emptyReport(filename);
    return {
      success: false,
      errors: [
        "DKB M&M CSV: Could not detect transaction table header. " +
          "Expected a line with 'Voucher date', 'Date of receipt', 'Reason for payment'.",
      ],
      transactions: [],
      rowsTotal: 0,
      rowsImported: 0,
      monthAffected: "",
      format: DKB_MM_FORMAT as any,
      dkbMmReport: report,
    };
  }

  const H = headerRowIndex + 1; // 1-based
  const D = H + 1; // first data row (1-based)

  // -------------------------------------------------------------------------
  // 2. Extract metadata from preamble (lines 0 .. headerRowIndex-1)
  // -------------------------------------------------------------------------
  let statementBillingDate: string | null = null;
  const meta: DkbMmMetadata = {};

  for (let i = 0; i < headerRowIndex; i++) {
    const line = (lines[i] ?? "").trim();

    // Billing date
    const bdMatch = BILLING_DATE_RE.exec(line);
    if (bdMatch) {
      statementBillingDate = parseMDYYYY(bdMatch[1]) ?? null;
      continue;
    }

    // Card info line: "Miles & More Gold Credit Card (Kreditkarte);221 1181502;5426********8960;VINICIUS STEIGLEDER"
    if (CARD_PRODUCT_RE.test(line)) {
      const parts = line.split(";").map((p) => p.trim());
      meta.card_product = parts[0] ?? undefined;
      meta.customer_number = parts[1] ?? undefined;
      meta.masked_card_number = parts[2] ?? undefined;
      meta.card_holder = parts[3] ?? undefined;
    }
  }

  // -------------------------------------------------------------------------
  // 3. Parse data rows (D onward)
  // -------------------------------------------------------------------------
  const parsedRows: DkbMmParsedRow[] = [];
  const rowErrors: DkbMmRowError[] = [];
  const MAX_ERRORS_REPORTED = 100;
  let totalDataRows = 0;

  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const raw = lines[i] ?? "";
    const trimmed = raw.trim();

    // Skip blank lines and footer sentinels ("Balance:…")
    if (!trimmed || FOOTER_SENTINEL_RE.test(trimmed)) continue;

    const sourceRowNumber = i + 1; // 1-based file line number
    totalDataRows++;

    // Split by delimiter
    const cols = trimmed.split(DELIMITER);

    // Column count check
    if (cols.length < 8) {
      if (rowErrors.length < MAX_ERRORS_REPORTED) {
        rowErrors.push({
          source_row_number: sourceRowNumber,
          error_code: "column_count_mismatch",
          raw_value: trimmed,
          message: `Expected ≥8 columns, got ${cols.length}`,
        });
      }
      continue;
    }

    const [col0, col1, col2, col3, col4, col5, col6, col7] = cols as [
      string, string, string, string, string, string, string, string
    ];

    // --- transaction_date (col 0) ---
    const transactionDateIso = parseMDYYYY(col0);
    if (!transactionDateIso) {
      if (rowErrors.length < MAX_ERRORS_REPORTED) {
        rowErrors.push({
          source_row_number: sourceRowNumber,
          error_code: "invalid_date",
          field: "transaction_date",
          raw_value: col0,
          message: `Cannot parse transaction_date: "${col0}"`,
        });
      }
      continue;
    }

    // --- posting_date (col 1) ---
    const postingDateIso = parseMDYYYY(col1);
    if (!postingDateIso) {
      if (rowErrors.length < MAX_ERRORS_REPORTED) {
        rowErrors.push({
          source_row_number: sourceRowNumber,
          error_code: "invalid_date",
          field: "posting_date",
          raw_value: col1,
          message: `Cannot parse posting_date: "${col1}"`,
        });
      }
      continue;
    }

    // --- description_raw (col 2) ---
    const descRaw = col2.trim();
    if (!descRaw) {
      if (rowErrors.length < MAX_ERRORS_REPORTED) {
        rowErrors.push({
          source_row_number: sourceRowNumber,
          error_code: "missing_required_field",
          field: "description_raw",
          raw_value: col2,
          message: "description_raw is empty",
        });
      }
      continue;
    }

    // --- original_currency (col 3) – optional ---
    const originalCurrency = col3.trim() || null;

    // --- original_amount (col 4) – optional ---
    const originalAmountResult = parseEnglishAmount(col4);

    // --- fx_rate (col 5) – optional ---
    const fxRateResult = parseEnglishAmount(col5);

    // --- billing_amount (col 6) – required ---
    const billingAmountResult = parseEnglishAmount(col6);
    if (billingAmountResult === null) {
      if (rowErrors.length < MAX_ERRORS_REPORTED) {
        rowErrors.push({
          source_row_number: sourceRowNumber,
          error_code: "invalid_amount",
          field: "billing_amount",
          raw_value: col6,
          message: `Cannot parse billing_amount: "${col6}"`,
        });
      }
      continue;
    }

    // --- billing_currency (col 7) – required ---
    const billingCurrency = col7.trim();
    if (!billingCurrency) {
      if (rowErrors.length < MAX_ERRORS_REPORTED) {
        rowErrors.push({
          source_row_number: sourceRowNumber,
          error_code: "missing_required_field",
          field: "billing_currency",
          raw_value: col7,
          message: "billing_currency is empty",
        });
      }
      continue;
    }

    // --- Fingerprint ---
    const fingerprint = computeFingerprint({
      statementBillingDate,
      transactionDate: transactionDateIso,
      postingDate: postingDateIso,
      billingAmount: billingAmountResult,
      billingCurrency,
      descriptionRaw: descRaw,
    });

    parsedRows.push({
      source: "DKB-MM",
      source_file: filename,
      source_row_number: sourceRowNumber,
      statement_billing_date: statementBillingDate,
      transaction_date: transactionDateIso,
      posting_date: postingDateIso,
      description_raw: descRaw,
      original_amount: originalAmountResult,
      original_currency: originalCurrency,
      fx_rate: fxRateResult,
      billing_amount: billingAmountResult,
      billing_currency: billingCurrency,
      import_fingerprint: fingerprint,
      metadata: meta,
    });
  }

  // -------------------------------------------------------------------------
  // 4. Convert to ParsedTransaction (shared pipeline type)
  // -------------------------------------------------------------------------
  const transactions: ParsedTransaction[] = parsedRows.map((r) => {
    // Build the compound key used by the existing dedup/rules engine.
    // We follow the same pattern as the old M&M parser.
    const keyDesc = [
      r.description_raw,
      r.source,
      r.billing_currency,
    ]
      .filter(Boolean)
      .join(" -- ");

    const key = [keyDesc, r.billing_amount.toFixed(2), r.transaction_date].join(
      " -- "
    );

    return {
      source: "M&M" as const, // keeps compatibility with existing transactionSourceEnum
      date: new Date(r.transaction_date + "T00:00:00Z"),
      amount: r.billing_amount,
      currency: r.billing_currency,
      description: r.description_raw,
      rawDescription: r.description_raw,
      keyDesc,
      key,
      paymentDate: new Date(r.transaction_date + "T00:00:00Z"),
      bookingDate: new Date(r.posting_date + "T00:00:00Z"),
      descRaw: r.description_raw,
      descNorm: keyDesc,
      foreignAmount: r.original_amount ?? undefined,
      foreignCurrency: r.original_currency ?? undefined,
      exchangeRate: r.fx_rate ?? undefined,
      metadata: {
        // Pass through all DKB-MM-specific fields so the staging table writer
        // in ingest.ts can access them.
        dkbMm: r, // typed row for source_csv_dkb_mm
        statement_billing_date: r.statement_billing_date,
        source_row_number: r.source_row_number,
        import_fingerprint: r.import_fingerprint,
        ...r.metadata,
      },
    } as unknown as ParsedTransaction;
  });

  const report: DkbMmParseReport = {
    file_name: filename,
    header_row: H,
    first_data_row: D,
    total_data_rows_seen: totalDataRows,
    imported_count: parsedRows.length,
    rejected_count: rowErrors.length,
    duplicate_skipped_count: 0, // filled in by caller after dedup
    errors: rowErrors,
    statement_billing_date: statementBillingDate,
    metadata: meta,
  };

  // Determine the month affected (from billing date or first transaction date)
  const firstDate =
    statementBillingDate ??
    parsedRows[0]?.transaction_date ??
    null;
  const monthAffected = firstDate ? firstDate.substring(0, 7) : "";

  return {
    success: parsedRows.length > 0 || totalDataRows === 0,
    transactions,
    rowsTotal: totalDataRows,
    rowsImported: parsedRows.length,
    errors: rowErrors.map((e) => e.message),
    monthAffected,
    format: DKB_MM_FORMAT as any,
    meta: {
      delimiter: DELIMITER,
      warnings: rowErrors.length > 0 ? [`${rowErrors.length} rows rejected`] : [],
      hasMultiline: false,
      headersFound: (lines[headerRowIndex] ?? "").split(DELIMITER).map((c) => c.trim()),
    },
    diagnostics: {
      rowParseErrors: {
        count: rowErrors.length,
        examples: rowErrors.slice(0, 5).map((e) => ({
          row: e.source_row_number,
          reason: e.error_code,
          data: e.raw_value ?? "",
        })),
      },
      rejectionReasons: rowErrors.reduce<Record<string, number>>((acc, e) => {
        acc[e.error_code] = (acc[e.error_code] ?? 0) + 1;
        return acc;
      }, {}),
    },
    dkbMmReport: report,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Detect if a CSV line is the DKB M&M transaction table header.
 *
 * Rules:
 *   1. Splits into ≥ MIN_HEADER_COLUMNS columns with ";"
 *   2. Contains required tokens (case-insensitive, trimmed)
 *   3. Contains "exchange rate" OR (two "amount" cols + "currency")
 */
function isTransactionHeader(line: string): boolean {
  const cols = line.split(DELIMITER).map((c) => c.trim().toLowerCase());
  if (cols.length < MIN_HEADER_COLUMNS) return false;

  const joined = cols.join("|");

  // Required: all three must appear
  const hasRequired = REQUIRED_TOKENS.every((t) => joined.includes(t));
  if (!hasRequired) return false;

  // Optional gate: exchange rate or (amount×2 + currency)
  const hasExchangeRate = joined.includes(OPTIONAL_TOKEN_EXCHANGE_RATE);
  const amountCount = cols.filter((c) => c === OPTIONAL_TOKEN_AMOUNT).length;
  const hasCurrency = cols.some((c) => c === OPTIONAL_TOKEN_CURRENCY);
  const hasFallback = amountCount >= 2 && hasCurrency;

  return hasExchangeRate || hasFallback;
}

/**
 * Parse M/D/YYYY → "YYYY-MM-DD". Returns null on failure.
 */
export function parseMDYYYY(raw: string): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;

  const parts = trimmed.split("/");
  if (parts.length !== 3) return null;

  const [mStr, dStr, yStr] = parts as [string, string, string];
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);
  const y = parseInt(yStr, 10);

  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000 || y > 2099) return null;

  // Validate the date itself (catches 2/30/..., etc.)
  const check = new Date(Date.UTC(y, m - 1, d));
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== m - 1 ||
    check.getUTCDate() !== d
  ) {
    return null;
  }

  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Normalize and parse an English-format amount string to number.
 *
 * Algorithm (spec §A6):
 *   1. Trim.
 *   2. If empty → null (caller decides required vs optional).
 *   3. Remove commas (thousands sep) and non-breaking spaces.
 *   4. Parse with "." as decimal separator.
 *   5. Round to 2 decimals.
 *
 * Examples:
 *   "-83.92"     → -83.92
 *   "-1,850"     → -1850.00
 *   "-3,065.65"  → -3065.65
 */
export function parseEnglishAmount(raw: string): number | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;

  // Remove thousands separators (commas) and non-breaking spaces
  const cleaned = trimmed
    .replace(/,/g, "")
    .replace(/[\u00A0\u202F\u2009]/g, ""); // NBSP variants

  const val = parseFloat(cleaned);
  if (!isFinite(val)) return null;

  // Round half-up to 2 decimals
  return Math.round(val * 100) / 100;
}

/**
 * Compute a deterministic SHA-256 fingerprint for a transaction row.
 *
 * Components (spec §A9):
 *   - statement_billing_date (or "")
 *   - transaction_date
 *   - posting_date
 *   - billing_amount (fixed 2 decimals)
 *   - billing_currency
 *   - description_raw (trimmed + collapsed whitespace)
 */
export function computeFingerprint(params: {
  statementBillingDate: string | null;
  transactionDate: string;
  postingDate: string;
  billingAmount: number;
  billingCurrency: string;
  descriptionRaw: string;
}): string {
  const normalizedDesc = params.descriptionRaw.trim().replace(/\s+/g, " ");
  const parts = [
    params.statementBillingDate ?? "",
    params.transactionDate,
    params.postingDate,
    params.billingAmount.toFixed(2),
    params.billingCurrency,
    normalizedDesc,
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

// ---------------------------------------------------------------------------
// Helpers for empty / fallback objects
// ---------------------------------------------------------------------------

function emptyReport(filename: string): DkbMmParseReport {
  return {
    file_name: filename,
    header_row: 0,
    first_data_row: 0,
    total_data_rows_seen: 0,
    imported_count: 0,
    rejected_count: 0,
    duplicate_skipped_count: 0,
    errors: [],
    statement_billing_date: null,
    metadata: {},
  };
}
