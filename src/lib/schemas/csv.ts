/**
 * Strict CSV schema validation
 * Validates CSV headers and data structure
 */

import { z } from 'zod';

/**
 * Sparkasse CSV schema
 */
export const sparkasseCsvSchema = z.object({
  Auftragskonto: z.string(),
  Buchungstag: z.string().regex(/^\d{2}\.\d{2}\.\d{2}$/, 'Invalid date format (DD.MM.YY)'),
  Valutadatum: z.string().regex(/^\d{2}\.\d{2}\.\d{2}$/, 'Invalid date format (DD.MM.YY)'),
  Buchungstext: z.string(),
  Verwendungszweck: z.string(),
  'Glaeubiger ID': z.string().optional(),
  Mandatsreferenz: z.string().optional(),
  Kundenreferenz: z.string().optional(),
  Sammlerreferenz: z.string().optional(),
  'Lastschrifteinreicher ID': z.string().optional(),
  'ID End-to-End': z.string().optional(),
  'Beguenstigter/Zahlungspflichtiger': z.string(),
  IBAN: z.string().optional(),
  BIC: z.string().optional(),
  Betrag: z.string().regex(/^-?\d+,\d{2}$/, 'Invalid amount format'),
  Waehrung: z.string().length(3, 'Currency must be 3 characters'),
  Info: z.string().optional(),
});

/**
 * M&M CSV schema
 */
export const mmCsvSchema = z.object({
  'Authorised on': z.string(),
  'Processed on': z.string(),
  'Payment type': z.string(),
  Status: z.string(),
  Amount: z.string(),
  Currency: z.string().length(3),
  Description: z.string(),
});

/**
 * Amex CSV schema
 */
export const amexCsvSchema = z.object({
  Datum: z.string(),
  Beschreibung: z.string(),
  Betrag: z.string(),
  Karteninhaber: z.string().optional(),
  Kartennummer: z.string().optional(),
  Referenz: z.string().optional(),
  Ort: z.string().optional(),
  Staat: z.string().optional(),
});

/**
 * CSV source type detection
 */
export type CsvSource = 'sparkasse' | 'mm' | 'amex' | 'unknown';

/**
 * Detect CSV source from headers
 */
export function detectCsvSource(headers: string[]): CsvSource {
  const headerSet = new Set(headers.map(h => h.toLowerCase().trim()));

  // Check for Sparkasse headers
  if (
    headerSet.has('auftragskonto') &&
    headerSet.has('buchungstag') &&
    headerSet.has('betrag')
  ) {
    return 'sparkasse';
  }

  // Check for M&M headers
  if (
    headerSet.has('authorised on') &&
    headerSet.has('processed on') &&
    headerSet.has('payment type')
  ) {
    return 'mm';
  }

  // Check for Amex headers
  if (
    headerSet.has('datum') &&
    headerSet.has('beschreibung') &&
    headerSet.has('betrag') &&
    headerSet.has('karteninhaber')
  ) {
    return 'amex';
  }

  return 'unknown';
}

/**
 * Validate CSV row against schema
 */
export function validateCsvRow(
  row: Record<string, string>,
  source: CsvSource
): { success: boolean; errors?: string[] } {
  let schema: z.ZodSchema;

  switch (source) {
    case 'sparkasse':
      schema = sparkasseCsvSchema;
      break;
    case 'mm':
      schema = mmCsvSchema;
      break;
    case 'amex':
      schema = amexCsvSchema;
      break;
    default:
      return { success: false, errors: ['Unknown CSV source'] };
  }

  const result = schema.safeParse(row);

  if (result.success) {
    return { success: true };
  }

  const errors = result.error.issues.map(
    issue => `${issue.path.join('.')}: ${issue.message}`
  );

  return { success: false, errors };
}

/**
 * Validate entire CSV data
 */
export function validateCsvData(
  data: Record<string, string>[],
  source: CsvSource
): {
  valid: boolean;
  validRows: number;
  invalidRows: number;
  errors: Array<{ row: number; errors: string[] }>;
} {
  const errors: Array<{ row: number; errors: string[] }> = [];
  let validRows = 0;
  let invalidRows = 0;

  data.forEach((row, index) => {
    const result = validateCsvRow(row, source);

    if (result.success) {
      validRows++;
    } else {
      invalidRows++;
      errors.push({
        row: index + 1,
        errors: result.errors || [],
      });
    }
  });

  return {
    valid: invalidRows === 0,
    validRows,
    invalidRows,
    errors,
  };
}
