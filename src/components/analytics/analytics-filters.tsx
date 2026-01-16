"use client";

import { useState } from "react";
import { AnalyticsFilters } from "@/lib/actions/analytics";
import {
  Filter,
  Calendar,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Repeat,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  accounts: any[];
}

export function AnalyticsFiltersPanel({
  filters,
  onFiltersChange,
  accounts,
}: AnalyticsFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);

  const updateFilter = (key: keyof AnalyticsFilters, value: any) => {
    const newFilters = { ...filters };
    if (value === "" || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    });
  };

  const setQuickPeriod = (period: "thisMonth" | "lastMonth" | "last3Months" | "thisYear") => {
    const now = new Date();
    let start: Date, end: Date;

    switch (period) {
      case "thisMonth":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "lastMonth":
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case "last3Months":
        start = startOfMonth(subMonths(now, 2));
        end = endOfMonth(now);
        break;
      case "thisYear":
        start = startOfYear(now);
        end = now;
        break;
    }

    onFiltersChange({ ...filters, startDate: start, endDate: end });
  };

  const activeFilterCount = Object.keys(filters).filter(
    (k) => !["appCategory", "category1", "category2", "category3", "startDate", "endDate"].includes(k)
  ).length;

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-sm border border-border overflow-hidden">
      {/* Filter Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-secondary/30 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="text-left">
            <h2 className="font-black text-foreground text-lg">Filtros</h2>
            {activeFilterCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {activeFilterCount} filtro{activeFilterCount > 1 ? "s" : ""} ativo{activeFilterCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-all duration-300 font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar
            </button>
          )}
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Filter Content */}
      {isOpen && (
        <div className="p-6 border-t border-border bg-gradient-to-b from-secondary/20 to-transparent">
          {/* Quick Period Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-black text-foreground mb-3">
              Período Rápido
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Este Mês", value: "thisMonth" as const },
                { label: "Mês Passado", value: "lastMonth" as const },
                { label: "Últimos 3 Meses", value: "last3Months" as const },
                { label: "Este Ano", value: "thisYear" as const },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setQuickPeriod(period.value)}
                  className="px-4 py-2.5 bg-background border border-border rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 text-sm font-bold text-foreground hover:text-emerald-800"
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-black text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Data Início
              </label>
              <input
                type="date"
                value={filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  updateFilter("startDate", e.target.value ? new Date(e.target.value) : null)
                }
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-background font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Data Fim
              </label>
              <input
                type="date"
                value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  updateFilter("endDate", e.target.value ? new Date(e.target.value) : null)
                }
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-background font-semibold"
              />
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-black text-foreground mb-2">
                <CreditCard className="w-4 h-4 inline mr-1.5" />
                Conta
              </label>
              <select
                value={filters.accountId || ""}
                onChange={(e) => updateFilter("accountId", e.target.value || null)}
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-background font-semibold appearance-none cursor-pointer"
              >
                <option value="">Todas as contas</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-black text-foreground mb-2">
                Tipo de Transação
              </label>
              <div className="flex bg-background border border-border rounded-xl p-1">
                {([
                  { label: "Todos", value: "" },
                  { label: "Despesa", value: "Despesa" as const },
                  { label: "Receita", value: "Receita" as const },
                ] as const).map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => updateFilter("type", opt.value || null)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                      (filters.type || "") === opt.value
                        ? "bg-emerald-50 text-emerald-800 shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/40"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fix/Var */}
            <div>
              <label className="block text-sm font-black text-foreground mb-2">
                Fixo / Variável
              </label>
              <div className="flex bg-background border border-border rounded-xl p-1">
                {([
                  { label: "Todos", value: "" },
                  { label: "Fixo", value: "Fixo" as const },
                  { label: "Variável", value: "Variável" as const },
                ] as const).map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => updateFilter("fixVar", opt.value || null)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                      (filters.fixVar || "") === opt.value
                        ? "bg-emerald-50 text-emerald-800 shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/40"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recurring */}
            <div>
              <label className="block text-sm font-black text-foreground mb-2">
                <Repeat className="w-4 h-4 inline mr-1.5" />
                Recorrente
              </label>
              <ButtonGroup className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full rounded-xl font-bold", filters.recurring === undefined && "bg-secondary/40")}
                  onClick={() => updateFilter("recurring", undefined)}
                >
                  Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full rounded-xl font-bold", filters.recurring === true && "bg-secondary/40")}
                  onClick={() => updateFilter("recurring", true)}
                >
                  Sim
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full rounded-xl font-bold", filters.recurring === false && "bg-secondary/40")}
                  onClick={() => updateFilter("recurring", false)}
                >
                  Não
                </Button>
              </ButtonGroup>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex flex-wrap gap-2">
                {filters.accountId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                    <CreditCard className="w-3.5 h-3.5" />
                    {accounts.find((a) => a.id === filters.accountId)?.name || "Conta"}
                  </span>
                )}
                {filters.type && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                    {filters.type === "Despesa" ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    {filters.type}
                  </span>
                )}
                {filters.fixVar && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                    {filters.fixVar}
                  </span>
                )}
                {filters.recurring !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                    <Repeat className="w-3.5 h-3.5" />
                    Recorrente: {filters.recurring ? "Sim" : "Não"}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-end">
                <Button variant="outline" className="rounded-xl font-bold" onClick={clearFilters}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
