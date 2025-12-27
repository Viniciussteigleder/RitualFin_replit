import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, AlertTriangle, CheckCircle2, Loader2, Edit, AlertCircle, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TransactionForm {
  type: string;
  fixVar: string;
  category1: string;
  excludeFromBudget: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "bg-green-500",
  "Lazer": "bg-purple-500",
  "Transporte": "bg-blue-500",
  "Moradia": "bg-orange-500",
  "Saúde": "bg-red-500",
  "Compras Online": "bg-pink-500",
  "Receitas": "bg-emerald-500",
  "Outros": "bg-gray-400",
  "Interno": "bg-slate-600"
};

export default function ConfirmPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, TransactionForm>>({});

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["confirm-queue"],
    queryFn: transactionsApi.confirmQueue,
  });

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

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((t: any) => t.id)));
  };

  const uncategorizedCount = items.filter((t: any) => !t.category1).length;
  const preSuggestedCount = items.filter((t: any) => t.category1 && t.confidence).length;
  const highConfidenceCount = items.filter((t: any) => (t.confidence || 0) >= 80).length;

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
        <div>
          <div className="text-sm text-muted-foreground mb-2">
            Dashboard &gt; <span className="text-foreground">Confirmar Transacoes</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Pedidos de Confirmacao</h1>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-sm font-bold">
              {items.length}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            A IA pre-analisou as transacoes. Revise as sugestoes e confirme.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Total Pendente</p>
                  <p className="text-3xl font-bold mt-1">{items.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Edit className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Pre-Sugeridos</p>
                  <p className="text-3xl font-bold mt-1 text-primary">{preSuggestedCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Alta Confianca</p>
                  <p className="text-3xl font-bold mt-1 text-emerald-600">{highConfidenceCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Sem Categoria</p>
                  <p className="text-3xl font-bold mt-1">{uncategorizedCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {items.length > 0 && (
          <Card className="bg-white border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left w-12">
                      <Checkbox 
                        checked={selectedIds.size === items.length && items.length > 0}
                        onCheckedChange={toggleSelectAll}
                        data-testid="checkbox-select-all"
                      />
                    </th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Data</th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Descricao</th>
                    <th className="px-5 py-3 text-right font-medium text-xs uppercase tracking-wide">Valor</th>
                    <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Confianca</th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Categoria Sugerida</th>
                    <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {items.map((t: any) => {
                    const form = getFormData(t);
                    const isSelected = selectedIds.has(t.id);
                    const confidence = t.confidence || 0;
                    const hasSuggestion = !!t.category1;
                    
                    return (
                      <tr 
                        key={t.id} 
                        className={cn("hover:bg-muted/20", isSelected && "bg-primary/5")}
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
                          {format(new Date(t.paymentDate), "dd/MM/yyyy")}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold">{t.descRaw?.split(" -- ")[0]}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{t.accountSource}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right font-medium whitespace-nowrap">
                          <span className={t.amount > 0 ? "text-emerald-600" : ""}>
                            {t.amount?.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <Progress 
                              value={confidence} 
                              className={cn(
                                "h-2 w-16",
                                confidence >= 80 ? "[&>div]:bg-emerald-500" : 
                                confidence >= 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-rose-500"
                              )}
                            />
                            <span className={cn(
                              "text-xs font-medium",
                              confidence >= 80 ? "text-emerald-600" : 
                              confidence >= 50 ? "text-amber-600" : "text-rose-600"
                            )}>
                              {confidence}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            {hasSuggestion ? (
                              <div className="flex items-center gap-2">
                                <div className={cn("w-2.5 h-2.5 rounded-full", CATEGORY_COLORS[t.category1] || "bg-gray-400")} />
                                <Select 
                                  value={form.category1} 
                                  onValueChange={(v) => updateFormData(t.id, "category1", v)}
                                >
                                  <SelectTrigger className="h-8 w-[160px] bg-white border-primary/30">
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
                                  <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">
                                    IA
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <Select 
                                value={form.category1} 
                                onValueChange={(v) => updateFormData(t.id, "category1", v)}
                              >
                                <SelectTrigger className="h-8 w-[160px] bg-white">
                                  <SelectValue placeholder="Selecione..." />
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
                            )}
                            {t.suggestedKeyword && (
                              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                                <Checkbox 
                                  checked={true}
                                  onCheckedChange={() => handleConfirmSingle(t, true)}
                                  className="h-3.5 w-3.5"
                                />
                                Criar regra "{t.suggestedKeyword}"
                              </label>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Button 
                            size="sm"
                            className={cn(
                              "h-8 gap-1",
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
            
            <div className="px-5 py-3 bg-muted/20 text-sm text-muted-foreground border-t">
              Mostrando {items.length} itens pendentes de revisao
            </div>
          </Card>
        )}

        {items.length === 0 && (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="text-center py-16">
              <CheckCircle2 className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">Tudo limpo!</h3>
              <p className="text-sm text-muted-foreground/60">Nenhuma transacao pendente de revisao.</p>
            </CardContent>
          </Card>
        )}

        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl shadow-2xl px-6 py-4 flex items-center gap-6 z-50">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
                {selectedIds.size}
              </span>
              Selecionados
            </span>
            <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
              <Edit className="h-4 w-4" />
              Editar em massa
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={handleConfirmSelected}
              disabled={confirmMutation.isPending}
              data-testid="btn-confirm-selected"
            >
              <Check className="h-4 w-4" />
              Confirmar ({selectedIds.size})
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
