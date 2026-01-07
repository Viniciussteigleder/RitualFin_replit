export type TransactionSource = "Sparkasse" | "Amex" | "M&M";

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
  format?: "miles_and_more" | "amex" | "sparkasse" | "unknown";
  diagnostics?: ParseDiagnostics;
  meta?: ParseMeta;
  sparkasseDiagnostics?: any;
}
