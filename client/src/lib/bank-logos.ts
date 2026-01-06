/**
 * Bank Logo & Provider Metadata
 *
 * Maps bank/card providers to display metadata (logos, colors, icons).
 * Used for visual identification in uploads, accounts, and transactions.
 */

import { LucideIcon, CreditCard, Landmark, Wallet, Building2, Plane } from "lucide-react";

export interface BankProvider {
  id: string;
  name: string;
  displayName: string;
  icon: LucideIcon;
  color: string;
  logoUrl?: string;
  description?: string;
}

export const BANK_PROVIDERS: Record<string, BankProvider> = {
  "miles_and_more": {
    id: "miles_and_more",
    name: "Miles & More",
    displayName: "Miles & More Gold",
    icon: Plane,
    color: "#002654",
    logoUrl: "/providers/miles-and-more.svg",
    description: "Lufthansa Miles & More Credit Card"
  },
  "amex": {
    id: "amex",
    name: "American Express",
    displayName: "American Express",
    icon: CreditCard,
    color: "#006FCF",
    logoUrl: "/providers/american-express.svg",
    description: "American Express Credit Card"
  },
  "sparkasse": {
    id: "sparkasse",
    name: "Sparkasse",
    displayName: "Sparkasse",
    icon: Landmark,
    color: "#FF0000",
    logoUrl: "/providers/sparkasse.svg",
    description: "Sparkasse Bank Account"
  },
  "nubank": {
    id: "nubank",
    name: "Nubank",
    displayName: "Nubank",
    icon: CreditCard,
    color: "#820AD1",
    description: "Nubank Credit Card"
  },
  "revolut": {
    id: "revolut",
    name: "Revolut",
    displayName: "Revolut",
    icon: Wallet,
    color: "#0075EB",
    description: "Revolut Digital Bank"
  },
  "n26": {
    id: "n26",
    name: "N26",
    displayName: "N26",
    icon: Landmark,
    color: "#36A18B",
    description: "N26 Bank Account"
  },
  "wise": {
    id: "wise",
    name: "Wise",
    displayName: "Wise",
    icon: Wallet,
    color: "#9FE870",
    description: "Wise (TransferWise)"
  },
  "unknown": {
    id: "unknown",
    name: "Unknown",
    displayName: "Other Bank",
    icon: Building2,
    color: "#6b7280",
    description: "Unknown Bank or Card"
  }
};

/**
 * Detect bank provider from account source string or filename
 */
export function detectBankProvider(source: string): BankProvider {
  const normalized = source.toLowerCase();

  if (normalized.includes("miles") || normalized.includes("m&m")) {
    return BANK_PROVIDERS.miles_and_more;
  }

  if (normalized.includes("amex") || normalized.includes("american express")) {
    return BANK_PROVIDERS.amex;
  }

  if (normalized.includes("sparkasse")) {
    return BANK_PROVIDERS.sparkasse;
  }

  if (normalized.includes("nubank")) {
    return BANK_PROVIDERS.nubank;
  }

  if (normalized.includes("revolut")) {
    return BANK_PROVIDERS.revolut;
  }

  if (normalized.includes("n26")) {
    return BANK_PROVIDERS.n26;
  }

  if (normalized.includes("wise") || normalized.includes("transferwise")) {
    return BANK_PROVIDERS.wise;
  }

  return BANK_PROVIDERS.unknown;
}

/**
 * Get bank provider by ID (safe accessor with fallback)
 */
export function getBankProvider(id: string): BankProvider {
  return BANK_PROVIDERS[id] || BANK_PROVIDERS.unknown;
}
