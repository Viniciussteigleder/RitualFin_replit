import { getCategoryConfig } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";

type CategoryIconSize = "sm" | "md" | "lg";

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "").trim();
  const value = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) return `rgba(0,0,0,${alpha})`;

  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const SIZE_STYLES: Record<CategoryIconSize, { box: string; icon: string }> = {
  sm: { box: "h-8 w-8 rounded-xl", icon: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-2xl", icon: "h-5 w-5" },
  lg: { box: "h-14 w-14 rounded-[1.25rem]", icon: "h-7 w-7" },
};

export function CategoryIcon({
  category,
  size = "md",
  className,
  iconClassName,
}: {
  category: string | null | undefined;
  size?: CategoryIconSize;
  className?: string;
  iconClassName?: string;
}) {
  const config = getCategoryConfig(category ?? "OPEN");
  const Icon = config.lucideIcon;
  const tint = config.color || "#64748B";
  const gradient = `linear-gradient(135deg, ${hexToRgba(tint, 0.22)} 0%, ${hexToRgba(tint, 0.06)} 55%, rgba(255,255,255,0.0) 100%)`;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center border shadow-sm",
        "bg-white/70 dark:bg-white/5 backdrop-blur-sm overflow-hidden",
        SIZE_STYLES[size].box,
        className
      )}
      style={{
        borderColor: hexToRgba(tint, 0.22),
        boxShadow: `0 18px 40px -26px ${hexToRgba(tint, 0.6)}`,
      }}
      aria-label={config.displayName}
      title={config.displayName}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: gradient,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 1px 0 ${hexToRgba("#FFFFFF", 0.55)}, inset 0 -1px 0 ${hexToRgba(tint, 0.18)}`,
        }}
        aria-hidden="true"
      />
      <Icon
        className={cn("relative z-10", SIZE_STYLES[size].icon, iconClassName)}
        style={{ color: tint }}
        strokeWidth={2.4}
        aria-hidden="true"
      />
    </div>
  );
}
