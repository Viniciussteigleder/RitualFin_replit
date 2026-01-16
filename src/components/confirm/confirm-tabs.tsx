"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import { toast } from "sonner";
import { AlertTriangle, Filter, Loader2, RefreshCw, Repeat, Search, Swords, Wand2, X } from "lucide-react";
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

type TokenMark = { token: string; className: string };

function toISODateInput(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitKeywords(value: string | null | undefined) {
  if (!value) return [];
  return value
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function highlightText(text: string, marks: TokenMark[]) {
  let nodes: Array<string | JSX.Element> = [text];
  for (const mark of marks) {
    const token = mark.token.trim();
    if (!token) continue;
    const re = new RegExp(`(${escapeRegExp(token)})`, "gi");
    const next: Array<string | JSX.Element> = [];
    for (const node of nodes) {
      if (typeof node !== "string") {
        next.push(node);
        continue;
      }
      const parts = node.split(re);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]!;
        if (i % 2 === 1) {
          next.push(
            <mark
              key={`${token}-${i}-${part}`}
              className={cn("rounded px-1 py-0.5 font-mono text-[11px] font-bold", mark.className)}
            >
              {part}
            </mark>
          );
        } else if (part) {
          next.push(part);
        }
      }
    }
    nodes = next;
  }
  return nodes;
}

