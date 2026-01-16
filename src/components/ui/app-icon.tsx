import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AppIconTone =
  | "emerald"
  | "blue"
  | "violet"
  | "amber"
  | "rose"
  | "slate";

type AppIconSize = "sm" | "md" | "lg";

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

const TONES: Record<AppIconTone, { tint: string }> = {
  emerald: { tint: "#10B981" },
  blue: { tint: "#3B82F6" },
  violet: { tint: "#8B5CF6" },
  amber: { tint: "#F59E0B" },
  rose: { tint: "#F43F5E" },
  slate: { tint: "#64748B" },
};

const SIZE: Record<AppIconSize, { box: string; icon: string }> = {
  sm: { box: "h-9 w-9 rounded-2xl", icon: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-2xl", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12 rounded-[1.25rem]", icon: "h-6 w-6" },
};

export function AppIcon({
  icon: Icon,
  tone = "slate",
  size = "md",
  className,
  iconClassName,
  active = false,
}: {
  icon: LucideIcon;
  tone?: AppIconTone;
  size?: AppIconSize;
  className?: string;
  iconClassName?: string;
  active?: boolean;
}) {
  const tint = TONES[tone].tint;
  const bg = `linear-gradient(135deg, ${hexToRgba(tint, active ? 0.42 : 0.28)} 0%, ${hexToRgba(
    tint,
    active ? 0.14 : 0.1
  )} 55%, rgba(255,255,255,0.0) 100%)`;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center border shadow-sm overflow-hidden",
        "bg-white/70 dark:bg-white/5 backdrop-blur-sm",
        SIZE[size].box,
        className
      )}
      style={{
        borderColor: hexToRgba(tint, active ? 0.32 : 0.22),
        boxShadow: `0 18px 40px -26px ${hexToRgba(tint, active ? 0.7 : 0.55)}`,
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0" style={{ backgroundImage: bg }} aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 1px 0 ${hexToRgba("#FFFFFF", 0.55)}, inset 0 -1px 0 ${hexToRgba(tint, 0.18)}`,
        }}
        aria-hidden="true"
      />
      <Icon
        className={cn("relative z-10", SIZE[size].icon, iconClassName)}
        style={{ color: active ? tint : hexToRgba(tint, 0.95) }}
        strokeWidth={2.4}
      />
    </div>
  );
}

