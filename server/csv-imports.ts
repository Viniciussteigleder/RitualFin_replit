import { parse } from "csv-parse/sync";
import {
  CsvContract,
  CsvDataset,
  CsvReasonCode,
  csvContracts,
  csvReasonInfo
} from "./csv-contracts";
import { buildCsvFromRows } from "./csv-export";

export type CsvHeaderDiff = {
  missing: string[];
  unexpected: string[];
  orderMismatch: boolean;
};

export type CsvRowErrorSample = {
  rowNumber: number;
  message: string;
  row: string[];
};

export type CsvImportResult = {
  success: boolean;
  contract: CsvContract;
  detectedEncoding?: string;
  detectedDelimiter?: string;
  headerFound: string[];
  headerDiff?: CsvHeaderDiff;
  rowsTotal: number;
  rowsValid: number;
  previewRows: Array<Record<string, string>>;
  rowErrorSamples: CsvRowErrorSample[];
  reasonCodes: CsvReasonCode[];
  message?: string;
  fixes?: string[];
  canonicalCsv?: string;
};

const BOM_BYTES = [0xef, 0xbb, 0xbf];
const REPLACEMENT_CHAR = "\uFFFD";
const SAMPLE_LINES = 25;
const PREVIEW_ROWS = 20;

const startsWithBom = (buffer: Buffer) =>
  buffer.length >= 3 &&
  buffer[0] === BOM_BYTES[0] &&
  buffer[1] === BOM_BYTES[1] &&
  buffer[2] === BOM_BYTES[2];

const decodeBuffer = (buffer: Buffer) => {
  if (startsWithBom(buffer)) {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    return { text: text.replace(/^\uFEFF/, ""), encoding: "utf-8-bom" };
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    return { text, encoding: "utf-8" };
  } catch {
    try {
      const text = new TextDecoder("windows-1252").decode(buffer);
      return { text, encoding: "windows-1252" };
    } catch {
      const text = new TextDecoder("iso-8859-1").decode(buffer);
      return { text, encoding: "iso-8859-1" };
    }
  }
};

const normalizeText = (text: string) =>
  text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const countUnquotedDelimiters = (line: string, delimiter: string) => {
  let inQuotes = false;
  let count = 0;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && char === delimiter) {
      count += 1;
    }
  }
  return count;
};

const detectDelimiterIssues = (text: string, delimiter: string) => {
  const lines = text.split("\n").slice(0, SAMPLE_LINES).filter((line) => line.trim() !== "");
  if (lines.length === 0) {
    return { hasIssues: true, details: "empty" };
  }

  const counts = lines.map((line) => countUnquotedDelimiters(line, delimiter));
  const expected = counts[0];
  const otherDelimiters = [",", "\t"].filter((item) => item !== delimiter);
  const otherCounts = otherDelimiters.map((other) =>
    lines.map((line) => countUnquotedDelimiters(line, other))
  );
  const otherDominant = otherCounts.some((countsByDelim) =>
    countsByDelim.some((count) => count > expected && count > 0)
  );
  const otherOnly = otherCounts.some((countsByDelim) =>
    countsByDelim.some((count, index) => count > 0 && counts[index] === 0)
  );

  if (expected === 0 || otherDominant || otherOnly) {
    return { hasIssues: true, details: "mixed" };
  }
  return { hasIssues: false };
};

const buildHeaderDiff = (expectedHeaders: string[], headerFound: string[]): CsvHeaderDiff => {
  const missing = expectedHeaders.filter((header) => !headerFound.includes(header));
  const unexpected = headerFound.filter((header) => !expectedHeaders.includes(header));
  const orderMismatch =
    missing.length === 0 &&
    unexpected.length === 0 &&
    headerFound.join("|") !== expectedHeaders.join("|");
  return { missing, unexpected, orderMismatch };
};

const buildReasonMessage = (reasonCodes: CsvReasonCode[]) => {
  const primary = reasonCodes[0];
  if (!primary) return {};
  const info = csvReasonInfo[primary];
  return { message: info.message, fixes: info.fixes };
};

export const resolveContract = (dataset: CsvDataset) => csvContracts[dataset];

