import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Save, 
  Copy, 
  Sparkles, 
  Home, 
  ShoppingCart, 
  Car, 
  Heart, 
  Coffee,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ChevronRight,
  Target,
  AlertTriangle,
  CheckCircle2,
  Package,
  Film,
  CreditCard,
  Plane,
  Music,
  Dumbbell
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMonth } from "@/lib/month-context";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { goalsApi, categoryGoalsApi } from "@/lib/api";
import { goalsCopy, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Mercado": ShoppingCart,
  "Transporte": Car,
  "Saúde": Heart,
  "Lazer": Film,
  "Compras Online": Package,
  "Viagem": Plane,
  "Streaming": Music,
  "Academia": Dumbbell,
  "Outros": CreditCard
};

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Moradia": "#f97316",
  "Transporte": "#3b82f6",
  "Lazer": "#a855f7",
  "Saúde": "#ef4444",
  "Compras Online": "#ec4899",
  "Viagem": "#06b6d4",
  "Streaming": "#f43f5e",
  "Academia": "#10b981",
  "Receitas": "#10b981",
  "Outros": "#6b7280"
};

const CATEGORIES = ["Moradia", "Mercado", "Transporte", "Lazer", "Saúde", "Compras Online", "Outros"];

interface CategoryBudget {
  category: string;
  targetAmount: number;
  previousMonthSpent: number;
  averageSpent: number;
  currentSpent: number;
}

