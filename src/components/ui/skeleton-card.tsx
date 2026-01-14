"use client";

import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  variant?: "default" | "chart" | "list" | "stat";
}

export function SkeletonCard({ className, variant = "default" }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-secondary/50 border border-border/30",
        className
      )}
    >
      {variant === "stat" && (
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/80" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-secondary/80 rounded w-24" />
              <div className="h-2 bg-secondary/60 rounded w-16" />
            </div>
          </div>
          <div className="h-8 bg-secondary/80 rounded w-32" />
        </div>
      )}

      {variant === "chart" && (
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-secondary/80 rounded w-28" />
            <div className="h-8 bg-secondary/60 rounded w-24" />
          </div>
          <div className="h-48 bg-secondary/40 rounded-xl" />
        </div>
      )}

      {variant === "list" && (
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/80" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary/80 rounded w-3/4" />
                <div className="h-3 bg-secondary/60 rounded w-1/2" />
              </div>
              <div className="h-5 bg-secondary/70 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {variant === "default" && (
        <div className="p-6 space-y-4">
          <div className="h-5 bg-secondary/80 rounded w-1/3" />
          <div className="h-4 bg-secondary/60 rounded w-full" />
          <div className="h-4 bg-secondary/60 rounded w-2/3" />
        </div>
      )}
    </div>
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn("h-4 bg-secondary/60 rounded animate-pulse", className)} />
  );
}

export function SkeletonCircle({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={cn("rounded-full bg-secondary/60 animate-pulse", sizes[size], className)} />
  );
}
