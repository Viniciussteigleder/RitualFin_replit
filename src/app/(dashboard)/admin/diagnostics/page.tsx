import { Suspense } from "react";
import { auth } from "@/auth";
import { DiagnosticsClient } from "./diagnostics-client";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * DATA INTEGRITY DIAGNOSTICS PAGE
 *
 * UX Design Principles Applied:
 * - Jakob Nielsen: Visibility of system status, error prevention
 * - Don Norman: Affordances, signifiers, feedback
 * - Steve Krug: Don't make me think, obvious hierarchy
 *
 * Design Credits:
 * - Health score concept: Inspired by Datadog's infrastructure health
 * - Card layout: Material Design principles
 * - Severity colors: WCAG accessible contrast ratios
 */

export default async function DiagnosticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">
          Por favor, faça login para acessar diagnósticos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <Suspense fallback={<DiagnosticsLoadingSkeleton />}>
        <DiagnosticsClient />
      </Suspense>
    </div>
  );
}

function DiagnosticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export const dynamic = "force-dynamic";
