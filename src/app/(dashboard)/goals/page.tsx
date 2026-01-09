import { db } from "@/lib/db";
import { goals, categoryGoals } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, TrendingUp, Calendar, ArrowUpRight, Trophy, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function GoalsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 font-bold">Por favor, faça login para ver suas metas.</p>
      </div>
    );
  }

  const userGoals = await db.query.goals.findMany({
    where: eq(goals.userId, session.user.id),
    with: {
      categoryGoals: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-32">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#111816] dark:text-white tracking-tight font-display mb-1">Caminho para a Prosperidade</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Defina e acompanhe seu progresso em direção aos seus sonhos.</p>
        </div>
        <Button className="h-14 px-8 bg-[#111816] dark:bg-primary hover:bg-black dark:hover:bg-primary-dark text-white dark:text-[#111816] rounded-2xl font-black transition-all shadow-xl shadow-gray-200 dark:shadow-none gap-2 shrink-0">
          <Plus className="h-5 w-5" />
          Nova Meta
        </Button>
      </div>

      {userGoals.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50/50 dark:bg-white/5 py-24 rounded-[32px]">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white dark:bg-[#1a2c26] rounded-3xl shadow-xl flex items-center justify-center mb-8 rotate-3">
              <Star className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-[#111816] dark:text-white mb-2">Sem metas ainda</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-[360px] leading-snug font-medium">
              O primeiro passo para realizar um sonho é transformá-lo em meta. Comece definindo seu objetivo financeiro hoje.
            </p>
            <Button className="mt-10 h-14 px-10 bg-primary hover:bg-primary-dark text-[#111816] rounded-2xl font-black transition-all shadow-lg shadow-primary/20">
              Criar minha primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {userGoals.map((goal) => {
            const targetAmount = Number(goal.totalPlanned) || 0;
            const currentAmount = Number(goal.estimatedIncome) || 0;
            const progress = targetAmount > 0 
              ? (currentAmount / targetAmount) * 100 
              : 0;
            const monthDate = goal.month ? new Date(goal.month + "-01") : null;
            const isCompleted = progress >= 100;

            return (
              <div 
                key={goal.id} 
                className="group relative overflow-hidden bg-white dark:bg-[#1a2c26] border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="relative z-10 flex flex-col h-full gap-8">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:-rotate-3",
                        isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-primary/20 text-[#111816] dark:text-primary"
                      )}>
                        {isCompleted ? <Trophy className="h-7 w-7" /> : <Target className="h-7 w-7" />}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-[#111816] dark:text-white tracking-tight">
                          {goal.month ? `Meta de ${monthDate?.toLocaleDateString("pt-BR", { month: "long" })}` : "Objetivo Financeiro"}
                        </h4>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                          {monthDate?.getFullYear()}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none",
                      isCompleted 
                        ? "bg-emerald-500 text-white" 
                        : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                    )}>
                      {isCompleted ? "Concluída" : "Em andamento"}
                    </Badge>
                  </div>

                  {/* Progress Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Progresso atual</span>
                        <div className="text-3xl font-black text-[#111816] dark:text-white tracking-tighter">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(currentAmount)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Objetivo final</span>
                        <div className="text-lg font-extrabold text-[#111816] dark:text-white/60">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(targetAmount)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative h-4 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                          isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-primary-dark"
                        )} 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      >
                        {progress > 15 && (
                          <div className="absolute top-0 right-0 h-full w-8 bg-white/20 blur-sm"></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className={isCompleted ? "text-emerald-500" : "text-primary-dark"}>{progress.toFixed(0)}% concluído</span>
                      {targetAmount - currentAmount > 0 && (
                        <span className="text-gray-400">Faltam {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(targetAmount - currentAmount)}</span>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Previsão</span>
                      </div>
                      <div className="text-sm font-black text-[#111816] dark:text-white">
                        {monthDate 
                          ? monthDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
                          : "Não definida"}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary-dark dark:text-primary" />
                        <span className="text-[10px] font-bold text-primary-dark dark:text-primary uppercase tracking-widest">Ritmo</span>
                      </div>
                      <div className="text-sm font-black text-[#111816] dark:text-white">
                        + 12% este mês
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-gray-100 dark:border-gray-800 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-xs uppercase tracking-widest">
                      Ver detalhes
                    </Button>
                    <Button className="flex-1 h-12 rounded-xl bg-[#111816] dark:bg-white dark:text-[#111816] text-white font-bold transition-all hover:scale-[1.02] active:scale-98 text-xs uppercase tracking-widest shadow-lg">
                      Impulsionar
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
