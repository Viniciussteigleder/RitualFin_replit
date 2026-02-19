export type TransactionSource = "Sparkasse" | "Amex" | "M&M" | "DKB-MM";

export interface ParsedTransaction {
  source: TransactionSource;
  date: Date;
  amount: number;
  currency: string;
  description: string;
  rawDescription?: string;
  metadata?: any;
  
  // Legacy / derived later
  paymentDate?: Date;
  bookingDate?: Date;
  descRaw?: string;
  descNorm?: string;
  key?: string;
  accountSource?: string;
  keyDesc?: string;
  simpleDesc?: string;

  // Source Specific Fields (for staging tables)
  // Sparkasse
  auftragskonto?: string;
  buchungstag?: string;
  valutadatum?: string;
  buchungstext?: string;
  verwendungszweck?: string;
  glaeubigerId?: string;
  mandatsreferenz?: string;
  kundenreferenz?: string;
  sammlerreferenz?: string;
  lastschrifteinreicherId?: string;
  idEndToEnd?: string;
  beguenstigterZahlungspflichtiger?: string;
  iban?: string;
  bic?: string;
  betrag?: string;
  waehrung?: string;
  info?: string;
  
  // Common FX / dual-amount fields (M&M, DKB-MM)
  foreignAmount?: number;
  foreignCurrency?: string;
  exchangeRate?: number;

  // Miles & More (old format)
  authorisedOn?: string;
  processedOn?: string;
  paymentType?: string;
  status?: string;
  // amount, currency, description exist in base

  // DKB M&M (new format – CreditCardTransactions_*.csv)
  dkbMmStatementBillingDate?: string | null;
  dkbMmPostingDate?: string | null;        // posting_date ISO
  dkbMmOriginalAmount?: number | null;     // foreign amount
  dkbMmOriginalCurrency?: string | null;   // foreign currency
  dkbMmFxRate?: number | null;             // exchange rate
  dkbMmImportFingerprint?: string;         // SHA-256 dedup key
  dkbMmSourceRowNumber?: number;           // 1-based file row

  // Amex
  datum?: string;
  beschreibung?: string;
  // betrag exists
  karteninhaber?: string;
  kartennummer?: string;
  referenz?: string;
  ort?: string;
  staat?: string;
}

export interface ParseDiagnostics {
  encodingDetected?: string;
  delimiterDetected?: string;
  headerMatch?: {
    found: string[];
    missing: string[];
    extra: string[];
  };
  rowParseErrors?: {
    count: number;
    examples: Array<{ row: number; reason: string; data: string }>;
  };
  rejectionReasons?: Record<string, number>;
}

export interface ParseMeta {
  delimiter: string;
  encoding?: string;
  dateFormat?: string;
  amountFormat?: string;
  warnings: string[];
  hasMultiline: boolean;
  missingColumns?: string[];
  headersFound?: string[];
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  errors: string[];
  rowsTotal: number;
  rowsImported: number;
  monthAffected: string;
  format?: "miles_and_more" | "amex" | "sparkasse" | "dkb_mm" | "unknown";
  diagnostics?: ParseDiagnostics;
  meta?: ParseMeta;
  sparkasseDiagnostics?: any;
}
