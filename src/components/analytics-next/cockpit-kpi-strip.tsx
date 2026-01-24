"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  PiggyBank,
  Activity,
  BarChart3,
  Repeat,
  Lock,
  Shuffle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExecutiveKPI } from "@/lib/actions/analytics-cockpit";

// ============================================================================
// TYPES
// ============================================================================

interface CockpitKpiStripProps {
  kpis: ExecutiveKPI[];
  compact?: boolean;
}

interface KpiCardProps {
  kpi: ExecutiveKPI;
  compact?: boolean;
  index: number;
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const KPI_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  net_result: Wallet,
  total_expense: CreditCard,
  total_income: TrendingUp,
  savings_rate: PiggyBank,
  fixed_expense: Lock,
  variable_expense: Shuffle,
  recurring_expense: Repeat,
  tx_count: Activity,
  avg_transaction: BarChart3,
  category_count: BarChart3,
};

const KPI_COLORS: Record<string, { positive: string; negative: string; neutral: string }> = {
  net_result: {
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-red-500 dark:text-red-400",
    neutral: "text-foreground",
  },
  total_expense: {
    positive: "text-red-500 dark:text-red-400",
    negative: "text-emerald-600 dark:text-emerald-400",
    neutral: "text-foreground",
  },
  total_income: {
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-red-500 dark:text-red-400",
    neutral: "text-foreground",
  },
  savings_rate: {
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-red-500 dark:text-red-400",
    neutral: "text-foreground",
  },
  default: {
    positive: "text-foreground",
    negative: "text-foreground",
    neutral: "text-foreground",
  },
};

// ============================================================================
// SPARKLINE COMPONENT
// ============================================================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

function Sparkline({ data, width = 60, height = 20, color = "#10b981" }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2"
        fill={color}
      />
    </svg>
  );
}

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

function KpiCard({ kpi, compact = false, index }: KpiCardProps) {
  const Icon = KPI_ICONS[kpi.id] || Activity;
  const colors = KPI_COLORS[kpi.id] || KPI_COLORS.default;

  const formattedValue = useMemo(() => {
    switch (kpi.format) {
      case "currency":
        return formatCurrency(kpi.value);
      case "percent":
        return `${kpi.value.toFixed(1)}%`;
      case "number":
        return kpi.value.toLocaleString("pt-BR");
      default:
        return kpi.value.toString();
    }
  }, [kpi.value, kpi.format]);

  const deltaColor = useMemo(() => {
    if (kpi.trend === "stable") return "text-muted-foreground";
    return kpi.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400";
  }, [kpi.trend, kpi.isPositive]);

  const valueColor = useMemo(() => {
    // For net_result, color based on positive/negative value
    if (kpi.id === "net_result") {
      return kpi.value >= 0 ? colors.positive : colors.negative;
    }
    // For savings_rate, color based on positive/negative rate
    if (kpi.id === "savings_rate") {
      return kpi.value >= 0 ? colors.positive : colors.negative;
    }
    return colors.neutral;
  }, [kpi.id, kpi.value, colors]);

  const DeltaIcon = kpi.trend === "up" ? ArrowUpRight : kpi.trend === "down" ? ArrowDownRight : Minus;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "group relative rounded-2xl border border-border bg-card p-4 shadow-sm",
              "hover:shadow-md hover:border-border/80 transition-all duration-200",
              "flex flex-col justify-between cursor-default",
              compact ? "h-[100px]" : "h-[120px]"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-muted-foreground truncate pr-2">
                {kpi.label}
              </span>
              <Icon className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            </div>

            {/* Value */}
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "font-bold tracking-tight tabular-nums",
                  compact ? "text-xl" : "text-2xl",
                  valueColor
                )}
              >
                {formattedValue}
              </span>

              {/* Delta & Sparkline Row */}
              <div className="flex items-center justify-between gap-2">
                <div className={cn("flex items-center gap-0.5 text-xs font-medium", deltaColor)}>
                  <DeltaIcon className="w-3 h-3" />
                  <span>{Math.abs(kpi.deltaPercent).toFixed(1)}%</span>
                </div>

                {kpi.sparkline && kpi.sparkline.length > 2 && (
                  <Sparkline
                    data={kpi.sparkline}
                    width={50}
                    height={16}
                    color={kpi.isPositive ? "#10b981" : "#ef4444"}
                  />
                )}
              </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <div className="space-y-1 text-xs">
            <p className="font-medium">{kpi.label}</p>
            {kpi.previousValue !== 0 && (
              <p className="text-muted-foreground">
                Período anterior:{" "}
                {kpi.format === "currency"
                  ? formatCurrency(kpi.previousValue)
                  : kpi.format === "percent"
                  ? `${kpi.previousValue.toFixed(1)}%`
                  : kpi.previousValue.toLocaleString("pt-BR")}
              </p>
            )}
            <p className={deltaColor}>
              Variação: {kpi.delta >= 0 ? "+" : ""}
              {kpi.format === "currency"
                ? formatCurrency(kpi.delta)
                : kpi.format === "percent"
                ? `${kpi.delta.toFixed(1)}pp`
                : kpi.delta.toLocaleString("pt-BR")}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CockpitKpiStrip({ kpis, compact = false }: CockpitKpiStripProps) {
  // Primary KPIs (always visible)
  const primaryKpis = kpis.filter((k) =>
    ["net_result", "total_expense", "total_income", "savings_rate"].includes(k.id)
  );

  // Secondary KPIs (collapsible)
  const secondaryKpis = kpis.filter((k) =>
    ["fixed_expense", "variable_expense", "recurring_expense", "tx_count"].includes(k.id)
  );

  return (
    <div className="space-y-4">
      {/* Primary KPIs - Always visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryKpis.map((kpi, index) => (
          <KpiCard key={kpi.id} kpi={kpi} compact={compact} index={index} />
        ))}
      </div>

      {/* Secondary KPIs */}
      {secondaryKpis.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryKpis.map((kpi, index) => (
            <KpiCard key={kpi.id} kpi={kpi} compact index={index + primaryKpis.length} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPACT HORIZONTAL STRIP
// ============================================================================

export function CockpitKpiHorizontalStrip({ kpis }: { kpis: ExecutiveKPI[] }) {
  const primaryKpis = kpis.slice(0, 6);

  return (
    <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-thin">
      {primaryKpis.map((kpi) => {
        const formattedValue =
          kpi.format === "currency"
            ? formatCurrency(kpi.value)
            : kpi.format === "percent"
            ? `${kpi.value.toFixed(1)}%`
            : kpi.value.toLocaleString("pt-BR");

        const deltaColor =
          kpi.trend === "stable"
            ? "text-muted-foreground"
            : kpi.isPositive
            ? "text-emerald-500"
            : "text-red-500";

        const DeltaIcon = kpi.trend === "up" ? ArrowUpRight : kpi.trend === "down" ? ArrowDownRight : Minus;

        return (
          <div key={kpi.id} className="flex flex-col items-start min-w-[100px]">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {kpi.label}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold tabular-nums">{formattedValue}</span>
              <span className={cn("flex items-center text-xs", deltaColor)}>
                <DeltaIcon className="w-3 h-3" />
                {Math.abs(kpi.deltaPercent).toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
