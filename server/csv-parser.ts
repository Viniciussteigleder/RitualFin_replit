// Multi-format CSV Parser (Miles & More + Amex + Sparkasse)

import { logger } from "./logger";
import { runSparkasseParsePipeline, type SparkasseDiagnostics, type SparkasseError } from "./sparkasse-pipeline";
import type { TransactionSource } from "../shared/schema";

export interface MilesAndMoreRow {
  authorisedOn: string;
  processedOn: string;
  amount: number;
  currency: string;
  description: string;
  paymentType: string;
  status: string;
  assunto?: string;
  foreignAmount?: number;
  foreignCurrency?: string;
  exchangeRate?: number;
}

export interface AmexRow {
  datum: string;
  beschreibung: string;
  karteninhaber: string;
  konto: string;
  betrag: number;
  weitereDetails: string;
  erscheintAls: string;
  adresse: string;
  stadt: string;
  plz: string;
  land: string;
  betreff: string;
}

export interface ParsedTransaction {
  source: TransactionSource;
  paymentDate: Date;
  bookingDate: Date;
  descRaw: string;
  descNorm: string;
  amount: number;
  currency: string;
  foreignAmount?: number;
  foreignCurrency?: string;
  exchangeRate?: number;
  key: string;
  accountSource: string;
  keyDesc: string;
  simpleDesc: string;
  rawDescription?: string;
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
  sparkasseError?: SparkasseError;
}

type CsvFormat = "miles_and_more" | "amex" | "sparkasse" | "unknown";

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

const MM_REQUIRED_COLUMNS = [
  "Authorised on",
  "Amount",
  "Currency",
  "Description",
  "Payment type",
  "Status"
];

const AMEX_REQUIRED_COLUMNS = [
  "Datum",
  "Beschreibung",
  "Karteninhaber",
  "Betrag"
];

const SPARKASSE_REQUIRED_COLUMNS = [
  "Auftragskonto",
  "Buchungstag",
  "Verwendungszweck",
  "Betrag"
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatAmountNormalized(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return rounded.toFixed(2).replace(/-0\\.00$/, "0.00");
}

function formatDateIso(date: Date): string {
  return date.toISOString().split("T")[0];
}

function buildKey(base: {
  keyDesc: string;
  amount: number;
  bookingDate: Date;
  reference?: string;
}): string {
  const parts = [
    base.keyDesc,
    formatAmountNormalized(base.amount),
    formatDateIso(base.bookingDate),
  ];
  if (base.reference) {
    parts.push(base.reference);
  }
  return parts.join(" -- ");
}

function parseDateMM(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;
  
  const parts = dateStr.trim().split(".");
  if (parts.length !== 3) return null;
  
  let day = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10) - 1;
  let year = parseInt(parts[2], 10);
  
  if (year < 100) {
    year += year < 50 ? 2000 : 1900;
  }
  
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
}

function parseDateAmex(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;
  
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) return null;
  
  let day = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10) - 1;
  let year = parseInt(parts[2], 10);
  
  if (year < 100) {
    year += year < 50 ? 2000 : 1900;
  }
  
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
}

function parseAmountGerman(amountStr: string): number {
  if (!amountStr || amountStr.trim() === "") return 0;
  
  const trimmed = amountStr.trim();
  if (trimmed.includes(",")) {
    const normalized = trimmed.replace(/\./g, "").replace(",", ".");
    const amount = parseFloat(normalized);
    return isNaN(amount) ? 0 : amount;
  }
  
  const amount = parseFloat(trimmed);
  return isNaN(amount) ? 0 : amount;
}

function parseAmountStandard(amountStr: string): number {
  if (!amountStr || amountStr.trim() === "") return 0;
  
  const amount = parseFloat(amountStr.trim().replace(/,/g, ""));
  return isNaN(amount) ? 0 : amount;
}

