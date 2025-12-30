#!/usr/bin/env tsx
/**
 * Test Format Detection with Actual Sparkasse CSV Data
 * This reproduces the exact format detection logic to identify the issue
 */

// Sample Sparkasse CSV data from user
const sparkasseCSV = `"Auftragskonto";"Buchungstag";"Valutadatum";"Buchungstext";"Verwendungszweck";"Glaeubiger ID";"Mandatsreferenz";"Kundenreferenz (End-to-End)";"Sammlerreferenz";"Lastschrift Ursprungsbetrag";"Auslagenersatz Ruecklastschrift";"Beguenstigter/Zahlungspflichtiger";"Kontonummer/IBAN";"BIC (SWIFT-Code)";"Betrag";"Waehrung";"Info"
"DE74660501010022518260";"29.12.25";"";"GELDAUTOMAT";"24.12/11.50UHR SPARKASSE FU ";"";"";"";"";"";"";"GA NR00002012 BLZ70053070 4";"0000000000";"70053070";"-70,00";"EUR";"Umsatz vorgemerkt"
"DE74660501010022518260";"19.12.25";"02.01.26";"FOLGELASTSCHRIFT";"OLC--0208-0000313 OLC-2637461 Halbjaehrliche Servicepauschale 29.90 EUR 06.12.25/RED LABEL - cfOlching - 01/23 - Offline 29.90 EUR 01.01.26- ";"DE11OLC00000381854";"MLREFOLC01523";"OLC--0208-0000313";"";"";"";"Hommer Fitness GmbH";"DE82743626630005779286";"GENODEF1ERG";"-59,80";"EUR";"Umsatz vorgemerkt"`;

console.log("=".repeat(80));
console.log("FORMAT DETECTION DEBUG");
console.log("=".repeat(80));
console.log();

// Step 1: Split into lines (mimicking splitCSVLines function)
function splitCSVLines(csvContent: string): string[] {
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;
  let i = 0;

  while (i < csvContent.length) {
    const char = csvContent[i];
    const nextChar = i + 1 < csvContent.length ? csvContent[i + 1] : "";

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '""';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (currentLine.trim() !== "") {
        lines.push(currentLine);
      }
      currentLine = "";
      i += (char === '\r' && nextChar === '\n') ? 2 : 1;
      continue;
    } else {
      currentLine += char;
    }
    i++;
  }

  if (currentLine.trim() !== "") {
    lines.push(currentLine);
  }

  return lines;
}

const lines = splitCSVLines(sparkasseCSV);
console.log(`Step 1: Split into ${lines.length} lines`);
console.log();

// Step 2: Show raw first line
console.log("Step 2: Raw first line:");
console.log(lines[0]);
console.log();

// Step 3: Simulate detectCsvFormat logic
console.log("Step 3: Format detection logic:");
const line = lines[0];

// Test with semicolon separator
const semiCols = line.split(";").map(c => c.trim().replace(/^"|"$/g, ""));
console.log(`  Columns after split by ';' and quote removal:`);
semiCols.slice(0, 5).forEach((col, idx) => {
  console.log(`    [${idx}] "${col}" (lowercase: "${col.toLowerCase()}")`);
});
console.log(`  Total columns: ${semiCols.length}`);
console.log();

// Check for required Sparkasse columns
const hasAuftragskonto = semiCols.some(c => c.toLowerCase() === "auftragskonto");
const hasBuchungstag = semiCols.some(c => c.toLowerCase() === "buchungstag");
const hasVerwendungszweck = semiCols.some(c => c.toLowerCase() === "verwendungszweck");

console.log("Step 4: Column checks:");
console.log(`  ✓ auftragskonto: ${hasAuftragskonto ? "FOUND" : "MISSING"}`);
console.log(`  ✓ buchungstag: ${hasBuchungstag ? "FOUND" : "MISSING"}`);
console.log(`  ✓ verwendungszweck: ${hasVerwendungszweck ? "FOUND" : "MISSING"}`);
console.log();

if (hasAuftragskonto && hasBuchungstag && hasVerwendungszweck) {
  console.log("✅ RESULT: Sparkasse format DETECTED");
} else {
  console.log("❌ RESULT: Sparkasse format NOT DETECTED");
  console.log();
  console.log("Missing columns - Full column list:");
  semiCols.forEach((col, idx) => {
    console.log(`  [${idx}] "${col}"`);
  });
}

console.log();
console.log("=".repeat(80));