export default function GoalsPage() {
  const { month, formatMonth } = useMonth();
  const { toast } = useToast();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
  const categoryHints = goalsCopy.categoryHints[locale] || goalsCopy.categoryHints["pt-BR"];

  const [estimatedIncome, setEstimatedIncome] = useState("8500");
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});

  // Fetch existing goal for current month
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["goals", month],
    queryFn: () => goalsApi.list(month),
  });

  const currentGoal = goalsData?.goals?.[0];

  // Fetch category goals if goal exists
  const { data: categoryGoalsData } = useQuery({
    queryKey: ["categoryGoals", currentGoal?.id],
    queryFn: () => categoryGoalsApi.list(currentGoal!.id),
    enabled: !!currentGoal?.id,
  });

  // Fetch progress if goal exists
  const { data: progressData } = useQuery({
    queryKey: ["goalProgress", currentGoal?.id],
    queryFn: () => goalsApi.getProgress(currentGoal!.id),
    enabled: !!currentGoal?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", month],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?month=${month}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  const { data: previousMonth } = useQuery({
    queryKey: ["dashboard", getPreviousMonth(month)],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?month=${getPreviousMonth(month)}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  // Load goal data into state when fetched
  useEffect(() => {
    if (currentGoal) {
      setEstimatedIncome(currentGoal.estimatedIncome.toString());
    }
  }, [currentGoal]);

  // Load category goals into state when fetched
  useEffect(() => {
    if (categoryGoalsData?.categoryGoals) {
      const budgets: Record<string, string> = {};
      categoryGoalsData.categoryGoals.forEach((cg) => {
        budgets[cg.category1] = cg.targetAmount.toString();
      });
      setCategoryBudgets(budgets);
    }
  }, [categoryGoalsData]);

  function getPreviousMonth(m: string) {
    const [year, mon] = m.split("-").map(Number);
    const d = new Date(year, mon - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  const categoryData: CategoryBudget[] = CATEGORIES.map(cat => {
    // Use progress data if available, otherwise fall back to dashboard
    const progressCat = progressData?.progress.categories.find((c) => c.category1 === cat);
    const currentSpent = progressCat?.actualSpent || dashboard?.spentByCategory?.find((c: any) => c.category === cat)?.amount || 0;

    // Get historical data from category goals
    const categoryGoal = categoryGoalsData?.categoryGoals?.find((cg) => cg.category1 === cat);
    const prevSpent = categoryGoal?.previousMonthSpent || previousMonth?.spentByCategory?.find((c: any) => c.category === cat)?.amount || 0;
    const avgSpent = categoryGoal?.averageSpent || prevSpent;

    return {
      category: cat,
      targetAmount: parseFloat(categoryBudgets[cat] || "0") || 0,
      previousMonthSpent: prevSpent,
      averageSpent: avgSpent,
      currentSpent
    };
  }).filter(c => c.targetAmount > 0 || c.previousMonthSpent > 0 || c.currentSpent > 0);

  const totalPlanned = categoryData.reduce((sum, c) => sum + c.targetAmount, 0);
  const totalIncome = parseFloat(estimatedIncome.replace(",", ".")) || 0;
  const projectedSavings = totalIncome - totalPlanned;
  const percentageOfIncome = totalIncome > 0 ? Math.round((totalPlanned / totalIncome) * 100) : 0;

  const saveGoals = useMutation({
    mutationFn: async () => {
      try {
        // Create or update goal
        let goalId = currentGoal?.id;

        if (!currentGoal) {
          // Create new goal
          const newGoal = await goalsApi.create({
            month,
            estimatedIncome: totalIncome,
            totalPlanned,
          });
          goalId = newGoal.id;
        } else if (currentGoal.estimatedIncome !== totalIncome || currentGoal.totalPlanned !== totalPlanned) {
          // Update existing goal
          await goalsApi.update(currentGoal.id, {
            estimatedIncome: totalIncome,
            totalPlanned,
          });
        }

        // Save category goals
        if (goalId) {
          await Promise.all(
            Object.entries(categoryBudgets)
              .filter(([_, amount]) => parseFloat(amount || "0") > 0)
              .map(([category, amount]) =>
                categoryGoalsApi.create(goalId!, {
                  category1: category,
                  targetAmount: parseFloat(amount),
                })
              )
          );
        }

        return { success: true };
      } catch (error: any) {
        throw new Error(error.message || "Failed to save goals");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", month] });
      queryClient.invalidateQueries({ queryKey: ["categoryGoals"] });
      queryClient.invalidateQueries({ queryKey: ["goalProgress"] });
      toast({
        title: translate(locale, goalsCopy.toastSavedTitle),
        description: translate(locale, goalsCopy.toastSavedBody)
      });
    },
    onError: (error: Error) => {
      toast({
        title: translate(locale, goalsCopy.toastSaveError),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyFromPreviousMonth = () => {
    if (previousMonth?.spentByCategory) {
      const newBudgets: Record<string, string> = {};
      previousMonth.spentByCategory.forEach((cat: any) => {
        newBudgets[cat.category] = cat.amount.toFixed(2);
      });
      setCategoryBudgets(newBudgets);
      toast({ title: translate(locale, goalsCopy.toastCopy) });
    }
  };

  const applySuggestions = () => {
    if (previousMonth?.spentByCategory) {
      const newBudgets: Record<string, string> = {};
      previousMonth.spentByCategory.forEach((cat: any) => {
        const suggested = cat.amount * 0.95;
        newBudgets[cat.category] = suggested.toFixed(2);
      });
      setCategoryBudgets(newBudgets);
      toast({ title: translate(locale, goalsCopy.toastSuggestions) });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{translate(locale, goalsCopy.title)}</h1>
            <p className="text-muted-foreground">
              {formatMessage(translate(locale, goalsCopy.subtitle), { month: formatMonth(month) })}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={copyFromPreviousMonth}
              disabled={saveGoals.isPending}
            >
              <Copy className="h-4 w-4" />
              {translate(locale, goalsCopy.copyPrevious)}
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => saveGoals.mutate()}
              disabled={saveGoals.isPending || goalsLoading}
            >
              <Save className="h-4 w-4" />
              {saveGoals.isPending ? translate(locale, goalsCopy.saving) : translate(locale, goalsCopy.saveGoals)}
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-white to-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="max-w-2xl">
                  <h3 className="font-bold text-lg text-foreground">{translate(locale, goalsCopy.aiSuggestionTitle)}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {formatMessage(translate(locale, goalsCopy.aiSuggestionBody), {
                      percent: 15,
                      category: "Alimentação",
                      savingCategory: "Lazer"
                    })}
                  </p>
                </div>
              </div>
              <Button 
                className="bg-slate-900 hover:bg-slate-800 text-white gap-2"
                onClick={applySuggestions}
              >
                {translate(locale, goalsCopy.applySuggestions)}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{translate(locale, goalsCopy.incomeLabel)}</span>
              <div className="flex items-end gap-2 mt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                  <Input 
                    className="pl-8 text-2xl font-bold h-12 border-0 bg-muted/30"
                    value={estimatedIncome}
                    onChange={(e) => setEstimatedIncome(e.target.value)}
                  />
                </div>
                <Badge className="bg-green-100 text-green-700 mb-2">{translate(locale, goalsCopy.incomeConfirmed)}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm relative overflow-hidden">
            <CardContent className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{translate(locale, goalsCopy.plannedTotalLabel)}</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-bold">
                  {currencyFormatter.format(totalPlanned)}
                </span>
                <span className="text-muted-foreground text-sm mb-1">
                  {formatMessage(translate(locale, goalsCopy.plannedPercent), { percent: percentageOfIncome })}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
                <div className="h-full bg-primary rounded-full" style={{ width: `${percentageOfIncome}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{translate(locale, goalsCopy.projectedBalanceLabel)}</span>
              <div className="flex items-end gap-2 mt-1">
                <span className={cn(
                  "text-2xl font-bold",
                  projectedSavings >= 0 ? "text-primary" : "text-rose-600"
                )}>
                  {projectedSavings >= 0 ? "+" : ""}{currencyFormatter.format(projectedSavings)}
                </span>
                <span className="text-muted-foreground text-xs mb-1">{translate(locale, goalsCopy.projectedHint)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground px-1">{translate(locale, goalsCopy.categoryBreakdown)}</h2>
          
          {categoryData.map(cat => {
            const Icon = CATEGORY_ICONS[cat.category] || CreditCard;
            const color = CATEGORY_COLORS[cat.category] || "#6b7280";
            const percentageUsed = cat.targetAmount > 0 ? Math.round((cat.currentSpent / cat.targetAmount) * 100) : 0;
            const isOverBudget = cat.currentSpent > cat.targetAmount && cat.targetAmount > 0;
            const isAboveAverage = cat.previousMonthSpent > 0 && cat.currentSpent > cat.previousMonthSpent * 1.1;
            
            return (
              <Card key={cat.category} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-foreground">{cat.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryHints[cat.category as keyof typeof categoryHints]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-4 flex flex-col border-l-0 md:border-l border-border pl-0 md:pl-6">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">{translate(locale, goalsCopy.previousMonthLabel)}</span>
                        <span className={cn(
                          "text-sm font-semibold",
                          isAboveAverage ? "text-rose-600" : "text-foreground"
                        )}>
                          {currencyFormatter.format(cat.previousMonthSpent)}
                          {isAboveAverage && <span className="text-rose-600 ml-1">{translate(locale, goalsCopy.highLabel)}</span>}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{translate(locale, goalsCopy.averageLabel)}</span>
                        <span className="text-sm font-semibold text-foreground">
                          {currencyFormatter.format(cat.averageSpent)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        <Input 
                          className={cn(
                            "pl-10 py-3 font-bold bg-muted/30 border-0",
                            isOverBudget && "ring-2 ring-rose-300 bg-rose-50"
                          )}
                          value={categoryBudgets[cat.category] || ""}
                          onChange={(e) => setCategoryBudgets(prev => ({ ...prev, [cat.category]: e.target.value }))}
                          placeholder={translate(locale, goalsCopy.budgetPlaceholder)}
                        />
                        {isAboveAverage && (
                          <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <BarChart3 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  {cat.targetAmount > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{translate(locale, goalsCopy.currentProgress)}</span>
                        <span className={cn(
                          "text-xs font-medium",
                          isOverBudget ? "text-rose-600" : "text-muted-foreground"
                        )}>
                          {formatMessage(translate(locale, goalsCopy.progressAmount), {
                            current: currencyFormatter.format(cat.currentSpent),
                            target: currencyFormatter.format(cat.targetAmount)
                          })}
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            isOverBudget ? "bg-rose-500" : "bg-primary"
                          )}
                          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Card className="border-2 border-dashed border-muted-foreground/20 bg-transparent hover:bg-muted/30 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Button variant="ghost" className="text-muted-foreground gap-2">
                <Target className="h-5 w-5" />
                {translate(locale, goalsCopy.addCategory)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
