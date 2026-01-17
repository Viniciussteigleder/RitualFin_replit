import { Suspense } from "react";
import { auth } from "@/auth";
import { AnalyticsContent } from "./analytics-content";
import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { ReRunRulesButton } from "@/components/transactions/re-run-rules-button";

export const metadata: Metadata = {
  title: "Análise Financeira | RitualFin",
  description: "Análise detalhada de gastos com drill-down hierárquico",
};

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para ver a análise.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-1 py-8 space-y-6">
        {/* Premium Card Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm animate-fade-in-up">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-2xl transition-transform duration-300 hover:scale-110">
                <BarChart3 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">
                Análise Total
              </h1>
            </div>
            <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
              Explore seus gastos com drill-down interativo e filtros avançados.
            </p>
          </div>

          {/* Stats Preview - Premium badges */}
          <div className="flex items-center gap-3">
            <ReRunRulesButton />
          </div>
        </div>

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

export const dynamic = 'force-dynamic';
