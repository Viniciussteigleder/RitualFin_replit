"use client";

import { useState, useEffect, useTransition } from "react";
import { AnalyticsDrillDown } from "@/components/analytics/analytics-drill-down";
import { AnalyticsFiltersPanel } from "@/components/analytics/analytics-filters";
import {
  getAnalyticsData,
  getAccounts,
  AnalyticsFilters,
  DrillDownData,
} from "@/lib/actions/analytics";
import { startOfMonth, endOfMonth } from "date-fns";
import { Home, ChevronRight } from "lucide-react";

interface LevelData {
  level: "category" | "level1" | "level2" | "level3";
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
  const [isPending, startTransition] = useTransition();

  const loadInitialData = async () => {
    const result = await getAnalyticsData(filters);
    setLevels([
      {
        level: "category",
        data: result,
        title: "Categorias",
        parentValue: "",
      },
    ]);
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
      const result = await getAnalyticsData(newFilters);
      
      // Reset to category level when filters change
      setLevels([
        {
          level: "category",
          data: result,
          title: "Categorias",
          parentValue: "",
        },
      ]);
    });
  };

  const handleDrillDown = async (currentLevel: string, value: string) => {
    const newFilters = { ...filters };
    let nextLevel: "category" | "level1" | "level2" | "level3" | "transactions" = "category";
    let title = "";

    if (currentLevel === "category") {
      newFilters.category = value;
      nextLevel = "level1";
      title = `${value} - Nível 1`;
    } else if (currentLevel === "level1") {
      newFilters.level1 = value;
      nextLevel = "level2";
      title = `${value} - Nível 2`;
    } else if (currentLevel === "level2") {
      newFilters.level2 = value;
      newFilters.level3 = "ALL"; // Special flag to show all transactions for this leaf
      nextLevel = "transactions";
      title = `${value} - Transações`;
    } else if (currentLevel === "level3") {
      // This block might become unreachable but keeping for safety
      newFilters.level3 = value;
      nextLevel = "transactions";
      title = `${value} - Transações`;
    }

    setFilters(newFilters);
    
    startTransition(async () => {
      const result = await getAnalyticsData(newFilters);
      
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
        delete newFilters.category;
        delete newFilters.level1;
        delete newFilters.level2;
        delete newFilters.level3;
      } else if (index === 1) {
        delete newFilters.level1;
        delete newFilters.level2;
        delete newFilters.level3;
      } else if (index === 2) {
        delete newFilters.level2;
        delete newFilters.level3;
      } else if (index === 3) {
        delete newFilters.level3;
      }
      setFilters(newFilters);
    }
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
  const categories = Array.from(
    new Set(levels[0]?.data.aggregates.map((a) => a.category).filter(Boolean) || [])
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      {levels.length > 1 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100/50">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all duration-300 text-gray-600 hover:text-emerald-700 font-medium"
            >
              <Home className="w-4 h-4" />
              <span>Início</span>
            </button>

            {levels.slice(1).map((level, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <button
                  onClick={() => handleBreadcrumbClick(index + 1)}
                  className="px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all duration-300 text-gray-600 hover:text-emerald-700 font-semibold"
                >
                  {level.parentValue}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <AnalyticsFiltersPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        accounts={accounts}
        categories={categories}
      />

      {/* Cascading Drill-Down Visualization - All Levels Stacked */}
      {levels.map((levelData, index) => (
        <div
          key={`${levelData.level}-${index}`}
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
    </div>
  );
}
