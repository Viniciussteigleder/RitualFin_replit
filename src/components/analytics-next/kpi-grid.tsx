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

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Spend */}
      <GlassCard className="p-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-16 h-16" />
         </div>
         <div className="flex flex-col gap-2 relative z-10">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total do Período</span>
            <div className="flex items-end gap-3">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                    {formatCurrency(total)}
                </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                {previousData ? (
                    <>
                        <div className="bg-white/5 rounded-full px-2 py-1 flex items-center">
                            {renderDelta(totalDeltaPercent)}
                        </div>
                        <span className="text-xs text-muted-foreground">vs período anterior</span>
                    </>
                ) : (
                    <span className="text-xs text-muted-foreground">Sem dados anteriores</span>
                )}
            </div>
         </div>
      </GlassCard>

      {/* 2. Top Category */}
      <GlassCard className="p-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown className="w-16 h-16" />
         </div>
         <div className="flex flex-col gap-2 relative z-10">
             <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Maior Categoria</span>
             <div className="flex items-end gap-3">
                <span className="text-2xl font-bold tracking-tight text-foreground truncate max-w-[180px]" title={topCategory?.category}>
                    {topCategory?.category || "—"}
                </span>
             </div>
             <div className="flex flex-col mt-1">
                 <span className="text-lg font-mono text-emerald-400">
                    {topCategory ? formatCurrency(topCategory.total) : formatCurrency(0)}
                 </span>
                 <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${topCategory?.percentage || 0}%` }}
                    />
                 </div>
                 <span className="text-[10px] text-muted-foreground mt-1 text-right">
                    Representa {topCategory?.percentage.toFixed(1)}% do total
                 </span>
             </div>
         </div>
      </GlassCard>
      
      {/* 3. Active Categories */}
       <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertCircle className="w-16 h-16" />
         </div>
         <div className="flex flex-col gap-2 relative z-10">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Diversificação</span>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                    {categoryCount}
                </span>
                <span className="text-sm text-muted-foreground">categorias</span>
            </div>
             <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Você consumiu em {categoryCount} áreas diferentes neste período.
            </p>
         </div>
      </GlassCard>

       {/* 4. Activity Volume */}
       <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-16 h-16" />
         </div>
         <div className="flex flex-col gap-2 relative z-10">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Volume</span>
            <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-foreground">
                    {txCount}
                </span>
                 <span className="text-sm text-muted-foreground mb-1">transações</span>
            </div>
             <div className="flex items-center gap-2 mt-2">
                 {previousData ? (
                    <>
                        <div className="bg-white/5 rounded-full px-2 py-1 flex items-center">
                             {/* Volume increase is technically neutral or just "Activity", so lets treat Increase as "active" (green) just for visualization? 
                                 Or stick to: More spending tx = Red?
                                 Actually, more txn usually means more activity. Let's color neutral or use Invert=True (Green is Up) 
                             */}
                             {renderDelta(txDeltaPercent, true)}
                        </div>
                        <span className="text-xs text-muted-foreground">vs período anterior</span>
                    </>
                 ) : (
                    <span className="text-xs text-muted-foreground">Sem histórico</span>
                 )}
            </div>
         </div>
      </GlassCard>
    </div>
  );
}
