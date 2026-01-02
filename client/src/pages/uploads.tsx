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
import { BankBadge } from "@/components/bank-badge";
import { UploadHistorySkeleton } from "@/components/skeletons/upload-history-skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UploadsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastDiagnostics, setLastDiagnostics] = useState<any | null>(null);
  const [lastError, setLastError] = useState<any | null>(null);
  const [lastSummary, setLastSummary] = useState<{ rowsImported: number; duplicates: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewEncoding, setPreviewEncoding] = useState<string | undefined>();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [importDate, setImportDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["uploads"],
    queryFn: uploadsApi.list,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, importDate }: { file: File; importDate: string }) => {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      try {
        const buffer = await file.arrayBuffer();
        let encoding = "utf-8";
        let content = "";
        try {
          content = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
        } catch {
          encoding = "iso-8859-1";
          content = new TextDecoder("iso-8859-1").decode(buffer);
        }
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i += 1) {
          binary += String.fromCharCode(bytes[i]);
        }
        const fileBase64 = btoa(binary);
        const result = await uploadsApi.process(file.name, content, encoding, fileBase64, file.type, importDate);
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
      setLastDiagnostics(result.diagnostics || null);
      setLastError(result.error || null);
      setLastSummary({ rowsImported: result.rowsImported, duplicates: result.duplicates });
      
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
      setUploadProgress(0);
      setLastDiagnostics(error?.details?.diagnostics || null);
      setLastError(error?.details?.error || { message: error.message, code: "UNKNOWN" });
      setLastSummary(null);
      toast({
        title: "Erro na importação",
        description: error.message || "Falha ao processar o arquivo",
        variant: "destructive"
      });
    }
  });

  const readCsvWithEncoding = async (file: File) => {
    const buffer = await file.arrayBuffer();
    let encoding = "utf-8";
    let content = "";
    try {
      content = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
      encoding = "iso-8859-1";
      content = new TextDecoder("iso-8859-1").decode(buffer);
    }
    return { content, encoding, buffer };
  };

  const readFileBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handlePreview = async (file: File) => {
    try {
      setIsPreviewing(true);
      setPreviewError(null);
      const { content, encoding, buffer } = await readCsvWithEncoding(file);
      setPreviewEncoding(encoding);
      const fileBase64 = readFileBase64(buffer);
      const preview = await uploadsApi.preview(file.name, content, encoding, fileBase64, file.type, importDate);
      setPreviewData(preview);
      if (!preview?.success) {
        setPreviewError("Falha na leitura do arquivo. Verifique delimitador, colunas e codificação.");
      }
    } catch (error: any) {
      setPreviewError("Falha na pré-visualização. Verifique o arquivo e tente novamente.");
      toast({
        title: "Erro na pré-visualização",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo CSV",
        variant: "destructive"
      });
      return;
    }
    setSelectedFile(file);
    setPreviewData(null);
    setPreviewError(null);
    setLastDiagnostics(null);
    setLastError(null);
    setLastSummary(null);
    void handlePreview(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({ title: "Selecione um arquivo primeiro", variant: "destructive" });
      return;
    }
    uploadMutation.mutate({ file: selectedFile, importDate });
  };

  const totalImported = uploads.reduce((sum: number, u: any) => sum + (u.rowsImported || 0), 0);
  const successfulUploads = uploads.filter((u: any) => u.status === 'ready').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Centro de Importação</h1>
            <p className="text-muted-foreground">
              Importe seus extratos CSV para categorizar transações automaticamente.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <BankBadge provider="miles_and_more" size="sm" variant="compact" />
              <BankBadge provider="amex" size="sm" variant="compact" />
              <BankBadge provider="sparkasse" size="sm" variant="compact" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Importado</p>
                  <p className="text-3xl font-bold mt-1">{totalImported}</p>
                  <p className="text-xs text-muted-foreground mt-1">transações</p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Próximo Passo</p>
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
                  Validando e categorizando transações
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
                  Formatos aceitos: Miles & More, American Express, Sparkasse. Limite de 10MB.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {selectedFile && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pré-visualização & Importação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {previewEncoding ? `Codificação detectada: ${previewEncoding}` : "Codificação será detectada automaticamente."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Data de importação</Label>
                    <Input
                      type="date"
                      value={importDate}
                      onChange={(e) => setImportDate(e.target.value)}
                      className="w-[180px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void handlePreview(selectedFile)}
                      disabled={isPreviewing}
                      className="gap-2"
                    >
                      {isPreviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                      Pré-visualizar
                    </Button>
                    <Button onClick={handleImport} disabled={uploadMutation.isPending} className="gap-2">
                      {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Importar
                    </Button>
                  </div>
                </div>
              </div>

              {previewError && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {previewError}
                </div>
              )}

              {previewData?.success && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                      <p className="text-muted-foreground">Formato</p>
                      <p className="font-medium">{previewData.format || "-"}</p>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                      <p className="text-muted-foreground">Delimiter</p>
                      <p className="font-medium">{previewData.meta?.delimiter || ";"}</p>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                      <p className="text-muted-foreground">Data</p>
                      <p className="font-medium">{previewData.meta?.dateFormat || "-"}</p>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                      <p className="text-muted-foreground">Linhas</p>
                      <p className="font-medium">{previewData.rows?.length || 0}</p>
                    </div>
                  </div>

                  {previewData.meta?.headersFound?.length ? (
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-xs">
                      <p className="font-semibold">Colunas detectadas</p>
                      <p className="text-muted-foreground">
                        {previewData.meta.headersFound.join(" · ")}
                      </p>
                    </div>
                  ) : null}

                  <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full text-xs">
                      <thead className="bg-muted/30 text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left">Fonte</th>
                          <th className="px-3 py-2 text-left">Data</th>
                          <th className="px-3 py-2 text-left">Valor</th>
                          <th className="px-3 py-2 text-left">Moeda</th>
                          <th className="px-3 py-2 text-left">Descrição</th>
                          <th className="px-3 py-2 text-left">Key Desc</th>
                          <th className="px-3 py-2 text-left">Conta</th>
                          <th className="px-3 py-2 text-left">Key</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.rows?.map((row: any, idx: number) => (
                          <tr key={`${row.key}-${idx}`} className="border-t">
                            <td className="px-3 py-2">{row.source}</td>
                            <td className="px-3 py-2">{row.bookingDate}</td>
                            <td className="px-3 py-2">{row.amount}</td>
                            <td className="px-3 py-2">{row.currency}</td>
                            <td className="px-3 py-2">{row.simpleDesc}</td>
                            <td className="px-3 py-2">{row.keyDesc}</td>
                            <td className="px-3 py-2">{row.accountSource}</td>
                            <td className="px-3 py-2">{row.key}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A pré-visualização mostra exatamente o que será importado. Ajuste a data de importação se necessário.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {lastDiagnostics && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">Diagnóstico da importação</p>
                  <p className="text-xs text-muted-foreground">
                    {lastError
                      ? `Falha: ${lastError.code || "UNKNOWN"}`
                      : `Sucesso: ${lastDiagnostics.rowsTotal} linhas`}
                  </p>
                </div>
                {lastError ? (
                  <Badge variant="destructive">Falhou</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700">OK</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="text-muted-foreground">Codificação</p>
                  <p className="font-medium">{lastDiagnostics.encodingUsed || "n/a"}</p>
                </div>
                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="text-muted-foreground">Delimiter</p>
                  <p className="font-medium">{lastDiagnostics.delimiterUsed || ";"}</p>
                </div>
                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="text-muted-foreground">Linhas</p>
                  <p className="font-medium">{lastDiagnostics.rowsTotal}</p>
                </div>
              </div>

              {lastSummary && !lastError && (
                <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">
                  <p className="font-semibold">Resumo da importação</p>
                  <p>Inseridas: {lastSummary.rowsImported}</p>
                  <p>Duplicadas: {lastSummary.duplicates}</p>
                </div>
              )}

              {lastError && (
                <div className="rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                  <p className="font-semibold">{lastError.message || "Falha ao importar"}</p>
                  {lastError.hint && <p>{lastError.hint}</p>}
                </div>
              )}

              <Accordion type="single" collapsible>
                <AccordionItem value="details">
                  <AccordionTrigger className="text-xs">Ver detalhes</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-xs">
                      {lastDiagnostics.requiredMissing?.length > 0 && (
                        <div>
                          <p className="font-semibold">Colunas obrigatórias faltando</p>
                          <p className="text-muted-foreground">{lastDiagnostics.requiredMissing.join(", ")}</p>
                        </div>
                      )}
                      {lastDiagnostics.rowErrors?.length > 0 && (
                        <div>
                          <p className="font-semibold">Erros por linha (primeiras 3)</p>
                          <div className="space-y-1 text-muted-foreground">
                            {lastDiagnostics.rowErrors.slice(0, 3).map((row: any) => (
                              <p key={`${row.rowNumber}-${row.field}`}>
                                Linha {row.rowNumber}: {row.field} = {row.value}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {lastDiagnostics.rowsPreview?.length > 0 && (
                        <div>
                          <p className="font-semibold">Prévia (primeiras 20)</p>
                          <pre className="whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-[11px] text-gray-700">
                            {JSON.stringify(lastDiagnostics.rowsPreview, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Histórico de Importações</h2>
            </div>
          </div>

          {isLoading ? (
            <UploadHistorySkeleton count={4} />
          ) : uploads.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Nenhum arquivo importado</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Arraste um arquivo CSV acima para começar a organizar suas finanças.
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
                      <BankBadge provider={upload.filename} size="md" variant="icon" className="flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{upload.filename}</p>
                          <BankBadge provider={upload.filename} size="sm" variant="compact" />
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
                        <p className="text-xs text-muted-foreground">transações</p>
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
