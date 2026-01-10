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
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-12 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white tracking-tight">
                  Análise Financeira
                </h1>
                <p className="text-emerald-100 text-lg mt-2 font-medium">
                  Explore seus gastos em profundidade com drill-down interativo
                </p>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Visualização</p>
                    <p className="text-white text-lg font-bold">Multi-nível</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-emerald-200" />
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Drill-Down</p>
                    <p className="text-white text-lg font-bold">4 Níveis</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Export</p>
                    <p className="text-white text-lg font-bold">Excel</p>
                  </div>
                </div>
              </div>
            </div>
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
