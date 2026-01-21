"use client";

import { Search, LayoutGrid, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterPanel as FilterPanelComp, TransactionFilters as FilterValues } from "@/components/transactions/filter-panel";
import { cn } from "@/lib/utils";

export interface TransactionFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    onFilterChange: (filters: FilterValues) => void;
    appCategories?: string[];
    categories1?: string[];
    categories2?: string[];
    categories3?: string[];
    availableAccounts: string[];
    isCompact: boolean;
    onToggleCompact: () => void;
    hideCents: boolean;
    onToggleHideCents: () => void;
    onExport: () => void;
    viewMode: "day" | "week";
    onViewModeChange: (mode: "day" | "week") => void;
    initialFilters?: FilterValues;
}

export function TransactionFilters({
    search,
    onSearchChange,
    onFilterChange,
    appCategories = [],
    categories1 = [],
    categories2 = [],
    categories3 = [],
    availableAccounts,
    isCompact,
    onToggleCompact,
    hideCents,
    onToggleHideCents,
    onExport,
    viewMode,
    onViewModeChange,
    initialFilters = {}
}: TransactionFiltersProps) {
    return (
        <div className="flex flex-col gap-8 bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm transition-all duration-300 hover:shadow-md mt-4">
            
            {/* Top Row: Search and Primary Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="w-full lg:flex-1 relative group max-w-xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <Input
                        placeholder="Buscar por estabelecimento, valor ou categoria..."
                        className="pl-14 h-14 bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl transition-[background-color,border-color,box-shadow] text-base font-medium placeholder:text-muted-foreground/70 shadow-inner"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* View Toggle */}
                     <div className="flex items-center p-1.5 bg-secondary/40 rounded-2xl border border-border/50 shadow-sm">
                        <button
                            onClick={() => onViewModeChange("day")}
                            className={cn(
                                "px-6 h-11 rounded-xl text-sm font-bold transition-all duration-200",
                                viewMode === "day" 
                                    ? "bg-white dark:bg-card text-foreground shadow-md scale-[1.02]" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                            )}
                        >
                            Dia
                        </button>
                        <button
                            onClick={() => onViewModeChange("week")}
                            className={cn(
                                "px-6 h-11 rounded-xl text-sm font-bold transition-all duration-200",
                                viewMode === "week" 
                                    ? "bg-white dark:bg-card text-foreground shadow-md scale-[1.02]" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                            )}
                        >
                            Semana
                        </button>
                    </div>

                    <Button 
                        variant="outline" 
                        size="icon"
                        className="h-14 w-14 border-border hover:bg-secondary rounded-2xl text-foreground shadow-sm transition-all hover:scale-105 active:scale-95" 
                        onClick={onExport}
                        title="Exportar dados"
                    >
                        <FileText className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Filter Panel - Now inline as a section */}
            <div className="w-full">
                <FilterPanelComp
                    appCategories={appCategories}
                    categories1={categories1}
                    categories2={categories2}
                    categories3={categories3}
                    accounts={availableAccounts}
                    onFilterChange={onFilterChange}
                    initialFilters={initialFilters}
                />
            </div>

            {/* Bottom Row: View Options (Compact/Cents) */}
            <div className="flex items-center gap-4 pt-4 border-t border-border/40">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mr-auto">Opções de Visualização</span>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-10 px-4 text-xs font-bold rounded-xl transition-all duration-200",
                            isCompact ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                        onClick={onToggleCompact}
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        {isCompact ? "Compacto" : "Expandido"}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-10 px-4 text-xs font-bold rounded-xl transition-all duration-200",
                            hideCents ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                        onClick={onToggleHideCents}
                    >
                        {hideCents ? "00" : "00,00"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
