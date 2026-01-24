"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Repeat,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CreditCard,
  Zap,
  Tag,
  ChevronRight,
  Clock,
  DollarSign,
  Percent,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RecurringInsight } from "@/lib/actions/analytics-cockpit";
import { format, addDays, addMonths, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================================================
// TYPES
// ============================================================================

interface CockpitRecurringProps {
  recurring: RecurringInsight[];
  monthlyIncome?: number;
  compact?: boolean;
}

type FilterMode = "all" | "monthly" | "subscriptions" | "high_value";

// ============================================================================
// FREQUENCY CONFIG
// ============================================================================

const FREQUENCY_CONFIG: Record<
  RecurringInsight["frequency"],
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  daily: { label: "Diário", color: "text-red-500", icon: Zap },
  weekly: { label: "Semanal", color: "text-amber-500", icon: Calendar },
  biweekly: { label: "Quinzenal", color: "text-blue-500", icon: Calendar },
  monthly: { label: "Mensal", color: "text-emerald-500", icon: Repeat },
  quarterly: { label: "Trimestral", color: "text-violet-500", icon: Clock },
  yearly: { label: "Anual", color: "text-pink-500", icon: Calendar },
};

// ============================================================================
// RECURRING CARD
// ============================================================================

interface RecurringCardProps {
  item: RecurringInsight;
  index: number;
  maxAmount: number;
  monthlyIncome: number;
}

