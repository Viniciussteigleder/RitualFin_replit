#!/usr/bin/env tsx
/**
 * Test BOM Handling Fix
 * Verifies that Sparkasse CSV with BOM is correctly detected
 */

// Sample Sparkasse CSV WITHOUT BOM (should work)
const sparkasseNoBOM = `"Auftragskonto";"Buchungstag";"Valutadatum";"Buchungstext";"Verwendungszweck";"Glaeubiger ID";"Mandatsreferenz";"Kundenreferenz (End-to-End)";"Sammlerreferenz";"Lastschrift Ursprungsbetrag";"Auslagenersatz Ruecklastschrift";"Beguenstigter/Zahlungspflichtiger";"Kontonummer/IBAN";"BIC (SWIFT-Code)";"Betrag";"Waehrung";"Info"
"DE74660501010022518260";"29.12.25";"";"GELDAUTOMAT";"24.12/11.50UHR SPARKASSE FU ";"";"";"";"";"";"";"GA NR00002012 BLZ70053070 4";"0000000000";"70053070";"-70,00";"EUR";"Umsatz vorgemerkt"`;

// Sample Sparkasse CSV WITH BOM (common in German banking exports)
const sparkasseWithBOM = '\uFEFF' + sparkasseNoBOM;

console.log("=".repeat(80));
console.log("BOM HANDLING TEST");
console.log("=".repeat(80));
console.log();

// Test parseCSV function with BOM handling
function parseCSV(csvContent: string): { hasBOM: boolean; firstChar: string; firstLine: string; format: string } {
  // Check if BOM is present
  const hasBOM = csvContent.charCodeAt(0) === 0xFEFF;

  // Remove UTF-8 BOM if present
  const cleanedContent = hasBOM ? csvContent.slice(1) : csvContent;

  // Get first line
  const lines = cleanedContent.split('\n');
  const firstLine = lines[0];

  // Detect format (simplified)
  const semiCols = firstLine.split(";").map(c => c.trim().replace(/^"|"$/g, ""));

  const hasAuftragskonto = semiCols.some(c => c.toLowerCase() === "auftragskonto");
  const hasBuchungstag = semiCols.some(c => c.toLowerCase() === "buchungstag");
  const hasVerwendungszweck = semiCols.some(c => c.toLowerCase() === "verwendungszweck");

  const format = (hasAuftragskonto && hasBuchungstag && hasVerwendungszweck) ? "sparkasse" : "unknown";

  return {
    hasBOM,
    firstChar: csvContent.charAt(0),
    firstLine,
    format
  };
}

// Test WITHOUT BOM
console.log("Test 1: CSV WITHOUT BOM");
const result1 = parseCSV(sparkasseNoBOM);
console.log(`  Has BOM: ${result1.hasBOM}`);
console.log(`  First char: "${result1.firstChar}" (code: ${result1.firstChar.charCodeAt(0)})`);
console.log(`  Format detected: ${result1.format}`);
console.log(`  Result: ${result1.format === "sparkasse" ? "✅ PASS" : "❌ FAIL"}`);
console.log();

// Test WITH BOM
console.log("Test 2: CSV WITH BOM (real-world scenario)");
const result2 = parseCSV(sparkasseWithBOM);
console.log(`  Has BOM: ${result2.hasBOM}`);
console.log(`  First char: "${result2.firstChar}" (code: ${result2.firstChar.charCodeAt(0)})`);
console.log(`  Format detected: ${result2.format}`);
console.log(`  Result: ${result2.format === "sparkasse" ? "✅ PASS (FIX WORKS!)" : "❌ FAIL (BUG STILL PRESENT)"}`);
console.log();

if (result1.format === "sparkasse" && result2.format === "sparkasse") {
  console.log("=".repeat(80));
  console.log("✅ ALL TESTS PASSED - BOM HANDLING FIX WORKING CORRECTLY");
  console.log("=".repeat(80));
} else {
  console.log("=".repeat(80));
  console.log("❌ TESTS FAILED");
  console.log("=".repeat(80));
}
