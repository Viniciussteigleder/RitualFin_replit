import { diagnoseAppCategoryIssues } from "@/lib/actions/diagnose";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DiagnosePage() {
  const diagnosis = await diagnoseAppCategoryIssues();

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">App Category Diagnosis</h1>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Rules</p>
              <p className="text-2xl font-bold">{diagnosis.total}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">With App Category</p>
              <p className="text-2xl font-bold text-green-600">{diagnosis.withAppCategory}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Without App Category</p>
              <p className="text-2xl font-bold text-red-600">{diagnosis.withoutAppCategory}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Has Categories but No App Cat</p>
              <p className="text-2xl font-bold text-orange-600">{diagnosis.withoutAppCatButHasCategories}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specific IDs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">ID: e4c24e3f (without app category)</h3>
            {diagnosis.specificIds.e4c24e3f ? (
              <pre className="bg-secondary p-4 rounded text-xs overflow-auto">
                {JSON.stringify(diagnosis.specificIds.e4c24e3f, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">Not found</p>
            )}
          </div>
          
          <div>
            <h3 className="font-bold mb-2">ID: ba583849 (with app category)</h3>
            {diagnosis.specificIds.ba583849 ? (
              <pre className="bg-secondary p-4 rounded text-xs overflow-auto">
                {JSON.stringify(diagnosis.specificIds.ba583849, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">Not found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Rules Without App Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {diagnosis.sampleWithoutAppCat.map((rule) => (
              <div key={rule.id} className="flex items-center gap-4 p-3 bg-secondary rounded">
                <Badge variant="outline">{rule.id}</Badge>
                <span className="font-mono text-sm">{rule.keyWords}</span>
                <span className="text-sm text-muted-foreground">{rule.category1}</span>
                <span className="text-xs text-muted-foreground">Leaf: {rule.leafId?.slice(0, 8) || "none"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
