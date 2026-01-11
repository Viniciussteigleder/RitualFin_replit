import { Skeleton } from "./skeleton";

/**
 * Metric Card Skeleton for Dashboard
 */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-8 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

/**
 * Transaction List Skeleton
 */
export function TransactionListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Skeleton for Dashboard
 */
export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <Skeleton className="h-48 w-48 rounded-full" />
        <div className="flex-1 w-full space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Account Card Skeleton
 */
export function AccountCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-6 w-24 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Calendar Day Skeleton
 */
export function CalendarDaySkeleton() {
  return (
    <div className="min-h-[120px] p-2 border border-border rounded-lg space-y-2">
      <Skeleton className="h-4 w-6" />
      <Skeleton className="h-6 w-full rounded-md" />
      <Skeleton className="h-6 w-full rounded-md" />
    </div>
  );
}

/**
 * Page Header Skeleton
 */
export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-card p-10 rounded-2xl border border-border shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-14 w-32 rounded-2xl" />
    </div>
  );
}

/**
 * Dashboard Grid Skeleton - Full dashboard loading state
 */
export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-32">
      <PageHeaderSkeleton />
      
      {/* Top Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2">
          <MetricCardSkeleton />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <MetricCardSkeleton />
      </div>

      {/* Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AccountCardSkeleton />
        <AccountCardSkeleton />
        <AccountCardSkeleton />
      </div>
    </div>
  );
}
