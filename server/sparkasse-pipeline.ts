import { parse } from "csv-parse/sync";

export type SparkasseEncodingUsed = "utf-8" | "latin1";

export interface SparkasseEncodingResult {
  text: string;
  encodingUsed: SparkasseEncodingUsed;
  replacementRatio: number;
  hadDecodeFailure: boolean;
}

export interface SparkasseDelimiterCheck {
  delimiterUsed: string;
  columnCounts: number[];
  mismatch: boolean;
  rowsChecked: number;
}

export const SPARKASSE_DELIMITER = ";";
const REPLACEMENT_RATIO_THRESHOLD = 0.005;
const DELIMITER_MISMATCH_THRESHOLD = 0.8;

const countReplacementChars = (text: string) => {
  let count = 0;
  for (const ch of text) {
    if (ch === "\uFFFD") count += 1;
  }
  return count;
};

export function decodeSparkasseBuffer(buffer: Buffer): SparkasseEncodingResult {
  let encodingUsed: SparkasseEncodingUsed = "utf-8";
  let text = "";
  let hadDecodeFailure = false;

  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    const replacementRatio = countReplacementChars(text) / Math.max(text.length, 1);
    if (replacementRatio > REPLACEMENT_RATIO_THRESHOLD) {
      encodingUsed = "latin1";
      text = new TextDecoder("latin1").decode(buffer);
      return { text, encodingUsed, replacementRatio, hadDecodeFailure };
    }
    return { text, encodingUsed, replacementRatio, hadDecodeFailure };
  } catch {
    hadDecodeFailure = true;
    encodingUsed = "latin1";
    text = new TextDecoder("latin1").decode(buffer);
    const replacementRatio = countReplacementChars(text) / Math.max(text.length, 1);
    return { text, encodingUsed, replacementRatio, hadDecodeFailure };
  }
}

export function parseSparkasseRows(csvContent: string): string[][] {
  return parse(csvContent, {
    delimiter: SPARKASSE_DELIMITER,
    relax_quotes: true,
    trim: true,
    skip_empty_lines: true
  });
}

export function checkSparkasseDelimiter(records: string[][]): SparkasseDelimiterCheck {
  const columnCounts = records.map((row) => row.length);
  const rowsChecked = columnCounts.length;
  const singleColumnRows = columnCounts.filter((count) => count <= 1).length;
  const mismatch = rowsChecked > 0
    ? (singleColumnRows / rowsChecked) >= DELIMITER_MISMATCH_THRESHOLD
    : true;

  return {
    delimiterUsed: SPARKASSE_DELIMITER,
    columnCounts,
    mismatch,
    rowsChecked
  };
}
