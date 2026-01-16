"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_CONFIGS } from "@/lib/constants/categories";
import { CATEGORY1_VALUES } from "@/lib/constants/category1";
import { createCalendarEvent } from "@/lib/actions/calendar";
import { useRouter } from "next/navigation";
import { CategoryIcon } from "@/components/ui/category-icon";

interface NewEventDialogProps {
  onEventCreated?: () => void;
}

export function NewEventDialog({ onEventCreated }: NewEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category1: "",
    recurrence: "monthly",
    nextDueDate: new Date().toISOString().split('T')[0],
  });

  const categories = CATEGORY1_VALUES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.category1) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsCreating(true);

    try {
      const result = await createCalendarEvent({
        name: formData.name,
        amount: parseFloat(formData.amount),
        category1: formData.category1,
        recurrence: formData.recurrence,
        nextDueDate: formData.nextDueDate,
      });

      if (result.success) {
        toast.success("Evento criado com sucesso!", {
          description: `${formData.name} agendado para ${new Date(formData.nextDueDate).toLocaleDateString('pt-PT')}`
        });

        // Reset form
        setFormData({
          name: "",
          amount: "",
          category1: "",
          recurrence: "monthly",
          nextDueDate: new Date().toISOString().split('T')[0],
        });

        setOpen(false);
        router.refresh();

        if (onEventCreated) {
          onEventCreated();
        }
      } else {
        toast.error(result.error || "Erro ao criar evento");
      }

    } catch (error) {
      toast.error("Erro ao criar evento");
      console.error('[NewEventDialog]', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-14 px-8 bg-foreground text-background font-bold rounded-2xl shadow-xl shadow-foreground/5 gap-2 w-full md:w-auto">
          <Plus className="h-5 w-5" />
          Novo Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              Novo Evento Financeiro
            </DialogTitle>
            <DialogDescription>
              Adicione um compromisso recorrente ou vencimento ao seu calendário financeiro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold">
                Nome do Evento *
              </Label>
              <Input
                id="name"
                placeholder="Ex: Aluguel, Netflix, Conta de Luz..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12"
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-bold">
                Valor (€) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="h-12 font-mono"
                required
              />
            </div>

            {/* Category */}
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
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={cat} size="sm" />
                        <span>{cat}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Recurrence */}
              <div className="space-y-2">
                <Label htmlFor="recurrence" className="text-sm font-bold">
                  Recorrência
                </Label>
                <Select 
                  value={formData.recurrence} 
                  onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não recorrente</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-bold">
                  Próximo Vencimento
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
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
              disabled={isCreating}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A criar...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Evento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
