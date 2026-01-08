import { getTransactions } from "@/lib/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const transactions = await getTransactions(5); // Get last 5

  // Calculate simple totals
  const allTx = await getTransactions(1000);
  const totalBalance = allTx.reduce((acc, tx) => acc + Number(tx.amount), 0);
  const income = allTx.filter(tx => tx.amount > 0).reduce((acc, tx) => acc + Number(tx.amount), 0);
  const expenses = allTx.filter(tx => tx.amount < 0).reduce((acc, tx) => acc + Number(tx.amount), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your monthly financial health overview at a glance."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-125 duration-700">
            <Activity className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tighter">
              {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalBalance)}
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">+2.4%</span> since last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 font-mono tracking-tighter">
              {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(income)}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%]" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">65% of Goal</span>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-emerald-500 opacity-20" />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 font-mono tracking-tighter">
              {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Math.abs(expenses))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 w-[42%]" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">42% of Budget</span>
            </div>
            <ArrowDownRight className="absolute top-4 right-4 h-5 w-5 text-rose-500 opacity-20" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pt-6 pb-4">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
              <p className="text-xs text-slate-500">Your latest activities</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-900 uppercase tracking-widest hover:bg-slate-50">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-xl",
                      tx.amount < 0 ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-slate-900">{tx.descNorm}</div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{new Date(tx.paymentDate).toLocaleDateString()} • {tx.accountSource}</div>
                    </div>
                  </div>
                  <div className={cn(
                    "font-mono font-bold tracking-tighter",
                    tx.amount < 0 ? "text-slate-900" : "text-emerald-600"
                  )}>
                    {tx.amount > 0 ? "+" : ""}{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-indigo-50/30 border-dashed border-2 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-900">Financial Insights</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-[240px]">We're still analyzing your patterns. Check back soon for deeper insights into your wealth.</p>
        </Card>
      </div>
    </div>
  );
}
