"use client";

import { motion } from "framer-motion";
import { useAnalyticsQuery } from "@/hooks/use-analytics-query";
import { GlassCard } from "@/components/analytics-next/ui/glass-card";
import { FilterBar } from "@/components/analytics-next/filter-bar";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnalyticsCockpitProps {
  children?: ReactNode;
  header: ReactNode;
  kpiGrid: ReactNode;
  trendChart: ReactNode;
  breakdown: ReactNode;
  merchantList: ReactNode;
  recurringList: ReactNode;
  predictionWidget?: ReactNode;
  healthScore?: ReactNode;
}

export function AnalyticsCockpit({
  header,
  kpiGrid,
  trendChart,
  breakdown,
  merchantList,
  recurringList,
  predictionWidget,
  healthScore,
}: AnalyticsCockpitProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen pb-20 overflow-hidden"
    >
      {/* Ambient Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse slow" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen" />
         <div className="absolute inset-0 bg-neo-noise opacity-30 mix-blend-overlay" />
      </div>

      {/* Main Spatial Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left 'Pilot' Column (KPIs & Control) - width 3/12 on large screens */}
        <motion.div variants={itemVariants} className="lg:col-span-3 lg:sticky lg:top-4 flex flex-col gap-4 self-start max-h-[calc(100vh-2rem)] custom-scrollbar overflow-y-auto pr-1">
            <GlassCard className="p-1 backdrop-blur-3xl bg-black/40 border-white/10 shadow-2xl">
                {header}
            </GlassCard>
            
            <div className="flex flex-col gap-3">
               {kpiGrid}
            </div>

            {healthScore && (
                <div className="mt-2">
                    {healthScore}
                </div>
            )}
        </motion.div>

        {/* Center 'Viewport' Column (Main Charts) - width 6/12 */}
        <motion.div variants={itemVariants} className="lg:col-span-6 flex flex-col gap-6">
            <GlassCard className="min-h-[500px] p-8 border-white/10 bg-black/20 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                 {/* Decorative scanning line */}
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-slide-up" />
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-3xl font-light tracking-tighter text-white/90 text-glow">Fluxo Financeiro</h3>
                        <p className="text-xs text-emerald-400 font-mono tracking-widest uppercase mt-1">Live Telemetry</p>
                    </div>
                    {/* Live indicator dot */}
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    </div>
                </div>
                {trendChart}
            </GlassCard>

             <GlassCard className="p-8 border-white/10 bg-black/20 backdrop-blur-3xl">
                <div className="mb-6 flex items-baseline justify-between">
                     <h3 className="text-xl font-medium tracking-tight text-white/80">Raio-X de Gastos</h3>
                     <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-white/10 px-2 py-1 rounded-full">Deep Dive</span>
                </div>
                {breakdown}
             </GlassCard>
        </motion.div>

        {/* Right 'Intel' Column (Lists & predictions) - width 3/12 */}
        <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col gap-4 self-start">
             {predictionWidget && (
                 <GlassCard className="p-5 border-emerald-500/20 bg-emerald-900/10">
                    {predictionWidget}
                 </GlassCard>
             )}
             
             <GlassCard className="flex-1 min-h-[300px] p-5 border-white/5 bg-white/5 flex flex-col">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Top Targets</h3>
                <div className="flex-1 -mx-2 px-2 overflow-y-auto custom-scrollbar">
                    {merchantList}
                </div>
             </GlassCard>
             
             <GlassCard className="flex-1 min-h-[300px] p-5 border-white/5 bg-white/5 flex flex-col">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Fixos & Assinaturas</h3>
                 <div className="flex-1 -mx-2 px-2 overflow-y-auto custom-scrollbar">
                    {recurringList}
                </div>
             </GlassCard>
        </motion.div>

      </div>
    </motion.div>
  );
}
