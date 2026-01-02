import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useMonth } from "@/lib/month-context";
import { budgetsApi, dashboardApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Trash2, Plus, TrendingUp, TrendingDown, Sparkles, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { budgetsCopy, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

const CATEGORIES = [
  "Moradia",
  "Mercado",
  "Transporte",
  "Saúde",
  "Lazer",
  "Compras Online",
  "Outros"
];

export default function BudgetsPage() {
  const { month, formatMonth } = useMonth();
  const { toast } = useToast();
  const locale = useLocale();
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets", month],
    queryFn: () => budgetsApi.list(month),
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", month],
    queryFn: () => dashboardApi.get(month),
  });

  // Get previous months for AI suggestions
  const prevMonths = Array.from({ length: 3 }, (_, i) => {
    const [year, m] = month.split("-").map(Number);
    const d = new Date(year, m - 2 - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data: prevDashboards = [] } = useQuery({
    queryKey: ["prev-dashboards", ...prevMonths],
    queryFn: async () => {
      return Promise.all(prevMonths.map(m => dashboardApi.get(m)));
    },
  });

  const createBudget = useMutation({
    mutationFn: (data: { category1: string; amount: number }) =>
      budgetsApi.create({ month, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", month] });
      toast({ title: translate(locale, budgetsCopy.toastCreated) });
      setNewCategory("");
      setNewAmount("");
    },
  });

  const updateBudget = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      budgetsApi.update(id, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", month] });
      toast({ title: translate(locale, budgetsCopy.toastUpdated) });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", month] });
      toast({ title: translate(locale, budgetsCopy.toastRemoved) });
    },
  });

  const handleCreateBudget = () => {
    if (!newCategory || !newAmount) {
      toast({ title: translate(locale, budgetsCopy.toastFillAll), variant: "destructive" });
      return;
    }
    createBudget.mutate({
      category1: newCategory,
      amount: parseFloat(newAmount),
    });
  };

  const handleUpdateBudget = (id: string, amount: string) => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      updateBudget.mutate({ id, amount: numAmount });
    }
  };

  const spentByCategory = dashboard?.spentByCategory || [];
  const getSpent = (category: string) => {
    const found = spentByCategory.find((c: any) => c.category === category);
    return found ? Math.abs(found.amount) : 0;
  };

  const unusedCategories = CATEGORIES.filter(
    (cat) => !budgets.find((b: any) => b.category1 === cat)
  );

  // Calculate AI suggestions
  const getAISuggestions = () => {
    const suggestions: Record<string, { last: number; avg: number; trend: "up" | "down" | "stable" }> = {};

    CATEGORIES.forEach(category => {
      const amounts = prevDashboards
        .map((dash: any) => {
          const cat = dash?.spentByCategory?.find((c: any) => c.category === category);
          return cat ? Math.abs(cat.amount) : 0;
        })
        .filter((amt: number) => amt > 0);

      if (amounts.length > 0) {
        const lastMonth = amounts[0] || 0;
        const avg = amounts.reduce((sum: number, amt: number) => sum + amt, 0) / amounts.length;
        const trend = lastMonth > avg * 1.1 ? "up" : lastMonth < avg * 0.9 ? "down" : "stable";
        suggestions[category] = { last: lastMonth, avg: Math.round(avg), trend };
      }
    });

    return suggestions;
  };

  const aiSuggestions = getAISuggestions();
  const hasAISuggestions = Object.keys(aiSuggestions).length > 0;

  const applyAISuggestions = () => {
    Object.entries(aiSuggestions).forEach(([category, data]) => {
      const existingBudget = budgets.find((b: any) => b.category1 === category);
      if (!existingBudget && data.avg > 0) {
        createBudget.mutate({ category1: category, amount: data.avg });
      }
    });
    toast({ title: translate(locale, budgetsCopy.toastSuggestionsApplied) });
    setShowAISuggestions(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {translate(locale, budgetsCopy.title)}
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatMessage(translate(locale, budgetsCopy.subtitle), { month: formatMonth(month) })}
          </p>
        </div>

        {/* AI Budget Suggestions */}
        {hasAISuggestions && showAISuggestions && (
          <Card className="bg-gradient-to-r from-primary/5 to-emerald-50 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {translate(locale, budgetsCopy.suggestionsTitle)}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyAISuggestions}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {translate(locale, budgetsCopy.suggestionsApply)}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {translate(locale, budgetsCopy.suggestionsBasedOn)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(aiSuggestions).slice(0, 6).map(([category, data]) => (
                  <div
                    key={category}
                    className="bg-white/80 backdrop-blur rounded-lg p-3 border border-primary/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{category}</h4>
                      {data.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : data.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{translate(locale, budgetsCopy.avg3Months)}</span>
                        <span className="font-bold text-primary">
                          {currencyFormatter.format(data.avg)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{translate(locale, budgetsCopy.lastMonth)}</span>
                        <span className="font-medium">
                          {currencyFormatter.format(data.last)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {translate(locale, budgetsCopy.addBudgetTitle)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3">
              <select
                className="flex-1 p-2 border rounded-lg"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="">{translate(locale, budgetsCopy.selectCategory)}</option>
                {unusedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder={translate(locale, budgetsCopy.amountPlaceholder)}
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCreateBudget}
                disabled={createBudget.isPending || !newCategory || !newAmount}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {translate(locale, budgetsCopy.addAction)}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Budgets List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget: any) => {
            const spent = getSpent(budget.category1);
            const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            const isOver = percent > 100;
            const isWarning = percent > 80 && percent <= 100;
            const remaining = budget.amount - spent;

            return (
              <Card key={budget.id} className="bg-white border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{budget.category1}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatMessage(translate(locale, budgetsCopy.spentOf), {
                          spent: currencyFormatter.format(spent),
                          total: currencyFormatter.format(budget.amount)
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBudget.mutate(budget.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isOver
                            ? "bg-red-500"
                            : isWarning
                            ? "bg-amber-500"
                            : "bg-primary"
                        )}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isOver
                            ? "text-red-600"
                            : isWarning
                            ? "text-amber-600"
                            : "text-primary"
                        )}
                      >
                        {percent.toFixed(0)}%
                      </span>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          remaining >= 0 ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {remaining >= 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        {currencyFormatter.format(Math.abs(remaining))}
                      </div>
                    </div>
                  </div>

                  {/* Edit Budget */}
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-xs text-muted-foreground block mb-1">
                      {translate(locale, budgetsCopy.updateBudget)}
                    </label>
                    <Input
                      type="number"
                      defaultValue={budget.amount}
                      onBlur={(e) => handleUpdateBudget(budget.id, e.target.value)}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {budgets.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                {formatMessage(translate(locale, budgetsCopy.emptyTitle), { month: formatMonth(month) })}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {translate(locale, budgetsCopy.emptyBody)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
