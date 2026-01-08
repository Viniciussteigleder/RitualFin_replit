import { db } from "@/lib/db";
import { budgets, transactions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and, sql } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function BudgetsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Please log in to view budgets</div>;
  }

  const userId = session.user.id;

  const userBudgets = await db.query.budgets.findMany({
    where: eq(budgets.userId, userId),
  });

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
    <div className="space-y-6">
      <PageHeader
        title="Budget Tracking"
        description="Monitor your spending limits across categories."
        breadcrumbs={[{ label: "Planning" }, { label: "Budgets" }]}
      >
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </PageHeader>

      {budgetsWithSpent.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50 py-20">
          <CardContent className="flex flex-col items-center text-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm mb-6">
              <TrendingDown className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No budgets set</h3>
            <p className="text-slate-500 mt-2 max-w-[320px] leading-relaxed">
              Create budgets to track your spending and stay on top of your finances.
            </p>
            <Button className="mt-6 bg-slate-900 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {budgetsWithSpent.map((budget) => {
            const spent = budget.spent;
            const limit = budget.amount;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80 && percentage <= 100;

            return (
              <Card
                key={budget.id}
                className={cn(
                  "border-slate-200 hover:shadow-md transition-all",
                  isOverBudget && "border-rose-200 bg-rose-50/30",
                  isNearLimit && "border-amber-200 bg-amber-50/30"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{budget.category1}</h3>
                      <p className="text-sm text-slate-500">
                        {budget.month 
                          ? new Date(budget.month).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })
                          : "Monthly"}
                      </p>
                    </div>
                    <Badge
                      variant={isOverBudget ? "destructive" : isNearLimit ? "secondary" : "outline"}
                      className={cn(
                        isNearLimit && "bg-amber-100 text-amber-700 border-amber-200"
                      )}
                    >
                      {isOverBudget ? (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Over Budget
                        </>
                      ) : isNearLimit ? (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Near Limit
                        </>
                      ) : (
                        "On Track"
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold text-slate-900 font-mono">
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(spent)}
                      </span>
                      <span className="text-sm text-slate-500">
                        of{" "}
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(limit)}
                      </span>
                    </div>

                    <Progress
                      value={Math.min(percentage, 100)}
                      className={cn(
                        "h-2",
                        isOverBudget && "[&>div]:bg-rose-600",
                        isNearLimit && "[&>div]:bg-amber-600"
                      )}
                    />

                    <div className="flex justify-between items-center text-xs">
                      <span
                        className={cn(
                          "font-bold",
                          isOverBudget && "text-rose-600",
                          isNearLimit && "text-amber-600",
                          !isOverBudget && !isNearLimit && "text-slate-500"
                        )}
                      >
                        {percentage.toFixed(0)}% used
                      </span>
                      <span className="text-slate-500">
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(Math.max(0, limit - spent))}{" "}
                        remaining
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