function detectCsvFormat(lines: string[]): { format: CsvFormat; separator: string } {
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];

    const commaCols = parseCSVLine(line, ",").map(c => c.trim().replace(/^"|"$/g, ""));
    if (commaCols.some(c => c.toLowerCase() === "datum") &&
        commaCols.some(c => c.toLowerCase() === "beschreibung") &&
        commaCols.some(c => c.toLowerCase() === "karteninhaber")) {
      logger.info("csv_format_detected", { format: "amex", line: i, headers: commaCols });
      return { format: "amex", separator: "," };
    }

    const semiCols = parseCSVLine(line, ";").map(c => c.trim().replace(/^"|"$/g, ""));

    if (semiCols.some(c => c.toLowerCase() === "authorised on")) {
      logger.info("csv_format_detected", { format: "miles_and_more", line: i, headers: semiCols });
      return { format: "miles_and_more", separator: ";" };
    }

    if (semiCols.some(c => c.toLowerCase() === "auftragskonto") &&
        semiCols.some(c => c.toLowerCase() === "buchungstag") &&
        semiCols.some(c => c.toLowerCase() === "verwendungszweck")) {
      logger.info("csv_format_detected", {
        format: "sparkasse",
        line: i,
        headers: semiCols,
        hasAuftragskonto: true,
        hasBuchungstag: true,
        hasVerwendungszweck: true
      });
      return { format: "sparkasse", separator: ";" };
    }

    if (commaCols.some(c => c.toLowerCase() === "auftragskonto") &&
        commaCols.some(c => c.toLowerCase() === "buchungstag") &&
        commaCols.some(c => c.toLowerCase() === "verwendungszweck")) {
      logger.info("csv_format_detected", {
        format: "sparkasse",
        line: i,
        headers: commaCols,
        note: "sparkasse_headers_with_comma"
      });
      return { format: "sparkasse", separator: ";" };
    }
  }

  logger.warn("csv_format_unknown", {
    firstLine: lines[0]?.substring(0, 200),
    lineCount: lines.length
  });
  return { format: "unknown", separator: ";" };
}

function parseCSVLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
    i++;
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  
  return result;
}

function findMMHeaderLine(lines: string[]): { headerIndex: number; headers: string[]; cardInfo: string } {
  let cardInfo = "";
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    const cols = parseCSVLine(line, ";").map(c => c.trim());
    
    if (cols.some(c => c.toLowerCase() === "authorised on")) {
      return { headerIndex: i, headers: cols, cardInfo };
    }
    
    if (i === 0 && (line.toLowerCase().includes("miles") || line.toLowerCase().includes("credit card"))) {
      cardInfo = line;
    }
  }
  
  return { headerIndex: -1, headers: [], cardInfo };
}

function findAmexHeaderLine(lines: string[]): { headerIndex: number; headers: string[] } {
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const cols = parseCSVLine(lines[i], ",");
    
    if (cols.some(c => c.toLowerCase() === "datum") && 
        cols.some(c => c.toLowerCase() === "beschreibung")) {
      return { headerIndex: i, headers: cols };
    }
  }
  
  return { headerIndex: -1, headers: [] };
}

function buildKeyDescSparkasse(fields: {
  beguenstigter: string;
  verwendungszweck: string;
  buchungstext: string;
  kontonummerIban: string;
}): string {
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
}

function buildKeyDescAmex(fields: {
  beschreibung: string;
  konto: string;
  karteninhaber: string;
  amount: number;
}): string {
  const parts = [
    fields.beschreibung,
    fields.konto,
    fields.karteninhaber,
    `Amex - ${fields.beschreibung}`
  ];
  let keyDesc = parts.join(" -- ");

  const normalized = fields.beschreibung.toLowerCase();
  if (normalized.includes("erhalten besten dank")) {
    keyDesc += " -- pagamento Amex";
  } else if (fields.amount < 0) {
    keyDesc += " -- reembolso";
  }

  return keyDesc;
}

