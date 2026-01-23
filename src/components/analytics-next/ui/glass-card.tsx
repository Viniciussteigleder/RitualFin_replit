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
          // Base: Deep blur, very subtle border, noise-ready background
          "relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-2xl transition-all duration-300",
          {
            // Interactive: Subtler lift (-0.5), deep shadow, clearer border on hover
            "hover:bg-white/10 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-0.5 hover:border-white/10 cursor-pointer": interactive,
            
            // Variants
            "bg-gradient-to-br from-white/10 to-transparent": variant === "default",
            // Highlight: smoother radial-like gradient feel
            "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]": variant === "highlight",
            "bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/20": variant === "danger",
          },
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";
