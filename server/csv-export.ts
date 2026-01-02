import type { CsvContract } from "./csv-contracts";

const needsQuoting = (value: string, delimiter: string) =>
  value.includes(delimiter) || value.includes('"') || value.includes("\n") || value.includes("\r");

const escapeFormula = (value: string) => {
  if (!value) return value;
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
};

export function buildCsvFromRows(
  contract: CsvContract,
  rows: Array<Record<string, string>>
): string {
  const delimiter = contract.export.delimiter;
  const lineEnding = contract.export.crlf ? "\r\n" : "\n";

  const escapeValue = (raw: string) => {
    const value = contract.export.escapeFormulas ? escapeFormula(raw) : raw;
    if (needsQuoting(value, delimiter)) {
      return `"${value.replace(/"/g, "\"\"")}"`;
    }
    return value;
  };

  const lines = [
    contract.expectedHeaders.map((header) => escapeValue(header)).join(delimiter),
    ...rows.map((row) =>
      contract.expectedHeaders
        .map((header) => escapeValue(String(row[header] ?? "")))
        .join(delimiter)
    )
  ];

  const csvBody = lines.join(lineEnding);
  return contract.export.bom ? `\uFEFF${csvBody}` : csvBody;
}
