import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AppIcon - The new standard for Ritual icon buttons
 * Spec: 56x56px, 10px radius, no border, white icon (24px)
 */
export function AppIcon({
  icon: Icon,
  className,
  iconClassName,
  color = "#10b981", // Canonical color
  variant = "solid",
  selected = false,
}: {
  icon: LucideIcon;
  className?: string; // Container classes (size, rounded, etc)
  iconClassName?: string; // Icon size overrides
  color?: string;
  variant?: "solid" | "gradient";
  selected?: boolean;
}) {
  const bgStyle = variant === "gradient" 
    ? { backgroundImage: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)` }
    : { backgroundColor: color };

  return (
    <div
      className={cn(
        "ritual-icon-button w-14 h-14 shrink-0", // Default size 56px
        selected && "ritual-icon-button-selected shadow-md scale-[1.02]",
        className
      )}
      style={bgStyle}
      aria-hidden="true"
    >
      <Icon
        className={cn("w-[45%] h-[45%] text-white", iconClassName)} // Dynamic icon size
        strokeWidth={2}
      />
    </div>
  );
}

