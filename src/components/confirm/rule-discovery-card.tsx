"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRule } from "@/lib/actions/rules";
import { applyCategorization } from "@/lib/actions/categorization";
import { DiscoveryCandidate, TaxonomyOption } from "@/lib/actions/discovery";
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
  Hash
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/constants/categories";

interface RuleDiscoveryCardProps {
  candidate: DiscoveryCandidate;
  taxonomyOptions: TaxonomyOption[];
}

export function RuleDiscoveryCard({ candidate, taxonomyOptions }: RuleDiscoveryCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [keywords, setKeywords] = useState(candidate.description);
  const [negativeKeywords, setNegativeKeywords] = useState("");
  const [selectedLeafId, setSelectedLeafId] = useState<string>("");
  const [type, setType] = useState<"Receita" | "Despesa">(
    Number(candidate.sampleAmount) > 0 ? "Receita" : "Despesa"
  );
  const [fixVar, setFixVar] = useState<"Fixo" | "Variável">("Variável");
  const [categorySearch, setCategorySearch] = useState("");

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
            toast.success("Keyword adicionada!", {
              description: `Palavra-chave mesclada com regra existente (ID: ${res.ruleId?.slice(0, 8)})`
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
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
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
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Palavra-chave (incluir)
              </label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 h-10 text-sm font-medium focus:ring-emerald-500"
                placeholder="Termo obrigatório para match"
              />
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
                placeholder="Opcional: evitar falsos positivos"
              />
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
                  const CatIcon = catConfig.lucideIcon;
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
                      <div className={cn("p-1 rounded", catConfig.bgColor)}>
                        <CatIcon className={cn("w-3 h-3", catConfig.textColor)} />
                      </div>
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
            Esta regra afetará <strong>{candidate.count}</strong> transações existentes.
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
                Criar Regra e Aplicar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
