import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, AlertTriangle, CheckCircle2, Loader2, Edit, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TransactionForm {
  type: string;
  fixVar: string;
  category1: string;
  excludeFromBudget: boolean;
}

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
  const conflictCount = items.filter((t: any) => t.hasConflict).length;

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
            Analise os itens ambiguos abaixo para garantir a precisao do seu orcamento mensal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Sem Categoria</p>
                  <p className="text-3xl font-bold mt-1">{uncategorizedCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Conflitos</p>
                  <p className="text-3xl font-bold mt-1">{conflictCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-rose-600" />
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
                    <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Categoria & Acoes</th>
                    <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Confirmar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {items.map((t: any) => {
                    const form = getFormData(t);
                    const isSelected = selectedIds.has(t.id);
                    
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
                          {t.amount?.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Sem Categoria
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            <Select 
                              value={form.category1} 
                              onValueChange={(v) => updateFormData(t.id, "category1", v)}
                            >
                              <SelectTrigger className="h-9 w-full max-w-[180px] bg-white">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mercado">Mercado</SelectItem>
                                <SelectItem value="Lazer">Lazer</SelectItem>
                                <SelectItem value="Transporte">Transporte</SelectItem>
                                <SelectItem value="Compras Online">Compras Online</SelectItem>
                                <SelectItem value="Moradia">Moradia</SelectItem>
                                <SelectItem value="Saude">Saude</SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                                <SelectItem value="Interno">Interno</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                                <Checkbox 
                                  checked={true}
                                  onCheckedChange={() => handleConfirmSingle(t, true)}
                                  className="h-3.5 w-3.5"
                                />
                                Criar regra "{t.suggestedKeyword}"
                              </label>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Button 
                            size="icon"
                            className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90"
                            disabled={confirmMutation.isPending}
                            onClick={() => handleConfirmSingle(t)}
                            data-testid={`btn-confirm-${t.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="px-5 py-3 bg-muted/20 text-sm text-muted-foreground border-t">
              Mostrando {items.length} de {items.length} itens pendentes
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
