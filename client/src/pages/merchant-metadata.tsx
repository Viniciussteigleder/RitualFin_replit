import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Edit2, Trash2, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { merchantMetadataApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MerchantMetadataForm {
  pattern: string;
  friendlyName: string;
  icon: string;
  color: string;
}

const EMPTY_FORM: MerchantMetadataForm = {
  pattern: "",
  friendlyName: "",
  icon: "shopping-cart",
  color: "#6366f1",
};

export default function MerchantMetadataPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState<MerchantMetadataForm>(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const { data: metadata = [], isLoading } = useQuery({
    queryKey: ["merchant-metadata"],
    queryFn: merchantMetadataApi.list,
  });

  const createMutation = useMutation({
    mutationFn: merchantMetadataApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-metadata"] });
      setIsOpen(false);
      setFormData(EMPTY_FORM);
      toast({ title: "Merchant criado" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => merchantMetadataApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-metadata"] });
      setIsOpen(false);
      setEditing(null);
      setFormData(EMPTY_FORM);
      toast({ title: "Merchant atualizado" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => merchantMetadataApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-metadata"] });
      toast({ title: "Merchant removido" });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setIsOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setFormData({
      pattern: item.pattern,
      friendlyName: item.friendlyName,
      icon: item.icon,
      color: item.color || "#6366f1",
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    const payload = {
      pattern: formData.pattern.trim().toUpperCase(),
      friendlyName: formData.friendlyName.trim(),
      icon: formData.icon.trim(),
      color: formData.color,
    };

    if (!payload.pattern || !payload.friendlyName || !payload.icon) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filtered = metadata.filter((m: any) => {
    const query = search.toLowerCase();
    return (
      query === "" ||
      m.pattern.toLowerCase().includes(query) ||
      m.friendlyName.toLowerCase().includes(query)
    );
  });

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Merchant Metadata</h1>
            <p className="text-muted-foreground">Personalize ícones e cores de merchants</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Merchant
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por padrão ou nome..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum merchant encontrado
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item: any) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Padrão</p>
                      <p className="font-semibold">{item.pattern}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                        <span className="sr-only">Editar merchant</span>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(item.id)}>
                        <span className="sr-only">Excluir merchant</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.friendlyName}</Badge>
                    <Badge variant="outline">{item.icon}</Badge>
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: item.color || "#6366f1" }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Merchant" : "Novo Merchant"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Padrão (ex: AMAZON)</Label>
                <Input
                  value={formData.pattern}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pattern: e.target.value }))}
                />
              </div>
              <div>
                <Label>Nome amigável</Label>
                <Input
                  value={formData.friendlyName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, friendlyName: e.target.value }))}
                />
              </div>
              <div>
                <Label>Ícone (Lucide)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                />
              </div>
              <div>
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
