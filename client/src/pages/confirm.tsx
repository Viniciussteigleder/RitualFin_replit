import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertTriangle, CheckCircle2, Loader2, Edit, AlertCircle, Sparkles, TrendingUp, Filter, ChevronDown, Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi, accountsApi, settingsApi } from "@/lib/api";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AccountBadge } from "@/components/account-badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransactionForm {
  type: string;
  fixVar: string;
  category1: string;
  excludeFromBudget: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Lazer": "#a855f7",
  "Transporte": "#3b82f6",
  "Moradia": "#f97316",
  "Saúde": "#ef4444",
  "Compras Online": "#ec4899",
  "Receitas": "#10b981",
  "Outros": "#6b7280",
  "Interno": "#475569"
};

export default function ConfirmPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, TransactionForm>>({});
  const [activeTab, setActiveTab] = useState("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["confirm-queue"],
    queryFn: transactionsApi.confirmQueue,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
  });

  const accountsById = useMemo(() => {
    return accounts.reduce((map: any, account: any) => {
      map[account.id] = account;
      return map;
    }, {});
  }, [accounts]);

  const confirmMutation = useMutation({
    mutationFn: ({ ids, data, createRule, keyword }: { 
      ids: string[]; 
      data: any; 
      createRule?: boolean;
      keyword?: string;
    }) => transactionsApi.confirm(ids, { ...data, createRule, keyword }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["confirm-queue"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      setSelectedIds(new Set());
      toast({ title: `${result.count} transacao(oes) confirmada(s)` });
    },
  });

  const getFormData = (t: any): TransactionForm => {
    return formData[t.id] || {
      type: t.type || "Despesa",
      fixVar: t.fixVar || "Variavel",
      category1: t.category1 || "Outros",
      excludeFromBudget: t.excludeFromBudget || false
    };
  };

  const updateFormData = (id: string, field: keyof TransactionForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [id]: { ...getFormData({ id, ...prev[id] }), [field]: value }
    }));
  };

  const handleConfirmSingle = (t: any, createRule = false) => {
    const data = getFormData(t);
    confirmMutation.mutate({
      ids: [t.id],
      data,
      createRule,
      keyword: createRule ? t.suggestedKeyword : undefined
    });
  };

  const handleConfirmSelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    confirmMutation.mutate({ ids, data: {} });
  };

  const handleConfirmAllHighConfidence = () => {
    const highConfidenceIds = items
      .filter((t: any) => (t.confidence || 0) >= 80)
      .map((t: any) => t.id);
    if (highConfidenceIds.length === 0) return;
    confirmMutation.mutate({ ids: highConfidenceIds, data: {} });
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    const filteredItems = getFilteredItems();
    if (selectedIds.size === filteredItems.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredItems.map((t: any) => t.id)));
  };

  const getFilteredItems = () => {
    if (activeTab === "high") return items.filter((t: any) => (t.confidence || 0) >= 80);
    if (activeTab === "medium") return items.filter((t: any) => (t.confidence || 0) >= 50 && (t.confidence || 0) < 80);
    if (activeTab === "low") return items.filter((t: any) => (t.confidence || 0) < 50);
    return items;
  };

  const filteredItems = getFilteredItems();
  const highConfidenceCount = items.filter((t: any) => (t.confidence || 0) >= 80).length;
  const mediumConfidenceCount = items.filter((t: any) => (t.confidence || 0) >= 50 && (t.confidence || 0) < 80).length;
  const lowConfidenceCount = items.filter((t: any) => (t.confidence || 0) < 50).length;

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">Fila de Confirmacao</h1>
              {items.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
                  {items.length}
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              A IA pre-analisou cada transacao. Revise as sugestoes e confirme.
            </p>
          </div>
          
          {highConfidenceCount > 0 && (
            <Button 
              onClick={handleConfirmAllHighConfidence}
              disabled={confirmMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Zap className="h-4 w-4" />
              Aceitar {highConfidenceCount} com alta confianca
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Pendente</p>
                  <p className="text-3xl font-bold mt-1">{items.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Edit className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("high")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Alta Confianca</p>
                  <p className="text-3xl font-bold mt-1 text-emerald-600">{highConfidenceCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("medium")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Media Confianca</p>
                  <p className="text-3xl font-bold mt-1 text-amber-600">{mediumConfidenceCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("low")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sem Categoria</p>
                  <p className="text-3xl font-bold mt-1 text-rose-600">{lowConfidenceCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border shadow-sm p-1 h-auto">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2"
            >
              Todas ({items.length})
            </TabsTrigger>
            <TabsTrigger 
              value="high"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white px-4 py-2"
            >
              Alta ({highConfidenceCount})
            </TabsTrigger>
            <TabsTrigger 
              value="medium"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white px-4 py-2"
            >
              Media ({mediumConfidenceCount})
            </TabsTrigger>
            <TabsTrigger 
              value="low"
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white px-4 py-2"
            >
              Baixa ({lowConfidenceCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredItems.length > 0 ? (
          <Card className="bg-white border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left w-12">
                      <Checkbox 
                        checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                        onCheckedChange={toggleSelectAll}
                        data-testid="checkbox-select-all"
                      />
                    </th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Data</th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Conta</th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Descricao</th>
                    <th className="px-5 py-3 text-right font-medium text-xs uppercase tracking-wide">Valor</th>
                    <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Confianca</th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Categoria</th>
                    <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Acao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredItems.map((t: any) => {
                    const form = getFormData(t);
                    const isSelected = selectedIds.has(t.id);
                    const confidence = t.confidence || 0;
                    const hasSuggestion = !!t.category1;
                    const categoryColor = CATEGORY_COLORS[form.category1] || "#6b7280";
                    
                    return (
                      <tr 
                        key={t.id} 
                        className={cn(
                          "hover:bg-muted/20 transition-colors",
                          isSelected && "bg-primary/5"
                        )}
                        data-testid={`row-confirm-${t.id}`}
                      >
                        <td className="px-5 py-4">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(t.id)}
                            data-testid={`checkbox-${t.id}`}
                          />
                        </td>
                        <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                          {format(new Date(t.paymentDate), "dd/MM/yy")}
                        </td>
                        <td className="px-5 py-4">
                          <AccountBadge account={accountsById[t.accountId]} size="sm" />
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium truncate max-w-[250px]">{t.merchantAlias || t.descRaw?.split(" -- ")[0]}</p>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold whitespace-nowrap">
                          <span className={t.amount > 0 ? "text-emerald-600" : ""}>
                            {t.amount?.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col items-center gap-1.5">
                            <Progress
                              value={confidence}
                              className={cn(
                                "h-1.5 w-14",
                                confidence >= 80 ? "[&>div]:bg-emerald-500" :
                                confidence >= 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-rose-500"
                              )}
                            />
                            <span className={cn(
                              "text-xs font-semibold",
                              confidence >= 80 ? "text-emerald-600" :
                              confidence >= 50 ? "text-amber-600" : "text-rose-600"
                            )}>
                              {confidence}%
                            </span>
                            {!settings?.autoConfirmHighConfidence && confidence >= (settings?.confidenceThreshold || 80) && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-emerald-500/30 text-emerald-700 bg-emerald-50/50">
                                <Zap className="h-2.5 w-2.5 mr-0.5" />
                                Auto
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: categoryColor }}
                            />
                            <Select 
                              value={form.category1} 
                              onValueChange={(v) => updateFormData(t.id, "category1", v)}
                            >
                              <SelectTrigger className={cn(
                                "h-8 w-[140px] text-xs",
                                hasSuggestion && confidence >= 80 && "border-emerald-200 bg-emerald-50/50"
                              )}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mercado">Mercado</SelectItem>
                                <SelectItem value="Lazer">Lazer</SelectItem>
                                <SelectItem value="Transporte">Transporte</SelectItem>
                                <SelectItem value="Compras Online">Compras Online</SelectItem>
                                <SelectItem value="Moradia">Moradia</SelectItem>
                                <SelectItem value="Saúde">Saude</SelectItem>
                                <SelectItem value="Receitas">Receitas</SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                                <SelectItem value="Interno">Interno</SelectItem>
                              </SelectContent>
                            </Select>
                            {confidence >= 80 && (
                              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0">
                                IA
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Button 
                            size="sm"
                            className={cn(
                              "h-8 gap-1.5 text-xs",
                              confidence >= 80 
                                ? "bg-emerald-500 hover:bg-emerald-600" 
                                : "bg-primary hover:bg-primary/90"
                            )}
                            disabled={confirmMutation.isPending}
                            onClick={() => handleConfirmSingle(t)}
                            data-testid={`btn-confirm-${t.id}`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            {confidence >= 80 ? "Aceitar" : "Confirmar"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="px-5 py-3 bg-muted/20 text-sm text-muted-foreground border-t flex items-center justify-between">
              <span>Mostrando {filteredItems.length} de {items.length} itens</span>
              {selectedIds.size > 0 && (
                <span className="font-medium text-primary">{selectedIds.size} selecionado(s)</span>
              )}
            </div>
          </Card>
        ) : (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tudo limpo!</h3>
              <p className="text-muted-foreground text-sm">
                {activeTab === "all" 
                  ? "Nenhuma transacao pendente de revisao."
                  : `Nenhuma transacao com ${activeTab === "high" ? "alta" : activeTab === "medium" ? "media" : "baixa"} confianca.`
                }
              </p>
            </CardContent>
          </Card>
        )}

        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl shadow-2xl px-6 py-4 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4">
            <span className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
                {selectedIds.size}
              </span>
              selecionado(s)
            </span>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={handleConfirmSelected}
              disabled={confirmMutation.isPending}
              data-testid="btn-confirm-selected"
            >
              <Check className="h-4 w-4" />
              Confirmar Selecionados
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
