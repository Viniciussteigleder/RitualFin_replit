import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingDown, TrendingUp, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMonth } from "@/lib/month-context";

type Insight = {
  id: string;
  type: "positive" | "warning" | "neutral";
  title: string;
  description: string;
  category?: string;
  percentage?: number;
};

const typeMeta = {
  positive: {
    icon: TrendingDown,
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700"
  },
  warning: {
    icon: TrendingUp,
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700"
  },
  neutral: {
    icon: ShieldCheck,
    border: "border-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-700"
  }
};

function getPreviousMonth(m: string) {
  const [year, mon] = m.split("-").map(Number);
  const d = new Date(year, mon - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function InsightsPage() {
  const { month, formatMonth } = useMonth();
  const previousMonth = getPreviousMonth(month);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard", month],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?month=${month}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  const { data: prevDashboard, isLoading: isPrevLoading } = useQuery({
    queryKey: ["dashboard", previousMonth],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?month=${previousMonth}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    if (prevDashboard && dashboard) {
      dashboard.spentByCategory?.forEach((cat: any) => {
        const prevCat = prevDashboard.spentByCategory?.find((p: any) => p.category === cat.category);
        if (prevCat && prevCat.amount > 0) {
          const change = ((cat.amount - prevCat.amount) / prevCat.amount) * 100;
          if (Number.isFinite(change)) {
            if (change < -10) {
              insights.push({
                id: `save-${cat.category}`,
                type: "positive",
                title: `Economia em ${cat.category}`,
                description: `Você economizou ${Math.abs(change).toFixed(0)}% em ${cat.category} comparado ao mês anterior.`,
                category: cat.category,
                percentage: Math.abs(change)
              });
            } else if (change > 20) {
              insights.push({
                id: `warn-${cat.category}`,
                type: "warning",
                title: `Atenção com ${cat.category}`,
                description: `Seus gastos em ${cat.category} aumentaram ${change.toFixed(0)}% este mês.`,
                category: cat.category,
                percentage: change
              });
            }
          }
        }
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: "default",
        type: "neutral",
        title: "Gastos estáveis no período",
        description: "Continue acompanhando para manter o controle financeiro."
      });
    }

    return insights.slice(0, 4);
  };

  const insights = generateInsights();

  if (isLoading || isPrevLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-muted-foreground mt-1">
            Leituras automáticas para {formatMonth(month)}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight) => {
            const meta = typeMeta[insight.type];
            const Icon = meta.icon;
            return (
              <Card key={insight.id} className={`${meta.border} ${meta.bg} border`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-base flex items-center gap-2 ${meta.text}`}>
                    <Icon className="h-4 w-4" />
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
