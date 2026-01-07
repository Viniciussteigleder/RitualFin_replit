import { ParsedTransaction } from "./types";

export interface OCRResult {
  date?: Date;
  amount?: number;
  merchant?: string;
  confidence: number;
}

export function parseOCRText(text: string): OCRResult {
  // Simple Regex-based parser as a starting point
  // 1. Find Date (DD.MM.YYYY or YYYY-MM-DD)
  const dateMatch = text.match(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/);
  let date;
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const year = parseInt(dateMatch[3]);
    date = new Date(year, month, day);
  }

  // 2. Find Amount (Look for largest number with 2 decimals)
  // Regex for currency: 12,34 or 12.34
  const amountMatches = text.matchAll(/([0-9]+[.,][0-9]{2})/g);
  let maxAmount = 0;
  for (const match of amountMatches) {
    const val = parseFloat(match[1].replace(",", "."));
    if (val > maxAmount) maxAmount = val;
  }

  // 3. Merchant (Heuristic: First line or line with "GmbH" etc)
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  let merchant = lines[0]; // Fallback
  
  return {
    date,
    amount: maxAmount || undefined,
    merchant,
    confidence: date && maxAmount ? 0.8 : 0.4
  };
}