function buildKeyDescMM(fields: {
  description: string;
  paymentType: string;
  status: string;
  amount: number;
  foreignCurrency?: string;
  foreignAmount?: number;
}): string {
  const parts = [
    fields.description,
    fields.paymentType,
    fields.status,
    `M&M - ${fields.description}`
  ];
  const foreignInfo = fields.foreignAmount && fields.foreignCurrency
    ? `compra internacional em ${fields.foreignCurrency}`
    : "";
  if (foreignInfo) {
    parts.push(foreignInfo);
  }

  let keyDesc = parts.join(" -- ");

  if (fields.description.toLowerCase().includes("lastschrift")) {
    keyDesc += " -- pagamento M&M";
  }
  if (fields.amount > 0) {
    keyDesc += " -- reembolso";
  }

  return keyDesc;
}

function buildSimpleDescSparkasse(beguenstigter: string, verwendungszweck: string): string {
  if (verwendungszweck && verwendungszweck.trim().length > 0) {
    return `${beguenstigter} -- ${verwendungszweck}`;
  }
  return beguenstigter;
}

function parseMilesAndMore(lines: string[], meta: ParseMeta, fallbackDate: Date): ParseResult {
  const { headerIndex, headers, cardInfo } = findMMHeaderLine(lines);
  
  if (headerIndex === -1) {
    return {
      success: false,
      transactions: [],
      errors: [`Colunas obrigatórias não encontradas: ${MM_REQUIRED_COLUMNS.join(", ")}`],
      rowsTotal: lines.length,
      rowsImported: 0,
      monthAffected: "",
      format: "miles_and_more",
      meta
    };
  }
  
  const missingColumns = MM_REQUIRED_COLUMNS.filter(col => 
    !headers.some(h => h.toLowerCase() === col.toLowerCase())
  );
  
  if (missingColumns.length > 0) {
    meta.missingColumns = missingColumns;
    meta.warnings.push(`Colunas obrigatórias faltando: ${missingColumns.join(", ")}`);
    return {
      success: false,
      transactions: [],
      errors: [`Colunas obrigatórias faltando: ${missingColumns.join(", ")}`],
      rowsTotal: lines.length - headerIndex - 1,
      rowsImported: 0,
      monthAffected: "",
      format: "miles_and_more",
      meta
    };
  }
  
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    colIndex[h.toLowerCase()] = i;
  });
  meta.headersFound = headers;

  
  const transactions: ParsedTransaction[] = [];
  const errors: string[] = [];
  const months = new Set<string>();
  
  const accountSource = cardInfo 
    ? cardInfo.split(";")[0].trim() || "Miles & More Gold Credit Card"
    : "Miles & More Gold Credit Card";
  
  let fallbackDateCount = 0;
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    
    const cols = parseCSVLine(line, ";");
    
    try {
      const authorisedOn = cols[colIndex["authorised on"]] || "";
      const processedOn = cols[colIndex["processed on"]] || "";
      const amountStr = cols[colIndex["amount"]] || "0";
      const currency = cols[colIndex["currency"]] || "EUR";
      const description = cols[colIndex["description"]] || "";
      const paymentType = cols[colIndex["payment type"]] || "";
      const status = cols[colIndex["status"]] || "";
      
      const foreignAmountIdx = headers.findIndex(h => h.toLowerCase() === "amount in foreign currency");
      const foreignAmountStr = foreignAmountIdx >= 0 ? cols[foreignAmountIdx] || "" : "";
      
      const currencyIndices = headers.reduce((acc: number[], h, idx) => {
        if (h.toLowerCase() === "currency") acc.push(idx);
        return acc;
      }, []);
      const foreignCurrencyIdx = currencyIndices.length > 1 ? currencyIndices[1] : -1;
      const foreignCurrency = foreignCurrencyIdx >= 0 ? cols[foreignCurrencyIdx] || "" : "";
      
      const exchangeRateIdx = headers.findIndex(h => h.toLowerCase() === "exchange rate");
      const exchangeRateStr = exchangeRateIdx >= 0 ? cols[exchangeRateIdx] || "" : "";
      
      let amount = parseAmountGerman(amountStr);
      const row: MilesAndMoreRow = {
        authorisedOn,
        processedOn,
        amount,
        currency,
        description,
        paymentType,
        status,
        foreignAmount: foreignAmountStr ? parseAmountGerman(foreignAmountStr) : undefined,
        foreignCurrency: foreignCurrency || undefined,
        exchangeRate: exchangeRateStr ? parseAmountGerman(exchangeRateStr) : undefined
      };
      
      let paymentDate = parseDateMM(row.authorisedOn) || parseDateMM(row.processedOn);
      if (!paymentDate) {
        paymentDate = fallbackDate;
        fallbackDateCount += 1;
      }
      
      if (!row.description) {
        errors.push(`Linha ${i + 1}: Descricao vazia`);
        continue;
      }
      
      const keyDesc = buildKeyDescMM({
        description: row.description,
        paymentType: row.paymentType,
        status: row.status,
        amount,
        foreignAmount: row.foreignAmount,
        foreignCurrency: row.foreignCurrency
      });
      const simpleDesc = row.description;
      const descRaw = simpleDesc;
      const descNorm = normalizeText(keyDesc);
      const key = buildKey({
        keyDesc,
        amount,
        bookingDate: paymentDate,
        reference: row.processedOn || undefined
      });
      
      const monthStr = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthStr);

      transactions.push({
        source: "M&M",
        paymentDate,
        bookingDate: paymentDate,
        descRaw,
        descNorm,
        amount,
        currency: row.currency,
        foreignAmount: row.foreignAmount,
        foreignCurrency: row.foreignCurrency,
        exchangeRate: row.exchangeRate,
        key,
        accountSource,
        keyDesc,
        simpleDesc,
        rawDescription: descRaw
      });
    } catch (err) {
      errors.push(`Linha ${i + 1}: Erro ao processar`);
    }
  }
  
  const monthsArray = Array.from(months).sort();
  const monthAffected = monthsArray.length > 0 ? monthsArray[monthsArray.length - 1] : "";
  
  if (fallbackDateCount > 0) {
    meta.warnings.push("Algumas linhas sem data válida usaram a data de importação.");
  }

  return {
    success: transactions.length > 0,
    transactions,
    errors,
    rowsTotal: lines.length - headerIndex - 1,
    rowsImported: transactions.length,
    monthAffected,
    format: "miles_and_more",
    meta
  };
}

