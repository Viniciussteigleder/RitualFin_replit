"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, Filter, Loader2, Repeat, Search, Swords, Wand2 } from "lucide-react";
import {
  getConflictTransactions,
  getDiscoveryCandidates,
  getRecurringSuggestions,
  type ConflictFilters,
  type ConflictTransaction,
  type DiscoveryCandidate,
  type DiscoveryFilters,
  type RecurringFilters,
  type RecurringSuggestion,
  type TaxonomyOption,
} from "@/lib/actions/discovery";
import { RuleDiscoveryCard } from "@/components/confirm/rule-discovery-card";
import { markRecurringGroup } from "@/lib/actions/recurring";
import { TransactionDrawer } from "@/components/transactions/transaction-drawer";
import { updateTransactionCategory } from "@/lib/actions/transactions";
import { suggestConflictResolution } from "@/lib/actions/ai-conflict-resolution";
import { mergeRuleKeywordsById } from "@/lib/actions/rules";
import { applyCategorization } from "@/lib/actions/categorization";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  taxonomyOptions: TaxonomyOption[];
};

function toISODateInput(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function ConfirmTabs({ taxonomyOptions: initialTaxonomyOptions }: Props) {
  const [taxonomyOptions, setTaxonomyOptions] = useState<TaxonomyOption[]>(initialTaxonomyOptions);

  // Discovery
  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilters>(() => ({
    dateFrom: toISODateInput(new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)),
    sortBy: "count",
    sortDir: "desc",
    limit: 50,
  }));
  const [discovery, setDiscovery] = useState<DiscoveryCandidate[]>([]);
  const [isDiscoveryPending, startDiscovery] = useTransition();

  // Recurring
  const [recurringFilters, setRecurringFilters] = useState<RecurringFilters>(() => ({
    dateFrom: toISODateInput(new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)),
    minOccurrences: 3,
    sortBy: "occurrences",
    sortDir: "desc",
    limit: 50,
  }));
  const [recurring, setRecurring] = useState<RecurringSuggestion[]>([]);
  const [isRecurringPending, startRecurring] = useTransition();
  const [isRecurringApplyPending, startRecurringApply] = useTransition();

  // Conflicts
  const [conflictFilters, setConflictFilters] = useState<ConflictFilters>(() => ({
    dateFrom: toISODateInput(new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)),
    sortBy: "date",
    sortDir: "desc",
    limit: 50,
  }));
  const [conflicts, setConflicts] = useState<ConflictTransaction[]>([]);
  const [isConflictsPending, startConflicts] = useTransition();
  const [isConflictAiPending, startConflictAi] = useTransition();
  const [isConflictAiApplyPending, startConflictAiApply] = useTransition();

  const [selectedConflict, setSelectedConflict] = useState<ConflictTransaction | null>(null);
  const [aiConflictTx, setAiConflictTx] = useState<ConflictTransaction | null>(null);
  const [aiConflictSuggestion, setAiConflictSuggestion] = useState<{
    rationale: string;
    suggestions: Array<{ rule_id: string; add_key_words: string | null; add_key_words_negative: string | null }>;
  } | null>(null);
  const selectedDrawerTx = useMemo(() => {
    if (!selectedConflict) return null;
    return {
      id: selectedConflict.id,
      paymentDate: selectedConflict.paymentDate,
      descRaw: selectedConflict.descRaw || selectedConflict.descNorm || "Sem descrição",
      descNorm: selectedConflict.descNorm || selectedConflict.descRaw || "Sem descrição",
      aliasDesc: selectedConflict.aliasDesc,
      simpleDesc: selectedConflict.simpleDesc,
      amount: selectedConflict.amount,
      needsReview: false,
      manualOverride: false,
      conflictFlag: true,
      classificationCandidates: selectedConflict.classificationCandidates,
    };
  }, [selectedConflict]);

  const loadDiscovery = (filters: DiscoveryFilters) =>
    startDiscovery(async () => {
      try {
        const rows = await getDiscoveryCandidates(filters);
        setDiscovery(rows);
      } catch (e) {
        toast.error("Erro ao carregar oportunidades de regra");
      }
    });

  const loadRecurring = (filters: RecurringFilters) =>
    startRecurring(async () => {
      try {
        const rows = await getRecurringSuggestions(filters);
        setRecurring(rows);
      } catch (e) {
        toast.error("Erro ao carregar sugestões de recorrência");
      }
    });

  const loadConflicts = (filters: ConflictFilters) =>
    startConflicts(async () => {
      try {
        const rows = await getConflictTransactions(filters);
        setConflicts(rows);
      } catch (e) {
        toast.error("Erro ao carregar conflitos");
      }
    });

  useEffect(() => {
    loadDiscovery(discoveryFilters);
    loadRecurring(recurringFilters);
    loadConflicts(conflictFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTaxonomyOptionCreated = (opt: TaxonomyOption) => {
    setTaxonomyOptions((prev) => {
      const existing = prev.find((p) => p.leafId === opt.leafId);
      if (existing) return prev.map((p) => (p.leafId === opt.leafId ? opt : p));
      return [...prev, opt].sort((a, b) => a.label.localeCompare(b.label));
    });
  };

  const totalDiscoveryAbs = useMemo(
    () => discovery.reduce((acc, c) => acc + (Number(c.totalAbsAmount) || 0), 0),
    [discovery]
  );

  return (
    <Tabs defaultValue="rules" className="w-full">
      <TabsList className="w-full justify-start gap-1 rounded-2xl p-1.5 bg-secondary/50 border border-border">
        <TabsTrigger value="rules" className="rounded-xl font-bold gap-2">
          <Search className="w-4 h-4" /> Definição de regras
        </TabsTrigger>
        <TabsTrigger value="recurring" className="rounded-xl font-bold gap-2">
          <Repeat className="w-4 h-4" /> Recorrentes
        </TabsTrigger>
        <TabsTrigger value="conflicts" className="rounded-xl font-bold gap-2">
          <Swords className="w-4 h-4" /> Conflitos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rules" className="mt-6 space-y-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-lg font-bold">Filtros</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Apenas transações com classificação <code className="font-mono">OPEN</code>.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl font-bold"
              onClick={() => loadDiscovery(discoveryFilters)}
              disabled={isDiscoveryPending}
            >
              {isDiscoveryPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Atualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Input
              type="date"
              value={discoveryFilters.dateFrom ?? ""}
              onChange={(e) => setDiscoveryFilters((p) => ({ ...p, dateFrom: e.target.value || undefined }))}
              className="rounded-xl"
            />
            <Input
              type="date"
              value={discoveryFilters.dateTo ?? ""}
              onChange={(e) => setDiscoveryFilters((p) => ({ ...p, dateTo: e.target.value || undefined }))}
              className="rounded-xl"
            />
            <Input
              inputMode="decimal"
              placeholder="Min € (abs)"
              value={discoveryFilters.minAbsAmount ?? ""}
              onChange={(e) =>
                setDiscoveryFilters((p) => ({
                  ...p,
                  minAbsAmount: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="rounded-xl"
            />
            <Input
              inputMode="decimal"
              placeholder="Max € (abs)"
              value={discoveryFilters.maxAbsAmount ?? ""}
              onChange={(e) =>
                setDiscoveryFilters((p) => ({
                  ...p,
                  maxAbsAmount: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="rounded-xl"
            />
            <Select
              value={discoveryFilters.sortBy ?? "count"}
              onValueChange={(v) => setDiscoveryFilters((p) => ({ ...p, sortBy: v as any }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">Ocorrências</SelectItem>
                <SelectItem value="totalAbsAmount">Impacto total</SelectItem>
                <SelectItem value="lastSeen">Mais recente</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={discoveryFilters.sortDir ?? "desc"}
              onValueChange={(v) => setDiscoveryFilters((p) => ({ ...p, sortDir: v as any }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Direção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="font-mono">
                {discovery.length} padrões
              </Badge>
              <span>Total impacto: {formatCurrency(totalDiscoveryAbs)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                inputMode="numeric"
                placeholder="Limite"
                value={discoveryFilters.limit ?? 50}
                onChange={(e) =>
                  setDiscoveryFilters((p) => ({ ...p, limit: e.target.value ? Number(e.target.value) : 50 }))
                }
                className="w-24 rounded-xl"
              />
              <Button
                className="rounded-2xl font-bold"
                onClick={() => loadDiscovery(discoveryFilters)}
                disabled={isDiscoveryPending}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>

        {discovery.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground">
            Nenhuma oportunidade encontrada com os filtros atuais.
          </div>
        ) : (
          <div className="grid gap-4">
            {discovery.map((candidate) => (
              <RuleDiscoveryCard
                key={candidate.sampleId}
                candidate={candidate}
                taxonomyOptions={taxonomyOptions}
                onApplied={() => loadDiscovery(discoveryFilters)}
                onTaxonomyOptionCreated={onTaxonomyOptionCreated}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="recurring" className="mt-6 space-y-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-lg font-bold">Sugestões</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Apenas transações já classificadas (≠ <code className="font-mono">OPEN</code>).
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl font-bold"
              onClick={() => loadRecurring(recurringFilters)}
              disabled={isRecurringPending}
            >
              {isRecurringPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Atualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Input
              type="date"
              value={recurringFilters.dateFrom ?? ""}
              onChange={(e) => setRecurringFilters((p) => ({ ...p, dateFrom: e.target.value || undefined }))}
              className="rounded-xl"
            />
            <Input
              type="date"
              value={recurringFilters.dateTo ?? ""}
              onChange={(e) => setRecurringFilters((p) => ({ ...p, dateTo: e.target.value || undefined }))}
              className="rounded-xl"
            />
            <Input
              inputMode="numeric"
              placeholder="Min ocorr."
              value={recurringFilters.minOccurrences ?? 3}
              onChange={(e) =>
                setRecurringFilters((p) => ({ ...p, minOccurrences: e.target.value ? Number(e.target.value) : 3 }))
              }
              className="rounded-xl"
            />
            <Select
              value={recurringFilters.sortBy ?? "occurrences"}
              onValueChange={(v) => setRecurringFilters((p) => ({ ...p, sortBy: v as any }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="occurrences">Ocorrências</SelectItem>
                <SelectItem value="absAmount">Valor</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={recurringFilters.sortDir ?? "desc"}
              onValueChange={(v) => setRecurringFilters((p) => ({ ...p, sortDir: v as any }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Direção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
            <Input
              inputMode="numeric"
              placeholder="Limite"
              value={recurringFilters.limit ?? 50}
              onChange={(e) => setRecurringFilters((p) => ({ ...p, limit: e.target.value ? Number(e.target.value) : 50 }))}
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end">
            <Button className="rounded-2xl font-bold" onClick={() => loadRecurring(recurringFilters)} disabled={isRecurringPending}>
              Aplicar
            </Button>
          </div>
        </div>

        {recurring.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground">
            Nenhuma sugestão encontrada com os filtros atuais.
          </div>
        ) : (
          <div className="grid gap-3">
            {recurring.map((s) => (
              <div key={s.key} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">{s.occurrences}x</Badge>
                    <span className="font-bold">{formatCurrency(s.absAmount)}</span>
                    <Badge variant="outline" className="font-mono text-xs">{s.suggestedCadence}</Badge>
                    <span className="text-xs text-muted-foreground">conf {Math.round(s.confidence * 100)}%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {s.appCategoryName} &gt; {s.category1} &gt; {s.category2} &gt; {s.category3}
                  </div>
                  {s.sampleKeyDesc && <div className="text-xs text-muted-foreground font-mono">{s.sampleKeyDesc}</div>}
                </div>
                <Button
                  className={cn("rounded-2xl font-bold", isRecurringApplyPending && "opacity-80")}
                  disabled={isRecurringApplyPending}
                  onClick={() =>
                    startRecurringApply(async () => {
                      const res = await markRecurringGroup({
                        leafId: s.leafId,
                        merchantKey: s.merchantKey,
                        absAmount: s.absAmount,
                        confidence: s.confidence,
                      });
                      if (!res.success) {
                        toast.error("Não foi possível marcar como recorrente", { description: res.error });
                        return;
                      }
                      toast.success("Recorrência aplicada", { description: `${res.updated} transações marcadas.` });
                      loadRecurring(recurringFilters);
                    })
                  }
                >
                  {isRecurringApplyPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  Marcar recorrente
                </Button>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="conflicts" className="mt-6 space-y-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-lg font-bold">Conflitos de regras</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Quando múltiplas regras sugerem classificações diferentes, a transação fica em <code className="font-mono">OPEN</code> com candidatos.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl font-bold"
              onClick={() => loadConflicts(conflictFilters)}
              disabled={isConflictsPending}
            >
              {isConflictsPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Atualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input
              type="date"
              value={conflictFilters.dateFrom ?? ""}
              onChange={(e) => setConflictFilters((p) => ({ ...p, dateFrom: e.target.value || undefined }))}
              className="rounded-xl"
            />
            <Input
              type="date"
              value={conflictFilters.dateTo ?? ""}
              onChange={(e) => setConflictFilters((p) => ({ ...p, dateTo: e.target.value || undefined }))}
              className="rounded-xl"
            />
            <Select
              value={conflictFilters.sortBy ?? "date"}
              onValueChange={(v) => setConflictFilters((p) => ({ ...p, sortBy: v as any }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="absAmount">Valor (abs)</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={conflictFilters.sortDir ?? "desc"}
              onValueChange={(v) => setConflictFilters((p) => ({ ...p, sortDir: v as any }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Direção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
            <Input
              inputMode="numeric"
              placeholder="Limite"
              value={conflictFilters.limit ?? 50}
              onChange={(e) => setConflictFilters((p) => ({ ...p, limit: e.target.value ? Number(e.target.value) : 50 }))}
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end">
            <Button className="rounded-2xl font-bold" onClick={() => loadConflicts(conflictFilters)} disabled={isConflictsPending}>
              Aplicar
            </Button>
          </div>
        </div>

        {conflicts.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground">
            Nenhum conflito encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="grid gap-3">
            {conflicts.map((tx) => {
              const display = tx.aliasDesc || tx.simpleDesc || tx.descNorm || tx.descRaw;
              return (
                <div key={tx.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{display}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate">{tx.keyDesc ?? tx.descNorm}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={cn("font-bold font-mono", tx.amount < 0 ? "text-red-600" : "text-emerald-600")}>
                        {formatCurrency(tx.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.paymentDate).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-amber-700">Candidatos ({tx.classificationCandidates.length})</div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="rounded-xl font-bold"
                          disabled={isConflictAiPending}
                          onClick={() =>
                            startConflictAi(async () => {
                              const res = await suggestConflictResolution(tx.id);
                              if (!res.success) {
                                toast.error("IA indisponível", { description: res.error });
                                return;
                              }
                              setAiConflictTx(tx);
                              setAiConflictSuggestion(res.suggestion);
                            })
                          }
                        >
                          {isConflictAiPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Sugestão IA
                        </Button>
                        <Button variant="outline" className="rounded-xl font-bold" onClick={() => setSelectedConflict(tx)}>
                          Abrir
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      {tx.classificationCandidates.map((c) => (
                        <div key={c.ruleId} className="border border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-bold truncate">
                              {c.appCategoryName ?? "OPEN"} &gt; {c.category1} &gt; {c.category2} &gt; {c.category3}
                            </div>
                            <Badge className="font-mono text-[10px] bg-amber-100 text-amber-800 border-0">
                              {c.strict ? "STRICT" : `P${c.priority}`}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Match: <span className="font-mono font-bold text-amber-700">{c.matchedKeyword ?? "-"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            key_words: <span className="font-mono">{c.ruleKeyWords ?? "-"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            key_words_negative: <span className="font-mono">{c.ruleKeyWordsNegative ?? "-"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <TransactionDrawer
          transaction={selectedDrawerTx as any}
          open={!!selectedDrawerTx}
          onOpenChange={(open) => !open && setSelectedConflict(null)}
          onLeafChange={async (transactionId, leafId) => {
            const res = await updateTransactionCategory(transactionId, { leafId });
            if (!res.success) {
              toast.error("Erro ao atualizar classificação", { description: res.error });
              return;
            }
            toast.success("Conflito resolvido (manual)", { description: "Classificação aplicada à transação." });
            setSelectedConflict(null);
            loadConflicts(conflictFilters);
          }}
        />

        <Dialog
          open={!!aiConflictSuggestion && !!aiConflictTx}
          onOpenChange={(open) => {
            if (!open) {
              setAiConflictTx(null);
              setAiConflictSuggestion(null);
            }
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Sugestão de resolução (IA)</DialogTitle>
            </DialogHeader>
            {aiConflictTx && aiConflictSuggestion && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <span className="font-bold">Racional:</span> {aiConflictSuggestion.rationale}
                </div>
                <div className="grid gap-2">
                  {aiConflictSuggestion.suggestions.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Nenhuma sugestão retornada.</div>
                  ) : (
                    aiConflictSuggestion.suggestions.map((s) => {
                      const meta = aiConflictTx.classificationCandidates.find((c) => c.ruleId === s.rule_id);
                      return (
                        <div key={s.rule_id} className="border border-border rounded-xl p-4 bg-secondary/20">
                          <div className="font-bold text-sm">
                            {meta
                              ? `${meta.appCategoryName ?? "OPEN"} > ${meta.category1} > ${meta.category2} > ${meta.category3}`
                              : `Regra ${s.rule_id}`}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            add key_words: <span className="font-mono">{s.add_key_words ?? "-"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            add key_words_negative: <span className="font-mono">{s.add_key_words_negative ?? "-"}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setAiConflictTx(null);
                      setAiConflictSuggestion(null);
                    }}
                  >
                    Fechar
                  </Button>
                  <Button
                    className="rounded-xl font-bold"
                    disabled={isConflictAiApplyPending || aiConflictSuggestion.suggestions.length === 0}
                    onClick={() =>
                      startConflictAiApply(async () => {
                        for (const s of aiConflictSuggestion.suggestions) {
                          const res = await mergeRuleKeywordsById({
                            ruleId: s.rule_id,
                            addKeyWords: s.add_key_words,
                            addKeyWordsNegative: s.add_key_words_negative,
                          });
                          if (!res.success) {
                            toast.error("Falha ao atualizar regra", { description: res.error });
                            return;
                          }
                        }
                        await applyCategorization();
                        toast.success("Sugestões aplicadas", { description: "Regras atualizadas e transações reprocessadas." });
                        setAiConflictTx(null);
                        setAiConflictSuggestion(null);
                        loadConflicts(conflictFilters);
                      })
                    }
                  >
                    {isConflictAiApplyPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Aplicar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </TabsContent>
    </Tabs>
  );
}
