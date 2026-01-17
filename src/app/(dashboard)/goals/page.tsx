import { auth } from "@/auth";
import { Target } from "lucide-react";
import { getMonthlyProjection } from "@/lib/actions/goals";
import { getCalendarEvents } from "@/lib/actions/calendar";
import { GoalsClient } from "@/components/goals/goals-client";

export default async function GoalsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para ver suas metas.</p>
      </div>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Get projection data
  const rawProjection = await getMonthlyProjection();

  // Map projection to expected format
  const projection = rawProjection
    ? {
        projectedBalance: rawProjection.projectedBalance,
        currentBalance: rawProjection.totalBalance,
        projectedChange: rawProjection.projectedBalance - rawProjection.totalBalance,
        projectedIncome: rawProjection.projectedIncome,
        projectedExpenses: rawProjection.projectedTotal,
        daysRemaining: rawProjection.daysRemaining,
        dailyAverageSpend: rawProjection.dailyAverageSpend,
        confidence: Math.min(95, Math.max(50, 70 + rawProjection.daysPassed * 2)), // Higher confidence as month progresses
      }
    : null;

  // Get upcoming calendar events for the next 30 days
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  const calendarEvents = await getCalendarEvents(now, thirtyDaysFromNow);

  const upcomingEvents = calendarEvents.map((e) => ({
    id: e.id,
    name: e.name,
    amount: e.amount,
    nextDueDate: e.nextDueDate,
    category1: e.category1,
    type: e.amount >= 0 ? ("income" as const) : ("expense" as const),
  }));

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-7xl mx-auto px-1">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm animate-fade-in-up">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl transition-transform duration-300 hover:scale-110">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display">
              Previsão e Metas
            </h1>
          </div>
          <p className="text-muted-foreground font-medium leading-relaxed max-w-xl">
            Projeção inteligente baseada no seu comportamento financeiro habitual.
          </p>
        </div>
      </div>

      {/* Client Component with interactive features */}
      <GoalsClient
        projection={projection}
        upcomingEvents={upcomingEvents}
        currentMonth={currentMonth}
      />
    </div>
  );
}
