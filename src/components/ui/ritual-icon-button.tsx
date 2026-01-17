import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RitualIconButtonProps {
  icon: LucideIcon;
  variant?: "solid" | "gradient";
  color?: string; // Hex color for the background
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function RitualIconButton({
  icon: Icon,
  variant = "solid",
  color = "#10b981", // Default to brand green
  className,
  iconClassName,
  onClick,
  selected = false,
}: RitualIconButtonProps) {
  const isDark = (color: string) => {
    // Basic luminance check to decide icon color (though request says icon: white)
    return true; // We always use white as per spec
  };

  const bgStyle = variant === "gradient" 
    ? { backgroundImage: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)` }
    : { backgroundColor: color };

  return (
    <button
      onClick={onClick}
      className={cn(
        "ritual-icon-button",
        selected && "ritual-icon-button-selected",
        className
      )}
      style={bgStyle}
    >
      <Icon
        className={cn("w-6 h-6 text-white", iconClassName)}
        strokeWidth={2}
      />
    </button>
  );
}
