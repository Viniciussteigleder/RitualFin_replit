
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIKeywordsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights & Keywords</h1>
          <p className="text-muted-foreground">Manage AI-suggested rules and transaction enrichment.</p>
        </div>
        <Button className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none shadow-lg">
          <Sparkles className="mr-2 h-4 w-4" /> Run AI Analysis
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-purple-100 bg-purple-50/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Suggested Rules
            </CardTitle>
            <CardDescription>
              Keywords found in your description that could be turned into automatic rules.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
              <div className="p-4 border bg-white rounded-xl flex items-center justify-between group">
                <div className="space-y-1">
                  <div className="font-semibold">&quot;REWE&quot; → Mercado</div>
                  <div className="text-xs text-muted-foreground">Found in 12 unclassified transactions.</div>
                </div>
                <Button size="sm" variant="outline">Create Rule</Button>
              </div>
              <div className="p-4 border bg-white rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-semibold">&quot;NETFLIX&quot; → Streaming</div>
                  <div className="text-xs text-muted-foreground">Found in 1 recurring transaction.</div>
                </div>
                <Button size="sm" variant="outline">Create Rule</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Enrichment Stats
            </CardTitle>
            <CardDescription>
              How AI is helping categorize your transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-2xl text-center">
                <div className="text-2xl font-bold">85%</div>
                <div className="text-xs text-muted-foreground">Auto-categorized</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-2xl text-center">
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-muted-foreground">New keywords found</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Recently Applied Suggestions</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> Amazon</Badge>
                <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> Uber</Badge>
                <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> Lidl</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
