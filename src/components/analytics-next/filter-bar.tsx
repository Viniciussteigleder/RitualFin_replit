"use client";

import { useAnalyticsQuery } from "@/hooks/use-analytics-query";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  accounts: any[];
}

export function FilterBar({ accounts }: FilterBarProps) {
  const { params, updateParams, resetParams, dateRange } = useAnalyticsQuery();

  return (
    <div className="sticky top-20 z-10 space-y-4">
      <div className="bg-card/80 backdrop-blur-md border border-border/60 p-2 rounded-2xl shadow-sm flex flex-wrap items-center gap-2">
        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-10 rounded-xl",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM")} -{" "}
                    {format(dateRange.to, "dd/MM")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Selecione data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from && range.to) { // Only update if both set (or handle single date)
                     updateParams({ 
                         start: format(range.from, "yyyy-MM-dd"), 
                         end: format(range.to, "yyyy-MM-dd") 
                     });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Account Selector */}
        <Select
            value={params.accounts || "all"}
            onValueChange={(val) => updateParams({ accounts: val === "all" ? "" : val })}
        >
            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-transparent border-border/60 hover:bg-muted/50">
                <SelectValue placeholder="Todas as Contas" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todas as Contas</SelectItem>
                {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>

        {/* Type Toggle */}
        <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/40">
            {(["all", "expense", "income"] as const).map((t) => (
                <button
                    key={t}
                    onClick={() => updateParams({ type: t })}
                    className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                        params.type === t 
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {{ all: "Todos", expense: "Despesas", income: "Receitas" }[t]}
                </button>
            ))}
        </div>

        <div className="flex-1" />

        {/* Clear Filters */}
        <Button variant="ghost" size="sm" onClick={resetParams} className="text-muted-foreground hover:text-red-500">
            <X className="w-4 h-4 mr-2" />
            Limpar
        </Button>
      </div>
    </div>
  );
}
