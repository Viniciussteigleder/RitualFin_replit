"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 rounded-full px-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Filters</h4>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear all
            </Button>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">
              Date Range
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "PP") : "From"}
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
                      "justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "PP") : "To"}
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
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                Categories
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
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                Accounts
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
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">
              Amount Range
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, minAmount: parseFloat(e.target.value) || undefined })
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAmount: parseFloat(e.target.value) || undefined })
                  }
                />
              </div>
            </div>
          </div>

          {/* Type & Recurrence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Type</Label>
                <Select 
                    value={filters.fixVar || "all"} 
                    onValueChange={(val) => setFilters({ ...filters, fixVar: val === "all" ? undefined : val })}
                >
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Fixo & Variável</SelectItem>
                        <SelectItem value="Fixo">Fixo</SelectItem>
                        <SelectItem value="Variável">Variável</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Recurrence</Label>
                <Select 
                    value={filters.recurring === undefined ? "all" : filters.recurring ? "true" : "false"} 
                    onValueChange={(val) => setFilters({ ...filters, recurring: val === "all" ? undefined : val === "true" })}
                >
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="true">Recorrentes</SelectItem>
                        <SelectItem value="false">Únicas</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-slate-900 text-white" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
