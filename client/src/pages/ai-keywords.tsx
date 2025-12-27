import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Home,
  ShoppingCart,
  Car,
  Heart,
  Coffee,
  Package,
  Film,
  CreditCard,
  ChevronRight,
  RefreshCw,
  Zap,
  ArrowRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Mercado": ShoppingCart,
  "Transporte": Car,
  "Saúde": Heart,
  "Lazer": Film,
  "Compras Online": Package,
  "Outros": CreditCard
};

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Moradia": "#f97316",
  "Transporte": "#3b82f6",
  "Lazer": "#a855f7",
  "Saúde": "#ef4444",
  "Compras Online": "#ec4899",
  "Receitas": "#10b981",
  "Interno": "#475569",
  "Outros": "#6b7280"
};

const CATEGORIES = ["Moradia", "Mercado", "Compras Online", "Transporte", "Saúde", "Lazer", "Receitas", "Interno", "Outros"];

interface KeywordSuggestion {
  keyword: string;
  suggestedCategory: string;
  suggestedType: "Despesa" | "Receita";
  suggestedFixVar: "Fixo" | "Variável";
  confidence: number;
  reason: string;
  count: number;
  total: number;
  samples: string[];
}

export default function AIKeywordsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, Partial<KeywordSuggestion>>>({});

  const analyzeKeywords = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/analyze-keywords", { method: "POST" });
      if (!res.ok) throw new Error("Erro na análise");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.suggestions?.length || 0} palavras-chave analisadas` });
      setSelectedKeywords(new Set(data.suggestions?.map((s: any) => s.keyword) || []));
    },
    onError: () => {
      toast({ title: "Erro ao analisar transações", variant: "destructive" });
    }
  });

  const applySuggestions = useMutation({
    mutationFn: async (suggestions: KeywordSuggestion[]) => {
      const res = await fetch("/api/ai/apply-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestions })
      });
      if (!res.ok) throw new Error("Erro ao aplicar");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Regras criadas com sucesso!", 
        description: `${data.rulesCreated} regras criadas, ${data.transactionsUpdated} transações atualizadas` 
      });
      queryClient.invalidateQueries({ queryKey: ["confirm-queue"] });
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
    onError: () => {
      toast({ title: "Erro ao criar regras", variant: "destructive" });
    }
  });

  const suggestions = (analyzeKeywords.data?.suggestions || []) as KeywordSuggestion[];
  const totalTransactions = analyzeKeywords.data?.total || 0;

  const toggleKeyword = (keyword: string) => {
    const newSet = new Set(selectedKeywords);
    if (newSet.has(keyword)) {
      newSet.delete(keyword);
    } else {
      newSet.add(keyword);
    }
    setSelectedKeywords(newSet);
  };

  const selectAll = () => {
    setSelectedKeywords(new Set(suggestions.map(s => s.keyword)));
  };

  const selectNone = () => {
    setSelectedKeywords(new Set());
  };

  const updateSuggestion = (keyword: string, field: string, value: string) => {
    setEditedSuggestions(prev => ({
      ...prev,
      [keyword]: { ...prev[keyword], [field]: value }
    }));
  };

  const getEffectiveSuggestion = (s: KeywordSuggestion) => {
    return { ...s, ...editedSuggestions[s.keyword] };
  };

  const handleApply = () => {
    const toApply = suggestions
      .filter(s => selectedKeywords.has(s.keyword))
      .map(getEffectiveSuggestion);
    applySuggestions.mutate(toApply);
  };

  const highConfidence = suggestions.filter(s => s.confidence >= 80);
  const mediumConfidence = suggestions.filter(s => s.confidence >= 50 && s.confidence < 80);
  const lowConfidence = suggestions.filter(s => s.confidence < 50);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Análise Inteligente de Keywords
            </h1>
            <p className="text-muted-foreground mt-1">
              A IA analisa suas transações pendentes e sugere categorias em lote
            </p>
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary/90 gap-2"
            onClick={() => analyzeKeywords.mutate()}
            disabled={analyzeKeywords.isPending}
            data-testid="button-analyze"
          >
            {analyzeKeywords.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {analyzeKeywords.isPending ? "Analisando..." : "Analisar Transações"}
          </Button>
        </div>

        {!analyzeKeywords.data && !analyzeKeywords.isPending && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <Brain className="h-16 w-16 mx-auto mb-4 text-primary/50" />
              <h3 className="text-xl font-bold text-foreground mb-2">Pronto para Categorizar em Lote?</h3>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Clique em "Analisar Transações" para que a IA identifique padrões nas suas transações 
                pendentes e sugira categorias para cada palavra-chave encontrada.
              </p>
              <Button 
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={() => analyzeKeywords.mutate()}
              >
                <Sparkles className="h-4 w-4" />
                Começar Análise
              </Button>
            </CardContent>
          </Card>
        )}

        {analyzeKeywords.isPending && (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Analisando suas transações...</h3>
              <p className="text-muted-foreground">
                A IA está identificando padrões e sugerindo categorias
              </p>
            </CardContent>
          </Card>
        )}

        {suggestions.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Analisado</span>
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
                  <p className="text-xs text-muted-foreground mt-1">transações</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-700">Alta Confiança</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-700">{highConfidence.length}</p>
                  <p className="text-xs text-green-600 mt-1">≥80% confiança</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Média Confiança</span>
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-700">{mediumConfidence.length}</p>
                  <p className="text-xs text-amber-600 mt-1">50-79% confiança</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selecionadas</span>
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedKeywords.size}</p>
                  <p className="text-xs text-muted-foreground mt-1">de {suggestions.length} keywords</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Sugestões da IA</CardTitle>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={selectAll}>Selecionar Todas</Button>
                  <Button variant="ghost" size="sm" onClick={selectNone}>Limpar Seleção</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {suggestions.map((suggestion) => {
                    const effective = getEffectiveSuggestion(suggestion);
                    const Icon = CATEGORY_ICONS[effective.suggestedCategory] || CreditCard;
                    const color = CATEGORY_COLORS[effective.suggestedCategory] || "#6b7280";
                    const isSelected = selectedKeywords.has(suggestion.keyword);
                    
                    return (
                      <div 
                        key={suggestion.keyword}
                        className={cn(
                          "p-4 md:p-5 transition-colors",
                          isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                        )}
                        data-testid={`keyword-row-${suggestion.keyword}`}
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleKeyword(suggestion.keyword)}
                            className="mt-1"
                          />
                          
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Icon className="h-5 w-5" style={{ color }} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-foreground">{suggestion.keyword}</span>
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-[10px]",
                                  suggestion.confidence >= 80 ? "bg-green-100 text-green-700" : 
                                  suggestion.confidence >= 50 ? "bg-amber-100 text-amber-700" : 
                                  "bg-gray-100 text-gray-700"
                                )}
                              >
                                {suggestion.confidence}% confiança
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {suggestion.count} transações
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                            {suggestion.samples.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">
                                Exemplos: {suggestion.samples.join(", ")}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Select 
                              value={effective.suggestedCategory}
                              onValueChange={(v) => updateSuggestion(suggestion.keyword, "suggestedCategory", v)}
                            >
                              <SelectTrigger className="w-[140px] h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Select 
                              value={effective.suggestedType}
                              onValueChange={(v) => updateSuggestion(suggestion.keyword, "suggestedType", v)}
                            >
                              <SelectTrigger className="w-[100px] h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Despesa">Despesa</SelectItem>
                                <SelectItem value="Receita">Receita</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <span className="font-bold text-sm w-24 text-right">
                              {suggestion.total.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Aplicar Sugestões Selecionadas</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Serão criadas {selectedKeywords.size} regras e atualizadas as transações correspondentes
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/rules">
                      <Button variant="outline" className="gap-2">
                        Ver Regras Existentes
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      className="bg-primary hover:bg-primary/90 gap-2"
                      onClick={handleApply}
                      disabled={selectedKeywords.size === 0 || applySuggestions.isPending}
                    >
                      {applySuggestions.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Aplicar {selectedKeywords.size} Sugestões
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {analyzeKeywords.data && suggestions.length === 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold text-green-900 mb-2">Tudo Categorizado!</h3>
              <p className="text-green-700 max-w-lg mx-auto mb-6">
                Não há transações pendentes de categorização. Todas as suas transações já possuem uma categoria definida.
              </p>
              <Link href="/dashboard">
                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                  Voltar ao Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
