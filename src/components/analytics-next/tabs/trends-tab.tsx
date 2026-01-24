"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { CockpitTrendChart } from "../cockpit-trend-chart";
import { CockpitTabContent, CockpitSection } from "../cockpit-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  BarChart3,
  LineChart,
  Target,
  Zap,
  Calendar,
} from "lucide-react";
import type { TrendDataPoint, CategoryBreakdown } from "@/lib/actions/analytics-cockpit";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================================================
// TYPES
// ============================================================================

interface TrendsTabProps {
  trends: TrendDataPoint[];
  breakdown: CategoryBreakdown[];
}

type MetricView = "cashflow" | "savings" | "composition" | "comparison";

// ============================================================================
// TREND ANALYSIS
// ============================================================================

function analyzeTrendData(data: TrendDataPoint[]) {
  if (data.length < 2) {
    return {
      momentum: 0,
      volatility: 0,
      trend: "stable" as const,
      avgExpense: 0,
      avgIncome: 0,
      avgSavingsRate: 0,
      bestMonth: null as TrendDataPoint | null,
      worstMonth: null as TrendDataPoint | null,
    };
  }

  const expenses = data.map((d) => d.expense);
  const incomes = data.map((d) => d.income);
  const savingsRates = data.map((d) => d.savingsRate);

  const avgExpense = expenses.reduce((a, b) => a + b, 0) / expenses.length;
  const avgIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length;
  const avgSavingsRate = savingsRates.reduce((a, b) => a + b, 0) / savingsRates.length;

  // Calculate momentum (recent vs older)
  const recentExpenses = expenses.slice(-3);
  const olderExpenses = expenses.slice(0, -3);
  const recentAvg = recentExpenses.reduce((a, b) => a + b, 0) / recentExpenses.length;
  const olderAvg = olderExpenses.length > 0
    ? olderExpenses.reduce((a, b) => a + b, 0) / olderExpenses.length
    : recentAvg;
  const momentum = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  // Calculate volatility
  const variance = expenses.reduce((acc, val) => acc + Math.pow(val - avgExpense, 2), 0) / expenses.length;
  const volatility = avgExpense > 0 ? (Math.sqrt(variance) / avgExpense) * 100 : 0;

  // Determine trend
  let trend: "up" | "down" | "stable" = "stable";
  if (Math.abs(momentum) > 10) {
    trend = momentum > 0 ? "up" : "down";
  }

  // Best and worst months by savings rate
  const sortedByRate = [...data].sort((a, b) => b.savingsRate - a.savingsRate);
  const bestMonth = sortedByRate[0];
  const worstMonth = sortedByRate[sortedByRate.length - 1];

  return {
    momentum,
    volatility,
    trend,
    avgExpense,
    avgIncome,
    avgSavingsRate,
    bestMonth,
    worstMonth,
  };
}

// ============================================================================
// TREND STATS CARDS
// ============================================================================

