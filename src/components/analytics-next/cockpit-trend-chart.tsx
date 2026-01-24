"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
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
  BarChart3,
  LineChart,
  Activity,
  Calendar,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TrendDataPoint } from "@/lib/actions/analytics-cockpit";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================================================
// TYPES
// ============================================================================

interface CockpitTrendChartProps {
  data: TrendDataPoint[];
  showForecast?: boolean;
  compact?: boolean;
}

type ChartMode = "cashflow" | "composition" | "savings" | "comparison";

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  // Parse the period label
  let displayLabel = label;
  try {
    const [year, month] = label.split("-");
    displayLabel = format(new Date(parseInt(year), parseInt(month) - 1), "MMMM yyyy", {
      locale: ptBR,
    });
  } catch {
    displayLabel = label;
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-4 min-w-[200px]">
      <p className="text-sm font-semibold text-foreground mb-3 capitalize">{displayLabel}</p>
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => {
          const isIncome = entry.dataKey === "income";
          const isExpense = entry.dataKey === "expense";
          const isNet = entry.dataKey === "net";
          const isForecast = entry.dataKey === "forecast";
          const isSavingsRate = entry.dataKey === "savingsRate";

          let label = entry.name;
          let value = entry.value;
          let formattedValue = formatCurrency(value);

          if (isSavingsRate) {
            formattedValue = `${value.toFixed(1)}%`;
          }

          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <span
                className={cn(
                  "text-sm font-bold tabular-nums",
                  isIncome && "text-emerald-600 dark:text-emerald-400",
                  isExpense && "text-red-500 dark:text-red-400",
                  isNet && (value >= 0 ? "text-emerald-600" : "text-red-500"),
                  isForecast && "text-violet-500"
                )}
              >
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

function analyzeTrend(data: TrendDataPoint[]) {
  if (data.length < 2) return { trend: "stable" as const, momentum: 0, volatility: 0 };

  const expenseValues = data.map((d) => d.expense);
  const recentValues = expenseValues.slice(-3);
  const olderValues = expenseValues.slice(0, -3);

  const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const olderAvg =
    olderValues.length > 0 ? olderValues.reduce((a, b) => a + b, 0) / olderValues.length : recentAvg;

  const momentum = ((recentAvg - olderAvg) / olderAvg) * 100;

  // Calculate volatility (standard deviation / mean)
  const mean = expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length;
  const variance =
    expenseValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / expenseValues.length;
  const volatility = (Math.sqrt(variance) / mean) * 100;

  let trend: "up" | "down" | "stable" = "stable";
  if (Math.abs(momentum) > 10) {
    trend = momentum > 0 ? "up" : "down";
  }

  return { trend, momentum, volatility };
}

function calculateForecast(data: TrendDataPoint[]): number {
  if (data.length < 3) return data[data.length - 1]?.expense || 0;

  // Simple linear regression on expense
  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((acc, d) => acc + d.expense, 0) / n;

  let numerator = 0;
  let denominator = 0;

  data.forEach((d, i) => {
    numerator += (i - xMean) * (d.expense - yMean);
    denominator += Math.pow(i - xMean, 2);
  });

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  return Math.max(0, intercept + slope * n);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CockpitTrendChart({
  data,
  showForecast = true,
  compact = false,
}: CockpitTrendChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>("cashflow");

  // Prepare chart data with forecast
  const chartData = useMemo(() => {
    type ChartDataPoint = TrendDataPoint & { periodLabel: string; forecast?: number };

    const processed: ChartDataPoint[] = data.map((d) => ({
      ...d,
      periodLabel: d.period,
    }));

    if (showForecast && processed.length >= 3) {
      const forecast = calculateForecast(data);
      const lastPeriod = data[data.length - 1]?.period;

      if (lastPeriod) {
        const [year, month] = lastPeriod.split("-").map(Number);
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const forecastPeriod = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

        processed.push({
          period: forecastPeriod,
          periodLabel: forecastPeriod,
          income: 0,
          expense: 0,
          net: 0,
          savingsRate: 0,
          fixedExpense: 0,
          variableExpense: 0,
          recurringExpense: 0,
          transactionCount: 0,
          forecast,
        });
      }
    }

    return processed;
  }, [data, showForecast]);

  // Trend analysis
  const trendAnalysis = useMemo(() => analyzeTrend(data), [data]);

  // X-axis formatter
  const formatXAxis = (value: string) => {
    try {
      const [year, month] = value.split("-");
      return format(new Date(parseInt(year), parseInt(month) - 1), "MMM", { locale: ptBR });
    } catch {
      return value;
    }
  };

  // Trend icon
  const TrendIcon =
    trendAnalysis.trend === "up"
      ? TrendingUp
      : trendAnalysis.trend === "down"
      ? TrendingDown
      : Minus;

  const trendColor =
    trendAnalysis.trend === "up"
      ? "text-red-500"
      : trendAnalysis.trend === "down"
      ? "text-emerald-500"
      : "text-muted-foreground";

  if (compact) {
    return (
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="period" tickFormatter={formatXAxis} tick={{ fontSize: 10 }} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Evolução Financeira</CardTitle>
              <CardDescription className="text-xs">
                Últimos {data.length} meses
                {showForecast && " + previsão"}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Trend Badge */}
            <Badge variant="outline" className={cn("gap-1", trendColor)}>
              <TrendIcon className="w-3 h-3" />
              <span className="text-xs">
                {Math.abs(trendAnalysis.momentum).toFixed(0)}%
              </span>
            </Badge>

            {/* Chart Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              {[
                { mode: "cashflow" as const, icon: BarChart3, label: "Fluxo" },
                { mode: "composition" as const, icon: Activity, label: "Composição" },
                { mode: "savings" as const, icon: Target, label: "Poupança" },
              ].map(({ mode, icon: Icon, label }) => (
                <Button
                  key={mode}
                  variant={chartMode === mode ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => setChartMode(mode)}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === "cashflow" ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="period"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) =>
                    value === "income"
                      ? "Receitas"
                      : value === "expense"
                      ? "Despesas"
                      : value === "forecast"
                      ? "Previsão"
                      : value
                  }
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                <Bar
                  dataKey="income"
                  name="income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  opacity={0.9}
                />
                <Bar
                  dataKey="expense"
                  name="expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  opacity={0.9}
                />
                {showForecast && (
                  <Bar
                    dataKey="forecast"
                    name="forecast"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    opacity={0.6}
                  />
                )}
              </ComposedChart>
            ) : chartMode === "composition" ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="period"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) =>
                    value === "fixedExpense"
                      ? "Fixos"
                      : value === "variableExpense"
                      ? "Variáveis"
                      : value === "recurringExpense"
                      ? "Recorrentes"
                      : value
                  }
                />
                <Area
                  type="monotone"
                  dataKey="fixedExpense"
                  name="fixedExpense"
                  stackId="1"
                  fill="#3b82f6"
                  stroke="#3b82f6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="variableExpense"
                  name="variableExpense"
                  stackId="1"
                  fill="#f59e0b"
                  stroke="#f59e0b"
                  fillOpacity={0.6}
                />
                <Line
                  type="monotone"
                  dataKey="recurringExpense"
                  name="recurringExpense"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 3 }}
                />
              </ComposedChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="period"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  domain={[-20, 50]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) =>
                    value === "savingsRate" ? "Taxa de Poupança" : value
                  }
                />
                <ReferenceLine
                  y={20}
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  label={{ value: "Meta 20%", position: "right", fontSize: 10 }}
                />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="savingsRate"
                  name="savingsRate"
                  fill="#10b981"
                  stroke="#10b981"
                  fillOpacity={0.3}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Trend Summary */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Tendência</p>
            <div className={cn("flex items-center justify-center gap-1", trendColor)}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {trendAnalysis.trend === "up"
                  ? "Alta"
                  : trendAnalysis.trend === "down"
                  ? "Queda"
                  : "Estável"}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Momentum</p>
            <p
              className={cn(
                "text-sm font-bold",
                trendAnalysis.momentum > 0 ? "text-red-500" : "text-emerald-500"
              )}
            >
              {trendAnalysis.momentum > 0 ? "+" : ""}
              {trendAnalysis.momentum.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Volatilidade</p>
            <p
              className={cn(
                "text-sm font-bold",
                trendAnalysis.volatility > 30 ? "text-amber-500" : "text-muted-foreground"
              )}
            >
              {trendAnalysis.volatility.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MINI TREND SPARKLINE
// ============================================================================

export function CockpitMiniTrend({ data }: { data: TrendDataPoint[] }) {
  const values = data.slice(-6).map((d) => d.expense);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 24 - ((value - min) / range) * 20;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100" height="28" className="overflow-visible">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="text-emerald-500"
      />
    </svg>
  );
}
