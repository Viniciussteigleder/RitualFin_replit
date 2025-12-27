import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Loader2, MoreVertical, Trash2, Filter, Clock } from "lucide-react";
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
          title: "Importacao concluida",
          description: `${result.rowsImported} transacoes importadas${result.duplicates > 0 ? `, ${result.duplicates} duplicatas ignoradas` : ""}`
        });
      } else if (result.duplicates > 0) {
        toast({
          title: "Arquivo ja importado",
          description: `Todas as ${result.duplicates} transacoes ja existem no sistema`,
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na importacao",
        description: error.message || "Falha ao processar o arquivo",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Formato invalido",
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-muted-foreground mb-2">
            Inicio &gt; Uploads &gt; <span className="text-foreground">Miles & More</span>
          </div>
          <h1 className="text-2xl font-bold">Upload de CSV | Miles & More</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus extratos e importe novas transacoes para o sistema de orcamento mensal.
          </p>
        </div>

        <Card 
          className={cn(
            "border-2 border-dashed bg-white shadow-sm transition-colors cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
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
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <h3 className="font-semibold text-lg">Processando...</h3>
                <p className="text-sm text-muted-foreground">Validando e importando transacoes</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Arraste seu arquivo CSV aqui</h3>
                <p className="text-sm text-muted-foreground mb-4">Ou clique para selecionar do seu computador.</p>
                <Button className="bg-primary hover:bg-primary/90" data-testid="btn-select-file">
                  Selecionar Arquivo
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Suporta apenas arquivos CSV do Miles & More. Limite de 10MB.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Historico de Importacoes</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : uploads.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum arquivo importado ainda</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Status</th>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Arquivo</th>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Data do Upload</th>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Mes Ref.</th>
                      <th className="px-5 py-3 text-right font-medium text-xs uppercase tracking-wide">Linhas</th>
                      <th className="px-5 py-3 text-right font-medium text-xs uppercase tracking-wide">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {uploads.map((upload: any) => (
                      <tr key={upload.id} className="hover:bg-muted/20" data-testid={`row-upload-${upload.id}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {upload.status === 'ready' && (
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                Pronto
                              </span>
                            )}
                            {upload.status === 'processing' && (
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Processando
                              </span>
                            )}
                            {upload.status === 'error' && (
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                Erro
                              </span>
                            )}
                            {upload.status === 'duplicate' && (
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Duplicado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{upload.filename}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {format(new Date(upload.createdAt), "dd MMM yyyy, HH:mm")}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {upload.monthAffected || "-"}
                        </td>
                        <td className="px-5 py-4 text-right font-medium">
                          {upload.rowsImported}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
