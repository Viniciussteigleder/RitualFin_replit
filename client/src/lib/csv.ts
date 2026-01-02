const DELIMITERS = [",", ";"];

const stripBom = (text: string) => text.replace(/^\uFEFF/, "");

const detectDelimiter = (line: string) => {
  const counts = DELIMITERS.map((delimiter) => ({
    delimiter,
    count: line.split(delimiter).length - 1
  }));
  counts.sort((a, b) => b.count - a.count);
  return counts[0]?.delimiter || ",";
};

const parseLine = (line: string, delimiter: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
};

export const parseCsv = (text: string) => {
  const normalized = stripBom(text).replace(/\r\n/g, "\n").trim();
  if (!normalized) return { headers: [], rows: [] };

  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);
  const delimiter = detectDelimiter(lines[0] || "");
  const headers = parseLine(lines[0] || "", delimiter);
  const rows = lines.slice(1).map((line) => parseLine(line, delimiter));

  return { headers, rows };
};

export const toCsv = (rows: Array<Record<string, string>>, headers: string[], delimiter = ",") => {
  const escapeValue = (value: string) => {
    const needsQuotes =
      value.includes(delimiter) || value.includes("\n") || value.includes('"');
    const escaped = value.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const headerLine = headers.map((header) => escapeValue(header)).join(delimiter);
  const dataLines = rows.map((row) =>
    headers
      .map((header) => escapeValue(row[header] ?? ""))
      .join(delimiter)
  );

  return [headerLine, ...dataLines].join("\n");
};
