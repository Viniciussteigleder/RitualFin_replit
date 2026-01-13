"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingDown, AlertCircle, Target, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetDialog } from "./budget-dialog";
import { useState, useTransition } from "react";
import { copyBudgetsToNextMonth } from "@/lib/actions/budgets";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BudgetWithSpent {
  id: string;
  category1: string;
  amount: number;
  month: string;
  spent: number;
}

interface BudgetsClientProps {
  budgets: BudgetWithSpent[];
  currentMonth: string;
}

export function BudgetsClient({ budgets, currentMonth }: BudgetsClientProps) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredBudgets = budgets.filter((b) => b.month === selectedMonth);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split("-");
    return new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString("pt-PT", {
      month: "long",
      year: "numeric",
    });
  };

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const newDate = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleCopyToNext = () => {
    startTransition(async () => {
      const result = await copyBudgetsToNextMonth(selectedMonth);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  // Calculate summary
  const totalBudgeted = filteredBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const overBudgetCount = filteredBudgets.filter((b) => b.spent > b.amount).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-2xl">
        <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="rounded-xl">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-lg font-bold capitalize">{formatMonth(selectedMonth)}</span>
        <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="rounded-xl">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Summary Cards */}
      {filteredBudgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 rounded-2xl">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Orçado</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
          </Card>
          <Card className="p-6 rounded-2xl">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Gasto</p>
            <p className={cn("text-2xl font-bold", overallPercentage > 100 && "text-destructive")}>
              {formatCurrency(totalSpent)}
            </p>
          </Card>
          <Card className="p-6 rounded-2xl">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  overBudgetCount > 0 ? "bg-destructive" : overallPercentage > 80 ? "bg-orange-500" : "bg-emerald-500"
                )}
              />
              <p className="text-lg font-bold">
                {overBudgetCount > 0
                  ? `${overBudgetCount} categoria(s) excedida(s)`
                  : overallPercentage > 80
                    ? "Atenção aos limites"
                    : "Tudo em ordem"}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {filteredBudgets.length > 0 && (
          <Button
            variant="outline"
            onClick={handleCopyToNext}
            disabled={isPending}
            className="rounded-xl gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar para Próximo Mês
          </Button>
        )}
        <BudgetDialog mode="create" />
      </div>

      {/* Budget List */}
      {filteredBudgets.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mt-40 group-hover:bg-primary/10 transition-colors" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-secondary/50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
              <TrendingDown className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3 font-display">
              Sem orçamentos para {formatMonth(selectedMonth)}
            </h3>
            <p className="text-muted-foreground max-w-[360px] font-medium leading-relaxed px-6">
              Defina limites de gastos para controlar suas finanças.
            </p>
            <div className="mt-8">
              <BudgetDialog
                mode="create"
                trigger={
                  <Button className="h-16 px-12 bg-primary text-white rounded-2xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95">
                    Criar Meu Primeiro Orçamento
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBudgets.map((budget) => {
            const spent = budget.spent;
            const limit = budget.amount;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80 && percentage <= 100;

            return (
              <div
                key={budget.id}
                className={cn(
                  "bg-card border border-border rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative",
                  isOverBudget && "border-destructive/30 bg-destructive/5"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            isOverBudget
                              ? "bg-destructive/10 text-destructive"
                              : isNearLimit
                                ? "bg-orange-500/10 text-orange-500"
                                : "bg-emerald-500/10 text-emerald-500"
                          )}
                        >
                          <Target className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{budget.category1}</h3>
                      </div>
                      <Badge
                        className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border-none",
                          isOverBudget
                            ? "bg-destructive text-white"
                            : isNearLimit
                              ? "bg-orange-400 text-white"
                              : "bg-emerald-500/10 text-emerald-500"
                        )}
                      >
                        {isOverBudget ? "Excedido" : isNearLimit ? "Atenção" : "Em Dia"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold tracking-tight">{formatCurrency(spent)}</span>
                          <span className="text-sm font-medium text-muted-foreground">de {formatCurrency(limit)}</span>
                        </div>
                        <span
                          className={cn(
                            "text-xs font-bold px-2 py-1 rounded-md",
                            isOverBudget
                              ? "bg-destructive/10 text-destructive"
                              : isNearLimit
                                ? "bg-orange-500/10 text-orange-500"
                                : "bg-emerald-500/10 text-emerald-500"
                          )}
                        >
                          {percentage.toFixed(0)}%
                        </span>
                      </div>

                      <div className="relative h-3 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "absolute top-0 left-0 h-full rounded-full transition-all duration-700",
                            isOverBudget ? "bg-destructive" : isNearLimit ? "bg-orange-400" : "bg-emerald-500"
                          )}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {isOverBudget && <AlertCircle className="h-3 w-3 text-destructive" />}
                          {limit - spent > 0
                            ? `Disponível: ${formatCurrency(limit - spent)}`
                            : `Excedido: ${formatCurrency(Math.abs(limit - spent))}`}
                        </span>
                        <span>{Math.max(0, 100 - percentage).toFixed(0)}% restante</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <BudgetDialog mode="edit" budget={budget} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
