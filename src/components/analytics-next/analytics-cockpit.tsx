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
      className="space-y-6 pb-20"
    >
      {/* Sticky Header Zone */}
      <GlassCard className="sticky top-4 z-50 p-2 backdrop-blur-2xl bg-white/10 dark:bg-black/20 border-white/20 shadow-xl ring-1 ring-black/5">
        {header}
      </GlassCard>

      {/* Main Command Deck (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* KPI Row (Full Width) */}
        <motion.div variants={itemVariants} className="md:col-span-12">
            {kpiGrid}
        </motion.div>

        {/* Prediction & Health Score (New Intelligence Layer) */}
        {healthScore && (
             <motion.div variants={itemVariants} className="md:col-span-4 lg:col-span-3">
                 <GlassCard variant="highlight" className="h-full p-6 flex items-center justify-center">
                    {healthScore}
                 </GlassCard>
             </motion.div>
        )}
        
        {predictionWidget && (
            <motion.div variants={itemVariants} className={cn("md:col-span-8 lg:col-span-9", !healthScore && "md:col-span-12")}>
                 <GlassCard className="h-full p-6">
                    {predictionWidget}
                 </GlassCard>
            </motion.div>
        )}

        {/* Main Trend Chart (Large Area) */}
        <motion.div variants={itemVariants} className="md:col-span-12 lg:col-span-8 min-h-[400px]">
          <GlassCard className="h-full p-6">
            <h3 className="text-xl font-bold mb-4 tracking-tight">Fluxo Financeiro</h3>
            {trendChart}
          </GlassCard>
        </motion.div>

        {/* Top Merchants (Side List) */}
        <motion.div variants={itemVariants} className="md:col-span-6 lg:col-span-4">
          <GlassCard className="h-full p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-4 tracking-tight">Top Comerciantes</h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {merchantList}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recurring Expenses (Side List) */}
        <motion.div variants={itemVariants} className="md:col-span-6 lg:col-span-4">
           <GlassCard className="h-full p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-4 tracking-tight">Recorrentes</h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {recurringList}
            </div>
          </GlassCard>
        </motion.div>

         {/* Breakdown (Full Width Bottom) */}
        <motion.div variants={itemVariants} className="md:col-span-12 lg:col-span-8">
          <GlassCard className="h-full p-6">
            <h3 className="text-xl font-bold mb-4 tracking-tight">Detalhamento</h3>
            {breakdown}
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
