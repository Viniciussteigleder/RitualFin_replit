import { DrillDownData } from "@/lib/actions/analytics";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, AlertCircle, Wallet, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { GlassCard } from "@/components/analytics-next/ui/glass-card";
import { cn } from "@/lib/utils";

interface KpiGridProps {
  data: DrillDownData;
  previousData?: DrillDownData | null;
}

export function KpiGrid({ data, previousData }: KpiGridProps) {
  const total = data.totalAmount;
  const prevTotal = previousData?.totalAmount || 0;
  
  // Calculate Delta for Total
  let totalDelta = 0;
  let totalDeltaPercent = 0;
  if (prevTotal > 0) {
    totalDelta = total - prevTotal;
    totalDeltaPercent = (totalDelta / prevTotal) * 100;
  }

  const topCategory = data.aggregates[0];
  const categoryCount = data.aggregates.length;

  // Placeholder logic for transaction count (summing up from aggregates)
  const txCount = data.aggregates.reduce((acc, curr) => acc + curr.count, 0);
  const prevTxCount = previousData?.aggregates.reduce((acc, curr) => acc + curr.count, 0) || 0;
  
  let txDeltaPercent = 0;
  if (prevTxCount > 0) {
      txDeltaPercent = ((txCount - prevTxCount) / prevTxCount) * 100;
  }

  // Helper for delta badge
  const renderDelta = (percent: number, invertColor = false) => {
     if (Math.abs(percent) < 0.1) return <span className="text-muted-foreground text-xs">0%</span>;
     
     const isPositive = percent > 0;
     // For expense: Positive delta is BAD (Red). Negative delta is GOOD (Green).
     // "invertColor" = true means standard logic (Green is up). 
     // Default here is Expense logic: Up = Red.
     
     const isBad = invertColor ? !isPositive : isPositive;
     
     const colorClass = isBad ? "text-red-400" : "text-emerald-400";
     const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

     return (
        <span className={cn("flex items-center text-xs font-bold gap-0.5", colorClass)}>
            <Icon className="w-3 h-3" />
            {Math.abs(percent).toFixed(1)}%
        </span>
     );
  };

  // Tufte Principle: Clear, accessible data. No chartjunk.
  // Norman Principle: Clear affordance. Green = Good, Red = Bad (standard mapping).
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Result - The Bottom Line */}
      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col justify-between h-[120px] transition-all hover:shadow-md">
         <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-muted-foreground">Resultado Líquido</span>
            <Wallet className="h-4 w-4 text-muted-foreground/50" />
         </div>
         <div className="flex flex-col gap-1">
             <span className={cn(
                 "text-3xl font-bold tracking-tight",
                 data.totalAmount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
             )}>
                 {formatCurrency(Math.abs(data.totalAmount))}
             </span>
             <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-md", 
                    totalDeltaPercent > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                )}>
                   {totalDeltaPercent > 0 ? "+" : ""}{totalDeltaPercent.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs anterior</span>
             </div>
         </div>
      </div>

      {/* 2. Top Spending Category */}
      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col justify-between h-[120px] transition-all hover:shadow-md">
         <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-muted-foreground">Maior Despesa</span>
            <TrendingDown className="h-4 w-4 text-muted-foreground/50" />
         </div>
         <div className="flex flex-col gap-1">
             <span className="text-xl font-bold text-foreground truncate" title={topCategory?.category}>
                 {topCategory?.category || "—"}
             </span>
             <div className="flex items-center justify-between mt-1">
                 <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                    {topCategory ? formatCurrency(topCategory.total) : "—"}
                 </span>
                 <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {topCategory?.percentage.toFixed(0)}% do total
                 </span>
             </div>
             {/* Simple clean bar */}
             <div className="w-full h-1 bg-secondary rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${topCategory?.percentage || 0}%` }} />
             </div>
         </div>
      </div>

       {/* 3. Transaction Volume */}
      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col justify-between h-[120px] transition-all hover:shadow-md">
         <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-muted-foreground">Volume</span>
            <Activity className="h-4 w-4 text-muted-foreground/50" />
         </div>
         <div className="flex flex-col gap-1">
             <span className="text-3xl font-bold text-foreground">
                 {txCount}
             </span>
             <div className="flex items-center gap-2">
                 <span className="text-xs text-muted-foreground">transações processadas</span>
             </div>
         </div>
      </div>

      {/* 4. Category Diversity (Simple) */}
      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col justify-between h-[120px] transition-all hover:shadow-md">
         <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-muted-foreground">Categorias</span>
            <AlertCircle className="h-4 w-4 text-muted-foreground/50" />
         </div>
         <div className="flex flex-col gap-1">
             <span className="text-3xl font-bold text-foreground">
                 {categoryCount}
             </span>
             <div className="flex items-center gap-2">
                 <span className="text-xs text-muted-foreground">áreas de consumo ativas</span>
             </div>
         </div>
      </div>
    </div>
  );
}
