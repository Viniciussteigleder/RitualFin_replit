import { Suspense } from "react";
import { AnalyticsContent } from "./analytics-content";
import type { Metadata } from "next";
import { BarChart3, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Análise Financeira | RitualFin",
  description: "Análise detalhada de gastos com drill-down hierárquico",
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">
              Análise Financeira
            </h1>
            <p className="text-muted-foreground font-medium">
              Explore seus gastos com drill-down interativo e filtros avançados.
            </p>
          </div>
          
          {/* Stats Preview - Now more compact and secondary */}
          <div className="flex items-center gap-3">
             <div className="bg-white dark:bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-sm px-4">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Multi-nível</span>
             </div>
             <div className="bg-white dark:bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-sm px-4">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">4 Níveis</span>
             </div>
          </div>
        </div>

        <div className="h-px bg-border w-full"></div>

        {/* Content */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
                <p className="text-gray-600 font-medium">Carregando análise...</p>
              </div>
            </div>
          }
        >
          <AnalyticsContent />
        </Suspense>
      </div>
    </div>
  );
}