function TrendStatsCards({ analysis }: { analysis: ReturnType<typeof analyzeTrendData> }) {
  const TrendIcon = analysis.trend === "up" ? TrendingUp : analysis.trend === "down" ? TrendingDown : Minus;
  const trendColor = analysis.trend === "up" ? "text-red-500" : analysis.trend === "down" ? "text-emerald-500" : "text-muted-foreground";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Activity className="w-4 h-4" />
          Tendência
        </div>
        <div className={cn("flex items-center gap-2", trendColor)}>
          <TrendIcon className="w-5 h-5" />
          <span className="text-xl font-bold">
            {analysis.trend === "up" ? "Alta" : analysis.trend === "down" ? "Queda" : "Estável"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Momentum: {analysis.momentum > 0 ? "+" : ""}{analysis.momentum.toFixed(1)}%
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Zap className="w-4 h-4" />
          Volatilidade
        </div>
        <p className={cn(
          "text-xl font-bold",
          analysis.volatility > 30 ? "text-amber-500" : "text-foreground"
        )}>
          {analysis.volatility.toFixed(1)}%
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {analysis.volatility > 30 ? "Alta variação" : analysis.volatility > 15 ? "Moderada" : "Estável"}
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <BarChart3 className="w-4 h-4" />
          Média Mensal
        </div>
        <p className="text-xl font-bold">
          {formatCurrency(analysis.avgExpense)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Receita média: {formatCurrency(analysis.avgIncome)}
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Target className="w-4 h-4" />
          Poupança Média
        </div>
        <p className={cn(
          "text-xl font-bold",
          analysis.avgSavingsRate >= 20 ? "text-emerald-500" : analysis.avgSavingsRate >= 0 ? "text-amber-500" : "text-red-500"
        )}>
          {analysis.avgSavingsRate.toFixed(1)}%
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Meta: 20%
        </p>
      </Card>
    </div>
  );
}

// ============================================================================
// MONTH COMPARISON TABLE
// ============================================================================

function MonthComparisonTable({ data }: { data: TrendDataPoint[] }) {
  const formatMonth = (period: string) => {
    try {
      const [year, month] = period.split("-");
      return format(new Date(parseInt(year), parseInt(month) - 1), "MMM yyyy", { locale: ptBR });
    } catch {
      return period;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Comparativo Mensal</CardTitle>
        <CardDescription className="text-xs">
          Detalhamento mês a mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Mês</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Receita</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Despesa</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Saldo</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Poupança</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-12).reverse().map((row, i) => (
                <tr key={row.period} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2 px-3 font-medium capitalize">
                    {formatMonth(row.period)}
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-600 tabular-nums">
                    {formatCurrency(row.income)}
                  </td>
                  <td className="py-2 px-3 text-right text-red-500 tabular-nums">
                    {formatCurrency(row.expense)}
                  </td>
                  <td className={cn(
                    "py-2 px-3 text-right font-semibold tabular-nums",
                    row.net >= 0 ? "text-emerald-600" : "text-red-500"
                  )}>
                    {formatCurrency(row.net)}
                  </td>
                  <td className={cn(
                    "py-2 px-3 text-right tabular-nums",
                    row.savingsRate >= 20 ? "text-emerald-600" : row.savingsRate >= 0 ? "text-amber-500" : "text-red-500"
                  )}>
                    {row.savingsRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TrendsTab({ trends, breakdown }: TrendsTabProps) {
  const [metricView, setMetricView] = useState<MetricView>("cashflow");

  const analysis = useMemo(() => analyzeTrendData(trends), [trends]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <CockpitTabContent
      title="Tendências"
      description="Análise de evolução e padrões ao longo do tempo"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <TrendStatsCards analysis={analysis} />
        </motion.div>

        {/* Main Chart */}
        <motion.div variants={itemVariants}>
          <CockpitTrendChart data={trends} showForecast />
        </motion.div>

        {/* Best/Worst Months */}
        {analysis.bestMonth && analysis.worstMonth && (
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Melhor Mês
                </div>
                <p className="text-lg font-bold text-foreground capitalize">
                  {(() => {
                    try {
                      const [year, month] = analysis.bestMonth.period.split("-");
                      return format(new Date(parseInt(year), parseInt(month) - 1), "MMMM yyyy", { locale: ptBR });
                    } catch {
                      return analysis.bestMonth.period;
                    }
                  })()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Taxa de poupança: {analysis.bestMonth.savingsRate.toFixed(1)}%
                </p>
              </Card>

              <Card className="p-4 border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5">
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-2">
                  <TrendingDown className="w-4 h-4" />
                  Pior Mês
                </div>
                <p className="text-lg font-bold text-foreground capitalize">
                  {(() => {
                    try {
                      const [year, month] = analysis.worstMonth.period.split("-");
                      return format(new Date(parseInt(year), parseInt(month) - 1), "MMMM yyyy", { locale: ptBR });
                    } catch {
                      return analysis.worstMonth.period;
                    }
                  })()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Taxa de poupança: {analysis.worstMonth.savingsRate.toFixed(1)}%
                </p>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Month Table */}
        <motion.div variants={itemVariants}>
          <MonthComparisonTable data={trends} />
        </motion.div>
      </motion.div>
    </CockpitTabContent>
  );
}
