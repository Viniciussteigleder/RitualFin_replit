import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Bell, Check, Globe, Database, Trash2, Download, CreditCard, BookOpen, ArrowRight, Upload, RefreshCw, CheckCircle2, XCircle, FileText, ShieldAlert, Image } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AliasLogo } from "@/components/alias-logo";
import { StatusPanel } from "@/components/status-panel";
import { useQuery, useMutation } from "@tanstack/react-query";
import { settingsApi, classificationApi, aliasApi, resetApi, dataImportsApi, auditLogsApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatDateTime } from "@/lib/format";
import { useLocale } from "@/hooks/use-locale";
import { settingsCopy, t } from "@/lib/i18n";

export default function SettingsPage() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState("conta");
  const [classificationPreview, setClassificationPreview] = useState<any | null>(null);
  const [classificationImportId, setClassificationImportId] = useState<string | null>(null);
  const [classificationPreviewError, setClassificationPreviewError] = useState<string | null>(null);
  const [classificationStatus, setClassificationStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmRemap, setConfirmRemap] = useState(false);
  const [showClassificationConfirm, setShowClassificationConfirm] = useState(false);
  const [aliasPreview, setAliasPreview] = useState<any | null>(null);
  const [aliasImportId, setAliasImportId] = useState<string | null>(null);
  const [aliasPreviewError, setAliasPreviewError] = useState<string | null>(null);
  const [aliasStatus, setAliasStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [logosPreview, setLogosPreview] = useState<any | null>(null);
  const [logosImportId, setLogosImportId] = useState<string | null>(null);
  const [logosPreviewError, setLogosPreviewError] = useState<string | null>(null);
  const [logosStatus, setLogosStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [logosImportResults, setLogosImportResults] = useState<any[] | null>(null);
  const [dataImportStatus, setDataImportStatus] = useState<{
    variant: "success" | "warning" | "error";
    title: string;
    description: string;
    payload?: Record<string, unknown>;
  } | null>(null);
  const [ruleTestKeyDesc, setRuleTestKeyDesc] = useState("");
  const [ruleTestResult, setRuleTestResult] = useState<any | null>(null);
  const [aliasTestKeyDesc, setAliasTestKeyDesc] = useState("");
  const [aliasTestResult, setAliasTestResult] = useState<any | null>(null);
  const [reviewSelections, setReviewSelections] = useState<Record<string, string>>({});
  const [reviewExpressions, setReviewExpressions] = useState<Record<string, string>>({});
  const [reviewKeywordDrafts, setReviewKeywordDrafts] = useState<Record<string, string>>({});
  const [reviewNegativeDrafts, setReviewNegativeDrafts] = useState<Record<string, string>>({});
  const [reviewLevelSelections, setReviewLevelSelections] = useState<
    Record<string, { level1?: string; level2?: string; level3?: string }>
  >({});
  const [mappingProvider, setMappingProvider] = useState<string | null>(null);
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
  const [dangerDeletedSummary, setDangerDeletedSummary] = useState<string[]>([]);
  const [auditStatus, setAuditStatus] = useState<{
    variant: "success" | "warning" | "error";
    title: string;
    description: string;
    payload?: Record<string, unknown>;
  } | null>(null);
  const [auditFilter, setAuditFilter] = useState("all");
  const { toast } = useToast();
  const integrationProviders = useMemo(() => t(locale, settingsCopy.integrationProviders), [locale]);
  const auditActionLabels = useMemo(
    () => t(locale, settingsCopy.auditActionLabels) as Record<string, string>,
    [locale]
  );
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
  const tabs = useMemo(() => ([
    { id: "conta", label: t(locale, settingsCopy.tabAccount), icon: User, description: t(locale, settingsCopy.tabAccountDesc) },
    { id: "preferencias-regionais", label: t(locale, settingsCopy.tabRegional), icon: Globe, description: t(locale, settingsCopy.tabRegionalDesc) },
    { id: "notificacoes", label: t(locale, settingsCopy.tabNotifications), icon: Bell, description: t(locale, settingsCopy.tabNotificationsDesc) },
    { id: "integracoes", label: t(locale, settingsCopy.tabIntegrations), icon: CreditCard, description: t(locale, settingsCopy.tabIntegrationsDesc) },
    { id: "classificacao", label: t(locale, settingsCopy.tabClassification), icon: Database, description: t(locale, settingsCopy.tabClassificationDesc) },
    { id: "dicionario", label: t(locale, settingsCopy.tabDictionary), icon: BookOpen, description: t(locale, settingsCopy.tabDictionaryDesc) },
    { id: "auditoria", label: t(locale, settingsCopy.tabAudit), icon: FileText, description: t(locale, settingsCopy.tabAuditDesc) },
    { id: "danger", label: t(locale, settingsCopy.tabDanger), icon: ShieldAlert, description: t(locale, settingsCopy.tabDangerDesc) },
  ]), [locale]);

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

  const { data: classificationLastImport } = useQuery({
    queryKey: ["data-imports-last", "classification"],
    queryFn: () => dataImportsApi.last("classification"),
  });

  const { data: aliasesLastImport } = useQuery({
    queryKey: ["data-imports-last", "aliases_key_desc"],
    queryFn: () => dataImportsApi.last("aliases_key_desc"),
  });

  const { data: logosLastImport } = useQuery({
    queryKey: ["data-imports-last", "aliases_assets"],
    queryFn: () => dataImportsApi.last("aliases_assets"),
  });

  const { data: auditLogs = [], isLoading: auditLogsLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditLogsApi.list(),
  });

  const filteredAuditLogs = auditLogs.filter((log: any) => {
    if (auditFilter === "all") return true;
    return log.status === auditFilter;
  });


  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: t(locale, settingsCopy.toastSettingsSaved),
        description: t(locale, settingsCopy.toastSettingsSavedBody),
      });
    },
    onError: () => {
      toast({
        title: t(locale, settingsCopy.toastSettingsErrorTitle),
        description: t(locale, settingsCopy.toastSettingsErrorBody),
        variant: "destructive",
      });
    },
  });

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

  const formatImportStatus = (status?: string) => {
    if (status === "confirmed") return t(locale, settingsCopy.statusSuccess);
    if (status === "previewed") return t(locale, settingsCopy.statusPreview);
    return t(locale, settingsCopy.statusFailure);
  };

  const handleClassificationPreview = async (file: File) => {
    setClassificationPreview(null);
    setClassificationPreviewError(null);
    setClassificationStatus(null);
    setDataImportStatus(null);
    setConfirmRemap(false);
    try {
      const base64 = await readFileBase64(file);
      const preview = await dataImportsApi.preview({
        dataset: "classification",
        filename: file.name,
        fileBase64: base64,
        confirmRemap
      });
      setClassificationPreview(preview);
      setClassificationImportId(preview.importId || null);
      if (!preview.success) {
        setClassificationPreviewError(preview.message || t(locale, settingsCopy.previewValidationFailed));
        setDataImportStatus({
          variant: "error",
          title: t(locale, settingsCopy.previewFailedTitle),
          description: preview.message || t(locale, settingsCopy.previewValidationFailed),
          payload: preview
        });
      } else {
        setDataImportStatus({
          variant: "success",
          title: t(locale, settingsCopy.previewDoneTitle),
          description: t(locale, settingsCopy.previewDoneBody),
          payload: { importId: preview.importId, rowsTotal: preview.rowsTotal, rowsValid: preview.rowsValid }
        });
      }
    } catch (err: any) {
      setClassificationPreviewError(t(locale, settingsCopy.previewValidationFailed));
      setDataImportStatus({
        variant: "error",
        title: t(locale, settingsCopy.previewErrorTitle),
        description: err.message || t(locale, settingsCopy.previewValidationFailed),
        payload: err?.details || null
      });
      toast({ title: t(locale, settingsCopy.toastPreviewError), description: err.message, variant: "destructive" });
    }
  };

  const handleClassificationApply = async () => {
    if (!classificationImportId) return;
    try {
      const result = await dataImportsApi.confirm({ importId: classificationImportId, confirmRemap });
      setClassificationStatus({
        type: "success",
        message: formatMessage(t(locale, settingsCopy.importAppliedBody), { count: result.rows })
      });
      setDataImportStatus({
        variant: "success",
        title: t(locale, settingsCopy.importAppliedTitle),
        description: formatMessage(t(locale, settingsCopy.importAppliedBody), { count: result.rows }),
        payload: result
      });
      toast({
        title: t(locale, settingsCopy.toastCategoriesUpdated),
        description: formatMessage(t(locale, settingsCopy.importAppliedRows), { count: result.rows })
      });
      queryClient.invalidateQueries({ queryKey: ["classification-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["classification-rules"] });
      queryClient.invalidateQueries({ queryKey: ["data-imports-last", "classification"] });
    } catch (err: any) {
      setClassificationStatus({
        type: "error",
        message: formatMessage(t(locale, settingsCopy.applyFailedMessage), { error: err.message })
      });
      setDataImportStatus({
        variant: "error",
        title: t(locale, settingsCopy.importApplyFailedTitle),
        description: err.message || t(locale, settingsCopy.importApplyFailedBody),
        payload: err?.details || null
      });
      toast({ title: t(locale, settingsCopy.toastApplyCategoriesError), description: err.message, variant: "destructive" });
    }
  };

  const handleAliasPreview = async (file: File) => {
    setAliasPreview(null);
    setAliasPreviewError(null);
    setAliasStatus(null);
    setDataImportStatus(null);
    try {
      const base64 = await readFileBase64(file);
      const preview = await dataImportsApi.preview({
        dataset: "aliases_key_desc",
        filename: file.name,
        fileBase64: base64
      });
      setAliasPreview(preview);
      setAliasImportId(preview.importId || null);
      if (!preview.success) {
        setAliasPreviewError(preview.message || t(locale, settingsCopy.previewValidationFailed));
        setDataImportStatus({
          variant: "error",
          title: t(locale, settingsCopy.previewFailedTitle),
          description: preview.message || t(locale, settingsCopy.previewValidationFailed),
          payload: preview
        });
      } else {
        setDataImportStatus({
          variant: "success",
          title: t(locale, settingsCopy.previewDoneTitle),
          description: t(locale, settingsCopy.previewDoneBody),
          payload: { importId: preview.importId, rowsTotal: preview.rowsTotal, rowsValid: preview.rowsValid }
        });
      }
    } catch (err: any) {
      setAliasPreviewError(t(locale, settingsCopy.previewValidationFailed));
      setDataImportStatus({
        variant: "error",
        title: t(locale, settingsCopy.previewErrorTitle),
        description: err.message || t(locale, settingsCopy.previewValidationFailed),
        payload: err?.details || null
      });
      toast({ title: t(locale, settingsCopy.toastPreviewError), description: err.message, variant: "destructive" });
    }
  };

  const handleAliasApply = async () => {
    if (!aliasImportId) return;
    try {
      const result = await dataImportsApi.confirm({ importId: aliasImportId });
      setAliasStatus({
        type: "success",
        message: formatMessage(t(locale, settingsCopy.importAppliedBody), { count: result.rows })
      });
      setDataImportStatus({
        variant: "success",
        title: t(locale, settingsCopy.aliasesAppliedTitle),
        description: formatMessage(t(locale, settingsCopy.importAppliedBody), { count: result.rows }),
        payload: result
      });
      toast({
        title: t(locale, settingsCopy.toastAliasesUpdated),
        description: formatMessage(t(locale, settingsCopy.importAppliedRows), { count: result.rows })
      });
      queryClient.invalidateQueries({ queryKey: ["classification-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["data-imports-last", "aliases_key_desc"] });
    } catch (err: any) {
      setAliasStatus({
        type: "error",
        message: formatMessage(t(locale, settingsCopy.applyFailedMessage), { error: err.message })
      });
      setDataImportStatus({
        variant: "error",
        title: t(locale, settingsCopy.toastApplyAliasesError),
        description: err.message || t(locale, settingsCopy.aliasesApplyFailedBody),
        payload: err?.details || null
      });
      toast({ title: t(locale, settingsCopy.toastApplyAliasesError), description: err.message, variant: "destructive" });
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

  const handleDownloadClassificationTemplateCsv = async () => {
    const blob = await classificationApi.exportCsvTemplate();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "categorias_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAliasesCsv = async () => {
    const blob = await aliasApi.exportKeyDescCsv();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ritualfin_aliases_key_desc.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAliasesTemplateCsv = async () => {
    const blob = await aliasApi.exportKeyDescTemplateCsv();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ritualfin_aliases_key_desc_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAssetsCsv = async () => {
    const blob = await aliasApi.exportAssetsCsv();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ritualfin_aliases_assets.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAssetsTemplateCsv = async () => {
    const blob = await aliasApi.exportAssetsTemplateCsv();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ritualfin_aliases_assets_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAuditCsv = async () => {
    try {
      const blob = await auditLogsApi.exportCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ritualfin_audit_log.csv";
      link.click();
      URL.revokeObjectURL(url);
      setAuditStatus({
        variant: "success",
        title: t(locale, settingsCopy.exportAuditTitle),
        description: t(locale, settingsCopy.exportAuditBody)
      });
    } catch (err: any) {
      setAuditStatus({
        variant: "error",
        title: t(locale, settingsCopy.exportAuditErrorTitle),
        description: err.message || t(locale, settingsCopy.exportAuditErrorBody),
        payload: err?.details || null
      });
    }
  };

  const handleLogosPreview = async (file: File) => {
    setLogosPreview(null);
    setLogosImportResults(null);
    setLogosPreviewError(null);
    setLogosStatus(null);
    setDataImportStatus(null);
    try {
      const base64 = await readFileBase64(file);
      const preview = await dataImportsApi.preview({
        dataset: "aliases_assets",
        filename: file.name,
        fileBase64: base64
      });
      setLogosPreview(preview);
      setLogosImportId(preview.importId || null);
      if (!preview.success) {
        setLogosPreviewError(preview.message || t(locale, settingsCopy.previewValidationFailed));
        setDataImportStatus({
          variant: "error",
          title: t(locale, settingsCopy.previewFailedTitle),
          description: preview.message || t(locale, settingsCopy.previewValidationFailed),
          payload: preview
        });
      } else {
        setDataImportStatus({
          variant: "success",
          title: t(locale, settingsCopy.previewDoneTitle),
          description: t(locale, settingsCopy.previewDoneBody),
          payload: { importId: preview.importId, rowsTotal: preview.rowsTotal, rowsValid: preview.rowsValid }
        });
      }
    } catch (err: any) {
      setLogosPreviewError(t(locale, settingsCopy.previewValidationFailed));
      setDataImportStatus({
        variant: "error",
        title: t(locale, settingsCopy.previewErrorTitle),
        description: err.message || t(locale, settingsCopy.previewValidationFailed),
        payload: err?.details || null
      });
      toast({ title: t(locale, settingsCopy.toastPreviewError), description: err.message, variant: "destructive" });
    }
  };

  const handleLogosApply = async () => {
    if (!logosImportId) return;
    try {
      const result = await dataImportsApi.confirm({ importId: logosImportId });
      setLogosStatus({
        type: "success",
        message: formatMessage(t(locale, settingsCopy.importAppliedBody), { count: result.processed })
      });
      setLogosImportResults(result.results || []);
      setDataImportStatus({
        variant: "success",
        title: t(locale, settingsCopy.toastLogosImported),
        description: formatMessage(t(locale, settingsCopy.logosProcessedLabel), { count: result.processed }),
        payload: result
      });
      toast({
        title: t(locale, settingsCopy.toastLogosImported),
        description: formatMessage(t(locale, settingsCopy.logosProcessedLabel), { count: result.processed })
      });
      queryClient.invalidateQueries({ queryKey: ["data-imports-last", "aliases_assets"] });
    } catch (err: any) {
      setLogosStatus({
        type: "error",
        message: formatMessage(t(locale, settingsCopy.applyFailedMessage), { error: err.message })
      });
      setDataImportStatus({
        variant: "error",
        title: t(locale, settingsCopy.toastLogosError),
        description: err.message || t(locale, settingsCopy.logosApplyFailedBody),
        payload: err?.details || null
      });
      toast({ title: t(locale, settingsCopy.toastLogosError), description: err.message, variant: "destructive" });
    }
  };

  const handleRefreshLogos = async () => {
    const result = await aliasApi.refreshLogos();
    toast({
      title: t(locale, settingsCopy.toastLogosUpdated),
      description: formatMessage(t(locale, settingsCopy.refreshLogosTotal), { count: result.total })
    });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const handleResetData = async () => {
    await resetApi.resetData();
    toast({ title: t(locale, settingsCopy.toastDataReset), description: t(locale, settingsCopy.toastDataResetDesc) });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["classification-review-queue"] });
    queryClient.invalidateQueries({ queryKey: ["classification-leaves"] });
    queryClient.invalidateQueries({ queryKey: ["classification-rules"] });
  };

  const handleReviewAssign = async (transactionId: string) => {
    const leafId = reviewSelections[transactionId];
    if (!leafId) {
      toast({ title: t(locale, settingsCopy.toastSelectCategory), variant: "destructive" });
      return;
    }
    const newExpression = reviewExpressions[transactionId]?.trim();
    await classificationApi.assignReview({
      transactionId,
      leafId,
      newExpression: newExpression || undefined,
      createRule: Boolean(newExpression)
    });
    toast({ title: t(locale, settingsCopy.toastClassificationUpdated) });
    setReviewExpressions((prev) => ({ ...prev, [transactionId]: "" }));
    queryClient.invalidateQueries({ queryKey: ["classification-review-queue"] });
  };

  const handleAppendKeywords = async (transactionId: string) => {
    const leafId = reviewSelections[transactionId];
    if (!leafId) {
      toast({ title: t(locale, settingsCopy.toastSelectCategory), variant: "destructive" });
      return;
    }
    const expressions = reviewKeywordDrafts[transactionId]?.trim() || "";
    if (!expressions) {
      toast({ title: t(locale, settingsCopy.toastEnterExpression), variant: "destructive" });
      return;
    }
    try {
      await classificationApi.appendRuleKeywords({ leafId, expressions });
      toast({ title: t(locale, settingsCopy.toastKeywordsUpdated) });
      setReviewKeywordDrafts((prev) => ({ ...prev, [transactionId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["classification-rules"] });
    } catch (err: any) {
      toast({ title: t(locale, settingsCopy.toastKeywordsError), description: err.message, variant: "destructive" });
    }
  };

  const handleAppendNegativeKeywords = async (transactionId: string) => {
    const leafId = reviewSelections[transactionId];
    if (!leafId) {
      toast({ title: t(locale, settingsCopy.toastSelectCategory), variant: "destructive" });
      return;
    }
    const expressions = reviewNegativeDrafts[transactionId]?.trim() || "";
    if (!expressions) {
      toast({ title: t(locale, settingsCopy.toastNegativeRequired), variant: "destructive" });
      return;
    }
    try {
      await classificationApi.appendRuleNegativeKeywords({ leafId, expressions });
      toast({ title: t(locale, settingsCopy.toastNegativeUpdated) });
      setReviewNegativeDrafts((prev) => ({ ...prev, [transactionId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["classification-rules"] });
    } catch (err: any) {
      toast({ title: t(locale, settingsCopy.toastNegativeError), description: err.message, variant: "destructive" });
    }
  };

  const resetDangerState = () => {
    setDangerStep("select");
    setDangerSelections({ transactions: false, categories: false, aliases: false, all: false });
    setDangerConfirmText("");
    setDangerDeletedSummary([]);
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
      const summary: string[] = [];
      if (dangerSelections.all) {
        summary.push(t(locale, settingsCopy.dangerOptionAll));
      } else {
        if (dangerSelections.transactions) summary.push(t(locale, settingsCopy.dangerSummaryTransactions));
        if (dangerSelections.categories) summary.push(t(locale, settingsCopy.dangerSummaryCategories));
        if (dangerSelections.aliases) summary.push(t(locale, settingsCopy.dangerSummaryAliases));
      }
      setDangerLastDeletedAt(result.deletedAt);
      setDangerDeletedSummary(summary);
      setDangerStep("done");
      toast({ title: t(locale, settingsCopy.toastDangerSuccess) });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["classification-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["classification-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["classification-rules"] });
    } catch (err: any) {
      toast({ title: t(locale, settingsCopy.toastDangerError), description: err.message, variant: "destructive" });
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

  const taxonomyLevels = useMemo(() => {
    const level1Set = new Set<string>();
    const level2Map = new Map<string, Set<string>>();
    const level3Map = new Map<string, Set<string>>();
    const leafByLevels = new Map<string, string>();

    taxonomyLeaves.forEach((leaf: any) => {
      const level1 = leaf.nivel1Pt || "";
      const level2 = leaf.nivel2Pt || "";
      const level3 = leaf.nivel3Pt || "";
      if (!level1 || !level2 || !level3) return;
      level1Set.add(level1);
      if (!level2Map.has(level1)) level2Map.set(level1, new Set());
      level2Map.get(level1)?.add(level2);
      const levelKey = `${level1}||${level2}`;
      if (!level3Map.has(levelKey)) level3Map.set(levelKey, new Set());
      level3Map.get(levelKey)?.add(level3);
      leafByLevels.set(`${levelKey}||${level3}`, leaf.leafId);
    });

    return {
      level1Options: Array.from(level1Set).sort(),
      level2Map,
      level3Map,
      leafByLevels
    };
  }, [taxonomyLeaves]);

  const activeMapping = integrationProviders.find((provider: any) => provider.id === mappingProvider) || null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t(locale, settingsCopy.title)}</h1>
          <p className="text-muted-foreground mt-1">
            {t(locale, settingsCopy.subtitle)}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 shrink-0">
            <Card className="bg-white border-0 shadow-sm sticky top-6">
              <CardContent className="p-3">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
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
                        <h3 className="font-bold text-xl">{t(locale, settingsCopy.profileTitle)}</h3>
                        <p className="text-sm text-muted-foreground">{t(locale, settingsCopy.profileSince)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-primary text-white">{t(locale, settingsCopy.profilePlan)}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">{t(locale, settingsCopy.editPhoto)}</Button>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">{t(locale, settingsCopy.labelName)}</Label>
                        <Input defaultValue={t(locale, settingsCopy.profileNameDefault)} className="bg-muted/30 border-0" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">{t(locale, settingsCopy.labelEmail)}</Label>
                        <Input defaultValue="usuario@exemplo.com" className="bg-muted/30 border-0" disabled />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-primary hover:bg-primary/90">{t(locale, settingsCopy.saveChanges)}</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                      {t(locale, settingsCopy.exportDataTitle)}
                  </CardTitle>
                  <CardDescription>
                      {t(locale, settingsCopy.exportDataDesc)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        {t(locale, settingsCopy.exportCsv)}
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        {t(locale, settingsCopy.exportJson)}
                      </Button>
                  </div>
                </CardContent>
              </Card>
              </>
            )}

            {activeTab === "preferencias-regionais" && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    {t(locale, settingsCopy.regionalTitle)}
                  </CardTitle>
                  <CardDescription>
                    {t(locale, settingsCopy.regionalDesc)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">{t(locale, settingsCopy.labelLanguage)}</Label>
                      <Select
                        value={settings?.language || "pt-BR"}
                        onValueChange={(value) => updateSettingsMutation.mutate({ language: value })}
                      >
                        <SelectTrigger className="bg-muted/30 border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">{t(locale, settingsCopy.langPtBr)}</SelectItem>
                          <SelectItem value="pt-PT">{t(locale, settingsCopy.langPtPt)}</SelectItem>
                          <SelectItem value="en">{t(locale, settingsCopy.langEn)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">{t(locale, settingsCopy.labelCurrency)}</Label>
                      <Select
                        value={settings?.currency || "EUR"}
                        onValueChange={(value) => updateSettingsMutation.mutate({ currency: value })}
                      >
                        <SelectTrigger className="bg-muted/30 border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">{t(locale, settingsCopy.currencyEur)}</SelectItem>
                          <SelectItem value="BRL">{t(locale, settingsCopy.currencyBrl)}</SelectItem>
                          <SelectItem value="USD">{t(locale, settingsCopy.currencyUsd)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">{t(locale, settingsCopy.labelFiscalRegion)}</Label>
                      <Select
                        value={settings?.fiscalRegion || "Portugal/PT"}
                        onValueChange={(value) => updateSettingsMutation.mutate({ fiscalRegion: value })}
                      >
                        <SelectTrigger className="bg-muted/30 border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Portugal/PT">{t(locale, settingsCopy.fiscalPortugal)}</SelectItem>
                          <SelectItem value="União Europeia">{t(locale, settingsCopy.fiscalEu)}</SelectItem>
                          <SelectItem value="Outros">{t(locale, settingsCopy.fiscalOther)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(locale, settingsCopy.csvExportAccents)}
                  </p>
                </CardContent>
              </Card>
            )}

            {activeTab === "notificacoes" && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    {t(locale, settingsCopy.notificationsTitle)}
                  </CardTitle>
                  <CardDescription>
                    {t(locale, settingsCopy.notificationsDesc)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">{t(locale, settingsCopy.notifyImportTitle)}</p>
                      <p className="text-sm text-muted-foreground">{t(locale, settingsCopy.notifyImportDesc)}</p>
                    </div>
                    <Switch
                      checked={settings?.notifyImportStatus ?? true}
                      onCheckedChange={(checked) => updateSettingsMutation.mutate({ notifyImportStatus: checked })}
                      disabled={isLoading || updateSettingsMutation.isPending}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">{t(locale, settingsCopy.notifyReviewTitle)}</p>
                      <p className="text-sm text-muted-foreground">{t(locale, settingsCopy.notifyReviewDesc)}</p>
                    </div>
                    <Switch
                      checked={settings?.notifyReviewQueue ?? true}
                      onCheckedChange={(checked) => updateSettingsMutation.mutate({ notifyReviewQueue: checked })}
                      disabled={isLoading || updateSettingsMutation.isPending}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">{t(locale, settingsCopy.notifyMonthlyTitle)}</p>
                      <p className="text-sm text-muted-foreground">{t(locale, settingsCopy.notifyMonthlyDesc)}</p>
                    </div>
                    <Switch
                      checked={settings?.notifyMonthlyReport ?? true}
                      onCheckedChange={(checked) => updateSettingsMutation.mutate({ notifyMonthlyReport: checked })}
                      disabled={isLoading || updateSettingsMutation.isPending}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "classificacao" && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    {t(locale, settingsCopy.classificationSectionTitle)}
                  </CardTitle>
                  <CardDescription>
                    {t(locale, settingsCopy.classificationSectionBody)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="categorias">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="categorias">{t(locale, settingsCopy.classificationTabCategories)}</TabsTrigger>
                      <TabsTrigger value="regras">{t(locale, settingsCopy.classificationTabRules)}</TabsTrigger>
                      <TabsTrigger value="revisao">{t(locale, settingsCopy.classificationTabReview)}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="categorias" className="mt-6 space-y-4">
                      <div className="rounded-lg border border-muted bg-muted/10 p-3 text-sm">
                        <p className="font-medium">{t(locale, settingsCopy.transactionsImports)}</p>
                        <p className="text-muted-foreground">
                          {t(locale, settingsCopy.reviewQueueFilesHintPrefix)}{" "}
                          <Link href="/uploads" className="text-primary underline">
                            {t(locale, settingsCopy.reviewQueueFilesHintLink)}
                          </Link>
                          .
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="gap-2" onClick={handleDownloadClassificationTemplateCsv}>
                          <Download className="h-4 w-4" />
                          {t(locale, settingsCopy.downloadTemplateCsv)}
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={handleDownloadClassificationCsv}>
                          <Download className="h-4 w-4" />
                          {t(locale, settingsCopy.downloadDataCsv)}
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={handleDownloadClassification}>
                          <Download className="h-4 w-4" />
                          {t(locale, settingsCopy.downloadExcel)}
                        </Button>
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <Input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleClassificationPreview(file);
                            }}
                          />
                          <Button variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            {t(locale, settingsCopy.previewUpload)}
                          </Button>
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t(locale, settingsCopy.csvDownloadsAccents)}
                      </p>

                      <div className="rounded-lg border border-muted bg-muted/10 p-3 text-sm">
                        <p className="font-medium">{t(locale, settingsCopy.lastImportTitle)}</p>
                        {classificationLastImport ? (
                          <p className="text-muted-foreground">
                            {format(new Date(classificationLastImport.createdAt), "dd/MM/yyyy HH:mm")} ·{" "}
                            {formatImportStatus(classificationLastImport.status)} ·{" "}
                            {formatMessage(t(locale, settingsCopy.lastImportRows), {
                              valid: classificationLastImport.rowsValid || 0,
                              total: classificationLastImport.rowsTotal || 0
                            })}
                          </p>
                        ) : (
                          <p className="text-muted-foreground">{t(locale, settingsCopy.lastImportEmpty)}</p>
                        )}
                      </div>

                      {dataImportStatus && (
                        <StatusPanel
                          title={dataImportStatus.title}
                          description={dataImportStatus.description}
                          variant={dataImportStatus.variant}
                          payload={dataImportStatus.payload}
                        />
                      )}

                      {classificationStatus && (
                        <div
                          className={cn(
                            "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
                            classificationStatus.type === "success"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          )}
                        >
                          {classificationStatus.type === "success" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span>{classificationStatus.message}</span>
                        </div>
                      )}

                      {classificationPreviewError ? (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 space-y-2">
                          <p className="font-medium">{classificationPreviewError}</p>
                          {classificationPreview?.fixes?.length ? (
                            <div className="text-xs text-rose-700">
                              {classificationPreview.fixes.map((fix: string) => (
                                <div key={fix}>• {fix}</div>
                              ))}
                            </div>
                          ) : null}
                          {classificationPreview?.reasonCodes?.length ? (
                            <p className="text-xs">
                              {formatMessage(t(locale, settingsCopy.previewReasonCodeLabel), {
                                codes: classificationPreview.reasonCodes.join(", ")
                              })}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {classificationPreview?.success && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Card className="bg-muted/20 border-0">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewEncodingLabel)}</p>
                                <p className="text-sm font-semibold">{classificationPreview.detectedEncoding || "-"}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/20 border-0">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewDelimiterLabel)}</p>
                                <p className="text-sm font-semibold">{classificationPreview.detectedDelimiter || "-"}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/20 border-0">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewRowsLabel)}</p>
                                <p className="text-sm font-semibold">{classificationPreview.rowsTotal || 0}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/20 border-0">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewColumnsLabel)}</p>
                                <p className="text-sm font-semibold">{classificationPreview.headerFound?.length || 0}</p>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="rounded-lg border border-muted bg-muted/20 p-3 text-sm">
                            <p className="font-medium">{t(locale, settingsCopy.previewColumnsDetectedTitle)}</p>
                            <p className="text-xs text-muted-foreground">
                              {classificationPreview.headerFound?.join(" · ") || "-"}
                            </p>
                          </div>

                          {classificationPreview.diff && (
                            <div className="rounded-lg border border-muted bg-muted/20 p-3 text-sm space-y-2">
                              <p className="font-medium">{t(locale, settingsCopy.changePreviewTitle)}</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewNewCategories)}</p>
                                  <p className="font-semibold">{classificationPreview.diff.newLeavesCount}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewRemoved)}</p>
                                  <p className="font-semibold">{classificationPreview.diff.removedLeavesCount}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewUpdatedRules)}</p>
                                  <p className="font-semibold">{classificationPreview.diff.updatedRulesCount}</p>
                                </div>
                              </div>
                              {classificationPreview.diff.updatedRulesSample?.length ? (
                                <div className="text-xs text-muted-foreground">
                                  {t(locale, settingsCopy.previewSamplePrefix)} {classificationPreview.diff.updatedRulesSample.join(" | ")}
                                </div>
                              ) : null}
                            </div>
                          )}

                          {classificationPreview.requiresRemap && (
                            <div className="flex items-center gap-2">
                              <Switch checked={confirmRemap} onCheckedChange={setConfirmRemap} />
                              <span className="text-sm">{t(locale, settingsCopy.confirmRemapLabel)}</span>
                            </div>
                          )}

                          <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full text-sm">
                              <thead className="bg-muted/30">
                                <tr>
                                  {(classificationPreview.headerFound || []).map((header: string) => (
                                    <th key={header} className="px-3 py-2 text-left">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {classificationPreview.previewRows?.map((row: any, idx: number) => (
                                  <tr key={idx} className="border-t">
                                    {(classificationPreview.headerFound || []).map((header: string) => (
                                      <td key={`${header}-${idx}`} className="px-3 py-2">
                                        {row[header]}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <Button
                            className="gap-2"
                            onClick={() => setShowClassificationConfirm(true)}
                            disabled={!classificationPreview?.success}
                          >
                            {t(locale, settingsCopy.confirmImport)}
                          </Button>
                        </div>
                      )}

                      <Dialog open={showClassificationConfirm} onOpenChange={setShowClassificationConfirm}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t(locale, settingsCopy.confirmChangesTitle)}</DialogTitle>
                            <DialogDescription>
                              {t(locale, settingsCopy.confirmChangesBody)}
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowClassificationConfirm(false)}>
                              {t(locale, settingsCopy.dialogCancel)}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowClassificationConfirm(false);
                                handleClassificationApply();
                              }}
                            >
                              {t(locale, settingsCopy.confirmAction)}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                    </TabsContent>

                    <TabsContent value="regras" className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-muted/20 border-0">
                          <CardContent className="p-4 space-y-2">
                            <p className="text-sm font-semibold">{t(locale, settingsCopy.rulesEditorTitle)}</p>
                            <p className="text-xs text-muted-foreground">
                              {t(locale, settingsCopy.rulesEditorBody)}
                            </p>
                            <Link href="/rules">
                              <Button variant="outline" size="sm">{t(locale, settingsCopy.rulesEditorAction)}</Button>
                            </Link>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/20 border-0">
                          <CardContent className="p-4 space-y-2">
                            <p className="text-sm font-semibold">{t(locale, settingsCopy.aiKeywordsTitle)}</p>
                            <p className="text-xs text-muted-foreground">
                              {t(locale, settingsCopy.aiKeywordsBody)}
                            </p>
                            <Link href="/ai-keywords">
                              <Button variant="outline" size="sm">{t(locale, settingsCopy.aiKeywordsAction)}</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="bg-white border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Settings className="h-4 w-4 text-primary" />
                            {t(locale, settingsCopy.classificationAssistTitle)}
                          </CardTitle>
                          <CardDescription>
                            {t(locale, settingsCopy.classificationAssistBody)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                            <div>
                              <p className="font-medium">{t(locale, settingsCopy.autoConfirmTitle)}</p>
                              <p className="text-sm text-muted-foreground">
                                {t(locale, settingsCopy.autoConfirmBody)}
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
                                <Label className="text-sm font-medium">{t(locale, settingsCopy.confidenceLimitLabel)}</Label>
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
                                {t(locale, settingsCopy.confidenceLimitHint)}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="bg-white border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            {t(locale, settingsCopy.ruleTestTitle)}
                          </CardTitle>
                          <CardDescription>
                            {t(locale, settingsCopy.rulesValidationTitle)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex gap-2">
                            <Input value={ruleTestKeyDesc} onChange={(e) => setRuleTestKeyDesc(e.target.value)} />
                            <Button variant="outline" onClick={handleRuleTest}>{t(locale, settingsCopy.ruleTestAction)}</Button>
                          </div>
                          {ruleTestResult && (
                            <p className="text-sm text-muted-foreground">
                              {formatMessage(t(locale, settingsCopy.ruleTestResult), {
                                leaf: ruleTestResult.leafId || t(locale, settingsCopy.ruleTestNone),
                                rule: ruleTestResult.ruleId || "-"
                              })}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {t(locale, settingsCopy.expressionsHint)}
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="revisao" className="mt-6 space-y-3">
                      {reviewQueue.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t(locale, settingsCopy.noOpenTransactions)}</p>
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
                            const selectedLeaf = selectedLeafId
                              ? taxonomyLeaves.find((leaf: any) => leaf.leafId === selectedLeafId)
                              : undefined;
                            const selection = reviewLevelSelections[tx.id] || {
                              level1: selectedLeaf?.nivel1Pt,
                              level2: selectedLeaf?.nivel2Pt,
                              level3: selectedLeaf?.nivel3Pt
                            };
                            const level2Options = selection.level1
                              ? Array.from(taxonomyLevels.level2Map.get(selection.level1) || [])
                              : [];
                            const level3Options =
                              selection.level1 && selection.level2
                                ? Array.from(taxonomyLevels.level3Map.get(`${selection.level1}||${selection.level2}`) || [])
                                : [];

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
                                      <p className="font-medium leading-snug break-words">
                                        {tx.aliasDesc || tx.simpleDesc || tx.descRaw}
                                      </p>
                                      <p className="text-xs text-muted-foreground leading-snug break-words">{tx.keyDesc}</p>
                                    </div>
                                    <span className="text-sm font-semibold">
                                      {tx.amount?.toLocaleString(locale, { style: "currency", currency: settings?.currency || "EUR" })}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Select
                                      value={selection.level1 || ""}
                                      onValueChange={(value) => {
                                        setReviewLevelSelections((prev) => ({
                                          ...prev,
                                          [tx.id]: { level1: value }
                                        }));
                                        setReviewSelections((prev) => ({ ...prev, [tx.id]: "" }));
                                      }}
                                    >
                                      <SelectTrigger className="bg-muted/30">
                                        <SelectValue placeholder={t(locale, settingsCopy.levelPlaceholder1)} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {taxonomyLevels.level1Options.map((level1) => (
                                          <SelectItem key={level1} value={level1}>
                                            {level1}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select
                                      value={selection.level2 || ""}
                                      onValueChange={(value) => {
                                        setReviewLevelSelections((prev) => ({
                                          ...prev,
                                          [tx.id]: { level1: selection.level1, level2: value }
                                        }));
                                        setReviewSelections((prev) => ({ ...prev, [tx.id]: "" }));
                                      }}
                                      disabled={!selection.level1}
                                    >
                                      <SelectTrigger className="bg-muted/30">
                                        <SelectValue placeholder={t(locale, settingsCopy.levelPlaceholder2)} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {level2Options.map((level2) => (
                                          <SelectItem key={level2} value={level2}>
                                            {level2}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select
                                      value={selection.level3 || ""}
                                      onValueChange={(value) => {
                                        const leafId = taxonomyLevels.leafByLevels.get(
                                          `${selection.level1}||${selection.level2}||${value}`
                                        );
                                        setReviewLevelSelections((prev) => ({
                                          ...prev,
                                          [tx.id]: { level1: selection.level1, level2: selection.level2, level3: value }
                                        }));
                                        if (leafId) {
                                          setReviewSelections((prev) => ({ ...prev, [tx.id]: leafId }));
                                        }
                                      }}
                                      disabled={!selection.level1 || !selection.level2}
                                    >
                                      <SelectTrigger className="bg-muted/30">
                                        <SelectValue placeholder={t(locale, settingsCopy.levelPlaceholder3)} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {level3Options.map((level3) => (
                                          <SelectItem key={level3} value={level3}>
                                            {level3}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <Input
                                      placeholder={t(locale, settingsCopy.newExpressionPlaceholder)}
                                      value={reviewExpressions[tx.id] || ""}
                                      onChange={(e) => setReviewExpressions(prev => ({ ...prev, [tx.id]: e.target.value }))}
                                      className="flex-1"
                                    />
                                    <Button className="shrink-0" onClick={() => handleReviewAssign(tx.id)}>
                                      {t(locale, settingsCopy.reviewApplyAction)}
                                    </Button>
                                  </div>

                                  <div className="rounded-lg border border-muted bg-muted/20 p-3 text-xs space-y-2">
                                    <div>
                                      <p className="text-muted-foreground">{t(locale, settingsCopy.reviewKeywordsCurrent)}</p>
                                      {existingKeywords.length ? (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {existingKeywords.map((keyword) => (
                                            <Badge key={keyword} variant="secondary" className="font-normal">
                                              {keyword}
                                            </Badge>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground mt-1">{t(locale, settingsCopy.reviewKeywordsEmpty)}</p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">{t(locale, settingsCopy.reviewKeywordsNegative)}</p>
                                      {existingNegative.length ? (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {existingNegative.map((keyword) => (
                                            <Badge key={keyword} variant="outline" className="font-normal">
                                              {keyword}
                                            </Badge>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground mt-1">{t(locale, settingsCopy.reviewKeywordsNegativeEmpty)}</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                      {t(locale, settingsCopy.addExpressionsTitle)}
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <div className="flex flex-col md:flex-row gap-2">
                                        <Input
                                          placeholder={t(locale, settingsCopy.keywordsPlaceholder)}
                                          value={reviewKeywordDrafts[tx.id] || ""}
                                          onChange={(e) => setReviewKeywordDrafts(prev => ({ ...prev, [tx.id]: e.target.value }))}
                                        />
                                        <Button variant="outline" className="shrink-0" onClick={() => handleAppendKeywords(tx.id)}>
                                          {t(locale, settingsCopy.saveKeywordsAdd)}
                                        </Button>
                                      </div>
                                      <div className="flex flex-col md:flex-row gap-2">
                                        <Input
                                          placeholder={t(locale, settingsCopy.keywordsNegativePlaceholder)}
                                          value={reviewNegativeDrafts[tx.id] || ""}
                                          onChange={(e) => setReviewNegativeDrafts(prev => ({ ...prev, [tx.id]: e.target.value }))}
                                        />
                                        <Button variant="outline" className="shrink-0" onClick={() => handleAppendNegativeKeywords(tx.id)}>
                                          {t(locale, settingsCopy.saveKeywordsRemove)}
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {t(locale, settingsCopy.expressionsHelp)}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                  </Tabs>
                </CardContent>
              </Card>
            )}

            {activeTab === "dicionario" && (
              <>
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {t(locale, settingsCopy.dictionaryTitle)}
                    </CardTitle>
                    <CardDescription>
                      {t(locale, settingsCopy.dictionarySubtitle)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{t(locale, settingsCopy.dictionaryCardTitle)}</h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            {t(locale, settingsCopy.dictionaryCardBody)}{" "}
                            {t(locale, settingsCopy.dictionaryCardBody2)}
                          </p>
                          <Link href="/merchant-dictionary">
                            <Button className="bg-primary hover:bg-primary/90 gap-2">
                              {t(locale, settingsCopy.dictionaryAction)}
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {dataImportStatus && (
                      <StatusPanel
                        title={dataImportStatus.title}
                        description={dataImportStatus.description}
                        variant={dataImportStatus.variant}
                        payload={dataImportStatus.payload}
                      />
                    )}

                    <Card className="bg-white border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          {t(locale, settingsCopy.aliasesSectionTitle)}
                        </CardTitle>
                        <CardDescription>
                          {t(locale, settingsCopy.aliasesSectionDesc)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" className="gap-2" onClick={handleDownloadAliasesTemplateCsv}>
                            <Download className="h-4 w-4" />
                            {t(locale, settingsCopy.downloadTemplateCsv)}
                          </Button>
                          <Button variant="outline" className="gap-2" onClick={handleDownloadAliasesCsv}>
                            <Download className="h-4 w-4" />
                            {t(locale, settingsCopy.downloadDataCsv)}
                          </Button>
                          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                            <Input
                              type="file"
                              accept=".csv"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAliasPreview(file);
                              }}
                            />
                            <Button variant="outline" className="gap-2">
                              <Upload className="h-4 w-4" />
                              {t(locale, settingsCopy.previewUpload)}
                            </Button>
                          </label>
                        </div>

                        <div className="rounded-lg border border-muted bg-muted/10 p-3 text-sm">
                          <p className="font-medium">{t(locale, settingsCopy.lastImportTitle)}</p>
                          {aliasesLastImport ? (
                            <p className="text-muted-foreground">
                              {format(new Date(aliasesLastImport.createdAt), "dd/MM/yyyy HH:mm")} ·{" "}
                              {formatImportStatus(aliasesLastImport.status)} ·{" "}
                              {formatMessage(t(locale, settingsCopy.lastImportRows), {
                                valid: aliasesLastImport.rowsValid || 0,
                                total: aliasesLastImport.rowsTotal || 0
                              })}
                            </p>
                          ) : (
                            <p className="text-muted-foreground">{t(locale, settingsCopy.lastImportEmpty)}</p>
                          )}
                        </div>

                        {aliasStatus && (
                          <div
                            className={cn(
                              "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
                              aliasStatus.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                            )}
                          >
                            {aliasStatus.type === "success" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span>{aliasStatus.message}</span>
                          </div>
                        )}

                        {aliasPreviewError ? (
                          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 space-y-2">
                            <p className="font-medium">{aliasPreviewError}</p>
                            {aliasPreview?.fixes?.length ? (
                              <div className="text-xs text-rose-700">
                                {aliasPreview.fixes.map((fix: string) => (
                                  <div key={fix}>• {fix}</div>
                                ))}
                              </div>
                            ) : null}
                          {aliasPreview?.reasonCodes?.length ? (
                            <p className="text-xs">
                              {formatMessage(t(locale, settingsCopy.previewReasonCodeLabel), {
                                codes: aliasPreview.reasonCodes.join(", ")
                              })}
                            </p>
                          ) : null}
                          </div>
                        ) : null}

                        {aliasPreview?.success && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <Card className="bg-muted/20 border-0">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">Encoding</p>
                                  <p className="text-sm font-semibold">{aliasPreview.detectedEncoding || "-"}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-muted/20 border-0">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">Delimiter</p>
                                  <p className="text-sm font-semibold">{aliasPreview.detectedDelimiter || "-"}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-muted/20 border-0">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">Linhas</p>
                                  <p className="text-sm font-semibold">{aliasPreview.rowsTotal || 0}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-muted/20 border-0">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewColumnsLabel)}</p>
                                <p className="text-sm font-semibold">{aliasPreview.headerFound?.length || 0}</p>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="rounded-lg border border-muted bg-muted/20 p-3 text-sm">
                            <p className="font-medium">{t(locale, settingsCopy.previewColumnsDetectedTitle)}</p>
                            <p className="text-xs text-muted-foreground">
                              {aliasPreview.headerFound?.join(" · ") || "-"}
                            </p>
                          </div>

                            <div className="overflow-x-auto rounded-lg border">
                              <table className="min-w-full text-sm">
                                <thead className="bg-muted/30">
                                  <tr>
                                    {(aliasPreview.headerFound || []).map((header: string) => (
                                      <th key={header} className="px-3 py-2 text-left">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {aliasPreview.previewRows?.map((row: any, idx: number) => (
                                    <tr key={idx} className="border-t">
                                      {(aliasPreview.headerFound || []).map((header: string) => (
                                        <td key={`${header}-${idx}`} className="px-3 py-2">
                                          {row[header]}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <Button className="gap-2" onClick={handleAliasApply} disabled={!aliasPreview?.success}>
                              {t(locale, settingsCopy.confirmImport)}
                            </Button>
                          </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                          <Label>{t(locale, settingsCopy.aliasTestTitle)}</Label>
                          <div className="flex gap-2">
                            <Input value={aliasTestKeyDesc} onChange={(e) => setAliasTestKeyDesc(e.target.value)} />
                            <Button variant="outline" onClick={handleAliasTest}>{t(locale, settingsCopy.aliasTestAction)}</Button>
                          </div>
                          {aliasTestResult && (
                            <p className="text-sm text-muted-foreground">
                              {formatMessage(t(locale, settingsCopy.aliasTestResult), {
                                alias: aliasTestResult.aliasDesc || t(locale, settingsCopy.aliasTestNone)
                              })}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Image className="h-4 w-4 text-primary" />
                          {t(locale, settingsCopy.logosSectionTitle)}
                        </CardTitle>
                        <CardDescription>
                          {t(locale, settingsCopy.requiredColumnsLabel)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" className="gap-2" onClick={handleDownloadAssetsTemplateCsv}>
                            <Download className="h-4 w-4" />
                            {t(locale, settingsCopy.downloadTemplateCsv)}
                          </Button>
                          <Button variant="outline" className="gap-2" onClick={handleDownloadAssetsCsv}>
                            <Download className="h-4 w-4" />
                            {t(locale, settingsCopy.downloadDataCsv)}
                          </Button>
                          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                            <Input
                              type="file"
                              accept=".csv"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                await handleLogosPreview(file);
                              }}
                            />
                            <Button variant="outline" className="gap-2">
                              <Upload className="h-4 w-4" />
                              {t(locale, settingsCopy.previewUpload)}
                            </Button>
                          </label>
                          <Button variant="outline" className="gap-2" onClick={handleRefreshLogos}>
                            <RefreshCw className="h-4 w-4" />
                            {t(locale, settingsCopy.refreshLogosAction)}
                          </Button>
                        </div>

                        <div className="rounded-lg border border-muted bg-muted/10 p-3 text-sm">
                          <p className="font-medium">{t(locale, settingsCopy.lastImportTitle)}</p>
                          {logosLastImport ? (
                            <p className="text-muted-foreground">
                              {format(new Date(logosLastImport.createdAt), "dd/MM/yyyy HH:mm")} ·{" "}
                              {formatImportStatus(logosLastImport.status)} ·{" "}
                              {formatMessage(t(locale, settingsCopy.lastImportRows), {
                                valid: logosLastImport.rowsValid || 0,
                                total: logosLastImport.rowsTotal || 0
                              })}
                            </p>
                          ) : (
                            <p className="text-muted-foreground">{t(locale, settingsCopy.lastImportEmpty)}</p>
                          )}
                        </div>

                        {logosStatus && (
                          <div
                            className={cn(
                              "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
                              logosStatus.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                            )}
                          >
                            {logosStatus.type === "success" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span>{logosStatus.message}</span>
                          </div>
                        )}

                        {logosPreviewError ? (
                          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 space-y-2">
                            <p className="font-medium">{logosPreviewError}</p>
                            {logosPreview?.fixes?.length ? (
                              <div className="text-xs text-rose-700">
                                {logosPreview.fixes.map((fix: string) => (
                                  <div key={fix}>• {fix}</div>
                                ))}
                              </div>
                            ) : null}
                            {logosPreview?.reasonCodes?.length ? (
                              <p className="text-xs">
                                {formatMessage(t(locale, settingsCopy.previewReasonCodeLabel), {
                                  codes: logosPreview.reasonCodes.join(", ")
                                })}
                              </p>
                            ) : null}
                          </div>
                        ) : null}

                        {logosPreview?.success && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <Card className="bg-muted/20 border-0">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewEncodingLabel)}</p>
                                  <p className="text-sm font-semibold">{logosPreview.detectedEncoding || "-"}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-muted/20 border-0">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewDelimiterLabel)}</p>
                                  <p className="text-sm font-semibold">{logosPreview.detectedDelimiter || "-"}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-muted/20 border-0">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewRowsLabel)}</p>
                                  <p className="text-sm font-semibold">{logosPreview.rowsTotal || 0}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-muted/20 border-0">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewColumnsLabel)}</p>
                                  <p className="text-sm font-semibold">{logosPreview.headerFound?.length || 0}</p>
                                </CardContent>
                              </Card>
                            </div>

                            <div className="rounded-lg border border-muted bg-muted/20 p-3 text-sm">
                              <p className="font-medium">{t(locale, settingsCopy.previewColumnsDetectedTitle)}</p>
                              <p className="text-xs text-muted-foreground">
                                {logosPreview.headerFound?.join(" · ") || "-"}
                              </p>
                            </div>

                            <div className="overflow-x-auto rounded-lg border">
                              <table className="min-w-full text-sm">
                                <thead className="bg-muted/30">
                                  <tr>
                                    {(logosPreview.headerFound || []).map((header: string) => (
                                      <th key={header} className="px-3 py-2 text-left">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {logosPreview.previewRows?.map((row: any, idx: number) => (
                                    <tr key={idx} className="border-t">
                                      {(logosPreview.headerFound || []).map((header: string) => (
                                        <td key={`${header}-${idx}`} className="px-3 py-2">
                                          {row[header]}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <Button className="gap-2" onClick={handleLogosApply} disabled={!logosPreview?.success}>
                              {t(locale, settingsCopy.confirmImport)}
                            </Button>
                          </div>
                        )}

                        {logosImportResults && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {formatMessage(t(locale, settingsCopy.logosProcessedLabel), {
                                count: logosImportResults.length
                              })}
                            </p>
                            <div className="overflow-x-auto rounded-lg border">
                              <table className="min-w-full text-sm">
                                <thead className="bg-muted/30">
                                  <tr>
                                    <th className="px-3 py-2 text-left">{t(locale, settingsCopy.logosTableAlias)}</th>
                                    <th className="px-3 py-2 text-left">{t(locale, settingsCopy.logosTableStatus)}</th>
                                    <th className="px-3 py-2 text-left">{t(locale, settingsCopy.previewHeader)}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {logosImportResults.map((row: any, idx: number) => (
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
                                        {row.status === "ok" ? (
                                          <span className="text-xs text-emerald-700">Logo salva</span>
                                        ) : (
                                          <span className="text-xs text-rose-700">{row.error}</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "integracoes" && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    {t(locale, settingsCopy.integrationsTitle)}
                  </CardTitle>
                  <CardDescription>
                    {t(locale, settingsCopy.integrationsIntro)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {integrationProviders.map((provider: any) => (
                      <div key={provider.id} className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center border border-muted">
                              <img
                                src={provider.logo}
                                alt={provider.name}
                                className="h-8 w-8 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              <p className="text-sm text-muted-foreground">{t(locale, settingsCopy.integrationsCsvLabel)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-0">{provider.status}</Badge>
                            <Button variant="outline" size="sm" onClick={() => setMappingProvider(provider.id)}>
                              {t(locale, settingsCopy.integrationsMappingAction)}
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t(locale, settingsCopy.integrationsSoon)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-muted/20 rounded-xl border-2 border-dashed">
                    <p className="text-sm text-muted-foreground">
                      <strong>{t(locale, settingsCopy.integrationsNext)}</strong>
                    </p>
                  </div>

                  <Dialog open={Boolean(activeMapping)} onOpenChange={(open) => !open && setMappingProvider(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {formatMessage(t(locale, settingsCopy.integrationsMappingTitle), {
                            name: activeMapping?.name || ""
                          })}
                        </DialogTitle>
                        <DialogDescription>
                          {t(locale, settingsCopy.integrationsRulesTitle)}
                        </DialogDescription>
                      </DialogHeader>
                      {activeMapping && (
                        <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="rounded-md border border-muted bg-muted/20 p-3">
                              <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.previewDelimiterLabel)}</p>
                              <p className="font-semibold">{activeMapping.csv.delimiter}</p>
                            </div>
                            <div className="rounded-md border border-muted bg-muted/20 p-3">
                              <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.integrationsEncodingLabel)}</p>
                              <p className="font-semibold">{activeMapping.csv.encoding}</p>
                            </div>
                            <div className="rounded-md border border-muted bg-muted/20 p-3">
                              <p className="text-xs text-muted-foreground">{t(locale, settingsCopy.integrationsDateFormatLabel)}</p>
                              <p className="font-semibold">{activeMapping.csv.dateFormat}</p>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold">{t(locale, settingsCopy.integrationsHeadersLabel)}</p>
                            <p className="text-muted-foreground">
                              {activeMapping.csv.requiredHeaders.join(" · ")}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">{t(locale, settingsCopy.integrationsPreviewColumnsLabel)}</p>
                            <p className="text-muted-foreground">
                              {activeMapping.csv.previewColumns.join(" · ")}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">{t(locale, settingsCopy.integrationsKeyFieldsLabel)}</p>
                            <p className="text-muted-foreground">{activeMapping.csv.keyFields}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{t(locale, settingsCopy.integrationsFailuresLabel)}</p>
                            <ul className="list-disc pl-5 text-muted-foreground">
                              {activeMapping.csv.failureReasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                            {t(locale, settingsCopy.integrationsPhotosSoon)}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {activeTab === "auditoria" && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {t(locale, settingsCopy.auditTitle)}
                  </CardTitle>
                  <CardDescription>
                    {t(locale, settingsCopy.auditSectionIntro)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="gap-2" onClick={handleExportAuditCsv}>
                      <Download className="h-4 w-4" />
                      {t(locale, settingsCopy.auditExport)}
                    </Button>
                    <Select value={auditFilter} onValueChange={setAuditFilter}>
                      <SelectTrigger className="w-[180px] text-xs">
                        <SelectValue placeholder={t(locale, settingsCopy.auditFilterStatus)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(locale, settingsCopy.auditFilterAll)}</SelectItem>
                        <SelectItem value="success">{t(locale, settingsCopy.auditFilterSuccess)}</SelectItem>
                        <SelectItem value="warning">{t(locale, settingsCopy.auditFilterWarning)}</SelectItem>
                        <SelectItem value="error">{t(locale, settingsCopy.auditFilterError)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {auditStatus && (
                    <StatusPanel
                      title={auditStatus.title}
                      description={auditStatus.description}
                      variant={auditStatus.variant}
                      payload={auditStatus.payload}
                    />
                  )}

                  {auditLogsLoading ? (
                    <p className="text-sm text-muted-foreground">{t(locale, settingsCopy.auditLoading)}</p>
                  ) : filteredAuditLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t(locale, settingsCopy.auditEmpty)}</p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="px-3 py-2 text-left">{t(locale, settingsCopy.auditHeaderDate)}</th>
                            <th className="px-3 py-2 text-left">{t(locale, settingsCopy.auditHeaderAction)}</th>
                            <th className="px-3 py-2 text-left">{t(locale, settingsCopy.auditHeaderStatus)}</th>
                            <th className="px-3 py-2 text-left">{t(locale, settingsCopy.auditHeaderSummary)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAuditLogs.map((log: any) => {
                    const statusLabel =
                              log.status === "error"
                                ? t(locale, settingsCopy.auditFilterError)
                                : log.status === "warning"
                                  ? t(locale, settingsCopy.auditFilterWarning)
                                  : t(locale, settingsCopy.auditFilterSuccess);
                            const statusClass =
                              log.status === "error"
                                ? "bg-rose-100 text-rose-700"
                                : log.status === "warning"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700";
                            const actionLabel = auditActionLabels[log.action] || log.action;
                            return (
                            <tr key={log.id} className="border-t">
                              <td className="px-3 py-2 whitespace-nowrap">
                                {formatDateTime(locale, log.createdAt)}
                              </td>
                              <td className="px-3 py-2">{actionLabel}</td>
                              <td className="px-3 py-2">
                                <span
                                  className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs", statusClass)}
                                >
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="px-3 py-2">{log.message || "-"}</td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "danger" && (
              <>
                <Card className="border border-rose-200 bg-rose-50">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-rose-800">{t(locale, settingsCopy.dangerTitle)}</h3>
                    <p className="text-sm text-rose-700">
                      {t(locale, settingsCopy.dangerDescription)}
                    </p>
                    <div className="space-y-2">
                      <Button variant="destructive" className="gap-2" onClick={() => setDangerDialogOpen(true)}>
                        <Trash2 className="h-4 w-4" />
                        {t(locale, settingsCopy.deleteData)}
                      </Button>
                      {dangerLastDeletedAt ? (
                        <p className="text-xs text-rose-700">
                          {t(locale, settingsCopy.dangerLastDeleted)}: {formatDateTime(locale, dangerLastDeletedAt)}
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>

                {dangerLastDeletedAt && (
                  <StatusPanel
                    title={t(locale, settingsCopy.dangerLastTitle)}
                    description={formatMessage(t(locale, settingsCopy.dangerCompletedAt), {
                      date: formatDateTime(locale, dangerLastDeletedAt)
                    })}
                    variant="warning"
                    payload={dangerDeletedSummary.length ? { datasets: dangerDeletedSummary } : undefined}
                  />
                )}

                <Dialog open={dangerDialogOpen} onOpenChange={handleDangerDialogChange}>
                  <DialogContent>
                    {dangerStep === "select" && (
                      <>
                        <DialogHeader>
                          <DialogTitle>{t(locale, settingsCopy.dangerSelectTitle)}</DialogTitle>
                          <DialogDescription>{t(locale, settingsCopy.dangerSelectDesc)}</DialogDescription>
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
                            {t(locale, settingsCopy.dangerOptionTransactions)}
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
                            {t(locale, settingsCopy.dangerOptionCategories)}
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
                            {t(locale, settingsCopy.dangerOptionAliases)}
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
                            {t(locale, settingsCopy.dangerOptionAll)}
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
                            {t(locale, settingsCopy.dangerNext)}
                          </Button>
                        </DialogFooter>
                      </>
                    )}

                    {dangerStep === "confirm" && (
                      <>
                        <DialogHeader>
                          <DialogTitle>{t(locale, settingsCopy.dangerConfirmTitle)}</DialogTitle>
                          <DialogDescription>
                            {t(locale, settingsCopy.dangerConfirmDesc)}
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          value={dangerConfirmText}
                          onChange={(e) => setDangerConfirmText(e.target.value)}
                          placeholder={t(locale, settingsCopy.dangerConfirmPlaceholder)}
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDangerStep("select")}>
                            {t(locale, settingsCopy.dangerBack)}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDangerDelete}
                            disabled={dangerConfirmText !== "APAGAR"}
                          >
                            {t(locale, settingsCopy.confirmAction)}
                          </Button>
                        </DialogFooter>
                      </>
                    )}

                    {dangerStep === "done" && (
                      <>
                        <DialogHeader>
                          <DialogTitle>{t(locale, settingsCopy.dangerDoneTitle)}</DialogTitle>
                          <DialogDescription>
                            {dangerLastDeletedAt
                              ? formatMessage(t(locale, settingsCopy.dangerCompletedAtShort), {
                                date: formatDateTime(locale, dangerLastDeletedAt)
                              })
                              : t(locale, settingsCopy.dangerDoneFallback)}
                          </DialogDescription>
                        </DialogHeader>
                        {dangerDeletedSummary.length > 0 && (
                          <div className="rounded-md border border-muted bg-muted/20 p-3 text-sm">
                            <p className="font-medium">{t(locale, settingsCopy.dangerDeletedItems)}</p>
                            <p className="text-muted-foreground">
                              {dangerDeletedSummary.join(" · ")}
                            </p>
                          </div>
                        )}
                        <DialogFooter>
                          <Button onClick={() => setDangerDialogOpen(false)}>{t(locale, settingsCopy.dangerClose)}</Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
