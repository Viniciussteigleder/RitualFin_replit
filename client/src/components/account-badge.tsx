import { CreditCard, Landmark, Wallet, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/use-locale";
import { accountBadgeCopy, t as translate } from "@/lib/i18n";

interface Account {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
  accountNumber?: string;
}

interface AccountBadgeProps {
  account: Account | null | undefined;
  className?: string;
  showIcon?: boolean;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const ICON_MAP: Record<string, any> = {
  "credit-card": CreditCard,
  "landmark": Landmark,
  "wallet": Wallet,
  "coins": Coins,
};

export function AccountBadge({
  account,
  className,
  showIcon = true,
  iconOnly = false,
  size = "md"
}: AccountBadgeProps) {
  const locale = useLocale();
  if (!account) {
    return iconOnly ? null : (
      <span className={cn("text-xs text-muted-foreground", className)}>
        {translate(locale, accountBadgeCopy.noAccount)}
      </span>
    );
  }

  const IconComponent = ICON_MAP[account.icon || "credit-card"] || CreditCard;
  const color = account.color || "#6366f1";

  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4"
  };

  const containerSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-9 h-9"
  };

  if (iconOnly) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-lg",
          containerSizes[size],
          className
        )}
        style={{ backgroundColor: `${color}15` }}
        title={account.name}
      >
        <IconComponent
          className={iconSizes[size]}
          style={{ color }}
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center rounded-md px-2 py-1",
      sizeClasses[size],
      className
    )} style={{ backgroundColor: `${color}15` }}>
      {showIcon && (
        <IconComponent
          className={iconSizes[size]}
          style={{ color }}
        />
      )}
      <span
        className="font-medium"
        style={{ color }}
      >
        {account.name}
      </span>
    </div>
  );
}
