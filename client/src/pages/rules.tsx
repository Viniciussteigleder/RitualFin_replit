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
import { parseCsv, toCsv } from "@/lib/csv";
import { useLocale } from "@/hooks/use-locale";
import { rulesCopy, translateCategory, t } from "@/lib/i18n";

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
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
  const columnLabels = t(locale, rulesCopy.exportColumns);
  const typeLabelMap: Record<string, string> = {
    Despesa: t(locale, rulesCopy.fieldTypeExpense),
    Receita: t(locale, rulesCopy.fieldTypeIncome)
  };
  const fixVarLabelMap: Record<string, string> = {
    Fixo: t(locale, rulesCopy.fieldVariationFixed),
    Variável: t(locale, rulesCopy.fieldVariationVariable)
  };
  const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();
  const typeValueMap = new Map<string, RuleFormData["type"]>([
    ["despesa", "Despesa"],
    ["receita", "Receita"],
    [normalize(t(locale, rulesCopy.fieldTypeExpense)), "Despesa"],
    [normalize(t(locale, rulesCopy.fieldTypeIncome)), "Receita"],
    ["expense", "Despesa"],
    ["income", "Receita"],
    ["ausgabe", "Despesa"],
    ["einnahme", "Receita"]
  ]);
  const fixVarValueMap = new Map<string, RuleFormData["fixVar"]>([
    ["fixo", "Fixo"],
    ["variável", "Variável"],
    ["variavel", "Variável"],
    [normalize(t(locale, rulesCopy.fieldVariationFixed)), "Fixo"],
    [normalize(t(locale, rulesCopy.fieldVariationVariable)), "Variável"],
    ["fixed", "Fixo"],
    ["variable", "Variável"],
    ["variabel", "Variável"]
  ]);
  const yesValues = new Set([
    "sim",
    "yes",
    "ja",
    "true",
    "1",
    normalize(t(locale, rulesCopy.yes))
  ]);
  const columnKeys = {
    name: [columnLabels.name, "Nome"],
    type: [columnLabels.type, "Tipo (Despesa/Receita)"],
    fixVar: [columnLabels.fixVar, "Fixo/Variável"],
    category1: [columnLabels.category1, "Categoria 1"],
    category2: [columnLabels.category2, "Categoria 2"],
    category3: [columnLabels.category3, "Categoria 3"],
    keywords: [columnLabels.keywords, "Palavras-chave"],
    priority: [columnLabels.priority, "Prioridade"],
    strict: [columnLabels.strict, "Regra Estrita"],
    system: [columnLabels.system, "Sistema"]
  };
  const getRowValue = (row: Record<string, any>, keys: string[]) => {
    const key = keys.find((k) => Object.prototype.hasOwnProperty.call(row, k));
    return key ? row[key] : undefined;
  };

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["rules"],
    queryFn: rulesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: rulesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      closeDialog();
      toast({ title: t(locale, rulesCopy.toastRuleCreated) });
      setStatusInfo({
        variant: "success",
        title: t(locale, rulesCopy.statusRuleCreated),
        description: t(locale, rulesCopy.statusRuleCreatedBody)
      });
    },
    onError: (error: any) => {
      toast({ title: t(locale, rulesCopy.toastCreateError), description: error.message, variant: "destructive" });
      setStatusInfo({
        variant: "error",
        title: t(locale, rulesCopy.statusRuleCreateFailed),
        description: error.message || t(locale, rulesCopy.statusRuleCreateFailedBody),
        payload: error?.details || null
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => rulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      closeDialog();
      toast({ title: t(locale, rulesCopy.toastRuleUpdated) });
      setStatusInfo({
        variant: "success",
        title: t(locale, rulesCopy.statusRuleUpdated),
        description: t(locale, rulesCopy.statusRuleUpdatedBody)
      });
    },
    onError: (error: any) => {
      setStatusInfo({
        variant: "error",
        title: t(locale, rulesCopy.statusRuleUpdateFailed),
        description: error.message || t(locale, rulesCopy.statusRuleUpdateFailedBody),
        payload: error?.details || null
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: rulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast({ title: t(locale, rulesCopy.toastRuleRemoved) });
      setStatusInfo({
        variant: "success",
        title: t(locale, rulesCopy.statusRuleRemoved),
        description: t(locale, rulesCopy.statusRuleRemovedBody)
      });
    },
    onError: (error: any) => {
      setStatusInfo({
        variant: "error",
        title: t(locale, rulesCopy.statusRuleRemoveFailed),
        description: error.message || t(locale, rulesCopy.statusRuleRemoveFailedBody),
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
        title: t(locale, rulesCopy.reapplyToastTitle),
        description: formatMessage(t(locale, rulesCopy.reapplyToastBody), {
          categorized: result.categorized,
          pending: result.stillPending
        })
      });
      setStatusInfo({
        variant: "success",
        title: t(locale, rulesCopy.statusReapplyDone),
        description: formatMessage(t(locale, rulesCopy.reapplyToastBody), {
          categorized: result.categorized,
          pending: result.stillPending
        }),
        payload: result
      });
    },
    onError: (error: any) => {
      setStatusInfo({
        variant: "error",
        title: t(locale, rulesCopy.statusReapplyFailed),
        description: error.message || t(locale, rulesCopy.statusReapplyFailedBody),
        payload: error?.details || null
      });
    }
  });

  const seedMutation = useMutation({
    mutationFn: rulesApi.seed,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast({ title: formatMessage(t(locale, rulesCopy.aiAddedToastTitle), { count: result.count }) });
      setStatusInfo({
        variant: "success",
        title: t(locale, rulesCopy.statusAiAdded),
        description: formatMessage(t(locale, rulesCopy.aiAddedToastBody), { count: result.count }),
        payload: result
      });
    },
    onError: (error: any) => {
      setStatusInfo({
        variant: "error",
        title: t(locale, rulesCopy.statusAiFailed),
        description: error.message || t(locale, rulesCopy.statusRuleCreateFailedBody),
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
      toast({ title: t(locale, rulesCopy.toastExportEmpty), variant: "destructive" });
      return;
    }

    const csvData = rules.map((rule: any) => ({
      [columnLabels.name]: rule.name,
      [columnLabels.type]: typeLabelMap[rule.type] || rule.type,
      [columnLabels.fixVar]: fixVarLabelMap[rule.fixVar] || rule.fixVar,
      [columnLabels.category1]: rule.category1,
      [columnLabels.category2]: rule.category2 || "",
      [columnLabels.category3]: rule.category3 || "",
      [columnLabels.keywords]: rule.keywords,
      [columnLabels.priority]: String(rule.priority ?? ""),
      [columnLabels.strict]: rule.strict ? t(locale, rulesCopy.yes) : t(locale, rulesCopy.no),
      [columnLabels.system]: rule.isSystem ? t(locale, rulesCopy.yes) : t(locale, rulesCopy.no)
    }));

    const headers = Object.values(columnLabels);
    const csvContent = toCsv(csvData, headers);
    const date = new Date().toISOString().split('T')[0];
    const filename = `ritualfin_rules_${date}.csv`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: formatMessage(t(locale, rulesCopy.exportSuccessTitle), { count: rules.length }),
      description: t(locale, rulesCopy.exportSuccessBody)
    });
  };

  const handleUploadExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = String(e.target?.result || "");
        const { headers, rows } = parseCsv(data);
        const jsonData = rows.map((row) =>
          headers.reduce<Record<string, string>>((acc, header, index) => {
            acc[header] = row[index] ?? "";
            return acc;
          }, {})
        );

        if (jsonData.length === 0) {
          toast({ title: t(locale, rulesCopy.toastFileEmpty), variant: "destructive" });
          setStatusInfo({
            variant: "error",
            title: t(locale, rulesCopy.statusImportFailed),
            description: t(locale, rulesCopy.importEmptyBody)
          });
          return;
        }

        // Validate and transform data
        const rulesToImport: any[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const rowNum = index + 2; // +2 because Excel is 1-indexed and has header row
          const nameValue = getRowValue(row, columnKeys.name);
          const keywordsValue = getRowValue(row, columnKeys.keywords);
          const typeRaw = getRowValue(row, columnKeys.type);
          const fixVarRaw = getRowValue(row, columnKeys.fixVar);
          const category1Value = getRowValue(row, columnKeys.category1);
          const category2Value = getRowValue(row, columnKeys.category2);
          const category3Value = getRowValue(row, columnKeys.category3);
          const priorityValue = getRowValue(row, columnKeys.priority);
          const strictValue = getRowValue(row, columnKeys.strict);
          const systemValue = getRowValue(row, columnKeys.system);

          // Validate required fields
          if (!nameValue) {
            errors.push(formatMessage(t(locale, rulesCopy.importRowNameError), { row: rowNum }));
            return;
          }
          if (!keywordsValue) {
            errors.push(formatMessage(t(locale, rulesCopy.importRowKeywordsError), { row: rowNum }));
            return;
          }
          const typeValue = typeValueMap.get(normalize(typeRaw));
          if (!typeValue) {
            errors.push(formatMessage(t(locale, rulesCopy.importRowTypeError), { row: rowNum }));
            return;
          }
          const fixVarValue = fixVarValueMap.get(normalize(fixVarRaw));
          if (!fixVarValue) {
            errors.push(formatMessage(t(locale, rulesCopy.importRowFixVarError), { row: rowNum }));
            return;
          }
          if (!category1Value) {
            errors.push(formatMessage(t(locale, rulesCopy.importRowCategoryError), { row: rowNum }));
            return;
          }

          // Skip system rules (don't allow importing/overwriting system rules)
          if (yesValues.has(normalize(systemValue))) {
            return;
          }

          rulesToImport.push({
            name: nameValue,
            keywords: keywordsValue,
            type: typeValue,
            fixVar: fixVarValue,
            category1: category1Value,
            category2: category2Value || "",
            category3: category3Value || "",
            priority: priorityValue || 500,
            strict: yesValues.has(normalize(strictValue))
          });
        });

        if (errors.length > 0) {
          toast({
            title: t(locale, rulesCopy.importErrorsTitle),
            description: errors.slice(0, 3).join('; '),
            variant: "destructive"
          });
          setStatusInfo({
            variant: "error",
            title: t(locale, rulesCopy.statusImportFailed),
            description: errors.slice(0, 3).join('; '),
            payload: { errors: errors.slice(0, 10) }
          });
          return;
        }

        if (rulesToImport.length === 0) {
          toast({ title: t(locale, rulesCopy.toastNoValidRules), variant: "destructive" });
          setStatusInfo({
            variant: "warning",
            title: t(locale, rulesCopy.statusImportIgnored),
            description: t(locale, rulesCopy.importNoValidBody)
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
          toast({ title: `${successCount} ${t(locale, rulesCopy.toastImportSuccess)}` });
          setStatusInfo({
            variant: "success",
            title: t(locale, rulesCopy.statusImportDone),
            description: formatMessage(t(locale, rulesCopy.importSuccessBody), { count: successCount })
          });
        } else {
          toast({
            title: t(locale, rulesCopy.importPartialTitle),
            description: formatMessage(t(locale, rulesCopy.importPartialBody), { success: successCount, fail: failCount })
          });
          setStatusInfo({
            variant: "warning",
            title: t(locale, rulesCopy.statusImportDoneErrors),
            description: formatMessage(t(locale, rulesCopy.importPartialBody), { success: successCount, fail: failCount }),
            payload: { successCount, failCount }
          });
        }

      } catch (error: any) {
        toast({
          title: t(locale, rulesCopy.importProcessErrorTitle),
          description: error.message,
          variant: "destructive"
        });
        setStatusInfo({
          variant: "error",
          title: t(locale, rulesCopy.statusFileProcessError),
          description: error.message || t(locale, rulesCopy.importProcessErrorBody),
          payload: error?.details || null
        });
      }
    };

    reader.readAsText(file);

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
      toast({ title: t(locale, rulesCopy.toastFillRequired), variant: "destructive" });
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
                {t(locale, rulesCopy.aiBadge)}
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
              {t(locale, rulesCopy.exportLabel)}
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
              accept=".csv"
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t(locale, rulesCopy.categoriesLabel)}
                  </p>
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
              placeholder={t(locale, rulesCopy.searchPlaceholder)}
              className="pl-9 bg-white border-0 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-rules"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-white border-0 shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t(locale, rulesCopy.filterCategoryPlaceholder)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t(locale, rulesCopy.filterAllCategories)}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {translateCategory(locale, cat)}
                </SelectItem>
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
              <h3 className="text-lg font-semibold mb-2">{t(locale, rulesCopy.emptyTitle)}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t(locale, rulesCopy.emptyBody)}
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => seedMutation.mutate()}
                  disabled={seedMutation.isPending}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {t(locale, rulesCopy.createDefault)}
                </Button>
                <Button className="gap-2" onClick={openNewDialog}>
                  <Plus className="h-4 w-4" />
                  {t(locale, rulesCopy.createManual)}
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
                              <Badge className="text-[10px] bg-primary/10 text-primary border-0">
                                {t(locale, rulesCopy.aiBadge)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {[translateCategory(locale, rule.category1), rule.category2, rule.category3]
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
                          {t(locale, rulesCopy.strictBadge)}
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
                {editingRule ? t(locale, rulesCopy.dialogEditTitle) : t(locale, rulesCopy.dialogNewTitle)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t(locale, rulesCopy.fieldNameLabel)}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t(locale, rulesCopy.fieldNamePlaceholder)}
                  className="bg-muted/30 border-0"
                  data-testid="input-rule-name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t(locale, rulesCopy.fieldCategory1Label)} <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.category1}
                  onValueChange={(v) => setFormData({ ...formData, category1: v as any })}
                >
                  <SelectTrigger className="bg-muted/30 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Mercado",
                      "Moradia",
                      "Transporte",
                      "Saúde",
                      "Lazer",
                      "Compras Online",
                      "Receitas",
                      "Interno",
                      "Outros"
                    ].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {translateCategory(locale, cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t(locale, rulesCopy.fieldCategory2Label)}
                  </Label>
                  <Input
                    value={formData.category2}
                    onChange={(e) => setFormData({ ...formData, category2: e.target.value })}
                    placeholder={t(locale, rulesCopy.fieldCategory2Placeholder)}
                    className="bg-muted/30 border-0"
                    data-testid="input-rule-category2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t(locale, rulesCopy.fieldCategory3Label)}
                  </Label>
                  <Input
                    value={formData.category3}
                    onChange={(e) => setFormData({ ...formData, category3: e.target.value })}
                    placeholder={t(locale, rulesCopy.fieldCategory3Placeholder)}
                    className="bg-muted/30 border-0"
                    data-testid="input-rule-category3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t(locale, rulesCopy.fieldKeywordsLabel)}
                </Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder={t(locale, rulesCopy.fieldKeywordsPlaceholder)}
                  className="bg-muted/30 border-0"
                  data-testid="input-rule-keywords"
                />
                <p className="text-xs text-muted-foreground">{t(locale, rulesCopy.fieldKeywordsHelper)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t(locale, rulesCopy.fieldTypeLabel)}</Label>
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
                      {t(locale, rulesCopy.fieldTypeExpense)}
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
                      {t(locale, rulesCopy.fieldTypeIncome)}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t(locale, rulesCopy.fieldVariationLabel)}</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.fixVar === "Fixo" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setFormData({ ...formData, fixVar: "Fixo" })}
                    >
                      {t(locale, rulesCopy.fieldVariationFixed)}
                    </Button>
                    <Button
                      type="button"
                      variant={formData.fixVar === "Variável" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setFormData({ ...formData, fixVar: "Variável" })}
                    >
                      {t(locale, rulesCopy.fieldVariationVariable)}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{t(locale, rulesCopy.strictTitle)}</p>
                  <p className="text-xs text-muted-foreground">{t(locale, rulesCopy.strictDescription)}</p>
                </div>
                <Switch
                  checked={formData.strict}
                  onCheckedChange={(v) => setFormData({ ...formData, strict: v })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                {t(locale, rulesCopy.cancel)}
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
                {editingRule ? t(locale, rulesCopy.save) : t(locale, rulesCopy.create)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
