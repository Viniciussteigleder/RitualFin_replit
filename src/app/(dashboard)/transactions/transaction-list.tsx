"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
    Search,
    ChevronDown,
    ChevronUp,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { startOfWeek } from "date-fns";
import { TransactionFilters as TransactionFiltersComp } from "@/components/transactions/TransactionFilters";
import { TransactionGroup } from "@/components/transactions/TransactionGroup";
import { BulkActionsBar as BulkActionsBarComp } from "@/components/transactions/bulk-actions-bar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
    confirmTransaction,
    deleteTransaction,
    updateTransactionCategory,
    getTransactionsForList
} from "@/lib/actions/transactions";
import {
    bulkConfirmTransactions,
    bulkDeleteTransactions,
    exportTransactions
} from "@/lib/actions/bulk-operations";
import { toast } from "sonner";
import { TransactionDrawer } from "@/components/transactions/transaction-drawer";
import { TransactionFilters } from "@/components/transactions/filter-panel";
import { VirtualizedTransactionList } from "@/components/transactions/VirtualizedTransactionList";
import { FlickerProfiler } from "@/components/perf/flicker-profiler";
import { isDebugFlickerEnabledRuntime } from "@/lib/perf/ui-perf-flags";

type SortField = "date" | "amount" | "category" | "confidence";
type SortDirection = "asc" | "desc";

