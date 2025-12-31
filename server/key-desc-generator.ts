/**
 * Merchant Key Description Generator
 *
 * Extracts standardized merchant identifiers from transaction descriptions
 * and generates intelligent alias suggestions for the merchant dictionary.
 */

import type { TransactionSource } from "../shared/schema";

/**
 * Normalize text for consistent comparison and storage
 * - Lowercase
 * - Remove accents
 * - Collapse whitespace
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Determine transaction source from accountSource string
 */
export function detectTransactionSource(accountSource: string): TransactionSource {
  const normalized = accountSource.toLowerCase();

  if (normalized.includes("sparkasse")) {
    return "Sparkasse";
  } else if (normalized.includes("amex")) {
    return "Amex";
  } else if (normalized.includes("miles") || normalized.includes("m&m")) {
    return "M&M";
  }

  // Default fallback
  return "M&M";
}

/**
 * Extract key description for Sparkasse transactions
 *
 * Format: "Verwendungszweck -- Beguenstigter -- Sparkasse"
 * Strategy: Extract beneficiary (merchant) name, clean up common noise
 */
function extractKeyDescSparkasse(descRaw: string): string {
  // Split by -- separator
  const parts = descRaw.split("--").map(p => p.trim());

  if (parts.length < 2) {
    // Fallback: use first 50 chars
    return normalizeText(descRaw.slice(0, 50));
  }

  // parts[0] = verwendungszweck (payment purpose)
  // parts[1] = beneficiary/merchant
  const beneficiary = parts[1];

  // Clean up common noise words
  const cleaned = beneficiary
    .replace(/\b(gmbh|gbr|e\.k\.|ug|ag|kg|ohg|eg)\b/gi, "")
    .replace(/\bmandatsreferenz:?\s*\S+/gi, "")
    .replace(/\bkundenreferenz:?\s*\S+/gi, "")
    .replace(/\breferenz:?\s*\S+/gi, "")
    .replace(/\biban:?\s*\S+/gi, "")
    .trim();

  // Truncate to reasonable length (first 50 chars)
  const truncated = cleaned.slice(0, 50).trim();

  return normalizeText(truncated);
}

/**
 * Extract key description for Amex transactions
 *
 * Format: "Beschreibung -- Amex [Cardholder] @ City, Country"
 * Strategy: Extract primary description (merchant name)
 */
function extractKeyDescAmex(descRaw: string): string {
  // Split by -- separator
  const parts = descRaw.split("--").map(p => p.trim());

  if (parts.length === 0) {
    return normalizeText(descRaw.slice(0, 50));
  }

  // parts[0] = main merchant description
  let merchantDesc = parts[0];

  // Remove location info if present (@ City, Country)
  merchantDesc = merchantDesc.split("@")[0].trim();

  // Remove cardholder info if present ([Name])
  merchantDesc = merchantDesc.replace(/\[.*?\]/g, "").trim();

  // Clean up common patterns
  merchantDesc = merchantDesc
    .replace(/\d{10,}/g, "") // Remove long numbers (reference IDs)
    .replace(/\s+/g, " ")
    .trim();

  // Truncate to reasonable length
  const truncated = merchantDesc.slice(0, 50).trim();

  return normalizeText(truncated);
}

/**
 * Extract key description for Miles & More transactions
 *
 * Format: "Description -- Payment Type -- Status -- M&M [optional international]"
 * Strategy: Extract primary merchant description
 */
function extractKeyDescMM(descRaw: string): string {
  // Split by -- separator
  const parts = descRaw.split("--").map(p => p.trim());

  if (parts.length === 0) {
    return normalizeText(descRaw.slice(0, 50));
  }

  // parts[0] = main merchant description
  let merchantDesc = parts[0];

  // Remove common noise patterns
  merchantDesc = merchantDesc
    .replace(/\[.*?\]/g, "") // Remove bracketed info
    .replace(/\d{10,}/g, "") // Remove long reference numbers
    .replace(/\s+/g, " ")
    .trim();

  // Truncate to reasonable length
  const truncated = merchantDesc.slice(0, 50).trim();

  return normalizeText(truncated);
}

/**
 * Main function: Extract key description based on transaction source
 *
 * @param descRaw - Raw transaction description from CSV parser
 * @param accountSource - Account source string (determines bank/card type)
 * @returns Normalized key description for merchant dictionary lookup
 */
export function generateKeyDesc(descRaw: string, accountSource: string): string {
  const source = detectTransactionSource(accountSource);

  switch (source) {
    case "Sparkasse":
      return extractKeyDescSparkasse(descRaw);
    case "Amex":
      return extractKeyDescAmex(descRaw);
    case "M&M":
      return extractKeyDescMM(descRaw);
    default:
      // Fallback: normalize and truncate
      return normalizeText(descRaw.slice(0, 50));
  }
}

/**
 * Generate intelligent alias description suggestion
 *
 * Applies heuristics to create a user-friendly merchant name from keyDesc:
 * - Capitalize first letter of each word
 * - Remove common noise words
 * - Clean up formatting
 *
 * @param keyDesc - Normalized key description
 * @returns Suggested alias description (user-friendly merchant name)
 */
export function generateAliasDescHeuristic(keyDesc: string): string {
  // Start with the key description
  let alias = keyDesc;

  // Remove common noise patterns
  alias = alias
    .replace(/\b(de|do|da|dos|das)\b/g, "") // Portuguese articles
    .replace(/\b(the|and|or|for)\b/g, "") // English articles
    .replace(/\s+/g, " ")
    .trim();

  // Capitalize first letter of each word (Title Case)
  alias = alias
    .split(" ")
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  // Limit to 40 characters for readability
  if (alias.length > 40) {
    alias = alias.slice(0, 40).trim();
  }

  return alias;
}

/**
 * Generate complete merchant description record for dictionary
 *
 * @param descRaw - Raw transaction description from CSV parser
 * @param accountSource - Account source string
 * @returns Object with source, keyDesc, and suggested aliasDesc
 */
export function generateMerchantDescription(descRaw: string, accountSource: string) {
  const source = detectTransactionSource(accountSource);
  const keyDesc = generateKeyDesc(descRaw, accountSource);
  const aliasDesc = generateAliasDescHeuristic(keyDesc);

  return {
    source,
    keyDesc,
    aliasDesc
  };
}
