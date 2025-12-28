// Multi-format CSV Parser (Miles & More + Amex)

import { logger } from "./logger";

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
  paymentDate: Date;
  descRaw: string;
  descNorm: string;
  amount: number;
  currency: string;
  foreignAmount?: number;
  foreignCurrency?: string;
  exchangeRate?: number;
  key: string;
  accountSource: string;
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  errors: string[];
  rowsTotal: number;
  rowsImported: number;
  monthAffected: string;
  format?: "miles_and_more" | "amex" | "unknown";
}

type CsvFormat = "miles_and_more" | "amex" | "unknown";

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

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
    
    const commaCols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    if (commaCols.some(c => c.toLowerCase() === "datum") && 
        commaCols.some(c => c.toLowerCase() === "beschreibung") &&
        commaCols.some(c => c.toLowerCase() === "karteninhaber")) {
      return { format: "amex", separator: "," };
    }
    
    const semiCols = line.split(";").map(c => c.trim());
    if (semiCols.some(c => c.toLowerCase() === "authorised on")) {
      return { format: "miles_and_more", separator: ";" };
    }
  }
  
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
    const cols = line.split(";").map(c => c.trim());
    
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

function buildDescRawMM(row: MilesAndMoreRow): string {
  let desc = `${row.description} -- ${row.paymentType} -- ${row.status} -- M&M`;
  
  if (row.foreignAmount && row.foreignCurrency) {
    desc += ` [compra internacional em ${row.foreignCurrency}]`;
  }
  
  return desc;
}

function buildDescRawAmex(row: AmexRow): string {
  let desc = `${row.beschreibung} -- Amex`;
  
  if (row.karteninhaber) {
    desc += ` [${row.karteninhaber}]`;
  }
  
  if (row.stadt && row.land) {
    desc += ` @ ${row.stadt}, ${row.land}`;
  }
  
  return desc;
}

function parseMilesAndMore(lines: string[]): ParseResult {
  const { headerIndex, headers, cardInfo } = findMMHeaderLine(lines);
  
  if (headerIndex === -1) {
    return {
      success: false,
      transactions: [],
      errors: [`Colunas obrigatorias nao encontradas: ${MM_REQUIRED_COLUMNS.join(", ")}`],
      rowsTotal: lines.length,
      rowsImported: 0,
      monthAffected: "",
      format: "miles_and_more"
    };
  }
  
  const missingColumns = MM_REQUIRED_COLUMNS.filter(col => 
    !headers.some(h => h.toLowerCase() === col.toLowerCase())
  );
  
  if (missingColumns.length > 0) {
    return {
      success: false,
      transactions: [],
      errors: [`Colunas obrigatorias faltando: ${missingColumns.join(", ")}`],
      rowsTotal: lines.length - headerIndex - 1,
      rowsImported: 0,
      monthAffected: "",
      format: "miles_and_more"
    };
  }
  
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    colIndex[h.toLowerCase()] = i;
  });
  
  const transactions: ParsedTransaction[] = [];
  const errors: string[] = [];
  const months = new Set<string>();
  
  const accountSource = cardInfo 
    ? cardInfo.split(";")[0].trim() || "Miles & More Gold Credit Card"
    : "Miles & More Gold Credit Card";
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    
    const cols = line.split(";");
    
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
      
      const row: MilesAndMoreRow = {
        authorisedOn,
        processedOn,
        amount: parseAmountGerman(amountStr),
        currency,
        description,
        paymentType,
        status,
        foreignAmount: foreignAmountStr ? parseAmountGerman(foreignAmountStr) : undefined,
        foreignCurrency: foreignCurrency || undefined,
        exchangeRate: exchangeRateStr ? parseAmountGerman(exchangeRateStr) : undefined
      };
      
      const paymentDate = parseDateMM(row.authorisedOn) || parseDateMM(row.processedOn);
      
      if (!paymentDate) {
        errors.push(`Linha ${i + 1}: Data invalida`);
        continue;
      }
      
      if (!row.description) {
        errors.push(`Linha ${i + 1}: Descricao vazia`);
        continue;
      }
      
      const descRaw = buildDescRawMM(row);
      const descNorm = normalizeText(descRaw);
      const dateIso = paymentDate.toISOString().split("T")[0];
      const key = `${descNorm} -- ${row.amount} -- ${dateIso}`;
      
      const monthStr = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthStr);
      
      transactions.push({
        paymentDate,
        descRaw,
        descNorm,
        amount: row.amount,
        currency: row.currency,
        foreignAmount: row.foreignAmount,
        foreignCurrency: row.foreignCurrency,
        exchangeRate: row.exchangeRate,
        key,
        accountSource
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
    format: "miles_and_more"
  };
}

function parseAmex(lines: string[]): ParseResult {
  const { headerIndex, headers } = findAmexHeaderLine(lines);
  
  if (headerIndex === -1) {
    return {
      success: false,
      transactions: [],
      errors: [`Colunas obrigatorias Amex nao encontradas: ${AMEX_REQUIRED_COLUMNS.join(", ")}`],
      rowsTotal: lines.length,
      rowsImported: 0,
      monthAffected: "",
      format: "amex"
    };
  }
  
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    colIndex[h.toLowerCase()] = i;
  });
  
  const transactions: ParsedTransaction[] = [];
  const errors: string[] = [];
  const months = new Set<string>();
  
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
      
      const paymentDate = parseDateAmex(row.datum);
      
      if (!paymentDate) {
        errors.push(`Linha ${i + 1}: Data invalida (${row.datum})`);
        continue;
      }
      
      if (!row.beschreibung) {
        errors.push(`Linha ${i + 1}: Descricao vazia`);
        continue;
      }
      
      let amount = row.betrag;
      if (amount > 0) {
        amount = -amount;
      }
      
      const descRaw = buildDescRawAmex(row);
      const descNorm = normalizeText(descRaw);
      const dateIso = paymentDate.toISOString().split("T")[0];
      const key = `${descNorm} -- ${amount} -- ${dateIso}`;
      
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
        paymentDate,
        descRaw,
        descNorm,
        amount,
        currency: "EUR",
        foreignAmount,
        foreignCurrency,
        exchangeRate,
        key,
        accountSource
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
    format: "amex"
  };
}

export function parseCSV(csvContent: string): ParseResult {
  const allLines = csvContent.split(/\r?\n/);
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
      format: "unknown"
    };
  }

  const { format } = detectCsvFormat(lines);

  logger.info("csv_format_detected", {
    format,
    totalLines: lines.length
  });

  let result: ParseResult;

  if (format === "amex") {
    result = parseAmex(lines);
  } else if (format === "miles_and_more") {
    result = parseMilesAndMore(lines);
  } else {
    logger.warn("csv_format_unknown", { totalLines: lines.length });
    result = {
      success: false,
      transactions: [],
      errors: [
        "Formato de CSV nao reconhecido",
        "Formatos suportados: Miles & More, American Express (Amex)",
        "Verifique se o arquivo contem os cabecalhos corretos"
      ],
      rowsTotal: lines.length,
      rowsImported: 0,
      monthAffected: "",
      format: "unknown"
    };
  }

  // Log parse result summary
  const accountSources = [...new Set(result.transactions.map(t => t.accountSource))];

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
