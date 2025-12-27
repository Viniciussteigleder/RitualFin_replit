import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Calendar,
  Clock,
  Lightbulb,
  MoreHorizontal,
  RefreshCw,
  Heart,
  Plane,
  Shirt,
  Smartphone,
  Utensils,
  Zap,
  Wifi,
  GraduationCap,
  Gift,
  Banknote,
  CreditCard,
  Package,
  Film,
  Music,
  Dumbbell,
  PiggyBank
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, transactionsApi } from "@/lib/api";
import { Link } from "wouter";
import { useMonth } from "@/lib/month-context";
import { Badge } from "@/components/ui/badge";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Mercado": ShoppingCart,
  "Transporte": Car,
  "Lazer": Film,
  "Saúde": Heart,
  "Compras Online": Package,
  "Viagem": Plane,
  "Roupas": Shirt,
  "Tecnologia": Smartphone,
  "Alimentação": Utensils,
  "Energia": Zap,
  "Internet": Wifi,
  "Educação": GraduationCap,
  "Presentes": Gift,
  "Receitas": Banknote,
  "Streaming": Music,
  "Academia": Dumbbell,
  "Investimentos": PiggyBank,
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
  "Alimentação": "#84cc16",
  "Tecnologia": "#6366f1",
  "Educação": "#14b8a6",
  "Streaming": "#f43f5e",
  "Receitas": "#10b981",
  "Outros": "#6b7280",
  "Interno": "#475569"
};

interface Insight {
  id: string;
  type: "positive" | "warning" | "neutral";
  title: string;
  description: string;
  category?: string;
  percentage?: number;
}

