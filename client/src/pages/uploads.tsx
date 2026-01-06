import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Loader2, MoreVertical, Trash2, Filter, Clock, FileUp, Sparkles, RefreshCw, ChevronRight, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { importConflictsApi, uploadsApi } from "@/lib/api";
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
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPanel } from "@/components/status-panel";
import { Locale, t, uploadsCopy } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isPreviewConfirmed, setIsPreviewConfirmed] = useState(false);
  const [lastUploadId, setLastUploadId] = useState<string | null>(null);
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [errorsDialogOpen, setErrorsDialogOpen] = useState(false);
  const [errorsLoading, setErrorsLoading] = useState(false);
  const [errorsPayload, setErrorsPayload] = useState<{ uploadId: string; count: number; errors: Array<{ rowNumber: number; errorMessage: string }> } | null>(null);
  const [errorsFilename, setErrorsFilename] = useState<string | null>(null);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictAction, setConflictAction] = useState<"keep" | "replace">("keep");
  const [conflictStatus, setConflictStatus] = useState<{ variant: "success" | "error"; message: string } | null>(null);
  const [diagnosticsDialogOpen, setDiagnosticsDialogOpen] = useState(false);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagnosticsPayload, setDiagnosticsPayload] = useState<any | null>(null);
  const [diagnosticsFilename, setDiagnosticsFilename] = useState<string | null>(null);
  const [previewRowLimit, setPreviewRowLimit] = useState(10); // NEW: Default 10 rows (was 20)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([ // NEW: Column selection
    'source', 'bookingDate', 'amount', 'currency', 'simpleDesc', 'keyDesc'
  ]); // Default columns pre-selected
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["uploads"],
    queryFn: uploadsApi.list,
  });
  const locale = useLocale() as Locale;

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
      setLastUploadId(result.uploadId || null);
      setIsPreviewConfirmed(false);
      
      if (result.rowsImported > 0) {
        const duplicatesSuffix = result.duplicates > 0
          ? `, ${formatMessage(t(locale, uploadsCopy.importDuplicatesSuffix), { count: result.duplicates })}`
          : "";
        toast({
          title: t(locale, uploadsCopy.importDoneTitle),
          description: `${result.rowsImported} ${t(locale, uploadsCopy.statsTransactions)}${duplicatesSuffix}`
        });
      } else if (result.duplicates > 0) {
        toast({
          title: t(locale, uploadsCopy.importDuplicateTitle),
          description: formatMessage(t(locale, uploadsCopy.importDuplicatesExisting), {
            count: result.duplicates,
            label: t(locale, uploadsCopy.statsTransactions)
          }),
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      setUploadProgress(0);
      setLastDiagnostics(error?.details?.diagnostics || null);
      setLastError(error?.details?.error || { message: error.message, code: "UNKNOWN" });
      setLastSummary(null);
      setLastUploadId(error?.details?.uploadId || null);

      // Construct comprehensive error message
      let errorDescription = error.message || t(locale, uploadsCopy.importErrorDesc);
      if (error.details) {
        errorDescription += `\n\nDetalhes: ${JSON.stringify(error.details, null, 2)}`;
      }

      toast({
        title: t(locale, uploadsCopy.importErrorTitle),
        description: errorDescription,
        variant: "destructive",
        duration: 8000 // 8 seconds as requested
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
      setIsPreviewConfirmed(false);
      const { content, encoding, buffer } = await readCsvWithEncoding(file);
      setPreviewEncoding(encoding);
      const fileBase64 = readFileBase64(buffer);
      const preview = await uploadsApi.preview(file.name, content, encoding, fileBase64, file.type, importDate);
      setPreviewData(preview);
      if (!preview?.success) {
        setPreviewError(t(locale, uploadsCopy.previewFailed));
      }
    } catch (error: any) {
      setPreviewError(t(locale, uploadsCopy.previewTryAgain));
      toast({
        title: t(locale, uploadsCopy.previewErrorTitle),
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
        title: t(locale, uploadsCopy.invalidFormatTitle),
        description: t(locale, uploadsCopy.invalidFormatDesc),
        variant: "destructive"
      });
      return;
    }
    setSelectedFile(file);
    setPreviewData(null);
    setPreviewError(null);
    setIsPreviewConfirmed(false);
    setLastDiagnostics(null);
    setLastError(null);
    setLastSummary(null);
    setLastUploadId(null);
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
      toast({ title: t(locale, uploadsCopy.needFileTitle), variant: "destructive" });
      return;
    }
    if (!previewData?.success) {
      toast({ title: t(locale, uploadsCopy.needPreviewTitle), variant: "destructive" });
      return;
    }
    if (!isPreviewConfirmed) {
      toast({ title: t(locale, uploadsCopy.needConfirmTitle), variant: "destructive" });
      return;
    }
    uploadMutation.mutate({ file: selectedFile, importDate });
  };

  const totalImported = uploads.reduce((sum: number, u: any) => sum + (u.rowsImported || 0), 0);
  const successfulUploads = uploads.filter((u: any) => u.status === 'ready').length;
  const filteredUploads = uploads.filter((upload: any) => {
    if (historyStatusFilter === "all") return true;
    return upload.status === historyStatusFilter;
  });

  const handleViewErrors = async (upload: any) => {
    setErrorsDialogOpen(true);
    setErrorsLoading(true);
    setErrorsFilename(upload.filename || "upload.csv");
    setErrorsPayload(null);
    try {
      const payload = await uploadsApi.errors(upload.id);
      setErrorsPayload(payload);
    } catch (error: any) {
      toast({
        title: t(locale, uploadsCopy.importErrorTitle),
        description: error.message || t(locale, uploadsCopy.importErrorDesc),
        variant: "destructive"
      });
    } finally {
      setErrorsLoading(false);
    }
  };

  const handleViewDiagnostics = async (upload: any) => {
    setDiagnosticsDialogOpen(true);
    setDiagnosticsLoading(true);
    setDiagnosticsFilename(upload.filename || "upload.csv");
    setDiagnosticsPayload(null);
    try {
      const payload = await uploadsApi.diagnostics(upload.id);
      setDiagnosticsPayload(payload);
    } catch (error: any) {
      toast({
        title: t(locale, uploadsCopy.importErrorTitle),
        description: error.message || t(locale, uploadsCopy.importErrorDesc),
        variant: "destructive"
      });
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const handleResolveConflicts = async () => {
    if (!lastUploadId || !lastSummary?.duplicates) {
      setConflictDialogOpen(false);
      return;
    }
    try {
      const result = await importConflictsApi.resolve({
        uploadId: lastUploadId,
        action: conflictAction,
        duplicateCount: lastSummary.duplicates
      });
      const conflictActionLabel = conflictAction === "keep"
        ? t(locale, uploadsCopy.conflictKeep)
        : t(locale, uploadsCopy.conflictReplace);
      setConflictStatus({
        variant: "success",
        message: formatMessage(t(locale, uploadsCopy.conflictResolved), {
          action: conflictActionLabel,
          count: result.duplicateCount
        })
      });
      setConflictDialogOpen(false);
    } catch (error: any) {
      setConflictStatus({
        variant: "error",
        message: error.message || t(locale, uploadsCopy.importErrorDesc)
      });
    }
  };

  // Helper function to extract last transaction date from preview data
  const getLastTransactionDate = (rows: any[]) => {
    if (!rows || rows.length === 0) return null;
    const dates = rows
      .map(r => r.bookingDate)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return dates[0];
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t(locale, uploadsCopy.title)}</h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">{t(locale, uploadsCopy.subtitle)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">
              Formatos suportados:
            </span>
            <BankBadge provider="miles_and_more" size="sm" variant="compact" />
            <BankBadge provider="amex" size="sm" variant="compact" />
            <BankBadge provider="sparkasse" size="sm" variant="compact" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(locale, uploadsCopy.statsTotalImported)}</p>
                  <p className="text-3xl font-bold mt-1">{totalImported}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t(locale, uploadsCopy.statsTransactions)}</p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(locale, uploadsCopy.statsFilesLabel)}</p>
                  <p className="text-3xl font-bold mt-1">{uploads.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {successfulUploads} {t(locale, uploadsCopy.statsProcessed)}
                  </p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(locale, uploadsCopy.nextStep)}</p>
                  <p className="text-lg font-semibold mt-1">{t(locale, uploadsCopy.nextStepReview)}</p>
                  <Link href="/confirm" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                    {t(locale, uploadsCopy.viewQueue)} <ChevronRight className="h-3 w-3" />
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
                <h3 className="font-semibold text-lg mb-2">{t(locale, uploadsCopy.processingFile)}</h3>
                <Progress value={uploadProgress} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t(locale, uploadsCopy.validatingTransactions)}
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
                  {isDragging ? t(locale, uploadsCopy.dropActive) : t(locale, uploadsCopy.dropTitle)}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(locale, uploadsCopy.dropHint)}
                </p>
                <Button className="bg-primary hover:bg-primary/90 gap-2" data-testid="btn-select-file">
                  <FileUp className="h-4 w-4" />
                  {t(locale, uploadsCopy.selectFile)}
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  {t(locale, uploadsCopy.formatsHint)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {selectedFile && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t(locale, uploadsCopy.previewTitle)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Info & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {previewEncoding ? `${t(locale, uploadsCopy.encodingDetected)}: ${previewEncoding}` : t(locale, uploadsCopy.encodingAuto)}
                  </p>
                  {previewData?.rows && (
                    <p className="text-xs text-muted-foreground">
                      Última transação: {getLastTransactionDate(previewData.rows) || "N/A"}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void handlePreview(selectedFile)}
                      disabled={isPreviewing}
                      className="gap-2"
                    >
                      {isPreviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                      {t(locale, uploadsCopy.previewButton)}
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={uploadMutation.isPending || !previewData?.success || !isPreviewConfirmed}
                      className="gap-2"
                    >
                      {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {t(locale, uploadsCopy.importButton)}
                    </Button>
                  </div>
                </div>

              {previewError && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 whitespace-pre-wrap">
                  {previewError}
                </div>
              )}

              {previewData?.success && (
                <div className="space-y-3">
                  {/* MOVED TO TOP: Confirmation Checkbox */}
                  <label className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md cursor-pointer hover:bg-blue-100 transition-colors">
                    <Checkbox
                      checked={isPreviewConfirmed}
                      onCheckedChange={(checked) => setIsPreviewConfirmed(Boolean(checked))}
                      className="shrink-0"
                    />
                    <span className="text-sm font-medium text-blue-900">
                      {t(locale, uploadsCopy.previewConfirm)}
                    </span>
                  </label>

                  {/* Format Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                      <p className="text-muted-foreground">{t(locale, uploadsCopy.previewFormat)}</p>
                      <p className="font-medium">{previewData.format || "-"}</p>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                      <p className="text-muted-foreground">{t(locale, uploadsCopy.previewDelimiter)}</p>
                      <p className="font-medium">{previewData.meta?.delimiter || ";"}</p>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                      <p className="text-muted-foreground">{t(locale, uploadsCopy.previewDate)}</p>
                      <p className="font-medium">{previewData.meta?.dateFormat || "-"}</p>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                      <p className="text-muted-foreground">Linhas</p>
                      <Select value={String(previewRowLimit)} onValueChange={(v) => setPreviewRowLimit(v === "all" ? previewData.rows?.length || 999 : Number(v))}>
                        <SelectTrigger className="h-6 w-full text-xs font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="all">Todas ({previewData.rows?.length || 0})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Column Selection */}
                  {previewData.meta?.headersFound?.length ? (
                    <Accordion type="single" collapsible className="border rounded-md">
                      <AccordionItem value="columns" className="border-none">
                        <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline">
                          <span className="font-semibold">{t(locale, uploadsCopy.columnsDetected)}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {[
                              { key: 'source', label: 'Fonte', isDefault: true },
                              { key: 'bookingDate', label: 'Data', isDefault: true },
                              { key: 'amount', label: 'Valor', isDefault: true },
                              { key: 'currency', label: 'Moeda', isDefault: true },
                              { key: 'simpleDesc', label: 'Descrição', isDefault: true },
                              { key: 'keyDesc', label: 'Key_desc', isDefault: true },
                              { key: 'accountSource', label: 'Conta', isDefault: false },
                              { key: 'key', label: 'Key', isDefault: false },
                            ].map((col) => (
                              <label key={col.key} className="flex items-center gap-2 text-xs cursor-pointer">
                                <Checkbox
                                  checked={visibleColumns.includes(col.key)}
                                  onCheckedChange={(checked) => {
                                    setVisibleColumns(prev =>
                                      checked
                                        ? [...prev, col.key]
                                        : prev.filter(c => c !== col.key)
                                    );
                                  }}
                                />
                                <span className={cn(col.isDefault && "font-medium")}>{col.label}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVisibleColumns(['source', 'bookingDate', 'amount', 'currency', 'simpleDesc', 'keyDesc', 'accountSource', 'key'])}
                              className="text-xs h-7"
                            >
                              Mostrar todas
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVisibleColumns(['source', 'bookingDate', 'amount', 'currency', 'simpleDesc', 'keyDesc'])}
                              className="text-xs h-7"
                            >
                              Restaurar padrão
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : null}
                  {previewData.meta?.warnings?.length ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                      <p className="font-semibold">{t(locale, uploadsCopy.labelWarnings)}</p>
                      <ul className="mt-1 space-y-1">
                        {previewData.meta.warnings.map((warning: string, index: number) => (
                          <li key={`${warning}-${index}`}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Preview Table with Color-Coded Amounts */}
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full text-xs">
                      <thead className="bg-muted/30 text-muted-foreground">
                        <tr>
                          {visibleColumns.includes('source') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableSource)}</th>}
                          {visibleColumns.includes('bookingDate') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableDate)}</th>}
                          {visibleColumns.includes('amount') && <th className="px-3 py-2 text-right">{t(locale, uploadsCopy.tableAmount)}</th>}
                          {visibleColumns.includes('currency') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableCurrency)}</th>}
                          {visibleColumns.includes('simpleDesc') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableDescription)}</th>}
                          {visibleColumns.includes('keyDesc') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableKeyDesc)}</th>}
                          {visibleColumns.includes('accountSource') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableAccount)}</th>}
                          {visibleColumns.includes('key') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableKey)}</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.rows?.slice(0, previewRowLimit).map((row: any, idx: number) => (
                          <tr key={`${row.key}-${idx}`} className="border-t hover:bg-muted/20">
                            {visibleColumns.includes('source') && <td className="px-3 py-2">{row.source}</td>}
                            {visibleColumns.includes('bookingDate') && <td className="px-3 py-2 whitespace-nowrap">{row.bookingDate}</td>}
                            {visibleColumns.includes('amount') && (
                              <td className="px-3 py-2 text-right">
                                <span className={cn(
                                  "font-mono font-semibold",
                                  row.amount < 0 ? "text-red-600" : "text-green-600"
                                )}>
                                  {row.amount >= 0 ? '+' : ''}{Number(row.amount).toFixed(2)}
                                </span>
                              </td>
                            )}
                            {visibleColumns.includes('currency') && <td className="px-3 py-2">{row.currency}</td>}
                            {visibleColumns.includes('simpleDesc') && <td className="px-3 py-2 max-w-xs truncate" title={row.simpleDesc}>{row.simpleDesc}</td>}
                            {visibleColumns.includes('keyDesc') && <td className="px-3 py-2 max-w-xs truncate text-muted-foreground" title={row.keyDesc}>{row.keyDesc}</td>}
                            {visibleColumns.includes('accountSource') && <td className="px-3 py-2">{row.accountSource}</td>}
                            {visibleColumns.includes('key') && <td className="px-3 py-2 text-muted-foreground font-mono text-[10px]">{row.key}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Row Count Info */}
                  <p className="text-xs text-muted-foreground text-center">
                    Mostrando {Math.min(previewRowLimit, previewData.rows?.length || 0)} de {previewData.rows?.length || 0} linhas
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {t(locale, uploadsCopy.previewNote)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(previewError || lastError || lastSummary || lastDiagnostics) && (
          <StatusPanel
            title={t(locale, uploadsCopy.statusTitle)}
            description={lastUploadId ? `Upload ID: ${lastUploadId}` : t(locale, uploadsCopy.statusNoUpload)}
            variant={previewError || lastError ? "error" : lastSummary ? "success" : "warning"}
          >
            {previewError && (
              <div className="rounded-md border border-white/60 bg-white/70 p-2 text-xs text-rose-700">
                <p className="font-semibold">{t(locale, uploadsCopy.previewFailedTitle)}</p>
                <p>{previewError}</p>
              </div>
            )}

            {lastSummary && !lastError && (
              <div className="rounded-md border border-white/60 bg-white/70 p-2 text-xs text-emerald-700">
                <p className="font-semibold">{t(locale, uploadsCopy.importSummaryTitle)}</p>
                <p>{t(locale, uploadsCopy.summaryInserted)}: {lastSummary.rowsImported}</p>
                <p>{t(locale, uploadsCopy.summaryDuplicates)}: {lastSummary.duplicates}</p>
              </div>
            )}

            {lastError && (
              <div className="rounded-md border border-white/60 bg-white/70 p-2 text-xs text-rose-700">
                <p className="font-semibold">{lastError.message || t(locale, uploadsCopy.importErrorTitle)}</p>
                {lastError.hint && <p>{lastError.hint}</p>}
              </div>
            )}
          </StatusPanel>
        )}

        {lastSummary?.duplicates ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold">{t(locale, uploadsCopy.conflictTitle)}</p>
                <p className="text-xs text-muted-foreground">{t(locale, uploadsCopy.conflictDescription)}</p>
              </div>
              <Button variant="outline" className="gap-2" onClick={() => setConflictDialogOpen(true)}>
                <Filter className="h-4 w-4" />
                {t(locale, uploadsCopy.conflictAction)}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {conflictStatus && (
          <StatusPanel
            title={t(locale, uploadsCopy.conflictTitle)}
            description={conflictStatus.message}
            variant={conflictStatus.variant}
          />
        )}

        {lastDiagnostics && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{t(locale, uploadsCopy.diagnosticsTitle)}</p>
                  <p className="text-xs text-muted-foreground">
                    {lastError
                      ? `${t(locale, uploadsCopy.labelFailure)}: ${lastError.code || "UNKNOWN"}`
                      : `${t(locale, uploadsCopy.labelSuccess)}: ${lastDiagnostics.rowsTotal} ${t(locale, uploadsCopy.labelLines)}`}
                  </p>
                </div>
                {lastError ? (
                  <Badge variant="destructive">{t(locale, uploadsCopy.diagnosticsFailed)}</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700">{t(locale, uploadsCopy.diagnosticsOk)}</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="text-muted-foreground">{t(locale, uploadsCopy.labelEncoding)}</p>
                  <p className="font-medium">{lastDiagnostics.encodingUsed || "n/a"}</p>
                </div>
                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="text-muted-foreground">{t(locale, uploadsCopy.previewDelimiter)}</p>
                  <p className="font-medium">{lastDiagnostics.delimiterUsed || ";"}</p>
                </div>
                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="text-muted-foreground">{t(locale, uploadsCopy.labelLines)}</p>
                  <p className="font-medium">{lastDiagnostics.rowsTotal}</p>
                </div>
              </div>

              {lastSummary && !lastError && (
                <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">
                  <p className="font-semibold">{t(locale, uploadsCopy.summaryTitle)}</p>
                  <p>{t(locale, uploadsCopy.summaryInserted)}: {lastSummary.rowsImported}</p>
                  <p>{t(locale, uploadsCopy.summaryDuplicates)}: {lastSummary.duplicates}</p>
                </div>
              )}

              {lastError && (
                <div className="rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                  <p className="font-semibold">{lastError.message || t(locale, uploadsCopy.importErrorDesc)}</p>
                  {lastError.hint && <p>{lastError.hint}</p>}
                </div>
              )}

              <Accordion type="single" collapsible>
                <AccordionItem value="details">
                  <AccordionTrigger className="text-xs">{t(locale, uploadsCopy.detailsTitle)}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-xs">
                      {lastDiagnostics.requiredMissing?.length > 0 && (
                        <div>
                          <p className="font-semibold">{t(locale, uploadsCopy.detailsMissingColumns)}</p>
                          <p className="text-muted-foreground">{lastDiagnostics.requiredMissing.join(", ")}</p>
                        </div>
                      )}
                      {lastDiagnostics.rowErrors?.length > 0 && (
                        <div>
                          <p className="font-semibold">{t(locale, uploadsCopy.detailsRowErrors)}</p>
                          <div className="space-y-1 text-muted-foreground">
                            {lastDiagnostics.rowErrors.slice(0, 3).map((row: any) => (
                              <p key={`${row.rowNumber}-${row.field}`}>
                                {t(locale, uploadsCopy.rowLabel)} {row.rowNumber}: {row.field} = {row.value}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {lastDiagnostics.rowsPreview?.length > 0 && (
                        <div>
                          <p className="font-semibold">{t(locale, uploadsCopy.detailsPreview)}</p>
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

        {(previewData || lastDiagnostics) && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
            <CardTitle className="text-base">{t(locale, uploadsCopy.parsingReport)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="text-muted-foreground">{t(locale, uploadsCopy.previewFormat)}</p>
                  <p className="font-medium">{previewData?.format || lastDiagnostics?.source || "-"}</p>
                </div>
                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="text-muted-foreground">{t(locale, uploadsCopy.previewDelimiter)}</p>
                  <p className="font-medium">{previewData?.meta?.delimiter || lastDiagnostics?.delimiterUsed || "-"}</p>
                </div>
                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="text-muted-foreground">{t(locale, uploadsCopy.labelEncoding)}</p>
                  <p className="font-medium">{previewData?.meta?.encoding || lastDiagnostics?.encodingUsed || previewEncoding || "-"}</p>
                </div>
              </div>

              {previewData?.meta?.warnings?.length ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-700">
                  <p className="font-semibold">{t(locale, uploadsCopy.labelWarnings)}</p>
                  <ul className="mt-1 space-y-1">
                    {previewData.meta.warnings.map((warning: string, index: number) => (
                      <li key={`${warning}-${index}`}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {previewData?.errors?.length ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700">
                  <p className="font-semibold">{t(locale, uploadsCopy.labelErrors)}</p>
                  <ul className="mt-1 space-y-1">
                    {previewData.errors.slice(0, 5).map((error: string, index: number) => (
                      <li key={`${error}-${index}`}>• {error}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {lastDiagnostics?.requiredMissing?.length > 0 && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700">
                  <p className="font-semibold">{t(locale, uploadsCopy.labelMissingColumns)}</p>
                  <p className="text-muted-foreground">{lastDiagnostics.requiredMissing.join(", ")}</p>
                </div>
              )}

              {lastDiagnostics?.rowErrors?.length > 0 && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700">
                  <p className="font-semibold">{t(locale, uploadsCopy.labelRowErrors)}</p>
                  <div className="space-y-1">
                    {lastDiagnostics.rowErrors.slice(0, 5).map((row: any) => (
                      <p key={`${row.rowNumber}-${row.field}`}>
                        {t(locale, uploadsCopy.rowLabel)} {row.rowNumber}: {row.field} = {row.value}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{t(locale, uploadsCopy.importHistory)}</h2>
            </div>
            <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
              <SelectTrigger className="w-[180px] text-xs">
                <SelectValue placeholder={t(locale, uploadsCopy.filterStatus)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t(locale, uploadsCopy.filterAll)}</SelectItem>
                <SelectItem value="ready">{t(locale, uploadsCopy.filterSuccess)}</SelectItem>
                <SelectItem value="processing">{t(locale, uploadsCopy.filterProcessing)}</SelectItem>
                <SelectItem value="duplicate">{t(locale, uploadsCopy.filterDuplicate)}</SelectItem>
                <SelectItem value="error">{t(locale, uploadsCopy.filterError)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <UploadHistorySkeleton count={4} />
          ) : filteredUploads.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(locale, uploadsCopy.emptyHistoryTitle)}</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  {t(locale, uploadsCopy.emptyHistoryDescription)}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredUploads.map((upload: any) => (
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
                              {t(locale, uploadsCopy.statusProcessed)}
                            </Badge>
                          )}
                          {upload.status === 'error' && (
                            <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-xs">
                              {t(locale, uploadsCopy.statusError)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(upload.createdAt), "dd MMM yyyy, HH:mm")}
                          </span>
                          {upload.monthAffected && (
                            <span>{t(locale, uploadsCopy.labelRef)}: {upload.monthAffected}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold">{upload.rowsImported}</p>
                        <p className="text-xs text-muted-foreground">{t(locale, uploadsCopy.statsTransactions)}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => void handleViewDiagnostics(upload)}
                        >
                          {t(locale, uploadsCopy.parsingReport)}
                        </Button>
                        {upload.status === "error" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => void handleViewErrors(upload)}
                          >
                            {t(locale, uploadsCopy.viewErrors)}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Dialog open={errorsDialogOpen} onOpenChange={setErrorsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t(locale, uploadsCopy.viewErrors)} {errorsFilename ? `• ${errorsFilename}` : ""}</DialogTitle>
          </DialogHeader>
          {errorsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t(locale, uploadsCopy.errorsLoading)}
            </div>
          ) : errorsPayload?.errors?.length ? (
            <div className="space-y-2 text-sm">
              <p className="text-xs text-muted-foreground">
                {errorsPayload.count} {t(locale, uploadsCopy.errorsFound)}
              </p>
              <div className="max-h-[320px] overflow-auto rounded-md border border-muted bg-muted/20 p-3">
                <ul className="space-y-1 text-xs">
                  {errorsPayload.errors.map((error) => (
                    <li key={`${error.rowNumber}-${error.errorMessage}`}>
                      {t(locale, uploadsCopy.rowLabel)} {error.rowNumber}: {error.errorMessage}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t(locale, uploadsCopy.errorsNone)}</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t(locale, uploadsCopy.conflictTitle)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">{t(locale, uploadsCopy.conflictDescription)}</p>
            <Select value={conflictAction} onValueChange={(value) => setConflictAction(value as "keep" | "replace")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep">{t(locale, uploadsCopy.conflictKeep)}</SelectItem>
                <SelectItem value="replace">{t(locale, uploadsCopy.conflictReplace)}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConflictDialogOpen(false)}>
                {t(locale, uploadsCopy.conflictCancel)}
              </Button>
              <Button onClick={handleResolveConflicts}>
                {t(locale, uploadsCopy.conflictApply)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={diagnosticsDialogOpen} onOpenChange={setDiagnosticsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t(locale, uploadsCopy.parsingReport)} {diagnosticsFilename ? `• ${diagnosticsFilename}` : ""}</DialogTitle>
          </DialogHeader>
          {diagnosticsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t(locale, uploadsCopy.diagnosticsLoading)}
            </div>
          ) : diagnosticsPayload ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-md border border-muted bg-muted/30 p-2">
                  <p className="text-muted-foreground">{t(locale, uploadsCopy.labelEncoding)}</p>
                  <p className="font-medium">{diagnosticsPayload.encodingUsed || "-"}</p>
                </div>
                <div className="rounded-md border border-muted bg-muted/30 p-2">
                  <p className="text-muted-foreground">{t(locale, uploadsCopy.previewDelimiter)}</p>
                  <p className="font-medium">{diagnosticsPayload.delimiterUsed || "-"}</p>
                </div>
                <div className="rounded-md border border-muted bg-muted/30 p-2">
                  <p className="text-muted-foreground">{t(locale, uploadsCopy.labelLines)}</p>
                  <p className="font-medium">{diagnosticsPayload.rowsTotal || 0}</p>
                </div>
              </div>
              {diagnosticsPayload.requiredMissing?.length ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-2 text-rose-700">
                  <p className="font-semibold">{t(locale, uploadsCopy.labelMissingColumns)}</p>
                  <p>{diagnosticsPayload.requiredMissing.join(", ")}</p>
                </div>
              ) : null}
              {diagnosticsPayload.rowsPreview?.length ? (
                <div className="rounded-md border border-muted bg-muted/20 p-2">
                  <p className="font-semibold">{t(locale, uploadsCopy.detailsPreview)}</p>
                  <pre className="whitespace-pre-wrap text-[11px]">
                    {JSON.stringify(diagnosticsPayload.rowsPreview, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t(locale, uploadsCopy.diagnosticsNone)}</p>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
