import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ingestionBatches, ingestionItems } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, AlertCircle, CheckCircle2, ChevronLeft, FileText, Sparkles, Database } from "lucide-react";
import { commitBatch } from "@/lib/actions/ingest";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/auth";
import { PreviewAutoRefresh } from "./preview-auto-refresh";
import { PreviewClient } from "./preview-client";

interface PreviewPageProps {
  params: {
    batchId: string;
  };
}

export default async function ImportPreviewPage(props: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch batch with logic to handle potential consistency lag on Vercel
  let batch = null;
  let retryCount = 0;
  
  while (retryCount < 3) {
    batch = await db.query.ingestionBatches.findFirst({
      where: and(eq(ingestionBatches.id, batchId), eq(ingestionBatches.userId, session.user.id)),
      with: {
        items: {
          limit: 1000, // Increased limit to ensure all items in common bank imports (usually < 1000) are visible
        },
      },
    });
    
    if (batch) break;
    
    // If not found, wait a tiny bit and retry (only in serverless/production to handle replication lag)
    retryCount++;
    await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
  }

  if (!batch) {
    return (
      <div className="flex flex-col gap-8 pb-32 max-w-3xl mx-auto px-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Link
            href="/uploads"
            className="flex items-center gap-2 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar aos Uploads
          </Link>
        </div>

        <Card className="rounded-[2.5rem] border border-border shadow-sm">
          <CardContent className="p-10 space-y-5">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center">
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div className="text-xl font-bold text-foreground font-display">Importação ainda não disponível</div>
                <div className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Este lote pode ainda estar sendo persistido/replicado, ou você pode não ter acesso a ele.
                  Vamos tentar atualizar automaticamente por alguns segundos.
                </div>
                <div className="text-xs text-muted-foreground">
                  Lote: <span className="font-mono">{batchId}</span>
                </div>
              </div>
            </div>
            <PreviewAutoRefresh />
          </CardContent>
        </Card>
      </div>
    );
  }

  const diagnostics = batch.diagnosticsJson as any;
  const hasErrors = batch.status === "error";
  const canProceed = batch.status === "preview";
  const isProcessing = batch.status === "processing";
  const isAllDuplicates = diagnostics?.newCount === 0 && (diagnostics?.duplicates > 0 || batch.items.length > 0);

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-5xl mx-auto px-1">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
           <Link href="/uploads" className="flex items-center gap-2 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
              <ChevronLeft className="h-4 w-4" />
              Voltar aos Uploads
           </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display text-balance">Revisão de Importação</h1>
        <p className="text-muted-foreground font-medium">Verifique os dados extraídos antes de confirmar o lançamento no seu histórico.</p>
      </div>

      {/* Parsing Insights */}
	    {diagnostics && (
	      <Card className={cn(
	        "rounded-[2.5rem] border-primary/20 bg-primary/5 shadow-none overflow-hidden group transition-[border-color,background-color,box-shadow,opacity] duration-200",
	        isAllDuplicates && "bg-orange-500/5 border-orange-200"
	      )}>
          <CardContent className="p-10">
            <div className="flex items-start gap-8">
              <div className={cn(
                "w-16 h-16 rounded-3xl text-white flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform",
                isAllDuplicates ? "bg-orange-500 shadow-orange-500/20" : "bg-primary shadow-primary/20"
              )}>
                {isAllDuplicates ? <AlertCircle className="h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className={cn(
                    "text-2xl font-bold font-display mb-2",
                    isAllDuplicates ? "text-orange-600" : "text-primary"
                  )}>
                    Insights do Analista
                  </h3>
                  <p className={cn(
                    "text-sm font-medium leading-relaxed",
                    isAllDuplicates ? "text-orange-700/70" : "text-primary/70"
                  )}>
                    {isAllDuplicates 
                      ? "Atenção: Todos os registros detectados neste arquivo já foram importados anteriormente." 
                      : "Nossa IA processou o arquivo e identificou os seguintes metadados para garantir a integridade dos seus dados."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Formato</span>
                    <p className="text-base font-bold">{diagnostics.format || "CSV Padrão"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Total de Linhas</span>
                    <p className="text-base font-bold">{diagnostics.rowsTotal || batch.items.length}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Novas Transações</span>
                    <p className="text-base font-bold text-emerald-600">{diagnostics.newCount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Duplicados</span>
                    <p className="text-base font-bold text-orange-600">{diagnostics.duplicates || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card className="rounded-[2.5rem] border-amber-200 bg-amber-50/60 shadow-none">
          <CardContent className="p-8 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-3 w-3 rounded-full bg-amber-500 mt-1.5" />
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-amber-900">Processando o arquivo…</div>
                <div className="text-xs font-semibold text-amber-900/70">
                  Se você estiver em Vercel, arquivos grandes podem levar alguns segundos. Esta página atualizará automaticamente.
                </div>
              </div>
            </div>
            <PreviewAutoRefresh />
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {hasErrors && (
        <Card className="rounded-[2.5rem] border-destructive/20 bg-destructive/5 shadow-none">
          <CardContent className="p-10 flex items-start gap-8">
            <div className="w-16 h-16 rounded-3xl bg-destructive text-white flex items-center justify-center shadow-xl shadow-destructive/20">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-destructive font-display">Erros na Validação</h3>
              <p className="text-sm font-medium text-destructive/70">
                {diagnostics?.errors?.join(", ") || "Ocorreu um erro desconhecido no processamento."}
              </p>
              <Button variant="outline" className="h-12 border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl font-bold">
                Ver Relatório Técnico
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Client Component (Includes Sorting & Filtering) */}
      <PreviewClient 
        batchId={batchId} 
        initialItems={batch.items} 
        diagnostics={diagnostics} 
        canProceed={canProceed} 
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