function segmentedButtonClass(active: boolean, tone: "neutral" | "emerald" | "sky" | "amber" = "neutral") {
  const base = "w-full rounded-xl font-bold";
  if (!active) return cn(base, "bg-background hover:bg-secondary text-foreground border-border");
  if (tone === "emerald") return cn(base, "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900");
  if (tone === "sky") return cn(base, "bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-900");
  if (tone === "amber") return cn(base, "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900");
  return cn(base, "bg-secondary text-foreground border-border");
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

  const resetDiscoveryFilters = () =>
    setDiscoveryFilters({
      dateFrom: toISODateInput(new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)),
      sortBy: "count",
      sortDir: "desc",
      limit: 50,
      dateTo: undefined,
      minAbsAmount: undefined,
      maxAbsAmount: undefined,
    });

  const resetRecurringFilters = () =>
    setRecurringFilters({
      dateFrom: toISODateInput(new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)),
      minOccurrences: 3,
      sortBy: "occurrences",
      sortDir: "desc",
      limit: 50,
      dateTo: undefined,
    });

  const resetConflictFilters = () =>
    setConflictFilters({
      dateFrom: toISODateInput(new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)),
      sortBy: "date",
      sortDir: "desc",
      limit: 50,
      dateTo: undefined,
    });

  return (
    <Tabs defaultValue="rules" className="w-full">
      <TabsList className="w-full justify-start gap-2 rounded-3xl p-2 bg-card/70 border border-border shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <TabsTrigger
          value="rules"
          className="rounded-2xl font-black gap-2 px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
        >
          <Search className="w-4 h-4" /> Definição de regras
          <Badge variant="secondary" className="font-mono text-[10px] h-5 px-2">
            {discovery.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="recurring"
          className="rounded-2xl font-black gap-2 px-4 py-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white"
        >
          <Repeat className="w-4 h-4" /> Recorrentes
          <Badge variant="secondary" className="font-mono text-[10px] h-5 px-2">
            {recurring.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="conflicts"
          className="rounded-2xl font-black gap-2 px-4 py-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white"
        >
          <Swords className="w-4 h-4" /> Conflitos
          <Badge variant="secondary" className="font-mono text-[10px] h-5 px-2">
            {conflicts.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rules" className="mt-6 space-y-6">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-black tracking-tight">Filtros (OPEN)</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Ajuste e clique em <span className="font-bold">Aplicar filtros</span>. Use <span className="font-bold">Atualizar dados</span> para recarregar.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-2xl font-bold"
                onClick={() => {
                  resetDiscoveryFilters();
                  loadDiscovery({
                    dateFrom: toISODateInput(new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)),
                    sortBy: "count",
                    sortDir: "desc",
                    limit: 50,
                  });
                }}
                disabled={isDiscoveryPending}
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl font-bold"
                onClick={() => loadDiscovery(discoveryFilters)}
                disabled={isDiscoveryPending}
              >
                {isDiscoveryPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Atualizar dados
              </Button>
            </div>
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
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass(discoveryFilters.sortBy === "count", "emerald")}
                onClick={() => setDiscoveryFilters((p) => ({ ...p, sortBy: "count" }))}
              >
                Ocorr.
              </Button>
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass(discoveryFilters.sortBy === "totalAbsAmount", "emerald")}
                onClick={() => setDiscoveryFilters((p) => ({ ...p, sortBy: "totalAbsAmount" }))}
              >
                €
              </Button>
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass(discoveryFilters.sortBy === "lastSeen", "emerald")}
                onClick={() => setDiscoveryFilters((p) => ({ ...p, sortBy: "lastSeen" }))}
              >
                Recente
              </Button>
            </ButtonGroup>
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass((discoveryFilters.sortDir ?? "desc") === "desc", "emerald")}
                onClick={() => setDiscoveryFilters((p) => ({ ...p, sortDir: "desc" }))}
              >
                Desc
              </Button>
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass((discoveryFilters.sortDir ?? "desc") === "asc", "emerald")}
                onClick={() => setDiscoveryFilters((p) => ({ ...p, sortDir: "asc" }))}
              >
                Asc
              </Button>
            </ButtonGroup>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="font-mono">
                {discovery.length} padrões
              </Badge>
              <Badge variant="outline" className="font-mono">
                Impacto: {formatCurrency(totalDiscoveryAbs)}
              </Badge>
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
                className="rounded-2xl font-black"
                onClick={() => loadDiscovery(discoveryFilters)}
                disabled={isDiscoveryPending}
              >
                Aplicar filtros
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
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-black tracking-tight">Filtros (≠ OPEN)</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Sugestões por padrão de pagamento. Ajuste frequência/dia/meses antes de aplicar.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-2xl font-bold"
                onClick={() => {
                  resetRecurringFilters();
                  loadRecurring({
                    dateFrom: toISODateInput(new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)),
                    minOccurrences: 3,
                    sortBy: "occurrences",
                    sortDir: "desc",
                    limit: 50,
                  });
                }}
                disabled={isRecurringPending}
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl font-bold"
                onClick={() => loadRecurring(recurringFilters)}
                disabled={isRecurringPending}
              >
                {isRecurringPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Atualizar dados
              </Button>
            </div>
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
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass((recurringFilters.sortBy ?? "occurrences") === "occurrences", "sky")}
                onClick={() => setRecurringFilters((p) => ({ ...p, sortBy: "occurrences" }))}
              >
                Ocorr.
              </Button>
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass((recurringFilters.sortBy ?? "occurrences") === "absAmount", "sky")}
                onClick={() => setRecurringFilters((p) => ({ ...p, sortBy: "absAmount" }))}
              >
                €
              </Button>
            </ButtonGroup>
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass((recurringFilters.sortDir ?? "desc") === "desc", "sky")}
                onClick={() => setRecurringFilters((p) => ({ ...p, sortDir: "desc" }))}
              >
                Desc
              </Button>
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass((recurringFilters.sortDir ?? "desc") === "asc", "sky")}
                onClick={() => setRecurringFilters((p) => ({ ...p, sortDir: "asc" }))}
              >
                Asc
              </Button>
            </ButtonGroup>
            <Input
              inputMode="numeric"
              placeholder="Limite"
              value={recurringFilters.limit ?? 50}
              onChange={(e) => setRecurringFilters((p) => ({ ...p, limit: e.target.value ? Number(e.target.value) : 50 }))}
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end">
            <Button className="rounded-2xl font-black" onClick={() => loadRecurring(recurringFilters)} disabled={isRecurringPending}>
              Aplicar filtros
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
              <RecurringSuggestionCard
                key={s.key}
                suggestion={s}
                disabled={isRecurringApplyPending}
                onApply={(payload) =>
                  startRecurringApply(async () => {
                    const res = await markRecurringGroup(payload);
                    if (!res.success) {
                      toast.error("Não foi possível marcar como recorrente", { description: res.error });
                      return;
                    }
                    toast.success("Recorrência aplicada", { description: `${res.updated} transações marcadas.` });
                    loadRecurring(recurringFilters);
                  })
                }
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="conflicts" className="mt-6 space-y-6">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-black tracking-tight">Filtros (Conflitos)</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Compare candidatos, ajuste palavras-chave e confirme. Se preferir, abra a transação para resolver manualmente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-2xl font-bold"
                onClick={() => {
                  resetConflictFilters();
                  loadConflicts({
                    dateFrom: toISODateInput(new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)),
                    sortBy: "date",
                    sortDir: "desc",
                    limit: 50,
                  });
                }}
                disabled={isConflictsPending}
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl font-bold"
                onClick={() => loadConflicts(conflictFilters)}
                disabled={isConflictsPending}
              >
                {isConflictsPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Atualizar dados
              </Button>
            </div>
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
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass((conflictFilters.sortBy ?? "date") === "date", "amber")}
                onClick={() => setConflictFilters((p) => ({ ...p, sortBy: "date" }))}
              >
                Data
              </Button>
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass((conflictFilters.sortBy ?? "date") === "absAmount", "amber")}
                onClick={() => setConflictFilters((p) => ({ ...p, sortBy: "absAmount" }))}
              >
                €
              </Button>
            </ButtonGroup>
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass((conflictFilters.sortDir ?? "desc") === "desc", "amber")}
                onClick={() => setConflictFilters((p) => ({ ...p, sortDir: "desc" }))}
              >
                Desc
              </Button>
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass((conflictFilters.sortDir ?? "desc") === "asc", "amber")}
                onClick={() => setConflictFilters((p) => ({ ...p, sortDir: "asc" }))}
              >
                Asc
              </Button>
            </ButtonGroup>
            <Input
              inputMode="numeric"
              placeholder="Limite"
              value={conflictFilters.limit ?? 50}
              onChange={(e) => setConflictFilters((p) => ({ ...p, limit: e.target.value ? Number(e.target.value) : 50 }))}
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end">
            <Button className="rounded-2xl font-black" onClick={() => loadConflicts(conflictFilters)} disabled={isConflictsPending}>
              Aplicar filtros
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
              const keyDesc = tx.keyDesc ?? tx.descNorm ?? tx.descRaw;

              return (
                <div key={tx.id} className="bg-card border border-border rounded-3xl p-4 md:p-6 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-4 lg:gap-6">
                    {/* Left: transaction context */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-black text-base leading-tight truncate">{display}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.paymentDate).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={cn("font-black font-mono", tx.amount < 0 ? "text-red-600" : "text-emerald-600")}>
                            {formatCurrency(tx.amount)}
                          </div>
                          <Badge variant="outline" className="mt-1 font-mono text-[10px]">
                            conflito
                          </Badge>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-secondary/15 p-3">
                        <div className="text-[11px] font-black text-muted-foreground uppercase tracking-wide mb-1">
                          key_desc
                        </div>
                        <div className="text-sm font-mono leading-relaxed break-words">
                          {keyDesc}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="rounded-2xl font-bold"
                          onClick={() => setSelectedConflict(tx)}
                        >
                          Abrir transação
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-2xl font-bold"
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
                      </div>
                    </div>

                    {/* Right: candidates */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-black text-amber-700">
                          Candidatos ({tx.classificationCandidates.length})
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ajuste palavras-chave e confirme.
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {tx.classificationCandidates.map((c) => {
                          const marks: TokenMark[] = [
                            ...splitKeywords(c.ruleKeyWords).map((t) => ({
                              token: t,
                              className: "bg-emerald-100 text-emerald-800",
                            })),
                            ...splitKeywords(c.ruleKeyWordsNegative).map((t) => ({
                              token: t,
                              className: "bg-red-100 text-red-800",
                            })),
                          ];
                          if (c.matchedKeyword) {
                            marks.unshift({ token: c.matchedKeyword, className: "bg-amber-100 text-amber-800" });
                          }

                          return (
                            <ConflictCandidateEditor
                              key={c.ruleId}
                              txId={tx.id}
                              keyDesc={keyDesc}
                              candidate={c}
                              marks={marks}
                              onSaved={async () => {
                                await applyCategorization();
                                loadConflicts(conflictFilters);
                              }}
                            />
                          );
                        })}
                      </div>
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

function ConflictCandidateEditor(props: {
  txId: string;
  keyDesc: string;
  marks: TokenMark[];
  candidate: ConflictTransaction["classificationCandidates"][number];
  onSaved: () => Promise<void>;
}) {
  const { candidate, keyDesc, marks } = props;
  const [isSaving, startSaving] = useTransition();
  const [addKeyWords, setAddKeyWords] = useState("");
  const [addKeyWordsNegative, setAddKeyWordsNegative] = useState("");

  const chain = `${candidate.appCategoryName ?? "OPEN"} > ${candidate.category1} > ${candidate.category2} > ${candidate.category3}`;
  const existingKW = candidate.ruleKeyWords ?? "";
  const existingNeg = candidate.ruleKeyWordsNegative ?? "";

  return (
    <div className="rounded-2xl border border-amber-200/60 bg-amber-50/20 dark:bg-amber-950/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-black text-sm truncate">{chain}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Match:{" "}
            <span className="font-mono font-bold text-amber-700">
              {candidate.matchedKeyword ?? "-"}
            </span>
          </div>
        </div>
        <Badge className="font-mono text-[10px] bg-amber-100 text-amber-800 border-0 shrink-0">
          {candidate.strict ? "STRICT" : `P${candidate.priority}`}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-1">key_words</div>
          <div className="text-xs font-mono break-words leading-relaxed">{highlightText(existingKW || "-", marks)}</div>
          <div className="mt-2">
            <Input
              value={addKeyWords}
              onChange={(e) => setAddKeyWords(e.target.value)}
              placeholder="Adicionar (separar por ;)…"
              className="h-9 rounded-xl font-mono text-xs"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-3">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-1">key_words_negative</div>
          <div className="text-xs font-mono break-words leading-relaxed">{highlightText(existingNeg || "-", marks)}</div>
          <div className="mt-2">
            <Input
              value={addKeyWordsNegative}
              onChange={(e) => setAddKeyWordsNegative(e.target.value)}
              placeholder="Adicionar exclusões (separar por ;)…"
              className="h-9 rounded-xl font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-background/60 p-3">
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-1">key_desc (marcado)</div>
        <div className="text-xs font-mono break-words leading-relaxed">{highlightText(keyDesc, marks)}</div>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <Button
          className="rounded-2xl font-black"
          disabled={isSaving || (!addKeyWords.trim() && !addKeyWordsNegative.trim())}
          onClick={() =>
            startSaving(async () => {
              const res = await mergeRuleKeywordsById({
                ruleId: candidate.ruleId,
                addKeyWords: addKeyWords.trim() || null,
                addKeyWordsNegative: addKeyWordsNegative.trim() || null,
              });
              if (!res.success) {
                toast.error("Erro ao salvar regra", { description: res.error });
                return;
              }
              setAddKeyWords("");
              setAddKeyWordsNegative("");
              toast.success("Mudança confirmada", { description: "Regra atualizada e aplicada." });
              await props.onSaved();
            })
          }
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Confirmar mudança
        </Button>
      </div>
    </div>
  );
}

function cadenceLabel(cadence: RecurringSuggestion["suggestedCadence"]) {
  if (cadence === "monthly") return "Mensal";
  if (cadence === "quarterly") return "Quartal";
  if (cadence === "yearly") return "Anual";
  if (cadence === "weekly") return "Semanal";
  return "Desconhecido";
}

function monthLabel(month: number) {
  const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return labels[month - 1] ?? String(month);
}

function nextExpectedDate(input: {
  last: Date;
  cadence: RecurringSuggestion["suggestedCadence"];
  expectedDayOfMonth: number | null;
  expectedMonths: number[];
}) {
  const last = new Date(input.last);
  const y = last.getUTCFullYear();
  const m = last.getUTCMonth() + 1; // 1..12
  const clampDay = (yyyy: number, mm: number, dd: number) => {
    const lastDay = new Date(Date.UTC(yyyy, mm, 0)).getUTCDate(); // mm is 1..12
    return Math.max(1, Math.min(dd, lastDay));
  };

  if (input.cadence === "weekly") {
    return new Date(last.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  if (input.cadence === "monthly") {
    const day = input.expectedDayOfMonth ?? last.getUTCDate();
    const nextMonth = m === 12 ? 1 : m + 1;
    const nextYear = m === 12 ? y + 1 : y;
    const dd = clampDay(nextYear, nextMonth, day);
    return new Date(Date.UTC(nextYear, nextMonth - 1, dd));
  }

  if (input.cadence === "quarterly" || input.cadence === "yearly") {
    const months = (input.expectedMonths ?? []).filter((x) => x >= 1 && x <= 12).sort((a, b) => a - b);
    if (!months.length) return null;
    const day = input.expectedDayOfMonth ?? last.getUTCDate();
    const nextMonth = months.find((mm) => mm > m) ?? months[0]!;
    const nextYear = nextMonth > m ? y : y + 1;
    const dd = clampDay(nextYear, nextMonth, day);
    return new Date(Date.UTC(nextYear, nextMonth - 1, dd));
  }

  return null;
}

function RecurringSuggestionCard(props: {
  suggestion: RecurringSuggestion;
  disabled: boolean;
  onApply: (payload: Parameters<typeof markRecurringGroup>[0]) => void;
}) {
  const { suggestion, disabled, onApply } = props;
  const [cadence, setCadence] = useState<RecurringSuggestion["suggestedCadence"]>(suggestion.suggestedCadence);
  const [expectedDay, setExpectedDay] = useState<number | "">(
    suggestion.expectedDayOfMonth && suggestion.expectedDayOfMonth >= 1 && suggestion.expectedDayOfMonth <= 31
      ? suggestion.expectedDayOfMonth
      : ""
  );
  const [expectedMonths, setExpectedMonths] = useState<number[]>(suggestion.expectedMonths ?? []);

  const chain = `${suggestion.appCategoryName} > ${suggestion.category1} > ${suggestion.category2} > ${suggestion.category3}`;
  const scheduleText =
    cadence === "monthly"
      ? expectedDay
        ? `Dia ${expectedDay}`
        : "Dia do mês indefinido"
      : cadence === "quarterly" || cadence === "yearly"
        ? expectedMonths.length
          ? expectedMonths.map(monthLabel).join(", ")
          : "Meses indefinidos"
        : cadence === "weekly"
          ? "Semanal"
          : "—";

  const nextDate = useMemo(() => {
    return nextExpectedDate({
      last: suggestion.sampleDate,
      cadence,
      expectedDayOfMonth: cadence === "monthly" ? (expectedDay === "" ? null : Number(expectedDay)) : suggestion.expectedDayOfMonth,
      expectedMonths,
    });
  }, [cadence, expectedDay, expectedMonths, suggestion.expectedDayOfMonth, suggestion.sampleDate]);

  const toggleMonth = (m: number) => {
    setExpectedMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort((a, b) => a - b)));
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-mono">{suggestion.occurrences}x</Badge>
            <Badge variant="outline" className="font-mono text-xs">{suggestion.source ?? "Conta"}</Badge>
            <Badge
              className={cn(
                "font-mono text-xs border-0",
                suggestion.direction === "Despesa" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
              )}
            >
              {suggestion.direction}
            </Badge>
            <span className="font-black">{formatCurrency(suggestion.absAmount)}</span>
            <span className="text-xs text-muted-foreground">conf {Math.round(suggestion.confidence * 100)}%</span>
          </div>
          <div className="font-black truncate">{suggestion.merchantKey}</div>
          <div className="text-sm text-muted-foreground truncate">{chain}</div>
          {suggestion.sampleKeyDesc && (
            <div className="text-xs text-muted-foreground font-mono truncate">{suggestion.sampleKeyDesc}</div>
          )}
          <div className="text-xs text-muted-foreground">
            Último: <span className="font-mono font-bold">{new Date(suggestion.sampleDate).toLocaleDateString("pt-BR")}</span>
            {nextDate && (
              <>
                {" "}
                • Próximo: <span className="font-mono font-bold">{new Date(nextDate).toLocaleDateString("pt-BR")}</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-secondary/20 p-3">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-2">Frequência</div>
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass(cadence === "monthly", "sky")}
                onClick={() => setCadence("monthly")}
              >
                Mensal
              </Button>
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass(cadence === "quarterly", "sky")}
                onClick={() => setCadence("quarterly")}
              >
                Quartal
              </Button>
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass(cadence === "yearly", "sky")}
                onClick={() => setCadence("yearly")}
              >
                Anual
              </Button>
              <Button
                type="button"
                variant="outline"
                className={segmentedButtonClass(cadence === "unknown", "sky")}
                onClick={() => setCadence("unknown")}
              >
                Outro
              </Button>
            </ButtonGroup>
            <div className="mt-2 text-xs text-muted-foreground">
              Sugestão IA: <span className="font-bold">{cadenceLabel(suggestion.suggestedCadence)}</span> • {scheduleText}
            </div>
          </div>

          {cadence === "monthly" && (
            <div className="rounded-2xl border border-border bg-secondary/20 p-3">
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-2">
                Dia esperado (mensal)
              </div>
              <Input
                inputMode="numeric"
                value={expectedDay}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return setExpectedDay("");
                  const n = Number(v);
                  if (!Number.isFinite(n)) return;
                  setExpectedDay(Math.max(1, Math.min(31, Math.floor(n))));
                }}
                placeholder="Ex: 15"
                className="rounded-xl font-mono"
              />
            </div>
          )}

          {(cadence === "quarterly" || cadence === "yearly") && (
            <div className="rounded-2xl border border-border bg-secondary/20 p-3">
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-2">
                {cadence === "quarterly" ? "Meses esperados (quartal)" : "Mês esperado (anual)"}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, idx) => {
                  const m = idx + 1;
                  const active = expectedMonths.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMonth(m)}
                      className={cn(
                        "h-9 rounded-xl border text-xs font-bold",
                        active
                          ? "bg-sky-600 text-white border-sky-600"
                          : "bg-background hover:bg-secondary border-border text-muted-foreground"
                      )}
                    >
                      {monthLabel(m)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            className={cn("w-full rounded-2xl font-black", disabled && "opacity-80")}
            disabled={disabled}
            onClick={() =>
              onApply({
                leafId: suggestion.leafId,
                merchantKey: suggestion.merchantKey,
                absAmount: suggestion.absAmount,
                confidence: suggestion.confidence,
                cadence,
                expectedDayOfMonth: expectedDay === "" ? null : Number(expectedDay),
                expectedMonths,
              })
            }
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Marcar recorrente
          </Button>
        </div>
      </div>
    </div>
  );
}
