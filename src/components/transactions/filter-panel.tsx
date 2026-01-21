"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  Filter,
  RotateCcw,
  ChevronDown,
  Repeat,
  LayoutGrid,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Target
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";

export interface TransactionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  appCategories?: string[];
  categories1?: string[];
  categories2?: string[];
  categories3?: string[];
  accounts?: string[];
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  fixVar?: "Fixo" | "Variável";
  recurring?: boolean;
}

interface FilterPanelProps {
  onFilterChange: (filters: TransactionFilters) => void;
  appCategories?: string[];
  categories1?: string[];
  categories2?: string[];
  categories3?: string[];
  accounts?: string[];
  initialFilters?: TransactionFilters;
}

export const FilterPanel = memo(function FilterPanel({
  onFilterChange,
  appCategories = [],
  categories1 = [],
  categories2 = [],
  categories3 = [],
  accounts = [],
  initialFilters = {}
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);

  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
       delete newFilters[key];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const cleared = {};
    setFilters(cleared);
    onFilterChange(cleared);
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

    updateFilter("dateFrom", start);
    updateFilter("dateTo", end);
  };

  const toggleListFilter = (key: keyof TransactionFilters, value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? updated : undefined);
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="bg-card/95 rounded-3xl shadow-sm border border-border overflow-hidden w-full transition-all duration-300">
      {/* Filter Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-secondary/30 transition-all duration-200"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center shadow-sm">
            <Filter className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="text-left">
            <h2 className="font-black text-foreground text-xl tracking-tight">Filtros</h2>
            <p className="text-sm text-muted-foreground font-medium">
              {activeFilterCount > 0 
                ? `${activeFilterCount} filtro${activeFilterCount > 1 ? "s" : ""} ativo${activeFilterCount > 1 ? "s" : ""}`
                : "Selecione critérios para filtrar sua lista"
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-all duration-200 font-bold border border-transparent hover:border-red-100"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar
            </button>
          )}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
            isOpen ? "bg-emerald-50 text-emerald-600 rotate-180" : "bg-secondary/50 text-muted-foreground"
          )}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Filter Content */}
      <div className={cn(
        "grid transition-all duration-500 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
      )}>
        <div className="overflow-hidden">
          <div className="p-8 border-t border-border bg-gradient-to-b from-secondary/20 to-transparent space-y-8">
            
            {/* Quick Period Buttons */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-black text-foreground uppercase tracking-widest opacity-70">
                <CalendarIcon className="w-4 h-4" />
                Período Rápido
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Este Mês", value: "thisMonth" as const },
                  { label: "Mês Passado", value: "lastMonth" as const },
                  { label: "Últimos 3 Meses", value: "last3Months" as const },
                  { label: "Este Ano", value: "thisYear" as const },
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setQuickPeriod(period.value)}
                    className="px-4 py-3 bg-background border border-border/60 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200 text-sm font-bold text-foreground hover:text-emerald-800 shadow-sm hover:shadow-md active:scale-95"
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Date Range */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-foreground uppercase tracking-widest opacity-70">
                  Data Início
                </label>
                <div className="relative group">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="date"
                    value={filters.dateFrom ? format(filters.dateFrom, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      updateFilter("dateFrom", e.target.value ? new Date(e.target.value) : undefined)
                    }
                    className="w-full pl-12 pr-4 py-3 border border-border/60 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 bg-background font-bold text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-black text-foreground uppercase tracking-widest opacity-70">
                  Data Fim
                </label>
                <div className="relative group">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="date"
                    value={filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      updateFilter("dateTo", e.target.value ? new Date(e.target.value) : undefined)
                    }
                    className="w-full pl-12 pr-4 py-3 border border-border/60 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 bg-background font-bold text-sm shadow-sm"
                  />
                </div>
              </div>

              {/* Accounts */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-foreground uppercase tracking-widest opacity-70">
                  Contas
                </label>
                <div className="relative group">
                   <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                   <select
                    multiple
                    value={filters.accounts || []}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions).map(o => o.value);
                      updateFilter("accounts", options.length > 0 ? options : undefined);
                    }}
                    className="w-full pl-12 pr-4 py-3 border border-border/60 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 bg-background font-bold text-sm shadow-sm appearance-none min-h-[46px]"
                  >
                    {accounts.map((account) => (
                      <option key={account} value={account}>
                        {account}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1 ml-2 font-medium">Pressione Ctrl/Cmd para múltipla seleção</p>
                </div>
              </div>
            </div>

            {/* Taxonomy Filters */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4 border-t border-border/40">
              {/* App Category */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-foreground opacity-70">App Category</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {appCategories.map((cat) => (
                    <div key={cat} className="flex items-center group cursor-pointer" onClick={() => toggleListFilter("appCategories", cat)}>
                      <Checkbox
                        id={`app-cat-${cat}`}
                        checked={(filters.appCategories || []).includes(cat)}
                        className="rounded-lg h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        onCheckedChange={() => toggleListFilter("appCategories", cat)}
                      />
                      <label
                        htmlFor={`app-cat-${cat}`}
                        className="ml-3 text-sm font-bold text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors"
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                  {appCategories.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhuma encontrada</p>}
                </div>
              </div>

              {/* Category 1 */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-foreground opacity-70">Nível 1</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {categories1.map((cat) => (
                    <div key={cat} className="flex items-center group cursor-pointer" onClick={() => toggleListFilter("categories1", cat)}>
                      <Checkbox
                        id={`cat1-${cat}`}
                        checked={(filters.categories1 || []).includes(cat)}
                        className="rounded-lg h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        onCheckedChange={() => toggleListFilter("categories1", cat)}
                      />
                      <label
                        htmlFor={`cat1-${cat}`}
                        className="ml-3 text-sm font-bold text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors"
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                  {categories1.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhuma encontrada</p>}
                </div>
              </div>

              {/* Category 2 */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-foreground opacity-70">Nível 2</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {categories2.map((cat) => (
                    <div key={cat} className="flex items-center group cursor-pointer" onClick={() => toggleListFilter("categories2", cat)}>
                      <Checkbox
                        id={`cat2-${cat}`}
                        checked={(filters.categories2 || []).includes(cat)}
                        className="rounded-lg h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        onCheckedChange={() => toggleListFilter("categories2", cat)}
                      />
                      <label
                        htmlFor={`cat2-${cat}`}
                        className="ml-3 text-sm font-bold text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                  {categories2.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhuma encontrada</p>}
                </div>
              </div>

              {/* Category 3 */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-foreground opacity-70">Nível 3</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {categories3.map((cat) => (
                    <div key={cat} className="flex items-center group cursor-pointer" onClick={() => toggleListFilter("categories3", cat)}>
                      <Checkbox
                        id={`cat3-${cat}`}
                        checked={(filters.categories3 || []).includes(cat)}
                        className="rounded-lg h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        onCheckedChange={() => toggleListFilter("categories3", cat)}
                      />
                      <label
                        htmlFor={`cat3-${cat}`}
                        className="ml-3 text-sm font-bold text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors"
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                  {categories3.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhuma encontrada</p>}
                </div>
              </div>
            </div>

            {/* Amount & Types */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 border-t border-border/40">
              {/* Amount Range */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-foreground opacity-70">Valor (Absoluto)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minAmount || ""}
                    onChange={(e) => updateFilter("minAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="rounded-2xl h-12 font-bold text-sm bg-background border-border/60"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAmount || ""}
                    onChange={(e) => updateFilter("maxAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="rounded-2xl h-12 font-bold text-sm bg-background border-border/60"
                  />
                </div>
              </div>

              {/* Fix/Var */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-foreground opacity-70">Fixo / Variável</Label>
                <ButtonGroup className="w-full bg-secondary/30 p-1 rounded-2xl">
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "flex-1 rounded-xl h-10 font-bold text-xs transition-all",
                      !filters.fixVar ? "bg-white dark:bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                    onClick={() => updateFilter("fixVar", undefined)}
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                        "flex-1 rounded-xl h-10 font-bold text-xs transition-all",
                        filters.fixVar === "Fixo" ? "bg-white dark:bg-card text-emerald-600 shadow-sm" : "text-muted-foreground"
                    )}
                    onClick={() => updateFilter("fixVar", "Fixo")}
                  >
                    Fixo
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                        "flex-1 rounded-xl h-10 font-bold text-xs transition-all",
                        filters.fixVar === "Variável" ? "bg-white dark:bg-card text-emerald-600 shadow-sm" : "text-muted-foreground"
                    )}
                    onClick={() => updateFilter("fixVar", "Variável")}
                  >
                    Variável
                  </Button>
                </ButtonGroup>
              </div>

              {/* Recurring */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-foreground opacity-70">
                    <Repeat className="w-4 h-4" />
                    Recorrente
                </Label>
                <ButtonGroup className="w-full bg-secondary/30 p-1 rounded-2xl">
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                        "flex-1 rounded-xl h-10 font-bold text-xs transition-all",
                        filters.recurring === undefined ? "bg-white dark:bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                    onClick={() => updateFilter("recurring", undefined)}
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                        "flex-1 rounded-xl h-10 font-bold text-xs transition-all",
                        filters.recurring === true ? "bg-white dark:bg-card text-emerald-600 shadow-sm" : "text-muted-foreground"
                    )}
                    onClick={() => updateFilter("recurring", true)}
                  >
                    Sim
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                        "flex-1 rounded-xl h-10 font-bold text-xs transition-all",
                        filters.recurring === false ? "bg-white dark:bg-card text-emerald-600 shadow-sm" : "text-muted-foreground"
                    )}
                    onClick={() => updateFilter("recurring", false)}
                  >
                    Não
                  </Button>
                </ButtonGroup>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-border/40">
               <div className="flex flex-wrap gap-2">
                 {activeFilterCount > 0 && (
                     <p className="text-xs text-muted-foreground font-medium">Aplicações em tempo real à medida que altera.</p>
                 )}
               </div>
               <div className="flex gap-4">
                <Button 
                    variant="ghost" 
                    className="rounded-2xl font-bold h-12 px-8 text-muted-foreground hover:bg-secondary/50" 
                    onClick={() => setIsOpen(false)}
                >
                    Fechar Painel
                </Button>
                <Button 
                    className="rounded-2xl font-black h-12 px-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95" 
                    onClick={() => setIsOpen(false)}
                >
                    Concluir
                </Button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
});
