import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Loader2, Sparkles, BookOpen, Settings2, Zap, Edit2, RefreshCw, ShoppingBag, Home, Car, Heart, Coffee, Globe, CircleDollarSign, ArrowLeftRight, Hash, Filter, Check, Download, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rulesApi, transactionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { AIKeywordsPanel } from "@/components/ai-keywords-panel";
import { useLocation } from "wouter";
import * as XLSX from 'xlsx';

const TYPE_COLORS: Record<string, string> = {
  "Despesa": "bg-rose-100 text-rose-700",
  "Receita": "bg-emerald-100 text-emerald-700"
};

const CATEGORY_ICONS: Record<string, any> = {
  "Mercado": ShoppingBag,
  "Moradia": Home,
  "Transporte": Car,
  "Saúde": Heart,
  "Lazer": Coffee,
  "Compras Online": Globe,
  "Receitas": CircleDollarSign,
  "Interno": ArrowLeftRight,
  "Outros": Settings2
};

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Moradia": "#f97316",
  "Transporte": "#3b82f6",
  "Saúde": "#ef4444",
  "Lazer": "#a855f7",
  "Compras Online": "#ec4899",
  "Receitas": "#10b981",
  "Interno": "#475569",
  "Outros": "#6b7280"
};

const CATEGORY_OPTIONS = [
  "Mercado",
  "Moradia",
  "Transporte",
  "Saúde",
  "Lazer",
  "Compras Online",
  "Receitas",
  "Interno",
  "Outros"
];

interface RuleFormData {
  name: string;
  keywords: string;
  type: "Despesa" | "Receita";
  fixVar: "Fixo" | "Variável";
  category1: string;
  category2: string;
  category3: string;
  priority: number;
  strict: boolean;
}

const EMPTY_RULE: RuleFormData = {
  name: "",
  keywords: "",
  type: "Despesa",
  fixVar: "Variável",
  category1: "Outros",
  category2: "",
  category3: "",
  priority: 500,
  strict: false
};

