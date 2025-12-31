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
import { Link } from "wouter";
import { Trash2, Plus, TrendingUp, TrendingDown, Sparkles, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [showAISuggestions, setShowAISuggestions] = useState(true);

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
      toast({ title: "Orçamento criado" });
      setNewCategory("");
      setNewAmount("");
    },
  });

  const updateBudget = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      budgetsApi.update(id, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", month] });
      toast({ title: "Orçamento atualizado" });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", month] });
      toast({ title: "Orçamento removido" });
    },
  });

  const handleCreateBudget = () => {
    if (!newCategory || !newAmount) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
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
    toast({ title: "Sugestões aplicadas com sucesso" });
    setShowAISuggestions(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Orçamento do Mês
          </h1>
          <p className="text-muted-foreground mt-1">
            Defina limites por categoria (planejamento do mês atual) para {formatMonth(month)}
          </p>
        </div>

        {/* AI Budget Suggestions */}
        {hasAISuggestions && showAISuggestions && (
          <Card className="bg-gradient-to-r from-primary/5 to-emerald-50 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Sugestões Inteligentes de Orçamento
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyAISuggestions}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Aplicar Sugestões
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Baseado nos últimos 3 meses de gastos
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
                        <span className="text-muted-foreground">Média 3 meses:</span>
                        <span className="font-bold text-primary">
                          {data.avg.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Mês anterior:</span>
                        <span className="font-medium">
                          {data.last.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "EUR",
                          })}
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
              Adicionar Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3">
              <select
                className="flex-1 p-2 border rounded-lg"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="">Selecione uma categoria</option>
                {unusedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Valor (€)"
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
                Adicionar
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
                        {spent.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "EUR",
                        })}{" "}
                        de{" "}
                        {budget.amount.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "EUR",
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
                        {Math.abs(remaining).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Edit Budget */}
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-xs text-muted-foreground block mb-1">
                      Atualizar orçamento
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
                Nenhum orçamento definido para {formatMonth(month)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione um orçamento acima para começar a controlar seus gastos
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-slate-50 to-primary/5 border-primary/10 shadow-sm">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Próximo passo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ajuste suas metas ou revise a fila de confirmação para manter o orçamento atualizado.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/goals">
                <Button variant="outline">Rever metas</Button>
              </Link>
              <Link href="/confirm">
                <Button className="bg-primary hover:bg-primary/90">Revisar fila</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