export const previewCsvImport = (
  dataset: CsvDataset,
  buffer: Buffer,
  filename: string
): CsvImportResult => {
  const contract = resolveContract(dataset);
  const reasonCodes: CsvReasonCode[] = [];
  const rowErrorSamples: CsvRowErrorSample[] = [];
  let headerFound: string[] = [];
  let headerDiff: CsvHeaderDiff | undefined;
  let detectedEncoding: string | undefined;
  let detectedDelimiter: string | undefined;
  let canonicalCsv: string | undefined;
  let previewRows: Array<Record<string, string>> = [];
  let rowsTotal = 0;
  let rowsValid = 0;

  if (!filename.toLowerCase().endsWith(".csv")) {
    reasonCodes.push("FILE_NOT_CSV");
  }
  if (buffer.length > contract.maxSizeBytes) {
    reasonCodes.push("FILE_TOO_LARGE");
  }
  if (reasonCodes.length > 0) {
    return {
      success: false,
      contract,
      headerFound,
      rowsTotal,
      rowsValid,
      previewRows,
      rowErrorSamples,
      reasonCodes,
      ...buildReasonMessage(reasonCodes)
    };
  }

  try {
    const decoded = decodeBuffer(buffer);
    detectedEncoding = decoded.encoding;
    const normalized = normalizeText(decoded.text);
    if (normalized.includes(REPLACEMENT_CHAR)) {
      reasonCodes.push("DECODE_CORRUPTION");
      return {
        success: false,
        contract,
        detectedEncoding,
        headerFound,
        rowsTotal,
        rowsValid,
        previewRows,
        rowErrorSamples,
        reasonCodes,
        ...buildReasonMessage(reasonCodes)
      };
    }

    detectedDelimiter = contract.delimiter;
    const delimiterIssues = detectDelimiterIssues(normalized, contract.delimiter);
    if (delimiterIssues.hasIssues) {
      reasonCodes.push("DELIMITER_INCONSISTENT");
      return {
        success: false,
        contract,
        detectedEncoding,
        detectedDelimiter,
        headerFound,
        rowsTotal,
        rowsValid,
        previewRows,
        rowErrorSamples,
        reasonCodes,
        ...buildReasonMessage(reasonCodes)
      };
    }

    let records: string[][] = [];
    try {
      records = parse(normalized, {
        delimiter: contract.delimiter,
        relax_quotes: false,
        relax_column_count: true,
        skip_empty_lines: true
      });
    } catch (error: any) {
      reasonCodes.push("QUOTING_PARSE_ERROR");
      return {
        success: false,
        contract,
        detectedEncoding,
        detectedDelimiter,
        headerFound,
        rowsTotal,
        rowsValid,
        previewRows,
        rowErrorSamples,
        reasonCodes,
        ...buildReasonMessage(reasonCodes)
      };
    }

    if (records.length === 0) {
      reasonCodes.push("ROW_SHAPE_INVALID");
      return {
        success: false,
        contract,
        detectedEncoding,
        detectedDelimiter,
        headerFound,
        rowsTotal,
        rowsValid,
        previewRows,
        rowErrorSamples,
        reasonCodes,
        ...buildReasonMessage(reasonCodes)
      };
    }

    headerFound = records[0].map((value, index) =>
      index === 0 ? String(value).replace(/^\uFEFF/, "") : String(value)
    );
    rowsTotal = records.length - 1;

    headerDiff = buildHeaderDiff(contract.expectedHeaders, headerFound);
    if (
      headerDiff.missing.length > 0 ||
      headerDiff.unexpected.length > 0 ||
      (contract.strictHeaderOrder && headerDiff.orderMismatch)
    ) {
      reasonCodes.push("HEADER_MISMATCH");
      return {
        success: false,
        contract,
        detectedEncoding,
        detectedDelimiter,
        headerFound,
        headerDiff,
        rowsTotal,
        rowsValid,
        previewRows,
        rowErrorSamples,
        reasonCodes,
        ...buildReasonMessage(reasonCodes)
      };
    }

    const rows: Array<Record<string, string>> = [];
    for (let i = 1; i < records.length; i += 1) {
      const record = records[i];
      if (record.length !== headerFound.length) {
        rowErrorSamples.push({
          rowNumber: i + 1,
          message: `Colunas esperadas: ${headerFound.length}, encontradas: ${record.length}`,
          row: record
        });
        continue;
      }
      const row: Record<string, string> = {};
      headerFound.forEach((header, index) => {
        row[header] = String(record[index] ?? "");
      });
      rows.push(row);
    }

    rowsValid = rows.length;
    if (rowErrorSamples.length > 0) {
      reasonCodes.push("ROW_SHAPE_INVALID");
      return {
        success: false,
        contract,
        detectedEncoding,
        detectedDelimiter,
        headerFound,
        headerDiff,
        rowsTotal,
        rowsValid,
        previewRows,
        rowErrorSamples: rowErrorSamples.slice(0, PREVIEW_ROWS),
        reasonCodes,
        ...buildReasonMessage(reasonCodes)
      };
    }

    previewRows = rows.slice(0, PREVIEW_ROWS);
    canonicalCsv = buildCsvFromRows(contract, rows);

    return {
      success: true,
      contract,
      detectedEncoding,
      detectedDelimiter,
      headerFound,
      rowsTotal,
      rowsValid,
      previewRows,
      rowErrorSamples,
      reasonCodes,
      canonicalCsv
    };
  } catch {
    reasonCodes.push("ENCODING_UNSUPPORTED");
    return {
      success: false,
      contract,
      detectedEncoding,
      detectedDelimiter,
      headerFound,
      rowsTotal,
      rowsValid,
      previewRows,
      rowErrorSamples,
      reasonCodes,
      ...buildReasonMessage(reasonCodes)
    };
  }
};

export const parseCanonicalCsv = (contract: CsvContract, csvText: string) => {
  const normalized = normalizeText(csvText);
  const records = parse(normalized, {
    delimiter: contract.delimiter,
    relax_quotes: false,
    relax_column_count: true,
    skip_empty_lines: true
  }) as string[][];

  if (records.length === 0) {
    return [];
  }

  const headerFound = records[0].map((value, index) =>
    index === 0 ? String(value).replace(/^\uFEFF/, "") : String(value)
  );

  return records.slice(1).map((record) => {
    const row: Record<string, string> = {};
    headerFound.forEach((header, index) => {
      row[header] = String(record[index] ?? "");
    });
    return row;
  });
};
