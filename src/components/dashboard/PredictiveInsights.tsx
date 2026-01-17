"use client";

import { useEffect, useState } from "react";
import { 
  Zap, 
  AlertTriangle, 
  TrendingDown, 
  CalendarClock, 
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  BellRing
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { BurnRateInfo, RecurringPattern, getBudgetBurnRates, discoverRecurringPatterns } from "@/lib/actions/predictive";
import { getMonthlyProjection } from "@/lib/actions/goals";
import Link from "next/link";

export function PredictiveInsights() {
  const [burnRates, setBurnRates] = useState<BurnRateInfo[]>([]);
  const [patterns, setPatterns] = useState<RecurringPattern[]>([]);
  const [projection, setProjection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [rates, foundPatterns, monthlyProj] = await Promise.all([
          getBudgetBurnRates(),
          discoverRecurringPatterns(),
          getMonthlyProjection()
        ]);
        setBurnRates(rates);
        setPatterns(foundPatterns);
        setProjection(monthlyProj);
      } catch (err) {
        console.error("Failed to fetch predictive insights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return null;

  const alerts = burnRates.filter(r => r.burnRateStatus === "overflow" || r.burnRateStatus === "warning");
  const suggestions = patterns.filter(p => p.confidence > 0.75);

  if (alerts.length === 0 && suggestions.length === 0 && !projection) return null;

  const projectedSavings = projection ? projection.projectedIncome - projection.projectedTotal : 0;
  const isHealthy = projectedSavings > 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
      <div className="flex items-center justify-between px-1">
          <h3 className="text-2xl font-bold text-foreground font-display flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary fill-primary/20" />
            Neural Engine v2.0 <span className="text-muted-foreground/30 font-normal">| Insights</span>
          </h3>
          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5">P6 Engine</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Financial Health & Projection */}
        {projection && (
          <Card className={cn(
            "rounded-[2.5rem] border-border bg-card shadow-sm overflow-hidden h-full flex flex-col",
            isHealthy ? "border-emerald-500/10 bg-emerald-50/5" : "border-rose-500/10 bg-rose-50/5"
          )}>
            <CardContent className="p-8 flex flex-col gap-6 h-full">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                  isHealthy ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"
                )}>
                  {isHealthy ? <TrendingDown className="h-6 w-6 rotate-180" /> : <TrendingDown className="h-6 w-6" />}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground font-display">Fluxo de Caixa</h4>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Projeção do Mês</p>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Saldo Final Estimado</span>
                  <div className={cn("text-3xl font-bold font-display tracking-tight", isHealthy ? "text-emerald-600" : "text-rose-600")}>
                    {formatCurrency(projectedSavings)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted-foreground flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Entrada
                    </span>
                    <span>{formatCurrency(projection.projectedIncome)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted-foreground flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Saída
                    </span>
                    <span>{formatCurrency(projection.projectedTotal)}</span>
                  </div>
                </div>
              </div>

              <Link href="/goals" className="mt-auto">
                <Button variant="ghost" className="w-full text-primary hover:bg-primary/5 rounded-xl font-bold gap-2 text-[10px] uppercase tracking-widest">
                  Ver Detalhes da Projeção <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Column 2: Burn Rate Alerts */}
        <Card className={cn(
          "rounded-[2.5rem] border-border bg-card shadow-sm overflow-hidden h-full",
          alerts.length > 0 && "border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/5"
        )}>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors",
                alerts.length > 0 ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-primary/10 text-primary shadow-none"
              )}>
                {alerts.length > 0 ? <AlertTriangle className="h-6 w-6" /> : <Lightbulb className="h-6 w-6" />}
              </div>
              <div>
                <h4 className="text-xl font-bold font-display">Velocidade de Gasto</h4>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Burn Rate Monitor</p>
              </div>
            </div>

            <div className="space-y-4 min-h-[140px]">
              {alerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mb-2" />
                  <p className="text-xs font-medium text-muted-foreground">Todos os orçamentos estão dentro do ritmo esperado.</p>
                </div>
              ) : (
                alerts.slice(0, 2).map((alert, idx) => (
                  <div key={idx} className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-rose-200/50 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-foreground">{alert.category1}</span>
                      <span className="text-[10px] font-black text-rose-600 uppercase">🚨 +{Math.round(alert.projectedPercentage - 100)}%</span>
                    </div>
                    <div className="w-full h-1 bg-rose-200/30 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, alert.projectedPercentage)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Atingirá o limite em {alert.daysUntilExhaustion === 0 ? "HOJE" : `${alert.daysUntilExhaustion} dias`}.
                    </p>
                  </div>
                ))
              )}
            </div>

            <Link href="/budgets" className="block w-full">
              <Button variant="ghost" className="w-full rounded-xl font-bold gap-2 text-[10px] uppercase tracking-widest hover:bg-secondary">
                Gerir Orçamentos <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Column 3: Pattern Discoveries */}
        <Card className={cn(
          "rounded-[2.5rem] border-border bg-card shadow-sm overflow-hidden h-full",
          suggestions.length > 0 && "border-primary/20 bg-primary/5"
        )}>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors",
                suggestions.length > 0 ? "bg-primary text-white shadow-primary/20" : "bg-emerald-500/10 text-emerald-600 shadow-none"
              )}>
                {suggestions.length > 0 ? <BellRing className="h-6 w-6" /> : <CalendarClock className="h-6 w-6" />}
              </div>
              <div>
                <h4 className="text-xl font-bold font-display">Assinaturas IA</h4>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Smart Patterns</p>
              </div>
            </div>

            <div className="space-y-4 min-h-[140px]">
              {suggestions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mb-2" />
                  <p className="text-xs font-medium text-muted-foreground">Nenhuma assinatura oculta detectada recentemente.</p>
                </div>
              ) : (
                suggestions.slice(0, 2).map((pattern, idx) => (
                  <div key={idx} className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-primary/10 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-foreground truncate max-w-[140px]">{pattern.descNorm}</span>
                      <span className="text-xs font-bold text-emerald-600">{formatCurrency(pattern.averageAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-tighter">
                          IA: {Math.round(pattern.confidence * 100)}%
                       </Badge>
                       <span className="text-[9px] font-bold text-muted-foreground uppercase">{pattern.frequency}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link href="/agenda" className="block w-full">
              <Button variant="ghost" className="w-full rounded-xl font-bold gap-2 text-[10px] uppercase tracking-widest hover:bg-secondary">
                Otimizar Agenda <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
