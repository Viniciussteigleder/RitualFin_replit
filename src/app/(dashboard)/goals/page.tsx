import { db } from "@/lib/db";
import { goals, categoryGoals } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, TrendingUp, Calendar } from "lucide-react";

export default async function GoalsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return <div>Please log in to view goals</div>;
  }

  const userGoals = await db.query.goals.findMany({
    where: eq(goals.userId, session.user.id),
    with: {
      categoryGoals: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Goals"
        description="Define and track your progress towards long-term savings."
        breadcrumbs={[{ label: "Planning" }, { label: "Goals" }]}
      >
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          Create Goal
        </Button>
      </PageHeader>

      {userGoals.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50 py-20">
          <CardContent className="flex flex-col items-center text-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm mb-6">
              <Target className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No goals yet</h3>
            <p className="text-slate-500 mt-2 max-w-[320px] leading-relaxed">
              Start dreaming big! Create your first financial goal to track your progress.
            </p>
            <Button className="mt-6 bg-slate-900 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {userGoals.map((goal) => {
            const targetAmount = goal.totalPlanned || 0;
            const currentAmount = goal.estimatedIncome || 0;
            const progress = targetAmount > 0 
              ? (currentAmount / targetAmount) * 100 
              : 0;
            const monthDate = goal.month ? new Date(goal.month + "-01") : null;

            return (
              <Card key={goal.id} className="overflow-hidden border-slate-200 hover:shadow-md transition-all">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-600" />
                        {goal.month ? `Goal for ${monthDate?.toLocaleDateString("en-US", { month: "long", year: "numeric" })}` : "Financial Goal"}
                      </CardTitle>
                    </div>
                    <Badge 
                      variant={progress >= 100 ? "default" : "secondary"}
                      className={progress >= 100 ? "bg-emerald-600" : ""}
                    >
                      {progress >= 100 ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-900">
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(currentAmount)}
                      </span>
                      <span className="text-slate-500">
                        of {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(targetAmount)}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-3" />
                    <div className="text-xs text-slate-500 font-medium">
                      {progress.toFixed(0)}% complete
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                        <Calendar className="h-3 w-3" />
                        Target Date
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {monthDate 
                          ? monthDate.toLocaleDateString("en-US", { 
                              month: "short", 
                              year: "numeric" 
                            })
                          : "Not set"}
                      </div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-widest mb-2">
                        <TrendingUp className="h-3 w-3" />
                        Remaining
                      </div>
                      <div className="text-sm font-bold text-indigo-900">
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(Math.max(0, targetAmount - currentAmount))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Add Funds
                    </Button>
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
