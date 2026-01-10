
import { ParseResult, ParsedTransaction } from "../types";
import { parse } from "csv-parse/sync";

// Helper for joining with --
const joinComponents = (components: (string | number | undefined | null)[]): string => {
    return components
        .map(c => c?.toString().trim())
        .filter(c => c && c.length > 0)
        .join(" -- ");
};

const formatDateIso = (date: Date): string => {
    try {
        return date.toISOString().split("T")[0];
    } catch (e) {
        return "";
    }
};

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
        const dateStr = record["Datum"]; 
        const amountStr = record["Betrag"]; 
        const beschreibung = record["Beschreibung"] || "";
        const konto = record["Konto"] || "";
        const karteninhaber = record["Karteninhaber"] || "";
        const betreff = record["Betreff"] || "";
        
        // Amex CSV: Expenses are Positive, we invert to Negative.
        // Credits/Refunds are Negative, we invert to Positive.
        const rawAmount = parseCommaAmount(amountStr);
        const finalAmount = -rawAmount; 
        const date = parseEURDate(dateStr);

        // 1. Build Key_desc
        // Components: Beschreibung, Konto, Karteninhaber, "Amex - " + Beschreibung
        let keyDesc = joinComponents([
            beschreibung,
            konto,
            karteninhaber,
            `Amex - ${beschreibung}`
        ]);

        // Tagging Rules
        if (beschreibung.toLowerCase().includes("erhalten besten dank")) {
            keyDesc += " -- pagamento Amex";
        } else if (rawAmount < 0) { 
            // If raw amount is negative (Credit in CSV), it's a refund
            keyDesc += " -- reembolso";
        }

        // 2. Build Key
        // Key = join( Key_desc, invert(Betrag), Betreff )
        // "invert(Betrag)" corresponds to our finalAmount
        const key = joinComponents([
            keyDesc,
            finalAmount.toFixed(2),
            betreff
        ]);

        return {
            source: "Amex",
            date: date,
            amount: finalAmount,
            currency: "EUR",
            description: beschreibung,
            rawDescription: beschreibung,
            keyDesc: keyDesc, // EXPLICITLY SET
            key: key,         // EXPLICITLY SET
            metadata: record,
            // Legacy/Derived
            paymentDate: date,
            descRaw: beschreibung,
            descNorm: keyDesc // Rule base
        };
    });

    return {
        success: true,
        transactions,
        rowsTotal: transactions.length,
        rowsImported: transactions.length,
        errors: [],
        monthAffected: "",
        format: "amex",
        meta: { 
            delimiter: ",", 
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

function parseEURDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    // DD/MM/YYYY
    const [day, month, year] = dateStr.split("/");
    if (!year) return new Date();

    const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    return d;
}

function parseCommaAmount(amountStr: string): number {
    if (!amountStr) return 0;
    // "1.234,56" -> 1234.56
    const clean = amountStr.replace(/\./g, "").replace(",", ".");
    return parseFloat(clean);
}
