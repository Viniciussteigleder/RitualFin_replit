"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRule } from "@/lib/actions/rules";
import { applyCategorization } from "@/lib/actions/categorization";
import type { DiscoveryCandidate, TaxonomyOption } from "@/lib/actions/discovery";
import { suggestRuleForOpenCandidate } from "@/lib/actions/ai-rule-suggestion";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  Ban,
  CheckCircle2,
  Search,
  TrendingDown,
  TrendingUp,
  Calendar,
  Repeat,
  ChevronRight,
  Hash,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/constants/categories";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClassificationPath } from "@/lib/actions/classification";

interface RuleDiscoveryCardProps {
  candidate: DiscoveryCandidate;
  taxonomyOptions: TaxonomyOption[];
  onApplied?: () => void;
  onTaxonomyOptionCreated?: (option: TaxonomyOption) => void;
}

export function RuleDiscoveryCard({ candidate, taxonomyOptions, onApplied, onTaxonomyOptionCreated }: RuleDiscoveryCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();
  const [isCreateClassPending, startCreateClassTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [keywords, setKeywords] = useState(candidate.description);
  const [negativeKeywords, setNegativeKeywords] = useState("");
  const [selectedLeafId, setSelectedLeafId] = useState<string>("");
  const [type, setType] = useState<"Receita" | "Despesa">(
    Number(candidate.sampleAmount) > 0 ? "Receita" : "Despesa"
  );
  const [fixVar, setFixVar] = useState<"Fixo" | "Variável">("Variável");
  const [categorySearch, setCategorySearch] = useState("");
  const [aiRationale, setAiRationale] = useState<string>("");
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [newAppCategory, setNewAppCategory] = useState("");
  const [newCategory1, setNewCategory1] = useState("");
  const [newCategory2, setNewCategory2] = useState("");
  const [newCategory3, setNewCategory3] = useState("");

  // Filter taxonomy options by search
  const filteredOptions = useMemo(() => {
    if (!categorySearch) return taxonomyOptions;
    const search = categorySearch.toLowerCase();
    return taxonomyOptions.filter(opt =>
      opt.label.toLowerCase().includes(search) ||
      opt.category1.toLowerCase().includes(search) ||
      opt.category2?.toLowerCase().includes(search) ||
      opt.category3?.toLowerCase().includes(search)
    );
  }, [taxonomyOptions, categorySearch]);

  const selectedOption = taxonomyOptions.find(o => o.leafId === selectedLeafId);

  const appCategoryOptions = useMemo(() => {
    return Array.from(new Set(taxonomyOptions.map((o) => o.appCategory).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [taxonomyOptions]);
  const category1Options = useMemo(() => {
    return Array.from(
      new Set(
        taxonomyOptions
          .filter((o) => (newAppCategory ? o.appCategory === newAppCategory : true))
          .map((o) => o.category1)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [taxonomyOptions, newAppCategory]);
  const category2Options = useMemo(() => {
    return Array.from(
      new Set(
        taxonomyOptions
          .filter((o) => (newAppCategory ? o.appCategory === newAppCategory : true))
          .filter((o) => (newCategory1 ? o.category1 === newCategory1 : true))
          .map((o) => o.category2)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [taxonomyOptions, newAppCategory, newCategory1]);
  const category3Options = useMemo(() => {
    return Array.from(
      new Set(
        taxonomyOptions
          .filter((o) => (newAppCategory ? o.appCategory === newAppCategory : true))
          .filter((o) => (newCategory1 ? o.category1 === newCategory1 : true))
          .filter((o) => (newCategory2 ? o.category2 === newCategory2 : true))
          .map((o) => o.category3)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [taxonomyOptions, newAppCategory, newCategory1, newCategory2]);

  const handleAiSuggest = () => {
    startAiTransition(async () => {
      try {
        const base = candidate.sampleKeyDesc || candidate.description;
        const res = await suggestRuleForOpenCandidate(base);
        if (!res.success) {
          toast.error("IA indisponível", { description: res.error });
          return;
        }

        setAiRationale(res.suggestion.rationale || "");
        setKeywords(res.suggestion.keyWords || base);
        setNegativeKeywords(res.suggestion.keyWordsNegative || "");
        setSelectedLeafId(res.suggestion.leafId);

        const option = taxonomyOptions.find(o => o.leafId === res.suggestion.leafId);
        if (option) {
          if (
            option.category1 === "Renda Extra" ||
            option.category1 === "Trabalho" ||
            option.category1.toLowerCase().includes("receita")
          ) {
            setType("Receita");
          }
        }
      } catch (error) {
        toast.error("Erro ao consultar IA");
      }
    });
  };

  const handleCreate = () => {
    if (!selectedLeafId) {
      toast.error("Por favor, selecione uma categoria.");
      return;
    }

    if (!selectedOption) return;

    startTransition(async () => {
      try {
        const res = await createRule({
          keyWords: keywords,
          keyWordsNegative: negativeKeywords || undefined,
          category1: selectedOption.category1,
          category2: selectedOption.category2,
          category3: selectedOption.category3,
          leafId: selectedOption.leafId,
          type: type,
          fixVar: fixVar
        });

        if (res.success) {
          setIsSuccess(true);
          if (res.merged) {
            toast.success("Regra atualizada!", {
              description: `As palavras-chave foram adicionadas à regra existente (ID: ${res.ruleId?.slice(0, 8)})`
            });
          } else {
            toast.success("Regra criada!", {
              description: `Nova regra criada (ID: ${res.ruleId?.slice(0, 8)})`
            });
          }
          // Re-apply to catch transactions
          await applyCategorization();
          toast.success("Transações atualizadas!", {
            description: `${candidate.count} transações podem ter sido categorizadas.`
          });
          onApplied?.();
        } else {
          toast.error("Erro ao criar regra", { description: res.error });
        }
      } catch (error) {
        toast.error("Erro inesperado");
      }
    });
  };

  // Auto-select type based on category heuristic
  const onCategorySelect = (leafId: string) => {
    setSelectedLeafId(leafId);
    const option = taxonomyOptions.find(o => o.leafId === leafId);
    if (option) {
      if (
        option.category1 === "Renda Extra" ||
        option.category1 === "Trabalho" ||
        option.category1.toLowerCase().includes("receita")
      ) {
        setType("Receita");
      }
    }
    setCategorySearch("");
  };

  const openCreateClassification = () => {
    const opt = selectedOption;
    setNewAppCategory(opt?.appCategory || "");
    setNewCategory1(opt?.category1 || "");
    setNewCategory2(opt?.category2 || "");
    setNewCategory3(opt?.category3 || "");
    setCreateClassOpen(true);
  };

  const handleCreateClassification = () => {
    startCreateClassTransition(async () => {
      const res = await createClassificationPath({
        appCategoryName: newAppCategory,
        category1Name: newCategory1,
        category2Name: newCategory2,
        category3Name: newCategory3,
      });
      if (!res.success) {
        toast.error("Não foi possível criar classificação", { description: res.error });
        return;
      }
      onTaxonomyOptionCreated?.(res.option);
      setSelectedLeafId(res.option.leafId);
      setCategorySearch("");
      setCreateClassOpen(false);
      toast.success("Classificação criada", { description: res.option.label });
    });
  };

  // If success, show minimal card
  if (isSuccess) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-800 dark:text-emerald-200">Regra aplicada com sucesso!</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {candidate.count} transações similares a &quot;{candidate.description}&quot; foram categorizadas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
      {/* Impact indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs"
        >
          <Hash className="w-3 h-3 mr-1" />
          {candidate.count} ocorrências
        </Badge>
      </div>

      <div className="flex flex-col gap-6">
        {/* Header: Description and Sample */}
        <div className="flex flex-col gap-2 pr-32">
          <h3 className="text-xl font-bold font-display text-foreground" title={candidate.description}>
            {candidate.description}
          </h3>
          {candidate.sampleKeyDesc && (
            <div className="text-[11px] text-muted-foreground font-mono truncate" title={candidate.sampleKeyDesc}>
              key_desc: {candidate.sampleKeyDesc}
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className={cn(
              "font-bold",
              Number(candidate.sampleAmount) < 0 ? "text-red-600" : "text-emerald-600"
            )}>
              {formatCurrency(Math.abs(Number(candidate.sampleAmount)))}
            </span>
            <span className="text-xs">
              {new Date(candidate.sampleDate).toLocaleDateString("pt-BR")}
            </span>
            {candidate.currentCategory1 && candidate.currentCategory1 !== 'OPEN' && (
              <Badge variant="outline" className="text-xs">
                Atual: {candidate.currentCategory1}
              </Badge>
            )}
            {candidate.currentCategory1 === 'OPEN' && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs border-0">
                Não categorizado
              </Badge>
            )}
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Keywords */}
          <div className="space-y-4">
            {/* Positive Keywords */}
          <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Palavra-chave (incluir)
                </label>
                {candidate.currentCategory1 === "OPEN" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isAiPending}
                    onClick={handleAiSuggest}
                    className="h-7 px-2 rounded-lg text-[10px] font-bold"
                  >
                    {isAiPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sugerir IA"}
                  </Button>
                )}
              </div>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 h-10 text-sm font-medium focus:ring-emerald-500"
                placeholder="Ex: PAYPAL; AMAZON; SPOTIFY (separar por ;)"
              />
              {aiRationale && (
                <div className="text-[11px] text-muted-foreground">
                  IA: <span className="font-medium">{aiRationale}</span>
                </div>
              )}
              <div className="text-[11px] text-muted-foreground">
                Dica: use tokens estáveis (marca/serviço) e evite datas/valores.
              </div>
            </div>

            {/* Negative Keywords */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Ban className="w-3 h-3 text-red-500" />
                Palavra-chave (excluir)
              </label>
              <Input
                value={negativeKeywords}
                onChange={(e) => setNegativeKeywords(e.target.value)}
                className="bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800 h-10 text-sm font-medium focus:ring-red-500"
                placeholder="Ex: TRANSFER; ESTORNO (separar por ;)"
              />
              <div className="text-[11px] text-muted-foreground">
                Use exclusões para evitar matches errados (ex.: termos genéricos).
              </div>
            </div>

            {/* Type and FixVar Toggle Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* Type Toggle */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-muted-foreground">Tipo</label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setType("Despesa")}
                    className={cn(
                      "flex-1 py-2 px-3 text-sm font-medium transition-all flex items-center justify-center gap-1",
                      type === "Despesa"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : "bg-background hover:bg-secondary text-muted-foreground"
                    )}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("Receita")}
                    className={cn(
                      "flex-1 py-2 px-3 text-sm font-medium transition-all flex items-center justify-center gap-1",
                      type === "Receita"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-background hover:bg-secondary text-muted-foreground"
                    )}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Receita
                  </button>
                </div>
              </div>

              {/* FixVar Toggle */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-muted-foreground">Frequência</label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFixVar("Variável")}
                    className={cn(
                      "flex-1 py-2 px-3 text-sm font-medium transition-all flex items-center justify-center gap-1",
                      fixVar === "Variável"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "bg-background hover:bg-secondary text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Variável
                  </button>
                  <button
                    type="button"
                    onClick={() => setFixVar("Fixo")}
                    className={cn(
                      "flex-1 py-2 px-3 text-sm font-medium transition-all flex items-center justify-center gap-1",
                      fixVar === "Fixo"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "bg-background hover:bg-secondary text-muted-foreground"
                    )}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    Fixo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Category Selection */}
          <div className="space-y-3">
            <label className="text-xs uppercase font-bold text-muted-foreground">
              Classificar como
            </label>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Buscar categoria..."
                className="pl-9 h-10 text-sm"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Hierarquia: <span className="font-mono">App</span> &gt; <span className="font-mono">Cat 1</span> &gt; <span className="font-mono">Cat 2</span> &gt; <span className="font-mono">Cat 3</span>
              </p>
              <Button type="button" variant="outline" size="sm" className="h-8 rounded-xl font-bold" onClick={openCreateClassification}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Nova classificação
              </Button>
            </div>

            {/* Selected Category Display */}
            {selectedOption && (
              <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-violet-600 dark:text-violet-400 font-medium">
                    {selectedOption.appCategory || "App"}
                  </span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span>{selectedOption.category1}</span>
                  {selectedOption.category2 && (
                    <>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{selectedOption.category2}</span>
                    </>
                  )}
                  {selectedOption.category3 && (
                    <>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{selectedOption.category3}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Category List */}
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-background">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma categoria encontrada para &quot;{categorySearch}&quot;
                </div>
              ) : (
                filteredOptions.slice(0, 20).map((opt) => {
                  const catConfig = getCategoryConfig(opt.category1);
                  return (
                    <button
                      key={opt.leafId}
                      type="button"
                      onClick={() => onCategorySelect(opt.leafId)}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors border-b border-border/50 last:border-0 flex items-center gap-2",
                        selectedLeafId === opt.leafId && "bg-violet-50 dark:bg-violet-900/20"
                      )}
                    >
                      <CategoryIcon category={catConfig.name} size="sm" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })
              )}
              {filteredOptions.length > 20 && (
                <div className="p-2 text-center text-xs text-muted-foreground border-t">
                  +{filteredOptions.length - 20} mais resultados
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Esta ação atualizará <strong>{candidate.count}</strong> transações semelhantes (se houver match).
          </p>
          <Button
            onClick={handleCreate}
            disabled={isPending || !selectedLeafId}
            className={cn(
              "h-11 px-8 font-bold transition-all duration-300 shadow-md rounded-xl",
              isPending
                ? "bg-muted text-muted-foreground"
                : !selectedLeafId
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02] active:scale-95"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Adicionar regra
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar nova classificação</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">App Category</label>
              <Input value={newAppCategory} onChange={(e) => setNewAppCategory(e.target.value)} placeholder="Ex: Alimentação" />
              <div className="max-h-28 overflow-y-auto rounded-lg border border-border">
                {appCategoryOptions.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-secondary border-b last:border-0",
                      v === newAppCategory && "bg-emerald-50 dark:bg-emerald-900/20"
                    )}
                    onClick={() => {
                      setNewAppCategory(v);
                      setNewCategory1("");
                      setNewCategory2("");
                      setNewCategory3("");
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Categoria 1</label>
              <Input value={newCategory1} onChange={(e) => setNewCategory1(e.target.value)} placeholder="Ex: Alimentação" />
              <div className="max-h-28 overflow-y-auto rounded-lg border border-border">
                {category1Options.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-secondary border-b last:border-0",
                      v === newCategory1 && "bg-emerald-50 dark:bg-emerald-900/20"
                    )}
                    onClick={() => {
                      setNewCategory1(v);
                      setNewCategory2("");
                      setNewCategory3("");
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Categoria 2</label>
              <Input value={newCategory2} onChange={(e) => setNewCategory2(e.target.value)} placeholder="Ex: Restaurantes" />
              <div className="max-h-28 overflow-y-auto rounded-lg border border-border">
                {category2Options.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-secondary border-b last:border-0",
                      v === newCategory2 && "bg-emerald-50 dark:bg-emerald-900/20"
                    )}
                    onClick={() => {
                      setNewCategory2(v);
                      setNewCategory3("");
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Categoria 3</label>
              <Input value={newCategory3} onChange={(e) => setNewCategory3(e.target.value)} placeholder="Ex: Restaurante" />
              <div className="max-h-28 overflow-y-auto rounded-lg border border-border">
                {category3Options.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-secondary border-b last:border-0",
                      v === newCategory3 && "bg-emerald-50 dark:bg-emerald-900/20"
                    )}
                    onClick={() => setNewCategory3(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCreateClassOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-xl font-bold"
              disabled={isCreateClassPending}
              onClick={handleCreateClassification}
            >
              {isCreateClassPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