export default function DashboardPage() {
  const { month, formatMonth } = useMonth();

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard", month],
    queryFn: () => dashboardApi.get(month),
  });

  const prevMonthStr = (() => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  const { data: prevDashboard } = useQuery({
    queryKey: ["dashboard", prevMonthStr],
    queryFn: () => dashboardApi.get(prevMonthStr),
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["transactions", month],
    queryFn: () => transactionsApi.list(month),
  });

  const { data: confirmQueue = [] } = useQuery({
    queryKey: ["confirm-queue"],
    queryFn: transactionsApi.confirmQueue,
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const res = await fetch("/api/calendar-events");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const pendingCount = confirmQueue.length;
  const recentTransactions = transactions.slice(0, 5);

  const estimatedIncome = 8500;
  const spent = dashboard?.totalSpent || 0;
  const income = dashboard?.totalIncome || 0;
  
  const today = new Date();
  const [year, monthNum] = month.split("-").map(Number);
  const currentMonthDate = new Date(year, monthNum - 1, 1);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const daysPassed = today.getMonth() === monthNum - 1 && today.getFullYear() === year ? today.getDate() : daysInMonth;
  const dailyAvg = daysPassed > 0 ? spent / daysPassed : 0;
  const projection = spent + dailyAvg * (daysInMonth - daysPassed);
  const daysRemaining = today.getMonth() === monthNum - 1 && today.getFullYear() === year ? daysInMonth - today.getDate() : 0;

  const upcomingCommitments = calendarEvents.filter((e: any) => e.isActive).slice(0, 3);
  const totalCommitted = upcomingCommitments.reduce((sum: number, e: any) => sum + e.amount, 0);
  const remaining = Math.max(0, estimatedIncome - spent);

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    if (prevDashboard && dashboard) {
      dashboard.spentByCategory?.forEach((cat: any) => {
        const prevCat = prevDashboard.spentByCategory?.find((p: any) => p.category === cat.category);
        if (prevCat && prevCat.amount > 0) {
          const change = ((cat.amount - prevCat.amount) / prevCat.amount) * 100;
          if (isFinite(change)) {
            if (change < -10) {
              insights.push({
                id: `save-${cat.category}`,
                type: "positive",
                title: `Economia em ${cat.category}`,
                description: `Você economizou ${Math.abs(change).toFixed(0)}% em ${cat.category} comparado ao mês anterior.`,
                category: cat.category,
                percentage: Math.abs(change)
              });
            } else if (change > 20) {
              insights.push({
                id: `warn-${cat.category}`,
                type: "warning",
                title: `Atenção com ${cat.category}`,
                description: `Seus gastos em ${cat.category} aumentaram ${change.toFixed(0)}% este mês.`,
                category: cat.category,
                percentage: change
              });
            }
          }
        }
      });
    }

    if (daysRemaining <= 7 && daysRemaining > 0) {
      const projectedOverspend = projection - estimatedIncome;
      if (projectedOverspend > 0) {
        insights.push({
          id: "projection-warning",
          type: "warning",
          title: "Projeção acima do orçamento",
          description: `Com base no ritmo atual, você pode gastar ${projectedOverspend.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })} a mais que o planejado.`
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        id: "default",
        type: "neutral",
        title: "Seus gastos estão estáveis",
        description: "Continue acompanhando suas despesas para manter o controle financeiro."
      });
    }

    return insights.slice(0, 2);
  };

  const insights = generateInsights();
  const mainInsight = insights[0];

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Seu Mês em Foco</h1>
            <p className="text-muted-foreground">
              Uma visão clara do seu orçamento. Sempre atualizada.
            </p>
          </div>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status do Último Importe</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Atualizado hoje às 14:00</span>
                  <Link href="/uploads" className="text-xs font-bold text-primary hover:underline">Ver detalhes</Link>
                </div>
              </div>
            </div>
            {pendingCount > 0 && (
              <Link href="/confirm">
                <Button className="bg-slate-900 hover:bg-slate-800 gap-2 shadow-lg" data-testid="button-review-transactions">
                  <AlertCircle className="h-4 w-4" />
                  Revisar Transações
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {pendingCount}
                  </span>
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border-0 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide mb-2">
                <TrendingUp className="h-5 w-5" />
                Projeção do Mês
              </div>
              <p className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                {projection.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Restante do Mês</p>
                  <p className="text-primary font-bold flex items-center gap-1 text-xl">
                    <ArrowUpRight className="h-5 w-5" />
                    {remaining.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Já Comprometido</p>
                  <p className="text-rose-600 font-bold flex items-center gap-1 text-xl">
                    <ArrowDownRight className="h-5 w-5" />
                    {spent.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wide">
                  <Calendar className="h-5 w-5" />
                  Compromissos Restantes
                </div>
                <Link href="/calendar">
                  <Button variant="ghost" size="sm" className="text-xs text-primary">
                    Ver todos
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <p className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                {totalCommitted.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
              </p>
              
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                {upcomingCommitments.length > 0 ? (
                  <>
                    <div className="flex gap-1">
                      {upcomingCommitments.map((event: any) => {
                        const Icon = CATEGORY_ICONS[event.category1] || CreditCard;
                        const color = CATEGORY_COLORS[event.category1] || "#6b7280";
                        return (
                          <div 
                            key={event.id}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${color}20` }}
                            title={event.name}
                          >
                            <Icon className="h-4 w-4" style={{ color }} />
                          </div>
                        );
                      })}
                    </div>
                    {upcomingCommitments.length > 0 && (
                      <span className="text-sm text-muted-foreground ml-auto">
                        {upcomingCommitments.length} evento(s) este mês
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum compromisso cadastrado. <Link href="/calendar" className="text-primary underline">Adicionar</Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {mainInsight && (
          <Card className={cn(
            "border-0 shadow-sm",
            mainInsight.type === "positive" && "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50",
            mainInsight.type === "warning" && "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50",
            mainInsight.type === "neutral" && "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20"
          )}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    mainInsight.type === "positive" && "bg-green-100 text-green-600",
                    mainInsight.type === "warning" && "bg-amber-100 text-amber-600",
                    mainInsight.type === "neutral" && "bg-primary/20 text-primary"
                  )}>
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      mainInsight.type === "positive" && "text-green-600",
                      mainInsight.type === "warning" && "text-amber-600",
                      mainInsight.type === "neutral" && "text-primary"
                    )}>Insight Semanal</span>
                    <p className="text-foreground font-semibold mt-1">
                      {mainInsight.description}
                    </p>
                  </div>
                </div>
                <Button variant="secondary" className="bg-white/80 hover:bg-white gap-2">
                  Ver detalhes
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="space-y-4 flex-1 w-full">
                  {(dashboard?.spentByCategory || []).slice(0, 4).map((cat: any) => {
                    const percentage = spent > 0 ? Math.round((cat.amount / spent) * 100) : 0;
                    const color = CATEGORY_COLORS[cat.category] || "#6b7280";
                    const Icon = CATEGORY_ICONS[cat.category] || CreditCard;
                    
                    return (
                      <div key={cat.category} className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-sm">{cat.category}</span>
                            <span className="text-sm font-bold" style={{ color }}>{percentage}%</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="relative w-44 h-44 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                    {(dashboard?.spentByCategory || []).reduce((acc: any[], cat: any, idx: number) => {
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
                        strokeWidth="12"
                        strokeDasharray={`${cat.dashArray} ${2 * Math.PI * 40}`}
                        strokeDashoffset={-cat.offset}
                        className="transition-all duration-500"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-foreground">
                      {(spent / 1000).toFixed(1)}k
                    </span>
                    <span className="text-xs text-muted-foreground uppercase font-medium">Total Gasto</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Atividade Recente</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {recentTransactions.length === 0 ? (
                  <div className="px-5 py-8 text-center text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma transação neste mês</p>
                  </div>
                ) : (
                  recentTransactions.map((t: any) => {
                    const Icon = CATEGORY_ICONS[t.category1] || CreditCard;
                    const color = CATEGORY_COLORS[t.category1] || "#6b7280";
                    const isIncome = t.amount > 0;
                    return (
                      <div 
                        key={t.id} 
                        className="px-5 py-3 hover:bg-muted/30 transition-colors flex items-center gap-3"
                        data-testid={`row-transaction-${t.id}`}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <Icon className="h-4 w-4" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {t.descRaw?.split(" -- ")[0]?.substring(0, 20) || t.descRaw}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(t.paymentDate), "dd MMM, HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <span className={cn(
                          "font-bold text-sm",
                          isIncome ? "text-primary" : "text-foreground"
                        )}>
                          {isIncome ? "+" : "-"} {Math.abs(t.amount).toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                        </span>
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
                      {pendingCount} transação(ões) aguardando sua confirmação. A IA já pré-analisou cada uma.
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