function parseAmex(lines: string[], meta: ParseMeta, fallbackDate: Date): ParseResult {
  const { headerIndex, headers } = findAmexHeaderLine(lines);
  
  if (headerIndex === -1) {
    return {
      success: false,
      transactions: [],
      errors: [`Colunas obrigatórias Amex não encontradas: ${AMEX_REQUIRED_COLUMNS.join(", ")}`],
      rowsTotal: lines.length,
      rowsImported: 0,
      monthAffected: "",
      format: "amex",
      meta
    };
  }
  
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    colIndex[h.toLowerCase()] = i;
  });
  meta.headersFound = headers;
  
  const transactions: ParsedTransaction[] = [];
  const errors: string[] = [];
  const months = new Set<string>();
  
  let fallbackDateCount = 0;
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    
    const cols = parseCSVLine(line, ",");
    
    try {
      const datum = cols[colIndex["datum"]] || "";
      const beschreibung = cols[colIndex["beschreibung"]] || "";
      const karteninhaber = cols[colIndex["karteninhaber"]] || "";
      const konto = cols[colIndex["konto #"]] || cols[colIndex["konto"]] || "";
      const betragStr = cols[colIndex["betrag"]] || "0";
      const weitereDetails = cols[colIndex["weitere details"]] || "";
      const erscheintAls = cols[colIndex["erscheint auf ihrer abrechnung als"]] || "";
      const adresse = cols[colIndex["adresse"]] || "";
      const stadt = cols[colIndex["stadt"]] || "";
      const plz = cols[colIndex["plz"]] || "";
      const land = cols[colIndex["land"]] || "";
      const betreff = cols[colIndex["betreff"]] || "";
      
      const row: AmexRow = {
        datum,
        beschreibung,
        karteninhaber,
        konto,
        betrag: parseAmountGerman(betragStr),
        weitereDetails,
        erscheintAls,
        adresse,
        stadt,
        plz,
        land,
        betreff
      };
      
      let paymentDate = parseDateAmex(row.datum);
      if (!paymentDate) {
        paymentDate = fallbackDate;
        fallbackDateCount += 1;
      }
      
      if (!row.beschreibung) {
        errors.push(`Linha ${i + 1}: Descricao vazia`);
        continue;
      }
      
      const rawAmount = row.betrag;
      let amount = rawAmount;
      if (amount > 0) {
        amount = -amount;
      }
      
      const keyDesc = buildKeyDescAmex({
        beschreibung: row.beschreibung,
        konto: row.konto,
        karteninhaber: row.karteninhaber,
        amount: rawAmount
      });
      const simpleDesc = row.beschreibung;
      const descRaw = simpleDesc;
      const descNorm = normalizeText(keyDesc);
      const key = buildKey({
        keyDesc,
        amount,
        bookingDate: paymentDate,
        reference: row.betreff || undefined
      });
      
      const monthStr = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthStr);
      
      let foreignAmount: number | undefined;
      let foreignCurrency: string | undefined;
      let exchangeRate: number | undefined;
      
      if (row.weitereDetails && row.weitereDetails.includes("Foreign Spend Amount")) {
        const foreignMatch = row.weitereDetails.match(/Foreign Spend Amount:\s*([\d.,]+)\s*(\w+)/i);
        const rateMatch = row.weitereDetails.match(/Currency Exchange Rate:\s*([\d.,]+)/i);

        if (foreignMatch) {
          foreignAmount = parseAmountGerman(foreignMatch[1]);
          foreignCurrency = foreignMatch[2];
        }
        if (rateMatch) {
          exchangeRate = parseAmountGerman(rateMatch[1]);
        }
      }

      // Build accountSource from cardholder name + account number
      const firstName = row.karteninhaber.split(" ")[0];
      const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const accountLast4 = row.konto.replace(/[^0-9]/g, "").slice(-4);
      const accountSource = `Amex - ${capitalizedFirstName} (${accountLast4})`;

      transactions.push({
        source: "Amex",
        paymentDate,
        bookingDate: paymentDate,
        descRaw,
        descNorm,
        amount,
        currency: "EUR",
        foreignAmount,
        foreignCurrency,
        exchangeRate,
        key,
        accountSource,
        keyDesc,
        simpleDesc,
        rawDescription: descRaw
      });
    } catch (err) {
      errors.push(`Linha ${i + 1}: Erro ao processar`);
    }
  }
  
  const monthsArray = Array.from(months).sort();
  const monthAffected = monthsArray.length > 0 ? monthsArray[monthsArray.length - 1] : "";
  
  if (fallbackDateCount > 0) {
    meta.warnings.push("Algumas linhas sem data válida usaram a data de importação.");
  }

  return {
    success: transactions.length > 0,
    transactions,
    errors,
    rowsTotal: lines.length - headerIndex - 1,
    rowsImported: transactions.length,
    monthAffected,
    format: "amex",
    meta
  };
}

