import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const DEFAULT_SAMPLE = "/mnt/data/20251229-22518260-umsatz.CSV";
const FALLBACK_SAMPLE = path.join("attached_assets", "20251229-22518260-umsatz_1767103688511.CSV");

const requiredHeaders = [
  "Auftragskonto",
  "Buchungstag",
  "Valutadatum",
  "Buchungstext",
  "Verwendungszweck",
  "Beguenstigter/Zahlungspflichtiger",
  "Kontonummer/IBAN",
  "Betrag",
  "Waehrung",
  "Info"
];

const fileArg = process.argv[2];
const candidatePath = fileArg || (fs.existsSync(DEFAULT_SAMPLE) ? DEFAULT_SAMPLE : FALLBACK_SAMPLE);

if (!fs.existsSync(candidatePath)) {
  console.error("Sample file not found.", { candidatePath, DEFAULT_SAMPLE, FALLBACK_SAMPLE });
  process.exit(1);
}

const buffer = fs.readFileSync(candidatePath);
if (buffer.length === 0) {
  console.error("Sample file is empty.");
  process.exit(1);
}

const decodeBuffer = (encoding: string, fatal: boolean) =>
  new TextDecoder(encoding, { fatal }).decode(buffer);

const countReplacementChars = (text: string) => {
  let count = 0;
  for (const ch of text) {
    if (ch === "\uFFFD") count += 1;
  }
  return count;
};

let encodingUsed = "utf-8";
let content = "";
try {
  content = decodeBuffer("utf-8", true);
  const replacementRatio = countReplacementChars(content) / Math.max(content.length, 1);
  if (replacementRatio > 0.005) {
    encodingUsed = "latin1";
    content = decodeBuffer("latin1", false);
  }
} catch {
  encodingUsed = "latin1";
  content = decodeBuffer("latin1", false);
}

const detectDelimiter = (text: string) => {
  const sampleLine = text.split(/\r?\n/).find(line => line.trim().length > 0) || "";
  const tryDelimiter = (delimiter: string) => {
    try {
      const parsed = parse(sampleLine, { delimiter, relax_quotes: true, trim: true });
      return parsed[0]?.length || 0;
    } catch {
      return 0;
    }
  };

  const semicolonCols = tryDelimiter(";");
  const commaCols = tryDelimiter(",");
  const tabCols = tryDelimiter("\t");

  const best = [
    { delimiter: ";", cols: semicolonCols },
    { delimiter: ",", cols: commaCols },
    { delimiter: "\t", cols: tabCols }
  ].sort((a, b) => b.cols - a.cols)[0];

  return best.delimiter;
};

const delimiter = detectDelimiter(content);
const records: string[][] = parse(content, {
  delimiter,
  relax_quotes: true,
  trim: true,
  skip_empty_lines: true
});

const header = records[0] || [];
const headerMap: Record<string, number> = {};
header.forEach((name, index) => {
  headerMap[name] = index;
});

const mappedColumns = requiredHeaders.map((name) => ({
  name,
  index: headerMap[name] ?? -1
}));

const rows = records.slice(1, 21).map((row) => {
  const record: Record<string, string> = {};
  header.forEach((name, index) => {
    record[name] = row[index] ?? "";
  });
  return record;
});

console.log(JSON.stringify({
  file: candidatePath,
  sizeBytes: buffer.length,
  encodingUsed,
  delimiter,
  header,
  mappedColumns,
  rowsTotal: Math.max(records.length - 1, 0),
  rowsPreview: rows
}, null, 2));
