
import { getBudgets } from "@/lib/actions/budgets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Wallet, Info } from "lucide-react";

export default async function BudgetsPage() {
  // Use a default month for now, or get from search params
  const currentMonth = new Date().toISOString().slice(0, 7);
  const budgets = await getBudgets(currentMonth);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Set and track limits for your spending categories.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {budgets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>No budgets set for {currentMonth}</CardTitle>
              <CardDescription className="mt-2">
                Click "Import Taxonomy" or manually add budgets to start tracking.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{budget.category1}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Planned: {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(budget.amount)}
                    </div>
                  </div>
                  <Badge variant="outline">0% used</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={0} className="h-2" />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>€ 0,00 spent</span>
                  <span>€ {budget.amount} remaining</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
