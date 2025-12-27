import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Loader2, Sparkles, BookOpen, Settings2, Zap, ArrowUpDown, GripVertical, Edit2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rulesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const TYPE_COLORS: Record<string, string> = {
  "Despesa": "bg-rose-100 text-rose-700 border-rose-200",
  "Receita": "bg-emerald-100 text-emerald-700 border-emerald-200"
};

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "bg-green-500",
  "Lazer": "bg-purple-500",
  "Transporte": "bg-blue-500",
  "Moradia": "bg-orange-500",
  "Saúde": "bg-red-500",
  "Compras Online": "bg-pink-500",
  "Receitas": "bg-emerald-500",
  "Assinaturas": "bg-violet-500",
  "Outros": "bg-gray-400",
  "Interno": "bg-slate-600"
};

export default function RulesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [view, setView] = useState<"cards" | "table">("cards");

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
    const matchesCategory = categoryFilter === "all" || rule.category1 === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const systemRules = filteredRules.filter((r: any) => r.isSystem);
  const userRules = filteredRules.filter((r: any) => !r.isSystem);

  const categories = Array.from(new Set(rules.map((r: any) => r.category1))) as string[];

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
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Motor de Regras</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                IA
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Categorize transacoes automaticamente com regras baseadas em palavras-chave.
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
                <Zap className="h-4 w-4" />
                {seedMutation.isPending ? "Gerando..." : "Criar Regras Padrao"}
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
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Criar Nova Regra
                  </DialogTitle>
                  <DialogDescription>
                    Defina palavras-chave para categorizar transacoes automaticamente.
                  </DialogDescription>
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
                    <Label>Palavras-chave</Label>
                    <Input
                      placeholder="Ex: REWE;LIDL;EDEKA"
                      value={newRule.keywords}
                      onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                      data-testid="input-rule-keywords"
                    />
                    <p className="text-xs text-muted-foreground">Separe multiplas palavras com ponto e virgula (;)</p>
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
                      <Label>Recorrencia</Label>
                      <Select value={newRule.fixVar} onValueChange={(v: any) => setNewRule({ ...newRule, fixVar: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fixo">Fixo (mensal)</SelectItem>
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
                          <SelectItem value="Assinaturas">Assinaturas</SelectItem>
                          <SelectItem value="Receitas">Receitas</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                          <SelectItem value="Interno">Interno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select value={String(newRule.priority)} onValueChange={(v) => setNewRule({ ...newRule, priority: Number(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">Alta (1000)</SelectItem>
                          <SelectItem value="500">Media (500)</SelectItem>
                          <SelectItem value="100">Baixa (100)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <Label className="font-medium">Correspondencia estrita</Label>
                      <p className="text-xs text-muted-foreground">Alta confianca, aplicar automaticamente</p>
                    </div>
                    <Switch 
                      checked={newRule.strict} 
                      onCheckedChange={(checked) => setNewRule({ ...newRule, strict: checked })}
                    />
                  </div>
                  <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full" data-testid="btn-save-rule">
                    {createMutation.isPending ? "Salvando..." : "Criar Regra"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Regras</p>
                  <p className="text-3xl font-bold mt-1">{rules.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Regras IA</p>
                  <p className="text-3xl font-bold mt-1 text-primary">{systemRules.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Suas Regras</p>
                  <p className="text-3xl font-bold mt-1">{userRules.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Settings2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Categorias</p>
                  <p className="text-3xl font-bold mt-1">{categories.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ArrowUpDown className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar regras por palavra-chave..." 
                  className="pl-10 bg-muted/30 border-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-search-rules"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px] bg-muted/30 border-0">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredRules.length === 0 ? (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma regra configurada</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Crie regras para categorizar suas transacoes automaticamente durante a importacao.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => seedMutation.mutate()}
                  disabled={seedMutation.isPending}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Criar Regras Padrao
                </Button>
                <Button className="gap-2" onClick={() => setIsOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Criar Manualmente
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRules.map((rule: any) => {
              const keywordsList = rule.keywords.split(";").filter(Boolean);
              const displayKeywords = keywordsList.slice(0, 4);
              const remainingCount = keywordsList.length - 4;
              
              return (
                <Card 
                  key={rule.id} 
                  className={cn(
                    "bg-white border-0 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden",
                    rule.isSystem && "ring-1 ring-primary/20"
                  )}
                  data-testid={`card-rule-${rule.id}`}
                >
                  {rule.isSystem && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                        IA
                      </div>
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", CATEGORY_COLORS[rule.category1] || "bg-gray-400")} />
                        <span className="font-semibold">{rule.category1}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!rule.isSystem && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-destructive"
                              onClick={() => deleteMutation.mutate(rule.id)}
                              data-testid={`btn-delete-rule-${rule.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {displayKeywords.map((kw: string, idx: number) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-xs bg-muted/50 text-muted-foreground font-normal"
                        >
                          {kw.trim().toUpperCase()}
                        </Badge>
                      ))}
                      {remainingCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground font-normal">
                          +{remainingCount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <Badge className={cn("text-xs border", TYPE_COLORS[rule.type])}>
                        {rule.type}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full",
                          rule.fixVar === "Fixo" ? "bg-blue-50 text-blue-600" : "bg-gray-100"
                        )}>
                          {rule.fixVar}
                        </span>
                        {rule.strict && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                            Estrita
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
