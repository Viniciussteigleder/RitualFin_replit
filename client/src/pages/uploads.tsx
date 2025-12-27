import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Loader2, MoreVertical, Trash2, Filter, Clock, FileUp, Sparkles, RefreshCw, ChevronRight, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadsApi } from "@/lib/api";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

export default function UploadsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["uploads"],
    queryFn: uploadsApi.list,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      try {
        const content = await file.text();
        const result = await uploadsApi.process(file.name, content);
        clearInterval(interval);
        setUploadProgress(100);
        return result;
      } catch (error) {
        clearInterval(interval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["confirm-queue"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      
      setTimeout(() => setUploadProgress(0), 1000);
      
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
      setUploadProgress(0);
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

  const totalImported = uploads.reduce((sum: number, u: any) => sum + (u.rowsImported || 0), 0);
  const successfulUploads = uploads.filter((u: any) => u.status === 'ready').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Centro de Importacao</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                Miles & More
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Importe seus extratos CSV para categorizar transacoes automaticamente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Importado</p>
                  <p className="text-3xl font-bold mt-1">{totalImported}</p>
                  <p className="text-xs text-muted-foreground mt-1">transacoes</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Arquivos</p>
                  <p className="text-3xl font-bold mt-1">{uploads.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{successfulUploads} processados</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Proximo Passo</p>
                  <p className="text-lg font-semibold mt-1">Revisar</p>
                  <Link href="/confirm" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                    Ver fila <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card 
          className={cn(
            "border-2 border-dashed bg-white shadow-sm transition-all cursor-pointer overflow-hidden",
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.01]" 
              : "border-gray-200 hover:border-primary/50 hover:bg-muted/20"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 text-center relative">
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
              <div className="w-full max-w-xs">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Processando arquivo...</h3>
                <Progress value={uploadProgress} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Validando e categorizando transacoes
                </p>
              </div>
            ) : (
              <>
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all",
                  isDragging ? "bg-primary/20 scale-110" : "bg-primary/10"
                )}>
                  <UploadCloud className={cn(
                    "h-10 w-10 transition-colors",
                    isDragging ? "text-primary" : "text-primary/70"
                  )} />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {isDragging ? "Solte o arquivo aqui" : "Arraste seu arquivo CSV"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ou clique para selecionar do seu computador
                </p>
                <Button className="bg-primary hover:bg-primary/90 gap-2" data-testid="btn-select-file">
                  <FileUp className="h-4 w-4" />
                  Selecionar Arquivo
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Formatos aceitos: CSV do Miles & More. Limite de 10MB.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Historico de Importacoes</h2>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : uploads.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Nenhum arquivo importado</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Arraste um arquivo CSV acima para comecar a organizar suas financas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload: any) => (
                <Card 
                  key={upload.id} 
                  className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`card-upload-${upload.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        upload.status === 'ready' ? "bg-primary/10" :
                        upload.status === 'error' ? "bg-rose-100" :
                        upload.status === 'duplicate' ? "bg-amber-100" : "bg-muted"
                      )}>
                        {upload.status === 'ready' && <CheckCircle2 className="h-6 w-6 text-primary" />}
                        {upload.status === 'processing' && <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />}
                        {upload.status === 'error' && <XCircle className="h-6 w-6 text-rose-500" />}
                        {upload.status === 'duplicate' && <AlertCircle className="h-6 w-6 text-amber-500" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{upload.filename}</p>
                          {upload.status === 'ready' && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                              Processado
                            </Badge>
                          )}
                          {upload.status === 'error' && (
                            <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-xs">
                              Erro
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(upload.createdAt), "dd MMM yyyy, HH:mm")}
                          </span>
                          {upload.monthAffected && (
                            <span>Ref: {upload.monthAffected}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold">{upload.rowsImported}</p>
                        <p className="text-xs text-muted-foreground">transacoes</p>
                      </div>
                      
                      <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
