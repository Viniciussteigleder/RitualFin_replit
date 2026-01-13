"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Target, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createBudget, updateBudget, deleteBudget } from "@/lib/actions/budgets";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Alimentação",
  "Mercados",
  "Lazer / Esporte",
  "Compras",
  "Transporte",
  "Moradia",
  "Saúde",
  "Trabalho",
  "Financiamento",
  "Outros",
];

interface BudgetDialogProps {
  mode?: "create" | "edit";
  budget?: {
    id: string;
    category1: string;
    amount: number;
    month: string;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function BudgetDialog({ mode = "create", budget, trigger, onSuccess }: BudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [formData, setFormData] = useState({
    category1: budget?.category1 || "",
    amount: budget?.amount?.toString() || "",
    month: budget?.month || currentMonth,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category1 || !formData.amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "edit" && budget?.id) {
          const result = await updateBudget(budget.id, parseFloat(formData.amount));
          if (result.success) {
            toast.success("Orçamento atualizado!");
            setOpen(false);
            router.refresh();
            onSuccess?.();
          } else {
            toast.error(result.error || "Erro ao atualizar");
          }
        } else {
          const result = await createBudget({
            category1: formData.category1,
            amount: parseFloat(formData.amount),
            month: formData.month,
          });

          if (result.success) {
            toast.success("Orçamento criado com sucesso!");
            setFormData({ category1: "", amount: "", month: currentMonth });
            setOpen(false);
            router.refresh();
            onSuccess?.();
          } else {
            toast.error(result.error || "Erro ao criar orçamento");
          }
        }
      } catch (error) {
        toast.error("Erro inesperado");
        console.error(error);
      }
    });
  };

  const handleDelete = async () => {
    if (!budget?.id) return;

    setIsDeleting(true);
    try {
      const result = await deleteBudget(budget.id);
      if (result.success) {
        toast.success("Orçamento excluído");
        setOpen(false);
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao excluir");
      }
    } catch (error) {
      toast.error("Erro ao excluir");
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultTrigger = mode === "create" ? (
    <Button className="h-14 px-8 bg-foreground text-background hover:scale-105 transition-all rounded-2xl font-bold shadow-xl shadow-foreground/5 gap-2">
      <PlusCircle className="h-5 w-5" />
      Novo Orçamento
    </Button>
  ) : (
    <Button variant="secondary" className="h-14 px-8 rounded-2xl bg-secondary/50 border-none hover:bg-secondary font-bold text-sm gap-2">
      <Pencil className="h-4 w-4" />
      Ajustar
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Target className="h-6 w-6 text-emerald-500" />
              </div>
              {mode === "create" ? "Novo Orçamento" : "Editar Orçamento"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Defina um limite de gastos para uma categoria."
                : "Ajuste o valor do orçamento."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            {mode === "create" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-bold">
                    Categoria *
                  </Label>
                  <Select
                    value={formData.category1}
                    onValueChange={(value) => setFormData({ ...formData, category1: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month" className="text-sm font-bold">
                    Mês de Referência
                  </Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="h-12"
                  />
                </div>
              </>
            )}

            {mode === "edit" && (
              <div className="p-4 bg-secondary/50 rounded-xl">
                <p className="text-sm font-bold text-muted-foreground">Categoria</p>
                <p className="text-lg font-bold">{budget?.category1}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-bold">
                Limite Mensal (€) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="h-12 font-mono text-lg"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-3 flex-col sm:flex-row">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isPending}
                className="rounded-xl w-full sm:w-auto"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Excluir
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : mode === "create" ? (
                "Criar Orçamento"
              ) : (
                "Guardar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
