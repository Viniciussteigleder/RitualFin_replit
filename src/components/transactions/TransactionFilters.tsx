"use client";

import { Search, LayoutGrid, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterPanel as FilterPanelComp } from "@/components/transactions/filter-panel";
import { cn } from "@/lib/utils";

interface TransactionFiltersProps {
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
    onExport
}: TransactionFiltersProps) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-6 rounded-[2.5rem] border border-border shadow-sm transition-all duration-300 hover:shadow-md mt-4">
            <div className="w-full lg:flex-1 max-w-lg">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Buscar estabelecimento, valor ou categoria..."
                        className="pl-12 h-14 bg-secondary/50 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all text-sm font-medium"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <FilterPanelComp
                    categories={availableCategories}
                    accounts={availableAccounts}
                    onFilterChange={onFilterChange}
                />
                <Button
                    variant="outline"
                    className={cn(
                        "h-14 px-6 border-border rounded-2xl text-foreground font-bold gap-2 text-sm transition-all",
                        isCompact && "bg-primary text-white border-transparent"
                    )}
                    onClick={onToggleCompact}
                >
                    <LayoutGrid className="h-4 w-4" />
                    {isCompact ? "Normal" : "Compacta"}
                </Button>
                <Button
                    variant="outline"
                    className={cn(
                        "h-14 px-4 border-border rounded-2xl text-foreground font-medium gap-2 text-sm transition-all",
                        hideCents && "bg-secondary"
                    )}
                    onClick={onToggleHideCents}
                >
                    {hideCents ? "€123" : "€123,45"}
                </Button>
                <Button 
                    variant="outline" 
                    className="h-14 px-6 border-border hover:bg-secondary rounded-2xl text-foreground font-bold gap-2 text-sm" 
                    onClick={onExport}
                >
                    <FileText className="h-4 w-4" />
                    Exportar
                </Button>
            </div>
        </div>
    );
}
