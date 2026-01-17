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

interface PreviewPageProps {
  params: {
    batchId: string;
  };
}

export default async function ImportPreviewPage({ params }: PreviewPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const batch = await db.query.ingestionBatches.findFirst({
    where: and(eq(ingestionBatches.id, params.batchId), eq(ingestionBatches.userId, session.user.id)),
    with: {
      items: {
        limit: 50,
      },
    },
  });

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
                <div className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Dica: volte em <Link href="/uploads" className="text-primary font-bold hover:underline">Uploads</Link> e clique em “Revisar” no cartão em “Atividade Recente”.
                </div>
                <div className="text-xs text-muted-foreground">
                  Lote: <span className="font-mono">{params.batchId}</span>
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

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
        <Card className="rounded-[2.5rem] border-primary/20 bg-primary/5 shadow-none overflow-hidden group">
          <CardContent className="p-10">
            <div className="flex items-start gap-8">
              <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-primary font-display mb-2">Insights do Analista</h3>
                  <p className="text-sm font-medium text-primary/70 leading-relaxed">
                    Nossa IA processou o arquivo e identificou os seguintes metadados para garantir a integridade dos seus dados.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Formato</span>
                    <p className="text-base font-bold text-primary">{diagnostics.format || "CSV Padrão"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Total de Linhas</span>
                    <p className="text-base font-bold text-primary">{diagnostics.rowsTotal || batch.items.length}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Novas Transações</span>
                    <p className="text-base font-bold text-emerald-600">{diagnostics.newCount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Duplicados</span>
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

      {/* Preview Grid */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-10 border-b border-border bg-secondary/20 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Database className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground font-display tracking-tight">Pré-visualização dos Dados</h3>
           </div>
           <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">Top 50 Registros</Badge>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/10">
                <th className="text-left p-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Data</th>
                <th className="text-left p-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Estabelecimento</th>
                <th className="text-right p-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Valor</th>
                <th className="text-left p-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Categoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batch.items.map((item, index) => {
                const data = item.parsedPayload as any;
                const isNegative = Number(data.amount) < 0;
                return (
                  <tr key={item.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="p-6 text-muted-foreground font-medium text-xs">
                      {new Date(data.paymentDate || data.date).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="p-6">
                      <span className="text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {data.descNorm || data.description}
                      </span>
                    </td>
                    <td className={cn(
                      "p-6 text-right font-bold text-lg tracking-tighter",
                      isNegative ? "text-destructive" : "text-emerald-500"
                    )}>
                      {formatCurrency(data.amount)}
                    </td>
                    <td className="p-6">
                      <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-secondary/50 border-none rounded-lg text-muted-foreground/70">
                        {data.category1 || "Não Classificado"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-6 px-2">
        <Button variant="secondary" className="h-16 px-10 rounded-2xl font-bold text-muted-foreground hover:text-foreground transition-all" asChild>
           <Link href="/uploads">
              ← Cancelar
           </Link>
        </Button>
        {canProceed && (
          <form
            className="flex-1 max-w-sm"
            action={async () => {
              "use server";
              await commitBatch(params.batchId);
              redirect("/transactions");
            }}
          >
            <Button className="w-full h-16 bg-primary text-white hover:scale-105 transition-all rounded-2xl font-bold shadow-2xl shadow-primary/20 gap-3 text-lg">
              <CheckCircle2 className="h-6 w-6" />
              Confirmar Importação
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
