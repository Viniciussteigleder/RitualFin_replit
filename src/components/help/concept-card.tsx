"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConceptCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  example?: string;
  className?: string;
  iconColor?: string;
}

export function ConceptCard({ 
  icon: Icon, 
  title, 
  description, 
  example,
  className,
  iconColor = "#059669"
}: ConceptCardProps) {
  return (
    <div className={cn(
      "p-6 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-all duration-200 hover:shadow-md",
      className
    )}>
      <div className="flex items-start gap-4">
        <div 
          className="p-3 rounded-lg shrink-0"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          {example && (
            <div className="mt-3 p-3 bg-secondary/50 rounded-lg border border-border">
              <p className="text-xs font-mono text-muted-foreground">
                <span className="font-semibold text-foreground">Exemplo:</span> {example}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
