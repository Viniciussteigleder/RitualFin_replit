"use client";

import { getCategoryConfig } from "@/lib/constants/categories";
import { getCategoryColor, getCategoryBgStyle, shouldUseWhiteText } from "@/lib/utils/category-colors";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  categoryName: string | null;
  variant?: "default" | "outline" | "solid";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

/**
 * CategoryBadge - Standardized category indicator
 * Follows the design system's category color policy
 */
export function CategoryBadge({
  categoryName,
  variant = "default",
  size = "md",
  showIcon = false,
  className,
}: CategoryBadgeProps) {
  const config = getCategoryConfig(categoryName);
  const color = getCategoryColor(categoryName);
  const Icon = config.lucideIcon;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  if (variant === "solid") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-lg font-semibold uppercase tracking-wide transition-all",
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: color,
          color: shouldUseWhiteText(categoryName, "strong") ? "#FFFFFF" : "#000000",
        }}
      >
        {showIcon && <Icon className={iconSizes[size]} strokeWidth={2.5} />}
        <span>{config.displayName}</span>
      </div>
    );
  }

  if (variant === "outline") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-lg font-semibold uppercase tracking-wide border-2 bg-transparent transition-all",
          sizeClasses[size],
          className
        )}
        style={{
          borderColor: color,
          color: color,
        }}
      >
        {showIcon && <Icon className={iconSizes[size]} strokeWidth={2.5} />}
        <span>{config.displayName}</span>
      </div>
    );
  }

  // Default variant: soft background
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg font-semibold uppercase tracking-wide transition-all",
        sizeClasses[size],
        className
      )}
      style={{
        ...getCategoryBgStyle(categoryName, "soft"),
        color: color,
      }}
    >
      {showIcon && <Icon className={iconSizes[size]} strokeWidth={2.5} />}
      <span>{config.displayName}</span>
    </div>
  );
}
