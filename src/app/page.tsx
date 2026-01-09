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
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { SyncStatus } from "@/components/dashboard/SyncStatus";
import { ForecastCard } from "@/components/dashboard/ForecastCard";

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  const transactionsData = await getTransactions(5);
  const pendingTransactions = await getPendingTransactions();
  const accounts = await getAccounts();
  
  if (!dashboardData) return null;

  const { totalBalance, dailyForecast, lastSync } = dashboardData;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", { 
      style: "currency", 
      currency: "EUR",
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-32 font-sans overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 px-1">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display">Resumo Executivo</h2>
          <p className="text-muted-foreground font-medium">Controle total do seu fluxo financeiro em tempo real.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center bg-card rounded-2xl shadow-sm p-1.5 border border-border w-full sm:w-auto justify-between sm:justify-start">
            <button className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center gap-2 px-6">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground whitespace-nowrap">Janeiro 2026</span>
            </div>
            <button className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* TopSummaryRow (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Saldo em caixa */}
        <Card className="rounded-[2rem] border-border bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <CardContent className="p-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saldo em caixa</span>
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-3xl font-bold text-foreground font-display" suppressHydrationWarning>{formatCurrency(totalBalance)}</h3>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Baseado no último snapshot</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Saldo projetado */}
        <Card className="rounded-[2rem] border-border bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <CardContent className="p-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saldo projetado</span>
                <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded-lg">
                  <ArrowUpRight className="h-3 w-3" />
                  +4.2%
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-3xl font-bold text-foreground font-display" suppressHydrationWarning>{formatCurrency(totalBalance)}</h3>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Próximos 30 dias (Simulação)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Previsão */}
        <ForecastCard dailyForecast={dailyForecast} />
      </div>

      {/* Sync Status Banner */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card p-6 rounded-[2rem] border border-border shadow-sm group hover:shadow-md transition-shadow duration-500">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
            <RefreshCw className="h-6 w-6 relative z-10 animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Sincronização Ativa</span>
            <div className="flex items-center gap-2">
              <SyncStatus lastSync={lastSync} />
              <Link href="/uploads" className="text-sm font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-1 ml-2">
                Ver detalhes <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
        <Link href="/confirm">
          <Button className="w-full md:w-auto bg-foreground text-background hover:opacity-90 px-8 py-6 h-auto rounded-2xl font-bold transition-all shadow-xl shadow-foreground/5 group gap-3 text-base">
            <SearchCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Revisar Transações
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white text-[12px] font-black shadow-lg shadow-destructive/20 border-2 border-background">
              {pendingTransactions.length}
            </span>
          </Button>
        </Link>
      </div>

      {/* AccountCardsGrid */}
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
              const usagePercent = Math.min(Math.round((Math.random() * 80) + 10), 100); // Dummy usage
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
                      <button className="p-1 hover:bg-secondary rounded-lg text-muted-foreground">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saldo</span>
                          <span className="text-xl font-bold text-foreground font-display" suppressHydrationWarning>{formatCurrency(account.balance)}</span>
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
                      <Button variant="ghost" className="text-xs font-bold text-muted-foreground hover:text-primary p-0 h-auto">Detalhes</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Grid: Insights + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* AI Insight Section */}
          <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 border border-border shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-display leading-none mb-1">Ritual Insight</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Análise de IA</p>
                  </div>
                </div>
                <Badge className="bg-secondary text-muted-foreground hover:bg-secondary border-none px-4 py-1.5 rounded-full text-[10px] font-bold">ECONOMIA</Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-1">
                  <p className="text-2xl font-semibold text-foreground leading-tight tracking-tight">
                    Você reduziu em <span className="text-primary font-bold underline decoration-4 decoration-primary/20 underline-offset-4">15% os gastos variáveis</span> na última semana. 
                    <span className="block mt-2 text-muted-foreground text-sm font-medium">Isso representa uma economia projetada de 420,00 € no trimestre.</span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 border-none">Conferir Estratégia</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Review Queue */}
        <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm flex flex-col group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Revisar</h3>
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {transactionsData.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                  <Activity className="h-8 w-8 mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Tudo limpo por aqui</p>
               </div>
            ) : (
              transactionsData.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between group/item cursor-pointer hover:bg-secondary p-4 rounded-3xl transition-all duration-300">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground truncate max-w-[140px] tracking-tight">{tx.descNorm || tx.descRaw}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formatCurrency(Math.abs(Number(tx.amount)))}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl h-8 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary/10">Validar</Button>
                </div>
              ))
            )}
          </div>
          <Link href="/transactions" className="mt-8">
            <Button variant="outline" className="w-full py-6 text-[10px] font-black text-foreground border-border hover:bg-secondary rounded-2xl transition-all uppercase tracking-widest">
              Fila completa
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
