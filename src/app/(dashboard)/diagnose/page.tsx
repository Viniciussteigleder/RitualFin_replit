import { auth } from "@/auth";
import { diagnoseAppCategoryIssues } from "@/lib/actions/diagnose";
import { DiagnosticDashboard } from "./diagnostic-dashboard";

export default async function DiagnosePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para acessar diagnósticos.</p>
      </div>
    );
  }

  // Fetch initial data for the dashboard
  const diagnosis = await diagnoseAppCategoryIssues();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10">
      <DiagnosticDashboard initialData={diagnosis} />
    </div>
  );
}

export const revalidate = 0; // Disable caching for the diagnostics page for real-time results
