/**
 * Comprehensive Icon System for RitualFin
 *
 * Defines all icons used throughout the application for:
 * - Account types (banks/cards)
 * - Transaction attributes (fixed/variable, recurring, etc.)
 * - Status indicators
 * - Merchant branding
 */

import {
  CreditCard,
  Building2,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Lock,
  RefreshCw,
  RotateCcw,
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShoppingBag,
  Package,
  Film,
  Music,
  Car,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { iconCopy, Locale, t as translate } from "@/lib/i18n";

type IconConfig = { icon: LucideIcon; color: string; label: string };

// ============================================================================
// ACCOUNT ICONS
// ============================================================================

export const ACCOUNT_ICONS: Record<string, IconConfig> = {
  sparkasse: {
    icon: Building2,
    color: "#FF0000", // Sparkasse red
    label: "Sparkasse",
  },
  amex: {
    icon: CreditCard,
    color: "#006FCF", // Amex blue
    label: "American Express",
  },
  "miles-more": {
    icon: CreditCard,
    color: "#FFD700", // Gold for Miles & More
    label: "Miles & More",
  },
  dkb: {
    icon: CreditCard,
    color: "#0066CC", // DKB blue
    label: "DKB",
  },
  paypal: {
    icon: Wallet,
    color: "#003087", // PayPal blue
    label: "PayPal",
  },
  default: {
    icon: Wallet,
    color: "#6B7280", // Gray
    label: "Conta",
  },
};

/**
 * Get account icon configuration by account name or ID
 */
export function getAccountIcon(accountName?: string, locale: Locale = "pt-BR"): IconConfig {
  if (!accountName) {
    return {
      ...ACCOUNT_ICONS.default,
      label: translate(locale, iconCopy.accountDefault),
    };
  }

  const normalized = accountName.toLowerCase();

  if (normalized.includes("sparkasse")) return ACCOUNT_ICONS.sparkasse;
  if (normalized.includes("amex") || normalized.includes("american express")) return ACCOUNT_ICONS.amex;
  if (normalized.includes("miles") || normalized.includes("dkb")) return ACCOUNT_ICONS["miles-more"];
  if (normalized.includes("paypal")) return ACCOUNT_ICONS.paypal;

  return {
    ...ACCOUNT_ICONS.default,
    label: translate(locale, iconCopy.accountDefault),
  };
}

// ============================================================================
// TRANSACTION ATTRIBUTE ICONS
// ============================================================================

const TRANSACTION_ICON_DEFS = {
  income: {
    icon: ArrowUpCircle,
    color: "#10B981", // Green
  },
  expense: {
    icon: ArrowDownCircle,
    color: "#EF4444", // Red
  },
  fixed: {
    icon: Lock,
    color: "#8B5CF6", // Purple
  },
  variable: {
    icon: RefreshCw,
    color: "#F59E0B", // Amber
  },
  recurring: {
    icon: RotateCcw,
    color: "#3B82F6", // Blue
  },
  refund: {
    icon: RotateCcw,
    color: "#10B981", // Green
  },
  internal: {
    icon: ArrowLeftRight,
    color: "#6B7280", // Gray
  },
};

export function getTransactionIcons(locale: Locale): Record<keyof typeof TRANSACTION_ICON_DEFS, IconConfig> {
  return {
    income: {
      ...TRANSACTION_ICON_DEFS.income,
      label: translate(locale, iconCopy.transaction.income),
    },
    expense: {
      ...TRANSACTION_ICON_DEFS.expense,
      label: translate(locale, iconCopy.transaction.expense),
    },
    fixed: {
      ...TRANSACTION_ICON_DEFS.fixed,
      label: translate(locale, iconCopy.transaction.fixed),
    },
    variable: {
      ...TRANSACTION_ICON_DEFS.variable,
      label: translate(locale, iconCopy.transaction.variable),
    },
    recurring: {
      ...TRANSACTION_ICON_DEFS.recurring,
      label: translate(locale, iconCopy.transaction.recurring),
    },
    refund: {
      ...TRANSACTION_ICON_DEFS.refund,
      label: translate(locale, iconCopy.transaction.refund),
    },
    internal: {
      ...TRANSACTION_ICON_DEFS.internal,
      label: translate(locale, iconCopy.transaction.internal),
    },
  };
}

// ============================================================================
// STATUS ICONS
// ============================================================================

const STATUS_ICON_DEFS = {
  unclassified: {
    icon: AlertCircle,
    color: "#F59E0B", // Amber
  },
  lowConfidence: {
    icon: HelpCircle,
    color: "#F97316", // Orange
  },
  confirmed: {
    icon: CheckCircle2,
    color: "#10B981", // Green
  },
  needsReview: {
    icon: AlertCircle,
    color: "#EF4444", // Red
  },
};

function buildStatusIcon(locale: Locale, key: keyof typeof STATUS_ICON_DEFS): IconConfig {
  return {
    ...STATUS_ICON_DEFS[key],
    label: translate(locale, iconCopy.status[key]),
  };
}

/**
 * Get status icon based on transaction state
 */
export function getStatusIcon(transaction: {
  needsReview?: boolean;
  manualOverride?: boolean;
  confidence?: number;
}, locale: Locale): IconConfig {
  if (transaction.needsReview) return buildStatusIcon(locale, "needsReview");
  if (transaction.manualOverride) return buildStatusIcon(locale, "confirmed");
  if (transaction.confidence !== undefined) {
    if (transaction.confidence >= 80) return buildStatusIcon(locale, "confirmed");
    if (transaction.confidence >= 50) return buildStatusIcon(locale, "lowConfidence");
  }
  return buildStatusIcon(locale, "unclassified");
}

// ============================================================================
// ICON BADGE COMPONENT
// ============================================================================

interface IconBadgeProps {
  icon: LucideIcon;
  color: string;
  label?: string;
  size?: "xs" | "sm" | "md";
  showTooltip?: boolean;
}

export function IconBadge({
  icon: Icon,
  color,
  label,
  size = "sm",
  showTooltip = true,
}: IconBadgeProps) {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  const badge = (
    <div className="inline-flex items-center justify-center" title={showTooltip ? label : undefined}>
      <Icon className={sizeClasses[size]} style={{ color }} />
    </div>
  );

  return badge;
}

// ============================================================================
// MERCHANT ICON HELPERS
// ============================================================================

/**
 * Get merchant icon information based on merchant name
 * Returns icon component, color, and label for known merchants
 */
export function getMerchantIcon(description?: string): { icon: LucideIcon; color: string; label: string } | null {
  if (!description) return null;

  const desc = description.toLowerCase();

  // Common German merchants
  if (desc.includes('lidl')) return { icon: ShoppingBag, color: "#0050AA", label: "LIDL" };
  if (desc.includes('rewe')) return { icon: ShoppingBag, color: "#CC071E", label: "REWE" };
  if (desc.includes('edeka')) return { icon: ShoppingBag, color: "#006AB3", label: "EDEKA" };
  if (desc.includes('aldi')) return { icon: ShoppingBag, color: "#009EE3", label: "ALDI" };
  if (desc.includes('amazon')) return { icon: Package, color: "#FF9900", label: "Amazon" };
  if (desc.includes('paypal')) return { icon: CreditCard, color: "#003087", label: "PayPal" };
  if (desc.includes('netflix')) return { icon: Film, color: "#E50914", label: "Netflix" };
  if (desc.includes('spotify')) return { icon: Music, color: "#1DB954", label: "Spotify" };
  if (desc.includes('uber')) return { icon: Car, color: "#000000", label: "Uber" };
  if (desc.includes('mcdonald')) return { icon: Utensils, color: "#FFC72C", label: "McDonald's" };

  return null;
}

/**
 * Get merchant icon URL from merchant-icons.ts registry
 * This integrates with the existing merchant icon system
 */
export function getMerchantIconUrl(merchantName?: string): string | null {
  if (!merchantName) return null;

  // This will be integrated with the existing merchant-icons.ts
  // For now, return null and let the merchant-icons system handle it
  return null;
}
