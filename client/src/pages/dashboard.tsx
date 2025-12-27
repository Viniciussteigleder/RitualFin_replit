import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Calendar,
  PieChart,
  Activity,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, transactionsApi } from "@/lib/api";
import { Link } from "wouter";
import { useMonth } from "@/lib/month-context";
import { Badge } from "@/components/ui/badge";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Mercado": ShoppingCart,
  "Transporte": Car,
  "Alimentacao": Utensils,
  "Lazer": TrendingUp,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Moradia": "#f97316",
  "Transporte": "#3b82f6",
  "Lazer": "#a855f7",
  "Saúde": "#ef4444",
  "Compras Online": "#ec4899",
  "Receitas": "#10b981",
  "Outros": "#6b7280",
  "Interno": "#475569"
};

export default function DashboardPage() {
  const { month, formatMonth } = useMonth();

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard", month],
    queryFn: () => dashboardApi.get(month),
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["transactions", month],
    queryFn: () => transactionsApi.list(month),
  });

  const { data: confirmQueue = [] } = useQuery({
    queryKey: ["confirm-queue"],
    queryFn: transactionsApi.confirmQueue,
  });

  const pendingCount = confirmQueue.length;
  const recentTransactions = transactions.slice(0, 6);

  const totalBudget = 2000;
  const spent = dashboard?.totalSpent || 0;
  const income = dashboard?.totalIncome || 0;
  const remaining = Math.max(0, totalBudget - spent);
  const percentageSpent = Math.min(100, (spent / totalBudget) * 100);
  
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed = today.getDate();
  const dailyAvg = daysPassed > 0 ? spent / daysPassed : 0;
  const projection = spent + dailyAvg * (daysInMonth - daysPassed);
  const isOnTrack = projection <= totalBudget;
  const daysRemaining = daysInMonth - daysPassed;

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Painel Financeiro</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Lazy Mode
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Acompanhe suas financas de {formatMonth(month)}
            </p>
          </div>
          
          {pendingCount > 0 && (
            <Link href="/confirm">
              <Button className="bg-amber-500 hover:bg-amber-600 gap-2 shadow-lg shadow-amber-500/20">
                <AlertCircle className="h-4 w-4" />
                {pendingCount} transaco(es) aguardando
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-12 lg:col-span-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-white/60 text-sm font-medium uppercase tracking-wider">
                    Orcamento de {formatMonth(month)}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-bold">
                      {remaining.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                    </span>
                    <span className="text-white/50 text-lg">restante</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-white/70">
                        Gasto: {spent.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/30" />
                      <span className="text-sm text-white/70">
                        Meta: {totalBudget.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {isOnTrack ? (
                      <TrendingDown className="h-5 w-5 text-primary" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-rose-400" />
                    )}
                    <span className={cn(
                      "text-sm font-semibold",
                      isOnTrack ? "text-primary" : "text-rose-400"
                    )}>
                      {isOnTrack ? "Dentro da meta" : "Acima da meta"}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs text-right">
                    Projecao: {projection.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                  </p>
                  <p className="text-white/40 text-xs">
                    {daysRemaining} dias restantes
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <Progress 
                  value={percentageSpent} 
                  className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-emerald-400" 
                />
                <div className="flex justify-between mt-2 text-xs text-white/50">
                  <span>0%</span>
                  <span>{Math.round(percentageSpent)}% utilizado</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Receitas</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-income">
                      {income.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Media diaria</p>
                    <p className="text-2xl font-bold text-foreground">
                      {dailyAvg.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  Gastos por Categoria
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center justify-center py-4">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                    {(dashboard?.spentByCategory || []).reduce((acc: any[], cat, idx) => {
                      const percentage = spent > 0 ? (cat.amount / spent) * 100 : 0;
                      const circumference = 2 * Math.PI * 40;
                      const offset = acc.length > 0 ? acc[acc.length - 1].endOffset : 0;
                      const dashArray = (percentage / 100) * circumference;
                      const color = CATEGORY_COLORS[cat.category] || "#6b7280";
                      acc.push({
                        ...cat,
                        offset,
                        dashArray,
                        endOffset: offset + dashArray,
                        color
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
                        strokeWidth="14"
                        strokeDasharray={`${cat.dashArray} ${2 * Math.PI * 40}`}
                        strokeDashoffset={-cat.offset}
                        className="transition-all duration-500"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-lg font-bold">
                      {spent.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2.5 mt-2">
                {(dashboard?.spentByCategory || []).slice(0, 5).map((cat) => {
                  const percentage = spent > 0 ? Math.round((cat.amount / spent) * 100) : 0;
                  const color = CATEGORY_COLORS[cat.category] || "#6b7280";
                  return (
                    <div key={cat.category} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {cat.amount.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                        </span>
                        <span className="text-xs text-muted-foreground/60 w-8 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Transacoes Recentes
              </CardTitle>
              <Link 
                href="/confirm" 
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                data-testid="link-view-all"
              >
                Ver todas <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {recentTransactions.length === 0 ? (
                  <div className="px-5 py-12 text-center text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma transacao neste mes</p>
                    <Link href="/uploads">
                      <Button variant="link" className="text-primary mt-2">
                        Importar CSV
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentTransactions.map((t: any) => {
                    const Icon = CATEGORY_ICONS[t.category1] || ShoppingCart;
                    const color = CATEGORY_COLORS[t.category1] || "#6b7280";
                    return (
                      <div 
                        key={t.id} 
                        className="px-5 py-3.5 hover:bg-muted/30 transition-colors flex items-center gap-4"
                        data-testid={`row-transaction-${t.id}`}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {t.descRaw?.split(" -- ")[0] || t.descRaw}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(t.paymentDate), "dd MMM")} • {t.category1 || "Outros"}
                          </p>
                        </div>
                        <div className={cn(
                          "font-semibold text-sm",
                          t.amount > 0 ? "text-primary" : "text-foreground"
                        )}>
                          {t.amount > 0 ? "+" : ""}{t.amount.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {pendingCount > 0 && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">Lazy Mode Ativo</h3>
                    <p className="text-sm text-amber-700/80 mt-0.5">
                      {pendingCount} transaco(es) aguardando sua confirmacao. A IA ja pre-analisou cada uma.
                    </p>
                  </div>
                </div>
                <Link href="/confirm">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20">
                    Revisar agora
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
