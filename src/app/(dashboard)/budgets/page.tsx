
import { db } from "@/lib/db";
import { budgets, transactions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingDown, AlertCircle, PlusCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function BudgetsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para ver seus orçamentos.</p>
      </div>
    );
  }

  const userId = session.user.id;

  const userBudgets = await db.query.budgets.findMany({
    where: eq(budgets.userId, userId),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  // Calculate spent amounts for each budget from transactions
  const budgetsWithSpent = await Promise.all(
    userBudgets.map(async (budget) => {
      const result = await db
        .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.category1, budget.category1),
            budget.month ? eq(transactions.paymentDate, new Date(budget.month)) : sql`1=1`
          )
        );
      
      return {
        ...budget,
        spent: Math.abs(result[0]?.total || 0),
      };
    })
  );

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-7xl mx-auto px-1">
      {/* Page Header Area */}
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                 <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Planejamento Orçamentário</h1>
           </div>
           <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
             Defina limites para cada categoria. O segredo da liberdade financeira é a intencionalidade.
           </p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="hidden lg:flex flex-col items-end mr-2 bg-secondary/30 p-4 rounded-3xl border border-border px-6">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Saúde do Mês</span>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Estável</span>
                </div>
           </div>

           <Button className="h-14 px-8 bg-foreground text-background hover:scale-105 transition-all rounded-2xl font-bold shadow-xl shadow-foreground/5 gap-2">
             <PlusCircle className="h-5 w-5" />
             Novo Orçamento
           </Button>
        </div>
      </div>

      {budgetsWithSpent.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mt-40 group-hover:bg-primary/10 transition-colors"></div>
          
          <div className="relative z-10 flex flex-col items-center font-sans">
            <div className="w-24 h-24 bg-secondary/50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
              <TrendingDown className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3 font-display">Sem orçamentos definidos</h3>
            <p className="text-muted-foreground max-w-[360px] font-medium leading-relaxed px-6">
              A melhor forma de economizar é sabendo exatamente quanto você pode gastar em cada categoria.
            </p>
            <Button className="mt-12 h-16 px-12 bg-primary text-white rounded-2xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95">
              Criar Meu Primeiro Orçamento
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-8">
          {budgetsWithSpent.map((budget) => {
            const spent = budget.spent;
            const limit = budget.amount;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80 && percentage <= 100;

            return (
              <div
                key={budget.id}
                className={cn(
                  "bg-card border border-border rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden group relative",
                  isOverBudget && "border-destructive/20 bg-destructive/5"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                  <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                          isOverBudget ? "bg-destructive/10 text-destructive" : isNearLimit ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary"
                        )}>
                           <Target className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                           <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">{budget.category1}</h3>
                           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{budget.month ? new Date(budget.month + "-01").toLocaleDateString("pt-PT", { month: "long", year: "numeric" }) : "Orçamento Mensal"}</span>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none h-fit",
                          isOverBudget ? "bg-destructive text-white" : 
                          isNearLimit ? "bg-orange-400 text-white" : 
                          "bg-emerald-500/10 text-emerald-500"
                        )}
                      >
                        {isOverBudget ? "Excedido" : isNearLimit ? "Atenção" : "Em Dia"}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-bold text-foreground tracking-tighter">
                            {formatCurrency(spent)}
                          </span>
                          <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            de {formatCurrency(limit)}
                          </span>
                        </div>
                        <span className={cn(
                          "text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                          isOverBudget ? "bg-destructive/10 text-destructive" : isNearLimit ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary"
                        )}>
                          {percentage.toFixed(0)}% utilizado
                        </span>
                      </div>

                      <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={cn(
                            "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out",
                            isOverBudget ? "bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)]" : isNearLimit ? "bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.4)]" : "bg-primary shadow-[0_0_15px_rgba(0,113,227,0.4)]"
                          )} 
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground">
                        <div className="flex items-center gap-2">
                           {isOverBudget ? <AlertCircle className="h-4 w-4" /> : null}
                           <span className={cn(isOverBudget && "text-destructive")}>
                             {limit - spent > 0 ? `Saldo disponível: ${formatCurrency(limit - spent)}` : `Excedido em: ${formatCurrency(Math.abs(limit - spent))}`}
                           </span>
                        </div>
                        <span className="opacity-60">{Math.max(0, 100 - percentage).toFixed(0)}% restante</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 self-end md:self-center">
                     <Button variant="secondary" className="h-14 px-8 rounded-2xl bg-secondary/50 border-none hover:bg-secondary font-bold text-sm gap-2">
                        <Plus className="h-5 w-5" />
                        Ajustar
                     </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
