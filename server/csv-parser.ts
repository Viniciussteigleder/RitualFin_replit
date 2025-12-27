// Miles & More CSV Parser

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
}

const REQUIRED_COLUMNS = [
  "Authorised on",
  "Amount",
  "Currency",
  "Description",
  "Payment type",
  "Status"
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(dateStr: string): Date | null {
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

function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr.trim() === "") return 0;
  
  const normalized = amountStr.trim().replace(/\./g, "").replace(",", ".");
  const amount = parseFloat(normalized);
  return isNaN(amount) ? 0 : amount;
}

function buildKeyMM(descRaw: string, amount: number, dateIso: string): string {
  return `${descRaw} -- ${amount} -- ${dateIso}`;
}

function buildDescRaw(row: MilesAndMoreRow): string {
  let desc = `${row.description} -- ${row.paymentType} -- ${row.status} -- M&M`;
  
  if (row.foreignAmount && row.foreignCurrency) {
    desc += ` [compra internacional em ${row.foreignCurrency}]`;
  }
  
  return desc;
}

function findHeaderLine(lines: string[]): { headerIndex: number; headers: string[]; cardInfo: string } {
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

export function parseCSV(csvContent: string): ParseResult {
  const allLines = csvContent.split(/\r?\n/);
  const lines = allLines.filter(line => line.trim() !== "");
  
  if (lines.length === 0) {
    return {
      success: false,
      transactions: [],
      errors: ["Arquivo CSV vazio"],
      rowsTotal: 0,
      rowsImported: 0,
      monthAffected: ""
    };
  }
  
  const { headerIndex, headers, cardInfo } = findHeaderLine(lines);
  
  if (headerIndex === -1) {
    return {
      success: false,
      transactions: [],
      errors: [
        `Colunas obrigatorias nao encontradas: ${REQUIRED_COLUMNS.join(", ")}`,
        `Formato esperado: CSV do Miles & More com cabecalho de colunas`
      ],
      rowsTotal: lines.length,
      rowsImported: 0,
      monthAffected: ""
    };
  }
  
  const missingColumns = REQUIRED_COLUMNS.filter(col => 
    !headers.some(h => h.toLowerCase() === col.toLowerCase())
  );
  
  if (missingColumns.length > 0) {
    return {
      success: false,
      transactions: [],
      errors: [
        `Colunas obrigatorias faltando: ${missingColumns.join(", ")}`,
        `Header encontrado: ${headers.join("; ")}`
      ],
      rowsTotal: lines.length - headerIndex - 1,
      rowsImported: 0,
      monthAffected: ""
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
    ? cardInfo.split(";")[0].trim() || "M&M"
    : "M&M";
  
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
        amount: parseAmount(amountStr),
        currency,
        description,
        paymentType,
        status,
        foreignAmount: foreignAmountStr ? parseAmount(foreignAmountStr) : undefined,
        foreignCurrency: foreignCurrency || undefined,
        exchangeRate: exchangeRateStr ? parseAmount(exchangeRateStr) : undefined
      };
      
      const paymentDate = parseDate(row.authorisedOn) || parseDate(row.processedOn);
      
      if (!paymentDate) {
        errors.push(`Linha ${i + 1}: Data invalida`);
        continue;
      }
      
      if (!row.description) {
        errors.push(`Linha ${i + 1}: Descricao vazia`);
        continue;
      }
      
      const descRaw = buildDescRaw(row);
      const descNorm = normalizeText(descRaw);
      const dateIso = paymentDate.toISOString().split("T")[0];
      const key = buildKeyMM(descNorm, row.amount, dateIso);
      
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
    monthAffected
  };
}
