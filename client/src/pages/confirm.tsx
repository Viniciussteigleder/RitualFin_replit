import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, CheckCheck, Filter, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ConfirmPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["confirm-queue"],
    queryFn: transactionsApi.confirmQueue,
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      transactionsApi.update(id, { ...data, needsReview: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["confirm-queue"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Transação confirmada" });
    },
  });

  const bulkConfirmMutation = useMutation({
    mutationFn: (ids: string[]) => transactionsApi.confirm(ids, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["confirm-queue"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setSelectedIds([]);
      toast({ title: "Transações confirmadas" });
    },
  });

  const handleConfirm = (t: any) => {
    confirmMutation.mutate({
      id: t.id,
      data: {
        type: t.type || "Despesa",
        category1: t.category1 || "Outros",
      },
    });
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
              disabled={items.length === 0 || bulkConfirmMutation.isPending}
              onClick={() => bulkConfirmMutation.mutate(items.map((t: any) => t.id))}
              data-testid="btn-confirm-all"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Confirmar Todos ({items.length})
            </Button>
          </div>
        </div>

        {/* Filters / Batch Actions Bar */}
        <div className="flex items-center gap-4 py-2 border-b border-border/60">
           <Button variant="ghost" size="sm" className="text-muted-foreground">
             <Filter className="mr-2 h-4 w-4" />
             Filtrar: Todos
           </Button>
           <div className="h-4 w-px bg-border" />
           <span className="text-sm text-muted-foreground">{items.length} itens pendentes</span>
        </div>

        {/* The Queue */}
        <div className="space-y-4">
          {items.map((t: any) => (
            <Card key={t.id} className="overflow-hidden border-l-4 border-l-amber-400" data-testid={`card-confirm-${t.id}`}>
              <div className="flex flex-col md:flex-row">
                
                {/* Left: Transaction Details */}
                <div className="flex-1 p-4 md:p-5 flex flex-col justify-center gap-1">
                  <div className="flex items-start justify-between gap-4">
                     <h3 className="font-semibold text-base">{t.descRaw}</h3>
                     <span className="font-mono font-medium text-slate-900 md:hidden">
                       {t.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })}
                     </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="font-mono text-xs">{format(new Date(t.paymentDate), "dd.MM.yyyy")}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{t.descNorm}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                     <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                       <AlertTriangle className="mr-1 h-3 w-3" />
                       Sem Regra
                     </Badge>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="bg-muted/20 p-4 md:p-5 md:w-[450px] border-t md:border-t-0 md:border-l border-border/50 flex flex-col gap-4">
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Categoria</Label>
                      <Select defaultValue={t.category1 || "Outros"}>
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
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Tipo</Label>
                       <Select defaultValue={t.type || "Despesa"}>
                        <SelectTrigger className="h-8 text-sm bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Despesa">Despesa</SelectItem>
                          <SelectItem value="Receita">Receita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <Switch id={`budget-${t.id}`} checked={!t.excludeFromBudget} />
                      <Label htmlFor={`budget-${t.id}`} className="text-xs text-muted-foreground">
                        No Orçamento
                      </Label>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-auto"
                      disabled={confirmMutation.isPending}
                      onClick={() => handleConfirm(t)}
                      data-testid={`btn-confirm-${t.id}`}
                    >
                      <Check className="mr-2 h-3 w-3" />
                      Confirmar
                    </Button>
                  </div>

                </div>
              </div>
            </Card>
          ))}
          
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
