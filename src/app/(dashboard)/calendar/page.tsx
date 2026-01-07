import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Financial Calendar" 
        description="Visualize your recurring payments and upcoming bills."
        breadcrumbs={[
            { label: "Overview", href: "/dashboard" },
            { label: "Calendar" }
        ]}
      />

      <Card className="border-dashed border-2 bg-slate-50/50 py-20">
        <CardContent className="flex flex-col items-center text-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm mb-6">
                <CalendarIcon className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Calendar View is Coming Soon</h3>
            <p className="text-slate-500 mt-2 max-w-[320px] leading-relaxed">
                We're building a beautiful way to track your cash flow over time. Stay tuned for automatic bill detection!
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

