import { auth } from "@/auth";
import { diagnoseAppCategoryIssues } from "@/lib/actions/diagnose";
import FixButton from "./fix-button";
import { DebugRuleSection } from "./debug-rule-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, ShieldAlert, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function DiagnosePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para acessar diagnósticos.</p>
      </div>
    );
  }

  const diagnosis = await diagnoseAppCategoryIssues();

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">App Category Diagnosis</h1>
        <div className="flex gap-2">
            <DebugRuleSection />
            <FixButton />
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Diagnosis Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Rules</p>
              <p className="text-2xl font-bold">{diagnosis.total}</p>
            </div>
            <div>
              <p className="text-sm text-green-600">With App Category</p>
              <p className="text-2xl font-bold text-green-600">{diagnosis.withAppCategory}</p>
            </div>
            <div>
              <p className="text-sm text-red-600">Without App Category</p>
              <p className="text-2xl font-bold text-red-600">{diagnosis.withoutAppCategory}</p>
            </div>
            <div>
              <p className="text-sm text-orange-600">Has Categories but No App Cat</p>
              <p className="text-2xl font-bold text-orange-600">{diagnosis.withoutAppCatButHasCategories}</p>
            </div>
        </div>
      </div>

      {/* Integrity Audit Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-amber-200 bg-amber-50/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Integrity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                  <span className="text-sm font-medium">Total Issues</span>
                  <Badge variant={diagnosis.integrity?.summary?.totalIssues > 0 ? "destructive" : "secondary"} className="font-bold">
                    {diagnosis.integrity?.summary?.totalIssues ?? 0}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-red-50 p-2 rounded border border-red-100 text-center">
                    <p className="text-[10px] font-bold text-red-600 uppercase">Critical</p>
                    <p className="text-xl font-bold text-red-700">{diagnosis.integrity?.summary?.critical ?? 0}</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded border border-orange-100 text-center">
                    <p className="text-[10px] font-bold text-orange-600 uppercase">High</p>
                    <p className="text-xl font-bold text-orange-700">{diagnosis.integrity?.summary?.high ?? 0}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic px-1">
                  {diagnosis.integrity?.recommendation ?? "No data available"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Neural Engine Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto divide-y">
                {!diagnosis.integrity?.issues || diagnosis.integrity.issues.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <p className="font-medium">All systems normal. No integrity issues detected.</p>
                  </div>
                ) : (
                  diagnosis.integrity.issues.map((issue: any, idx: number) => (
                    <div key={idx} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] font-bold uppercase border-none text-white",
                              issue.severity === 'critical' ? 'bg-red-600' :
                              issue.severity === 'high' ? 'bg-orange-500' :
                              'bg-blue-500'
                            )}
                          >
                            {issue.severity}
                          </Badge>
                          <span className="text-xs font-mono font-bold text-muted-foreground">[{issue.table}]</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-muted-foreground">{issue.type}</span>
                      </div>
                      <p className="text-sm font-bold text-foreground mb-1">{issue.description}</p>
                      <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                        <Info className="w-3 h-3" />
                        Fix: {issue.suggestedFix}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Specific IDs (dev-only)</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">ID: e4c24e3f (without app category)</h3>
              <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto mt-2">
                {JSON.stringify(diagnosis.specificIds.e4c24e3f, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">ID: ba583849 (with app category)</h3>
              <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto mt-2">
                {JSON.stringify(diagnosis.specificIds.ba583849, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

       {diagnosis.sampleWithoutAppCat.length > 0 && (
        <div className="space-y-4 pt-8">
            <h2 className="text-xl font-semibold">Sample Rules Without App Category</h2>
            <div className="border rounded-lg overflow-hidden">
                {diagnosis.sampleWithoutAppCat.map((rule: any) => (
                    <div key={rule.id} className="p-3 border-b bg-muted/20 flex gap-4 text-sm">
                        <span className="font-mono text-xs bg-white border px-1 rounded">{rule.id}</span>
                        <span>{rule.keyWords}</span>
                        <span className="text-muted-foreground">{rule.category1}</span>
                        <span className="text-muted-foreground text-xs">{rule.leafId ? 'Leaf: ' + rule.leafId : 'No Leaf'}</span>
                    </div>
                ))}
            </div>
        </div>
       )}
    </div>
  );
}

export const revalidate = 3600; // Revalidate every hour
