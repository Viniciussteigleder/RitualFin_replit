import { getTransactions, getDashboardData, getSpendAveragesAllPeriods } from "@/lib/actions/transactions";
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
  ArrowRight,
  MoreHorizontal,
  Wallet,
  CreditCard,
  Banknote,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import dynamicImport from "next/dynamic";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions-list";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AppIcon } from "@/components/ui/app-icon";
import { AccountLogo } from "@/components/accounts/account-logo";
import { PredictiveInsights } from "@/components/dashboard/PredictiveInsights";

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

const SpendAveragesChart = dynamicImport(
  () => import("@/components/dashboard/SpendAveragesChart").then(mod => ({ default: mod.SpendAveragesChart })),
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
  const targetDate = month ? new Date(`${month}-01T00:00:00`) : new Date();

  // Fetch data with per-call error isolation
  let dashboardData: any = null;
  let transactionsData: any[] = [];
  let accounts: any[] = [];
  let spendAverages: any = null;
  let fetchError: unknown = null;

  try {
    // PERFORMANCE: Reduced from 6 parallel calls to 4 by consolidating spend averages
    // Previous: 3 separate getSpendAveragesLastMonths calls (12 DB queries)
    // Now: 1 getSpendAveragesAllPeriods call (4 DB queries)
    const [dashboardDataRes, transactionsRes, accountsRes, spendAveragesRes] = await Promise.all([
      getDashboardData(targetDate).catch((err) => {
        console.error("[Dashboard] getDashboardData error:", err);
        return null;
      }),
      getTransactions(5).catch((err) => {
        console.error("[Dashboard] getTransactions error:", err);
        return [];
      }),
      getAccounts().catch((err) => {
        console.error("[Dashboard] getAccounts error:", err);
        return [];
      }),
      getSpendAveragesAllPeriods(targetDate, [3, 6, 12]).catch((err) => {
        console.error("[Dashboard] getSpendAveragesAllPeriods error:", err);
        return null;
      }),
    ]);

    dashboardData = dashboardDataRes;
    transactionsData = transactionsRes;
    accounts = accountsRes;
    spendAverages = spendAveragesRes;
  } catch (err) {
    fetchError = err;
    console.error("[Dashboard] Data fetching error:", err);
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Erro ao Carregar Dashboard</h2>
            <p className="text-muted-foreground">Não foi possível carregar os dados. Por favor, tente novamente.</p>
            <Link href="/transactions">
              <Button>Ver Transações</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Provide fallback values if data is missing
  const { totalBalance = 0, metrics, categoryData = [] } = dashboardData || {};
    
  if (!metrics) {
    console.warn("[Dashboard] Missing metrics, using fallback values");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto" />
            <h2 className="text-2xl font-bold">Sem Dados Disponíveis</h2>
            <p className="text-muted-foreground">
              Parece que você ainda não tem dados suficientes. Comece importando suas transações.
            </p>
            <Link href="/uploads">
              <Button>Importar Dados</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { spentMonthToDate = 0, projectedSpend = 0, remainingBudget = 0, monthlyGoal = 0 } = metrics;
  
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-32 font-sans overflow-hidden">
      {/* Header Section */}
      <DashboardHeader />

      {/* TopSummaryRow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
        
        {/* BIG Focus Card: Disponível (Budget) */}
        <Card className="md:col-span-2 ritual-card bg-emerald-50/20 dark:bg-emerald-500/5 group relative overflow-hidden">
          <CardContent className="p-8 flex flex-col justify-between h-full gap-6 relative z-10">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <AppIcon 
                      icon={Wallet} 
                      color={remainingBudget > 0 ? "#10b981" : "#ef4444"} 
                      variant="gradient"
                    />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saldo Livre</span>
                        <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Para o resto do mês</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase block">Meta Mensal</span>
                    <span className="text-xs font-bold text-foreground">{formatCurrency(monthlyGoal, { hideDecimals: true })}</span>
                </div>
             </div>
             
             <div>
                <h3 className={cn(
                  "text-6xl font-bold tracking-tighter tabular-nums",
                  remainingBudget >= 0 ? "text-[var(--primary)]" : "text-destructive"
                )} suppressHydrationWarning>
                    {formatCurrency(remainingBudget, { hideDecimals: true })}
                </h3>
             </div>
             
             <div className="space-y-3">
                 <div className="flex flex-col gap-1 w-full bg-secondary h-2.5 rounded-full overflow-hidden relative">
                    <div 
                        className={cn(
                          "h-full transition-all duration-1000 ease-out",
                          remainingBudget > 0 ? "bg-primary" : "bg-destructive"
                        )} 
                        style={{ width: `${Math.max(0, Math.min((remainingBudget / monthlyGoal) * 100, 100))}%` }}
                    ></div>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    <span className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", remainingBudget > 0 ? "bg-primary" : "bg-destructive")}></div>
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
                <Card className="ritual-card ritual-card-hover group cursor-pointer border-l-[3px] border-l-[#F59E0B]">
                <CardContent className="p-8 flex flex-col justify-between h-full gap-4">
                    <div className="flex items-center gap-4">
                        <AppIcon icon={TrendingUp} color="#F59E0B" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gasto Acumulado</span>
                            <span className="text-[10px] text-muted-foreground/60 font-medium uppercase">Realizado até hoje</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold tracking-tight text-[#F59E0B] dark:text-[#F59E0B]/90" suppressHydrationWarning>
                            {formatCurrency(spentMonthToDate, { hideDecimals: true })}
                        </h3>
                    </div>
                    <Button variant="ghost" className="p-0 h-auto text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-[#F59E0B] justify-start gap-2 transition-colors">
                        Ver Extrato <ArrowRight className="h-3 w-3" />
                    </Button>
                </CardContent>
                </Card>
            </Link>

            {/* Card: Projeção Final */}
            <Link href="/transactions" className="contents">
                <Card className="ritual-card ritual-card-hover group cursor-pointer border-l-[3px] border-l-[#3B82F6]">
                <CardContent className="p-8 flex flex-col justify-between h-full gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <AppIcon icon={Activity} color="#3B82F6" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Projeção Final</span>
                            <span className="text-[10px] text-muted-foreground/60 font-medium uppercase">Baseado no perfil IA</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold tracking-tight text-foreground" suppressHydrationWarning>
                            {formatCurrency(projectedSpend, { hideDecimals: true })}
                        </h3>
                    </div>
                    <div>
                        <Badge variant="secondary" className="bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]/90 border-none text-[9px] font-bold px-2 tracking-tight uppercase">
                            Previsão estimada
                        </Badge>
                    </div>
                </CardContent>
                </Card>
            </Link>
        </div>
      </div>

      {/* Row 2: Category Chart */}
      <div className="grid grid-cols-1 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Card className="ritual-card">
            <CardContent className="p-8">
                {/* Passing full data to Client Component to handle filtering/drilldown */}
                <CategoryChart data={categoryData || []} total={spentMonthToDate} />
            </CardContent>
        </Card>
      </div>

      {/* Row 3: Predictive Insights (P6 Engine) */}
      <PredictiveInsights />

      {/* AccountCardsGrid - Kept mostly same but hide decimals */}
      <div className="flex flex-col gap-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between px-1">
          <h3 className="text-2xl font-bold text-foreground font-display">Minhas Contas</h3>
          <Link href="/accounts" className="text-sm font-bold text-primary hover:underline">Ver todas</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.length === 0 ? (
            <Card className="md:col-span-3 w-full border-dashed border-2 py-20 flex flex-col items-center justify-center text-muted-foreground bg-secondary/5 rounded-2xl">
              <Wallet className="h-10 w-10 mb-4 opacity-20" />
              <p className="font-medium">Nenhuma conta conectada</p>
              <Link href="/uploads">
                <Button variant="link" className="text-primary font-bold">Importar primeiro arquivo</Button>
              </Link>
            </Card>
          ) : (
            accounts.map((account) => {
              const sourceFilter =
                account.inferredSource ||
                ACCOUNT_FILTER_MAP[account.name] ||
                account.name;

              const institution =
                account.inferredSource ||
                ACCOUNT_FILTER_MAP[account.name] ||
                account.institution ||
                "Personal";

              const mark =
                institution === "Sparkasse"
                  ? { label: "Sparkasse", bg: "bg-red-600", fg: "text-white", initials: "S" }
                  : institution === "Amex"
                    ? { label: "Amex", bg: "bg-blue-600", fg: "text-white", initials: "AE" }
                    : institution === "M&M"
                      ? { label: "Miles & More", bg: "bg-amber-500", fg: "text-slate-900", initials: "M&M" }
                      : { label: String(institution), bg: "bg-slate-900", fg: "text-white", initials: "RF" };

              const lastUploadLabel = account.lastUploadAt
                ? new Date(account.lastUploadAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })
                : "—";

              const lastTxLabel = account.lastTransactionAt
                ? new Date(account.lastTransactionAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })
                : "—";
              
              return (
                <Card key={account.id} className="rounded-2xl bg-card border-border shadow-sm hover:shadow-lg transition-all group overflow-hidden">
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <AccountLogo
                          institution={institution}
                          fallback={
                            <div
                              className={cn(
                                "h-11 w-11 rounded-2xl flex items-center justify-center font-black text-[10px] tracking-widest shadow-sm",
                                mark.bg,
                                mark.fg
                              )}
                            >
                              {mark.initials}
                            </div>
                          }
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black text-foreground font-display truncate">{account.name}</span>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.18em] truncate">
                            {account.type.replace("_", " ")} • {mark.label}
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground/80 hover:bg-secondary font-normal">
                            <MoreHorizontal className="h-5 w-5" strokeWidth={1.6} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl">
                          <DropdownMenuItem asChild className="rounded-xl font-medium cursor-pointer">
                            <Link href={`/transactions?accounts=${encodeURIComponent(sourceFilter)}`}>
                              Ver extrato
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-xl font-medium cursor-pointer">
                            <Link href="/accounts">Abrir Contas</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-xl font-medium cursor-pointer">
                            <Link href="/uploads">Importar novo arquivo</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1">Saldo</span>
                        <span className="text-2xl font-bold text-foreground font-display tracking-tight tabular-nums" suppressHydrationWarning>
                          {typeof account.balance === "number" ? formatCurrency(account.balance, { hideDecimals: true }) : "—"}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-none px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter">
                        Ativa
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                      <span>Último upload: <span className="text-foreground/80">{lastUploadLabel}</span></span>
                      <span>Última trans.: <span className="text-foreground/80">{lastTxLabel}</span></span>
                    </div>

                    <Link href={`/transactions?accounts=${encodeURIComponent(sourceFilter)}`} className="w-full pt-3 border-t border-border/50">
                      <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 p-0 h-10 group/btn">
                        Detalhes do Extrato
                        <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Spend Averages (replaces review queue) */}
      {spendAverages ? (
        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <SpendAveragesChart data={spendAverages as any} />
        </div>
      ) : null}
    </div>
  );
}
