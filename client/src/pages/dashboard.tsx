import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Search,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, transactionsApi } from "@/lib/api";
import { useState } from "react";

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

  // Budget calculations (simple projection)
  const totalBudget = 2000; // Default budget
  const spent = dashboard?.totalSpent || 0;
  const remaining = Math.max(0, totalBudget - spent);
  const percentageSpent = Math.min(100, (spent / totalBudget) * 100);
  
  // Simple projection: spent so far + average daily * remaining days
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed = today.getDate();
  const dailyAvg = daysPassed > 0 ? spent / daysPassed : 0;
  const projection = spent + dailyAvg * (daysInMonth - daysPassed);
  const isOverBudget = projection > totalBudget;

  const monthDisplay = month ? format(new Date(`${month}-01`), "MMMM yyyy") : "";

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
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground capitalize">{monthDisplay}</h1>
            <p className="text-muted-foreground mt-1">Visão geral do mês</p>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" data-testid="btn-change-month">
              <CalendarDays className="h-4 w-4 mr-2" />
              Mudar Mês
            </Button>
          </div>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orçamento Restante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-remaining">€ {remaining.toFixed(2)}</div>
              <Progress value={percentageSpent} className="mt-3 h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Gasto: € {spent.toFixed(2)} / € {totalBudget.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projeção Final</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold flex items-center gap-2", isOverBudget ? "text-destructive" : "text-emerald-600")} data-testid="text-projection">
                € {projection.toFixed(2)}
                {isOverBudget ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Baseado em gastos fixos + média diária
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60 bg-slate-50/50">
             <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-700" data-testid="text-income">€ {(dashboard?.totalIncome || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Receitas do mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Transaction List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-lg font-semibold">Transações Recentes</h2>
               <div className="relative w-48">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input placeholder="Buscar..." className="pl-9 h-9" data-testid="input-search" />
               </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-muted/50 text-muted-foreground font-medium">
                     <tr>
                       <th className="px-4 py-3">Data</th>
                       <th className="px-4 py-3">Descrição</th>
                       <th className="px-4 py-3">Categoria</th>
                       <th className="px-4 py-3 text-right">Valor</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/50">
                     {recentTransactions.length === 0 ? (
                       <tr>
                         <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                           Nenhuma transação neste mês
                         </td>
                       </tr>
                     ) : (
                       recentTransactions.map((t: any) => (
                         <tr key={t.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-transaction-${t.id}`}>
                           <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                             {format(new Date(t.paymentDate), "dd.MM")}
                           </td>
                           <td className="px-4 py-3 font-medium">
                             {t.descRaw}
                             {t.needsReview && (
                               <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                 Revisar
                               </span>
                             )}
                           </td>
                           <td className="px-4 py-3 text-muted-foreground">
                             {t.category1 || "—"}
                           </td>
                           <td className={cn(
                             "px-4 py-3 text-right font-mono font-medium",
                             t.amount > 0 ? "text-emerald-600" : "text-slate-900"
                           )}>
                             {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })}
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
            
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground">Ver todas as transações</Button>
            </div>
          </div>

          {/* Side Widgets */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {(dashboard?.spentByCategory || []).length === 0 ? (
                   <p className="text-sm text-muted-foreground">Nenhum gasto registrado</p>
                 ) : (
                   dashboard?.spentByCategory.map((cat: any) => (
                     <div key={cat.category} className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span>{cat.category}</span>
                         <span className="font-mono">€ {cat.amount.toFixed(2)}</span>
                       </div>
                       <Progress value={Math.min(100, (cat.amount / spent) * 100)} className="h-1.5" />
                     </div>
                   ))
                 )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
