"use client";

import { useState } from "react";
import { AnalyticsFilters } from "@/lib/actions/analytics";
import {
  Filter,
  X,
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

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  accounts: any[];
  categories: string[];
}

export function AnalyticsFiltersPanel({
  filters,
  onFiltersChange,
  accounts,
  categories,
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
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden">
      {/* Filter Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-gray-900 text-lg">Filtros</h2>
            {activeFilterCount > 0 && (
              <p className="text-sm text-gray-500">
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
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar
            </button>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Filter Content */}
      {isOpen && (
        <div className="p-6 border-t border-gray-100/50 bg-gradient-to-b from-gray-50/30 to-transparent">
          {/* Quick Period Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300 text-sm font-medium text-gray-700 hover:text-emerald-700"
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Data Início
              </label>
              <input
                type="date"
                value={filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  updateFilter("startDate", e.target.value ? new Date(e.target.value) : null)
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Data Fim
              </label>
              <input
                type="date"
                value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  updateFilter("endDate", e.target.value ? new Date(e.target.value) : null)
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white font-medium"
              />
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-1.5" />
                Conta
              </label>
              <select
                value={filters.accountId || ""}
                onChange={(e) => updateFilter("accountId", e.target.value || null)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white font-medium appearance-none cursor-pointer"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Transação
              </label>
              <div className="flex bg-white border border-gray-200 rounded-xl p-1">
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
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fix/Var */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fixo / Variável
              </label>
              <div className="flex bg-white border border-gray-200 rounded-xl p-1">
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
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recurring */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Repeat className="w-4 h-4 inline mr-1.5" />
                Recorrente
              </label>
              <select
                value={
                  filters.recurring === undefined
                    ? ""
                    : filters.recurring
                    ? "true"
                    : "false"
                }
                onChange={(e) =>
                  updateFilter(
                    "recurring",
                    e.target.value === "" ? undefined : e.target.value === "true"
                  )
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white font-medium appearance-none cursor-pointer"
              >
                <option value="">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <div className="flex flex-wrap gap-2">
                {filters.accountId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    <CreditCard className="w-3.5 h-3.5" />
                    {accounts.find((a) => a.id === filters.accountId)?.name || "Conta"}
                    <button
                      onClick={() => updateFilter("accountId", null)}
                      className="hover:text-emerald-900 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.type && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {filters.type === "Despesa" ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    {filters.type}
                    <button
                      onClick={() => updateFilter("type", null)}
                      className="hover:text-emerald-900 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.fixVar && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {filters.fixVar}
                    <button
                      onClick={() => updateFilter("fixVar", null)}
                      className="hover:text-emerald-900 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.recurring !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    <Repeat className="w-3.5 h-3.5" />
                    Recorrente: {filters.recurring ? "Sim" : "Não"}
                    <button
                      onClick={() => updateFilter("recurring", undefined)}
                      className="hover:text-emerald-900 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
