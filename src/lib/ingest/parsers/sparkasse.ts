
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
    let headerLine: string | null = null;
    for (let i = 0; i < Math.min(30, lines.length); i++) { // search top 30 lines
        const candidate = lines[i] || "";
        const normalized = normalize(candidate);
        if (normalized.includes("buchungstag") && (normalized.includes("auftragskonto") || normalized.includes("verwendungszweck") || normalized.includes("begunstigter"))) {
            headerLineIndex = i;
            headerLine = candidate;
            break;
        }
    }

    const delimiter = detectDelimiter(headerLine) ?? ";";

    // Pass the content starting from the header line to csv-parse
    // We rejoin because csv-parse takes a string input usually or we can just slice lines
    // But csv-parse 'from_line' option is easier if we pass full content
    const records = parse(content, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      delimiter, // Sparkasse is usually semicolon
      relax_quotes: true,
      relax_column_count: true,
      trim: true,
      from_line: headerLineIndex + 1
    });

    const transactions: ParsedTransaction[] = records.map((record: any) => {
        const nmap = buildNormalizedKeyMap(record);
        // Map columns correctly based on documentation
        const auftragskonto = pick(record, nmap, ["Auftragskonto"]);
        const buchungstag = pick(record, nmap, ["Buchungstag", "Buchungstag ", "Buchungstag (Valuta)", "Buchungstag/Valuta", "Valutadatum"]);
        const valutadatum = pick(record, nmap, ["Valutadatum"]);
        const beguenstigter = pick(record, nmap, ["Beguenstigter/Zahlungspflichtiger", "Begünstigter/Zahlungspflichtiger", "Beguenstigter / Zahlungspflichtiger", "Begünstigter / Zahlungspflichtiger"]);
        const verwendungszweck = pick(record, nmap, ["Verwendungszweck"]);
        const buchungstext = pick(record, nmap, ["Buchungstext"]);
        const iban = pick(record, nmap, ["Kontonummer/IBAN", "Kontonummer / IBAN", "IBAN"]);
        const bic = pick(record, nmap, ["BIC"]);
        const glaeubigerId = pick(record, nmap, ["Glaeubiger ID", "Gläubiger ID", "GlaeubigerID", "GläubigerID"]);
        const mandatsreferenz = pick(record, nmap, ["Mandatsreferenz"]);
        const kundenreferenz = pick(record, nmap, ["Kundenreferenz (End-to-End)", "Kundenreferenz", "End-to-End-Referenz", "End-to-End Referenz"]);
        const sammlerreferenz = pick(record, nmap, ["Sammlerreferenz"]);
        const lastschrifteinreicherId = pick(record, nmap, ["Lastschrifteinreicher ID", "LastschrifteinreicherID"]);
        const idEndToEnd = pick(record, nmap, ["ID End-to-End", "ID EndToEnd", "End-to-End-ID"]);
        const info = pick(record, nmap, ["Info"]);
        const betragStr = pick(record, nmap, ["Betrag"]);
        const waehrung = pick(record, nmap, ["Waehrung", "Währung", "Currency"]) || "EUR";

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
            rawDescription: verwendungszweck || beguenstigter, // Legacy raw
            keyDesc: keyDesc, // THE IMPORTANT FIELD
            key: key,         // Unique ID
            metadata: record,
            auftragskonto: auftragskonto || undefined,
            buchungstag: buchungstag || undefined,
            valutadatum: valutadatum || undefined,
            buchungstext: buchungstext || undefined,
            verwendungszweck: verwendungszweck || undefined,
            glaeubigerId: glaeubigerId || undefined,
            mandatsreferenz: mandatsreferenz || undefined,
            kundenreferenz: kundenreferenz || undefined,
            sammlerreferenz: sammlerreferenz || undefined,
            lastschrifteinreicherId: lastschrifteinreicherId || undefined,
            idEndToEnd: idEndToEnd || undefined,
            beguenstigterZahlungspflichtiger: beguenstigter || undefined,
            iban: iban || undefined,
            bic: bic || undefined,
            betrag: betragStr || undefined,
            waehrung: waehrung || undefined,
            info: info || undefined,
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
            delimiter,
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

function normalize(input: string): string {
    return (input || "")
        .toLowerCase()
        .normalize("NFKD")
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function detectDelimiter(headerLine: string | null): string | null {
    if (!headerLine) return null;
    const candidates = [",", ";", "\t"];
    const counts = candidates.map((d) => ({ d, c: headerLine.split(d).length - 1 }));
    counts.sort((a, b) => b.c - a.c);
    return counts[0]?.c ? counts[0].d : null;
}

function buildNormalizedKeyMap(record: Record<string, any>): Map<string, string> {
    const map = new Map<string, string>();
    for (const k of Object.keys(record)) {
        map.set(normalize(k).replace(/[^\p{L}\p{N}]/gu, ""), k);
    }
    return map;
}

function pick(record: Record<string, any>, normalizedMap: Map<string, string>, keys: string[]): string {
    for (const key of keys) {
        if (key in record && record[key] != null && String(record[key]).trim() !== "") return String(record[key]).trim();
        const nk = normalize(key).replace(/[^\p{L}\p{N}]/gu, "");
        const original = normalizedMap.get(nk);
        if (original && record[original] != null && String(record[original]).trim() !== "") return String(record[original]).trim();
    }
    return "";
}
