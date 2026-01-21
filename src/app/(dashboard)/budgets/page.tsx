import { auth } from "@/auth";
import { Target } from "lucide-react";
import { getBudgetsWithSpent } from "@/lib/actions/budgets";
import { BudgetsClient } from "@/components/budgets/budgets-client";

export default async function BudgetsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para ver seus orçamentos.</p>
      </div>
    );
  }

  // Get all budgets with spending data
  const budgetsWithSpent = await getBudgetsWithSpent();

  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-7xl mx-auto px-1">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm animate-fade-in-up">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl transition-transform duration-300 hover:scale-110">
              <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">
              Planejamento Orçamentário
            </h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
            Defina limites para cada categoria. O segredo da liberdade financeira é a intencionalidade.
          </p>
        </div>
      </div>

      {/* Client Component with all interactive features */}
      <BudgetsClient
        budgets={budgetsWithSpent.map((b) => ({
          id: b.id,
          category1: b.category1,
          amount: b.amount,
          month: b.month,
          spent: b.spent,
        }))}
        currentMonth={currentMonth}
      />
    </div>
  );
}

export const revalidate = 600; // Revalidate every 10 minutes
