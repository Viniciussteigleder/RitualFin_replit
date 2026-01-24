"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useAnalyticsQuery } from "@/hooks/use-analytics-query";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Search,
  Bookmark,
  Share2,
  RotateCcw,
  Check,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  CalendarDays,
  Building2,
  Tag,
  Store,
  Repeat,
  AlertCircle,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Account } from "@/lib/db/schema";
import type { CategoryBreakdown } from "@/lib/actions/analytics-cockpit";

// ============================================================================
// TYPES
// ============================================================================

interface FilterPreset {
  id: string;
  name: string;
  icon?: string;
  filters: {
    type?: string;
    fixVar?: string;
    recurring?: string;
    timeframe?: string;
    categories?: string[];
  };
}

interface CockpitFilterPanelProps {
  accounts?: Account[];
  categories?: CategoryBreakdown[];
  merchants?: { name: string; count: number }[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ============================================================================
// TIMEFRAME PRESETS
// ============================================================================

const TIME_PRESETS = [
  { id: "mtd", label: "Este mês", shortLabel: "MTD" },
  { id: "last_month", label: "Mês passado", shortLabel: "-1M" },
  { id: "last_3_months", label: "Últimos 3 meses", shortLabel: "3M" },
  { id: "last_6_months", label: "Últimos 6 meses", shortLabel: "6M" },
  { id: "ytd", label: "Ano até agora", shortLabel: "YTD" },
  { id: "last_12_months", label: "Últimos 12 meses", shortLabel: "12M" },
  { id: "custom", label: "Personalizado", shortLabel: "Custom" },
];

const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "expenses_only",
    name: "Apenas Despesas",
    filters: { type: "expense" },
  },
  {
    id: "income_only",
    name: "Apenas Receitas",
    filters: { type: "income" },
  },
  {
    id: "fixed_costs",
    name: "Custos Fixos",
    filters: { type: "expense", fixVar: "Fixo" },
  },
  {
    id: "variable_costs",
    name: "Custos Variáveis",
    filters: { type: "expense", fixVar: "Variável" },
  },
  {
    id: "subscriptions",
    name: "Assinaturas",
    filters: { type: "expense", recurring: "true" },
  },
];

// ============================================================================
// FILTER SECTION COMPONENT
// ============================================================================

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}

