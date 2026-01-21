/**
 * CSV Sanitization utilities
 * Prevents CSV injection attacks (formula injection)
 */

/**
 * Characters that can trigger formula execution in spreadsheet applications
 */
const FORMULA_CHARS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Sanitize a single cell value to prevent CSV injection
 * @param value - Cell value to sanitize
 * @returns Sanitized value safe for CSV export
 */
export function sanitizeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const strValue = String(value);

  // Check if the value starts with a formula character
  if (FORMULA_CHARS.some(char => strValue.startsWith(char))) {
    // Prepend single quote to prevent formula execution
    return `'${strValue}`;
  }

  // Escape double quotes by doubling them (CSV standard)
  return strValue.replace(/"/g, '""');
}

/**
 * Sanitize an entire row of CSV data
 * @param row - Array of cell values
 * @returns Sanitized row
 */
export function sanitizeCsvRow(row: (string | number | null | undefined)[]): string[] {
  return row.map(sanitizeCsvCell);
}

/**
 * Convert array of objects to sanitized CSV string
 * @param data - Array of objects to convert
 * @param headers - Optional custom headers
 * @returns CSV string with sanitized values
 */
export function arrayToCsv<T extends Record<string, any>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Sanitize headers
  const headerRow = sanitizeCsvRow(csvHeaders);
  
  // Sanitize data rows
  const dataRows = data.map(row => {
    const values = csvHeaders.map(header => row[header]);
    return sanitizeCsvRow(values);
  });

  // Combine headers and data
  const allRows = [headerRow, ...dataRows];
  
  // Convert to CSV format
  return allRows
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

/**
 * Generate CSV download response headers
 * @param filename - Name of the CSV file
 * @returns Headers object for Response
 */
export function getCsvHeaders(filename: string): HeadersInit {
  return {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}
