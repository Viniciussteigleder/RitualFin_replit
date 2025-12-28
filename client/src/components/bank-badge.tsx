/**
 * BankBadge Component
 *
 * Displays bank/provider with icon and color branding.
 * Used in upload history, account cards, and transaction views.
 */

import { cn } from "@/lib/utils";
import { BankProvider, detectBankProvider, getBankProvider } from "@/lib/bank-logos";

interface BankBadgeProps {
  /** Bank provider ID or account source string for auto-detection */
  provider?: string | BankProvider;
  /** Visual size variant */
  size?: "sm" | "md" | "lg";
  /** Show full name or abbreviated */
  variant?: "full" | "icon" | "compact";
  className?: string;
}

export function BankBadge({ provider, size = "md", variant = "full", className }: BankBadgeProps) {
  // Resolve provider
  const bankProvider: BankProvider = typeof provider === "string"
    ? detectBankProvider(provider)
    : provider || detectBankProvider("");

  const Icon = bankProvider.icon;

  const sizeClasses = {
    sm: "h-6 px-2 gap-1.5 text-xs",
    md: "h-8 px-3 gap-2 text-sm",
    lg: "h-10 px-4 gap-2.5 text-base"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  if (variant === "icon") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-lg",
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: `${bankProvider.color}15` }}
        title={bankProvider.displayName}
      >
        <Icon className={iconSizes[size]} style={{ color: bankProvider.color }} />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full font-medium",
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: `${bankProvider.color}15`,
          color: bankProvider.color
        }}
      >
        <Icon className={iconSizes[size]} />
        <span className="truncate max-w-[120px]">{bankProvider.name}</span>
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg font-medium border",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${bankProvider.color}08`,
        borderColor: `${bankProvider.color}20`,
        color: bankProvider.color
      }}
    >
      <Icon className={iconSizes[size]} />
      <span className="truncate max-w-[180px]">{bankProvider.displayName}</span>
    </div>
  );
}
