import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlight" | "danger";
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300",
          {
            "hover:bg-white/10 hover:shadow-lg hover:shadow-white/5 hover:-translate-y-1 cursor-pointer": interactive,
            "bg-gradient-to-br from-white/10 to-transparent": variant === "default",
            "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20": variant === "highlight",
            "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20": variant === "danger",
          },
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";
