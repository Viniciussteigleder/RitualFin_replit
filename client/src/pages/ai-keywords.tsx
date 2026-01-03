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
  BookOpen,
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
import { aiKeywordsCopy, translateCategory, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Alimentação": ShoppingCart,
  "Compras & Estilo de Vida": Package,
  "Mobilidade": Car,
  "Saúde & Seguros": Heart,
  "Educação & Crianças": BookOpen,
  "Lazer & Viagens": Film,
  "Interna": CreditCard,
  "Finanças & Transferências": CreditCard,
  "Trabalho & Receitas": Coffee,
  "Doações & Outros": Heart,
  "Revisão & Não Classificado": AlertCircle,
  "Outros": CreditCard
};

const CATEGORY_COLORS: Record<string, string> = {
  "Moradia": "#f97316",
  "Alimentação": "#22c55e",
  "Compras & Estilo de Vida": "#ec4899",
  "Mobilidade": "#3b82f6",
  "Saúde & Seguros": "#ef4444",
  "Educação & Crianças": "#0ea5e9",
  "Lazer & Viagens": "#a855f7",
  "Interna": "#475569",
  "Finanças & Transferências": "#0f766e",
  "Trabalho & Receitas": "#10b981",
  "Doações & Outros": "#16a34a",
  "Revisão & Não Classificado": "#f59e0b",
  "Outros": "#6b7280"
};

const CATEGORIES = [
  "Moradia",
  "Alimentação",
  "Compras & Estilo de Vida",
  "Mobilidade",
  "Saúde & Seguros",
  "Educação & Crianças",
  "Lazer & Viagens",
  "Interna",
  "Finanças & Transferências",
  "Trabalho & Receitas",
  "Doações & Outros",
  "Revisão & Não Classificado",
  "Outros"
];

interface KeywordSuggestion {
  keyword: string;
  suggestedCategory: string;
  suggestedType: "Despesa" | "Receita";
  suggestedFixVar: "Fixo" | "Variável";
  leafId?: string;
  suggestedCategory2?: string;
  suggestedCategory3?: string;
  confidence: number;
  reason: string;
  count: number;
  total: number;
  samples: string[];
}

