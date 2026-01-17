import { ParseResult } from "./types";
import { parseSparkasseCSV } from "./parsers/sparkasse";
import { parseMilesMoreCSV } from "./parsers/miles-more";
import { parseAmexActivityCSV } from "./parsers/amex";

export async function parseIngestionFile(buffer: Buffer | string, filename?: string, userId?: string): Promise<ParseResult> {
    const fileContent = typeof buffer === "string" ? stripBom(buffer) : decodeBuffer(buffer);
    const headerLine = findHeaderLine(fileContent);
    const normalized = normalizeForDetect(headerLine ?? fileContent);
    
    // Simple heuristic detection
    if (normalized.includes("miles & more gold credit card") || normalized.includes("authorised on") || normalized.includes("processed on") || filename?.toLowerCase().includes("miles")) {
        return parseMilesMoreCSV(fileContent);
    }
    
    const headerLooksLikeSparkasse =
        (normalized.includes("buchungstag") || normalized.includes("buchungstext")) &&
        (normalized.includes("auftragskonto") || normalized.includes("verwendungszweck") || normalized.includes("begunstigter/zahlungspflichtiger")) &&
        (normalized.includes("betrag") || normalized.includes("waehrung"));
    if (headerLooksLikeSparkasse || filename?.toLowerCase().includes("sparkasse")) {
        return parseSparkasseCSV(fileContent);
    }
    
    // Amex exports can be comma- or semicolon-separated (and sometimes UTF-16).
    const headerLooksLikeAmex =
        normalized.includes("datum") &&
        normalized.includes("betrag") &&
        (normalized.includes("beschreibung") || normalized.includes("karteninhaber") || normalized.includes("kartennummer"));
    if (headerLooksLikeAmex || normalized.includes("paypal *") || filename?.toLowerCase().includes("amex")) {
        return parseAmexActivityCSV(fileContent);
    }
    
    return {
        success: false,
        errors: ["Unknown CSV format. Could not detect Sparkasse, M&M, or Amex headers."],
        transactions: [],
        rowsTotal: 0,
        rowsImported: 0,
        monthAffected: "",
        format: "unknown",
        diagnostics: {
            headerMatch: {
                found: headerLine ? splitHeaderColumns(headerLine) : [],
                missing: [],
                extra: [],
            },
        },
        meta: {
            delimiter: detectDelimiter(headerLine) ?? ",",
            warnings: headerLine ? [] : ["Could not detect a header line in the first 50 lines."],
            hasMultiline: false,
            headersFound: headerLine ? splitHeaderColumns(headerLine) : [],
        },
    };
}

function stripBom(input: string): string {
    return input.replace(/^\uFEFF/, "");
}

function decodeBuffer(buffer: Buffer): string {
    // Heuristic: if there are a lot of NUL bytes, it's likely UTF-16LE.
    const sample = buffer.subarray(0, Math.min(buffer.length, 1024));
    let nulCount = 0;
    for (const byte of sample) {
        if (byte === 0x00) nulCount++;
    }
    const encoding = nulCount > sample.length * 0.1 ? "utf16le" : "utf8";
    const decoded = stripBom(buffer.toString(encoding as BufferEncoding));

    // If UTF-8 decoding produced lots of replacement chars, fall back to latin1 (common in bank exports).
    if (encoding === "utf8") {
        const replacementCount = (decoded.match(/\uFFFD/g) || []).length;
        if (replacementCount > 5) {
            return stripBom(buffer.toString("latin1"));
        }
    }
    return decoded;
}

function findHeaderLine(content: string): string | null {
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < Math.min(lines.length, 50); i++) {
        const line = lines[i]?.trim();
        if (!line) continue;
        if (line.includes("Auftragskonto") || line.includes("Authorised on") || line.includes("Datum")) return line;
    }
    return null;
}

function detectDelimiter(headerLine: string | null): string | null {
    if (!headerLine) return null;
    const candidates = [",", ";", "\t"];
    const counts = candidates.map((d) => ({ d, c: headerLine.split(d).length - 1 }));
    counts.sort((a, b) => b.c - a.c);
    return counts[0]?.c ? counts[0].d : null;
}

function splitHeaderColumns(headerLine: string): string[] {
    const delimiter = detectDelimiter(headerLine) ?? ",";
    return headerLine.split(delimiter).map((c) => c.trim()).filter(Boolean);
}

function includesAll(haystack: string, needles: string[]): boolean {
    return needles.every((n) => haystack.includes(n));
}

function normalizeForDetect(input: string): string {
    return input
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