export default function RulesPage() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingRule, setEditingRule] = useState<any>(null);
  const [formData, setFormData] = useState<RuleFormData>(EMPTY_RULE);
  const [activeTab, setActiveTab] = useState("rules");
  const [previewData, setPreviewData] = useState<{ count: number; samples: string[]; scanned: number } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prefillHandledRef = useRef(false);
  const previewTimeoutRef = useRef<number | null>(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["rules"],
    queryFn: rulesApi.list,
  });

  const { data: confirmQueue = [] } = useQuery({
    queryKey: ["confirm-queue"],
    queryFn: transactionsApi.confirmQueue,
  });

  const createMutation = useMutation({
    mutationFn: rulesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      closeDialog();
      toast({ title: "Regra criada com sucesso" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar regra", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => rulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      closeDialog();
      toast({ title: "Regra atualizada" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: rulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast({ title: "Regra removida" });
    },
  });

  const reapplyMutation = useMutation({
    mutationFn: rulesApi.reapplyAll,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["confirm-queue"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ 
        title: "Regras reaplicadas", 
        description: `${result.categorized} categorizadas automaticamente, ${result.stillPending} pendentes`
      });
    }
  });

  const seedMutation = useMutation({
    mutationFn: rulesApi.seed,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast({ title: `${result.count} regras IA adicionadas` });
    },
  });

  const closeDialog = () => {
    setIsOpen(false);
    setEditingRule(null);
    setFormData(EMPTY_RULE);
  };

  const openNewDialog = () => {
    setEditingRule(null);
    setFormData(EMPTY_RULE);
    setIsOpen(true);
  };

  useEffect(() => {
    if (prefillHandledRef.current) return;
    const search = location.split("?")[1];
    if (!search) return;

    const params = new URLSearchParams(search);
    if (params.get("prefill") !== "1") return;

    const prefillData: RuleFormData = {
      name: params.get("name") || "",
      keywords: params.get("keywords") || "",
      type: (params.get("type") as RuleFormData["type"]) || "Despesa",
      fixVar: (params.get("fixVar") as RuleFormData["fixVar"]) || "Variável",
      category1: params.get("category1") || "Outros",
      category2: params.get("category2") || "",
      category3: params.get("category3") || "",
      priority: 600,
      strict: false
    };

    setFormData({ ...EMPTY_RULE, ...prefillData });
    setEditingRule(null);
    setIsOpen(true);
    prefillHandledRef.current = true;

    window.history.replaceState({}, "", "/rules");
  }, [location]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewData(null);
      return;
    }
    if (!formData.keywords.trim()) {
      setPreviewData(null);
      return;
    }
    if (previewTimeoutRef.current) {
      window.clearTimeout(previewTimeoutRef.current);
    }
    previewTimeoutRef.current = window.setTimeout(async () => {
      try {
        setPreviewLoading(true);
        const data = await rulesApi.preview({
          keywords: formData.keywords,
          scope: "pending"
        });
        setPreviewData(data);
      } catch (_error) {
        setPreviewData(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 500);

    return () => {
      if (previewTimeoutRef.current) {
        window.clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [formData.keywords, isOpen]);

  const handleDownloadExcel = () => {
    if (rules.length === 0) {
      toast({ title: "Nenhuma regra para exportar", variant: "destructive" });
      return;
    }

    // Prepare data for Excel
    const excelData = rules.map((rule: any) => ({
      'Nome': rule.name,
      'Tipo (Despesa/Receita)': rule.type,
      'Fixo/Variável': rule.fixVar,
      'Categoria 1': rule.category1,
      'Categoria 2': rule.category2 || '',
      'Categoria 3': rule.category3 || '',
      'Palavras-chave': rule.keywords,
      'Prioridade': rule.priority,
      'Regra Estrita': rule.strict ? 'Sim' : 'Não',
      'Sistema': rule.isSystem ? 'Sim' : 'Não'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Nome
      { wch: 20 }, // Tipo
      { wch: 15 }, // Fixo/Variável
      { wch: 20 }, // Categoria 1
      { wch: 25 }, // Categoria 2
      { wch: 25 }, // Categoria 3
      { wch: 50 }, // Palavras-chave
      { wch: 12 }, // Prioridade
      { wch: 12 }, // Regra Estrita
      { wch: 10 }  // Sistema
    ];

    const classificationRows = CATEGORY_OPTIONS.map((category) => ({
      'Categoria 1': category,
      'Categoria 2': '',
      'Categoria 3': '',
      'Tipo (Despesa/Receita)': '',
      'Fixo/Variável': '',
      'Palavras-chave': ''
    }));

    const classificationsSheet = XLSX.utils.json_to_sheet(classificationRows);
    classificationsSheet['!cols'] = [
      { wch: 20 }, // Categoria 1
      { wch: 25 }, // Categoria 2
      { wch: 25 }, // Categoria 3
      { wch: 18 }, // Tipo
      { wch: 15 }, // Fixo/Variável
      { wch: 50 }  // Palavras-chave
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Regras');
    XLSX.utils.book_append_sheet(wb, classificationsSheet, 'Classificacoes');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `ritualfin_regras_${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);

    toast({ title: `${rules.length} regras exportadas com sucesso` });
  };

  const handleUploadExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const targetSheets = workbook.SheetNames.filter((name: string) =>
          ["regras", "classificacoes", "classificações"].includes(name.toLowerCase())
        );

        const sheetsToParse = targetSheets.length > 0 ? targetSheets : [workbook.SheetNames[0]];
        const jsonData = sheetsToParse.flatMap((sheetName: string) => {
          const worksheet = workbook.Sheets[sheetName];
          return XLSX.utils.sheet_to_json(worksheet);
        });

        if (jsonData.length === 0) {
          toast({ title: "Arquivo vazio", variant: "destructive" });
          return;
        }

        // Validate and transform data
        const rulesToImport: any[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const rowNum = index + 2; // +2 because Excel is 1-indexed and has header row

          // Validate required fields
          const hasKeywords = !!row['Palavras-chave'];
          if (!hasKeywords) {
            return;
          }
          if (!row['Tipo (Despesa/Receita)'] || !['Despesa', 'Receita'].includes(row['Tipo (Despesa/Receita)'])) {
            errors.push(`Linha ${rowNum}: Tipo deve ser "Despesa" ou "Receita"`);
            return;
          }
          if (!row['Fixo/Variável'] || !['Fixo', 'Variável'].includes(row['Fixo/Variável'])) {
            errors.push(`Linha ${rowNum}: Deve ser "Fixo" ou "Variável"`);
            return;
          }
          if (!row['Categoria 1']) {
            errors.push(`Linha ${rowNum}: Categoria 1 é obrigatória`);
            return;
          }

          // Skip system rules (don't allow importing/overwriting system rules)
          if (row['Sistema'] === 'Sim') {
            return;
          }

          const name = row['Nome'] || row['Categoria 3'] || row['Categoria 2'] || row['Categoria 1'];

          rulesToImport.push({
            name,
            keywords: row['Palavras-chave'],
            type: row['Tipo (Despesa/Receita)'],
            fixVar: row['Fixo/Variável'],
            category1: row['Categoria 1'],
            category2: row['Categoria 2'] || '',
            category3: row['Categoria 3'] || '',
            priority: row['Prioridade'] || 500,
            strict: row['Regra Estrita'] === 'Sim'
          });
        });

        if (errors.length > 0) {
          toast({
            title: "Erros encontrados no arquivo",
            description: errors.slice(0, 3).join('; '),
            variant: "destructive"
          });
          return;
        }

        if (rulesToImport.length === 0) {
          toast({ title: "Nenhuma regra válida para importar", variant: "destructive" });
          return;
        }

        // Import rules one by one
        let successCount = 0;
        let failCount = 0;

        for (const ruleData of rulesToImport) {
          try {
            await rulesApi.create(ruleData);
            successCount++;
          } catch (error) {
            failCount++;
          }
        }

        // Refresh rules list
        queryClient.invalidateQueries({ queryKey: ["rules"] });

        if (failCount === 0) {
          toast({ title: `${successCount} regras importadas com sucesso` });
        } else {
          toast({
            title: "Importação concluída com erros",
            description: `${successCount} importadas, ${failCount} falharam`
          });
        }

      } catch (error: any) {
        toast({
          title: "Erro ao processar arquivo",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    reader.readAsBinaryString(file);

    // Reset input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openEditDialog = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      keywords: rule.keywords,
      type: rule.type,
      fixVar: rule.fixVar,
      category1: rule.category1,
      category2: rule.category2 || "",
      category3: rule.category3 || "",
      priority: rule.priority,
      strict: rule.strict
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.keywords) {
      toast({ title: "Preencha nome e palavras-chave", variant: "destructive" });
      return;
    }
    
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredRules = rules.filter((rule: any) => {
    const matchesSearch = search === "" || 
      rule.name.toLowerCase().includes(search.toLowerCase()) ||
      rule.keywords.toLowerCase().includes(search.toLowerCase()) ||
      rule.category1.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || rule.category1 === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const systemRules = filteredRules.filter((r: any) => r.isSystem);
  const userRules = filteredRules.filter((r: any) => !r.isSystem);
  const categories = Array.from(new Set(rules.map((r: any) => r.category1))) as string[];
  const pendingCount = confirmQueue.length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full max-w-[420px] grid grid-cols-2">
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="suggestions">Sugestões IA</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Motor de Regras</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                IA
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Categorize transações automaticamente com regras baseadas em palavras-chave.
            </p>
          </div>
          
          <div className="flex gap-2">
            {rules.length === 0 && (
              <Button
                variant="outline"
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                {seedMutation.isPending ? "Gerando..." : "Criar Regras Padrao"}
              </Button>
            )}

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => reapplyMutation.mutate()}
              disabled={reapplyMutation.isPending}
            >
              {reapplyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Reaplicar Regras
              {pendingCount > 0 && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] ml-1">
                  {pendingCount} pendentes
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={handleDownloadExcel}
              disabled={rules.length === 0}
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Importar
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadExcel}
              accept=".xlsx,.xls"
              className="hidden"
            />

            <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={openNewDialog} data-testid="btn-new-rule">
              <Plus className="h-4 w-4" />
              Nova Regra
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Regras</p>
                  <p className="text-3xl font-bold mt-1">{rules.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Regras IA</p>
                  <p className="text-3xl font-bold mt-1 text-primary">{systemRules.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Suas Regras</p>
                  <p className="text-3xl font-bold mt-1">{userRules.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Settings2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Categorias</p>
                  <p className="text-3xl font-bold mt-1">{categories.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Hash className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar regras por palavra-chave..." 
              className="pl-9 bg-white border-0 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-rules"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-white border-0 shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredRules.length === 0 ? (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma regra configurada</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Crie regras para categorizar suas transações automaticamente durante a importação.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => seedMutation.mutate()}
                  disabled={seedMutation.isPending}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Criar Regras Padrão
                </Button>
                <Button className="gap-2" onClick={openNewDialog}>
                  <Plus className="h-4 w-4" />
                  Criar Manualmente
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRules.map((rule: any) => {
              const Icon = CATEGORY_ICONS[rule.category1] || Settings2;
              const color = CATEGORY_COLORS[rule.category1] || "#6b7280";
              const keywordsList = rule.keywords.split(";").filter(Boolean);
              const displayKeywords = keywordsList.slice(0, 5);
              const remainingCount = keywordsList.length - 5;
              
              return (
                <Card 
                  key={rule.id} 
                  className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow group"
                  data-testid={`card-rule-${rule.id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{rule.name}</h3>
                            {rule.isSystem && (
                              <Badge className="text-[10px] bg-primary/10 text-primary border-0">IA</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {[rule.category1, rule.category2, rule.category3]
                              .filter(Boolean)
                              .join(" → ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openEditDialog(rule)}
                          aria-label="Editar regra"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {!rule.isSystem && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => deleteMutation.mutate(rule.id)}
                            data-testid={`btn-delete-rule-${rule.id}`}
                            aria-label="Excluir regra"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {displayKeywords.map((kw: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="text-[11px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground font-medium"
                        >
                          {kw.trim().toUpperCase()}
                        </span>
                      ))}
                      {remainingCount > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          +{remainingCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-[10px] border-0", TYPE_COLORS[rule.type])}>
                          {rule.type}
                        </Badge>
                        <span className="text-muted-foreground">{rule.fixVar}</span>
                      </div>
                      {rule.strict && (
                        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                          <Zap className="h-2.5 w-2.5 mr-1" />
                          Estrita
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setIsOpen(true); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {editingRule ? "Editar Regra" : "Nova Regra"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Supermercado LIDL"
                  className="bg-muted/30 border-0"
                  data-testid="input-rule-name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Categoria (Nível 1) <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.category1}
                  onValueChange={(v) => setFormData({ ...formData, category1: v as any })}
                >
                  <SelectTrigger className="bg-muted/30 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Subcategoria (Nível 2)
                  </Label>
                  <Input
                    value={formData.category2}
                    onChange={(e) => setFormData({ ...formData, category2: e.target.value })}
                    placeholder="Ex: Supermercado"
                    className="bg-muted/30 border-0"
                    data-testid="input-rule-category2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Especificação (Nível 3)
                  </Label>
                  <Input
                    value={formData.category3}
                    onChange={(e) => setFormData({ ...formData, category3: e.target.value })}
                    placeholder="Ex: LIDL"
                    className="bg-muted/30 border-0"
                    data-testid="input-rule-category3"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Nível 1 define a macro categoria. Nível 2 aprofunda o tipo (ex: Supermercado). Nível 3 detalha o merchant (ex: LIDL).
              </p>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Palavras-chave</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="REWE;EDEKA;ALDI (separar com ;)"
                  className="bg-muted/30 border-0"
                  data-testid="input-rule-keywords"
                />
                <p className="text-xs text-muted-foreground">Separe múltiplas palavras com ponto e vírgula (;)</p>
                {previewLoading && (
                  <div className="text-xs text-muted-foreground">Calculando impacto...</div>
                )}
                {previewData && !previewLoading && (
                  <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      Impacto estimado: {previewData.count} transações na fila
                    </p>
                    {previewData.samples.length > 0 && (
                      <p className="mt-2">
                        Exemplos: {previewData.samples.slice(0, 3).map((sample) => sample.split(" -- ")[0]).join(" • ")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.type === "Despesa" ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "flex-1",
                        formData.type === "Despesa" && "bg-rose-500 hover:bg-rose-600"
                      )}
                      onClick={() => setFormData({ ...formData, type: "Despesa" })}
                    >
                      Despesa
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === "Receita" ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "flex-1",
                        formData.type === "Receita" && "bg-emerald-500 hover:bg-emerald-600"
                      )}
                      onClick={() => setFormData({ ...formData, type: "Receita" })}
                    >
                      Receita
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Variação</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.fixVar === "Fixo" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setFormData({ ...formData, fixVar: "Fixo" })}
                    >
                      Fixo
                    </Button>
                    <Button
                      type="button"
                      variant={formData.fixVar === "Variável" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setFormData({ ...formData, fixVar: "Variável" })}
                    >
                      Variável
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <p className="font-medium text-sm">Regra Estrita</p>
                  <p className="text-xs text-muted-foreground">Aplicar automaticamente com 100% confiança</p>
                </div>
                <Switch
                  checked={formData.strict}
                  onCheckedChange={(v) => setFormData({ ...formData, strict: v })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="btn-save-rule"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Check className="h-4 w-4" />
                {editingRule ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </TabsContent>
        <TabsContent value="suggestions">
          <AIKeywordsPanel embedded />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
