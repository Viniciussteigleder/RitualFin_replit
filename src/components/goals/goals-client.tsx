"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Lightbulb,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createGoal } from "@/lib/actions/goals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProjectionData {
  projectedBalance: number;
  currentBalance: number;
  projectedChange: number;
  projectedIncome: number;
  projectedExpenses: number;
  daysRemaining: number;
  dailyAverageSpend: number;
  confidence: number;
}

interface CalendarEvent {
  id: string;
  name: string;
  amount: number;
  nextDueDate: Date | string | null;
  category1: string | null;
  type?: "expense" | "income";
}

interface GoalsClientProps {
  projection: ProjectionData | null;
  upcomingEvents: CalendarEvent[];
  currentMonth: string;
}

export function GoalsClient({ projection, upcomingEvents, currentMonth }: GoalsClientProps) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ estimatedIncome: "" });
  const router = useRouter();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }).toUpperCase();
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split("-");
    return new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString("pt-PT", {
      month: "long",
      year: "numeric",
    });
  };

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const newDate = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleCreateGoal = async () => {
    if (!goalForm.estimatedIncome) {
      toast.error("Defina uma receita estimada");
      return;
    }

    startTransition(async () => {
      const result = await createGoal({
        month: selectedMonth,
        estimatedIncome: parseFloat(goalForm.estimatedIncome),
        categoryTargets: [], // Start with no category targets
      });

      if (result.success) {
        toast.success("Meta criada com sucesso!");
        setDialogOpen(false);
        setGoalForm({ estimatedIncome: "" });
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao criar meta");
      }
    });
  };

  const projectedBalance = projection?.projectedBalance ?? 0;
  const currentBalance = projection?.currentBalance ?? 0;
  const projectedChange = projection?.projectedChange ?? 0;
  const isPositive = projectedChange >= 0;
  const confidence = projection?.confidence ?? 0;

  // Generate calendar days for mini view
  const generateCalendarDays = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startPadding = (firstDay.getDay() + 6) % 7; // Monday = 0
    const totalDays = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startPadding; i++) {
      days.push({ day: null, events: [] });
    }

    for (let day = 1; day <= totalDays; day++) {
      const dayDate = new Date(year, month - 1, day);
      const dayEvents = upcomingEvents.filter((e) => {
        if (!e.nextDueDate) return false;
        const eventDate = new Date(e.nextDueDate);
        return (
          eventDate.getDate() === day &&
          eventDate.getMonth() === month - 1 &&
          eventDate.getFullYear() === year
        );
      });
      days.push({ day, events: dayEvents });
    }

    return days.slice(0, 35); // Show 5 weeks max
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Projection Card */}
        <div className="lg:col-span-2 bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Saldo Projetado
              </span>
              <div className="flex items-center gap-4">
                <span className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter font-display">
                  {formatCurrency(projectedBalance)}
                </span>
                <div
                  className={cn(
                    "flex items-center gap-1 font-bold text-sm px-3 py-1 rounded-xl",
                    isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
                  )}
                >
                  {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {formatCurrency(Math.abs(projectedChange))}
                </div>
              </div>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Previsto para os próximos {projection?.daysRemaining ?? 30} dias
              </p>
            </div>
          </div>

          {/* Projection Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
            <div className="bg-secondary/30 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Saldo Atual</p>
              <p className="text-lg font-bold">{formatCurrency(currentBalance)}</p>
            </div>
            <div className="bg-secondary/30 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Receitas Previstas</p>
              <p className="text-lg font-bold text-emerald-500">{formatCurrency(projection?.projectedIncome ?? 0)}</p>
            </div>
            <div className="bg-secondary/30 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Despesas Previstas</p>
              <p className="text-lg font-bold text-red-500">{formatCurrency(projection?.projectedExpenses ?? 0)}</p>
            </div>
            <div className="bg-secondary/30 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Média Diária</p>
              <p className="text-lg font-bold">{formatCurrency(projection?.dailyAverageSpend ?? 0)}/dia</p>
            </div>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="bg-card rounded-[2.5rem] border border-border shadow-sm p-10 flex flex-col">
          <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-8 shadow-inner">
            <Lightbulb className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Análise Preditiva</h3>
          <p className="text-muted-foreground font-medium leading-relaxed mb-8 flex-1">
            {projection
              ? isPositive
                ? `Parabéns! Sua projeção indica um aumento de ${formatCurrency(projectedChange)} no saldo. Continue mantendo o controle dos gastos.`
                : `Atenção: A projeção indica uma redução de ${formatCurrency(Math.abs(projectedChange))} no saldo. Considere revisar gastos variáveis.`
              : "Ainda não há dados suficientes para gerar uma projeção. Continue registrando suas transações."}
          </p>
          <div className="mt-auto space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Confiança do Modelo
              </span>
              <span className="text-xs font-bold text-foreground">{confidence}%</span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Mini Calendar */}
        <div className="lg:col-span-2 bg-card rounded-[2.5rem] border border-border shadow-sm p-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Calendar className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground font-display tracking-tight capitalize">
                {formatMonth(selectedMonth)}
              </h3>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="icon" onClick={() => changeMonth(-1)} className="h-10 w-10 rounded-xl">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" onClick={() => changeMonth(1)} className="h-10 w-10 rounded-xl">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-border/50 rounded-2xl overflow-hidden border border-border">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
              <div key={day} className="bg-secondary/40 py-3 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {day}
              </div>
            ))}
            {calendarDays.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "bg-card min-h-[80px] p-2 flex flex-col relative",
                  item.day && "hover:bg-secondary/20 transition-all"
                )}
              >
                {item.day && (
                  <>
                    <span className="text-xs font-bold text-muted-foreground">{item.day}</span>
                    {item.events.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold truncate",
                          event.type === "income"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-blue-500/10 text-blue-600"
                        )}
                      >
                        {event.name}
                      </div>
                    ))}
                    {item.events.length > 2 && (
                      <span className="text-[8px] text-muted-foreground mt-1">+{item.events.length - 2}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Próximos</h3>
            <Badge className="bg-secondary text-muted-foreground border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
              {upcomingEvents.length} Eventos
            </Badge>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="bg-card p-8 rounded-[2rem] border border-dashed border-border text-center">
              <p className="text-muted-foreground font-medium">Nenhum evento agendado</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        event.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                      )}
                    >
                      {event.type === "income" ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{event.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {event.category1 || "Evento"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                      {formatDate(event.nextDueDate)}
                    </p>
                    <p
                      className={cn(
                        "text-lg font-bold tracking-tight",
                        event.type === "income" ? "text-emerald-500" : "text-foreground"
                      )}
                    >
                      {formatCurrency(event.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Goal Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full py-6 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:bg-secondary hover:border-primary/30 hover:text-primary transition-all font-bold gap-3"
              >
                <Plus className="h-5 w-5" />
                Definir Meta do Mês
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-display flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  Nova Meta Mensal
                </DialogTitle>
                <DialogDescription>Defina quanto deseja economizar este mês.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Receita Estimada (€)</Label>
                  <Input
                    type="number"
                    placeholder="3000"
                    value={goalForm.estimatedIncome}
                    onChange={(e) => setGoalForm({ ...goalForm, estimatedIncome: e.target.value })}
                    className="h-12 font-mono text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Defina quanto você espera receber este mês.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
                  Cancelar
                </Button>
                <Button onClick={handleCreateGoal} disabled={isPending} className="rounded-xl">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Criar Meta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
