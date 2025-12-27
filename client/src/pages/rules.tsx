import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rulesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  "Despesa": "bg-primary text-white",
  "Receita": "bg-emerald-100 text-emerald-700 border border-emerald-200"
};

const CATEGORY_ICONS: Record<string, string> = {
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

export default function RulesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [fixVarFilter, setFixVarFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [newRule, setNewRule] = useState({
    name: "",
    keywords: "",
    type: "Despesa" as const,
    fixVar: "Variável" as const,
    category1: "Outros" as const,
    category2: "",
    priority: 500,
    strict: false
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["rules"],
    queryFn: rulesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: rulesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      setIsOpen(false);
      setNewRule({ name: "", keywords: "", type: "Despesa", fixVar: "Variável", category1: "Outros", category2: "", priority: 500, strict: false });
      toast({ title: "Regra criada com sucesso" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: rulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast({ title: "Regra removida" });
    },
  });

  const seedMutation = useMutation({
    mutationFn: rulesApi.seed,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast({ title: `${result.count} regras IA adicionadas` });
    },
  });

  const handleCreate = () => {
    if (!newRule.name || !newRule.keywords) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    createMutation.mutate(newRule);
  };

  const filteredRules = rules.filter((rule: any) => {
    const matchesSearch = search === "" || 
      rule.name.toLowerCase().includes(search.toLowerCase()) ||
      rule.keywords.toLowerCase().includes(search.toLowerCase()) ||
      rule.category1.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || rule.type === typeFilter;
    const matchesFixVar = fixVarFilter === "all" || rule.fixVar === fixVarFilter;
    return matchesSearch && matchesType && matchesFixVar;
  });

  const totalPages = Math.ceil(filteredRules.length / perPage);
  const paginatedRules = filteredRules.slice((page - 1) * perPage, page * perPage);

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
        <div className="text-sm text-muted-foreground mb-2">
          RitualFin / Configuracoes / <span className="text-primary">Regras</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Regras</h1>
            <p className="text-muted-foreground mt-1">
              Defina como o RitualFin organiza suas importacoes automaticamente.
              <br />Ajuste categorias e palavras-chave.
            </p>
          </div>
          
          <div className="flex gap-2">
            {rules.length === 0 && (
              <Button 
                variant="outline" 
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {seedMutation.isPending ? "Gerando..." : "Gerar Regras IA"}
              </Button>
            )}
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 gap-2" data-testid="btn-new-rule">
                  <Plus className="h-4 w-4" />
                  Nova Regra
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nova Regra</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome da Regra</Label>
                    <Input
                      placeholder="Ex: Supermercados"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      data-testid="input-rule-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Palavras-chave (separadas por ;)</Label>
                    <Input
                      placeholder="Ex: REWE;LIDL;EDEKA"
                      value={newRule.keywords}
                      onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                      data-testid="input-rule-keywords"
                    />
                    <p className="text-xs text-muted-foreground">Contem qualquer um dos termos</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={newRule.type} onValueChange={(v: any) => setNewRule({ ...newRule, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Despesa">Despesa</SelectItem>
                          <SelectItem value="Receita">Receita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fixo/Variavel</Label>
                      <Select value={newRule.fixVar} onValueChange={(v: any) => setNewRule({ ...newRule, fixVar: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fixo">Fixo</SelectItem>
                          <SelectItem value="Variável">Variavel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={newRule.category1} onValueChange={(v: any) => setNewRule({ ...newRule, category1: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                    </div>
                    <div className="space-y-2">
                      <Label>Subcategoria</Label>
                      <Input
                        placeholder="Ex: Streaming"
                        value={newRule.category2}
                        onChange={(e) => setNewRule({ ...newRule, category2: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full" data-testid="btn-save-rule">
                    {createMutation.isPending ? "Salvando..." : "Salvar Regra"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por palavra-chave ou categoria..." 
                  className="pl-10 bg-muted/30 border-0"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px] bg-muted/30 border-0">
                    <SelectValue placeholder="Tipo: Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tipo: Todos</SelectItem>
                    <SelectItem value="Despesa">Despesa</SelectItem>
                    <SelectItem value="Receita">Receita</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={fixVarFilter} onValueChange={(v) => { setFixVarFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[160px] bg-muted/30 border-0">
                    <SelectValue placeholder="Fixo/Var: Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Fixo/Var: Todos</SelectItem>
                    <SelectItem value="Fixo">Fixo</SelectItem>
                    <SelectItem value="Variável">Variavel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Palavras-Chave (Keywords)</th>
                  <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Categoria Aplicada</th>
                  <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Tipo</th>
                  <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Recorrencia</th>
                  <th className="px-5 py-3 text-right font-medium text-xs uppercase tracking-wide">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                      <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Nenhuma regra configurada</p>
                      <p className="text-sm">Clique em "Gerar Regras IA" para criar regras automaticas</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRules.map((rule: any) => {
                    const keywordsPreview = rule.keywords.split(";").slice(0, 3).join(", ").toUpperCase();
                    const hasMore = rule.keywords.split(";").length > 3;
                    
                    return (
                      <tr key={rule.id} className="hover:bg-muted/20" data-testid={`row-rule-${rule.id}`}>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-foreground">
                              {keywordsPreview}{hasMore && "..."}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Contem qualquer um dos termos
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2.5 h-2.5 rounded-full", CATEGORY_ICONS[rule.category1] || "bg-gray-400")} />
                            <span>{rule.category1}</span>
                            {rule.category2 && (
                              <>
                                <span className="text-muted-foreground">&gt;</span>
                                <span className="text-muted-foreground">{rule.category2}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Badge className={cn("text-xs", TYPE_COLORS[rule.type])}>
                            {rule.type}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {rule.fixVar === "Fixo" ? (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="w-4 h-4 rounded bg-muted flex items-center justify-center text-[10px]">↓</span>
                                Fixo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="w-4 h-4 rounded bg-muted flex items-center justify-center text-[10px]">~</span>
                                Variavel
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {!rule.isSystem && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteMutation.mutate(rule.id)}
                              data-testid={`btn-delete-rule-${rule.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {filteredRules.length > 0 && (
            <div className="px-5 py-3 bg-muted/20 flex items-center justify-between border-t">
              <span className="text-sm text-muted-foreground">
                Mostrando {paginatedRules.length} de {filteredRules.length} regras
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Proxima
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
