"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw,
  Calendar,
  Clock,
  ChevronRight,
  Target,
  Zap,
  BarChart3,
  MoreHorizontal,
  Check,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { completeRitual } from "@/lib/actions/rituals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RitualTask {
  id: string;
  name: string;
  count?: number;
  completed: boolean;
  link: string;
}

interface DailyTasks {
  pendingReview: number;
  uncategorized: number;
  todayTransactions: number;
  tasks: RitualTask[];
}

interface WeeklyTasks {
  topCategories: { category: string; amount: number }[];
  tasks: RitualTask[];
}

interface MonthlyTasks {
  summary: {
    spending: number;
    income: number;
    savings: number;
    savingsRate: number;
  };
  tasks: RitualTask[];
}

interface RitualsClientProps {
  streak: number;
  dailyTasks: DailyTasks | null;
  weeklyTasks: WeeklyTasks | null;
  monthlyTasks: MonthlyTasks | null;
}

const RITUAL_CONFIGS = {
  daily: {
    name: "Ritual Diário",
    description: "Revisar pendências, itens não categorizados e verificar movimentações do dia.",
    estimatedTime: "3–5 min",
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    link: "/transactions",
  },
  weekly: {
    name: "Ritual Semanal",
    description: "Revisar gastos por categoria, ajustar eventos recorrentes e regras.",
    estimatedTime: "10–15 min",
    icon: BarChart3,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    link: "/analytics",
  },
  monthly: {
    name: "Check-in Mensal",
    description: "Planejamento do próximo mês e análise de fechamento.",
    estimatedTime: "20–30 min",
    icon: Target,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    link: "/goals",
  },
};

export function RitualsClient({ streak, dailyTasks, weeklyTasks, monthlyTasks }: RitualsClientProps) {
  const [completingRitual, setCompletingRitual] = useState<string | null>(null);
  const router = useRouter();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const handleCompleteRitual = async (type: string) => {
    setCompletingRitual(type);
    try {
      const result = await completeRitual(type);
      if (result.success) {
        toast.success(`${RITUAL_CONFIGS[type as keyof typeof RITUAL_CONFIGS].name} completado!`, {
          description: "Continue assim para manter sua sequência.",
        });
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao completar ritual");
      }
    } catch (error) {
      toast.error("Erro ao completar ritual");
    } finally {
      setCompletingRitual(null);
    }
  };

  const getNextExecution = (type: string) => {
    const now = new Date();
    if (type === "daily") {
      return "Hoje";
    } else if (type === "weekly") {
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      return nextMonday.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "short" });
    } else {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return nextMonth.toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
    }
  };

  const getRitualStatus = (type: string) => {
    if (type === "daily") {
      const allCompleted = dailyTasks?.tasks.every((t) => t.completed) ?? false;
      return allCompleted ? "Completado" : "Pendente";
    }
    return "Pendente";
  };

  const renderTaskList = (tasks: RitualTask[] | undefined) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <div className="mt-6 space-y-3">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={task.link}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all",
              task.completed
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-secondary/30 border-border hover:bg-secondary/50"
            )}
          >
            <div className="flex items-center gap-3">
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={cn("font-medium", task.completed && "text-emerald-600")}>{task.name}</span>
              {task.count && task.count > 0 && !task.completed && (
                <Badge variant="secondary" className="text-xs">
                  {task.count}
                </Badge>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="daily" className="w-full">
      <div className="flex items-center justify-between mb-8 px-1">
        <TabsList className="bg-secondary/50 p-1 rounded-2xl border border-border h-auto">
          <TabsTrigger
            value="daily"
            className="rounded-xl px-6 py-2 h-9 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Diário
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="rounded-xl px-6 py-2 h-9 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Semanal
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="rounded-xl px-6 py-2 h-9 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Mensal
          </TabsTrigger>
        </TabsList>
      </div>

      {(["daily", "weekly", "monthly"] as const).map((period) => {
        const config = RITUAL_CONFIGS[period];
        const status = getRitualStatus(period);
        const tasks =
          period === "daily"
            ? dailyTasks?.tasks
            : period === "weekly"
              ? weeklyTasks?.tasks
              : monthlyTasks?.tasks;

        return (
          <TabsContent key={period} value={period} className="focus-visible:outline-none flex flex-col gap-6">
            <Card className="rounded-[2.5rem] bg-card border-border shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-500">
              <CardContent className="p-10">
                <div className="flex flex-col md:flex-row gap-10">
                  <div
                    className={cn(
                      "w-24 h-24 rounded-[2rem] flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6",
                      config.bgColor,
                      config.color
                    )}
                  >
                    <config.icon className="h-10 w-10" />
                  </div>

                  <div className="flex flex-col gap-6 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-2xl font-bold text-foreground font-display">{config.name}</h3>
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-lg">
                          {config.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-all">
                            <MoreHorizontal className="h-6 w-6" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl">
                          <DropdownMenuItem
                            className="rounded-xl font-bold"
                            onClick={() => handleCompleteRitual(period)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Marcar como Completo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">{config.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">{getNextExecution(period)}</span>
                      </div>
                      <Badge
                        className={cn(
                          "border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                          status === "Completado"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-orange-500/10 text-orange-500"
                        )}
                      >
                        {status}
                      </Badge>
                    </div>

                    {/* Task List */}
                    {renderTaskList(tasks)}

                    {/* Monthly Summary */}
                    {period === "monthly" && monthlyTasks?.summary && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-secondary/30 p-4 rounded-xl">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                            Gastos
                          </p>
                          <p className="text-lg font-bold text-red-500">
                            {formatCurrency(monthlyTasks.summary.spending)}
                          </p>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-xl">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                            Receitas
                          </p>
                          <p className="text-lg font-bold text-emerald-500">
                            {formatCurrency(monthlyTasks.summary.income)}
                          </p>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-xl">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                            Economia
                          </p>
                          <p
                            className={cn(
                              "text-lg font-bold",
                              monthlyTasks.summary.savings >= 0 ? "text-emerald-500" : "text-red-500"
                            )}
                          >
                            {formatCurrency(monthlyTasks.summary.savings)}
                          </p>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-xl">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                            Taxa
                          </p>
                          <p className="text-lg font-bold">{monthlyTasks.summary.savingsRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    )}

                    {/* Weekly Categories */}
                    {period === "weekly" && weeklyTasks?.topCategories && weeklyTasks.topCategories.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-muted-foreground mb-3">Top Categorias da Semana</p>
                        <div className="flex flex-wrap gap-2">
                          {weeklyTasks.topCategories.map((cat, idx) => (
                            <Badge key={idx} variant="secondary" className="px-3 py-1.5 rounded-lg">
                              {cat.category}: {formatCurrency(cat.amount)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center md:justify-end">
                    <Button
                      onClick={() => handleCompleteRitual(period)}
                      disabled={completingRitual === period}
                      className="h-16 px-10 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all text-base gap-3"
                    >
                      {completingRitual === period ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Completando...
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5" />
                          Completar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-secondary/30 border border-dashed border-border rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center opacity-60">
              <RefreshCw className="h-10 w-10 text-muted-foreground mb-4 opacity-30" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Próximo Ciclo
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Complete este ritual para manter sua sequência de {streak} dias.
              </p>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
