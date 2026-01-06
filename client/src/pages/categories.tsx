/**
 * Categories Management
 * Allows viewing and organizing category hierarchy (N1/N2/N3).
 */

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Edit2, Plus, Trash2, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_OPTIONS = [
  "Receitas",
  "Moradia",
  "Mercado",
  "Compras Online",
  "Transporte",
  "Saúde",
  "Lazer",
  "Viagem",
  "Roupas",
  "Tecnologia",
  "Alimentação",
  "Energia",
  "Internet",
  "Educação",
  "Presentes",
  "Streaming",
  "Academia",
  "Investimentos",
  "Outros",
  "Interno"
];

interface CategoryEntry {
  id: string;
  category1: string;
  category2: string;
  category3?: string | null;
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryEntry | null>(null);
  const [formData, setFormData] = useState({
    category1: "Outros",
    category2: "",
    category3: ""
  });

  const { data: categories = [], isLoading } = useQuery<CategoryEntry[]>({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Categoria criada" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ title: "Categorias indisponíveis", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Categoria atualizada" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ title: "Categorias indisponíveis", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Categoria removida" });
    },
    onError: (error: any) => {
      toast({ title: "Categorias indisponíveis", description: error.message, variant: "destructive" });
    }
  });

  const grouped = useMemo(() => {
    const map: Record<string, Record<string, { level2?: CategoryEntry; level3: CategoryEntry[] }>> = {};
    categories.forEach((item) => {
      if (!map[item.category1]) map[item.category1] = {};
      if (!map[item.category1][item.category2]) {
        map[item.category1][item.category2] = { level2: undefined, level3: [] };
      }
      if (item.category3) {
        map[item.category1][item.category2].level3.push(item);
      } else {
        map[item.category1][item.category2].level2 = item;
      }
    });
    return map;
  }, [categories]);

  const openNewDialog = () => {
    setEditing(null);
    setFormData({ category1: "Outros", category2: "", category3: "" });
    setIsOpen(true);
  };

  const openEditDialog = (entry: CategoryEntry) => {
    setEditing(entry);
    setFormData({
      category1: entry.category1,
      category2: entry.category2,
      category3: entry.category3 || ""
    });
    setIsOpen(true);
  };

  const openAddLevel3 = (category1: string, category2: string) => {
    setEditing(null);
    setFormData({ category1, category2, category3: "" });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setEditing(null);
    setFormData({ category1: "Outros", category2: "", category3: "" });
  };

  const handleSubmit = () => {
    if (!formData.category2.trim()) {
      toast({ title: "Categoria 2 é obrigatória", variant: "destructive" });
      return;
    }

    const payload = {
      category1: formData.category1,
      category2: formData.category2.trim(),
      category3: formData.category3.trim() || null
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
      return;
    }
    createMutation.mutate(payload);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Categorias</h1>
            <p className="text-muted-foreground text-sm md:text-base">Organize a hierarquia N1 → N2 → N3</p>
          </div>
          <Button variant="outline" onClick={openNewDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma categoria cadastrada. Comece criando sua primeira hierarquia.
              </div>
            ) : (
              Object.entries(grouped).map(([level1Name, level2Map]) => (
                <div key={level1Name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary">N1</Badge>
                      <span className="font-semibold">{level1Name}</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3 pl-4">
                    {Object.entries(level2Map).map(([level2Name, group]) => (
                      <div key={level2Name} className="border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">N2</Badge>
                            <span className="font-medium">{level2Name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {group.level2 && (
                              <Button size="sm" variant="ghost" onClick={() => openEditDialog(group.level2!)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openAddLevel3(level1Name, level2Name)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            {group.level2 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteMutation.mutate(group.level2!.id)}
                              >
                                <Trash2 className="h-4 w-4 text-rose-600" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 pl-6">
                          {group.level3.map((level3) => (
                            <Badge key={level3.id} variant="secondary" className="flex items-center gap-1">
                              N3: {level3.category3}
                              <button
                                type="button"
                                className="ml-1 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => openEditDialog(level3)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                className="ml-1 text-xs text-rose-600 hover:text-rose-700"
                                onClick={() => deleteMutation.mutate(level3.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria (Nível 1)</Label>
                <Select
                  value={formData.category1}
                  onValueChange={(value) => setFormData({ ...formData, category1: value })}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Categoria (Nível 2)</Label>
                <Input
                  value={formData.category2}
                  onChange={(e) => setFormData({ ...formData, category2: e.target.value })}
                  placeholder="Ex: Supermercado"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria (Nível 3)</Label>
                <Input
                  value={formData.category3}
                  onChange={(e) => setFormData({ ...formData, category3: e.target.value })}
                  placeholder="Ex: LIDL (opcional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button onClick={handleSubmit}>
                {editing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
