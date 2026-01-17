import { auth } from "@/auth";
import { diagnoseAppCategoryIssues } from "@/lib/actions/diagnose";
import FixButton from "./fix-button";
import { DebugRuleSection } from "./debug-rule-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export const dynamic = 'force-dynamic';
