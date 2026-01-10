import { getTransactions, getPendingTransactions, getDashboardData } from "@/lib/actions/transactions";
import { getAccounts } from "@/lib/actions/accounts";

export const dynamic = 'force-dynamic';

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
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions-list";

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Gasto no Mês (MTD) */}
        <Link href="/transactions" className="contents">
            <Card className="rounded-[2.5rem] border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer">
            <CardContent className="p-8 flex flex-col justify-between h-full gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gasto Atual (MTD)</span>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-slate-900 dark:text-white font-display text-orange-600 tracking-tight" suppressHydrationWarning>
                        {formatCurrency(spentMonthToDate, { hideDecimals: true })}
                    </h3>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Realizado até hoje
                </p>
            </CardContent>
            </Card>
        </Link>

        {/* Card 2: Projetado (Projected) */}
        <Link href="/transactions" className="contents">
            <Card className="rounded-[2.5rem] border-border bg-card shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
            <CardContent className="p-8 flex flex-col justify-between h-full gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Activity className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Projeção Final</span>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-foreground font-display tracking-tight" suppressHydrationWarning>
                        {formatCurrency(projectedSpend, { hideDecimals: true })}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-bold px-2">
                        IA ESTIMATED
                    </Badge>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Baseado no perfil
                    </p>
                </div>
            </CardContent>
            </Card>
        </Link>

        {/* Card 3: Restante Disponível (Budget) */}
        <Card className="rounded-[2.5rem] border-border bg-card shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
           <div className={`absolute inset-0 opacity-5 ${remainingBudget > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <CardContent className="p-8 flex flex-col justify-between h-full gap-4 relative z-10">
             <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${remainingBudget > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    <Wallet className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Disponível</span>
             </div>
             <div>
                <h3 className={`text-4xl font-bold font-display tracking-tight ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-500'}`} suppressHydrationWarning>
                    {formatCurrency(remainingBudget, { hideDecimals: true })}
                </h3>
             </div>
             
             {/* Progress Bar: Remaining Visual */}
             <div className="flex flex-col gap-1 w-full bg-secondary h-2.5 rounded-full overflow-hidden mt-1 relative">
                <div 
                    className={`h-full ${remainingBudget > 0 ? 'bg-emerald-500' : 'bg-red-500 transition-all duration-500'}`} 
                    style={{ width: `${Math.max(0, Math.min((remainingBudget / monthlyGoal) * 100, 100))}%` }}
                ></div>
             </div>
             
             <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Meta: {formatCurrency(monthlyGoal, { hideDecimals: true })}</span>
                <span>Restante</span> 
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Category Chart & Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Chart Section */}
        <Card className="lg:col-span-2 rounded-[2.5rem] border-border bg-card shadow-sm p-2">
            <CardContent className="p-8">
                {/* Passing full data to Client Component to handle filtering/drilldown */}
                <CategoryChart data={categoryData || []} total={spentMonthToDate} />
            </CardContent>
        </Card>

        {/* Sync Status Side Card */}
        <div className="flex flex-col gap-6">
             <div className="flex flex-col gap-4 items-start justify-between bg-card p-8 rounded-[2.5rem] border border-border shadow-sm h-full">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden mb-2">
                     {/* Animations Removed */}
                    <div className="absolute inset-0 bg-primary/10"></div>
                    <RefreshCw className="h-6 w-6 relative z-10" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Última Sincronização</span>
                    <SyncStatus lastSync={dashboardData.lastSync} />
                </div>
                
                <div className="w-full h-px bg-border my-2"></div>

                <Link href="/confirm" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-6 h-auto rounded-xl font-bold transition-all shadow-xl shadow-green-500/20 group gap-3 text-sm border-0">
                        <SearchCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        Revisar ({pendingTransactions.length})
                    </Button>
                </Link>
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
            <Card className="col-span-1 md:col-span-3 border-dashed border-2 py-20 flex flex-col items-center justify-center text-muted-foreground bg-secondary/5 rounded-[2.5rem]">
              <Wallet className="h-10 w-10 mb-4 opacity-20" />
              <p className="font-medium">Nenhuma conta conectada</p>
              <Link href="/uploads">
                <Button variant="link" className="text-primary font-bold">Importar primeiro arquivo</Button>
              </Link>
            </Card>
          ) : (
            accounts.map((account) => {
              return (
                <Card key={account.id} className="rounded-[2.5rem] bg-card border-border shadow-sm hover:shadow-lg transition-all group overflow-hidden">
                  <CardContent className="p-8 flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary transition-colors">
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

      {/* Quick Review Queue (Moved bottom) */}
      <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm flex flex-col group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Fila de Revisão</h3>
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <RecentTransactionsList transactions={transactionsData} />
          </div>
          <Link href="/transactions" className="mt-8">
            <Button variant="outline" className="w-full py-6 text-[10px] font-black text-foreground border-border hover:bg-secondary rounded-2xl transition-all uppercase tracking-widest">
              Ver todas transações
            </Button>
          </Link>
        </div>
    </div>
  );
}
