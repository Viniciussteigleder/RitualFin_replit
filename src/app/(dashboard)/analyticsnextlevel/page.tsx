import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import { auth } from "@/auth";
import { getAccounts, getAnalyticsData, getAnalyticsMonthByMonth, getAnalyticsTopMerchants, getAnalyticsRecurringSummary } from "@/lib/actions/analytics";
import { AnalyticsShell } from "@/components/analytics-next/analytics-shell";
import { FilterBar } from "@/components/analytics-next/filter-bar";
import { KpiGrid } from "@/components/analytics-next/kpi-grid";
import { TrendView } from "@/components/analytics-next/trend-view";
import { BreakdownView } from "@/components/analytics-next/breakdown-view";
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

  // 1. Parse Params safely
  const view = (searchParams.view as string) || "overview";
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
    // Map breakdown scope
    // For now, let's just support basic category filters if passed
    // We'll need a way to parse "scope" string later, but for now reuse existing action params if possible
    // The existing actions take `appCategory`, `category1` etc directly.
    // So let's extract them if they exist in query params (we might need to flatten scope)
    ...Object.fromEntries(
        Object.entries(searchParams).filter(([k]) => ["appCategory", "category1", "category2", "category3", "recurring", "fixVar"].includes(k))
    )
  };
  
  // Cast string "true" to boolean for recurring
  if (filters.recurring === "true") (filters as any).recurring = true;
  if (filters.recurring === "false") (filters as any).recurring = false;

  const accounts = await getAccounts();

  // 2. Fetch Data based on View
  let content;
  
  // We always fetch basic KPI data for overview, or specific data for other views
  // Actually, for Overview we might need aggregations
  
  // Reuse existing actions
  // Note: getAnalyticsData returns data for a specific level.
  
  switch(view) {
    case "trends":
        const monthData = await getAnalyticsMonthByMonth(filters);
        content = <TrendView data={monthData} />;
        break;
    case "breakdown":
        const drillData = await getAnalyticsData(filters as any);
        content = <BreakdownView data={drillData} />;
        break;
    case "merchants":
        const merchantData = await getAnalyticsTopMerchants(filters as any, 50);
        content = <div className="p-4 border rounded">Merchant List Component (TODO)</div>;
        break;
    case "recurring":
        const recurringData = await getAnalyticsRecurringSummary(filters as any, 50);
        content = <div className="p-4 border rounded">Recurring List Component (TODO)</div>
        break;
    case "overview":
    default:
        // For overview we want a mix. Let's just show breakdown for now as default
        const overviewData = await getAnalyticsData(filters as any);
        content = <KpiGrid data={overviewData} />;
        break;
  }

  return (
    <AnalyticsShell>
        <FilterBar accounts={accounts} />
        <div className="mt-6">
            {content}
        </div>
    </AnalyticsShell>
  );
}