function SortableHeader({
    field,
    sortField,
    sortDirection,
    onSort,
    className,
    children,
}: {
    field: SortField;
    sortField: SortField;
    sortDirection: SortDirection;
    onSort: (field: SortField) => void;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <button onClick={() => onSort(field)} className={cn("flex items-center gap-1 hover:text-foreground transition-colors", className)}>
            {children}
            {sortField === field && (sortDirection === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
        </button>
    );
}

export function TransactionList({
    transactions: initialTransactions,
    initialFilters = {},
    aliasMap = {},
    initialHasMore = false,
    initialNextCursor = null,
    allCategories = [],
    allAccounts = []
}: {
    transactions: any[],
    initialFilters?: TransactionFilters,
    aliasMap?: Record<string, string>,
    initialHasMore?: boolean,
    initialNextCursor?: string | null,
    allCategories?: string[],
    allAccounts?: string[]
}) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [nextCursor, setNextCursor] = useState(initialNextCursor);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCompact, setIsCompact] = useState(false);
    const [hideCents, setHideCents] = useState(false);
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [isRefetching, setIsRefetching] = useState(false);
    const [viewMode, setViewMode] = useState<"day" | "week">("day");
    const router = useRouter();

    // Debug-only: allow deterministic, local mock data for flicker reproduction in E2E runs
    useEffect(() => {
        if (!isDebugFlickerEnabledRuntime()) return;
        if (window.localStorage.getItem("DEBUG_FLICKER_MOCK_DATA") !== "1") return;
        if (transactions.length > 0) return;

        const now = Date.now();
        const mock = Array.from({ length: 240 }).map((_, i) => {
            const d = new Date(now - i * 86400000);
            const dateKey = d.toISOString();
            return {
                id: `mock-${i}`,
                paymentDate: dateKey,
                date: dateKey,
                descRaw: `Mock Transaction ${i}`,
                descNorm: `Mock Transaction ${i}`,
                simpleDesc: `Mock ${i}`,
                amount: i % 2 === 0 ? -(i + 1) * 1.23 : (i + 1) * 2.34,
                category1: i % 3 === 0 ? "FOOD" : i % 3 === 1 ? "TRANSPORT" : "UTILITIES",
                confidence: (i % 100) / 100,
                needsReview: false,
                manualOverride: false,
                conflictFlag: false,
                source: i % 2 === 0 ? "MOCK-A" : "MOCK-B",
            };
        });
        setTransactions(mock as any);
        setHasMore(false);
        setNextCursor(null);
    }, [transactions.length]);

    // NOTE: Avoid forcing scroll position on mount; this can create visible "jump" flicker.
    // Kept behind the perf flag as a rollback lever in case someone depended on the old behavior.
    useEffect(() => {
        const fixesOn = window.localStorage.getItem("UI_PERF_FIXES") === "1" || process.env.NEXT_PUBLIC_UI_PERF_FIXES === "1";
        if (fixesOn) return;
        window.scrollTo(0, 0);
    }, []); // Run once on mount

    // Debounce search to reduce server calls
    const debouncedSearch = useDebouncedValue(search, 300);

    // Helper to refetch transactions with current filters
    const refetchTransactions = useCallback(async () => {
        setIsRefetching(true);
        try {
            const result = await getTransactionsForList({
                limit: 50,
                sources: filters.accounts,
                search: debouncedSearch || undefined,
                categories: filters.categories,
                minAmount: filters.minAmount,
                maxAmount: filters.maxAmount,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
            });

            setTransactions(result.items.map(tx => ({
                ...tx,
                date: tx.paymentDate,
                description: tx.descNorm || tx.descRaw
            })));
            setHasMore(result.hasMore);
            setNextCursor(result.nextCursor);
        } catch (error) {
            console.error('Failed to refetch transactions:', error);
        } finally {
            setIsRefetching(false);
        }
    }, [debouncedSearch, filters]);

    // Debounced refetch to batch filter changes
    const debouncedRefetch = useMemo(
        () => {
            let timeoutId: NodeJS.Timeout;
            return () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    refetchTransactions();
                }, 300); // 300ms debounce
            };
        },
        [refetchTransactions]
    );

    // Refetch transactions when filters change (server-side filtering)
    useEffect(() => {
        debouncedRefetch();
    }, [debouncedRefetch]);

    // Handle sorting (client-side for now, can be moved to server later)
    // Handle sorting (client-side for now, can be moved to server later)
    const handleSort = useCallback((field: SortField) => {
        setSortField(prevField => {
            if (prevField === field) {
                setSortDirection(prevDirection => prevDirection === "asc" ? "desc" : "asc");
                return prevField;
            } else {
                setSortDirection("desc");
                return field;
            }
        });
    }, []);

    // Sort and group transactions (now operating on server-filtered data)
    const sortedTransactions = useMemo(() => {
        const sorted = [...transactions].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "date":
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case "amount":
                    comparison = Math.abs(a.amount) - Math.abs(b.amount);
                    break;
                case "category":
                    comparison = (a.category1 || "").localeCompare(b.category1 || "");
                    break;
                case "confidence":
                    comparison = (a.confidence || 0) - (b.confidence || 0);
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });
        return sorted;
    }, [transactions, sortField, sortDirection]);

    const groupedTransactions = useMemo(() => {
        return sortedTransactions.reduce((acc: Record<string, any[]>, tx: any) => {
            let dateKey;
            if (viewMode === "week") {
                // Group by start of week (Monday)
                dateKey = startOfWeek(new Date(tx.date), { weekStartsOn: 1 }).toISOString().split('T')[0];
            } else {
                dateKey = new Date(tx.date).toISOString().split('T')[0];
            }
            
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(tx);
            return acc;
        }, {} as Record<string, any[]>);
    }, [sortedTransactions, viewMode]);

    const sortedDateKeys = useMemo(() => {
        return Object.keys(groupedTransactions).sort((a, b) =>
            sortDirection === "desc"
                ? new Date(b).getTime() - new Date(a).getTime()
                : new Date(a).getTime() - new Date(b).getTime()
        );
    }, [groupedTransactions, sortDirection]);

    // Memoize available categories/accounts
    const availableCategories = useMemo(() => {
        return allCategories.length > 0
            ? allCategories
            : Array.from(new Set(transactions.map(t => t.category1).filter(Boolean)));
    }, [allCategories, transactions]);

    const availableAccounts = useMemo(() => {
        return allAccounts.length > 0
            ? allAccounts
            : Array.from(new Set(transactions.map(t => t.source).filter(Boolean)));
    }, [allAccounts, transactions]);

    // Memoized event handlers
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }
            return newSelected;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedIds(prev => {
            if (prev.size === transactions.length && transactions.length > 0) {
                return new Set();
            } else {
                return new Set(transactions.map(tx => tx.id));
            }
        });
    }, [transactions]);

    const handleConfirm = useCallback(async (id: string) => {
        try {
            await confirmTransaction(id);
            toast.success("Transação confirmada");
            if (selectedTx?.id === id) setSelectedTx(null);
            // Optimistic update: remove needsReview flag
            setTransactions(prev => prev.map(tx =>
                tx.id === id ? { ...tx, needsReview: false } : tx
            ));
        } catch (error) {
            toast.error("Erro ao confirmar transação");
        }
    }, [selectedTx?.id]);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm("Tem certeza que deseja deletar esta transação?")) return;
        try {
            await deleteTransaction(id);
            toast.success("Transação deletada");
            if (selectedTx?.id === id) setSelectedTx(null);
            // Optimistic update: remove from list
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        } catch (error) {
            toast.error("Erro ao deletar transação");
        }
    }, [selectedTx?.id]);

    const handleLeafUpdate = useCallback(async (id: string, leafId: string) => {
        try {
            await updateTransactionCategory(id, { leafId });
            toast.success("Classificação atualizada");
        } catch (error) {
            toast.error("Erro ao atualizar classificação");
        }
    }, []);

    // Bulk action handlers - refetch instead of reload
    const handleBulkConfirm = useCallback(async () => {
        const ids = Array.from(selectedIds);
        try {
            const result = await bulkConfirmTransactions(ids);
            if (result.success) {
                toast.success(`${result.data.updated} transações confirmadas!`);
                setSelectedIds(new Set());
                // Optimistic update instead of page reload
                setTransactions(prev => prev.map(tx =>
                    ids.includes(tx.id) ? { ...tx, needsReview: false } : tx
                ));
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao confirmar transações");
        }
    }, [selectedIds, router]);

    const handleBulkDelete = useCallback(async () => {
        const ids = Array.from(selectedIds);
        if (!confirm(`Tem certeza que deseja eliminar ${ids.length} transações?`)) {
            return;
        }

        try {
            const result = await bulkDeleteTransactions(ids);
            if (result.success) {
                toast.success(`${result.data.deleted} transações eliminadas!`);
                setSelectedIds(new Set());
                // Optimistic update instead of page reload
                setTransactions(prev => prev.filter(tx => !ids.includes(tx.id)));
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao eliminar transações");
        }
    }, [selectedIds, router]);

    // Fix: Include ALL filters in load more pagination
    const handleLoadMore = useCallback(async () => {
        if (!nextCursor || isLoadingMore) return;

        setIsLoadingMore(true);
        try {
            const result = await getTransactionsForList({
                limit: 50,
                cursor: nextCursor,
                sources: filters.accounts,
                search: debouncedSearch || undefined,
                categories: filters.categories,
                minAmount: filters.minAmount,
                maxAmount: filters.maxAmount,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
            });

            setTransactions(prev => [...prev, ...result.items.map(tx => ({
                ...tx,
                date: tx.paymentDate,
                description: tx.descNorm || tx.descRaw
            }))]);
            setHasMore(result.hasMore);
            setNextCursor(result.nextCursor);
        } catch (error) {
            toast.error("Erro ao carregar mais transações");
        } finally {
            setIsLoadingMore(false);
        }
    }, [nextCursor, isLoadingMore, filters, debouncedSearch]);

    const handleBulkExport = useCallback(async () => {
        const ids = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;
        try {
            const result = await exportTransactions(ids);
            if (result.success) {
                const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = result.data.filename;
                link.click();
                URL.revokeObjectURL(url);

                toast.success("Exportação concluída!");
                if (selectedIds.size > 0) {
                    setSelectedIds(new Set());
                }
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao exportar transações");
        }
    }, [selectedIds]);

    const handleEditClick = useCallback((tx: any) => setSelectedTx(tx), []);
    const handleRowClick = useCallback((tx: any) => setSelectedTx(tx), []);
    const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);
    const handleClearFilters = useCallback(() => { setSearch(""); setFilters({}); }, []);

    return (
      <FlickerProfiler id="TransactionList">
        <div className="space-y-6 pb-32" data-testid="transactions-list">
            <TransactionFiltersComp
                search={search}
                onSearchChange={setSearch}
                onFilterChange={setFilters}
                availableCategories={availableCategories}
                availableAccounts={availableAccounts}
                isCompact={isCompact}
                onToggleCompact={() => setIsCompact(!isCompact)}
                hideCents={hideCents}
                onToggleHideCents={() => setHideCents(!hideCents)}
                onExport={handleBulkExport}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Table Header (Desktop Only) */}
            <div className="hidden md:grid grid-cols-[40px_80px_2.5fr_1fr_2fr_80px_80px] gap-3 px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider bg-secondary/80 rounded-t-3xl border border-border">
                <div className="flex justify-center">
                    <Checkbox checked={selectedIds.size === transactions.length && transactions.length > 0} onCheckedChange={toggleSelectAll} className="h-4 w-4 rounded border-2" />
                </div>
                <SortableHeader field="date" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Data</SortableHeader>
                <div>Estabelecimento</div>
                <SortableHeader field="amount" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Valor</SortableHeader>
                <SortableHeader field="category" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Classificação</SortableHeader>
                {/* Merged Cat1/Cat2 into Classification */}
                <SortableHeader field="confidence" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>AI %</SortableHeader>
                <div className="text-center">Ações</div>
            </div>

            {/* Transaction Rows Grouped by Date */}
            {transactions.length >= 100 ? (
                <VirtualizedTransactionList
                    groupedTransactions={groupedTransactions}
                    sortedDateKeys={sortedDateKeys}
                    isCompact={isCompact}
                    hideCents={hideCents}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onEditClick={handleEditClick}
                    onClick={handleRowClick}
                    aliasMap={aliasMap}
                    viewMode={viewMode}
                />
            ) : (
                <div className="bg-card border border-border border-t-0 rounded-b-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-border/30">
                    {isRefetching ? (
                        <div className="text-center py-32 flex flex-col items-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground font-medium">Atualizando transações...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-32 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-[3rem] bg-gradient-to-br from-secondary to-secondary/30 flex items-center justify-center mb-8 shadow-xl text-muted-foreground/40">
                                <Search className="h-12 w-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Nenhuma transação encontrada</h3>
                            <p className="text-base text-muted-foreground mt-3 font-medium max-w-md mx-auto">
                                Tente ajustar seus filtros ou remover termos de busca.
                            </p>
                              <Button
                                variant="outline"
                                className="mt-8 rounded-2xl h-12 px-8 font-bold border-border hover:bg-secondary transition-[background-color,color,border-color,box-shadow] duration-150"
                                onClick={handleClearFilters}
                              >
                                Limpar Filtros
                            </Button>
                        </div>
                    ) : (
                        sortedDateKeys.map(dateKey => (
                            <TransactionGroup
                                key={dateKey}
                                dateKey={dateKey}
                                transactions={groupedTransactions[dateKey]}
                                isCompact={isCompact}
                                hideCents={hideCents}
                                selectedIds={selectedIds}
                                onToggleSelect={toggleSelect}
                                onEditClick={handleEditClick}
                                onClick={handleRowClick}
                                aliasMap={aliasMap}
                                // viewMode prop might not be needed for simple group if headers are handled differently
                                // but if TransactionGroup renders header, we need it. 
                                // Let's check TransactionGroup usage. 
                                // It seems TransactionGroup is used when NOT virtualized (less than 100 items).
                            />
                        ))
                    )}
                    </div>
                </div>
            )}

            {hasMore && (
                <div className="flex justify-center pt-4 pb-8">
                    <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="rounded-2xl h-12 px-12 font-bold border-border hover:bg-secondary transition-[background-color,color,border-color,box-shadow] duration-150 shadow-sm"
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Carregando...
                            </>
                        ) : (
                            "Carregar mais transações"
                        )}
                    </Button>
                </div>
            )}

            <TransactionDrawer
                transaction={selectedTx}
                open={!!selectedTx}
                onOpenChange={(open) => !open && setSelectedTx(null)}
                onConfirm={handleConfirm}
                onDelete={handleDelete}
                onLeafChange={handleLeafUpdate}
            />

            <BulkActionsBarComp
                selectedCount={selectedIds.size}
                onClassifyAll={handleBulkConfirm}
                onExport={handleBulkExport}
                onDelete={handleBulkDelete}
                onClearSelection={handleClearSelection}
            />
        </div>
      </FlickerProfiler>
    );
}