function RecurringCard({ item, index, maxAmount, monthlyIncome }: RecurringCardProps) {
  const config = FREQUENCY_CONFIG[item.frequency];
  const Icon = config.icon;

  const incomePercent = monthlyIncome > 0 ? (item.monthlyAmount / monthlyIncome) * 100 : 0;
  const isHighValue = item.monthlyAmount > 50 || incomePercent > 5;
  const isVeryHighValue = item.monthlyAmount > 100 || incomePercent > 10;

  // Calculate next expected date
  const nextExpected = useMemo(() => {
    if (item.dayOfMonth) {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), item.dayOfMonth);
      if (isBefore(thisMonth, now)) {
        return addMonths(thisMonth, 1);
      }
      return thisMonth;
    }
    return null;
  }, [item.dayOfMonth]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "group relative rounded-xl border bg-card p-4 transition-all duration-200",
        "hover:shadow-md hover:border-border/80",
        isVeryHighValue && "border-amber-200 dark:border-amber-500/20"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              item.isSubscription
                ? "bg-violet-100 dark:bg-violet-500/10"
                : "bg-blue-100 dark:bg-blue-500/10"
            )}
          >
            {item.isSubscription ? (
              <CreditCard className="w-5 h-5 text-violet-500" />
            ) : (
              <Repeat className="w-5 h-5 text-blue-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {item.name}
              </h4>
              {isHighValue && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>Alto valor recorrente</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("text-[10px] h-5 gap-1", config.color)}>
                <Icon className="w-3 h-3" />
                {config.label}
              </Badge>
              <Badge variant="secondary" className="text-[10px] h-5">
                {item.category}
              </Badge>
            </div>

            {/* Next Expected */}
            {nextExpected && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Próximo: {format(nextExpected, "dd MMM", { locale: ptBR })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-foreground tabular-nums">
            {formatCurrency(item.monthlyAmount)}
          </p>
          <p className="text-xs text-muted-foreground">/mês</p>
          {monthlyIncome > 0 && (
            <p className={cn(
              "text-[10px] font-medium mt-1",
              incomePercent > 10 ? "text-amber-500" : "text-muted-foreground"
            )}>
              {incomePercent.toFixed(1)}% da renda
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isVeryHighValue
                ? "bg-amber-500"
                : item.isSubscription
                ? "bg-violet-500"
                : "bg-blue-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${(item.monthlyAmount / maxAmount) * 100}%` }}
            transition={{ delay: index * 0.03 + 0.2, duration: 0.5 }}
          />
        </div>
      </div>

      {/* Confidence */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className={cn(
            "w-3 h-3",
            item.confidence >= 80 ? "text-emerald-500" : item.confidence >= 50 ? "text-amber-500" : "text-red-500"
          )} />
          {item.confidence}% confiança
        </span>
        {item.priceChange !== undefined && item.priceChange !== 0 && (
          <span className={cn(
            "flex items-center gap-0.5",
            item.priceChange > 0 ? "text-red-500" : "text-emerald-500"
          )}>
            {item.priceChange > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(item.priceChange).toFixed(0)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUMMARY CARDS
// ============================================================================

interface RecurringSummaryProps {
  recurring: RecurringInsight[];
  monthlyIncome: number;
}

function RecurringSummary({ recurring, monthlyIncome }: RecurringSummaryProps) {
  const stats = useMemo(() => {
    const totalMonthly = recurring.reduce((acc, r) => acc + r.monthlyAmount, 0);
    const totalYearly = totalMonthly * 12;
    const subscriptions = recurring.filter((r) => r.isSubscription);
    const subscriptionTotal = subscriptions.reduce((acc, r) => acc + r.monthlyAmount, 0);
    const fixedCosts = recurring.filter((r) => !r.isSubscription);
    const fixedTotal = fixedCosts.reduce((acc, r) => acc + r.monthlyAmount, 0);
    const incomeRatio = monthlyIncome > 0 ? (totalMonthly / monthlyIncome) * 100 : 0;

    return {
      totalMonthly,
      totalYearly,
      subscriptionCount: subscriptions.length,
      subscriptionTotal,
      fixedCount: fixedCosts.length,
      fixedTotal,
      incomeRatio,
    };
  }, [recurring, monthlyIncome]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <DollarSign className="w-4 h-4" />
          Total Mensal
        </div>
        <p className="text-2xl font-bold text-foreground">
          {formatCurrency(stats.totalMonthly)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatCurrency(stats.totalYearly)}/ano
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <CreditCard className="w-4 h-4 text-violet-500" />
          Assinaturas
        </div>
        <p className="text-2xl font-bold text-foreground">
          {stats.subscriptionCount}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatCurrency(stats.subscriptionTotal)}/mês
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Repeat className="w-4 h-4 text-blue-500" />
          Custos Fixos
        </div>
        <p className="text-2xl font-bold text-foreground">
          {stats.fixedCount}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatCurrency(stats.fixedTotal)}/mês
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Percent className="w-4 h-4" />
          % da Renda
        </div>
        <p className={cn(
          "text-2xl font-bold",
          stats.incomeRatio > 50 ? "text-red-500" : stats.incomeRatio > 35 ? "text-amber-500" : "text-emerald-500"
        )}>
          {stats.incomeRatio.toFixed(0)}%
        </p>
        <Progress
          value={Math.min(100, stats.incomeRatio)}
          className="h-1 mt-2"
        />
      </Card>
    </div>
  );
}

// ============================================================================
// UPCOMING PAYMENTS
// ============================================================================

function UpcomingPayments({ recurring }: { recurring: RecurringInsight[] }) {
  const upcoming = useMemo(() => {
    const now = new Date();
    const endOfMonth = addDays(now, 30);

    return recurring
      .filter((r) => r.dayOfMonth)
      .map((r) => {
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), r.dayOfMonth!);
        const nextMonth = addMonths(thisMonth, 1);
        const nextDate = isBefore(thisMonth, now) ? nextMonth : thisMonth;

        return {
          ...r,
          nextDate,
          daysUntil: Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        };
      })
      .filter((r) => r.daysUntil >= 0 && r.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [recurring]);

  if (upcoming.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Próximos Pagamentos
        </CardTitle>
        <CardDescription className="text-xs">
          Previsão para os próximos 30 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcoming.map((item, i) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                  item.daysUntil <= 3
                    ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    : item.daysUntil <= 7
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {item.daysUntil}d
                </div>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(item.nextDate, "dd MMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold tabular-nums">
                {formatCurrency(item.monthlyAmount)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CockpitRecurring({
  recurring,
  monthlyIncome = 0,
  compact = false,
}: CockpitRecurringProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const maxAmount = Math.max(...recurring.map((r) => r.monthlyAmount));

  // Filter recurring
  const filteredRecurring = useMemo(() => {
    switch (filterMode) {
      case "monthly":
        return recurring.filter((r) => r.frequency === "monthly");
      case "subscriptions":
        return recurring.filter((r) => r.isSubscription);
      case "high_value":
        return recurring.filter((r) => r.monthlyAmount > 30);
      default:
        return recurring;
    }
  }, [recurring, filterMode]);

  if (compact) {
    return (
      <div className="space-y-3">
        {recurring.slice(0, 5).map((item, i) => {
          const config = FREQUENCY_CONFIG[item.frequency];
          return (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center",
                  item.isSubscription ? "bg-violet-100" : "bg-blue-100"
                )}>
                  {item.isSubscription ? (
                    <CreditCard className="w-3 h-3 text-violet-500" />
                  ) : (
                    <Repeat className="w-3 h-3 text-blue-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className={cn("text-[10px]", config.color)}>{config.label}</p>
                </div>
              </div>
              <p className="text-sm font-bold tabular-nums flex-shrink-0">
                {formatCurrency(item.monthlyAmount)}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Pagamentos Recorrentes</h2>
          <p className="text-sm text-muted-foreground">
            {recurring.length} pagamentos identificados
          </p>
        </div>
      </div>

      {/* Summary */}
      <RecurringSummary recurring={recurring} monthlyIncome={monthlyIncome} />

      {/* Upcoming Payments */}
      <UpcomingPayments recurring={recurring} />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(["all", "monthly", "subscriptions", "high_value"] as FilterMode[]).map((mode) => (
          <Button
            key={mode}
            variant={filterMode === mode ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFilterMode(mode)}
          >
            {mode === "all"
              ? "Todos"
              : mode === "monthly"
              ? "Mensais"
              : mode === "subscriptions"
              ? "Assinaturas"
              : "Alto Valor"}
          </Button>
        ))}
      </div>

      {/* List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          {filteredRecurring.map((item, i) => (
            <RecurringCard
              key={item.name}
              item={item}
              index={i}
              maxAmount={maxAmount}
              monthlyIncome={monthlyIncome}
            />
          ))}

          {filteredRecurring.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum pagamento encontrado</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