function parseSparkasse(lines: string[], meta: ParseMeta): ParseResult {
  const transactions: ParsedTransaction[] = [];
  const errors: string[] = [];
  const months = new Set<string>();
  const rowParseErrors: Array<{ row: number; reason: string; data: string }> = [];
  const rejectionReasons: Record<string, number> = {};

  // Diagnostic: encoding and delimiter
  const encodingDetected = "UTF-8"; // Node.js default, could be enhanced
  const delimiterDetected = ";";

  // Header is on line 1
  const headerIndex = 0;
  const headers = parseCSVLine(lines[headerIndex], ";");

  logger.info("sparkasse_parse_start", {
    totalLines: lines.length,
    headersFound: headers,
    headerCount: headers.length
  });

  // Build column index
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    colIndex[h.toLowerCase()] = i;
  });

  // Check required columns
  const missingColumns = SPARKASSE_REQUIRED_COLUMNS.filter(col =>
    !headers.some(h => h.toLowerCase() === col.toLowerCase())
  );
  const extraColumns = headers.filter(h =>
    !SPARKASSE_REQUIRED_COLUMNS.some(req => req.toLowerCase() === h.toLowerCase())
  );

  if (missingColumns.length > 0) {
    logger.error("sparkasse_missing_columns", {
      required: SPARKASSE_REQUIRED_COLUMNS,
      found: headers,
      missing: missingColumns
    });

    return {
      success: false,
      transactions: [],
      errors: [`Sparkasse CSV inválido: faltam colunas obrigatórias: ${missingColumns.join(", ")}. Colunas encontradas: ${headers.join(", ")}`],
      rowsTotal: lines.length - 1,
      rowsImported: 0,
      monthAffected: "",
      format: "sparkasse",
      diagnostics: {
        encodingDetected,
        delimiterDetected,
        headerMatch: {
          found: headers,
          missing: missingColumns,
          extra: extraColumns
        },
        rowParseErrors: { count: 0, examples: [] },
        rejectionReasons: { "MISSING_REQUIRED_COLUMNS": 1 }
      }
    };
  }

  // Parse transactions (skip header)
  for (let i = headerIndex + 1; i < lines.length; i++) {
    try {
      const cols = parseCSVLine(lines[i], ";");

      const auftragskonto = cols[colIndex["auftragskonto"]] || "";
      const buchungstag = cols[colIndex["buchungstag"]] || "";
      const verwendungszweck = cols[colIndex["verwendungszweck"]] || "";
      const buchungstext = cols[colIndex["buchungstext"]] || "";

      // Try different variations of beneficiary column name
      const beguenstigter = cols[colIndex["beguenstigter/zahlungspflichtiger"]]
        || cols[colIndex["begünstigter/zahlungspflichtiger"]]
        || cols[colIndex["beguenstigter"]]
        || cols[colIndex["begünstigter"]]
        || "";

      const kontonummerIban = cols[colIndex["kontonummer/iban"]] || "";
      const kundenreferenz = cols[colIndex["kundenreferenz (end-to-end)"]] || cols[colIndex["kundenreferenz"]] || "";
      const mandatsreferenz = cols[colIndex["mandatsreferenz"]] || "";
      const sammlerreferenz = cols[colIndex["sammlerreferenz"]] || "";
      const glaeubigerId = cols[colIndex["glaeubiger-id"]] || cols[colIndex["gläubiger-id"]] || "";
      const betragStr = cols[colIndex["betrag"]] || "";

      // Parse date (DD.MM.YY format)
      const paymentDate = parseDateMM(buchungstag);
      if (!paymentDate) {
        errors.push(`Linha ${i + 1}: Data inválida`);
        continue;
      }

      // Track month
      const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);

      // Parse amount (German format with quotes: "-609,58")
      const amount = parseAmountGerman(betragStr);

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

      // Extract account source (last 4 digits of IBAN)
      const ibanLast4 = auftragskonto.slice(-4);
      const accountSource = `Sparkasse - ${ibanLast4}`;

      transactions.push({
        source: "Sparkasse",
        paymentDate,
        bookingDate: paymentDate,
        descRaw,
        descNorm,
        amount,
        currency: "EUR",
        foreignAmount: undefined,
        foreignCurrency: undefined,
        exchangeRate: undefined,
        key,
        accountSource,
        keyDesc,
        simpleDesc,
        rawDescription: descRaw
      });
    } catch (err) {
      errors.push(`Linha ${i + 1}: Erro ao processar`);
    }
  }

  const monthsArray = Array.from(months).sort();
  const monthAffected = monthsArray.length > 0 ? monthsArray[monthsArray.length - 1] : "";

  return {
    success: transactions.length > 0,
    transactions,
    errors,
    rowsTotal: lines.length - headerIndex - 1,
    rowsImported: transactions.length,
    monthAffected,
    format: "sparkasse",
    diagnostics: {
      encodingDetected,
      delimiterDetected,
      headerMatch: {
        found: headers,
        missing: [],
        extra: extraColumns
      },
      rowParseErrors: {
        count: rowParseErrors.length,
        examples: rowParseErrors.slice(0, 5)
      },
      rejectionReasons
    }
  };
}

