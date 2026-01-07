import { ParseResult, ParsedTransaction } from "../types";
import { parse } from "csv-parse/sync";

// The file "activity (9) (1).csv" headers: "Datum,Beschreibung,Karteninhaber,..." looks like PayPal or Amex via PayPal.
// Content: "01/01/2026,PAYPAL *BRUEDERLICH..."
// Delimiter: Comma.
// Date: MM/DD/YYYY (01/01/2026).
// Amount: "10,61" (Quotes, comma decimal).

export async function parseAmexActivityCSV(content: string): Promise<ParseResult> {
  try {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ",",
      relax_quotes: true,
      trim: true
    });

    const transactions: ParsedTransaction[] = records.map((record: any) => {
        const dateStr = record["Datum"]; // 01/01/2026
        const amountStr = record["Betrag"]; // "10,61"
        const desc = record["Beschreibung"] || "";
        const details = record["Weitere Details"] || "";
        
        return {
            date: parseUSDate(dateStr),
            amount: parseCommaAmount(amountStr),
            currency: "EUR", // Assumed from context
            description: desc,
            rawDescription: `${desc} ${details}`.trim(),
            source: "Amex", 
            metadata: record
        };
    });

    return {
        success: true,
        transactions,
        meta: { filename: "activity.csv", rowCount: transactions.length }
    };

  } catch (error: any) {
    return { success: false, error: error.message, transactions: [] };
  }
}

function parseUSDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    const [month, day, year] = dateStr.split("/");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

function parseCommaAmount(amountStr: string): number {
    if (!amountStr) return 0;
    // "10,61" -> 10.61
    // Remove quotes handled by parser? parser returns clean string.
    // If it has thousands sep? Paypal usually just comma decimal for EUR locale?
    // "1.234,56"
    const clean = amountStr.replace(/\./g, "").replace(",", ".");
    return parseFloat(clean);
}
