"use client";

import { useState, useEffect, useTransition } from "react";
import { AnalyticsDrillDown } from "@/components/analytics/analytics-drill-down";
import { AnalyticsFiltersPanel } from "@/components/analytics/analytics-filters";
import { MonthByMonthInsight, TopListInsight } from "@/components/analytics/analytics-insights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAnalyticsData,
  getAnalyticsMonthByMonth,
  getAnalyticsRecurringSummary,
  getAnalyticsTopMerchants,
  getAccounts,
  AnalyticsFilters,
  DrillDownData,
  MonthByMonthRow,
  TopAggregateRow,
} from "@/lib/actions/analytics";
import { startOfMonth, endOfMonth } from "date-fns";
import { ArrowDown, BarChart3, Calendar, ChevronRight, Home, Loader2, Repeat, Rows3 } from "lucide-react";

interface LevelData {
  level: "appCategory" | "category1" | "category2" | "category3" | "transactions";
  data: DrillDownData;
  title: string;
  parentValue: string;
}

export function AnalyticsContent() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [monthByMonth, setMonthByMonth] = useState<MonthByMonthRow[]>([]);
  const [topMerchants, setTopMerchants] = useState<TopAggregateRow[]>([]);
  const [recurringSummary, setRecurringSummary] = useState<TopAggregateRow[]>([]);
  const [activeTab, setActiveTab] = useState<"drilldown" | "month" | "top" | "recurring">("drilldown");
  const [isPending, startTransition] = useTransition();

  const loadInitialData = async () => {
    const [result, monthRows, topRows, recurringRows] = await Promise.all([
      getAnalyticsData(filters),
      getAnalyticsMonthByMonth(filters),
      getAnalyticsTopMerchants(filters, 12),
      getAnalyticsRecurringSummary(filters, 12),
    ]);
    setLevels([
      {
        level: "appCategory",
        data: result,
        title: "Categorias (App)",
        parentValue: "",
      },
    ]);
    setMonthByMonth(monthRows);
    setTopMerchants(topRows);
    setRecurringSummary(recurringRows);
  };

  const loadAccounts = async () => {
    const result = await getAccounts();
    setAccounts(result);
  };

  // Load initial data
  useEffect(() => {
    void loadInitialData();
    void loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: load once on mount
  }, []);

  const handleFiltersChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
    startTransition(async () => {
      const [result, monthRows, topRows, recurringRows] = await Promise.all([
        getAnalyticsData(newFilters),
        getAnalyticsMonthByMonth(newFilters),
        getAnalyticsTopMerchants(newFilters, 12),
        getAnalyticsRecurringSummary(newFilters, 12),
      ]);
      
      // Reset to category level when filters change
      setLevels([
        {
          level: "appCategory",
          data: result,
          title: "Categorias (App)",
          parentValue: "",
        },
      ]);
      setMonthByMonth(monthRows);
      setTopMerchants(topRows);
      setRecurringSummary(recurringRows);
    });
  };

  const handleDrillDown = async (currentLevel: string, value: string) => {
    const newFilters = { ...filters };
    let nextLevel: LevelData["level"] = "appCategory";
    let title = "";

    if (currentLevel === "appCategory") {
      newFilters.appCategory = value;
      nextLevel = "category1";
      title = `${value} • Categoria 1`;
    } else if (currentLevel === "category1") {
      newFilters.category1 = value;
      nextLevel = "category2";
      title = `${value} • Categoria 2`;
    } else if (currentLevel === "category2") {
      newFilters.category2 = value;
      nextLevel = "category3";
      title = `${value} • Categoria 3`;
    } else if (currentLevel === "category3") {
      newFilters.category3 = value;
      nextLevel = "transactions";
      title = `${value} • Transações`;
    }

    setFilters(newFilters);
    
    startTransition(async () => {
      const [result, monthRows, topRows, recurringRows] = await Promise.all([
        getAnalyticsData(newFilters),
        getAnalyticsMonthByMonth(newFilters),
        getAnalyticsTopMerchants(newFilters, 12),
        getAnalyticsRecurringSummary(newFilters, 12),
      ]);
      
      // Find the index of the current level
      const currentLevelIndex = levels.findIndex((l) => l.level === currentLevel);
      
      // Keep all levels up to and including the current level, then add the new level
      const newLevels = [
        ...levels.slice(0, currentLevelIndex + 1),
        {
          level: nextLevel as any,
          data: result,
          title,
          parentValue: value,
        },
      ];
      
      setLevels(newLevels);
      setMonthByMonth(monthRows);
      setTopMerchants(topRows);
      setRecurringSummary(recurringRows);
    });
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Reset to category level
      setFilters({
        startDate: filters.startDate,
        endDate: filters.endDate,
        accountId: filters.accountId,
        type: filters.type,
        fixVar: filters.fixVar,
        recurring: filters.recurring,
      });
      setLevels([levels[0]]);
    } else {
      // Remove all levels after the clicked index
      setLevels(levels.slice(0, index + 1));
      
      // Update filters accordingly
      const newFilters = { ...filters };
      if (index === 0) {
        delete newFilters.appCategory;
        delete newFilters.category1;
        delete newFilters.category2;
        delete newFilters.category3;
      } else if (index === 1) {
        delete newFilters.category1;
        delete newFilters.category2;
        delete newFilters.category3;
      } else if (index === 2) {
        delete newFilters.category2;
        delete newFilters.category3;
      } else if (index === 3) {
        delete newFilters.category3;
      }
      setFilters(newFilters);
    }
  };

  const scrollToLevel = (index: number) => {
    const el = document.getElementById(`analytics-level-${index}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (levels.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
          <p className="text-gray-600 font-medium">A carregar análise...</p>
        </div>
      </div>
    );
  }

  // Extract unique categories from data for filter
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TabsList className="bg-card/70 border border-border rounded-3xl p-2 h-auto shadow-sm">
            <TabsTrigger value="drilldown" className="rounded-2xl px-4 py-2 font-black gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Rows3 className="w-4 h-4" />
              Drill-down
            </TabsTrigger>
            <TabsTrigger value="month" className="rounded-2xl px-4 py-2 font-black gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4" />
              Mês a mês
            </TabsTrigger>
            <TabsTrigger value="top" className="rounded-2xl px-4 py-2 font-black gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              Top gastos
            </TabsTrigger>
            <TabsTrigger value="recurring" className="rounded-2xl px-4 py-2 font-black gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Repeat className="w-4 h-4" />
              Recorrentes
            </TabsTrigger>
          </TabsList>

          {isPending && (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-secondary/40 border border-border text-xs font-bold text-muted-foreground tabular-nums">
              <Loader2 className="w-4 h-4 animate-spin" />
              Atualizando
            </div>
          )}
        </div>

        <TabsContent value="drilldown" className="mt-0 space-y-6">
          {/* Breadcrumb Navigation */}
          {levels.length > 1 && (
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-border">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <button
                    onClick={() => handleBreadcrumbClick(-1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-50/60 transition-all duration-300 text-muted-foreground hover:text-emerald-700 font-bold"
                  >
                    <Home className="w-4 h-4" />
                    <span>Início</span>
                  </button>

                  {levels.slice(1).map((level, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                      <button
                        onClick={() => handleBreadcrumbClick(index + 1)}
                        className="px-3 py-1.5 rounded-lg hover:bg-emerald-50/60 transition-all duration-300 text-muted-foreground hover:text-emerald-700 font-black"
                      >
                        {level.parentValue}
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollToLevel(levels.length - 1)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 transition-all duration-300 font-black shadow-sm"
                  title="Ir para o próximo nível"
                >
                  Próximo nível
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <AnalyticsFiltersPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            accounts={accounts}
          />

          {/* Cascading Drill-Down Visualization - All Levels Stacked */}
          {levels.map((levelData, index) => (
            <div
              key={`${levelData.level}-${index}`}
              id={`analytics-level-${index}`}
              className="animate-in slide-in-from-bottom-4 duration-500"
            >
              <AnalyticsDrillDown
                data={levelData.data}
                onDrillDown={handleDrillDown}
                filters={filters}
                title={levelData.title}
                level={levelData.level}
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="month" className="mt-0">
          <MonthByMonthInsight rows={monthByMonth} />
        </TabsContent>

        <TabsContent value="top" className="mt-0">
          <TopListInsight title="Top gastos (por comerciante)" rows={topMerchants} emptyText="Sem dados para o período selecionado." />
        </TabsContent>

        <TabsContent value="recurring" className="mt-0">
          <TopListInsight title="Recorrentes (por comerciante)" rows={recurringSummary} emptyText="Sem recorrentes no período selecionado." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
