
import { getRules } from "@/lib/actions/rules";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck, Tag, Zap, MoreVertical, Edit2, Trash2, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default async function RulesPage() {
  const rules = await getRules();

  return (
    <div className="space-y-6">
        <PageHeader 
            title="Classification Rules" 
            description="Automation engine to categorize transactions based on keywords."
            breadcrumbs={[
                { label: "Classification" },
                { label: "Rules" }
            ]}
        >
            <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold transition-all shadow-lg shadow-slate-200">
                <Plus className="mr-2 h-4 w-4" /> Create Rule
            </Button>
        </PageHeader>
      
        <div className="grid gap-4">
            {rules.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                    <Zap className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-900">No automation rules yet</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-[320px] mx-auto">
                        Create rules to automatically categorize transactions from your bank statements.
                    </p>
                </div>
            ) : null}

            {rules.map(rule => (
                <Card key={rule.id} className="group overflow-hidden border-slate-200 hover:shadow-md transition-all rounded-2xl">
                    <CardHeader className="p-6 flex flex-row items-start justify-between space-y-0">
                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                                    {rule.name || "Untitled Rule"}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-500 font-bold uppercase tracking-widest px-2 py-0">
                                        KW: {rule.keywords || rule.keyWords}
                                    </Badge>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs text-slate-500 font-medium">Priority {rule.priority}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Badge className={rule.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-bold" : "bg-slate-100 text-slate-500 border-none font-bold uppercase text-[10px]"}>
                                {rule.active ? "Active" : "Inactive"}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-full">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-0">
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm">
                                <Tag className="h-3 w-3" />
                                {rule.category1}
                            </div>
                            {rule.category2 && (
                                <>
                                    <ChevronRight className="h-3 w-3 text-slate-300" />
                                    <div className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                        {rule.category2}
                                    </div>
                                </>
                            )}
                            <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-bold text-xs">
                                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs">
                                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}

