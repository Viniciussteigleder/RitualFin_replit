import { db } from "@/lib/db";
import { transactions, calendarEvents } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and, gte, lte } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Circle,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Por favor, faça login para ver o calendário</div>;
  }

  const currentDate = searchParams.month
    ? new Date(searchParams.month + "-01")
    : new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const monthTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.user.id),
      gte(transactions.paymentDate, firstDay),
      lte(transactions.paymentDate, lastDay)
    ),
  });

  const monthEvents = await db.query.calendarEvents.findMany({
    where: and(
      eq(calendarEvents.userId, session.user.id),
      gte(calendarEvents.nextDueDate, firstDay),
      lte(calendarEvents.nextDueDate, lastDay)
    ),
  });

  const transactionsByDay = monthTransactions.reduce((acc, tx) => {
    const day = new Date(tx.paymentDate).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(tx);
    return acc;
  }, {} as Record<number, typeof monthTransactions>);

  const eventsByDay = monthEvents.reduce((acc, ev) => {
    const day = new Date(ev.nextDueDate).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(ev);
    return acc;
  }, {} as Record<number, typeof monthEvents>);

  // Monday = 0, Sunday = 6
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const monthName = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(currentDate);
  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <Link href="/" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Calendário</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display">Calendário Financeiro</h2>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center bg-card rounded-2xl shadow-sm p-1 border border-border">
            <Link href={`/calendar?month=${prevMonthStr}`} className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="px-6 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground capitalize">{monthName}</span>
            </div>
            <Link href={`/calendar?month=${nextMonthStr}`} className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-colors">
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <Button className="bg-primary text-white hover:opacity-90 px-6 h-12 rounded-xl font-bold gap-2">
            <Plus className="h-5 w-5" />
            Novo evento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full items-start">
        {/* Main Grid */}
        <Card className="lg:col-span-3 rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
                <div key={day} className="py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 h-[700px]">
              {weeks.map((week, wIndex) =>
                week.map((day, dIndex) => {
                  const dayEvents = day ? eventsByDay[day] || [] : [];
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                  
                  return (
                    <div
                      key={`${wIndex}-${dIndex}`}
                      className={cn(
                        "p-3 border-r border-b border-border last:border-r-0 transition-all group/day cursor-pointer",
                        !day && "bg-secondary/10",
                        day && "hover:bg-primary/5",
                        isToday && "bg-primary/5"
                      )}
                    >
                      {day && (
                        <div className="flex flex-col h-full gap-2">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-colors",
                              isToday ? "bg-primary text-white" : "text-foreground group-hover/day:text-primary"
                            )}>
                              {day}
                            </span>
                            {dayEvents.length > 0 && (
                              <div className="flex -space-x-1">
                                {dayEvents.slice(0, 3).map((ev) => (
                                  <div key={ev.id} className="w-2 h-2 rounded-full border-2 border-card bg-primary shadow-sm" />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 overflow-hidden">
                            {dayEvents.slice(0, 2).map((ev) => (
                              <div key={ev.id} className="text-[9px] font-bold bg-white-dark:bg-secondary/50 px-2 py-1 rounded-lg border border-border truncate flex items-center gap-1.5 group/ev">
                                <Circle className="h-1.5 w-1.5 fill-current text-primary shrink-0" />
                                <span className="truncate">{ev.name}</span>
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-[8px] font-black text-muted-foreground uppercase pl-1">
                                +{dayEvents.length - 2} mais
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Events Side Panel */}
        <div className="flex flex-col gap-6">
          <Card className="rounded-[2.5rem] border-border shadow-sm bg-card h-full">
            <CardContent className="p-8">
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground font-display">Eventos do dia</h3>
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">15 Jul</Badge>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Dummy Items for demonstration as requested */}
                  <div className="p-5 rounded-3xl bg-secondary/40 border border-border group hover:border-primary/30 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase tracking-wider">Ativo</Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-bold text-foreground">Supermercado Semanal</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-foreground">{formatCurrency(450)}</span>
                        <Link href="/calendar/events/1" className="p-2 hover:bg-white rounded-lg transition-colors">
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl bg-secondary/40 border border-border group cursor-pointer opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <Badge className="bg-secondary text-muted-foreground border-none text-[8px] font-black uppercase tracking-wider">Pausado</Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-bold text-foreground">Aluguel Garagem</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-foreground">{formatCurrency(85)}</span>
                        <button className="p-2 hover:bg-white rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full py-6 rounded-2xl border-border text-[10px] font-black uppercase tracking-widest hover:bg-secondary">
                  Ver todos os eventos do mês
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Insights Card */}
          <Card className="rounded-[2.5rem] bg-foreground p-8 relative overflow-hidden text-background border-none shadow-xl">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent pointer-events-none" />
             <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                   <Circle className="h-2 w-2 fill-current" /> Insight Financeiro
                </div>
                <p className="text-base font-semibold leading-snug">Você tem <span className="text-primary font-bold">1.250,00 €</span> previstos para sair nos próximos 7 dias.</p>
                <div className="pt-4 border-t border-white/10 mt-2">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase text-white/40">
                      <span>Confiança da Projeção</span>
                      <span>85%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                   </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
