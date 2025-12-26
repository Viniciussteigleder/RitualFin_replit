import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_TRANSACTIONS, MOCK_BUDGET } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function DashboardPage() {
  const budget = MOCK_BUDGET;
  const recentTransactions = MOCK_TRANSACTIONS.slice(0, 5);
  
  const percentageSpent = (budget.spent_so_far / budget.total_budget) * 100;
  
  // Projection logic helper
  const isOverBudget = budget.projection > budget.total_budget;

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Janeiro 2025</h1>
            <p className="text-muted-foreground mt-1">Visão geral do mês</p>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm">
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
              <div className="text-2xl font-bold">€ {budget.remaining.toFixed(2)}</div>
              <Progress value={percentageSpent} className="mt-3 h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Gasto: € {budget.spent_so_far.toFixed(2)} / € {budget.total_budget.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projeção Final</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold flex items-center gap-2", isOverBudget ? "text-destructive" : "text-emerald-600")}>
                € {budget.projection.toFixed(2)}
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
              <div className="text-2xl font-bold text-slate-700">€ 4,250.00</div>
              <p className="text-xs text-muted-foreground mt-2">
                Salário + Reembolsos
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
                 <Input placeholder="Buscar..." className="pl-9 h-9" />
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
                     {recentTransactions.map((t) => (
                       <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                         <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                           {format(new Date(t.payment_date), "dd.MM")}
                         </td>
                         <td className="px-4 py-3 font-medium">
                           {t.desc_raw}
                           {t.needs_review && (
                             <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                               Revisar
                             </span>
                           )}
                         </td>
                         <td className="px-4 py-3 text-muted-foreground">
                           {t.category_1 || "—"}
                         </td>
                         <td className={cn(
                           "px-4 py-3 text-right font-mono font-medium",
                           t.amount > 0 ? "text-emerald-600" : "text-slate-900"
                         )}>
                           {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })}
                         </td>
                       </tr>
                     ))}
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
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span>Moradia</span>
                     <span className="font-mono">€ 850,00</span>
                   </div>
                   <Progress value={80} className="h-1.5" />
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span>Mercado</span>
                     <span className="font-mono">€ 320,50</span>
                   </div>
                   <Progress value={45} className="h-1.5" />
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span>Lazer</span>
                     <span className="font-mono">€ 150,00</span>
                   </div>
                   <Progress value={25} className="h-1.5" />
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span>Transporte</span>
                     <span className="font-mono">€ 89,90</span>
                   </div>
                   <Progress value={15} className="h-1.5" />
                 </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
