"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Zap,
  Target,
  Shield,
  ArrowRight,
  X,
  Info,
  Sparkles,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import type { Insight, Anomaly } from "@/lib/actions/analytics-cockpit";

// ============================================================================
// TYPES
// ============================================================================

interface CockpitInsightsProps {
  insights: Insight[];
  anomalies: Anomaly[];
  compact?: boolean;
}

interface InsightCardProps {
  insight: Insight;
  index: number;
}

interface AnomalyCardProps {
  anomaly: Anomaly;
  index: number;
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const INSIGHT_TYPE_CONFIG: Record<
  Insight["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }
> = {
  observation: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-500/10",
  },
  risk: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-500/10",
  },
  opportunity: {
    icon: Lightbulb,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-500/10",
  },
  recommendation: {
    icon: Target,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-500/10",
  },
};

const ANOMALY_SEVERITY_CONFIG: Record<
  Anomaly["severity"],
  { color: string; bgColor: string; borderColor: string }
> = {
  low: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-500/5",
    borderColor: "border-blue-200 dark:border-blue-500/20",
  },
  medium: {
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-500/5",
    borderColor: "border-amber-200 dark:border-amber-500/20",
  },
  high: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/5",
    borderColor: "border-red-200 dark:border-red-500/20",
  },
};

const ANOMALY_TYPE_ICONS: Record<Anomaly["type"], React.ComponentType<{ className?: string }>> = {
  spike: TrendingUp,
  drop: TrendingDown,
  missing_income: AlertCircle,
  duplicate: AlertTriangle,
  category_drift: Filter,
  new_merchant: Sparkles,
  unusual_amount: Zap,
};

// ============================================================================
// INSIGHT CARD COMPONENT
// ============================================================================

