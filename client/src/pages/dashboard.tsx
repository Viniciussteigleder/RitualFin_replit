import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Wallet,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, transactionsApi } from "@/lib/api";
import { useState } from "react";
import { Link } from "wouter";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Mercado": ShoppingCart,
  "Transporte": Car,
  "Alimentacao": Utensils,
  "Lazer": TrendingUp,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Moradia": "bg-primary",
  "Mercado": "bg-primary/80",
  "Transporte": "bg-primary/60",
  "Alimentacao": "bg-primary/80",
  "Lazer": "bg-primary/40",
  "Outros": "bg-gray-300",
};

export default function DashboardPage() {
  const [month] = useState(() => new Date().toISOString().slice(0, 7));

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard", month],
    queryFn: () => dashboardApi.get(month),
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["transactions", month],
    queryFn: () => transactionsApi.list(month),
  });

  const recentTransactions = transactions.slice(0, 5);

  const totalBudget = 2000;
  const spent = dashboard?.totalSpent || 0;
  const remaining = Math.max(0, totalBudget - spent);
  const percentageSpent = Math.min(100, (spent / totalBudget) * 100);
  
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed = today.getDate();
  const dailyAvg = daysPassed > 0 ? spent / daysPassed : 0;
  const projection = spent + dailyAvg * (daysInMonth - daysPassed);
  const isOnTrack = projection <= totalBudget;

  if (dashboardLoading || txLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Financeiro</h1>
          <p className="text-muted-foreground">Visao geral das suas financas este mes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Wallet className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Gasto ate agora</span>
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="text-spent">
                {spent.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <ArrowUpRight className="h-4 w-4 text-rose-500" />
                <span className="text-rose-500 font-medium">12%</span>
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Receitas do mes</span>
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="text-income">
                {(dashboard?.totalIncome || 0).toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <ArrowDownRight className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">5%</span>
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Orcamento</span>
                </div>
                <span className="text-xs font-medium text-primary">{Math.round(percentageSpent)}%</span>
              </div>
              <p className="text-2xl font-bold text-primary" data-testid="text-remaining">
                {remaining.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
              </p>
              <Progress value={percentageSpent} className="mt-3 h-2 bg-primary/20" />
              <p className="text-xs text-muted-foreground mt-2">
                Restante de {totalBudget.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Projecao do mes</span>
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="text-projection">
                {projection.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
              </p>
              <p className={cn("text-sm mt-2", isOnTrack ? "text-primary" : "text-rose-500")}>
                {isOnTrack ? "Dentro da meta" : "Acima da meta"} estimativa
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center justify-center py-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    {(dashboard?.spentByCategory || []).reduce((acc: any[], cat, idx) => {
                      const percentage = spent > 0 ? (cat.amount / spent) * 100 : 0;
                      const circumference = 2 * Math.PI * 40;
                      const offset = acc.length > 0 ? acc[acc.length - 1].endOffset : 0;
                      const dashArray = (percentage / 100) * circumference;
                      const colors = ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"];
                      acc.push({
                        ...cat,
                        offset,
                        dashArray,
                        endOffset: offset + dashArray,
                        color: colors[idx % colors.length]
                      });
                      return acc;
                    }, []).map((cat: any, idx: number) => (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="12"
                        strokeDasharray={`${cat.dashArray} ${2 * Math.PI * 40}`}
                        strokeDashoffset={-cat.offset}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-xl font-bold">{spent.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                {(dashboard?.spentByCategory || []).map((cat, idx) => {
                  const percentage = spent > 0 ? Math.round((cat.amount / spent) * 100) : 0;
                  const colors = ["bg-primary", "bg-primary/80", "bg-primary/60", "bg-primary/40", "bg-gray-300"];
                  return (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", colors[idx % colors.length])} />
                        <span className="text-sm">{cat.category}</span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Transacoes Recentes</CardTitle>
              <Link href="/confirm" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                Ver todas <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Data</th>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Descricao</th>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Categoria</th>
                      <th className="px-5 py-3 text-right font-medium text-xs uppercase tracking-wide">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                          Nenhuma transacao neste mes
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.map((t: any) => {
                        const Icon = CATEGORY_ICONS[t.category1] || ShoppingCart;
                        return (
                          <tr key={t.id} className="hover:bg-muted/20" data-testid={`row-transaction-${t.id}`}>
                            <td className="px-5 py-4 text-muted-foreground">
                              {format(new Date(t.paymentDate), "dd/MM")}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="font-medium truncate max-w-[200px]">{t.descRaw?.split(" -- ")[0] || t.descRaw}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {t.category1 || "Outros"}
                              </span>
                            </td>
                            <td className={cn(
                              "px-5 py-4 text-right font-medium",
                              t.amount > 0 ? "text-primary" : "text-foreground"
                            )}>
                              {t.amount > 0 ? "+" : "-"} {Math.abs(t.amount).toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
