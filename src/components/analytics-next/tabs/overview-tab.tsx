"use client";

import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { CockpitKpiStrip } from "../cockpit-kpi-strip";
import { CockpitTrendChart } from "../cockpit-trend-chart";
import { CockpitInsightsPanel, CockpitNarrativeMode } from "../cockpit-insights";
import { CockpitMerchants } from "../cockpit-merchants";
import { CockpitRecurring } from "../cockpit-recurring";
import { CockpitSection } from "../cockpit-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Target,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type {
  ExecutiveKPI,
  CategoryBreakdown,
  TrendDataPoint,
  MerchantInsight,
  RecurringInsight,
  Anomaly,
  Insight,
} from "@/lib/actions/analytics-cockpit";

// ============================================================================
// TYPES
// ============================================================================

interface OverviewTabProps {
  kpis: ExecutiveKPI[];
  breakdown: CategoryBreakdown[];
  trends: TrendDataPoint[];
  merchants: MerchantInsight[];
  recurring: RecurringInsight[];
  anomalies: Anomaly[];
  insights: Insight[];
  periodLabel: string;
}

// ============================================================================
// COLORS
// ============================================================================

const CATEGORY_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

// ============================================================================
// QUICK STATS COMPONENT
// ============================================================================

function QuickStats({ kpis }: { kpis: ExecutiveKPI[] }) {
  const savingsKPI = kpis.find((k) => k.id === "savings_rate");
  const expenseKPI = kpis.find((k) => k.id === "total_expense");
  const incomeKPI = kpis.find((k) => k.id === "total_income");

  const healthScore = savingsKPI
    ? savingsKPI.value >= 20
      ? 100
      : savingsKPI.value >= 10
      ? 75
      : savingsKPI.value >= 0
      ? 50
      : 25
    : 50;

  const healthColor =
    healthScore >= 75
      ? "text-emerald-500"
      : healthScore >= 50
      ? "text-amber-500"
      : "text-red-500";

  const healthLabel =
    healthScore >= 75
      ? "Saudável"
      : healthScore >= 50
      ? "Atenção"
      : "Crítico";

  return (
    <Card className="border-emerald-200/50 dark:border-emerald-500/10 bg-gradient-to-br from-emerald-50/30 to-white dark:from-emerald-500/5 dark:to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-emerald-500" />
          Saúde Financeira
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={cn("text-3xl font-bold", healthColor)}>
              {healthScore}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{healthLabel}</p>
          </div>
          <div className="w-20 h-20">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  healthScore >= 75
                    ? "#10b981"
                    : healthScore >= 50
                    ? "#f59e0b"
                    : "#ef4444"
                }
                strokeWidth="3"
                strokeDasharray={`${healthScore}, 100`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Taxa de Poupança</span>
            <span className={cn("font-semibold", savingsKPI && savingsKPI.value >= 0 ? "text-emerald-500" : "text-red-500")}>
              {savingsKPI ? `${savingsKPI.value.toFixed(1)}%` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Receita vs Despesa</span>
            <span className="font-semibold">
              {incomeKPI && expenseKPI
                ? `${((incomeKPI.value / (expenseKPI.value || 1)) * 100 - 100).toFixed(0)}%`
                : "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CATEGORY PIE CHART
// ============================================================================

function CategoryPieChart({ breakdown }: { breakdown: CategoryBreakdown[] }) {
  const chartData = breakdown.slice(0, 6).map((cat, i) => ({
    name: cat.category,
    value: cat.total,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Distribuição por Categoria</CardTitle>
        <CardDescription className="text-xs">
          Top {chartData.length} categorias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          {chartData.slice(0, 4).map((cat, i) => (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-muted-foreground truncate max-w-[120px]">
                  {cat.name}
                </span>
              </div>
              <span className="font-medium tabular-nums">
                {formatCurrency(cat.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ACTION ITEMS CARD
// ============================================================================

function ActionItems({ insights, anomalies }: { insights: Insight[]; anomalies: Anomaly[] }) {
  const topActions = [
    ...anomalies.filter((a) => a.severity === "high").slice(0, 2),
    ...insights.filter((i) => i.type === "recommendation" || i.type === "risk").slice(0, 3),
  ].slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-500" />
          Ações Recomendadas
        </CardTitle>
        <CardDescription className="text-xs">
          Baseado na análise do período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topActions.length > 0 ? (
            topActions.map((item, i) => {
              const isAnomaly = "severity" in item;
              const isRisk = !isAnomaly && item.type === "risk";

              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {isAnomaly ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  ) : isRisk ? (
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {isAnomaly ? item.title : item.title}
                    </p>
                    {"impact" in item && item.impact && (
                      <p className="text-xs text-emerald-500 font-medium">
                        Potencial: {formatCurrency(item.impact)}
                      </p>
                    )}
                  </div>
                  {"actionUrl" in item && item.actionUrl && (
                    <Link href={item.actionUrl}>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Tudo em ordem!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OverviewTab({
  kpis,
  breakdown,
  trends,
  merchants,
  recurring,
  anomalies,
  insights,
  periodLabel,
}: OverviewTabProps) {
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

  // Get key metrics for narrative
  const incomeKPI = kpis.find((k) => k.id === "total_income");
  const expenseKPI = kpis.find((k) => k.id === "total_expense");
  const savingsKPI = kpis.find((k) => k.id === "savings_rate");
  const topCategory = breakdown[0];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 1. KPI Strip */}
      <motion.div variants={itemVariants}>
        <CockpitKpiStrip kpis={kpis} />
      </motion.div>

      {/* 2. Narrative Summary */}
      <motion.div variants={itemVariants}>
        <CockpitNarrativeMode
          insights={insights}
          anomalies={anomalies}
          kpiSummary={{
            income: incomeKPI?.value || 0,
            expense: expenseKPI?.value || 0,
            savingsRate: savingsKPI?.value || 0,
            topCategory: topCategory?.category || "N/A",
            topCategoryAmount: topCategory?.total || 0,
          }}
          periodLabel={periodLabel}
        />
      </motion.div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <CockpitTrendChart data={trends} showForecast />
        </motion.div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div variants={itemVariants}>
            <QuickStats kpis={kpis} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <CategoryPieChart breakdown={breakdown} />
          </motion.div>
        </div>
      </div>

      {/* 4. Insights & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Insights do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CockpitInsightsPanel insights={insights} anomalies={anomalies} compact />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ActionItems insights={insights} anomalies={anomalies} />
        </motion.div>
      </div>

      {/* 5. Quick Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="h-[400px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Top Comerciantes</CardTitle>
                <Link href="?view=merchants">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    Ver todos
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <CockpitMerchants merchants={merchants} compact />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-[400px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pagamentos Recorrentes</CardTitle>
                <Link href="?view=recurring">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    Ver todos
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <CockpitRecurring recurring={recurring} compact />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
