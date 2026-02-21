"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Target,
  ChevronLeft,
  ChevronRight,
  Copy,
  Sparkles,
  Info,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2,
  BarChart3,
  Lightbulb,
  Zap,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetDialog } from "./budget-dialog";
import { useState, useTransition, useEffect } from "react";
import {
  copyBudgetsToNextMonth,
  getBudgetProposals,
  getHistoricalComparison,
  applyBudgetProposals,
  getCategoryBreakdown,
  getAIBudgetRecommendationsAction,
  type BudgetProposal,
  type MonthlyComparison,
  type CategoryBreakdown,
} from "@/lib/actions/budgets";
import type { AIBudgetRecommendationResult } from "@/lib/ai/openai";
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
  const [activeTab, setActiveTab] = useState<"budgets" | "proposals" | "comparison">("budgets");
  const [proposals, setProposals] = useState<BudgetProposal | null>(null);
  const [aiProposals, setAiProposals] = useState<AIBudgetRecommendationResult | null>(null);
  const [comparison, setComparison] = useState<MonthlyComparison[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loadingAiProposals, setLoadingAiProposals] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [applyingProposals, setApplyingProposals] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [breakdownData, setBreakdownData] = useState<Record<string, CategoryBreakdown>>({});
  const [loadingBreakdown, setLoadingBreakdown] = useState<string | null>(null);
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

  // Load proposals when tab changes
  useEffect(() => {
    if (activeTab === "proposals" && !proposals) {
      setLoadingProposals(true);
      getBudgetProposals().then((data) => {
        setProposals(data);
        setLoadingProposals(false);
      });
    }
  }, [activeTab, proposals]);

  // Load comparison when tab changes or month changes
  useEffect(() => {
    if (activeTab === "comparison") {
      setLoadingComparison(true);
      getHistoricalComparison(selectedMonth).then((data) => {
        setComparison(data);
        setLoadingComparison(false);
      });
    }
  }, [activeTab, selectedMonth]);

  const handleGenerateAI = async () => {
    setLoadingAiProposals(true);
    try {
      const result = await getAIBudgetRecommendationsAction();
      if (result) {
        setAiProposals(result);
        toast.success("Sugestões IA geradas com sucesso!");
      } else {
        toast.error("Não foi possível gerar sugestões com IA.");
      }
    } catch (error) {
      toast.error("Erro ao gerar sugestões.");
    } finally {
      setLoadingAiProposals(false);
    }
  };

  const handleApplyProposals = async () => {
    const activeProposals = aiProposals
      ? aiProposals.recommendations.map((r) => ({
          category1: r.category1,
          category2: r.category2,
          category3: r.category3,
          amount: r.proposedAmount,
        }))
      : proposals
        ? proposals.categories.map((c) => ({
            category1: c.category1,
            amount: c.proposedBudget,
          }))
        : null;

    if (!activeProposals) return;

    setApplyingProposals(true);
    try {
      const result = await applyBudgetProposals(selectedMonth, activeProposals);
      if (result.success) {
        toast.success("Orçamentos aplicados com sucesso!");
        router.refresh();
        setActiveTab("budgets");
      } else {
        toast.error(result.error);
      }
    } finally {
      setApplyingProposals(false);
    }
  };

  const handleToggleBreakdown = async (category1: string) => {
    if (expandedCategory === category1) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(category1);

    if (!breakdownData[category1]) {
      setLoadingBreakdown(category1);
      try {
        const data = await getCategoryBreakdown(category1);
        if (data) {
          setBreakdownData((prev) => ({ ...prev, [category1]: data }));
        }
      } finally {
        setLoadingBreakdown(null);
      }
    }
  };

  // Calculate summary
  const totalBudgeted = filteredBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const overBudgetCount = filteredBudgets.filter((b) => b.spent > b.amount).length;

  const TrendIcon = ({ value, size = 4 }: { value: number; size?: number }) => {
    if (value > 5) return <ArrowUpRight className={`h-${size} w-${size} text-red-500`} />;
    if (value < -5) return <ArrowDownRight className={`h-${size} w-${size} text-emerald-500`} />;
    return <Minus className={`h-${size} w-${size} text-muted-foreground`} />;
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-2xl border border-border/50">
          <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="rounded-xl hover:bg-white/50 transition-[background-color,color,opacity] duration-150">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold capitalize">{formatMonth(selectedMonth)}</span>
          <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="rounded-xl hover:bg-white/50 transition-[background-color,color,opacity] duration-150">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="bg-secondary/50 p-1 rounded-2xl border border-border h-auto w-full grid grid-cols-3">
            <TabsTrigger
              value="budgets"
              className="rounded-xl px-4 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-[background-color,color,box-shadow,opacity] duration-150"
            >
              <Target className="h-4 w-4 mr-2" />
              Orçamentos
            </TabsTrigger>
            <TabsTrigger
              value="proposals"
              className="rounded-xl px-4 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-[background-color,color,box-shadow,opacity] duration-150"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Sugestões IA
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="rounded-xl px-4 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-[background-color,color,box-shadow,opacity] duration-150"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Comparativo
            </TabsTrigger>
          </TabsList>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="mt-6 focus-visible:outline-none">
            {/* Summary Cards */}
            {filteredBudgets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 border-border/50 hover:shadow-lg transition-[box-shadow,border-color,background-color,opacity] duration-150">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total Orçado</p>
                  <p className="text-2xl font-bold tracking-tight">{formatCurrency(totalBudgeted)}</p>
                </Card>
                <Card className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 border-border/50 hover:shadow-lg transition-[box-shadow,border-color,background-color,opacity] duration-150">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total Gasto</p>
                  <p className={cn("text-2xl font-bold tracking-tight", overallPercentage > 100 && "text-destructive")}>
                    {formatCurrency(totalSpent)}
                  </p>
                </Card>
                <Card className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 border-border/50 hover:shadow-lg transition-[box-shadow,border-color,background-color,opacity] duration-150">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full animate-pulse",
                        overBudgetCount > 0 ? "bg-destructive" : overallPercentage > 80 ? "bg-orange-500" : "bg-emerald-500"
                      )}
                    />
                    <p className="text-base font-bold">
                      {overBudgetCount > 0
                        ? `${overBudgetCount} excedida(s)`
                        : overallPercentage > 80
                          ? "Atenção"
                          : "Em dia"}
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end mb-6">
              {filteredBudgets.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleCopyToNext}
                  disabled={isPending}
                  className="rounded-xl gap-2 hover:bg-white/50 transition-[background-color,color,opacity] duration-150"
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
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mt-40 group-hover:bg-primary/10 transition-colors duration-500" />
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
                  <div className="flex flex-col gap-3 mt-8">
                    <BudgetDialog
                      mode="create"
                      trigger={
                        <Button className="h-14 px-10 bg-primary text-white rounded-2xl font-bold transition-[background-color,box-shadow,transform,opacity] duration-150 shadow-xl hover:scale-105 active:scale-95">
                          <Plus className="h-5 w-5 mr-2" />
                          Criar Orçamento
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      className="text-sm text-muted-foreground hover:text-primary"
                      onClick={() => setActiveTab("proposals")}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Ver sugestões baseadas no histórico
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-5">
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
	                        "bg-card border border-border rounded-[2rem] p-7 shadow-sm hover:shadow-xl transition-[box-shadow,border-color,background-color,color,opacity] duration-200 overflow-hidden group relative",
	                        isOverBudget && "border-destructive/30 bg-destructive/5"
	                      )}
	                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                  isOverBudget
                                    ? "bg-destructive/10 text-destructive"
                                    : isNearLimit
                                      ? "bg-orange-500/10 text-orange-500"
                                      : "bg-emerald-500/10 text-emerald-500"
                                )}
                              >
                                <Target className="h-5 w-5" />
                              </div>
                              <h3 className="text-lg font-bold text-foreground">{budget.category1}</h3>
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
                                <span className="text-2xl font-bold tracking-tight">{formatCurrency(spent)}</span>
                                <span className="text-sm font-medium text-muted-foreground">/ {formatCurrency(limit)}</span>
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

                            {/* MTD vs Budget Bar Chart */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span>MTD vs Orçamento</span>
                                <span>{limit - spent > 0 ? "Disponível" : "Excedido"}</span>
                              </div>
                              <div className="relative h-8 w-full bg-secondary rounded-xl overflow-hidden border border-border">
                                {/* Budget background (full width) */}
                                <div className="absolute inset-0 bg-secondary/50" />
                                
                                {/* Spent amount */}
                                <div
                                  className={cn(
                                    "absolute top-0 left-0 h-full transition-[width,opacity] duration-700 ease-out flex items-center justify-end pr-2",
                                    isOverBudget ? "bg-destructive" : isNearLimit ? "bg-orange-400" : "bg-emerald-500"
                                  )}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                >
                                  <span className="text-[10px] font-bold text-white">{formatCurrency(spent)}</span>
                                </div>

                                {/* Budget marker line */}
                                {percentage < 100 && (
                                  <div 
                                    className="absolute top-0 bottom-0 w-0.5 bg-border z-10"
                                    style={{ left: '100%' }}
                                  />
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {isOverBudget && <AlertCircle className="h-3 w-3 text-destructive" />}
                                {limit - spent > 0
                                  ? `Disponível: ${formatCurrency(limit - spent)}`
                                  : `Excedido: ${formatCurrency(Math.abs(limit - spent))}`}
                              </span>
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
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="mt-6 focus-visible:outline-none">
            {loadingProposals ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Analisando seu histórico...</p>
              </div>
            ) : proposals && proposals.categories.length > 0 ? (
              <div className="space-y-6">
                {/* AI Recommendations */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-foreground">Geração por IA Avançada</h4>
                    <Button 
                      onClick={handleGenerateAI}
                      disabled={loadingAiProposals}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-2 font-bold transition-all shadow-md"
                    >
                      {loadingAiProposals ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Gerar Orçamentos detalhados (Cat 1 a 3)
                        </>
                      )}
                    </Button>
                  </div>
                  {aiProposals && (
                    <Card className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/50 border-indigo-200/50">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                          <Zap className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground mb-2">Visão Geral da IA</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {aiProposals.overallAdvice}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Recommendations */}
                {!aiProposals && proposals.recommendations.length > 0 && (
                  <Card className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground mb-2">Insights do seu histórico</h4>
                        <ul className="space-y-1.5">
                          {proposals.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-5 rounded-2xl bg-gradient-to-br from-white to-gray-50/50">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Mês Passado</p>
                    <p className="text-xl font-bold">{formatCurrency(proposals.totalLastMonth)}</p>
                  </Card>
                  <Card className="p-5 rounded-2xl bg-gradient-to-br from-white to-gray-50/50">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Média 3 Meses</p>
                    <p className="text-xl font-bold">{formatCurrency(proposals.totalThreeMonthAvg)}</p>
                  </Card>
                  <Card className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Proposta Total</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(proposals.totalProposed)}</p>
                  </Card>
                </div>

                {/* Proposal List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="font-bold text-foreground">Orçamentos Sugeridos</h4>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{aiProposals ? "Baseado na análise da IA do seu histórico de gastos" : "Baseado na média dos últimos 3 meses + 10% de margem de segurança"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {aiProposals ? aiProposals.recommendations.map((cat, idx) => (
                    <div
                      key={idx}
                      className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-150"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                              <Target className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <h5 className="font-bold text-foreground">
                                {cat.category1} {cat.category2 ? `> ${cat.category2}` : ""} {cat.category3 ? `> ${cat.category3}` : ""}
                              </h5>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{formatCurrency(cat.proposedAmount)}</p>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5">IA</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{cat.rationale}</p>
                      </div>
                    </div>
                  )) : proposals.categories.map((cat) => (
                    <div
                      key={cat.category1}
                      className={cn(
                        "bg-card border border-border rounded-xl p-5 hover:shadow-md transition-[box-shadow,border-color,background-color,color,opacity] duration-150 cursor-pointer",
                        expandedCategory === cat.category1 && "border-primary/30 ring-1 ring-primary/10"
                      )}
                      onClick={() => handleToggleBreakdown(cat.category1)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                            <Target className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-foreground">{cat.category1}</h5>
                              <ChevronDown className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform duration-300",
                                expandedCategory === cat.category1 && "rotate-180"
                              )} />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span>Mês passado: {formatCurrency(cat.lastMonth)}</span>
                              <span>Média: {formatCurrency(cat.threeMonthAvg)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            {cat.trend === "up" && <ArrowUpRight className="h-4 w-4 text-red-500" />}
                            {cat.trend === "down" && <ArrowDownRight className="h-4 w-4 text-emerald-500" />}
                            {cat.trend === "stable" && <Minus className="h-4 w-4 text-muted-foreground" />}
                            <span className={cn(
                              "text-xs font-medium",
                              cat.trend === "up" && "text-red-500",
                              cat.trend === "down" && "text-emerald-500",
                              cat.trend === "stable" && "text-muted-foreground"
                            )}>
                              {cat.trendPercentage > 0 ? "+" : ""}{cat.trendPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{formatCurrency(cat.proposedBudget)}</p>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[9px] px-1.5 py-0.5",
                                cat.confidence === "high" && "bg-emerald-100 text-emerald-700",
                                cat.confidence === "medium" && "bg-amber-100 text-amber-700",
                                cat.confidence === "low" && "bg-gray-100 text-gray-600"
                              )}
                            >
                              {cat.confidence === "high" ? "Alta confiança" : cat.confidence === "medium" ? "Média" : "Baixa"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Drill-down Breakdown */}
                      {expandedCategory === cat.category1 && (
                        <div className="mt-6 pt-6 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                          {loadingBreakdown === cat.category1 ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
                              <span className="text-sm text-muted-foreground">Carregando detalhes...</span>
                            </div>
                          ) : breakdownData[cat.category1] ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Detalhamento (Média 3 meses)</span>
                              </div>
                              <div className="space-y-3">
                                {breakdownData[cat.category1].level2.map((l2) => (
                                  <div key={l2.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm py-1">
                                      <span className="font-bold text-foreground">{l2.name}</span>
                                      <span className="font-bold">{formatCurrency(l2.avgMonthly)}</span>
                                    </div>
                                    <div className="pl-4 space-y-1 border-l-2 border-primary/10">
                                      {l2.level3.map((l3) => (
                                        <div key={l3.name} className="flex items-center justify-between text-xs py-0.5 text-muted-foreground">
                                          <span>{l3.name}</span>
                                          <span>{formatCurrency(l3.avgMonthly)}</span>
                                        </div>
                                      ))}
                                    </div>
                                    {/* Progress bar for level 2 relative to category total */}
                                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-primary/40 rounded-full"
                                        style={{ width: `${(l2.avgMonthly / breakdownData[cat.category1].avgMonthly) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground text-center">Nenhum detalhe disponível</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Apply Button */}
                <div className="flex justify-end pt-4">
	                  <Button
	                    onClick={handleApplyProposals}
	                    disabled={applyingProposals}
	                    className="h-12 px-8 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-[background-color,box-shadow,transform,opacity] duration-150"
	                  >
                    {applyingProposals ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Aplicar Orçamentos para {formatMonth(selectedMonth)}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-secondary/50 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Sem dados suficientes</h3>
                <p className="text-muted-foreground max-w-sm">
                  Precisamos de pelo menos 1 mês de transações para gerar sugestões de orçamento.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="mt-6 focus-visible:outline-none">
            {loadingComparison ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Carregando comparativo...</p>
              </div>
            ) : comparison.length > 0 ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-secondary/30 rounded-xl text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <div>Categoria</div>
                  <div className="text-right">Este Mês</div>
                  <div className="text-right">Mês Anterior</div>
                  <div className="text-right">Média 3 Meses</div>
                </div>

                {/* Rows */}
                {comparison.map((row) => (
                  <div
                    key={row.category1}
                    className="grid grid-cols-4 gap-4 px-4 py-4 bg-card border border-border rounded-xl hover:shadow-md transition-[box-shadow,border-color,background-color,color,opacity] duration-150"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold text-foreground">{row.category1}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(row.currentMonth)}</p>
                      {row.changeFromLastMonth !== 0 && (
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          {row.changeFromLastMonth > 0 ? (
                            <ArrowUpRight className="h-3 w-3 text-red-500" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-emerald-500" />
                          )}
                          <span className={cn(
                            "text-[10px] font-medium",
                            row.changeFromLastMonth > 0 ? "text-red-500" : "text-emerald-500"
                          )}>
                            {row.changeFromLastMonth > 0 ? "+" : ""}{row.changeFromLastMonth.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-muted-foreground">{formatCurrency(row.lastMonth)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-muted-foreground">{formatCurrency(row.threeMonthAvg)}</p>
                      {row.changeFromAvg !== 0 && (
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          {row.changeFromAvg > 5 ? (
                            <span className="text-[10px] text-red-500">Acima da média</span>
                          ) : row.changeFromAvg < -5 ? (
                            <span className="text-[10px] text-emerald-500">Abaixo da média</span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Na média</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="grid grid-cols-4 gap-4 px-4 py-4 bg-primary/5 border border-primary/20 rounded-xl mt-2">
                  <div className="font-bold text-primary">Total</div>
                  <div className="text-right font-bold text-primary">
                    {formatCurrency(comparison.reduce((sum, c) => sum + c.currentMonth, 0))}
                  </div>
                  <div className="text-right font-bold text-muted-foreground">
                    {formatCurrency(comparison.reduce((sum, c) => sum + c.lastMonth, 0))}
                  </div>
                  <div className="text-right font-bold text-muted-foreground">
                    {formatCurrency(comparison.reduce((sum, c) => sum + c.threeMonthAvg, 0))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-secondary/50 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Sem dados para comparar</h3>
                <p className="text-muted-foreground max-w-sm">
                  Ainda não há transações suficientes para exibir um comparativo.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
