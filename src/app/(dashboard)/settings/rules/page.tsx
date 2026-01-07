import { getRules } from "@/lib/actions/rules";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function RulesPage() {
  const rules = await getRules();

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-medium">Rules Engine</h3>
                <p className="text-sm text-muted-foreground">Manage automatic categorization rules.</p>
            </div>
            <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Rule
            </Button>
        </div>
      
        <div className="grid gap-4">
            {rules.map(rule => (
                <Card key={rule.id}>
                    <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold">{rule.name || "Untitled Rule"}</CardTitle>
                            <CardDescription className="text-xs">
                                Keywords: {rule.keywords || rule.keyWords}
                            </CardDescription>
                        </div>
                        <Badge variant={rule.active ? "default" : "secondary"}>
                            {rule.active ? "Active" : "Inactive"}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm">
                        <div className="flex gap-4">
                            <div>
                                <span className="text-muted-foreground mr-2">Category:</span>
                                {rule.category1} {rule.category2 ? `> ${rule.category2}` : ""}
                            </div>
                            <div>
                                <span className="text-muted-foreground mr-2">Priority:</span>
                                {rule.priority}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
