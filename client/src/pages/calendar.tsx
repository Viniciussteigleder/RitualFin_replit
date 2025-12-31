/**
 * Calendar Page - Refactored
 *
 * Features:
 * - Month view: income (green) / expense (red) chips per day
 * - 4-week block selection mode
 * - Contextual detail panel (day/week)
 * - Future days show projected items
 * - Internal transactions excluded from totals
 */

import AppLayout from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useMonth } from "@/lib/month-context";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi, calendarEventsApi } from "@/lib/api";
import { MonthView } from "@/components/calendar/month-view";
import { WeekBlocksView } from "@/components/calendar/week-blocks-view";
import { DetailPanel } from "@/components/calendar/detail-panel";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarPage() {
  const { month, setMonth, formatMonth } = useMonth();
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [showRealized, setShowRealized] = useState(true);
  const [showProjected, setShowProjected] = useState(true);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", month],
    queryFn: () => transactionsApi.list(month),
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: calendarEventsApi.list,
  });

  const projectedTransactions = calendarEvents
    .filter((e: any) => e.isActive && e.nextDueDate)
    .map((event: any) => ({
      id: `proj-${event.id}`,
      paymentDate: event.nextDueDate,
      amount: Math.abs(event.amount || 0),
      type: "Despesa",
      descRaw: `${event.name} -- Projetado`,
      category1: event.category1,
      category2: event.category2,
      projected: true,
      recurring: event.recurrence && event.recurrence !== "none",
      internalTransfer: false,
    }));

  const realizedTransactions = transactions.map((t: any) => ({ ...t, projected: false }));
  const calendarTransactions = [
    ...(showRealized ? realizedTransactions : []),
    ...(showProjected ? projectedTransactions : []),
  ];

  const handlePrevMonth = () => {
    const [year, m] = month.split("-").map(Number);
    const prevMonth = subMonths(new Date(year, m - 1), 1);
    setMonth(`${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleNextMonth = () => {
    const [year, m] = month.split("-").map(Number);
    const nextMonth = addMonths(new Date(year, m - 1), 1);
    setMonth(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`);
  };

  const detailMode = view === "month" && selectedDay ? "day" : view === "week" && selectedWeek ? "week" : null;
  const detailDate = view === "month" ? selectedDay : selectedWeek;

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendário</h1>
            <p className="text-muted-foreground">
              Visualize suas transações por dia ou semana
            </p>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[150px] text-center">
              {formatMonth(month)}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week")}>
          <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Realizado
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-amber-500" />
              Projetado
            </span>
            <div className="flex items-center gap-2">
              <Switch
                id="toggle-realized"
                checked={showRealized}
                onCheckedChange={setShowRealized}
              />
              <Label htmlFor="toggle-realized" className="text-xs text-muted-foreground">
                Mostrar realizados
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="toggle-projected"
                checked={showProjected}
                onCheckedChange={setShowProjected}
              />
              <Label htmlFor="toggle-projected" className="text-xs text-muted-foreground">
                Mostrar projetados
              </Label>
            </div>
          </div>
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="week">4 Semanas</TabsTrigger>
          </TabsList>

          {/* Month View + Detail Panel */}
          <TabsContent value="month" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {isLoading ? (
                  <div className="bg-white rounded-lg border p-12 text-center">
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                ) : (
                  <MonthView
                    month={month}
                    transactions={calendarTransactions}
                    selectedDay={selectedDay}
                    onDaySelect={setSelectedDay}
                  />
                )}
              </div>
              <div className="lg:col-span-1">
                <DetailPanel
                  mode={detailMode}
                  selectedDate={detailDate}
                  transactions={calendarTransactions}
                />
              </div>
            </div>
          </TabsContent>

          {/* Week Blocks View + Detail Panel */}
          <TabsContent value="week" className="mt-6">
            <div className="space-y-6">
              {isLoading ? (
                <div className="bg-white rounded-lg border p-12 text-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : (
                <WeekBlocksView
                  month={month}
                  transactions={calendarTransactions}
                  selectedWeek={selectedWeek}
                  onWeekSelect={setSelectedWeek}
                />
              )}
              {selectedWeek && (
                <DetailPanel
                  mode="week"
                  selectedDate={selectedWeek}
                  transactions={calendarTransactions}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
