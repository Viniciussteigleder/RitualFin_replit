export type RawColumns = Record<string, unknown> | null;

function asTrimmedString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function getColumnCount(rawColumns: RawColumns): number {
  if (!rawColumns || typeof rawColumns !== "object") return 0;
  return Object.keys(rawColumns).length;
}

export function detectReplacementChar(rawColumns: RawColumns): boolean {
  if (!rawColumns || typeof rawColumns !== "object") return false;
  for (const value of Object.values(rawColumns)) {
    const s = asTrimmedString(value);
    if (!s) continue;
    if (s.includes("\uFFFD")) return true;
  }
  return false;
}

type NumberLocale = "eu" | "us" | "ambiguous" | "unknown";

export function classifyNumberLocale(rawNumber: string): NumberLocale {
  const s = rawNumber.trim();
  if (!s) return "unknown";

  // Strip currency symbols/spaces
  const cleaned = s.replace(/\s|\u00A0/g, "").replace(/[€$£]/g, "");
  const hasDot = cleaned.includes(".");
  const hasComma = cleaned.includes(",");

  if (hasDot && hasComma) {
    // Heuristic: last separator is decimal separator.
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");
    return lastComma > lastDot ? "eu" : "us";
  }

  if (hasComma && !hasDot) return "eu";
  if (hasDot && !hasComma) return "us";
  return "ambiguous";
}

export function detectNumberLocaleDrift(amountStrings: string[]): {
  eu: number;
  us: number;
  ambiguous: number;
  unknown: number;
  drift: boolean;
} {
  const counts = { eu: 0, us: 0, ambiguous: 0, unknown: 0 };
  for (const raw of amountStrings) {
    const kind = classifyNumberLocale(raw);
    (counts as any)[kind]++;
  }
  return {
    ...counts,
    drift: counts.eu > 0 && counts.us > 0,
  };
}

type DateFormat = "dd.mm.yy" | "dd.mm.yyyy" | "dd/mm/yyyy" | "yyyy-mm-dd" | "unknown";

export function classifyDateFormat(rawDate: string): DateFormat {
  const s = rawDate.trim();
  if (!s) return "unknown";

  if (/^\d{2}\.\d{2}\.\d{2}$/.test(s)) return "dd.mm.yy";
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return "dd.mm.yyyy";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return "dd/mm/yyyy";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return "yyyy-mm-dd";
  return "unknown";
}

export function detectDateFormatDrift(dateStrings: string[]): {
  formats: Record<DateFormat, number>;
  distinctKnownFormats: number;
  drift: boolean;
} {
  const formats: Record<DateFormat, number> = {
    "dd.mm.yy": 0,
    "dd.mm.yyyy": 0,
    "dd/mm/yyyy": 0,
    "yyyy-mm-dd": 0,
    unknown: 0,
  };

  for (const raw of dateStrings) {
    formats[classifyDateFormat(raw)]++;
  }

  const distinctKnownFormats = (Object.entries(formats) as Array<[DateFormat, number]>)
    .filter(([k, v]) => k !== "unknown" && v > 0).length;

  return {
    formats,
    distinctKnownFormats,
    drift: distinctKnownFormats > 1,
  };
}

export function pickFirstPresent(rawColumns: RawColumns, candidates: string[]): string {
  if (!rawColumns || typeof rawColumns !== "object") return "";
  for (const key of candidates) {
    if (key in rawColumns) {
      const v = asTrimmedString((rawColumns as any)[key]);
      if (v) return v;
    }
  }
  return "";
}

