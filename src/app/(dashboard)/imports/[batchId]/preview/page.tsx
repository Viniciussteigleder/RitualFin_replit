import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ingestionBatches, ingestionItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { commitBatch } from "@/lib/actions/ingest";

interface PreviewPageProps {
  params: {
    batchId: string;
  };
}

export default async function ImportPreviewPage({ params }: PreviewPageProps) {
  const batch = await db.query.ingestionBatches.findFirst({
    where: eq(ingestionBatches.id, params.batchId),
    with: {
      items: {
        limit: 20, // Show first 20 rows
      },
    },
  });

  if (!batch) {
    notFound();
  }

  const diagnostics = batch.diagnosticsJson as any;
  const hasErrors = batch.status === "error";
  const canProceed = batch.status === "preview";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Preview"
        description="Review your data before importing"
        breadcrumbs={[
          { label: "Imports", href: "/uploads" },
          { label: "Preview" },
        ]}
      />

      {/* Parsing Diagnostics */}
      {diagnostics && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Info className="h-5 w-5" />
              Parsing Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                  Format Detected
                </div>
                <div className="text-sm font-bold text-indigo-900 mt-1">
                  {diagnostics.format || "Standard CSV"}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                  Total Rows
                </div>
                <div className="text-sm font-bold text-indigo-900 mt-1">
                  {diagnostics.rowsTotal || batch.items.length}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                  New Transactions
                </div>
                <div className="text-sm font-bold text-emerald-600 mt-1">
                  {diagnostics.newCount || 0}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                  Duplicates Skipped
                </div>
                <div className="text-sm font-bold text-amber-600 mt-1">
                  {diagnostics.duplicates || 0}
                </div>
              </div>
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed italic">
              All financial fields extracted successfully. Ready to import.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {hasErrors && (
        <Card className="border-rose-200 bg-rose-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-900">
              <AlertCircle className="h-5 w-5" />
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-rose-700">
              {diagnostics?.errors?.join(", ") || "Unknown error occurred"}
            </p>
            <Button variant="outline" className="mt-4">
              Download Error Report
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Preview (First 20 Rows)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-700">Date</th>
                  <th className="text-left p-3 font-bold text-slate-700">Description</th>
                  <th className="text-right p-3 font-bold text-slate-700">Amount</th>
                  <th className="text-left p-3 font-bold text-slate-700">Category</th>
                </tr>
              </thead>
              <tbody>
                {batch.items.map((item, index) => {
                  const data = item.parsedPayload as any;
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-slate-600">
                        {new Date(data.paymentDate || data.date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-slate-900 font-medium">
                        {data.descNorm || data.description}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(data.amount)}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs">
                          {data.category1 || "Unclassified"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          ← Back
        </Button>
        {canProceed && (
          <form
            action={async () => {
              "use server";
              await commitBatch(params.batchId);
            }}
          >
            <Button className="bg-slate-900 text-white hover:bg-slate-800">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Import
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
