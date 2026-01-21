"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircle } from "lucide-react";

interface GlossaryPopoverProps {
  term: string;
  definition: string;
  example?: string;
}

export function GlossaryPopover({ term, definition, example }: GlossaryPopoverProps) {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <button className="inline-flex items-center gap-1 text-primary font-medium border-b border-dashed border-primary/50 hover:border-primary transition-colors cursor-help">
          {term}
          <HelpCircle className="h-3 w-3 opacity-60" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4" side="top">
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-foreground">{term}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{definition}</p>
          {example && (
            <div className="mt-3 p-2 bg-secondary/50 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Exemplo:</span> {example}
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