/**
 * Split CSV content into lines, respecting quoted fields that may contain newlines.
 * This is critical for Amex CSVs which have multi-line address fields.
 */
function splitCSVLines(csvContent: string): { lines: string[]; hasMultiline: boolean } {
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;
  let i = 0;
  let hasMultiline = false;

  while (i < csvContent.length) {
    const char = csvContent[i];
    const nextChar = i + 1 < csvContent.length ? csvContent[i + 1] : "";

    if (char === '"') {
      // Handle escaped quotes ("")
      if (inQuotes && nextChar === '"') {
        currentLine += '""';
        i += 2;
        continue;
      }
      // Toggle quote state
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      // End of line (not inside quotes)
      if (currentLine.trim() !== "") {
        lines.push(currentLine);
      }
      currentLine = "";
      // Skip \r\n together
      i += (char === '\r' && nextChar === '\n') ? 2 : 1;
      continue;
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && inQuotes) {
      hasMultiline = true;
      currentLine += char;
    } else {
      currentLine += char;
    }
    i++;
  }

  // Push last line if exists
  if (currentLine.trim() !== "") {
    lines.push(currentLine);
  }

  return { lines, hasMultiline };
}

export function parseCSV(
  csvContent: string,
  options: {
    encoding?: string;
    filename?: string;
    userId?: string;
    uploadAttemptId?: string;
    fileBuffer?: Buffer;
    sizeBytes?: number;
    importDate?: Date;
    mimeType?: string;
  } = {}
): ParseResult {
  // Remove UTF-8 BOM (Byte Order Mark) if present
  // BOM is \uFEFF character often added by German banking CSV exports
  const cleanedContent = csvContent.charCodeAt(0) === 0xFEFF
    ? csvContent.slice(1)
    : csvContent;

  const { lines: allLines, hasMultiline } = splitCSVLines(cleanedContent);
  const lines = allLines.filter(line => line.trim() !== "");

  if (lines.length === 0) {
    logger.warn("csv_parse_empty", { rowsTotal: 0 });
    return {
      success: false,
      transactions: [],
      errors: ["Arquivo CSV vazio"],
      rowsTotal: 0,
      rowsImported: 0,
      monthAffected: "",
      format: "unknown",
      meta: {
        delimiter: ";",
        encoding: options.encoding,
        dateFormat: undefined,
        amountFormat: "comma-decimal",
        warnings: ["Arquivo CSV vazio"],
        hasMultiline
      }
    };
  }

  const { format, separator } = detectCsvFormat(lines);
  const meta: ParseMeta = {
    delimiter: separator,
    encoding: options.encoding,
    dateFormat: format === "amex" ? "dd/mm/yyyy" : "dd.mm.yyyy",
    amountFormat: "comma-decimal",
    warnings: [],
    hasMultiline
  };
  if (hasMultiline) {
    meta.warnings.push("Campos com múltiplas linhas detectados");
  }

  logger.info("csv_format_detected", {
    format,
    totalLines: lines.length
  });

  const fallbackDate = options.importDate || new Date();
  let result: ParseResult;

  if (format === "amex") {
    result = parseAmex(lines, meta, fallbackDate);
  } else if (format === "miles_and_more") {
    result = parseMilesAndMore(lines, meta, fallbackDate);
  } else if (format === "sparkasse") {
    const sparkasseResult = runSparkasseParsePipeline({
      uploadAttemptId: options.uploadAttemptId || "unknown",
      userId: options.userId || "unknown",
      filename: options.filename || "upload.csv",
      buffer: options.fileBuffer,
      csvContent,
      encodingHint: options.encoding,
      sizeBytes: options.sizeBytes,
      importDate: options.importDate,
      mimeType: options.mimeType
    });
    meta.encoding = sparkasseResult.diagnostics.encodingUsed || meta.encoding;
    meta.delimiter = sparkasseResult.diagnostics.delimiterUsed || meta.delimiter;
    meta.headersFound = sparkasseResult.diagnostics.headerFound;
    if (sparkasseResult.diagnostics.requiredMissing.length > 0) {
      meta.missingColumns = sparkasseResult.diagnostics.requiredMissing;
    }
    if (sparkasseResult.diagnostics.warnings?.length) {
      meta.warnings.push(...sparkasseResult.diagnostics.warnings);
    }
    result = {
      success: sparkasseResult.success,
      transactions: sparkasseResult.transactions,
      errors: sparkasseResult.errors,
      rowsTotal: sparkasseResult.rowsTotal,
      rowsImported: sparkasseResult.rowsImported,
      monthAffected: sparkasseResult.monthAffected,
      format: "sparkasse",
      meta,
      sparkasseDiagnostics: sparkasseResult.diagnostics,
      sparkasseError: sparkasseResult.error
    };
  } else {
    logger.warn("csv_format_unknown", { totalLines: lines.length });
    result = {
      success: false,
      transactions: [],
      errors: [
        "Formato de CSV não reconhecido",
        "Formatos suportados: Miles & More, American Express (Amex), Sparkasse",
        "Verifique se o arquivo contém os cabeçalhos corretos"
      ],
      rowsTotal: lines.length,
      rowsImported: 0,
      monthAffected: "",
      format: "unknown",
      meta
    };
  }

  // Log parse result summary
  const accountSources = Array.from(new Set(result.transactions.map(t => t.accountSource)));

  logger.info("csv_parse_complete", {
    format: result.format,
    success: result.success,
    rowsTotal: result.rowsTotal,
    rowsImported: result.rowsImported,
    errorsCount: result.errors.length,
    accountSources,
    monthAffected: result.monthAffected
  });

  if (result.errors.length > 0) {
    logger.warn("csv_parse_errors", {
      format: result.format,
      errorsCount: result.errors.length,
      sampleErrors: result.errors.slice(0, 3)
    });
  }

  return result;
}

