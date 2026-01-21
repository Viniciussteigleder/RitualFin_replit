"use client";

import { ArrowRight, Check } from "lucide-react";

interface ExampleBeforeAfterCardProps {
  title: string;
  before: {
    description: string;
    category: string;
  };
  rule: {
    keywords: string[];
    targetCategory: string;
  };
  after: {
    category: string;
    impact: string;
  };
}

export function ExampleBeforeAfterCard({ title, before, rule, after }: ExampleBeforeAfterCardProps) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
      <h4 className="font-bold text-base text-foreground mb-4">{title}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Before */}
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="text-xs font-semibold text-destructive uppercase tracking-wide mb-2">Antes</div>
          <p className="text-sm font-mono text-foreground mb-2">{before.description}</p>
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
            {before.category}
          </div>
        </div>

        {/* Rule */}
        <div className="flex flex-col justify-center items-center p-4 rounded-lg bg-primary/5 border border-primary/20">
          <ArrowRight className="h-5 w-5 text-primary mb-2 md:hidden" />
          <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Regra Criada</div>
          <div className="space-y-1 w-full">
            {rule.keywords.map((keyword, idx) => (
              <div key={idx} className="text-xs font-mono bg-primary/10 px-2 py-1 rounded text-primary text-center">
                {keyword}
              </div>
            ))}
          </div>
          <ArrowRight className="h-5 w-5 text-primary mt-2" />
          <div className="text-xs text-muted-foreground mt-1 text-center">{rule.targetCategory}</div>
        </div>

        {/* After */}
        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Depois
          </div>
          <p className="text-sm font-mono text-foreground mb-2">{before.description}</p>
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 text-xs font-medium mb-2">
            {after.category}
          </div>
          <p className="text-xs text-muted-foreground italic">{after.impact}</p>
        </div>
      </div>
    </div>
  );
}
