import { ParseResult } from "./types";
import { parseSparkasseCSV } from "./parsers/sparkasse";
import { parseMilesMoreCSV } from "./parsers/miles-more";
import { parseAmexActivityCSV } from "./parsers/amex";

export async function parseIngestionFile(fileContent: string): Promise<ParseResult> {
    // Simple heuristic detection
    if (fileContent.includes("Miles & More Gold Credit Card") || fileContent.includes("Authorised on;Processed on")) {
        return parseMilesMoreCSV(fileContent);
    }
    
    if (fileContent.includes("Auftragskonto") && fileContent.includes("Buchungstag")) {
        return parseSparkasseCSV(fileContent);
    }
    
    // Amex often has "Datum,Beschreibung" or "Kartennummer" (or just "Datum" and comma separated)
    if (fileContent.includes("Datum,Beschreibung") || fileContent.includes("PAYPAL *")) {
        return parseAmexActivityCSV(fileContent);
    }
    
    return {
        success: false,
        error: "Unknown CSV format. Could not detect Sparkasse, M&M, or Amex headers.",
        transactions: []
    };
}
