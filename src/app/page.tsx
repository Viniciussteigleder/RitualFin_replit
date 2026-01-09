import { getTransactions, getPendingTransactions } from "@/lib/actions/transactions";
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
  Utensils,
  Home,
  Car,
  MoreHorizontal,
  MoveUp,
  MoveDown,
  ShoppingBag,
  Bell,
  Smartphone,
  Wallet,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const transactionsData = await getTransactions(5);
  const pendingTransactions = await getPendingTransactions();
  const allTx = await getTransactions(1000);
  
  const totalBalance = allTx.reduce((acc, tx) => acc + Number(tx.amount), 0);
  const income = allTx.filter(tx => Number(tx.amount) > 0).reduce((acc, tx) => acc + Number(tx.amount), 0);
  const expenses = allTx.filter(tx => Number(tx.amount) < 0).reduce((acc, tx) => acc + Number(tx.amount), 0);

  // Simple category breakdown for the chart
  const categories = [
    { name: "Alimentação", amount: 1250, percent: 35, color: "text-orange-500", bg: "bg-orange-400", icon: Utensils },
    { name: "Moradia", amount: 1500, percent: 42, color: "text-blue-500", bg: "bg-blue-600", icon: Home },
    { name: "Transporte", amount: 540, percent: 15, color: "text-purple-500", bg: "bg-purple-600", icon: Car },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-20 font-sans">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#111816] dark:text-white tracking-tight font-display">Seu Mês em Foco</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Uma visão clara do seu orçamento. Sempre atualizada.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="bg-gray-100 dark:bg-[#10221c] p-1 rounded-full flex items-center shadow-inner w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-white dark:bg-[#253832] text-[#111816] dark:text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap">Minha visão</button>
            <button className="flex-1 sm:flex-none px-4 py-2 rounded-full text-gray-500 dark:text-gray-400 text-xs font-medium hover:text-[#111816] dark:hover:text-white transition-all whitespace-nowrap">Visão do casal</button>
          </div>
          
          <div className="flex items-center bg-white dark:bg-[#1a2c26] rounded-full shadow-sm p-1.5 border border-gray-100 dark:border-gray-800 w-full sm:w-auto justify-between sm:justify-start">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center gap-2 px-6">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-base font-bold text-[#111816] dark:text-white whitespace-nowrap">Outubro 2023</span>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white dark:bg-[#1a2c26] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <RefreshCw className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status do Último Importe</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#111816] dark:text-white">Atualizado hoje às 14:00</span>
              <Link href="/uploads" className="text-xs font-bold text-primary hover:underline">Ver detalhes</Link>
            </div>
          </div>
        </div>
        <Link href="/confirm">
          <Button className="w-full md:w-auto bg-[#111816] dark:bg-primary hover:bg-black dark:hover:bg-primary-dark text-white dark:text-[#10221c] px-6 py-3 h-auto rounded-xl font-bold transition-all shadow-lg shadow-gray-200 dark:shadow-none group gap-2">
            <SearchCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Revisar Transações
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
              {pendingTransactions.length}
            </span>
          </Button>
        </Link>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-sm group bg-white dark:bg-[#1a2c26] border border-gray-100 dark:border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-100 transition-opacity"></div>
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm uppercase tracking-wide">
                  <TrendingUp className="h-5 w-5" />
                  Saldo Atual
                </div>
                <p className="text-4xl lg:text-5xl font-extrabold text-[#111816] dark:text-white tracking-tight mt-2 font-display">
                  {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalBalance)}
                </p>
              </div>
              <div className="bg-primary/20 p-2.5 rounded-xl backdrop-blur-sm text-primary-dark dark:text-primary">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/10">
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Ganhos</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-xl">
                  <MoveUp className="h-5 w-5" />
                  {new Intl.NumberFormat("de-DE", { notation: 'compact' }).format(income)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Gastos</p>
                <p className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 text-xl">
                  <MoveDown className="h-5 w-5" />
                  {new Intl.NumberFormat("de-DE", { notation: 'compact' }).format(Math.abs(expenses))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1e332d] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-bl from-rose-50 to-transparent dark:from-rose-900/10 dark:to-transparent opacity-60"></div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm uppercase tracking-wide">
                  <Bell className="h-5 w-5" />
                  Próximas Contas
                </div>
                <p className="text-4xl lg:text-5xl font-extrabold text-[#111816] dark:text-white tracking-tight mt-2 font-display">
                  € 1.200,00
                </p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/20 p-2.5 rounded-xl text-rose-500">
                <Smartphone className="h-6 w-6" />
              </div>
            </div>
            <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/40 dark:border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white dark:border-[#1e332d] text-[10px] font-bold text-gray-600 shadow-sm">N</div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white dark:border-[#1e332d] text-[10px] font-bold text-blue-600 shadow-sm">C</div>
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white dark:border-[#1e332d] text-[10px] font-bold text-orange-600 shadow-sm">L</div>
                </div>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40 px-2 py-1 rounded-md">Vence em 7 dias</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-400 to-rose-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Weekly Insight */}
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 opacity-90">
                  <Lightbulb className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Insight Semanal</span>
                </div>
                <p className="text-lg font-medium leading-snug">Vocês economizaram <span className="font-bold text-primary">15% em delivery</span> comparado à semana passada. 👏</p>
              </div>
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none rounded-lg font-bold gap-2 backdrop-blur-sm">
                Ver detalhes <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#111816] dark:text-white mb-6 font-display">Gastos por Categoria</h3>
              <div className="space-y-6">
                {categories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl flex items-center justify-center", cat.bg.replace('bg-', 'bg-opacity-10 bg-'))}>
                      <cat.icon className={cn("h-5 w-5", cat.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-[#111816] dark:text-white">{cat.name}</span>
                        <span className={cn("text-sm font-bold", cat.color)}>{cat.percent}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-1000", cat.bg)} 
                          style={{ width: `${cat.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full sm:w-56 h-56 relative flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-800" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="35 100" strokeLinecap="round" className="text-orange-500" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="42 100" strokeDashoffset="-35" strokeLinecap="round" className="text-blue-600" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="15 100" strokeDashoffset="-77" strokeLinecap="round" className="text-purple-600" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-[#111816] dark:text-white font-display">
                  {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", notation: "compact" }).format(Math.abs(expenses))}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total gasto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#111816] dark:text-white font-display">Atividade Recente</h3>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col gap-5 flex-1">
            {transactionsData.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-xl -mx-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                    tx.amount < 0 ? "bg-red-50 dark:bg-red-900/20 text-red-500" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                  )}>
                    {tx.amount < 0 ? <ShoppingBag className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#111816] dark:text-white truncate max-w-[120px]">{tx.descNorm || tx.descRaw}</span>
                    <span className="text-[10px] text-gray-500">{new Date(tx.paymentDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  tx.amount < 0 ? "text-red-500" : "text-emerald-600"
                )}>
                  {tx.amount > 0 ? "+" : "-"} {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Math.abs(Number(tx.amount)))}
                </span>
              </div>
            ))}
          </div>
          <Link href="/transactions" className="w-full mt-6">
            <Button variant="outline" className="w-full py-6 text-sm font-bold text-primary border-primary/20 hover:bg-primary/5 rounded-xl transition-colors h-auto">
              Ver todas as transações
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
