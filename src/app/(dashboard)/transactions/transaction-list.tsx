"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Search,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { TransactionFilters as TransactionFiltersComp } from "@/components/transactions/TransactionFilters";
import { TransactionGroup } from "@/components/transactions/TransactionGroup";
import { BulkActionsBar as BulkActionsBarComp } from "@/components/transactions/bulk-actions-bar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
    confirmTransaction,
    deleteTransaction,
    updateTransactionCategory
} from "@/lib/actions/transactions";
import {
    bulkConfirmTransactions,
    bulkDeleteTransactions,
    exportTransactions
} from "@/lib/actions/bulk-operations";
import { toast } from "sonner";
import { TransactionDrawer } from "@/components/transactions/transaction-drawer";
import { TransactionFilters } from "@/components/transactions/filter-panel";

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

export function TransactionList({ transactions, initialFilters = {}, aliasMap = {} }: { transactions: any[], initialFilters?: TransactionFilters, aliasMap?: Record<string, string> }) {
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCompact, setIsCompact] = useState(false);
    const [hideCents, setHideCents] = useState(false);
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    // Handle sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const filtered = useMemo(() => {
        return transactions.filter(tx => {
            const descMatch = (tx.descNorm || tx.descRaw || "").toLowerCase();
            const catMatch = (tx.category1 || "").toLowerCase();
            const matchesSearch = descMatch.includes(search.toLowerCase()) ||
                catMatch.includes(search.toLowerCase());

            if (!matchesSearch) return false;

            if (filters.categories?.length && !filters.categories.includes(tx.category1)) return false;
            if (filters.accounts?.length && !filters.accounts.includes(tx.source)) return false;
            if (filters.minAmount !== undefined && Math.abs(tx.amount) < filters.minAmount) return false;
            if (filters.maxAmount !== undefined && Math.abs(tx.amount) > filters.maxAmount) return false;
            if (filters.dateFrom && new Date(tx.date) < filters.dateFrom) return false;
            if (filters.dateTo && new Date(tx.date) > filters.dateTo) return false;

            return true;
        });
    }, [transactions, search, filters]);

    // Sort and group transactions
    const sortedTransactions = useMemo(() => {
        const sorted = [...filtered].sort((a, b) => {
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
    }, [filtered, sortField, sortDirection]);

    const groupedTransactions = useMemo(() => {
        return sortedTransactions.reduce((acc: Record<string, any[]>, tx: any) => {
            const dateKey = new Date(tx.date).toISOString().split('T')[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(tx);
            return acc;
        }, {} as Record<string, any[]>);
    }, [sortedTransactions]);

    const sortedDateKeys = useMemo(() => {
        return Object.keys(groupedTransactions).sort((a, b) =>
            sortDirection === "desc"
                ? new Date(b).getTime() - new Date(a).getTime()
                : new Date(a).getTime() - new Date(b).getTime()
        );
    }, [groupedTransactions, sortDirection]);

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length && filtered.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(tx => tx.id)));
        }
    };

    const handleConfirm = async (id: string) => {
        try {
            await confirmTransaction(id);
            toast.success("Transação confirmada");
            if (selectedTx?.id === id) setSelectedTx(null);
        } catch (error) {
            toast.error("Erro ao confirmar transação");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja deletar esta transação?")) return;
        try {
            await deleteTransaction(id);
            toast.success("Transação deletada");
            if (selectedTx?.id === id) setSelectedTx(null);
        } catch (error) {
            toast.error("Erro ao deletar transação");
        }
    };

    const handleLeafUpdate = async (id: string, leafId: string) => {
        try {
            await updateTransactionCategory(id, { leafId });
            toast.success("Classificação atualizada");
        } catch (error) {
            toast.error("Erro ao atualizar classificação");
        }
    };

    // Bulk action handlers
    const handleBulkConfirm = async () => {
        const ids = Array.from(selectedIds);
        try {
            const result = await bulkConfirmTransactions(ids);
            if (result.success) {
                toast.success(`${result.data.updated} transações confirmadas!`);
                setSelectedIds(new Set());
                window.location.reload();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao confirmar transações");
        }
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        if (!confirm(`Tem certeza que deseja eliminar ${ids.length} transações?`)) {
            return;
        }
        
        try {
            const result = await bulkDeleteTransactions(ids);
            if (result.success) {
                toast.success(`${result.data.deleted} transações eliminadas!`);
                setSelectedIds(new Set());
                window.location.reload();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao eliminar transações");
        }
    };

    const handleBulkExport = async () => {
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
    };

    return (
        <div className="space-y-6 pb-32">
            <TransactionFiltersComp
                search={search}
                onSearchChange={setSearch}
                onFilterChange={setFilters}
                availableCategories={Array.from(new Set(transactions.map(t => t.category1).filter(Boolean)))}
                availableAccounts={Array.from(new Set(transactions.map(t => t.source).filter(Boolean)))}
                isCompact={isCompact}
                onToggleCompact={() => setIsCompact(!isCompact)}
                hideCents={hideCents}
                onToggleHideCents={() => setHideCents(!hideCents)}
                onExport={handleBulkExport}
            />

            {/* Table Header (Desktop Only) */}
            <div className="hidden md:grid grid-cols-[40px_80px_2.5fr_1fr_1.2fr_1fr_80px_80px] gap-3 px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider bg-secondary/50 rounded-t-3xl border border-border backdrop-blur-sm">
                <div className="flex justify-center">
                    <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleSelectAll} className="h-4 w-4 rounded border-2" />
                </div>
                <SortableHeader field="date" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Data</SortableHeader>
                <div>Estabelecimento</div>
                <SortableHeader field="amount" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Valor</SortableHeader>
                <SortableHeader field="category" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Categoria</SortableHeader>
                <div>Cat 1 / Cat 2</div>
                <SortableHeader field="confidence" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>AI %</SortableHeader>
                <div className="text-center">Ações</div>
            </div>

            {/* Transaction Rows Grouped by Date */}
            <div className="bg-card border border-border border-t-0 rounded-b-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-border/30">
                    {filtered.length === 0 ? (
                        <div className="text-center py-32 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 rounded-[3rem] bg-gradient-to-br from-secondary to-secondary/30 flex items-center justify-center mb-8 shadow-xl text-muted-foreground/40">
                                <Search className="h-12 w-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Nenhuma transação encontrada</h3>
                            <p className="text-base text-muted-foreground mt-3 font-medium max-w-md mx-auto">
                                Tente ajustar seus filtros ou remover termos de busca.
                            </p>
                            <Button 
                                variant="outline" 
                                className="mt-8 rounded-2xl h-12 px-8 font-bold border-border hover:bg-secondary transition-all"
                                onClick={() => { setSearch(""); setFilters({}); }}
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
                                onEditClick={(tx) => setSelectedTx(tx)}
                                onClick={(tx) => setSelectedTx(tx)}
                                aliasMap={aliasMap}
                            />
                        ))
                    )}
                </div>
            </div>

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
                onClearSelection={() => setSelectedIds(new Set())}
            />
        </div>
    );
}
