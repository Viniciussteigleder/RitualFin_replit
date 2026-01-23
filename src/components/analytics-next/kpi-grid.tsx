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
    <div className="flex flex-col gap-3">
      {/* 1. Total Spend - The Hero Stat */}
      <GlassCard className="p-5 relative overflow-hidden group bg-black/40 border-white/10 hover:border-emerald-500/50 transition-colors duration-500">
         <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-emerald-500 to-transparent opacity-50" />
         
         <div className="flex flex-col gap-1 relative z-10">
            <div className="flex justify-between items-start">
                 <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-1">Net Flow</span>
                 <Wallet className="w-4 h-4 text-emerald-500/50" />
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-white tracking-tighter tabular-nums text-glow">
                    {formatCurrency(total)}
                </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                 {/* Mini sparkline or just delta text */}
                 <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                    {previousData ? renderDelta(totalDeltaPercent, true) : "N/A"}
                 </div>
            </div>
         </div>
      </GlassCard>

      {/* 2. Top Category - Compact */}
      <GlassCard className="p-4 relative overflow-hidden group bg-white/5 border-white/5 hover:border-white/20">
         <div className="flex flex-col gap-1 relative z-10 w-full">
             <div className="flex justify-between w-full">
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">Highest Burn</span>
                <TrendingDown className="w-3 h-3 text-red-400/70" />
             </div>
             
             <div className="flex justify-between items-end mt-1">
                 <span className="text-sm font-bold text-white max-w-[60%] truncate" title={topCategory?.category}>
                    {topCategory?.category || "—"}
                 </span>
                 <span className="text-sm font-mono text-white/70">
                    {topCategory ? `${topCategory.percentage.toFixed(0)}%` : "0%"}
                 </span>
             </div>
             
             {/* Micro-bar */}
             <div className="w-full bg-white/10 h-0.5 mt-2 overflow-hidden">
                <div 
                    className="bg-red-500 h-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                    style={{ width: `${topCategory?.percentage || 0}%` }}
                />
             </div>
         </div>
      </GlassCard>
      
      {/* 3. Small Grid for Count & Volume */}
       <div className="grid grid-cols-2 gap-3">
           <GlassCard className="p-3 flex flex-col items-center justify-center text-center bg-white/5 border-white/5">
                <Activity className="w-4 h-4 text-blue-400 mb-1" />
                <span className="text-xl font-bold text-white tabular-nums">{txCount}</span>
                <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Ops</span>
           </GlassCard>
           
           <GlassCard className="p-3 flex flex-col items-center justify-center text-center bg-white/5 border-white/5">
                 <AlertCircle className="w-4 h-4 text-purple-400 mb-1" />
                <span className="text-xl font-bold text-white tabular-nums">{categoryCount}</span>
                <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Cats</span>
           </GlassCard>
       </div>
    </div>
  );
}
