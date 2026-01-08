import { getTransactions } from "@/lib/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default async function DashboardPage() {
  const transactions = await getTransactions(5); // Get last 5

  // Calculate simple totals (This should be optimized in SQL/Aggegration later)
  const allTx = await getTransactions(1000); 
  const totalBalance = allTx.reduce((acc, tx) => acc + Number(tx.amount), 0);
  const income = allTx.filter(tx => tx.amount > 0).reduce((acc, tx) => acc + Number(tx.amount), 0);
  const expenses = allTx.filter(tx => tx.amount < 0).reduce((acc, tx) => acc + Number(tx.amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Your monthly financial health overview."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalBalance)}
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">
                     {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(income)}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">
                    {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(expenses)}
                </div>
            </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions List Reuse or Component */}
       <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="space-y-4">
                {transactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between border-b pb-2 last:border-0">
                        <div>
                            <div className="font-medium text-slate-900">{tx.descNorm}</div>
                            <div className="text-xs text-slate-500 font-medium">{new Date(tx.paymentDate).toLocaleDateString()}</div>
                        </div>
                        <div className={tx.amount < 0 ? "" : "text-green-600"}>
                            {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(tx.amount)}
                        </div>
                    </div>
                ))}
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
