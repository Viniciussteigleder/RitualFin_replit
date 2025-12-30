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
  type LucideIcon,
} from "lucide-react";

// ============================================================================
// ACCOUNT ICONS
// ============================================================================

export const ACCOUNT_ICONS: Record<string, { icon: LucideIcon; color: string; label: string }> = {
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
export function getAccountIcon(accountName?: string): { icon: LucideIcon; color: string; label: string } {
  if (!accountName) return ACCOUNT_ICONS.default;

  const normalized = accountName.toLowerCase();

  if (normalized.includes("sparkasse")) return ACCOUNT_ICONS.sparkasse;
  if (normalized.includes("amex") || normalized.includes("american express")) return ACCOUNT_ICONS.amex;
  if (normalized.includes("miles") || normalized.includes("dkb")) return ACCOUNT_ICONS["miles-more"];
  if (normalized.includes("paypal")) return ACCOUNT_ICONS.paypal;

  return ACCOUNT_ICONS.default;
}

// ============================================================================
// TRANSACTION ATTRIBUTE ICONS
// ============================================================================

export const TRANSACTION_ICONS = {
  income: {
    icon: ArrowUpCircle,
    color: "#10B981", // Green
    label: "Receita",
  },
  expense: {
    icon: ArrowDownCircle,
    color: "#EF4444", // Red
    label: "Despesa",
  },
  fixed: {
    icon: Lock,
    color: "#8B5CF6", // Purple
    label: "Fixo",
  },
  variable: {
    icon: RefreshCw,
    color: "#F59E0B", // Amber
    label: "Variável",
  },
  recurring: {
    icon: RotateCcw,
    color: "#3B82F6", // Blue
    label: "Recorrente",
  },
  refund: {
    icon: RotateCcw,
    color: "#10B981", // Green
    label: "Reembolso",
  },
  internal: {
    icon: ArrowLeftRight,
    color: "#6B7280", // Gray
    label: "Interna",
  },
};

// ============================================================================
// STATUS ICONS
// ============================================================================

export const STATUS_ICONS = {
  unclassified: {
    icon: AlertCircle,
    color: "#F59E0B", // Amber
    label: "Não classificado",
  },
  lowConfidence: {
    icon: HelpCircle,
    color: "#F97316", // Orange
    label: "Baixa confiança",
  },
  confirmed: {
    icon: CheckCircle2,
    color: "#10B981", // Green
    label: "Confirmado",
  },
  needsReview: {
    icon: AlertCircle,
    color: "#EF4444", // Red
    label: "Requer revisão",
  },
};

/**
 * Get status icon based on transaction state
 */
export function getStatusIcon(transaction: {
  needsReview?: boolean;
  manualOverride?: boolean;
  confidence?: number;
}): { icon: LucideIcon; color: string; label: string } {
  if (transaction.needsReview) return STATUS_ICONS.needsReview;
  if (transaction.manualOverride) return STATUS_ICONS.confirmed;
  if (transaction.confidence !== undefined) {
    if (transaction.confidence >= 80) return STATUS_ICONS.confirmed;
    if (transaction.confidence >= 50) return STATUS_ICONS.lowConfidence;
  }
  return STATUS_ICONS.unclassified;
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
 * Get merchant icon URL from merchant-icons.ts registry
 * This integrates with the existing merchant icon system
 */
export function getMerchantIconUrl(merchantName?: string): string | null {
  if (!merchantName) return null;

  // This will be integrated with the existing merchant-icons.ts
  // For now, return null and let the merchant-icons system handle it
  return null;
}
