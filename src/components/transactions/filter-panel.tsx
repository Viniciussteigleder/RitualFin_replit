"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";

interface FilterPanelProps {
  onFilterChange: (filters: TransactionFilters) => void;
  categories?: string[];
  accounts?: string[];
}

export interface TransactionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  categories?: string[];
  accounts?: string[];
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  fixVar?: string;
  recurring?: boolean;
}

export function FilterPanel({ onFilterChange, categories = [], accounts = [] }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const handleApply = () => {
    onFilterChange({
      ...filters,
      categories: selectedCategories,
      accounts: selectedAccounts,
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    setSelectedCategories([]);
    setSelectedAccounts([]);
    onFilterChange({});
  };

  const activeFilterCount = 
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    selectedCategories.length +
    selectedAccounts.length +
    (filters.minAmount ? 1 : 0) +
    (filters.maxAmount ? 1 : 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-2xl h-14 px-6 font-bold">
          <Filter className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 rounded-full px-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] max-w-[calc(100vw-24px)]" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-black text-sm">Filtros</h4>
              <p className="text-xs text-muted-foreground">Aplique para atualizar a lista.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={handleClear}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Período
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-semibold rounded-xl",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "PP") : "Início"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-semibold rounded-xl",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "PP") : "Fim"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Categorias
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, category]);
                        } else {
                          setSelectedCategories(selectedCategories.filter((c) => c !== category));
                        }
                      }}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accounts */}
          {accounts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Contas
              </Label>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div key={account} className="flex items-center space-x-2">
                    <Checkbox
                      id={`account-${account}`}
                      checked={selectedAccounts.includes(account)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAccounts([...selectedAccounts, account]);
                        } else {
                          setSelectedAccounts(selectedAccounts.filter((a) => a !== account));
                        }
                      }}
                    />
                    <label
                      htmlFor={`account-${account}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {account}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amount Range */}
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Valor (abs)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Mín"
                  value={filters.minAmount || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, minAmount: parseFloat(e.target.value) || undefined })
                  }
                  className="rounded-xl"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Máx"
                  value={filters.maxAmount || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAmount: parseFloat(e.target.value) || undefined })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Type & Recurrence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Fixo / Variável</Label>
              <ButtonGroup className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full rounded-xl font-bold", !filters.fixVar && "bg-secondary/40")}
                  onClick={() => setFilters({ ...filters, fixVar: undefined })}
                >
                  Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full rounded-xl font-bold", filters.fixVar === "Fixo" && "bg-secondary/40")}
                  onClick={() => setFilters({ ...filters, fixVar: "Fixo" })}
                >
                  Fixo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full rounded-xl font-bold", filters.fixVar === "Variável" && "bg-secondary/40")}
                  onClick={() => setFilters({ ...filters, fixVar: "Variável" })}
                >
                  Variável
                </Button>
              </ButtonGroup>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Recorrente</Label>
              <ButtonGroup className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full rounded-xl font-bold", filters.recurring === undefined && "bg-secondary/40")}
                  onClick={() => setFilters({ ...filters, recurring: undefined })}
                >
                  Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full rounded-xl font-bold", filters.recurring === true && "bg-secondary/40")}
                  onClick={() => setFilters({ ...filters, recurring: true })}
                >
                  Sim
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full rounded-xl font-bold", filters.recurring === false && "bg-secondary/40")}
                  onClick={() => setFilters({ ...filters, recurring: false })}
                >
                  Não
                </Button>
              </ButtonGroup>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setIsOpen(false)}>
              Fechar
            </Button>
            <Button className="flex-1 rounded-xl font-black" onClick={handleApply}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
