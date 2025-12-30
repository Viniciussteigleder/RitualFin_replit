#!/usr/bin/env tsx
/**
 * Sparkasse CSV Format Diagnostic Tool
 * Usage: tsx test-sparkasse-csv.ts <path-to-csv>
 */

import { readFileSync } from 'fs';

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

function parseCSVLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
    i++;
  }
  result.push(current.trim().replace(/^"|"$/g, ""));

  return result;
}

function analyzeCsv(filePath: string) {
  console.log("=".repeat(80));
  console.log("SPARKASSE CSV FORMAT DIAGNOSTIC");
  console.log("=".repeat(80));
  console.log();

  // Read file
  const content = readFileSync(filePath, 'utf-8');
  console.log(`✓ File read successfully (${content.length} bytes)`);
  console.log();

  // Split into lines
  const lines = splitCSVLines(content);
  console.log(`✓ Total lines: ${lines.length}`);
  console.log();

  // Analyze first 10 lines
  console.log("FIRST 10 LINES (raw):");
  console.log("-".repeat(80));
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const preview = lines[i].length > 100 ? lines[i].substring(0, 100) + "..." : lines[i];
    console.log(`Line ${i + 1}: ${preview}`);
  }
  console.log();

  // Detect separator
  console.log("SEPARATOR DETECTION:");
  console.log("-".repeat(80));
  const firstLine = lines[0] || "";
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  console.log(`Semicolons (;): ${semiCount}`);
  console.log(`Commas (,): ${commaCount}`);
  console.log(`Tabs (\\t): ${tabCount}`);

  const separator = semiCount > commaCount && semiCount > tabCount ? ";" :
                    commaCount > tabCount ? "," : "\t";
  console.log(`→ Detected separator: "${separator}"`);
  console.log();

  // Parse header with detected separator
  console.log("HEADER COLUMNS:");
  console.log("-".repeat(80));

  for (let headerIdx = 0; headerIdx < Math.min(3, lines.length); headerIdx++) {
    const columns = parseCSVLine(lines[headerIdx], separator);
    console.log(`\nRow ${headerIdx + 1} (${columns.length} columns):`);
    columns.forEach((col, idx) => {
      console.log(`  [${idx}] "${col}" (lowercase: "${col.toLowerCase()}")`);
    });

    // Check for Sparkasse required columns
    const hasAuftragskonto = columns.some(c => c.toLowerCase() === "auftragskonto");
    const hasBuchungstag = columns.some(c => c.toLowerCase() === "buchungstag");
    const hasVerwendungszweck = columns.some(c => c.toLowerCase() === "verwendungszweck");
    const hasBetrag = columns.some(c => c.toLowerCase() === "betrag");

    console.log(`\n  Sparkasse column check:`);
    console.log(`    ✓ Auftragskonto: ${hasAuftragskonto ? "FOUND" : "MISSING"}`);
    console.log(`    ✓ Buchungstag: ${hasBuchungstag ? "FOUND" : "MISSING"}`);
    console.log(`    ✓ Verwendungszweck: ${hasVerwendungszweck ? "FOUND" : "MISSING"}`);
    console.log(`    ✓ Betrag: ${hasBetrag ? "FOUND" : "MISSING"}`);

    const isSparkasse = hasAuftragskonto && hasBuchungstag && hasVerwendungszweck;
    console.log(`\n  → Is Sparkasse format: ${isSparkasse ? "YES ✓" : "NO ✗"}`);

    if (isSparkasse) {
      console.log(`\n  ✓✓✓ SPARKASSE FORMAT DETECTED ON ROW ${headerIdx + 1} ✓✓✓`);
      break;
    }
  }

  console.log();

  // Parse a sample transaction
  console.log("SAMPLE TRANSACTION (Row 2):");
  console.log("-".repeat(80));
  if (lines.length > 1) {
    const cols = parseCSVLine(lines[1], separator);
    cols.forEach((col, idx) => {
      const preview = col.length > 50 ? col.substring(0, 50) + "..." : col;
      console.log(`  [${idx}] ${preview}`);
    });
  } else {
    console.log("  No data rows available");
  }

  console.log();
  console.log("=".repeat(80));
  console.log("DIAGNOSIS COMPLETE");
  console.log("=".repeat(80));
}

// Main
const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: tsx test-sparkasse-csv.ts <path-to-csv>");
  process.exit(1);
}

try {
  analyzeCsv(filePath);
} catch (error: any) {
  console.error("ERROR:", error.message);
  process.exit(1);
}
