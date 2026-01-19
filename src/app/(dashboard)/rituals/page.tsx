import { auth } from "@/auth";
import { Zap, Flame } from "lucide-react";
import { getRituals, getDailyRitualTasks, getWeeklyRitualTasks, getMonthlyRitualTasks } from "@/lib/actions/rituals";
import { RitualsClient } from "@/components/rituals/rituals-client";

export default async function RitualsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para acessar os rituais.</p>
      </div>
    );
  }

  // Fetch ritual data
  const [rituals, dailyTasks, weeklyTasks, monthlyTasks, ritualGoals] = await Promise.all([
    getRituals(),
    getDailyRitualTasks(),
    getWeeklyRitualTasks(),
    getMonthlyRitualTasks(),
    import("@/lib/actions/rituals").then(m => m.getRitualGoals()),
  ]);

  // Calculate streak from rituals
  const maxStreak = rituals.reduce((max, r) => Math.max(max, r.streak), 0);

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm animate-fade-in-up">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-2xl transition-transform duration-300 hover:scale-110">
              <Zap className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">
              Fluxo Operacional
            </h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
            A consistência é a chave. Execute seus rituais para manter o sistema sempre atualizado.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end mr-2 bg-secondary/30 p-4 rounded-3xl border border-border px-6 transition-all duration-300 hover:shadow-md hover:scale-105">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
              Sequência Atual
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-500 tracking-tighter">
                {maxStreak} {maxStreak === 1 ? "Dia" : "Dias"}
              </span>
              {maxStreak > 0 && <Flame className="h-4 w-4 text-orange-500 animate-pulse" />}
            </div>
          </div>
        </div>
      </div>

      {/* Client Component */}
      <RitualsClient
        streak={maxStreak}
        dailyTasks={dailyTasks}
        weeklyTasks={weeklyTasks}
        monthlyTasks={monthlyTasks}
        initialGoals={ritualGoals.map((g: any) => ({
          ...g,
          targetDate: g.targetDate?.toISOString(),
          createdAt: g.createdAt.toISOString(),
          updatedAt: g.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}

export const revalidate = 600; // Revalidate every 10 minutes
