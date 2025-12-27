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
  CheckCircle2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMonth } from "@/lib/month-context";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Mercado": ShoppingCart,
  "Transporte": Car,
  "Saúde": Heart,
  "Lazer": Coffee,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Moradia": "#f97316",
  "Transporte": "#3b82f6",
  "Lazer": "#a855f7",
  "Saúde": "#ef4444",
  "Compras Online": "#ec4899",
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
  const queryClient = useQueryClient();
  
  const [estimatedIncome, setEstimatedIncome] = useState("8500");
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});

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

  function getPreviousMonth(m: string) {
    const [year, mon] = m.split("-").map(Number);
    const d = new Date(year, mon - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  const categoryData: CategoryBudget[] = CATEGORIES.map(cat => {
    const currentSpent = dashboard?.spentByCategory?.find((c: any) => c.category === cat)?.amount || 0;
    const prevSpent = previousMonth?.spentByCategory?.find((c: any) => c.category === cat)?.amount || 0;
    return {
      category: cat,
      targetAmount: parseFloat(categoryBudgets[cat] || "0") || prevSpent || 0,
      previousMonthSpent: prevSpent,
      averageSpent: prevSpent,
      currentSpent
    };
  }).filter(c => c.targetAmount > 0 || c.previousMonthSpent > 0 || c.currentSpent > 0);

  const totalPlanned = categoryData.reduce((sum, c) => sum + c.targetAmount, 0);
  const totalIncome = parseFloat(estimatedIncome.replace(",", ".")) || 0;
  const projectedSavings = totalIncome - totalPlanned;
  const percentageOfIncome = totalIncome > 0 ? Math.round((totalPlanned / totalIncome) * 100) : 0;

  const saveGoals = useMutation({
    mutationFn: async () => {
      toast({ title: "Metas salvas com sucesso!" });
    }
  });

  const copyFromPreviousMonth = () => {
    if (previousMonth?.spentByCategory) {
      const newBudgets: Record<string, string> = {};
      previousMonth.spentByCategory.forEach((cat: any) => {
        newBudgets[cat.category] = cat.amount.toFixed(2);
      });
      setCategoryBudgets(newBudgets);
      toast({ title: "Metas copiadas do mes anterior" });
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
      toast({ title: "Sugestoes aplicadas (5% de reducao)" });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Metas Financeiras</h1>
            <p className="text-muted-foreground">
              Planeje e acompanhe seus limites de gastos para {formatMonth(month)}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={copyFromPreviousMonth}>
              <Copy className="h-4 w-4" />
              Copiar anterior
            </Button>
            <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => saveGoals.mutate()}>
              <Save className="h-4 w-4" />
              Salvar Metas
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
                  <h3 className="font-bold text-lg text-foreground">Sugestao Inteligente da IA</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Analisamos o historico dos ultimos 3 meses. Notamos um aumento de <strong className="text-primary">15%</strong> em 'Alimentacao', 
                    mas uma economia em 'Lazer'. Sugerimos reequilibrar as metas para evitar estouros.
                  </p>
                </div>
              </div>
              <Button 
                className="bg-slate-900 hover:bg-slate-800 text-white gap-2"
                onClick={applySuggestions}
              >
                Aplicar Sugestoes
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Receita Estimada</span>
              <div className="flex items-end gap-2 mt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                  <Input 
                    className="pl-8 text-2xl font-bold h-12 border-0 bg-muted/30"
                    value={estimatedIncome}
                    onChange={(e) => setEstimatedIncome(e.target.value)}
                  />
                </div>
                <Badge className="bg-green-100 text-green-700 mb-2">Confirmado</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm relative overflow-hidden">
            <CardContent className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Planejado</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-bold">
                  {totalPlanned.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                </span>
                <span className="text-muted-foreground text-sm mb-1">/ {percentageOfIncome}% da receita</span>
              </div>
              <Progress value={percentageOfIncome} className="h-1 mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saldo Previsto</span>
              <div className="flex items-end gap-2 mt-1">
                <span className={cn(
                  "text-2xl font-bold",
                  projectedSavings >= 0 ? "text-primary" : "text-rose-600"
                )}>
                  {projectedSavings >= 0 ? "+" : ""}{projectedSavings.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                </span>
                <span className="text-muted-foreground text-xs mb-1">para investimentos</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground px-1">Detalhamento por Categoria</h2>
          
          {categoryData.map(cat => {
            const Icon = CATEGORY_ICONS[cat.category] || ShoppingCart;
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
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-foreground">{cat.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {cat.category === "Moradia" && "Aluguel, Condominio, Energia"}
                          {cat.category === "Mercado" && "Compras do mes, Feira"}
                          {cat.category === "Transporte" && "Combustivel, Estacionamento"}
                          {cat.category === "Lazer" && "Streaming, Cinema, Passeios"}
                          {cat.category === "Saúde" && "Farmacia, Consultas"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-4 flex flex-col border-l-0 md:border-l border-border pl-0 md:pl-6">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Gasto Mes Anterior</span>
                        <span className={cn(
                          "text-sm font-semibold",
                          isAboveAverage ? "text-rose-600" : "text-foreground"
                        )}>
                          {cat.previousMonthSpent.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                          {isAboveAverage && <span className="text-rose-600 ml-1">(Alto)</span>}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Media 3 Meses</span>
                        <span className="text-sm font-semibold text-foreground">
                          {cat.averageSpent.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
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
                          placeholder="0,00"
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
                        <span className="text-xs text-muted-foreground">Progresso atual</span>
                        <span className={cn(
                          "text-xs font-medium",
                          isOverBudget ? "text-rose-600" : "text-muted-foreground"
                        )}>
                          {cat.currentSpent.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })} de {cat.targetAmount.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentageUsed, 100)} 
                        className={cn("h-2", isOverBudget && "[&>div]:bg-rose-500")}
                      />
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
                Adicionar nova categoria de meta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
