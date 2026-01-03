import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Package,
  Film,
  CreditCard,
  ChevronRight,
  RefreshCw,
  Zap,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { aiKeywordsApi } from "@/lib/api";

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

interface AIKeywordsPanelProps {
  embedded?: boolean;
}

export function AIKeywordsPanel({ embedded = false }: AIKeywordsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, Partial<KeywordSuggestion>>>({});

  const analyzeKeywords = useMutation({
    mutationFn: aiKeywordsApi.analyze,
    onSuccess: (data) => {
      toast({ title: `${data.suggestions?.length || 0} palavras-chave analisadas` });
      setSelectedKeywords(new Set(data.suggestions?.map((s: any) => s.keyword) || []));
    },
    onError: () => {
      toast({ title: "Erro ao analisar transações", variant: "destructive" });
    }
  });

  const applySuggestions = useMutation({
    mutationFn: (suggestions: KeywordSuggestion[]) => aiKeywordsApi.apply(suggestions),
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
    <div className="space-y-6">
      <div className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
        embedded && "md:items-start"
      )}>
        <div>
          <h1 className={cn(
            "font-bold text-foreground flex items-center gap-3",
            embedded ? "text-xl" : "text-2xl md:text-3xl"
          )}>
            <Brain className={cn("text-primary", embedded ? "h-6 w-6" : "h-8 w-8")} />
            Sugestões de Keywords
          </h1>
          <p className="text-muted-foreground mt-1">
            A IA analisa transações pendentes e sugere categorias em lote
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
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
          {embedded && (
            <Link href="/ai-keywords">
              <Button variant="outline" className="gap-2">
                Abrir tela completa
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Alta confiança</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{highConfidence.length}</p>
                <p className="text-xs text-green-600">≥ 80% confiança</p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">Média confiança</span>
                </div>
                <p className="text-2xl font-bold text-amber-700">{mediumConfidence.length}</p>
                <p className="text-xs text-amber-600">50% a 79%</p>
              </CardContent>
            </Card>

            <Card className="bg-rose-50 border-rose-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span className="text-sm font-semibold text-rose-700">Baixa confiança</span>
                </div>
                <p className="text-2xl font-bold text-rose-700">{lowConfidence.length}</p>
                <p className="text-xs text-rose-600">{"< 50%"}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {suggestions.length} keywords
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {totalTransactions} transações
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={selectAll}>
                    Selecionar tudo
                  </Button>
                  <Button size="sm" variant="outline" onClick={selectNone}>
                    Limpar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => analyzeKeywords.mutate()}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reanalisar
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {suggestions.map((suggestion) => {
                  const effective = getEffectiveSuggestion(suggestion);
                  const Icon = CATEGORY_ICONS[effective.suggestedCategory] || CreditCard;
                  const color = CATEGORY_COLORS[effective.suggestedCategory] || "#6b7280";
                  const isSelected = selectedKeywords.has(suggestion.keyword);

                  return (
                    <div
                      key={suggestion.keyword}
                      className={cn(
                        "p-4 border rounded-lg transition-all",
                        isSelected ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleKeyword(suggestion.keyword)}
                          />

                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${color}20` }}
                            >
                              <Icon className="h-5 w-5" style={{ color }} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg">{suggestion.keyword}</span>
                                <Badge className="text-[10px] bg-muted text-muted-foreground">
                                  {suggestion.count}x
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Zap className="h-3 w-3 text-amber-500" />
                                  {suggestion.confidence}% confiança
                                </div>
                                <div className="flex items-center gap-1">
                                  <ArrowRight className="h-3 w-3" />
                                  {suggestion.reason}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <Select
                            value={effective.suggestedCategory}
                            onValueChange={(v) => updateSuggestion(suggestion.keyword, "suggestedCategory", v)}
                          >
                            <SelectTrigger className="w-[160px] h-9">
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
                  {embedded ? (
                    <Link href="/ai-keywords">
                      <Button variant="outline" className="gap-2">
                        Abrir tela completa
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/rules">
                      <Button variant="outline" className="gap-2">
                        Ver Regras Existentes
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
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
            <Link href={embedded ? "/confirm" : "/dashboard"}>
              <Button className="bg-green-600 hover:bg-green-700 gap-2">
                {embedded ? "Ver fila de confirmação" : "Voltar ao Dashboard"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
