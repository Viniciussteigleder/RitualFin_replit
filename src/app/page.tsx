import { getTransactions, getPendingTransactions, getDashboardData } from "@/lib/actions/transactions";
import { getAccounts } from "@/lib/actions/accounts";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  RefreshCw,
  SearchCheck,
  Lightbulb,
  ArrowRight,
  MoreHorizontal,
  Wallet,
  Sparkles,
  CreditCard,
  Banknote,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { SyncStatus } from "@/components/dashboard/SyncStatus";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import dynamicImport from "next/dynamic";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions-list";

// Dynamic import for heavy chart component (reduces initial bundle)
const CategoryChart = dynamicImport(
  () => import("@/components/dashboard/CategoryChart").then(mod => ({ default: mod.CategoryChart })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
);

export const dynamic = 'force-dynamic';

const ACCOUNT_FILTER_MAP: Record<string, string> = {
  "American Express": "Amex",
  "Sparkasse Girokonto": "Sparkasse",
  "Miles & More Gold": "M&M"
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const monthParam = month;
  const targetDate = monthParam ? new Date(`${monthParam}-01T00:00:00`) : new Date();

  const dashboardData = await getDashboardData(targetDate);
  const transactionsData = await getTransactions(5);
  const pendingTransactions = await getPendingTransactions();
  const accounts = await getAccounts();
  const { totalBalance, metrics, categoryData } = dashboardData || {};
  
  if (!dashboardData || !metrics) return null;

  const { spentMonthToDate, projectedSpend, remainingBudget, monthlyGoal } = metrics;
  
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-32 font-sans overflow-hidden">
      {/* Header Section */}
      <DashboardHeader />

      {/* TopSummaryRow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* BIG Focus Card: Disponível (Budget) */}
        <Card className="md:col-span-2 rounded-2xl border-primary/20 bg-emerald-50/50 dark:bg-emerald-950/10 shadow-sm transition-all group relative overflow-hidden ring-1 ring-emerald-500/10">
           <div className={`absolute inset-0 opacity-10 ${remainingBudget > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <CardContent className="p-8 flex flex-col justify-between h-full gap-5 relative z-10">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${remainingBudget > 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-400/10 dark:text-red-400 shadow-lg shadow-red-500/20'}`}>
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.15em]">Saldo Livre</span>
                        <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">Para o resto do mês</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase block">Meta Mensal</span>
                    <span className="text-xs font-bold text-foreground">{formatCurrency(monthlyGoal, { hideDecimals: true })}</span>
                </div>
             </div>
             
             <div>
                <h3 className={`text-6xl font-bold font-display tracking-tightest ${remainingBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`} suppressHydrationWarning>
                    {formatCurrency(remainingBudget, { hideDecimals: true })}
                </h3>
             </div>
             
             <div className="space-y-3">
                 <div className="flex flex-col gap-1 w-full bg-secondary h-3 rounded-full overflow-hidden relative border border-border/50">
                    <div 
                        className={`h-full ${remainingBudget > 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500 transition-all duration-500'}`} 
                        style={{ width: `${Math.max(0, Math.min((remainingBudget / monthlyGoal) * 100, 100))}%` }}
                    ></div>
                 </div>
                 <div className="flex justify-between items-center text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/80">
                    <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Você ainda tem {Math.round((remainingBudget / monthlyGoal) * 100)}%
                    </span>
                    <span className="opacity-50">Budget Total</span> 
                 </div>
             </div>
          </CardContent>
        </Card>

        {/* Secondary Info Stack */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
            {/* Card: Gasto Realizado */}
            <Link href="/transactions" className="contents">
                <Card className="rounded-2xl border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer border-l-4 border-l-orange-500/50">
                <CardContent className="p-8 flex flex-col justify-between h-full gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gasto Acumulado</span>
                            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase">Realizado até hoje</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold font-display text-orange-600 dark:text-orange-400 tracking-tight" suppressHydrationWarning>
                            {formatCurrency(spentMonthToDate, { hideDecimals: true })}
                        </h3>
                    </div>
                    <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-orange-500 justify-start gap-2">
                        Ver Extrato <ArrowRight className="h-3 w-3" />
                    </Button>
                </CardContent>
                </Card>
            </Link>

            {/* Card: Projeção Final */}
            <Link href="/transactions" className="contents">
                <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer border-l-4 border-l-blue-500/50">
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                <CardContent className="p-8 flex flex-col justify-between h-full gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Projeção Final</span>
                            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase">Baseado no perfil IA</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold text-foreground font-display tracking-tight" suppressHydrationWarning>
                            {formatCurrency(projectedSpend, { hideDecimals: true })}
                        </h3>
                    </div>
                    <div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20 text-[9px] font-black px-2 tracking-tighter uppercase">
                            Previsão estimada
                        </Badge>
                    </div>
                </CardContent>
                </Card>
            </Link>
        </div>
      </div>

      {/* Row 2: Category Chart & Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Chart Section */}
        <Card className="lg:col-span-2 rounded-2xl border-border bg-card shadow-sm p-2">
            <CardContent className="p-8">
                {/* Passing full data to Client Component to handle filtering/drilldown */}
                <CategoryChart data={categoryData || []} total={spentMonthToDate} />
            </CardContent>
        </Card>

        {/* AI Action Center Side Card */}
        <div className="flex flex-col gap-6">
             <div className={cn(
               "flex flex-col gap-6 items-start justify-between p-8 rounded-2xl border transition-all h-full",
               pendingTransactions.length > 0 
                ? "bg-gradient-to-br from-emerald-600 to-green-700 border-none shadow-xl shadow-emerald-500/20 text-white" 
                : "bg-card border-border shadow-sm"
             )}>
                <div className="flex flex-col gap-4 w-full">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-2",
                    pendingTransactions.length > 0 ? "bg-white/20 backdrop-blur-md" : "bg-primary/10 text-primary"
                  )}>
                      <Sparkles className={cn("h-6 w-6", pendingTransactions.length > 0 ? "text-white" : "text-primary")} />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                      <h4 className={cn(
                        "text-2xl font-bold font-display tracking-tight leading-none",
                        pendingTransactions.length > 0 ? "text-white" : "text-foreground"
                      )}>
                        {pendingTransactions.length > 0 ? "Ação Necessária" : "IA em Operação"}
                      </h4>
                      <p className={cn(
                        "text-sm font-medium leading-relaxed",
                        pendingTransactions.length > 0 ? "text-emerald-50" : "text-muted-foreground"
                      )}>
                        {pendingTransactions.length > 0 
                          ? `Existem ${pendingTransactions.length} lançamentos aguardando sua validação.` 
                          : "Tudo em ordem! Sua IA está categorizando novos gastos em tempo real."}
                      </p>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <Link href="/confirm" className="w-full block transform active:scale-[0.98] transition-all">
                      <Button className={cn(
                        "w-full py-7 h-auto rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-0",
                        pendingTransactions.length > 0 
                          ? "bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg" 
                          : "bg-emerald-500 text-white hover:bg-emerald-600"
                      )}>
                          {pendingTransactions.length > 0 ? "Começar Revisão" : "Ver Sugestões"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                  </Link>
                  
                  <div className={cn(
                    "flex items-center justify-center gap-2 pt-4 border-t",
                    pendingTransactions.length > 0 ? "border-white/10" : "border-border"
                  )}>
                    <RefreshCw className={cn("h-3 w-3", pendingTransactions.length > 0 ? "text-emerald-200" : "text-muted-foreground")} />
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      pendingTransactions.length > 0 ? "text-emerald-100" : "text-muted-foreground"
                    )}>
                      Sincronizado: <SyncStatus lastSync={dashboardData.lastSync} />
                    </span>
                  </div>
                </div>
            </div>
        </div>
      </div>

      {/* AccountCardsGrid - Kept mostly same but hide decimals */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-2xl font-bold text-foreground font-display">Minhas Contas</h3>
          <Link href="/accounts" className="text-sm font-bold text-primary hover:underline">Ver todas</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accounts.length === 0 ? (
            <Card className="col-span-1 md:col-span-3 border-dashed border-2 py-20 flex flex-col items-center justify-center text-muted-foreground bg-secondary/5 rounded-2xl">
              <Wallet className="h-10 w-10 mb-4 opacity-20" />
              <p className="font-medium">Nenhuma conta conectada</p>
              <Link href="/uploads">
                <Button variant="link" className="text-primary font-bold">Importar primeiro arquivo</Button>
              </Link>
            </Card>
          ) : (
            accounts.map((account) => {
              return (
                <Card key={account.id} className="rounded-2xl bg-card border-border shadow-sm hover:shadow-lg transition-all group overflow-hidden">
                  <CardContent className="p-8 flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary transition-colors">
                          {account.type === "credit_card" ? (
                            <CreditCard className="h-6 w-6 text-foreground group-hover:text-white transition-colors" />
                          ) : (
                            <Banknote className="h-6 w-6 text-foreground group-hover:text-white transition-colors" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-foreground font-display">{account.name}</span>
                          <span className="text-xs font-medium text-muted-foreground capitalize">
                            {account.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <Link href="/accounts">
                        <button className="p-1 hover:bg-secondary rounded-lg text-muted-foreground transition-colors">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </Link>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saldo</span>
                          <span className="text-xl font-bold text-foreground font-display" suppressHydrationWarning>
                             {formatCurrency(account.balance, { hideDecimals: true })}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Instituição</span>
                          <span className="text-sm font-bold text-muted-foreground">{account.institution || "Personal"}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-muted-foreground">Estado</span>
                          <span className="text-primary">Ativo</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none px-3 py-1 rounded-lg text-[10px] font-bold">Disponível</Badge>
                      {account.type === "credit_card" && (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-none px-3 py-1 rounded-lg text-[10px] font-bold underline decoration-2 underline-offset-2">Fatura Aberta</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
                       <Link href={`/transactions?accounts=${encodeURIComponent(ACCOUNT_FILTER_MAP[account.name] || account.name)}`}>
                            <Button variant="ghost" className="text-xs font-bold text-muted-foreground hover:text-primary p-0 h-auto">Detalhes</Button>
                       </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Review Queue & Discovery */}
      <div className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Fila de Revisão</h3>
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="flex flex-col gap-6 ">
            {/* Quick Link to Discovery if pending > 0 (assuming pending often correlates with discovery needs) */}
            <Link href="/confirm">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-xl flex items-center justify-between group/discovery cursor-pointer hover:bg-emerald-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                      <div className="bg-white dark:bg-emerald-900/40 p-2 rounded-lg text-emerald-600">
                          <SearchCheck className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">Discovery de Regras</span>
                          <span className="text-[10px] text-emerald-600/70 font-medium">Encontrar padrões em {pendingTransactions.length} itens</span>
                      </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-600 group-hover/discovery:translate-x-1 transition-transform" />
              </div>
            </Link>


            <RecentTransactionsList transactions={pendingTransactions.slice(0, 5)} />
          </div>
          <Link href="/confirm" className="mt-8">
            <Button variant="outline" className="w-full py-6 text-[10px] font-black text-foreground border-border hover:bg-secondary rounded-2xl transition-all uppercase tracking-widest">
              Revisar Tudo ({pendingTransactions.length})
            </Button>
          </Link>
        </div>
    </div>
  );
}
