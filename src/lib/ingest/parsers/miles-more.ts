
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

export async function parseMilesMoreCSV(content: string): Promise<ParseResult> {
  try {
    const lines = content.split(/\r?\n/);
    const headerIndex = lines.findIndex(l => l.includes("Authorised on") || l.includes("Processed on"));
    if (headerIndex === -1) throw new Error("Unknown M&M headers");

    const csvContent = lines.slice(headerIndex).join("\n");
    const headerLine = lines[headerIndex] || "";
    const delimiter = detectDelimiter(headerLine) ?? ";";

    const records = parse(csvContent, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      delimiter,
      trim: true,
      relax_column_count: true,
      relax_quotes: true
    });

    const transactions: ParsedTransaction[] = records.map((record: any) => {
        const authorisedOn = record["Authorised on"];
        const processedOn = record["Processed on"];
        const amountStr = record["Amount"];
        const descRaw = record["Description"] || "";
        const currency = record["Currency"] || "EUR";
        const paymentType = record["Payment type"] || "";
        const status = record["Status"] || "";
        const amountForeign = record["Amount foreign"];
        const currencyForeign = record["Currency foreign"];

        const amount = parseGermanAmount(amountStr);
        const date = parseGermanDate(authorisedOn || processedOn);

        // 1. Build Key_desc
        // Components: Description, Payment type, Status, "M&M - " + Description
        let keyDesc = joinComponents([
            descRaw,
            paymentType,
            status,
            `M&M - ${descRaw}`
        ]);

        // Optional foreign purchase note
        if (amountForeign && amountForeign.trim().length > 0) {
            keyDesc += ` -- compra internacional em ${currencyForeign || 'Moeda Estrangeira'}`;
        }

        // Tagging Rules
        if (descRaw.toLowerCase().includes("lastschrift")) {
            keyDesc += " -- pagamento M&M";
        }

        if (amount > 0) {
            keyDesc += " -- reembolso";
        }

        // 2. Build Key
        // Key = join( Key_desc, Amount, Authorised on(ISO) )
        // Using amount.toFixed(2) for stability
        const key = joinComponents([
            keyDesc,
            amount.toFixed(2),
            formatDateIso(date)
        ]);

        return {
            source: "M&M",
            date: date,
            amount,
            currency,
            description: descRaw,
            rawDescription: descRaw,
            keyDesc: keyDesc, // EXPLICITLY SET
            key: key,         // EXPLICITLY SET
            metadata: record,
            // Legacy/Derived
            paymentDate: date,
            descRaw: descRaw,
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
        format: "miles_and_more",
        meta: { 
            delimiter, 
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

function detectDelimiter(headerLine: string | null): string | null {
    if (!headerLine) return null;
    const candidates = [",", ";", "\t"];
    const counts = candidates.map((d) => ({ d, c: headerLine.split(d).length - 1 }));
    counts.sort((a, b) => b.c - a.c);
    return counts[0]?.c ? counts[0].d : null;
}

function parseGermanDate(dateStr: string): Date {
    if (!dateStr) return new Date(); 
    const parts = dateStr.split(".");
    if (parts.length !== 3) return new Date(); 

    const [day, month, year] = parts;
    let fullYear = parseInt(year);
    if (isNaN(fullYear) || isNaN(parseInt(month)) || isNaN(parseInt(day))) return new Date();

    if (year.length === 2) fullYear += 2000;
    
    // UTC for consistency
    const d = new Date(Date.UTC(fullYear, parseInt(month) - 1, parseInt(day)));
    return d;
}

function parseGermanAmount(amountStr: string): number {
    if (!amountStr) return 0;
    const clean = amountStr.replace(/\./g, "").replace(",", ".");
    return parseFloat(clean);
}
