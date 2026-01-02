import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Loader2, Sparkles, BookOpen, Settings2, Zap, Edit2, RefreshCw, ShoppingBag, Home, Car, Heart, Coffee, Globe, CircleDollarSign, ArrowLeftRight, Hash, Filter, Check, Download, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rulesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { StatusPanel } from "@/components/status-panel";
import * as XLSX from 'xlsx';
import { useLocale } from "@/hooks/use-locale";
import { rulesCopy, t } from "@/lib/i18n";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingRule, setEditingRule] = useState<any>(null);
  const [formData, setFormData] = useState<RuleFormData>(EMPTY_RULE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusInfo, setStatusInfo] = useState<{ variant: "success" | "warning" | "error"; title: string; description: string; payload?: Record<string, unknown> } | null>(null);
  const locale = useLocale();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["rules"],
    queryFn: rulesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: rulesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      closeDialog();
      toast({ title: "Regra criada com sucesso" });
      setStatusInfo({
        variant: "success",
        title: "Regra criada",
        description: "A nova regra foi adicionada com sucesso."
      });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar regra", description: error.message, variant: "destructive" });
      setStatusInfo({
        variant: "error",
        title: "Falha ao criar regra",
        description: error.message || "Não foi possível criar a regra.",
        payload: error?.details || null
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => rulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      closeDialog();
      toast({ title: "Regra atualizada" });
      setStatusInfo({
        variant: "success",
        title: "Regra atualizada",
        description: "As alterações foram salvas."
      });
    },
    onError: (error: any) => {
      setStatusInfo({
        variant: "error",
        title: "Falha ao atualizar regra",
        description: error.message || "Não foi possível atualizar a regra.",
        payload: error?.details || null
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: rulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast({ title: "Regra removida" });
      setStatusInfo({
        variant: "success",
        title: "Regra removida",
        description: "A regra foi excluída com sucesso."
      });
    },
    onError: (error: any) => {
      setStatusInfo({
        variant: "error",
        title: "Falha ao remover regra",
        description: error.message || "Não foi possível remover a regra.",
        payload: error?.details || null
      });
    }
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
      setStatusInfo({
        variant: "success",
        title: "Regras reaplicadas",
        description: `${result.categorized} categorizadas automaticamente, ${result.stillPending} pendentes`,
        payload: result
      });
    },
    onError: (error: any) => {
      setStatusInfo({
        variant: "error",
        title: "Falha ao reaplicar regras",
        description: error.message || "Não foi possível reaplicar as regras.",
        payload: error?.details || null
      });
    }
  });

  const seedMutation = useMutation({
    mutationFn: rulesApi.seed,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast({ title: `${result.count} regras IA adicionadas` });
      setStatusInfo({
        variant: "success",
        title: "Regras IA adicionadas",
        description: `${result.count} regras importadas pela IA.`,
        payload: result
      });
    },
    onError: (error: any) => {
      setStatusInfo({
        variant: "error",
        title: "Falha ao gerar regras IA",
        description: error.message || "Não foi possível gerar regras.",
        payload: error?.details || null
      });
    }
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

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Regras');

    // Add reference sheet with all available categories
    const categoryReference = [
      { 'Categoria Nível 1': 'Mercado', 'Exemplos Nível 2': 'Supermercado, Padaria, Feira', 'Exemplos Nível 3': 'LIDL, REWE, EDEKA' },
      { 'Categoria Nível 1': 'Lazer', 'Exemplos Nível 2': 'Streaming, Cinema, Restaurante', 'Exemplos Nível 3': 'Netflix, Spotify, McDonald\'s' },
      { 'Categoria Nível 1': 'Transporte', 'Exemplos Nível 2': 'Combustível, Transporte Público, Taxi', 'Exemplos Nível 3': 'Shell, Uber, DB' },
      { 'Categoria Nível 1': 'Moradia', 'Exemplos Nível 2': 'Aluguel, Condomínio, Utilidades', 'Exemplos Nível 3': 'Água, Luz, Gás' },
      { 'Categoria Nível 1': 'Saúde', 'Exemplos Nível 2': 'Farmácia, Médico, Academia', 'Exemplos Nível 3': 'Plano de Saúde, Dentista' },
      { 'Categoria Nível 1': 'Educação', 'Exemplos Nível 2': 'Cursos, Livros, Material', 'Exemplos Nível 3': 'Udemy, Coursera' },
      { 'Categoria Nível 1': 'Compras Online', 'Exemplos Nível 2': 'E-commerce, Marketplace', 'Exemplos Nível 3': 'Amazon, eBay, Zalando' },
      { 'Categoria Nível 1': 'Receitas', 'Exemplos Nível 2': 'Salário, Freelance, Investimentos', 'Exemplos Nível 3': 'Empresa, Cliente A' },
      { 'Categoria Nível 1': 'Interno', 'Exemplos Nível 2': 'Transferências entre contas', 'Exemplos Nível 3': 'Poupança, Investimento' },
      { 'Categoria Nível 1': 'Outros', 'Exemplos Nível 2': 'Diversos', 'Exemplos Nível 3': 'Não categorizado' }
    ];

    const wsReference = XLSX.utils.json_to_sheet(categoryReference);
    wsReference['!cols'] = [
      { wch: 25 }, // Categoria Nível 1
      { wch: 40 }, // Exemplos Nível 2
      { wch: 40 }  // Exemplos Nível 3
    ];
    XLSX.utils.book_append_sheet(wb, wsReference, 'Categorias Disponíveis');

    // Add instructions sheet
    const instructions = [
      { 'INSTRUÇÕES': 'Como usar este arquivo de regras' },
      { 'INSTRUÇÕES': '' },
      { 'INSTRUÇÕES': '1. Aba "Regras": Suas regras de categorização atuais' },
      { 'INSTRUÇÕES': '2. Aba "Categorias Disponíveis": Lista completa de categorias e exemplos' },
      { 'INSTRUÇÕES': '' },
      { 'INSTRUÇÕES': 'Para importar regras:' },
      { 'INSTRUÇÕES': '- Edite a aba "Regras" com suas alterações' },
      { 'INSTRUÇÕES': '- Use categorias da aba "Categorias Disponíveis"' },
      { 'INSTRUÇÕES': '- Categorias 2 e 3 são opcionais' },
      { 'INSTRUÇÕES': '- Salve e importe de volta no RitualFin' },
      { 'INSTRUÇÕES': '' },
      { 'INSTRUÇÕES': 'Hierarquia de Categorias:' },
      { 'INSTRUÇÕES': '- Nível 1: Categoria principal (obrigatório)' },
      { 'INSTRUÇÕES': '- Nível 2: Subcategoria (opcional, texto livre)' },
      { 'INSTRUÇÕES': '- Nível 3: Especificação (opcional, texto livre)' }
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruções');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `ritualfin_regras_${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);

    toast({
      title: `${rules.length} regras exportadas com sucesso`,
      description: "Inclui categorias disponíveis e instruções"
    });
  };

  const handleUploadExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast({ title: "Arquivo vazio", variant: "destructive" });
          setStatusInfo({
            variant: "error",
            title: "Importação falhou",
            description: "O arquivo está vazio."
          });
          return;
        }

        // Validate and transform data
        const rulesToImport: any[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const rowNum = index + 2; // +2 because Excel is 1-indexed and has header row

          // Validate required fields
          if (!row['Nome']) {
            errors.push(`Linha ${rowNum}: Nome é obrigatório`);
            return;
          }
          if (!row['Palavras-chave']) {
            errors.push(`Linha ${rowNum}: Palavras-chave é obrigatório`);
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

          rulesToImport.push({
            name: row['Nome'],
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
          setStatusInfo({
            variant: "error",
            title: "Importação falhou",
            description: errors.slice(0, 3).join('; '),
            payload: { errors: errors.slice(0, 10) }
          });
          return;
        }

        if (rulesToImport.length === 0) {
          toast({ title: "Nenhuma regra válida para importar", variant: "destructive" });
          setStatusInfo({
            variant: "warning",
            title: "Importação ignorada",
            description: "Nenhuma regra válida encontrada no arquivo."
          });
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
          setStatusInfo({
            variant: "success",
            title: "Importação concluída",
            description: `${successCount} regras importadas com sucesso.`
          });
        } else {
          toast({
            title: "Importação concluída com erros",
            description: `${successCount} importadas, ${failCount} falharam`
          });
          setStatusInfo({
            variant: "warning",
            title: "Importação concluída com erros",
            description: `${successCount} importadas, ${failCount} falharam`,
            payload: { successCount, failCount }
          });
        }

      } catch (error: any) {
        toast({
          title: "Erro ao processar arquivo",
          description: error.message,
          variant: "destructive"
        });
        setStatusInfo({
          variant: "error",
          title: "Erro ao processar arquivo",
          description: error.message || "Não foi possível processar o arquivo.",
          payload: error?.details || null
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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{t(locale, rulesCopy.title)}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                IA
              </Badge>
            </div>
            <p className="text-muted-foreground">{t(locale, rulesCopy.subtitle)}</p>
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
                {seedMutation.isPending ? t(locale, rulesCopy.generating) : t(locale, rulesCopy.createDefault)}
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
              {t(locale, rulesCopy.reapply)}
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
              {t(locale, rulesCopy.importLabel)}
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
              {t(locale, rulesCopy.newRule)}
            </Button>
          </div>
        </div>

        {statusInfo && (
          <StatusPanel
            title={statusInfo.title}
            description={statusInfo.description}
            variant={statusInfo.variant}
            payload={statusInfo.payload}
          />
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(locale, rulesCopy.totalRules)}</p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(locale, rulesCopy.aiRules)}</p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(locale, rulesCopy.userRules)}</p>
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
                  Criar Regras Padrao
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
                    <SelectItem value="Mercado">Mercado</SelectItem>
                    <SelectItem value="Moradia">Moradia</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Saúde">Saude</SelectItem>
                    <SelectItem value="Lazer">Lazer</SelectItem>
                    <SelectItem value="Compras Online">Compras Online</SelectItem>
                    <SelectItem value="Receitas">Receitas</SelectItem>
                    <SelectItem value="Interno">Interno</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
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

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Palavras-chave</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="REWE;EDEKA;ALDI (separar com ;)"
                  className="bg-muted/30 border-0"
                  data-testid="input-rule-keywords"
                />
                <p className="text-xs text-muted-foreground">Separe multiplas palavras com ponto e virgula (;)</p>
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
                      Variavel
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <p className="font-medium text-sm">Regra Estrita</p>
                  <p className="text-xs text-muted-foreground">Aplicar automaticamente com 100% confianca</p>
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
      </div>
    </AppLayout>
  );
}
