import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Settings, Bell, Eye, Check, Globe, Palette, Database, Trash2, Download, Key, CreditCard, Mail, Moon, Sun, Sparkles, BookOpen, ArrowRight, Upload, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
  { id: "classificacao", label: "Classificação & Dados", icon: Database, description: "Importações, categorias e aliases" },
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
  const [classificationPreview, setClassificationPreview] = useState<any | null>(null);
  const [classificationFileBase64, setClassificationFileBase64] = useState<string | null>(null);
  const [confirmRemap, setConfirmRemap] = useState(false);
  const [aliasPreview, setAliasPreview] = useState<any | null>(null);
  const [aliasFileBase64, setAliasFileBase64] = useState<string | null>(null);
  const [ruleTestKeyDesc, setRuleTestKeyDesc] = useState("");
  const [ruleTestResult, setRuleTestResult] = useState<any | null>(null);
  const [aliasTestKeyDesc, setAliasTestKeyDesc] = useState("");
  const [aliasTestResult, setAliasTestResult] = useState<any | null>(null);
  const [reviewSelections, setReviewSelections] = useState<Record<string, string>>({});
  const [reviewExpressions, setReviewExpressions] = useState<Record<string, string>>({});
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
      const preview = await uploadsApi.preview(importFile.name, text, encoding, fileBase64, importFile.type);
      setImportPreview(preview);
    } catch (err: any) {
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
      toast({
        title: "Importação concluída",
        description: `Inseridas: ${result.rowsImported}, duplicadas: ${result.duplicates}, auto: ${result.autoClassified || 0}, abertas: ${result.openCount || 0}`
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      queryClient.invalidateQueries({ queryKey: ["classification-review-queue"] });
    } catch (err: any) {
      toast({ title: "Erro na importação", description: err.message, variant: "destructive" });
    }
  };

  const handleClassificationPreview = async (file: File) => {
    const base64 = await readFileBase64(file);
    setClassificationFileBase64(base64);
    const preview = await classificationApi.previewImport(base64);
    setClassificationPreview(preview);
  };

  const handleClassificationApply = async () => {
    if (!classificationFileBase64) return;
    try {
      const result = await classificationApi.applyImport(classificationFileBase64, confirmRemap);
      toast({ title: "Categorias atualizadas", description: `Linhas aplicadas: ${result.rows}` });
      queryClient.invalidateQueries({ queryKey: ["classification-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["classification-rules"] });
    } catch (err: any) {
      toast({ title: "Erro ao aplicar categorias", description: err.message, variant: "destructive" });
    }
  };

  const handleAliasPreview = async (file: File) => {
    const base64 = await readFileBase64(file);
    setAliasFileBase64(base64);
    const preview = await aliasApi.previewImport(base64);
    setAliasPreview(preview);
  };

  const handleAliasApply = async () => {
    if (!aliasFileBase64) return;
    try {
      await aliasApi.applyImport(aliasFileBase64);
      toast({ title: "Aliases atualizados", description: "Planilha aplicada com sucesso." });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (err: any) {
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

  const handleDownloadAliases = async () => {
    const blob = await aliasApi.exportExcel();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ritualfin_aliases.xlsx";
    link.click();
    URL.revokeObjectURL(url);
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

  const sourceMismatch = importPreview && importSource !== "auto" && (
    (importSource === "sparkasse" && importPreview.format !== "sparkasse") ||
    (importSource === "amex" && importPreview.format !== "amex") ||
    (importSource === "mm" && importPreview.format !== "miles_and_more")
  );

  return (
    <AppLayout>
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
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="imports">Importações</TabsTrigger>
                      <TabsTrigger value="categorias">Categorias</TabsTrigger>
                      <TabsTrigger value="aliases">Aliases & Logos</TabsTrigger>
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
                          <Input type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="gap-2" onClick={handlePreviewImport} disabled={!importFile}>
                          <Upload className="h-4 w-4" />
                          Pré-visualizar
                        </Button>
                        <Button className="gap-2" onClick={handleProcessImport} disabled={!importFile}>
                          <Upload className="h-4 w-4" />
                          Importar
                        </Button>
                      </div>

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
                              A fonte selecionada nao corresponde ao formato detectado.
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
                          {classificationPreview.requiresRemap && (
                            <div className="flex items-center gap-2">
                              <Switch checked={confirmRemap} onCheckedChange={setConfirmRemap} />
                              <span className="text-sm">Confirmo remapeamento de categorias UI</span>
                            </div>
                          )}
                          <Button className="gap-2" onClick={handleClassificationApply}>
                            Aplicar planilha
                          </Button>
                        </div>
                      )}

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
                            accept=".xlsx"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleAliasPreview(e.target.files[0])}
                          />
                          <Button variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Pré-visualizar upload
                          </Button>
                        </label>
                        <Button variant="outline" className="gap-2" onClick={handleRefreshLogos}>
                          <RefreshCw className="h-4 w-4" />
                          Atualizar logos
                        </Button>
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

                    <TabsContent value="revisao" className="mt-6 space-y-3">
                      {reviewQueue.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma transação em aberto.</p>
                      ) : (
                        <div className="space-y-3">
                          {reviewQueue.map((tx: any) => (
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
                                    <p className="font-medium truncate">{tx.aliasDesc || tx.simpleDesc || tx.descRaw}</p>
                                    <p className="text-xs text-muted-foreground">{tx.keyDesc}</p>
                                  </div>
                                  <span className="text-sm font-semibold">{tx.amount?.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <Select
                                    value={reviewSelections[tx.id] || ""}
                                    onValueChange={(value) => setReviewSelections(prev => ({ ...prev, [tx.id]: value }))}
                                  >
                                    <SelectTrigger className="bg-muted/30 border-0">
                                      <SelectValue placeholder="Selecione a categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {taxonomyLeaves.map((leaf: any) => (
                                        <SelectItem key={leaf.leafId} value={leaf.leafId}>
                                          {leaf.nivel3Pt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    placeholder="Nova expressão (opcional)"
                                    value={reviewExpressions[tx.id] || ""}
                                    onChange={(e) => setReviewExpressions(prev => ({ ...prev, [tx.id]: e.target.value }))}
                                  />
                                  <Button onClick={() => handleReviewAssign(tx.id)}>Aplicar</Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="reset" className="mt-6 space-y-4">
                      <Card className="border border-rose-200 bg-rose-50">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-rose-800">Reset total de dados</h3>
                          <p className="text-sm text-rose-700">
                            Apaga transações, categorias, regras, aliases e logos. Em seguida, re-semeia a planilha base.
                          </p>
                          <Button variant="destructive" className="gap-2" onClick={handleResetData}>
                            <Trash2 className="h-4 w-4" />
                            Resetar dados
                          </Button>
                        </CardContent>
                      </Card>
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