export interface PreviewResult {
  success: boolean;
  format?: CsvFormat;
  meta?: ParseMeta;
  diagnostics?: SparkasseDiagnostics;
  rows: Array<{
    source: TransactionSource;
    bookingDate: string;
    amount: number;
    currency: string;
    keyDesc: string;
    simpleDesc: string;
    accountSource: string;
    key: string;
  }>;
  errors: string[];
}

export function previewCSV(
  csvContent: string,
  options: {
    encoding?: string;
    filename?: string;
    userId?: string;
    uploadAttemptId?: string;
    fileBuffer?: Buffer;
    sizeBytes?: number;
    importDate?: Date;
    mimeType?: string;
  } = {}
): PreviewResult {
  const result = parseCSV(csvContent, options);
  const rows = result.transactions.slice(0, 20).map((tx) => ({
    source: tx.source,
    bookingDate: formatDateIso(tx.bookingDate),
    amount: tx.amount,
    currency: tx.currency,
    keyDesc: tx.keyDesc,
    simpleDesc: tx.simpleDesc,
    accountSource: tx.accountSource,
    key: tx.key
  }));

  return {
    success: result.success,
    format: result.format,
    meta: result.meta,
    diagnostics: result.sparkasseDiagnostics,
    rows,
    errors: result.errors
  };
}
