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
import { CategoryIcon } from "@/components/ui/category-icon";

interface AnalyticsDrillDownProps {
  data: DrillDownData;
  onDrillDown: (level: string, value: string) => void;
  filters: AnalyticsFilters;
  title: string;
  level: "appCategory" | "category1" | "category2" | "category3" | "transactions";
}

// Fallback colors if category not found in config
const FALLBACK_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f97316", "#6366f1", "#84cc16", "#06b6d4", "#a855f7",
];

// Get color for a category
const getCategoryColor = (category: string, index: number): string => {
  const config = getCategoryConfig(category);
  // Use the color property directly (it's already a hex value)
  return config.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
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
    return (
      <div className="group">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <CategoryIcon category={item.category} size="md" className="transition-transform group-hover:scale-105" />

          {/* Main Bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-black text-foreground group-hover:text-emerald-700 transition-colors">
                {item.category}
              </span>
              <div className="flex items-center gap-4">
                <span className="font-black text-foreground tabular-nums">
                  €{item.total.toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground w-12 text-right tabular-nums font-bold">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-secondary/60 rounded-full overflow-hidden">
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
      <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {data.transactions.length} transações encontradas
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl hover:bg-emerald-100/80 transition-all duration-300 font-black shadow-sm"
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
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-background/60 px-3 py-1 rounded-full border border-border/50">
                  {format(new Date(dateKey), "dd 'de' MMMM, yyyy", { locale: pt })}
                </span>
                <div className="h-px flex-1 bg-border/50"></div>
              </div>

              <div className="grid gap-2">
                {groupedTransactions[dateKey].map((tx) => (
                  <div
                    key={tx.id}
                    className="group relative flex items-center justify-between p-4 rounded-2xl bg-background/60 border border-border hover:border-emerald-200/60 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Date Box */}
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-secondary/40 group-hover:bg-emerald-50/60 transition-colors border border-border group-hover:border-emerald-200/60">
                        <span className="text-sm font-black text-foreground group-hover:text-emerald-700">
                          {format(new Date(tx.paymentDate), "dd")}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          {format(new Date(tx.paymentDate), "MMM", { locale: pt })}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-0.5">
                        <div className="font-black text-foreground group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {tx.aliasDesc || tx.descNorm}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {tx.category1 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary/60 text-muted-foreground font-bold">
                              {tx.category1}
                            </span>
                          )}
                           {tx.recurringFlag && (
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
                            tx.amount < 0 ? "text-foreground group-hover:text-red-600 transition-colors" : "text-emerald-600"
                          }`}
                        >
                          {tx.amount < 0 ? "-" : "+"}€{Math.abs(tx.amount).toFixed(2)}
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${
                          tx.amount < 0 ? "bg-secondary/40 group-hover:bg-red-50/60" : "bg-emerald-50/60"
                        } transition-colors`}>
                        {tx.amount < 0 ? (
                            <TrendingDown className={`w-4 h-4 ${
                                tx.amount < 0 ? "text-muted-foreground group-hover:text-red-500 transition-colors" : "text-emerald-500"
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
      <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-border text-center py-16">
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
  const hasChildren = level !== "category3"; // Category 3 goes to transactions

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-border hover:shadow-md transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-foreground tracking-tight">{title}</h3>
          <p className="text-muted-foreground mt-1 font-semibold">
            €{total.toFixed(2)} • {chartData.reduce((sum, d) => sum + d.count, 0)} transações
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl hover:bg-emerald-100/80 transition-all duration-300 font-black"
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
              <circle cx="100" cy="100" r="50" fill="hsl(var(--background))" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-3xl font-black text-foreground">
                €{total.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold">
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
          <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
              <p className="text-muted-foreground font-bold">Carregando...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
