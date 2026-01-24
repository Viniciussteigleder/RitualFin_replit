"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Store,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Hash,
  Repeat,
  ExternalLink,
  BarChart3,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import type { MerchantInsight } from "@/lib/actions/analytics-cockpit";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================================================
// TYPES
// ============================================================================

interface CockpitMerchantsProps {
  merchants: MerchantInsight[];
  totalSpend?: number;
  compact?: boolean;
}

type ViewMode = "list" | "table" | "treemap";
type SortKey = "total" | "count" | "concentration" | "frequency";

// ============================================================================
// COLORS
// ============================================================================

const COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
];

// ============================================================================
// MERCHANT CARD COMPONENT
// ============================================================================

interface MerchantCardProps {
  merchant: MerchantInsight;
  index: number;
  totalSpend: number;
  maxTotal: number;
}

function MerchantCard({ merchant, index, totalSpend, maxTotal }: MerchantCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const concentrationLevel = useMemo(() => {
    if (merchant.concentrationRisk > 25) return "high";
    if (merchant.concentrationRisk > 15) return "medium";
    return "low";
  }, [merchant.concentrationRisk]);

  const frequencyLabel = useMemo(() => {
    if (merchant.frequency === 0) return "Único";
    if (merchant.frequency <= 7) return "Semanal";
    if (merchant.frequency <= 14) return "Quinzenal";
    if (merchant.frequency <= 35) return "Mensal";
    return "Esporádico";
  }, [merchant.frequency]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative rounded-xl border bg-card p-4 transition-all duration-200",
        "hover:shadow-md hover:border-border/80",
        concentrationLevel === "high" && "border-red-200 dark:border-red-500/20"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Merchant Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Rank Badge */}
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
              index < 3
                ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {merchant.name}
              </h4>
              {merchant.isRecurring && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Repeat className="w-3 h-3 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>Pagamento recorrente</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {concentrationLevel === "high" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>Alta concentração de gastos</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Categories */}
            <div className="flex items-center gap-1 mt-1">
              {merchant.categories.slice(0, 2).map((cat, i) => (
                <Badge key={i} variant="outline" className="text-[10px] h-5 px-1.5">
                  {cat}
                </Badge>
              ))}
              {merchant.categories.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{merchant.categories.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Amount & Stats */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-foreground tabular-nums">
            {formatCurrency(merchant.total)}
          </p>
          <p className="text-xs text-muted-foreground">
            {merchant.concentrationRisk.toFixed(1)}% do total
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              concentrationLevel === "high"
                ? "bg-red-500"
                : concentrationLevel === "medium"
                ? "bg-amber-500"
                : "bg-emerald-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${(merchant.total / maxTotal) * 100}%` }}
            transition={{ delay: index * 0.03 + 0.2, duration: 0.5 }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {merchant.count} transações
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {frequencyLabel}
          </span>
        </div>
        <span>
          Média: {formatCurrency(merchant.avgTransaction)}
        </span>
      </div>

      {/* Hover Details */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-border"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Primeira transação:{" "}
                {formatDistanceToNow(merchant.firstSeen, { addSuffix: true, locale: ptBR })}
              </span>
              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                Ver transações
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// CONCENTRATION CHART
// ============================================================================

function ConcentrationChart({ merchants }: { merchants: MerchantInsight[] }) {
  const chartData = useMemo(() => {
    const top5 = merchants.slice(0, 5);
    const othersTotal = merchants.slice(5).reduce((acc, m) => acc + m.total, 0);

    const data = top5.map((m, i) => ({
      name: m.name.length > 15 ? m.name.substring(0, 15) + "..." : m.name,
      value: m.total,
      color: COLORS[i],
    }));

    if (othersTotal > 0) {
      data.push({
        name: "Outros",
        value: othersTotal,
        color: "#94a3b8",
      });
    }

    return data;
  }, [merchants]);

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CockpitMerchants({ merchants, totalSpend, compact = false }: CockpitMerchantsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortKey, setSortKey] = useState<SortKey>("total");

  const total = totalSpend || merchants.reduce((acc, m) => acc + m.total, 0);
  const maxTotal = Math.max(...merchants.map((m) => m.total));

  // Filter and sort merchants
  const filteredMerchants = useMemo(() => {
    let filtered = merchants;

    if (searchQuery) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      switch (sortKey) {
        case "total":
          return b.total - a.total;
        case "count":
          return b.count - a.count;
        case "concentration":
          return b.concentrationRisk - a.concentrationRisk;
        case "frequency":
          return a.frequency - b.frequency;
        default:
          return 0;
      }
    });
  }, [merchants, searchQuery, sortKey]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const highConcentration = merchants.filter((m) => m.concentrationRisk > 20);
    const recurring = merchants.filter((m) => m.isRecurring);
    const top3Share = merchants
      .slice(0, 3)
      .reduce((acc, m) => acc + m.concentrationRisk, 0);

    return {
      totalMerchants: merchants.length,
      highConcentrationCount: highConcentration.length,
      recurringCount: recurring.length,
      top3Share,
    };
  }, [merchants]);

  if (compact) {
    return (
      <div className="space-y-3">
        {merchants.slice(0, 5).map((merchant, i) => (
          <div
            key={merchant.name}
            className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                  i < 3 ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
              <span className="text-sm font-medium truncate">{merchant.name}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold tabular-nums">{formatCurrency(merchant.total)}</p>
              <p className="text-[10px] text-muted-foreground">
                {merchant.concentrationRisk.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Análise de Comerciantes</h2>
          <p className="text-sm text-muted-foreground">
            {summaryStats.totalMerchants} comerciantes únicos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("list")}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "treemap" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("treemap")}
            >
              <PieChart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Store className="w-4 h-4" />
            Comerciantes
          </div>
          <p className="text-2xl font-bold">{summaryStats.totalMerchants}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Alta Concentração
          </div>
          <p className="text-2xl font-bold">{summaryStats.highConcentrationCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Repeat className="w-4 h-4 text-blue-500" />
            Recorrentes
          </div>
          <p className="text-2xl font-bold">{summaryStats.recurringCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <PieChart className="w-4 h-4 text-violet-500" />
            Top 3 Share
          </div>
          <p className="text-2xl font-bold">{summaryStats.top3Share.toFixed(0)}%</p>
        </Card>
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comerciante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1">
          {(["total", "count", "concentration"] as SortKey[]).map((key) => (
            <Button
              key={key}
              variant={sortKey === key ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setSortKey(key)}
            >
              {key === "total"
                ? "Valor"
                : key === "count"
                ? "Transações"
                : "Concentração"}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3 pr-4">
            {filteredMerchants.map((merchant, i) => (
              <MerchantCard
                key={merchant.name}
                merchant={merchant}
                index={i}
                totalSpend={total}
                maxTotal={maxTotal}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Card className="p-4">
          <ConcentrationChart merchants={merchants} />
        </Card>
      )}
    </div>
  );
}
