import { ParseResult, ParsedTransaction } from "../types";
import { parse } from "csv-parse/sync";

export async function parseMilesMoreCSV(content: string): Promise<ParseResult> {
  try {
    // Miles & More: "Miles & More Gold Credit Card;..." on line 1
    // Headers on line 3: "Authorised on;Processed on;..."
    
    // Find header line
    const lines = content.split("\n");
    const headerIndex = lines.findIndex(l => l.startsWith("Authorised on") || l.includes("Processed on"));
    if (headerIndex === -1) throw new Error("Unknown M&M format");

    const csvContent = lines.slice(headerIndex).join("\n");

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ";",
      trim: true,
      relax_column_count: true
    });

    const transactions: ParsedTransaction[] = records.map((record: any) => {
        const dateStr = record["Processed on"] || record["Authorised on"]; // DD.MM.YYYY
        const amountStr = record["Amount"]; // "-0,02"
        const desc = record["Description"] || "";
        const currency = record["Currency"] || "EUR";

        return {
            date: parseGermanDate(dateStr),
            amount: parseGermanAmount(amountStr),
            currency: currency,
            description: desc,
            rawDescription: desc, // M&M usually simple
            source: "M&M",
            metadata: record
        };
    });

    return {
        success: true,
        transactions,
        rowsTotal: transactions.length,
        rowsImported: transactions.length,
        errors: [],
        monthAffected: "", // To be determined by caller
        meta: { 
            delimiter: ";", 
            warnings: [], 
            hasMultiline: false,
            headersFound: Object.keys(records[0] || {})
        }
    };
  } catch (error: any) {
    return { 
        success: false, 
        errors: [error.message], 
        transactions: [],
        rowsTotal: 0,
        rowsImported: 0,
        monthAffected: ""
    };
  }
}

function parseGermanDate(dateStr: string): Date {
    if (!dateStr) return new Date(); // Fallback
    const parts = dateStr.split(".");
    if (parts.length !== 3) return new Date(); 

    const [day, month, year] = parts;
    let fullYear = parseInt(year);
    if (isNaN(fullYear) || isNaN(parseInt(month)) || isNaN(parseInt(day))) return new Date();

    if (year.length === 2) fullYear += 2000; // 26 -> 2026 implies M&M uses YY? M&M usually YYYY.
    // M&M CSV format: DD.MM.YYYY usually.
    // Logic handles both.
    
    const d = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (isNaN(d.getTime())) return new Date();
    return d;
}

function parseGermanAmount(amountStr: string): number {
    if (!amountStr) return 0;
    const clean = amountStr.replace(/\./g, "").replace(",", ".");
    return parseFloat(clean);
}
