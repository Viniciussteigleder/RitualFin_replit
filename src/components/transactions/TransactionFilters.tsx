"use client";

import { Search, LayoutGrid, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterPanel as FilterPanelComp } from "@/components/transactions/filter-panel";
import { cn } from "@/lib/utils";

export interface TransactionFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    onFilterChange: (filters: any) => void;
    availableCategories: string[];
    availableAccounts: string[];
    isCompact: boolean;
    onToggleCompact: () => void;
    hideCents: boolean;
    onToggleHideCents: () => void;
    onExport: () => void;
    viewMode: "day" | "week";
    onViewModeChange: (mode: "day" | "week") => void;
}

export function TransactionFilters({
    search,
    onSearchChange,
    onFilterChange,
    availableCategories,
    availableAccounts,
    isCompact,
    onToggleCompact,
    hideCents,
    onToggleHideCents,
    onExport,
    viewMode,
    onViewModeChange
}: TransactionFiltersProps) {
    return (
        <div className="flex flex-col gap-6 bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm transition-shadow duration-200 hover:shadow-md mt-4">
            
            {/* Top Row: Search and Primary Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="w-full lg:flex-1 relative group max-w-xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <Input
                        placeholder="Buscar por estabelecimento, valor ou categoria..."
                        className="pl-14 h-14 bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl transition-[background-color,border-color,box-shadow] text-base font-medium placeholder:text-muted-foreground/70"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* View Toggle */}
                     <div className="flex items-center p-1 bg-secondary/40 rounded-2xl border border-border/50">
                        <button
                            onClick={() => onViewModeChange("day")}
                            className={cn(
                                "px-4 h-12 rounded-xl text-sm font-bold transition-[background-color,color] duration-200",
                                viewMode === "day" 
                                    ? "bg-white dark:bg-card text-foreground shadow-sm" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                            )}
                        >
                            Dia
                        </button>
                        <button
                            onClick={() => onViewModeChange("week")}
                            className={cn(
                                "px-4 h-12 rounded-xl text-sm font-bold transition-[background-color,color] duration-200",
                                viewMode === "week" 
                                    ? "bg-white dark:bg-card text-foreground shadow-sm" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                            )}
                        >
                            Semana
                        </button>
                    </div>

                    <FilterPanelComp
                        categories={availableCategories}
                        accounts={availableAccounts}
                        onFilterChange={onFilterChange}
                    />

                    <Button 
                        variant="outline" 
                        size="icon"
                        className="h-14 w-14 border-border hover:bg-secondary rounded-2xl text-foreground" 
                        onClick={onExport}
                        title="Exportar dados"
                    >
                        <FileText className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Bottom Row: View Options (Compact/Cents) - Optional, keeps UI clean */}
            {/* Can be hidden or moved to a settings dropdown if too cluttered, but keeping for now as requested */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-auto">Opções de Visualização</span>
                
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-9 px-3 text-xs font-bold rounded-xl text-muted-foreground hover:text-foreground",
                        isCompact && "bg-secondary text-foreground"
                    )}
                    onClick={onToggleCompact}
                >
                    <LayoutGrid className="h-3.5 w-3.5 mr-2" />
                    {isCompact ? "Compacto" : "Expandido"}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-9 px-3 text-xs font-bold rounded-xl text-muted-foreground hover:text-foreground",
                        hideCents && "bg-secondary text-foreground"
                    )}
                    onClick={onToggleHideCents}
                >
                    {hideCents ? "00" : "00,00"}
                </Button>
            </div>
        </div>
    );
}
