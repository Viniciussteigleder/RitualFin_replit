import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { uploadsApi } from "@/lib/api";

export default function UploadsPage() {
  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["uploads"],
    queryFn: uploadsApi.list,
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Uploads</h1>
          <p className="text-muted-foreground mt-1">Importe arquivos do Miles & More para atualizar seu ledger.</p>
        </div>

        {/* Upload Area */}
        <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/5 shadow-none hover:bg-muted/10 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 bg-background rounded-full shadow-sm">
              <UploadCloud className="h-8 w-8 text-primary/80" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Arraste seu CSV aqui</h3>
              <p className="text-sm text-muted-foreground">ou clique para selecionar o arquivo</p>
            </div>
            <Button className="mt-4" data-testid="btn-select-file">Selecionar Arquivo</Button>
            <p className="text-xs text-muted-foreground/60 max-w-xs pt-4">
              Aceita apenas CSV exportado do Miles & More. O sistema detecta duplicatas automaticamente.
            </p>
          </CardContent>
        </Card>

        {/* History */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Histórico de Importação</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-12 bg-muted/5 rounded-lg border border-dashed">
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum arquivo importado ainda</p>
            </div>
          ) : (
            <div className="rounded-lg border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground font-medium">
                    <tr>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Arquivo</th>
                      <th className="px-4 py-3">Mês</th>
                      <th className="px-4 py-3 text-right">Linhas</th>
                      <th className="px-4 py-3 text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {uploads.map((upload: any) => (
                      <tr key={upload.id} className="group hover:bg-muted/30" data-testid={`row-upload-${upload.id}`}>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-2">
                            {upload.status === 'ready' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                            {upload.status === 'error' && <XCircle className="h-4 w-4 text-rose-600" />}
                            {upload.status === 'duplicate' && <AlertCircle className="h-4 w-4 text-amber-600" />}
                            {upload.status === 'processing' && <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
                            
                            <span className={cn(
                              "text-xs font-medium capitalize",
                              upload.status === 'ready' && "text-emerald-700",
                              upload.status === 'error' && "text-rose-700",
                              upload.status === 'duplicate' && "text-amber-700"
                            )}>
                              {upload.status === 'ready' ? 'Sucesso' : 
                               upload.status === 'duplicate' ? 'Duplicado' :
                               upload.status === 'error' ? 'Falha' : upload.status}
                            </span>
                          </div>
                          {upload.errorMessage && (
                            <p className="text-xs text-rose-600 mt-1 pl-6">{upload.errorMessage}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 font-medium">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                            {upload.filename}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground font-mono text-xs">
                          {upload.monthAffected || "—"}
                        </td>
                        <td className="px-4 py-4 text-right text-muted-foreground tabular-nums">
                          {upload.rowsImported} / {upload.rowsTotal}
                        </td>
                        <td className="px-4 py-4 text-right text-muted-foreground text-xs">
                          {format(new Date(upload.createdAt), "dd/MM/yyyy HH:mm")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
