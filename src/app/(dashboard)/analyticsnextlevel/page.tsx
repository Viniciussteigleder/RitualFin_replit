import { startOfMonth, endOfMonth, parseISO, subMonths, differenceInDays, subDays } from "date-fns";
import { auth } from "@/auth";
import { getAccounts, getAnalyticsData, getAnalyticsMonthByMonth, getAnalyticsTopMerchants, getAnalyticsRecurringSummary } from "@/lib/actions/analytics";
import { AnalyticsShell } from "@/components/analytics-next/analytics-shell";
import { FilterBar } from "@/components/analytics-next/filter-bar";
import { KpiGrid } from "@/components/analytics-next/kpi-grid";

import { BreakdownView } from "@/components/analytics-next/breakdown-view";
import { MerchantList } from "@/components/analytics-next/merchant-list";
import { RecurringList } from "@/components/analytics-next/recurring-list";
import { AnalyticsCockpit } from "@/components/analytics-next/analytics-cockpit";
import { PredictiveTrendChart } from "@/components/analytics-next/predictive-trend-chart";
import { FinancialHealthGauge } from "@/components/analytics-next/financial-health-gauge";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Next | RitualFin",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AnalyticsNextPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id) return <div>Access Denied</div>;

  const start = (searchParams.start as string);
  const end = (searchParams.end as string);
  const now = new Date();
  
  const startDate = start ? parseISO(start) : startOfMonth(now);
  const endDate = end ? parseISO(end) : endOfMonth(now);

  const filters: any = {
    startDate,
    endDate,
    accountId: (searchParams.accounts as string) || undefined,
    type: (searchParams.type as any) === "all" ? undefined : (searchParams.type as any),
    ...Object.fromEntries(
        Object.entries(searchParams).filter(([k]) => ["appCategory", "category1", "category2", "category3", "recurring", "fixVar"].includes(k))
    )
  };
  
  if (filters.recurring === "true") (filters as any).recurring = true;
  if (filters.recurring === "false") (filters as any).recurring = false;

  const accounts = await getAccounts();

  // Parallel Data Fetching
  const [
    kpis, 
    monthlyData, 
    topMerchants, 
    recurringData
  ] = await Promise.all([
    getAnalyticsData(filters), 
    getAnalyticsMonthByMonth(filters), 
    getAnalyticsTopMerchants(filters, 20), 
    getAnalyticsRecurringSummary(filters, 20) 
  ]);

  // Calculate Previous Period for comparisons
  const durationInDays = differenceInDays(endDate, startDate) + 1;
  const isOneMonth = durationInDays >= 28 && durationInDays <= 31 && startDate.getDate() === 1;
  
  const prevStartDate = isOneMonth ? subMonths(startDate, 1) : subDays(startDate, durationInDays);
  const prevEndDate = isOneMonth ? subMonths(endDate, 1) : subDays(endDate, durationInDays);

  const prevFilters = { ...filters, startDate: prevStartDate, endDate: prevEndDate };
  
  // Fetch previous period data (fail-safe)
  const previousPeriodData = await getAnalyticsData(prevFilters).catch(() => null);

  // Derived Health Score (using improved monthly data)
  const healthScore = calculateHealthScore(monthlyData);

  return (
    <AnalyticsShell>
      <AnalyticsCockpit
        header={
          <FilterBar accounts={accounts} />
        }
        kpiGrid={<KpiGrid data={kpis} previousData={previousPeriodData} />}
        trendChart={<PredictiveTrendChart data={monthlyData} />}
        healthScore={<FinancialHealthGauge score={healthScore} />}
        breakdown={<BreakdownView data={kpis} />}
        merchantList={<MerchantList data={topMerchants} />}
        recurringList={<RecurringList data={recurringData} />}
      />
    </AnalyticsShell>
  );
}

// Health score derived from recent monthly data
function calculateHealthScore(monthlyData: any[]) {
  if (!monthlyData || monthlyData.length === 0) return 50;

  const totalIncome = monthlyData.reduce((acc, curr) => acc + (curr.income || 0), 0);
  const totalExpense = monthlyData.reduce((acc, curr) => acc + (curr.outcome || 0), 0);
  
  if (totalIncome === 0) return totalExpense > 0 ? 30 : 50;

  const savings = totalIncome - totalExpense;
  const savingsRate = (savings / totalIncome) * 100;
  
  let score = 50;
  if (savingsRate >= 20) {
      score = 70 + Math.min(savingsRate - 20, 30);
  } else if (savingsRate >= 0) {
      score = 40 + (savingsRate * 1.5);
  } else {
      const deficit = Math.abs(savingsRate);
      score = Math.max(0, 40 - (deficit * 0.8));
  }
  
  return Math.round(score);
}
