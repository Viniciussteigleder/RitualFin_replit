import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, CheckCheck, AlertTriangle, CheckCircle2, Loader2, BookmarkPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
      setSelectedIds(new Set());
      
      let message = `${result.count} transação(ões) confirmada(s)`;
      if (result.ruleCreated) {
        message += " e regra criada";
      }
      toast({ title: message });
    },
  });

  const getFormData = (t: any): TransactionForm => {
    return formData[t.id] || {
      type: t.type || "Despesa",
      fixVar: t.fixVar || "Variável",
      category1: t.category1 || "Outros",
      excludeFromBudget: t.excludeFromBudget || false
    };
  };

  const updateFormData = (id: string, field: keyof TransactionForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [id]: {
        ...getFormData({ id, ...prev[id] }),
        [field]: value
      }
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

  const handleConfirmSelected = (createRule = false) => {
    if (selectedIds.size === 0) return;
    
    const ids = Array.from(selectedIds);
    const firstItem = items.find((t: any) => t.id === ids[0]);
    const data = getFormData(firstItem || {});
    
    confirmMutation.mutate({
      ids,
      data,
      createRule,
      keyword: createRule && firstItem ? firstItem.suggestedKeyword : undefined
    });
  };

  const handleConfirmAll = () => {
    const ids = items.map((t: any) => t.id);
    confirmMutation.mutate({ ids, data: {} });
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((t: any) => t.id)));
    }
  };

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Fila de Confirmação</h1>
            <p className="text-muted-foreground mt-1">
              Resolva exceções e treine o sistema.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              disabled={items.length === 0 || confirmMutation.isPending}
              onClick={handleConfirmAll}
              data-testid="btn-confirm-all"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Confirmar Todos ({items.length})
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <span className="text-sm font-medium">{selectedIds.size} selecionado(s)</span>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleConfirmSelected(true)}
              disabled={confirmMutation.isPending}
              data-testid="btn-confirm-selected-with-rule"
            >
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Confirmar + Criar Regra
            </Button>
            <Button
              size="sm"
              onClick={() => handleConfirmSelected(false)}
              disabled={confirmMutation.isPending}
              data-testid="btn-confirm-selected"
            >
              <Check className="mr-2 h-4 w-4" />
              Confirmar Selecionados
            </Button>
          </div>
        )}

        {/* Select All */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 py-2 border-b border-border/60">
            <Checkbox 
              checked={selectedIds.size === items.length && items.length > 0}
              onCheckedChange={toggleSelectAll}
              data-testid="checkbox-select-all"
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.size === items.length ? "Desmarcar todos" : "Selecionar todos"}
            </span>
            <div className="h-4 w-px bg-border ml-2" />
            <span className="text-sm text-muted-foreground">{items.length} itens pendentes</span>
          </div>
        )}

        {/* The Queue */}
        <div className="space-y-4">
          {items.map((t: any) => {
            const form = getFormData(t);
            const isSelected = selectedIds.has(t.id);
            
            return (
              <Card 
                key={t.id} 
                className={cn(
                  "overflow-hidden border-l-4",
                  isSelected ? "border-l-primary bg-primary/5" : "border-l-amber-400"
                )} 
                data-testid={`card-confirm-${t.id}`}
              >
                <div className="flex flex-col md:flex-row">
                  
                  {/* Left: Transaction Details */}
                  <div className="flex-1 p-4 md:p-5 flex gap-4">
                    <div className="pt-1">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(t.id)}
                        data-testid={`checkbox-${t.id}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-base">{t.descRaw}</h3>
                        <span className={cn(
                          "font-mono font-medium md:hidden",
                          t.amount > 0 ? "text-emerald-600" : "text-slate-900"
                        )}>
                          {t.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="font-mono text-xs">{format(new Date(t.paymentDate), "dd.MM.yyyy")}</span>
                        <span>•</span>
                        <span className={cn(
                          "font-mono font-medium hidden md:inline",
                          t.amount > 0 ? "text-emerald-600" : "text-slate-900"
                        )}>
                          {t.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Sem Regra
                        </Badge>
                        {t.suggestedKeyword && (
                          <Badge variant="outline" className="text-xs">
                            Sugestão: {t.suggestedKeyword}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="bg-muted/20 p-4 md:p-5 md:w-[450px] border-t md:border-t-0 md:border-l border-border/50 flex flex-col gap-4">
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Tipo</Label>
                        <Select 
                          value={form.type} 
                          onValueChange={(v) => updateFormData(t.id, 'type', v)}
                        >
                          <SelectTrigger className="h-8 text-sm bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Despesa">Despesa</SelectItem>
                            <SelectItem value="Receita">Receita</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Fixo/Var</Label>
                        <Select 
                          value={form.fixVar} 
                          onValueChange={(v) => updateFormData(t.id, 'fixVar', v)}
                        >
                          <SelectTrigger className="h-8 text-sm bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fixo">Fixo</SelectItem>
                            <SelectItem value="Variável">Variável</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Categoria</Label>
                        <Select 
                          value={form.category1} 
                          onValueChange={(v) => updateFormData(t.id, 'category1', v)}
                        >
                          <SelectTrigger className="h-8 text-sm bg-white">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mercado">Mercado</SelectItem>
                            <SelectItem value="Lazer">Lazer</SelectItem>
                            <SelectItem value="Transporte">Transporte</SelectItem>
                            <SelectItem value="Compras Online">Compras Online</SelectItem>
                            <SelectItem value="Moradia">Moradia</SelectItem>
                            <SelectItem value="Saúde">Saúde</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                            <SelectItem value="Interno">Interno</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id={`budget-${t.id}`} 
                          checked={!form.excludeFromBudget}
                          onCheckedChange={(checked) => updateFormData(t.id, 'excludeFromBudget', !checked)}
                        />
                        <Label htmlFor={`budget-${t.id}`} className="text-xs text-muted-foreground">
                          No Orçamento
                        </Label>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={confirmMutation.isPending}
                          onClick={() => handleConfirmSingle(t, true)}
                          data-testid={`btn-confirm-with-rule-${t.id}`}
                        >
                          <BookmarkPlus className="mr-1 h-3 w-3" />
                          + Regra
                        </Button>
                        <Button 
                          size="sm"
                          disabled={confirmMutation.isPending}
                          onClick={() => handleConfirmSingle(t, false)}
                          data-testid={`btn-confirm-${t.id}`}
                        >
                          <Check className="mr-2 h-3 w-3" />
                          Confirmar
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              </Card>
            );
          })}
          
          {items.length === 0 && (
            <div className="text-center py-20 bg-muted/5 rounded-xl border border-dashed">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">Tudo limpo!</h3>
              <p className="text-sm text-muted-foreground/60">Nenhuma transação pendente de revisão.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
