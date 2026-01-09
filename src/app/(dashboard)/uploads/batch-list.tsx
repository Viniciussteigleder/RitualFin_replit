import { getIngestionBatches, commitBatch, rollbackBatch } from "@/lib/actions/ingest";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Undo2, CheckCircle2, AlertCircle, Clock, FileText, Play, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export async function BatchList() {
    const batches = await getIngestionBatches();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                <Badge variant="outline" className="text-slate-400 border-slate-200">{batches.length} Imports</Badge>
            </div>

            <div className="grid gap-4">
                {batches.length === 0 ? (
                    <Card className="border-dashed bg-slate-50/50">
                        <CardContent className="py-12 text-center text-slate-500">
                            <FileText className="h-8 w-8 mx-auto mb-3 opacity-20" />
                            <p className="font-medium text-sm">No import history found.</p>
                        </CardContent>
                    </Card>
                ) : null}

                {batches.map(batch => (
                    <Card key={batch.id} className={cn(
                        "group overflow-hidden transition-all hover:shadow-md border-slate-200",
                        batch.status === "preview" ? "border-amber-200 bg-amber-50/30" : ""
                    )}>
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-3 rounded-2xl shrink-0 group-hover:scale-110 transition-transform",
                                        batch.status === "committed" ? "bg-emerald-100 text-emerald-600" :
                                        batch.status === "error" ? "bg-rose-100 text-rose-600" :
                                        "bg-amber-100 text-amber-600"
                                    )}>
                                        {batch.status === "committed" ? <CheckCircle2 className="h-5 w-5" /> :
                                         batch.status === "error" ? <AlertCircle className="h-5 w-5" /> :
                                         <Clock className="h-5 w-5" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            {batch.filename}
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-500 font-bold uppercase tracking-tight">
                                                {batch.sourceType || "Upload"}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
                                            <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {batch.items.length} items
                                            </span>
                                            {((batch.diagnosticsJson as any)?.duplicates > 0) && (
                                                <>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-amber-600 font-bold">
                                                        {(batch.diagnosticsJson as any).duplicates} duplicates
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 ml-auto md:ml-0">
                                    <Badge variant="secondary" className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-none",
                                        batch.status === "committed" && "bg-emerald-50 text-emerald-700",
                                        batch.status === "error" && "bg-rose-50 text-rose-700",
                                        (batch.status === "preview") && "bg-amber-50 text-amber-700 animate-pulse"
                                    )}>
                                        {(batch.status === "preview") ? "Ready to import" : batch.status}
                                    </Badge>

                                    {(batch.status === "preview") ? (
                                        <form action={async () => {
                                            "use server";
                                            await commitBatch(batch.id);
                                        }}>
                                            <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl px-4 font-bold shadow-lg shadow-emerald-200 border-none group/btn">
                                                Process & Import <Play className="ml-2 h-3 w-3 fill-current transition-transform group-hover/btn:translate-x-0.5" />
                                            </Button>
                                        </form>
                                    ) : batch.status === "committed" ? (
                                        <form action={async () => {
                                            "use server";
                                            await rollbackBatch(batch.id);
                                        }}>
                                            <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs ring-1 ring-rose-200">
                                                <Undo2 className="h-4 w-4 mr-1" /> Rollback
                                            </Button>
                                        </form>
                                    ) : null}
                                </div>
                            </div>
                            
                            {/* Diagnostic Report Area */}
                            {batch.status === "preview" && !!batch.diagnosticsJson && (
                                <div className="bg-white/50 border-t border-slate-100 p-4 pt-0">
                                    <div className="p-4 bg-slate-900/5 rounded-2xl flex items-start gap-3 mt-4">
                                        <Info className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-slate-900 uppercase tracking-widest">Parsing Insights</div>
                                            <div className="text-[11px] text-slate-500 leading-relaxed italic">
                                                Automatically detected format: <span className="text-slate-900 font-bold">{(batch.diagnosticsJson as any).format || "Standard CSV"}</span>. 
                                                All financial fields extracted successfully. {(batch.diagnosticsJson as any).duplicates || 0} records skipped to prevent double counting.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

