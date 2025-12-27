import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadsApi } from "@/lib/api";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function UploadsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["uploads"],
    queryFn: uploadsApi.list,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const content = await file.text();
      return uploadsApi.process(file.name, content);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["confirm-queue"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      
      if (result.rowsImported > 0) {
        toast({
          title: "Importação concluída",
          description: `${result.rowsImported} transações importadas${result.duplicates > 0 ? `, ${result.duplicates} duplicatas ignoradas` : ""}`
        });
      } else if (result.duplicates > 0) {
        toast({
          title: "Arquivo já importado",
          description: `Todas as ${result.duplicates} transações já existem no sistema`,
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na importação",
        description: error.message || "Falha ao processar o arquivo",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo CSV",
        variant: "destructive"
      });
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Uploads</h1>
          <p className="text-muted-foreground mt-1">Importe arquivos do Miles & More para atualizar seu ledger.</p>
        </div>

        {/* Upload Area */}
        <Card 
          className={cn(
            "border-dashed border-2 bg-muted/5 shadow-none transition-colors cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:bg-muted/10"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = "";
              }}
              data-testid="input-file"
            />
            
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">Processando...</h3>
                  <p className="text-sm text-muted-foreground">Validando e importando transações</p>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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
