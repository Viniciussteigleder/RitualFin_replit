import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Target } from "lucide-react";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Financial Goals" 
        description="Define and track your progress towards long-term savings."
        breadcrumbs={[
            { label: "Planning" },
            { label: "Goals" }
        ]}
      />

      <Card className="border-dashed border-2 bg-slate-50/50 py-20">
        <CardContent className="flex flex-col items-center text-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm mb-6">
                <Target className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Goals Tracking is Coming Soon</h3>
            <p className="text-slate-500 mt-2 max-w-[320px] leading-relaxed">
                Start dreaming big! We're building a tool to help you reach your financial milestones with automated tracking.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

