import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Settings, Bell, Eye, Check, Globe, Palette, Database, Trash2, Download, Key, CreditCard, Mail, Moon, Sun, Sparkles, BookOpen, ArrowRight, Upload, RefreshCw, ChevronsUpDown, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AliasLogo } from "@/components/alias-logo";
import { useQuery, useMutation } from "@tanstack/react-query";
import { settingsApi, uploadsApi, classificationApi, aliasApi, resetApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TABS = [
  { id: "conta", label: "Conta", icon: User, description: "Perfil e informações pessoais" },
  { id: "preferencias", label: "Preferências", icon: Settings, description: "Aparência e comportamento" },
  { id: "classificacao", label: "Classificação & Dados", icon: Database, description: "Importações, categorias, aliases e logos" },
  { id: "dicionarios", label: "Dicionários", icon: Database, description: "Comerciantes e categorias" },
  { id: "integracoes", label: "Integrações", icon: Database, description: "Conexões com outros serviços" },
  { id: "seguranca", label: "Segurança", icon: Shield, description: "Senha e autenticação" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("conta");
  const [showCents, setShowCents] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState(true);
  const [lazyMode, setLazyMode] = useState(true);
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [importEncoding, setImportEncoding] = useState<string | undefined>();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSource, setImportSource] = useState("auto");
  const [importPreviewError, setImportPreviewError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [uploadDialog, setUploadDialog] = useState<{
    open: boolean;
    status: "success" | "error";
    title: string;
    rowsProcessed?: number;
    newRows?: number;
    updatedRows?: number;
    errors?: string[];
  } | null>(null);
  const [classificationPreview, setClassificationPreview] = useState<any | null>(null);
  const [classificationFileBase64, setClassificationFileBase64] = useState<string | null>(null);
  const [confirmRemap, setConfirmRemap] = useState(false);
  const [showClassificationConfirm, setShowClassificationConfirm] = useState(false);
  const [aliasPreview, setAliasPreview] = useState<any | null>(null);
  const [aliasFileBase64, setAliasFileBase64] = useState<string | null>(null);
  const [logosPreview, setLogosPreview] = useState<any[] | null>(null);
  const [logosFileBase64, setLogosFileBase64] = useState<string | null>(null);
  const [ruleTestKeyDesc, setRuleTestKeyDesc] = useState("");
  const [ruleTestResult, setRuleTestResult] = useState<any | null>(null);
  const [aliasTestKeyDesc, setAliasTestKeyDesc] = useState("");
  const [aliasTestResult, setAliasTestResult] = useState<any | null>(null);
  const [reviewSelections, setReviewSelections] = useState<Record<string, string>>({});
  const [reviewExpressions, setReviewExpressions] = useState<Record<string, string>>({});
  const [reviewKeywordDrafts, setReviewKeywordDrafts] = useState<Record<string, string>>({});
  const [reviewCategoryOpen, setReviewCategoryOpen] = useState<string | null>(null);
  const [dangerDialogOpen, setDangerDialogOpen] = useState(false);
  const [dangerStep, setDangerStep] = useState<"select" | "confirm" | "done">("select");
  const [dangerSelections, setDangerSelections] = useState({
    transactions: false,
    categories: false,
    aliases: false,
    all: false
  });
  const [dangerConfirmText, setDangerConfirmText] = useState("");
  const [dangerLastDeletedAt, setDangerLastDeletedAt] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch settings from API
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
  });

  const { data: reviewQueue = [] } = useQuery({
    queryKey: ["classification-review-queue"],
    queryFn: classificationApi.reviewQueue,
  });

  const { data: taxonomyLeaves = [] } = useQuery({
    queryKey: ["classification-leaves"],
    queryFn: classificationApi.listLeaves,
  });

  const { data: classificationRules = [] } = useQuery({
    queryKey: ["classification-rules"],
    queryFn: classificationApi.listRules,
  });


  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Configuracoes salvas",
        description: "Suas preferencias foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Nao foi possivel salvar as configuracoes.",
        variant: "destructive",
      });
    },
  });

  const readCsvWithEncoding = async (file: File) => {
    const buffer = await file.arrayBuffer();
    let encoding = "utf-8";
    let text = "";
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
      encoding = "iso-8859-1";
      text = new TextDecoder("iso-8859-1").decode(buffer);
    }
    return { text, encoding };
  };

  const readFileBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handlePreviewImport = async () => {
    if (!importFile) return;
    try {
      const { text, encoding } = await readCsvWithEncoding(importFile);
      setImportEncoding(encoding);
      const fileBase64 = await readFileBase64(importFile);
      setImportPreviewError(null);
      setImportStatus(null);
      const preview = await uploadsApi.preview(importFile.name, text, encoding, fileBase64, importFile.type);
      setImportPreview(preview);
      if (!preview?.success) {
        setImportPreviewError("Falha na leitura do arquivo (verifique delimitador ou codificação).");
      }
    } catch (err: any) {
      setImportPreviewError("Falha na leitura do arquivo (verifique delimitador ou codificação).");
      toast({ title: "Erro na pré-visualização", description: err.message, variant: "destructive" });
    }
  };

  const handleProcessImport = async () => {
    if (!importFile) return;
    try {
      const { text, encoding } = await readCsvWithEncoding(importFile);
      setImportEncoding(encoding);
      const fileBase64 = await readFileBase64(importFile);
      const result = await uploadsApi.process(importFile.name, text, encoding, fileBase64, importFile.type);
      setImportStatus({
        type: "success",
        message: `Importação concluída: ${result.rowsImported} registros adicionados, ${result.duplicates} ignorados (duplicados).`
      });
      setUploadDialog({
        open: true,
        status: "success",
        title: "Upload concluído com sucesso",
        rowsProcessed: result.rowsTotal,
        newRows: result.rowsImported,
        updatedRows: 0
      });
      toast({
        title: "Importação concluída",
        description: `Inseridas: ${result.rowsImported}, duplicadas: ${result.duplicates}, auto: ${result.autoClassified || 0}, abertas: ${result.openCount || 0}`
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      queryClient.invalidateQueries({ queryKey: ["classification-review-queue"] });
    } catch (err: any) {
      setImportStatus({ type: "error", message: `Falha na importação: ${err.message}` });
      setUploadDialog({
        open: true,
        status: "error",
        title: "Falha no upload",
        errors: [err.message]
      });
      toast({ title: "Erro na importação", description: err.message, variant: "destructive" });
    }
  };

  const handleClassificationPreview = async (file: File) => {
    const base64 = await readFileBase64(file);
    setClassificationFileBase64(base64);
    setConfirmRemap(false);
    try {
      const preview = await classificationApi.previewImport(base64);
      setClassificationPreview(preview);
    } catch (err: any) {
      setClassificationPreview(null);
      setUploadDialog({
        open: true,
        status: "error",
        title: "Falha no upload",
        errors: [err.message]
      });
      toast({ title: "Erro na pré-visualização", description: err.message, variant: "destructive" });
    }
  };

  const handleClassificationApply = async () => {
    if (!classificationFileBase64) return;
    try {
      const result = await classificationApi.applyImport(classificationFileBase64, confirmRemap);
      toast({ title: "Categorias atualizadas", description: `Linhas aplicadas: ${result.rows}` });
      setUploadDialog({
        open: true,
        status: "success",
        title: "Upload concluído com sucesso",
        rowsProcessed: result.rows,
        newRows: result.diff?.newLeavesCount ?? 0,
        updatedRows: result.diff?.updatedRulesCount ?? 0
      });
      queryClient.invalidateQueries({ queryKey: ["classification-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["classification-rules"] });
    } catch (err: any) {
      setUploadDialog({
        open: true,
        status: "error",
        title: "Falha no upload",
        errors: [err.message]
      });
      toast({ title: "Erro ao aplicar categorias", description: err.message, variant: "destructive" });
    }
  };

  const handleAliasPreview = async (file: File) => {
    const base64 = await readFileBase64(file);
    setAliasFileBase64(base64);
    try {
      const preview = await aliasApi.previewImport(base64);
      setAliasPreview(preview);
    } catch (err: any) {
      setAliasPreview(null);
      setUploadDialog({
        open: true,
        status: "error",
        title: "Falha no upload",
        errors: [err.message]
      });
      toast({ title: "Erro na pré-visualização", description: err.message, variant: "destructive" });
    }
  };

  const handleAliasApply = async () => {
    if (!aliasFileBase64) return;
    try {
      const result = await aliasApi.applyImport(aliasFileBase64);
      toast({
        title: "Aliases atualizados",
        description: `Aliases atualizados com sucesso (${result.newAliases || 0} novos, ${result.updatedAliases || 0} atualizados).`
      });
      setUploadDialog({
        open: true,
        status: "success",
        title: "Upload concluído com sucesso",
        rowsProcessed: aliasPreview?.aliasRows || 0,
        newRows: result.newAliases || 0,
        updatedRows: result.updatedAliases || 0
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (err: any) {
      setUploadDialog({
        open: true,
        status: "error",
        title: "Falha no upload",
        errors: [err.message]
      });
      toast({ title: "Erro ao aplicar aliases", description: err.message, variant: "destructive" });
    }
  };

  const handleRuleTest = async () => {
    if (!ruleTestKeyDesc.trim()) return;
    const result = await classificationApi.ruleTest(ruleTestKeyDesc);
    setRuleTestResult(result);
  };

  const handleAliasTest = async () => {
    if (!aliasTestKeyDesc.trim()) return;
    const result = await aliasApi.test(aliasTestKeyDesc);
    setAliasTestResult(result);
  };

  const handleDownloadClassification = async () => {
    const blob = await classificationApi.exportExcel();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ritualfin_categorias.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadClassificationCsv = async () => {
    const blob = await classificationApi.exportCsv();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "categorias.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAliases = async () => {
    const blob = await aliasApi.exportExcel();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ritualfin_aliases.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadLogosTemplate = async () => {
    const blob = await aliasApi.exportLogosTemplate();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ritualfin_logos.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogosImport = async (base64Override?: string) => {
    const payload = base64Override || logosFileBase64;
    if (!payload) return;
    try {
      const result = await aliasApi.importLogos(payload);
      setLogosPreview(result.results || []);
      setUploadDialog({
        open: true,
        status: "success",
        title: "Upload concluído com sucesso",
        rowsProcessed: result.processed || 0,
        newRows: result.processed || 0,
        updatedRows: 0
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (err: any) {
      setUploadDialog({
        open: true,
        status: "error",
        title: "Falha no upload",
        errors: [err.message]
      });
      toast({ title: "Erro ao importar logos", description: err.message, variant: "destructive" });
    }
  };

  const handleRefreshLogos = async () => {
    const result = await aliasApi.refreshLogos();
    toast({ title: "Logos atualizados", description: `Total: ${result.total}` });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const handleResetData = async () => {
    await resetApi.resetData();
    toast({ title: "Dados resetados", description: "Seu ambiente foi reinicializado." });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["classification-review-queue"] });
    queryClient.invalidateQueries({ queryKey: ["classification-leaves"] });
    queryClient.invalidateQueries({ queryKey: ["classification-rules"] });
  };

  const handleReviewAssign = async (transactionId: string) => {
    const leafId = reviewSelections[transactionId];
    if (!leafId) {
      toast({ title: "Selecione uma categoria", variant: "destructive" });
      return;
    }
    const newExpression = reviewExpressions[transactionId]?.trim();
    await classificationApi.assignReview({
      transactionId,
      leafId,
      newExpression: newExpression || undefined,
      createRule: Boolean(newExpression)
    });
    toast({ title: "Classificação atualizada" });
    queryClient.invalidateQueries({ queryKey: ["classification-review-queue"] });
  };

  const handleAppendKeywords = async (transactionId: string) => {
    const leafId = reviewSelections[transactionId];
    if (!leafId) {
      toast({ title: "Selecione uma categoria", variant: "destructive" });
      return;
    }
    const expressions = reviewKeywordDrafts[transactionId]?.trim() || "";
    if (!expressions) {
      toast({ title: "Informe ao menos uma expressão", variant: "destructive" });
      return;
    }
    try {
      await classificationApi.appendRuleKeywords({ leafId, expressions });
      toast({ title: "Palavras-chave atualizadas" });
      setReviewKeywordDrafts((prev) => ({ ...prev, [transactionId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["classification-rules"] });
    } catch (err: any) {
      toast({ title: "Erro ao salvar palavras-chave", description: err.message, variant: "destructive" });
    }
  };

  const resetDangerState = () => {
    setDangerStep("select");
    setDangerSelections({ transactions: false, categories: false, aliases: false, all: false });
    setDangerConfirmText("");
  };

  const handleDangerDialogChange = (open: boolean) => {
    setDangerDialogOpen(open);
    if (!open) {
      resetDangerState();
    }
  };

  const handleDangerDelete = async () => {
    try {
      const result = await resetApi.deleteData({
        deleteTransactions: dangerSelections.transactions,
        deleteCategories: dangerSelections.categories,
        deleteAliases: dangerSelections.aliases,
        deleteAll: dangerSelections.all
      });
      setDangerLastDeletedAt(result.deletedAt);
      setDangerStep("done");
      toast({ title: "Os dados selecionados foram apagados com sucesso." });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["classification-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["classification-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["classification-rules"] });
    } catch (err: any) {
      toast({ title: "Erro ao apagar dados", description: err.message, variant: "destructive" });
    }
  };

  const rulesByLeafId = useMemo(() => {
    const map = new Map<string, { keyWords: string; keyWordsNegative: string }>();
    classificationRules.forEach((rule: any) => {
      if (!rule.leafId || map.has(rule.leafId)) return;
      map.set(rule.leafId, {
        keyWords: rule.keyWords || "",
        keyWordsNegative: rule.keyWordsNegative || ""
      });
    });
    return map;
  }, [classificationRules]);

  const taxonomyOptions = useMemo(() => {
    return taxonomyLeaves.map((leaf: any) => {
      const path = [leaf.nivel1Pt, leaf.nivel2Pt, leaf.nivel3Pt].filter(Boolean).join(" › ");
      const rules = rulesByLeafId.get(leaf.leafId);
      const searchText = [path, rules?.keyWords, rules?.keyWordsNegative].filter(Boolean).join(" ").toLowerCase();
      return {
        leafId: leaf.leafId,
        label: path || leaf.nivel3Pt,
        searchText
      };
    });
  }, [taxonomyLeaves, rulesByLeafId]);

  const taxonomyLabelByLeafId = useMemo(() => {
    return new Map(taxonomyOptions.map((option) => [option.leafId, option.label]));
  }, [taxonomyOptions]);

  const sourceMismatch = importPreview && importSource !== "auto" && (
    (importSource === "sparkasse" && importPreview.format !== "sparkasse") ||
    (importSource === "amex" && importPreview.format !== "amex") ||
    (importSource === "mm" && importPreview.format !== "miles_and_more")
  );

  return (
    <AppLayout>
      <Dialog
        open={Boolean(uploadDialog?.open)}
        onOpenChange={(open) =>
          setUploadDialog((prev) => (prev ? { ...prev, open } : null))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {uploadDialog?.status === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600" />
              )}
              {uploadDialog?.title || ""}
            </DialogTitle>
            <DialogDescription>
              {uploadDialog?.status === "success"
                ? "Resumo do processamento do arquivo."
                : "Revise os erros detectados e tente novamente."}
            </DialogDescription>
          </DialogHeader>

          {uploadDialog?.status === "success" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-md border border-muted bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Linhas processadas</p>
                <p className="text-lg font-semibold">{uploadDialog.rowsProcessed ?? "-"}</p>
              </div>
              <div className="rounded-md border border-muted bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Novas linhas</p>
                <p className="text-lg font-semibold">{uploadDialog.newRows ?? "-"}</p>
              </div>
              <div className="rounded-md border border-muted bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Atualizadas</p>
                <p className="text-lg font-semibold">{uploadDialog.updatedRows ?? "-"}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-rose-700">
              {uploadDialog?.errors?.map((error, idx) => (
                <p key={`${error}-${idx}`}>{error}</p>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setUploadDialog((prev) => (prev ? { ...prev, open: false } : null))}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua conta e personalize o RitualFin.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 shrink-0">
            <Card className="bg-white border-0 shadow-sm sticky top-6">
              <CardContent className="p-3">
                <nav className="space-y-1">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                          isActive 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                        data-testid={`tab-${tab.id}`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            {activeTab === "conta" && (
              <>
                <Card className="bg-white border-0 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-emerald-100/50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                          <User className="h-10 w-10 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl">Usuario RitualFin</h3>
                        <p className="text-sm text-muted-foreground">Membro desde 2024</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-primary text-white">Plano Starter</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Editar Foto</Button>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Nome</Label>
                        <Input defaultValue="Usuario" className="bg-muted/30 border-0" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
                        <Input defaultValue="usuario@exemplo.com" className="bg-muted/30 border-0" disabled />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-primary hover:bg-primary/90">Salvar Alteracoes</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Download className="h-4 w-4 text-primary" />
                      Exportar Dados
                    </CardTitle>
                    <CardDescription>
                      Baixe todas as suas transacoes e configuracoes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar CSV
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "preferencias" && (
              <>
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Regional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Idioma</Label>
                        <Select defaultValue="pt-br">
                          <SelectTrigger className="bg-muted/30 border-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-br">Portugues (Brasil)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Moeda</Label>
                        <Select defaultValue="eur">
                          <SelectTrigger className="bg-muted/30 border-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eur">Euro (EUR)</SelectItem>
                            <SelectItem value="brl">Real (BRL)</SelectItem>
                            <SelectItem value="usd">Dollar (USD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      Aparencia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-amber-500" />}
                        <div>
                          <p className="font-medium">Tema Escuro</p>
                          <p className="text-sm text-muted-foreground">Ativar modo noturno</p>
                        </div>
                      </div>
                      <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="font-medium">Mostrar Centavos</p>
                        <p className="text-sm text-muted-foreground">Exibir valores decimais</p>
                      </div>
                      <Switch checked={showCents} onCheckedChange={setShowCents} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Assistência IA
                    </CardTitle>
                    <CardDescription>
                      Configure como a IA ajuda na categorização.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <div>
                        <p className="font-medium">Categorização Automática</p>
                        <p className="text-sm text-muted-foreground">IA pré-analisa e sugere categorias</p>
                      </div>
                      <Switch checked={lazyMode} onCheckedChange={setLazyMode} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="font-medium">Auto-confirmar Alta Confiança</p>
                        <p className="text-sm text-muted-foreground">
                          Aceitar automaticamente sugestões com {settings?.confidenceThreshold || 80}%+ de confiança
                        </p>
                      </div>
                      <Switch
                        checked={settings?.autoConfirmHighConfidence || false}
                        onCheckedChange={(checked) => {
                          updateSettingsMutation.mutate({ autoConfirmHighConfidence: checked });
                        }}
                        disabled={isLoading || updateSettingsMutation.isPending}
                      />
                    </div>
                    {settings?.autoConfirmHighConfidence && (
                      <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Limite de Confianca</Label>
                          <span className="text-sm font-bold text-primary">{settings?.confidenceThreshold || 80}%</span>
                        </div>
                        <Slider
                          value={[settings?.confidenceThreshold || 80]}
                          onValueChange={(values) => {
                            updateSettingsMutation.mutate({ confidenceThreshold: values[0] });
                          }}
                          min={50}
                          max={100}
                          step={5}
                          disabled={isLoading || updateSettingsMutation.isPending}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Transacoes com confianca acima deste limite serao confirmadas automaticamente
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "classificacao" && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Classificação & Dados
                  </CardTitle>
                  <CardDescription>
                    Importações, categorias, aliases e revisão de pendências.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="imports">
                    <TabsList className="grid grid-cols-6 w-full">
                      <TabsTrigger value="imports">Importações</TabsTrigger>
                      <TabsTrigger value="categorias">Categorias</TabsTrigger>
                      <TabsTrigger value="aliases">Aliases</TabsTrigger>
                      <TabsTrigger value="logos">Logos</TabsTrigger>
                      <TabsTrigger value="revisao">Fila de Revisão</TabsTrigger>
                      <TabsTrigger value="reset">Danger Zone</TabsTrigger>
                    </TabsList>

                    <TabsContent value="imports" className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Fonte</Label>
                          <Select value={importSource} onValueChange={setImportSource}>
                            <SelectTrigger className="bg-muted/30 border-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto-detectar</SelectItem>
                              <SelectItem value="sparkasse">Sparkasse</SelectItem>
                              <SelectItem value="amex">Amex</SelectItem>
                              <SelectItem value="mm">M&M</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Arquivo CSV</Label>
                          <Input
                            type="file"
                            accept=".csv"
                            onChange={(e) => {
                              const nextFile = e.target.files?.[0] || null;
                              setImportFile(nextFile);
                              setImportPreview(null);
                              setImportPreviewError(null);
                              setImportStatus(null);
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="gap-2" onClick={handlePreviewImport} disabled={!importFile}>
                          <Upload className="h-4 w-4" />
                          Pré-visualizar
                        </Button>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button className="gap-2" onClick={handleProcessImport} disabled={!importFile}>
                            <Upload className="h-4 w-4" />
                            Importar
                          </Button>
                          {importStatus && (
                            <div
                              className={cn(
                                "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
                                importStatus.type === "success"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-rose-200 bg-rose-50 text-rose-700"
                              )}
                            >
                              {importStatus.type === "success" ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              <span>{importStatus.message}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {importPreviewError ? (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                          {importPreviewError}
                        </div>
                      ) : null}

                      {importPreview && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Card className="bg-muted/20 border-0">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">Formato</p>
                                <p className="text-sm font-semibold">{importPreview.format || "-"}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/20 border-0">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">Delimiter</p>
                                <p className="text-sm font-semibold">{importPreview.meta?.delimiter || "-"}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/20 border-0">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">Encoding</p>
                                <p className="text-sm font-semibold">{importEncoding || "-"}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/20 border-0">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">Data</p>
                                <p className="text-sm font-semibold">{importPreview.meta?.dateFormat || "-"}</p>
                              </CardContent>
                            </Card>
                          </div>

                          {sourceMismatch ? (
                            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                              A fonte selecionada não corresponde ao formato detectado.
                            </div>
                          ) : null}
                          {importPreview.meta?.warnings?.length ? (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                              {importPreview.meta.warnings.join(" | ")}
                            </div>
                          ) : null}

                          <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full text-sm">
                              <thead className="bg-muted/30">
                                <tr>
                                  <th className="px-3 py-2 text-left">Fonte</th>
                                  <th className="px-3 py-2 text-left">Data</th>
                                  <th className="px-3 py-2 text-left">Valor</th>
                                  <th className="px-3 py-2 text-left">Descrição</th>
                                  <th className="px-3 py-2 text-left">Key Desc</th>
                                </tr>
                              </thead>
                              <tbody>
                                {importPreview.rows?.map((row: any, idx: number) => (
                                  <tr key={idx} className="border-t">
                                    <td className="px-3 py-2">{row.source}</td>
                                    <td className="px-3 py-2">{row.bookingDate}</td>
                                    <td className="px-3 py-2">{row.amount}</td>
                                    <td className="px-3 py-2">{row.simpleDesc}</td>
                                    <td className="px-3 py-2">{row.keyDesc}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="categorias" className="mt-6 space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="gap-2" onClick={handleDownloadClassificationCsv}>
                          <Download className="h-4 w-4" />
                          Baixar CSV
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={handleDownloadClassification}>
                          <Download className="h-4 w-4" />
                          Baixar Excel
                        </Button>
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <Input
                            type="file"
                            accept=".xlsx"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleClassificationPreview(e.target.files[0])}
                          />
                          <Button variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Pré-visualizar upload
                          </Button>
                        </label>
                      </div>

                      {classificationPreview && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Linhas: {classificationPreview.rows} | Categorias: {classificationPreview.appCategories} | Regras: {classificationPreview.rules}
                          </p>
                          {classificationPreview.diff && (
                            <div className="rounded-lg border border-muted bg-muted/20 p-3 text-sm space-y-2">
                              <p className="font-medium">Prévia de alterações</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">Novas categorias</p>
                                  <p className="font-semibold">{classificationPreview.diff.newLeavesCount}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Removidas</p>
                                  <p className="font-semibold">{classificationPreview.diff.removedLeavesCount}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Regras atualizadas</p>
                                  <p className="font-semibold">{classificationPreview.diff.updatedRulesCount}</p>
                                </div>
                              </div>
                              {classificationPreview.diff.updatedRulesSample?.length ? (
                                <div className="text-xs text-muted-foreground">
                                  Ex.: {classificationPreview.diff.updatedRulesSample.join(" | ")}
                                </div>
                              ) : null}
                            </div>
                          )}
                          {classificationPreview.requiresRemap && (
                            <div className="flex items-center gap-2">
                              <Switch checked={confirmRemap} onCheckedChange={setConfirmRemap} />
                              <span className="text-sm">Confirmo o remapeamento de categorias da UI</span>
                            </div>
                          )}
                          <Button className="gap-2" onClick={() => setShowClassificationConfirm(true)}>
                            Aplicar planilha
                          </Button>
                        </div>
                      )}

                      <Dialog open={showClassificationConfirm} onOpenChange={setShowClassificationConfirm}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Deseja aplicar as alterações?</DialogTitle>
                            <DialogDescription>
                              Isso atualizará regras existentes. Revise a pré-visualização antes de continuar.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowClassificationConfirm(false)}>
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => {
                                setShowClassificationConfirm(false);
                                handleClassificationApply();
                              }}
                            >
                              Confirmar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Separator />

                      <div className="space-y-2">
                        <Label>Teste de regra (key_desc)</Label>
                        <div className="flex gap-2">
                          <Input value={ruleTestKeyDesc} onChange={(e) => setRuleTestKeyDesc(e.target.value)} />
                          <Button variant="outline" onClick={handleRuleTest}>Testar</Button>
                        </div>
                        {ruleTestResult && (
                          <p className="text-sm text-muted-foreground">
                            Leaf: {ruleTestResult.leafId || "nenhuma"} | Regra: {ruleTestResult.ruleId || "-"}
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="aliases" className="mt-6 space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="gap-2" onClick={handleDownloadAliases}>
                          <Download className="h-4 w-4" />
                          Baixar Excel
                        </Button>
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <Input
                            type="file"
                            accept=".xlsx,.csv"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleAliasPreview(e.target.files[0])}
                          />
                          <Button variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Pré-visualizar upload
                          </Button>
                        </label>
                      </div>

                      {aliasPreview && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            key_desc_map: {aliasPreview.keyDescRows} | alias_assets: {aliasPreview.aliasRows}
                          </p>
                          <Button className="gap-2" onClick={handleAliasApply}>
                            Aplicar planilha
                          </Button>
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <Label>Teste de alias (key_desc)</Label>
                        <div className="flex gap-2">
                          <Input value={aliasTestKeyDesc} onChange={(e) => setAliasTestKeyDesc(e.target.value)} />
                          <Button variant="outline" onClick={handleAliasTest}>Testar</Button>
                        </div>
                        {aliasTestResult && (
                          <p className="text-sm text-muted-foreground">
                            Alias: {aliasTestResult.aliasDesc || "nenhum"}
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="logos" className="mt-6 space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="gap-2" onClick={handleDownloadLogosTemplate}>
                          <Download className="h-4 w-4" />
                          Baixar modelo de logos (Excel)
                        </Button>
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <Input
                            type="file"
                            accept=".xlsx,.csv"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const base64 = await readFileBase64(file);
                              setLogosFileBase64(base64);
                              setLogosPreview(null);
                              await handleLogosImport(base64);
                            }}
                          />
                          <Button variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Importar logos (Excel/CSV)
                          </Button>
                        </label>
                        <Button variant="outline" className="gap-2" onClick={handleRefreshLogos}>
                          <RefreshCw className="h-4 w-4" />
                          Atualizar logos
                        </Button>
                      </div>

                      {logosPreview && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Processados: {logosPreview.length}
                          </p>
                          <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full text-sm">
                              <thead className="bg-muted/30">
                                <tr>
                                  <th className="px-3 py-2 text-left">Alias</th>
                                  <th className="px-3 py-2 text-left">Status</th>
                                  <th className="px-3 py-2 text-left">Pré-visualizar</th>
                                </tr>
                              </thead>
                              <tbody>
                                {logosPreview.map((row: any, idx: number) => (
                                  <tr key={`${row.aliasDesc}-${idx}`} className="border-t">
                                    <td className="px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <AliasLogo
                                          aliasDesc={row.aliasDesc}
                                          fallbackDesc={row.aliasDesc}
                                          logoUrl={row.logoLocalPath}
                                          size={24}
                                          showText={false}
                                        />
                                        <span className="truncate">{row.aliasDesc}</span>
                                      </div>
                                    </td>
                                    <td className="px-3 py-2">
                                      <span
                                        className={cn(
                                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                                          row.status === "ok"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-rose-100 text-rose-700"
                                        )}
                                      >
                                        {row.status === "ok" ? "OK" : "Falha"}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      {row.status === "error" ? (
                                        <span className="text-xs text-rose-700">{row.error}</span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">Pronto</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="revisao" className="mt-6 space-y-3">
                      {reviewQueue.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma transação em aberto.</p>
                      ) : (
                        <div className="space-y-3">
                          {reviewQueue.map((tx: any) => {
                            const selectedLeafId = reviewSelections[tx.id];
                            const selectedRule = selectedLeafId ? rulesByLeafId.get(selectedLeafId) : undefined;
                            const existingKeywords = selectedRule?.keyWords
                              ? selectedRule.keyWords.split(";").map((value) => value.trim()).filter(Boolean)
                              : [];
                            const existingNegative = selectedRule?.keyWordsNegative
                              ? selectedRule.keyWordsNegative.split(";").map((value) => value.trim()).filter(Boolean)
                              : [];
                            const selectedLabel = selectedLeafId ? taxonomyLabelByLeafId.get(selectedLeafId) : "";

                            return (
                              <Card key={tx.id} className="border border-muted">
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex items-center gap-3">
                                    <AliasLogo
                                      aliasDesc={tx.aliasDesc}
                                      fallbackDesc={tx.simpleDesc || tx.descRaw}
                                      logoUrl={tx.logoLocalPath}
                                      size={22}
                                      showText={false}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate capitalize leading-snug">{tx.aliasDesc || tx.simpleDesc || tx.descRaw}</p>
                                      <p className="text-xs text-muted-foreground leading-snug">{tx.keyDesc}</p>
                                    </div>
                                    <span className="text-sm font-semibold">
                                      {tx.amount?.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                                    </span>
                                  </div>
                                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <Popover
                                      open={reviewCategoryOpen === tx.id}
                                      onOpenChange={(open) => setReviewCategoryOpen(open ? tx.id : null)}
                                    >
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className="w-full md:w-[320px] justify-between bg-muted/30"
                                        >
                                          {selectedLabel || "Selecione a categoria"}
                                          <ChevronsUpDown className="h-4 w-4 opacity-60" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Buscar por palavra-chave ou categoria" />
                                          <CommandList>
                                            <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                                            <CommandGroup>
                                              {taxonomyOptions.map((option) => (
                                                <CommandItem
                                                  key={option.leafId}
                                                  value={`${option.label} ${option.searchText}`}
                                                  onSelect={() => {
                                                    setReviewSelections((prev) => ({ ...prev, [tx.id]: option.leafId }));
                                                    setReviewCategoryOpen(null);
                                                  }}
                                                >
                                                  <Check className={cn("mr-2 h-4 w-4", selectedLeafId === option.leafId ? "opacity-100" : "opacity-0")} />
                                                  <span>{option.label}</span>
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                    <Input
                                      placeholder="Nova expressão (opcional)"
                                      value={reviewExpressions[tx.id] || ""}
                                      onChange={(e) => setReviewExpressions(prev => ({ ...prev, [tx.id]: e.target.value }))}
                                      className="flex-1"
                                    />
                                    <Button className="shrink-0" onClick={() => handleReviewAssign(tx.id)}>
                                      Aplicar
                                    </Button>
                                  </div>

                                  <div className="rounded-lg border border-muted bg-muted/20 p-3 text-xs space-y-2">
                                    <div>
                                      <p className="text-muted-foreground">Key words atuais</p>
                                      {existingKeywords.length ? (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {existingKeywords.map((keyword) => (
                                            <Badge key={keyword} variant="secondary" className="font-normal">
                                              {keyword}
                                            </Badge>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground mt-1">Nenhuma palavra-chave cadastrada.</p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Key words negativos</p>
                                      {existingNegative.length ? (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {existingNegative.map((keyword) => (
                                            <Badge key={keyword} variant="outline" className="font-normal">
                                              {keyword}
                                            </Badge>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground mt-1">Nenhuma negativa cadastrada.</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                      Adicionar novas expressões
                                    </Label>
                                    <div className="flex flex-col md:flex-row gap-2">
                                      <Input
                                        placeholder="Adicionar nova expressão (use ';' para separar expressões)"
                                        value={reviewKeywordDrafts[tx.id] || ""}
                                        onChange={(e) => setReviewKeywordDrafts(prev => ({ ...prev, [tx.id]: e.target.value }))}
                                      />
                                      <Button variant="outline" className="shrink-0" onClick={() => handleAppendKeywords(tx.id)}>
                                        Salvar
                                      </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Cada expressão deve ser separada por ponto e vírgula (;). Ex: 'Farmácia Müller; Apotheke'.
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="reset" className="mt-6 space-y-4">
                      <Card className="border border-rose-200 bg-rose-50">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-rose-800">Zona de Perigo</h3>
                          <p className="text-sm text-rose-700">
                            Remova transações, categorias, regras, aliases e logos com confirmação em etapas.
                          </p>
                          <div className="space-y-2">
                            <Button variant="destructive" className="gap-2" onClick={() => setDangerDialogOpen(true)}>
                              <Trash2 className="h-4 w-4" />
                              Apagar dados
                            </Button>
                            {dangerLastDeletedAt ? (
                              <p className="text-xs text-rose-700">
                                Última exclusão: {new Date(dangerLastDeletedAt).toLocaleString("pt-BR")}
                              </p>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>

                      <Dialog open={dangerDialogOpen} onOpenChange={handleDangerDialogChange}>
                        <DialogContent>
                          {dangerStep === "select" && (
                            <>
                              <DialogHeader>
                                <DialogTitle>Tem certeza que deseja apagar dados?</DialogTitle>
                                <DialogDescription>Selecione quais dados deseja remover:</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 text-sm">
                                <label className="flex items-center gap-2">
                                  <Checkbox
                                    checked={dangerSelections.transactions}
                                    onCheckedChange={(checked) =>
                                      setDangerSelections((prev) => ({
                                        ...prev,
                                        transactions: Boolean(checked),
                                        all: false
                                      }))
                                    }
                                  />
                                  Transações
                                </label>
                                <label className="flex items-center gap-2">
                                  <Checkbox
                                    checked={dangerSelections.categories}
                                    onCheckedChange={(checked) =>
                                      setDangerSelections((prev) => ({
                                        ...prev,
                                        categories: Boolean(checked),
                                        all: false
                                      }))
                                    }
                                  />
                                  Categorias e Regras
                                </label>
                                <label className="flex items-center gap-2">
                                  <Checkbox
                                    checked={dangerSelections.aliases}
                                    onCheckedChange={(checked) =>
                                      setDangerSelections((prev) => ({
                                        ...prev,
                                        aliases: Boolean(checked),
                                        all: false
                                      }))
                                    }
                                  />
                                  Aliases e Logos
                                </label>
                                <label className="flex items-center gap-2">
                                  <Checkbox
                                    checked={dangerSelections.all}
                                    onCheckedChange={(checked) =>
                                      setDangerSelections({
                                        transactions: false,
                                        categories: false,
                                        aliases: false,
                                        all: Boolean(checked)
                                      })
                                    }
                                  />
                                  Tudo (Reset total)
                                </label>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() => setDangerStep("confirm")}
                                  disabled={
                                    !(
                                      dangerSelections.all ||
                                      dangerSelections.transactions ||
                                      dangerSelections.categories ||
                                      dangerSelections.aliases
                                    )
                                  }
                                >
                                  Avançar
                                </Button>
                              </DialogFooter>
                            </>
                          )}

                          {dangerStep === "confirm" && (
                            <>
                              <DialogHeader>
                                <DialogTitle>Confirma exclusão permanente?</DialogTitle>
                                <DialogDescription>
                                  Essa ação não pode ser desfeita. Confirme digitando &quot;APAGAR&quot;.
                                </DialogDescription>
                              </DialogHeader>
                              <Input
                                value={dangerConfirmText}
                                onChange={(e) => setDangerConfirmText(e.target.value)}
                                placeholder="Digite APAGAR"
                              />
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDangerStep("select")}>
                                  Voltar
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleDangerDelete}
                                  disabled={dangerConfirmText !== "APAGAR"}
                                >
                                  Confirmar
                                </Button>
                              </DialogFooter>
                            </>
                          )}

                          {dangerStep === "done" && (
                            <>
                              <DialogHeader>
                                <DialogTitle>Exclusão concluída</DialogTitle>
                                <DialogDescription>Os dados selecionados foram apagados com sucesso.</DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button onClick={() => setDangerDialogOpen(false)}>Fechar</Button>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {activeTab === "dicionarios" && (
              <>
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Dicionário de Comerciantes
                    </CardTitle>
                    <CardDescription>
                      Gerencie aliases padronizados para descrições de transações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">Centralize suas descrições</h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            Crie aliases personalizados para comerciantes e transações recorrentes.
                            Mantenha suas finanças organizadas com descrições consistentes e fáceis de entender.
                          </p>
                          <Link href="/merchant-dictionary">
                            <Button className="bg-primary hover:bg-primary/90 gap-2">
                              Acessar Dicionário Completo
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <p className="font-medium text-sm">Importação em Massa</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Importe e exporte aliases via Excel para gerenciamento em lote
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <p className="font-medium text-sm">Geração Automática</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Cria automaticamente chaves únicas baseadas nas transações
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "integracoes" && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Fontes de Dados
                  </CardTitle>
                  <CardDescription>
                    Conecte suas contas bancárias e cartões via importação CSV.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Miles & More</p>
                        <p className="text-sm text-muted-foreground">Importação CSV ativa</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">American Express</p>
                        <p className="text-sm text-muted-foreground">Multi-cartoes suportado</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sparkasse</p>
                        <p className="text-sm text-muted-foreground">Conta bancaria IBAN</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">Ativo</Badge>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-xl border-2 border-dashed">
                    <p className="text-sm text-muted-foreground">
                      <strong>Proximas integracoes:</strong> Nubank, Revolut, N26, Wise
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "seguranca" && (
              <>
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      Alterar Senha
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Senha Atual</Label>
                      <Input type="password" className="bg-muted/30 border-0" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Nova Senha</Label>
                        <Input type="password" className="bg-muted/30 border-0" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Confirmar</Label>
                        <Input type="password" className="bg-muted/30 border-0" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-primary hover:bg-primary/90">Atualizar Senha</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-rose-50 border-rose-200/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-rose-700 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Zona de Perigo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-rose-700">Excluir Conta</p>
                        <p className="text-sm text-rose-600/80">Todos os dados serao apagados permanentemente.</p>
                      </div>
                      <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100">
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
