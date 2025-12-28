import { CreditCard, Landmark, Wallet, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

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
  size = "md"
}: AccountBadgeProps) {
  if (!account) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Sem conta
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
