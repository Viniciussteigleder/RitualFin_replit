/**
 * Currency utilities for safe monetary calculations
 * Uses integer cents to avoid floating point precision errors
 */

/**
 * Convert euros to cents (integer)
 * @param euros - Amount in euros (can be float)
 * @returns Amount in cents (integer)
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Convert cents to euros (for display)
 * @param cents - Amount in cents (integer)
 * @returns Amount in euros (float)
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Format cents as currency string
 * @param cents - Amount in cents
 * @param currency - Currency code (default: EUR)
 * @param locale - Locale for formatting (default: pt-PT)
 * @returns Formatted currency string
 */
export function formatCurrency(
  cents: number,
  currency: string = 'EUR',
  locale: string = 'pt-PT'
): string {
  const euros = centsToEuros(cents);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(euros);
}

/**
 * Parse currency string to cents
 * @param value - Currency string or number
 * @returns Amount in cents (integer)
 */
export function parseCurrency(value: string | number): number {
  if (typeof value === 'number') {
    return eurosToCents(value);
  }
  
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[^\d.,-]/g, '');
  
  // Handle European format (comma as decimal separator)
  const normalized = cleaned.replace(',', '.');
  
  const euros = parseFloat(normalized);
  
  if (isNaN(euros)) {
    throw new Error(`Invalid currency value: ${value}`);
  }
  
  return eurosToCents(euros);
}

/**
 * Add two amounts in cents safely
 */
export function addCents(a: number, b: number): number {
  return a + b;
}

/**
 * Subtract two amounts in cents safely
 */
export function subtractCents(a: number, b: number): number {
  return a - b;
}

/**
 * Multiply cents by a factor (e.g., for exchange rates)
 * @param cents - Amount in cents
 * @param factor - Multiplication factor
 * @returns Result in cents (rounded)
 */
export function multiplyCents(cents: number, factor: number): number {
  return Math.round(cents * factor);
}

/**
 * Divide cents by a divisor
 * @param cents - Amount in cents
 * @param divisor - Division factor
 * @returns Result in cents (rounded)
 */
export function divideCents(cents: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Division by zero');
  }
  return Math.round(cents / divisor);
}

/**
 * Calculate percentage of an amount
 * @param cents - Amount in cents
 * @param percentage - Percentage (e.g., 15 for 15%)
 * @returns Result in cents
 */
export function percentageOf(cents: number, percentage: number): number {
  return Math.round((cents * percentage) / 100);
}
