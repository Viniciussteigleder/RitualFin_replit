
import { parse } from "csv-parse/sync";
import type { ParseResult, ParsedTransaction } from "../types";

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

export async function parseSparkasseCSV(content: string): Promise<ParseResult> {
  try {
    const lines = content.split(/\r?\n/);
    // Find the header line index (sometimes there's metadata above)
    // We look for "Auftragskonto" and "Buchungstag"
    let headerLineIndex = 0;
    for (let i = 0; i < Math.min(20, lines.length); i++) { // search top 20 lines
        if (lines[i].includes("Auftragskonto") && lines[i].includes("Buchungstag")) {
            headerLineIndex = i;
            break;
        }
    }

    // Pass the content starting from the header line to csv-parse
    // We rejoin because csv-parse takes a string input usually or we can just slice lines
    // But csv-parse 'from_line' option is easier if we pass full content
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ";", // Sparkasse is usually semicolon
      relax_quotes: true,
      trim: true,
      from_line: headerLineIndex + 1
    });

    const transactions: ParsedTransaction[] = records.map((record: any) => {
        // Map columns correctly based on documentation
        const buchungstag = record["Buchungstag"] || record["Valutadatum"];
        const beguenstigter = record["Beguenstigter/Zahlungspflichtiger"] || "";
        const verwendungszweck = record["Verwendungszweck"] || "";
        const buchungstext = record["Buchungstext"] || "";
        const iban = record["Kontonummer/IBAN"] || "";
        const glaeubigerId = record["Glaeubiger ID"] || record["GlaeubigerID"] || "";
        const betragStr = record["Betrag"];
        const waehrung = record["Waehrung"] || "EUR";

        const amount = parseGermanAmount(betragStr);
        const date = parseGermanDate(buchungstag);

        // 1. Build Key_desc
        // Components: Beguenstigter, Verwendungszweck, Buchungstext, IBAN, "Sparkasse - " + Beguenstigter
        let keyDesc = joinComponents([
            beguenstigter,
            verwendungszweck,
            buchungstext,
            iban,
            `Sparkasse - ${beguenstigter}`
        ]);

        // Tagging Rules
        const begLower = beguenstigter.toLowerCase();
        if (begLower.includes("american express")) {
            keyDesc += " -- pagamento Amex";
        } else if (begLower.includes("deutsche kreditbank")) {
            keyDesc += " -- pagamento M&M";
        }

        // 2. Build Key
        // Key = join( Key_desc, Betrag, Buchungstag(ISO), GlaeubigerID )
        // Using amount.toFixed(2) for stability
        const key = joinComponents([
            keyDesc,
            amount.toFixed(2),
            formatDateIso(date),
            glaeubigerId
        ]);

        return {
            source: "Sparkasse",
            date: date,
            amount: amount,
            currency: waehrung,
            description: beguenstigter, // Simple display description
            rawDescription: record["Verwendungszweck"] || beguenstigter, // Legacy raw
            keyDesc: keyDesc, // THE IMPORTANT FIELD
            key: key,         // Unique ID
            metadata: record,
            // Additional legacy fields mapping
            paymentDate: date,
            descRaw: verwendungszweck || beguenstigter,
            descNorm: keyDesc // Using keyDesc as the normalized base for rules
        };
    });

    return {
        success: true,
        transactions,
        rowsTotal: transactions.length,
        rowsImported: transactions.length,
        errors: [],
        monthAffected: "",
        format: "sparkasse",
        meta: {
            delimiter: ";",
            warnings: [],
            hasMultiline: false,
            headersFound: Object.keys(records[0] || {})
        }
    }

  } catch (error: any) {
    return {
        success: false,
        errors: [error.message],
        transactions: [],
        rowsTotal: 0,
        rowsImported: 0,
        monthAffected: ""
    }
  }
}

function parseGermanDate(dateStr: string): Date {
    // DD.MM.YY or DD.MM.YYYY
    if (!dateStr) return new Date(); 
    const parts = dateStr.split(".");
    if (parts.length !== 3) return new Date(); 

    const [day, month, year] = parts;
    let fullYear = parseInt(year);
    if (isNaN(fullYear) || isNaN(parseInt(month)) || isNaN(parseInt(day))) return new Date();

    if (year.length === 2) fullYear += 2000;
    const d = new Date(Date.UTC(fullYear, parseInt(month) - 1, parseInt(day))); // Use UTC to avoid timezone shifts
    return d;
}

function parseGermanAmount(amountStr: string): number {
    if (!amountStr) return 0;
    // "-260,00" -> -260.00 / "1.000,00" -> 1000.00
    const clean = amountStr.replace(/\./g, "").replace(",", ".");
    return parseFloat(clean);
}