export default function AIKeywordsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, Partial<KeywordSuggestion>>>({});
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);

  const analyzeKeywords = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/analyze-keywords", { method: "POST" });
      if (!res.ok) throw new Error(translate(locale, aiKeywordsCopy.toastAnalyzeError));
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: formatMessage(translate(locale, aiKeywordsCopy.toastAnalyzed), { count: data.suggestions?.length || 0 }) });
      setSelectedKeywords(new Set(data.suggestions?.map((s: any) => s.keyword) || []));
    },
    onError: () => {
      toast({ title: translate(locale, aiKeywordsCopy.toastAnalyzeError), variant: "destructive" });
    }
  });

  const applySuggestions = useMutation({
    mutationFn: async (suggestions: KeywordSuggestion[]) => {
      const res = await fetch("/api/ai/apply-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestions })
      });
      if (!res.ok) throw new Error(translate(locale, aiKeywordsCopy.toastApplyError));
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: translate(locale, aiKeywordsCopy.toastAppliedTitle),
        description: formatMessage(translate(locale, aiKeywordsCopy.toastAppliedBody), {
          rules: data.rulesCreated,
          transactions: data.transactionsUpdated
        })
      });
      queryClient.invalidateQueries({ queryKey: ["confirm-queue"] });
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
    onError: () => {
      toast({ title: translate(locale, aiKeywordsCopy.toastApplyError), variant: "destructive" });
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
              {translate(locale, aiKeywordsCopy.title)}
            </h1>
            <p className="text-muted-foreground mt-1">
              {translate(locale, aiKeywordsCopy.subtitle)}
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
            {analyzeKeywords.isPending ? translate(locale, aiKeywordsCopy.analyzing) : translate(locale, aiKeywordsCopy.analyzeAction)}
          </Button>
        </div>

        {!analyzeKeywords.data && !analyzeKeywords.isPending && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <Brain className="h-16 w-16 mx-auto mb-4 text-primary/50" />
              <h3 className="text-xl font-bold text-foreground mb-2">{translate(locale, aiKeywordsCopy.emptyTitle)}</h3>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                {translate(locale, aiKeywordsCopy.emptyBody)}
              </p>
              <Button 
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={() => analyzeKeywords.mutate()}
              >
                <Sparkles className="h-4 w-4" />
                {translate(locale, aiKeywordsCopy.startAnalysis)}
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
              <h3 className="text-lg font-bold text-foreground mb-2">{translate(locale, aiKeywordsCopy.analyzingTitle)}</h3>
              <p className="text-muted-foreground">
                {translate(locale, aiKeywordsCopy.analyzingBody)}
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
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{translate(locale, aiKeywordsCopy.totalAnalyzed)}</span>
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
                  <p className="text-xs text-muted-foreground mt-1">{translate(locale, aiKeywordsCopy.transactionsLabel)}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-700">{translate(locale, aiKeywordsCopy.confidenceHigh)}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-700">{highConfidence.length}</p>
                  <p className="text-xs text-green-600 mt-1">{translate(locale, aiKeywordsCopy.confidenceHighRange)}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">{translate(locale, aiKeywordsCopy.confidenceMedium)}</span>
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-700">{mediumConfidence.length}</p>
                  <p className="text-xs text-amber-600 mt-1">{translate(locale, aiKeywordsCopy.confidenceMediumRange)}</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{translate(locale, aiKeywordsCopy.selectedLabel)}</span>
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedKeywords.size}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatMessage(translate(locale, aiKeywordsCopy.selectedOf), { total: suggestions.length })}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">{translate(locale, aiKeywordsCopy.suggestionsTitle)}</CardTitle>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={selectAll}>{translate(locale, aiKeywordsCopy.selectAll)}</Button>
                  <Button variant="ghost" size="sm" onClick={selectNone}>{translate(locale, aiKeywordsCopy.selectNone)}</Button>
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
                                {formatMessage(translate(locale, aiKeywordsCopy.confidenceBadge), { percent: suggestion.confidence })}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {formatMessage(translate(locale, aiKeywordsCopy.transactionsCount), { count: suggestion.count })}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                            {suggestion.samples.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">
                                {translate(locale, aiKeywordsCopy.samplesPrefix)}: {suggestion.samples.join(", ")}
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
                                  <SelectItem key={cat} value={cat}>
                                    {translateCategory(locale, cat)}
                                  </SelectItem>
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
                                <SelectItem value="Despesa">{translate(locale, aiKeywordsCopy.typeExpense)}</SelectItem>
                                <SelectItem value="Receita">{translate(locale, aiKeywordsCopy.typeIncome)}</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <span className="font-bold text-sm w-24 text-right">
                              {currencyFormatter.format(suggestion.total)}
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
                    <h3 className="font-bold text-lg text-foreground">{translate(locale, aiKeywordsCopy.applySelectedTitle)}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {formatMessage(translate(locale, aiKeywordsCopy.applySelectedBody), { count: selectedKeywords.size })}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/rules">
                      <Button variant="outline" className="gap-2">
                        {translate(locale, aiKeywordsCopy.viewRules)}
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
                      {formatMessage(translate(locale, aiKeywordsCopy.applyCount), { count: selectedKeywords.size })}
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
              <h3 className="text-xl font-bold text-green-900 mb-2">{translate(locale, aiKeywordsCopy.allCategorizedTitle)}</h3>
              <p className="text-green-700 max-w-lg mx-auto mb-6">
                {translate(locale, aiKeywordsCopy.allCategorizedBody)}
              </p>
              <Link href="/dashboard">
                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                  {translate(locale, aiKeywordsCopy.backDashboard)}
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
