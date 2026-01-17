import { getIngestionBatches, commitBatch, rollbackBatch } from "@/lib/actions/ingest";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Undo2, CheckCircle2, AlertCircle, Clock, FileText, Play, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export async function BatchList() {
    const batches = await getIngestionBatches();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Atividade Recente</h2>
                <Badge variant="outline" className="text-muted-foreground">{batches.length} importações</Badge>
            </div>

            <div className="grid gap-3">
                {batches.length === 0 ? (
                    <div className="border border-dashed border-border rounded-xl bg-secondary/30 py-10 text-center">
                        <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">Nenhuma importação encontrada.</p>
                    </div>
                ) : null}

                {batches.map(batch => (
                    <Card key={batch.id} className={cn(
                        "overflow-hidden transition-colors",
                        batch.status === "preview" && "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20"
                    )}>
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-3">
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "p-2.5 rounded-xl shrink-0",
                                        batch.status === "committed" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
                                        batch.status === "error" && "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
                                        batch.status === "preview" && "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                    )}>
                                        {batch.status === "committed" ? <CheckCircle2 className="h-4 w-4" /> :
                                         batch.status === "error" ? <AlertCircle className="h-4 w-4" /> :
                                         <Clock className="h-4 w-4" />}
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="font-medium text-foreground text-sm flex items-center gap-2 flex-wrap">
                                            <span className="truncate">{batch.filename}</span>
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium uppercase tracking-wide">
                                                {batch.sourceType || "Upload"}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                            <span>{new Date(batch.createdAt).toLocaleDateString("pt-BR")}</span>
                                            <span className="text-border">•</span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {batch.items.length} itens
                                            </span>
                                            {((batch.diagnosticsJson as any)?.duplicates > 0) && (
                                                <>
                                                    <span className="text-border">•</span>
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                        {(batch.diagnosticsJson as any).duplicates} duplicados
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-auto md:ml-0">
                                    <Badge variant="secondary" className={cn(
                                        "px-2.5 py-0.5 rounded-lg text-[10px] font-medium uppercase tracking-wide border-none",
                                        batch.status === "committed" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                        batch.status === "error" && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                                        batch.status === "preview" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                    )}>
                                        {batch.status === "preview" ? "Pronto para importar" :
                                         batch.status === "committed" ? "Importado" :
                                         batch.status === "error" ? "Erro" : batch.status}
                                    </Badge>

                                    {batch.status === "preview" && (
                                        <form action={async () => {
                                            "use server";
                                            await commitBatch(batch.id);
                                        }}>
                                            <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-lg px-3 h-8 text-xs font-medium">
                                                Importar <Play className="ml-1.5 h-3 w-3 fill-current" />
                                            </Button>
                                        </form>
                                    )}
                                    {batch.status === "committed" && (
                                        <form action={async () => {
                                            "use server";
                                            await rollbackBatch(batch.id);
                                        }}>
                                            <Button size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg h-8 text-xs font-medium">
                                                <Undo2 className="h-3 w-3 mr-1" /> Desfazer
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Diagnostic Report Area */}
                            {batch.status === "preview" && !!batch.diagnosticsJson && (
                                <div className="border-t border-border px-4 pb-4">
                                    <div className="p-3 bg-secondary/50 rounded-xl flex items-start gap-2 mt-3">
                                        <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                        <div className="space-y-0.5">
                                            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Detalhes do Arquivo</div>
                                            <div className="text-xs text-muted-foreground leading-relaxed">
                                                Formato detectado: <span className="text-foreground font-medium">{(batch.diagnosticsJson as any).format || "CSV padrão"}</span>.
                                                {(batch.diagnosticsJson as any).duplicates || 0} registros duplicados ignorados.
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

