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
import { cn, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { CalendarClient } from "./calendar-client";
import { NewEventDialog } from "@/components/calendar/new-event-dialog";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Por favor, faça login para ver o calendário</div>;
  }

  const params = await searchParams;
  const currentDate = params.month
    ? new Date(params.month + "-01")
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



  const monthName = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(currentDate);
  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  // ... imports and logic remain the same up to data preparation ...

  return (
    <div className="flex flex-col gap-8 pb-32 max-w-7xl mx-auto px-1">
      {/* Header & Toolbar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm animate-fade-in-up">
        <div className="flex flex-col gap-3">
           <div className="flex items-center gap-3">
               <div className="p-3 bg-blue-500/10 rounded-2xl">
                 <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Calendário Financeiro</h1>
           </div>
           <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
             Visualize seus vencimentos e planeje seu fluxo de caixa mensal.
           </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center bg-secondary/50 rounded-2xl p-1.5 border border-border">
            <Link href={`/calendar?month=${prevMonthStr}`} className="p-3 hover:bg-white dark:hover:bg-card rounded-2xl text-muted-foreground transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="px-8 flex items-center gap-3 min-w-[180px] justify-center">
              <span className="text-lg font-bold text-foreground capitalize tracking-tight">{monthName}</span>
            </div>
            <Link href={`/calendar?month=${nextMonthStr}`} className="p-3 hover:bg-white dark:hover:bg-card rounded-2xl text-muted-foreground transition-colors">
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <NewEventDialog />
        </div>
      </div>

      <CalendarClient 
        currentDate={currentDate}
        transactionsByDay={transactionsByDay}
        eventsByDay={eventsByDay}
        weeks={weeks}
        monthName={monthName}
      />
    </div>
  );
}

export const revalidate = 3600; // Revalidate every hour