function InsightCard({ insight, index }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = INSIGHT_TYPE_CONFIG[insight.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div
          className={cn(
            "group rounded-xl border bg-card p-4 transition-all duration-200",
            "hover:shadow-md hover:border-border/80",
            isExpanded && "ring-1 ring-border"
          )}
        >
          <CollapsibleTrigger className="w-full text-left">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={cn("rounded-lg p-2 flex-shrink-0", config.bgColor)}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate pr-2">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {insight.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {insight.impact && (
                      <Badge variant="secondary" className="text-xs font-mono">
                        {formatCurrency(insight.impact)}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Priority & Confidence */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <div
                      className="h-1.5 rounded-full bg-muted overflow-hidden"
                      style={{ width: 40 }}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full",
                          insight.priority >= 80
                            ? "bg-red-500"
                            : insight.priority >= 60
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        )}
                        style={{ width: `${insight.priority}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      P{insight.priority}
                    </span>
                  </div>

                  <span className="text-[10px] text-muted-foreground">
                    {insight.confidence}% confiança
                  </span>
                </div>
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {/* Evidence */}
              {insight.evidence.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Evidências
                  </span>
                  <ul className="space-y-1">
                    {insight.evidence.map((e, i) => (
                      <li
                        key={i}
                        className="text-xs text-muted-foreground flex items-start gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action */}
              {insight.actionable && insight.actionUrl && (
                <Link href={insight.actionUrl}>
                  <Button size="sm" className="w-full gap-2 text-xs">
                    {insight.actionText || "Ver detalhes"}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
}

// ============================================================================
// ANOMALY CARD COMPONENT
// ============================================================================

function AnomalyCard({ anomaly, index }: AnomalyCardProps) {
  const config = ANOMALY_SEVERITY_CONFIG[anomaly.severity];
  const Icon = ANOMALY_TYPE_ICONS[anomaly.type] || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-xl border p-3 transition-all duration-200",
        "hover:shadow-md",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.color)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-foreground">{anomaly.title}</h4>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-wider",
                config.color,
                config.borderColor
              )}
            >
              {anomaly.severity}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mt-1">{anomaly.description}</p>

          {anomaly.amount && (
            <p className={cn("text-sm font-bold mt-2 tabular-nums", config.color)}>
              {formatCurrency(anomaly.amount)}
            </p>
          )}

          {anomaly.actionUrl && (
            <Link href={anomaly.actionUrl} className="inline-block mt-2">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                Investigar
                <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN INSIGHTS PANEL
// ============================================================================

export function CockpitInsightsPanel({ insights, anomalies, compact = false }: CockpitInsightsProps) {
  const [activeFilter, setActiveFilter] = useState<Insight["type"] | "all">("all");

  const filteredInsights = useMemo(() => {
    if (activeFilter === "all") return insights;
    return insights.filter((i) => i.type === activeFilter);
  }, [insights, activeFilter]);

  // Sort by priority
  const sortedInsights = useMemo(() => {
    return [...filteredInsights].sort((a, b) => b.priority - a.priority);
  }, [filteredInsights]);

  // High severity anomalies first
  const sortedAnomalies = useMemo(() => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return [...anomalies].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [anomalies]);

  const insightTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: insights.length };
    insights.forEach((i) => {
      counts[i.type] = (counts[i.type] || 0) + 1;
    });
    return counts;
  }, [insights]);

  if (compact) {
    // Compact view: Just top 3 insights as a summary
    const topInsights = sortedInsights.slice(0, 3);
    const criticalAnomalies = sortedAnomalies.filter((a) => a.severity === "high");

    return (
      <div className="space-y-3">
        {criticalAnomalies.length > 0 && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {criticalAnomalies.length} anomalia
                {criticalAnomalies.length > 1 ? "s" : ""} crítica
                {criticalAnomalies.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {topInsights.map((insight, i) => {
          const config = INSIGHT_TYPE_CONFIG[insight.type];
          const Icon = config.icon;
          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Icon className={cn("w-4 h-4 mt-0.5", config.color)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{insight.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {insight.description}
                </p>
              </div>
              {insight.actionUrl && (
                <Link href={insight.actionUrl}>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Anomalies Section */}
      {anomalies.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold">Radar de Anomalias</h3>
              <Badge variant="destructive" className="text-[10px]">
                {anomalies.length}
              </Badge>
            </div>
          </div>

          <div className="grid gap-2">
            {sortedAnomalies.slice(0, 5).map((anomaly, i) => (
              <AnomalyCard key={anomaly.id} anomaly={anomaly} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Insights Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold">Insights Inteligentes</h3>
            <Badge variant="secondary" className="text-[10px]">
              {insights.length}
            </Badge>
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {(["all", "risk", "recommendation", "observation", "opportunity"] as const).map(
            (type) => {
              const count = insightTypeCounts[type] || 0;
              if (type !== "all" && count === 0) return null;

              return (
                <Button
                  key={type}
                  variant={activeFilter === type ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs gap-1 flex-shrink-0",
                    activeFilter === type && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => setActiveFilter(type)}
                >
                  {type === "all"
                    ? "Todos"
                    : type === "risk"
                    ? "Riscos"
                    : type === "recommendation"
                    ? "Recomendações"
                    : type === "observation"
                    ? "Observações"
                    : "Oportunidades"}
                  {count > 0 && (
                    <span className="font-mono text-[10px] opacity-70">({count})</span>
                  )}
                </Button>
              );
            }
          )}
        </div>

        {/* Insights List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {sortedInsights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} index={i} />
            ))}
          </AnimatePresence>

          {sortedInsights.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum insight encontrado para este filtro</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NARRATIVE MODE COMPONENT
// ============================================================================

interface NarrativeModeProps {
  insights: Insight[];
  anomalies: Anomaly[];
  kpiSummary: {
    income: number;
    expense: number;
    savingsRate: number;
    topCategory: string;
    topCategoryAmount: number;
  };
  periodLabel: string;
}

export function CockpitNarrativeMode({
  insights,
  anomalies,
  kpiSummary,
  periodLabel,
}: NarrativeModeProps) {
  const riskInsights = insights.filter((i) => i.type === "risk");
  const recommendations = insights.filter((i) => i.type === "recommendation");

  const narrativeParts = useMemo(() => {
    const parts: string[] = [];

    // Opening
    if (kpiSummary.savingsRate >= 20) {
      parts.push(
        `Em ${periodLabel}, você teve um excelente desempenho financeiro com taxa de poupança de ${kpiSummary.savingsRate.toFixed(
          1
        )}%.`
      );
    } else if (kpiSummary.savingsRate >= 0) {
      parts.push(
        `Em ${periodLabel}, você conseguiu manter as finanças equilibradas com taxa de poupança de ${kpiSummary.savingsRate.toFixed(
          1
        )}%.`
      );
    } else {
      parts.push(
        `Em ${periodLabel}, suas despesas superaram as receitas, resultando em um déficit.`
      );
    }

    // Top spending
    parts.push(
      `A categoria ${kpiSummary.topCategory} foi a maior despesa, representando ${formatCurrency(
        kpiSummary.topCategoryAmount
      )}.`
    );

    // Risks
    if (riskInsights.length > 0) {
      parts.push(
        `Identificamos ${riskInsights.length} ponto${
          riskInsights.length > 1 ? "s" : ""
        } de atenção que merecem análise.`
      );
    }

    // Recommendations
    if (recommendations.length > 0) {
      const totalImpact = recommendations.reduce((acc, r) => acc + (r.impact || 0), 0);
      if (totalImpact > 0) {
        parts.push(
          `Nossas recomendações podem gerar economia potencial de ${formatCurrency(totalImpact)}.`
        );
      }
    }

    return parts;
  }, [kpiSummary, periodLabel, riskInsights, recommendations]);

  return (
    <Card className="border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-500/5 dark:to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-base">Resumo Inteligente</CardTitle>
            <CardDescription className="text-xs">{periodLabel}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {narrativeParts.join(" ")}
        </p>

        {(riskInsights.length > 0 || recommendations.length > 0) && (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
            {riskInsights.slice(0, 2).map((insight) => (
              <Link key={insight.id} href={insight.actionUrl || "#"}>
                <Badge
                  variant="outline"
                  className="text-xs gap-1 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-500/10"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  {insight.title}
                </Badge>
              </Link>
            ))}
            {recommendations.slice(0, 2).map((insight) => (
              <Link key={insight.id} href={insight.actionUrl || "#"}>
                <Badge
                  variant="outline"
                  className="text-xs gap-1 cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-500/10"
                >
                  <Target className="w-3 h-3 text-violet-500" />
                  {insight.title}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