function FilterSection({ title, icon, children, defaultOpen = true, badge }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-1 hover:bg-muted/50 rounded-lg transition-colors group">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
            {icon}
          </span>
          {title}
          {badge !== undefined && (
            <Badge variant="secondary" className="h-5 text-xs px-1.5 font-mono">
              {badge}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-3 px-1 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// MULTI-SELECT FILTER
// ============================================================================

interface MultiSelectFilterProps {
  items: { value: string; label: string; count?: number }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxDisplay?: number;
}

function MultiSelectFilter({
  items,
  selected,
  onChange,
  placeholder = "Selecionar...",
  searchable = true,
  maxDisplay = 2,
}: MultiSelectFilterProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const toggleItem = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const displayText = useMemo(() => {
    if (selected.length === 0) return placeholder;
    if (selected.length <= maxDisplay) {
      return selected
        .map((v) => items.find((i) => i.value === v)?.label || v)
        .join(", ");
    }
    return `${selected.length} selecionados`;
  }, [selected, items, placeholder, maxDisplay]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between text-left font-normal h-9 text-sm",
            selected.length === 0 && "text-muted-foreground"
          )}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          {searchable && (
            <CommandInput
              placeholder="Buscar..."
              value={search}
              onValueChange={setSearch}
            />
          )}
          <CommandList>
            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[200px]">
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.value}
                    onSelect={() => toggleItem(item.value)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selected.includes(item.value)}
                        className="pointer-events-none"
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.count}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
          {selected.length > 0 && (
            <>
              <CommandSeparator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => onChange([])}
                >
                  Limpar seleção
                </Button>
              </div>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CockpitFilterPanel({
  accounts = [],
  categories = [],
  merchants = [],
  isCollapsed = false,
  onToggleCollapse,
}: CockpitFilterPanelProps) {
  const { params, updateParams, resetParams, dateRange } = useAnalyticsQuery();
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // ---- Date Range State ----
  const [selectedTimePreset, setSelectedTimePreset] = useState("mtd");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: dateRange.from,
    to: dateRange.to,
  });

  // Apply time preset
  const applyTimePreset = useCallback(
    (presetId: string) => {
      setSelectedTimePreset(presetId);
      const now = new Date();

      let start: Date;
      let end: Date = endOfMonth(now);

      switch (presetId) {
        case "mtd":
          start = startOfMonth(now);
          end = now;
          break;
        case "last_month":
          start = startOfMonth(subMonths(now, 1));
          end = endOfMonth(subMonths(now, 1));
          break;
        case "last_3_months":
          start = startOfMonth(subMonths(now, 2));
          end = now;
          break;
        case "last_6_months":
          start = startOfMonth(subMonths(now, 5));
          end = now;
          break;
        case "ytd":
          start = startOfYear(now);
          end = now;
          break;
        case "last_12_months":
          start = startOfMonth(subMonths(now, 11));
          end = now;
          break;
        default:
          return;
      }

      setCustomDateRange({ from: start, to: end });
      updateParams({
        start: format(start, "yyyy-MM-dd"),
        end: format(end, "yyyy-MM-dd"),
      });
    },
    [updateParams]
  );

  // Apply filter preset
  const applyFilterPreset = (preset: FilterPreset) => {
    setActivePreset(preset.id);
    const updates: Record<string, string | undefined> = {};

    if (preset.filters.type === "expense") updates.type = "expense";
    else if (preset.filters.type === "income") updates.type = "income";
    else updates.type = "all";

    if (preset.filters.fixVar) updates.fixVar = preset.filters.fixVar;
    else updates.fixVar = undefined;

    if (preset.filters.recurring) updates.recurring = preset.filters.recurring;
    else updates.recurring = undefined;

    updateParams(updates);
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (params.type && params.type !== "all") count++;
    if (params.fixVar) count++;
    if (params.recurring) count++;
    if (params.appCategory) count++;
    if (params.category1) count++;
    if (params.category2) count++;
    if (params.category3) count++;
    return count;
  }, [params]);

  // ---- Cascading Categories ----
  const level1Categories = useMemo(() => {
    const unique = new Set(categories.map((c) => c.category));
    return Array.from(unique).map((cat) => ({
      value: cat,
      label: cat,
      count: categories.find((c) => c.category === cat)?.count || 0,
    }));
  }, [categories]);

  if (isCollapsed) {
    return (
      <div className="w-12 flex flex-col items-center py-4 border-l border-border bg-card/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="mb-4"
        >
          <Sliders className="w-4 h-4" />
        </Button>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="w-[320px] flex-shrink-0 border-l border-border bg-card/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={resetParams}
            title="Limpar filtros"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleCollapse}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* ---- TIME PRESETS ---- */}
          <FilterSection
            title="Período"
            icon={<CalendarDays className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_PRESETS.slice(0, 6).map((preset) => (
                <Button
                  key={preset.id}
                  variant={selectedTimePreset === preset.id ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs h-8",
                    selectedTimePreset === preset.id && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => applyTimePreset(preset.id)}
                >
                  {preset.shortLabel}
                </Button>
              ))}
            </div>

            {/* Custom Date Range */}
            <div className="pt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-9 text-sm"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {customDateRange.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                          {format(customDateRange.to, "dd/MM/yy", { locale: ptBR })}
                        </>
                      ) : (
                        format(customDateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      "Selecionar datas"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    defaultMonth={customDateRange.from}
                    selected={{
                      from: customDateRange.from,
                      to: customDateRange.to,
                    }}
                    onSelect={(range) => {
                      setCustomDateRange({
                        from: range?.from,
                        to: range?.to,
                      });
                      if (range?.from && range?.to) {
                        setSelectedTimePreset("custom");
                        updateParams({
                          start: format(range.from, "yyyy-MM-dd"),
                          end: format(range.to, "yyyy-MM-dd"),
                        });
                      }
                    }}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </FilterSection>

          <Separator />

          {/* ---- FILTER PRESETS ---- */}
          <FilterSection
            title="Presets"
            icon={<Bookmark className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="flex flex-wrap gap-1.5">
              {FILTER_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant={activePreset === preset.id ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs h-7",
                    activePreset === preset.id && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => applyFilterPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* ---- TYPE FILTER ---- */}
          <FilterSection
            title="Tipo"
            icon={<ArrowLeftRight className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: "all", label: "Todos", icon: null },
                { value: "expense", label: "Despesas", icon: TrendingDown },
                { value: "income", label: "Receitas", icon: TrendingUp },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={params.type === option.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs h-8 gap-1",
                    params.type === option.value && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => updateParams({ type: option.value as any })}
                >
                  {option.icon && <option.icon className="w-3 h-3" />}
                  {option.label}
                </Button>
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* ---- NATURE FILTER ---- */}
          <FilterSection
            title="Natureza"
            icon={<Tag className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: undefined, label: "Todos" },
                { value: "Fixo", label: "Fixo" },
                { value: "Variável", label: "Variável" },
              ].map((option) => (
                <Button
                  key={option.value || "all"}
                  variant={params.fixVar === option.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs h-8",
                    params.fixVar === option.value && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => updateParams({ fixVar: option.value as any })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* ---- RECURRING FILTER ---- */}
          <FilterSection
            title="Recorrência"
            icon={<Repeat className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: undefined, label: "Todos" },
                { value: "true", label: "Recorrente" },
                { value: "false", label: "Avulso" },
              ].map((option) => (
                <Button
                  key={option.value || "all"}
                  variant={String(params.recurring) === option.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs h-8",
                    String(params.recurring) === option.value && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => updateParams({ recurring: option.value as any })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* ---- CATEGORIES ---- */}
          <FilterSection
            title="Categorias"
            icon={<Tag className="w-4 h-4" />}
            defaultOpen={false}
            badge={level1Categories.length}
          >
            <MultiSelectFilter
              items={level1Categories}
              selected={params.appCategory ? [params.appCategory] : []}
              onChange={(selected) => {
                updateParams({
                  appCategory: selected[0] || undefined,
                  category1: undefined,
                  category2: undefined,
                  category3: undefined,
                });
              }}
              placeholder="Selecionar categoria..."
            />
          </FilterSection>

          <Separator />

          {/* ---- ACCOUNTS ---- */}
          {accounts.length > 0 && (
            <FilterSection
              title="Contas"
              icon={<Building2 className="w-4 h-4" />}
              defaultOpen={false}
              badge={accounts.length}
            >
              <Select
                value={params.accounts || "all"}
                onValueChange={(value) =>
                  updateParams({ accounts: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas as contas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as contas</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
          )}

          {/* ---- UNCATEGORIZED TOGGLE ---- */}
          <FilterSection
            title="Qualidade"
            icon={<AlertCircle className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="flex items-center gap-2 text-sm">
              <Checkbox
                id="uncategorized"
                checked={params.appCategory === "OPEN"}
                onCheckedChange={(checked) => {
                  updateParams({
                    appCategory: checked ? "OPEN" : undefined,
                  });
                }}
              />
              <label htmlFor="uncategorized" className="cursor-pointer">
                Apenas não categorizados
              </label>
            </div>
          </FilterSection>
        </div>
      </ScrollArea>

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex flex-wrap gap-1.5">
            {params.type && params.type !== "all" && (
              <Badge
                variant="secondary"
                className="text-xs gap-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => updateParams({ type: "all" })}
              >
                {params.type === "expense" ? "Despesas" : "Receitas"}
                <X className="w-3 h-3" />
              </Badge>
            )}
            {params.fixVar && (
              <Badge
                variant="secondary"
                className="text-xs gap-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => updateParams({ fixVar: undefined })}
              >
                {params.fixVar}
                <X className="w-3 h-3" />
              </Badge>
            )}
            {params.recurring && (
              <Badge
                variant="secondary"
                className="text-xs gap-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => updateParams({ recurring: undefined })}
              >
                Recorrente
                <X className="w-3 h-3" />
              </Badge>
            )}
            {params.appCategory && (
              <Badge
                variant="secondary"
                className="text-xs gap-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => updateParams({ appCategory: undefined })}
              >
                {params.appCategory}
                <X className="w-3 h-3" />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
