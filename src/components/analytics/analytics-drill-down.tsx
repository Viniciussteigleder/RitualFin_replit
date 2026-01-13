"use client";

import { useTransition } from "react";
import { CategoryAggregate, DrillDownData, AnalyticsFilters } from "@/lib/actions/analytics";
import { ChevronRight, Download, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { exportFullDataset } from "@/lib/actions/export";
import { toast } from "sonner";
import { getCategoryConfig } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";

interface AnalyticsDrillDownProps {
  data: DrillDownData;
  onDrillDown: (level: string, value: string) => void;
  filters: AnalyticsFilters;
  title: string;
  level: "category" | "level1" | "level2" | "level3" | "transactions";
}

// Fallback colors if category not found in config
const FALLBACK_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f97316", "#6366f1", "#84cc16", "#06b6d4", "#a855f7",
];

// Get color for a category
const getCategoryColor = (category: string, index: number): string => {
  const config = getCategoryConfig(category);
  // Extract hex from Tailwind class (simplified - use fallback if not found)
  const colorMap: Record<string, string> = {
    "text-orange-600": "#ea580c",
    "text-emerald-600": "#059669",
    "text-blue-600": "#2563eb",
    "text-slate-600": "#475569",
    "text-purple-600": "#9333ea",
    "text-pink-600": "#db2777",
    "text-red-600": "#dc2626",
    "text-indigo-600": "#4f46e5",
    "text-green-600": "#16a34a",
    "text-amber-600": "#d97706",
    "text-gray-600": "#4b5563",
    "text-yellow-600": "#ca8a04",
    "text-neutral-600": "#525252",
  };
  return colorMap[config.textColor] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

export function AnalyticsDrillDown({ data, onDrillDown, filters, title, level }: AnalyticsDrillDownProps) {
  const [isPending, startTransition] = useTransition();

// ... inside component
  const handleExportExcel = async () => {
      try {
        toast.info("Iniciando exportação completa...");
        const result = await exportFullDataset(filters);
        
        if (result.success && result.data) {
            // Create Blob from Base64
            const byteCharacters = atob(result.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = result.filename || "export.xlsx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            toast.success("Download iniciado!");
        } else {
            toast.error("Erro na exportação: " + result.error);
        }
      } catch (error) {
          console.error(error);
          toast.error("Erro inesperado ao exportar.");
      }
  };

  const renderCategoryBar = (
    item: CategoryAggregate & { color: string; config: ReturnType<typeof getCategoryConfig> },
    hasChildren: boolean
  ) => {
    const CatIcon = item.config.lucideIcon;
    return (
      <div className="group">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              item.config.bgColor
            )}
          >
            <CatIcon className={cn("w-5 h-5", item.config.textColor)} />
          </div>

          {/* Main Bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                {item.category}
              </span>
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900 tabular-nums">
                  €{item.total.toFixed(0)}
                </span>
                <span className="text-sm text-gray-500 w-12 text-right tabular-nums">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                style={{
                  width: `${Math.max(item.percentage, 2)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>

          {/* Expand Button */}
          {hasChildren && (
            <button
              onClick={() => onDrillDown(level, item.category)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0"
              title="Expandir próximo nível"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Show transactions list if this is the transactions level
  if (data.transactions && data.transactions.length > 0) {
    // Group transactions by date
    const groupedTransactions = data.transactions.reduce((groups: Record<string, any[]>, tx) => {
      const dateKey = format(new Date(tx.paymentDate), "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
      return groups;
    }, {});

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100/50">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {data.transactions.length} transações encontradas
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all duration-300 font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>

        <div className="space-y-8">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/50"></div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-white/50 px-3 py-1 rounded-full border border-border/50">
                  {format(new Date(dateKey), "dd 'de' MMMM, yyyy", { locale: pt })}
                </span>
                <div className="h-px flex-1 bg-border/50"></div>
              </div>

              <div className="grid gap-2">
                {groupedTransactions[dateKey].map((tx) => (
                  <div
                    key={tx.id}
                    className="group relative flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-emerald-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Date Box */}
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-emerald-50 transition-colors border border-gray-100 group-hover:border-emerald-100">
                        <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">
                          {format(new Date(tx.paymentDate), "dd")}
                        </span>
                        <span className="text-[10px] font-medium text-gray-500 uppercase">
                          {format(new Date(tx.paymentDate), "MMM", { locale: pt })}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-0.5">
                        <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {tx.aliasDesc || tx.descNorm}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {tx.category1 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                              {tx.category1}
                            </span>
                          )}
                           {tx.recurrent && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium">
                              Recorrente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-4 pl-4">
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold tabular-nums tracking-tight ${
                            tx.amount < 0 ? "text-gray-900 group-hover:text-red-600 transition-colors" : "text-emerald-600"
                          }`}
                        >
                          {tx.amount < 0 ? "-" : "+"}€{Math.abs(tx.amount).toFixed(2)}
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${
                          tx.amount < 0 ? "bg-gray-50 group-hover:bg-red-50" : "bg-emerald-50"
                        } transition-colors`}>
                        {tx.amount < 0 ? (
                            <TrendingDown className={`w-4 h-4 ${
                                tx.amount < 0 ? "text-gray-400 group-hover:text-red-500 transition-colors" : "text-emerald-500"
                            }`} />
                        ) : (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show chart for category levels
  if (data.aggregates.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100/50 text-center py-16">
        <p className="text-muted-foreground">Nenhum dado encontrado para este período.</p>
      </div>
    );
  }

  // Use all aggregates (not just 12) for better visibility
  const chartData = data.aggregates.map((item, index) => ({
    ...item,
    color: getCategoryColor(item.category, index),
    config: getCategoryConfig(item.category),
  }));

  const total = chartData.reduce((sum, d) => sum + d.total, 0);
  const hasChildren = level !== "level3"; // Level 3 goes to transactions

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h3>
          <p className="text-gray-500 mt-1 font-medium">
            €{total.toFixed(2)} • {chartData.reduce((sum, d) => sum + d.count, 0)} transações
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all duration-300 font-medium"
        >
          <Download className="w-4 h-4" />
          Excel
        </button>
      </div>

      {/* Chart Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 200 200" className="transform -rotate-90">
              {(() => {
                let currentAngle = 0;
                return chartData.map((item, index) => {
                  const percentage = item.percentage;
                  const angle = (percentage / 100) * 360;
                  const startAngle = currentAngle;
                  currentAngle += angle;

                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (currentAngle * Math.PI) / 180;

                  const x1 = 100 + 80 * Math.cos(startRad);
                  const y1 = 100 + 80 * Math.sin(startRad);
                  const x2 = 100 + 80 * Math.cos(endRad);
                  const y2 = 100 + 80 * Math.sin(endRad);

                  const largeArc = angle > 180 ? 1 : 0;

                  return (
                    <path
                      key={index}
                      d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={item.color}
                      className="hover:opacity-80 transition-all duration-300"
                      style={{ transformOrigin: "center" }}
                    />
                  );
                });
              })()}
              <circle cx="100" cy="100" r="50" fill="white" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-3xl font-bold text-gray-900">
                €{total.toFixed(0)}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Category Bars with Expand Buttons */}
        <div className="space-y-3">
          {chartData.map((item, index) => (
            <div key={index}>
              {renderCategoryBar(item, hasChildren)}
            </div>
          ))}
        </div>
      </div>

      {isPending && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
              <p className="text-gray-600 font-medium">Carregando...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
