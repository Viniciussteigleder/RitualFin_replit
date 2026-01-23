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
      className="space-y-6 pb-20 max-w-[1600px] mx-auto"
    >
      {/* 1. Context Bar (Filters & Strategy) */}
      <div className="sticky top-4 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:border-0 md:pb-0 md:bg-transparent">
        {header}
      </div>

      {/* 2. Executive Summary - The "Pulse" */}
      <motion.div variants={itemVariants}>
         {kpiGrid}
      </motion.div>

      {/* 3. Narrative Layer - Health & Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Financial Health - Immediate Status */}
           {healthScore && (
             <motion.div variants={itemVariants} className="lg:col-span-3">
                 <div className="h-full rounded-3xl border border-border bg-card p-0 overflow-hidden shadow-sm">
                    {healthScore}
                 </div>
             </motion.div>
           )}
           
           {/* Prediction - Future Outlook */}
           {predictionWidget && (
            <motion.div variants={itemVariants} className={cn("lg:col-span-9", !healthScore && "lg:col-span-12")}>
                 <div className="h-full rounded-3xl border border-border bg-card shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse"></span>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Outlook</h3>
                    </div>
                    {predictionWidget}
                 </div>
            </motion.div>
           )}
      </div>

      {/* 4. Analysis Layer - Trends & Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Trend Chart - The Core Data */}
        <motion.div variants={itemVariants} className="lg:col-span-8 min-h-[450px]">
          <div className="h-full rounded-3xl border border-border bg-card shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Fluxo de Caixa</h3>
                    <p className="text-sm text-muted-foreground">Evolução de receitas e despesas</p>
                </div>
            </div>
            <div className="flex-1">
                {trendChart}
            </div>
          </div>
        </motion.div>

        {/* Breakdown - Composition */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <div className="h-full rounded-3xl border border-border bg-card shadow-sm p-6 flex flex-col">
            <h3 className="text-xl font-bold text-foreground tracking-tight mb-1">Composição</h3>
            <p className="text-sm text-muted-foreground mb-6">Onde seu dinheiro está indo</p>
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                {breakdown}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 5. Detailed Inspection - Transactional Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <motion.div variants={itemVariants}>
            <div className="rounded-3xl border border-border bg-card shadow-sm p-6 h-[400px] flex flex-col">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                    Top Comerciantes
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {merchantList}
                </div>
            </div>
         </motion.div>

         <motion.div variants={itemVariants}>
            <div className="rounded-3xl border border-border bg-card shadow-sm p-6 h-[400px] flex flex-col">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    Assinaturas & Fixos
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {recurringList}
                </div>
            </div>
         </motion.div>
      </div>
    </motion.div>
  );
}
