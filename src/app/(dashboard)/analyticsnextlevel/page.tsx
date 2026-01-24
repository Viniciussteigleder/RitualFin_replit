import { startOfMonth, endOfMonth, parseISO, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { auth } from "@/auth";
import { Metadata } from "next";

// Actions
import {
  getAccounts,
  getAnalyticsData,
} from "@/lib/actions/analytics";
import {
  getExecutiveKPIs,
  getCategoryBreakdown,
  getTrendData,
  getMerchantInsights,
  getRecurringInsights,
  detectAnomalies,
  generateInsights,
  getDataQuality,
  type CockpitFilters,
} from "@/lib/actions/analytics-cockpit";

// Components
import { CockpitShell, CockpitTabContent } from "@/components/analytics-next/cockpit-shell";
import { CockpitFilterPanel } from "@/components/analytics-next/cockpit-filter-panel";
import { CockpitKpiStrip } from "@/components/analytics-next/cockpit-kpi-strip";
import { CockpitTrendChart } from "@/components/analytics-next/cockpit-trend-chart";
import { CockpitInsightsPanel } from "@/components/analytics-next/cockpit-insights";
import { CockpitMerchants } from "@/components/analytics-next/cockpit-merchants";
import { CockpitRecurring } from "@/components/analytics-next/cockpit-recurring";
import { OverviewTab, TrendsTab } from "@/components/analytics-next/tabs";
import { BreakdownView } from "@/components/analytics-next/breakdown-view";

export const metadata: Metadata = {
  title: "Analytics Cockpit | RitualFin",
  description: "Enterprise-grade analytics dashboard for personal finance",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AnalyticsCockpitPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Acesso negado</p>
      </div>
    );
  }

  // ============================================================================
  // PARSE FILTERS
  // ============================================================================

  const start = searchParams.start as string;
  const end = searchParams.end as string;
  const now = new Date();

  const startDate = start ? parseISO(start) : startOfMonth(now);
  const endDate = end ? parseISO(end) : endOfMonth(now);

  const view = (searchParams.view as string) || "overview";

  // Build filters
  const filters: CockpitFilters = {
    startDate,
    endDate,
    accountId: (searchParams.accounts as string) || undefined,
    type: searchParams.type === "expense" ? "Despesa" : searchParams.type === "income" ? "Receita" : undefined,
    fixVar: (searchParams.fixVar as "Fixo" | "Variável") || undefined,
    recurring: searchParams.recurring === "true" ? true : searchParams.recurring === "false" ? false : undefined,
    appCategory: (searchParams.appCategory as string) || undefined,
    category1: (searchParams.category1 as string) || undefined,
    category2: (searchParams.category2 as string) || undefined,
    category3: (searchParams.category3 as string) || undefined,
  };

  // Period label for display
  const periodLabel = format(startDate, "MMMM yyyy", { locale: ptBR });

  // ============================================================================
  // FETCH DATA IN PARALLEL
  // ============================================================================

  const [
    accounts,
    kpis,
    breakdown,
    trends,
    merchants,
    recurring,
    anomalies,
    insights,
    dataQuality,
    drillDownData,
  ] = await Promise.all([
    getAccounts(),
    getExecutiveKPIs(filters),
    getCategoryBreakdown(filters),
    getTrendData({ ...filters, startDate: subMonths(startDate, 11), endDate }, 12),
    getMerchantInsights(filters, 30),
    getRecurringInsights(filters),
    detectAnomalies(filters),
    generateInsights(filters),
    getDataQuality(filters),
    getAnalyticsData({
      startDate,
      endDate,
      type: filters.type,
      fixVar: filters.fixVar,
      recurring: filters.recurring,
      appCategory: filters.appCategory,
      category1: filters.category1,
      category2: filters.category2,
      category3: filters.category3,
    }),
  ]);

  // Get income for recurring calculation
  const incomeKPI = kpis.find((k) => k.id === "total_income");
  const monthlyIncome = incomeKPI?.value || 0;

  // ============================================================================
  // RENDER TAB CONTENT
  // ============================================================================

  const renderTabContent = () => {
    switch (view) {
      case "overview":
        return (
          <OverviewTab
            kpis={kpis}
            breakdown={breakdown}
            trends={trends}
            merchants={merchants}
            recurring={recurring}
            anomalies={anomalies}
            insights={insights}
            periodLabel={periodLabel}
          />
        );

      case "trends":
        return <TrendsTab trends={trends} breakdown={breakdown} />;

      case "breakdown":
        return (
          <CockpitTabContent
            title="Detalhamento"
            description="Explore suas despesas por categoria, subcategoria e transação"
          >
            <div className="space-y-6">
              <CockpitKpiStrip kpis={kpis} compact />
              <BreakdownView data={drillDownData} />
            </div>
          </CockpitTabContent>
        );

      case "merchants":
        return (
          <CockpitTabContent
            title="Comerciantes"
            description="Análise de gastos por comerciante e concentração de risco"
          >
            <CockpitMerchants
              merchants={merchants}
              totalSpend={kpis.find((k) => k.id === "total_expense")?.value}
            />
          </CockpitTabContent>
        );

      case "recurring":
        return (
          <CockpitTabContent
            title="Recorrentes"
            description="Assinaturas, custos fixos e pagamentos recorrentes"
          >
            <CockpitRecurring recurring={recurring} monthlyIncome={monthlyIncome} />
          </CockpitTabContent>
        );

      case "anomalies":
        return (
          <CockpitTabContent
            title="Anomalias"
            description="Picos, quedas e padrões incomuns detectados"
          >
            <div className="space-y-6">
              <CockpitKpiStrip kpis={kpis} compact />
              <CockpitInsightsPanel insights={insights} anomalies={anomalies} />
            </div>
          </CockpitTabContent>
        );

      default:
        return (
          <OverviewTab
            kpis={kpis}
            breakdown={breakdown}
            trends={trends}
            merchants={merchants}
            recurring={recurring}
            anomalies={anomalies}
            insights={insights}
            periodLabel={periodLabel}
          />
        );
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CockpitShell
      filterPanel={<CockpitFilterPanel accounts={accounts} categories={breakdown} />}
      activeAnomalies={anomalies.filter((a) => a.severity === "high").length}
    >
      {renderTabContent()}
    </CockpitShell>
  );
}
