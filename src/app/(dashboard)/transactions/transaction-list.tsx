"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Search,
    Tag,
    AlertCircle,
    FileText,
    Trash2,
    Check,
    ChevronDown,
    ChevronUp,
    ShoppingBag,
    Utensils,
    Home,
    Car,
    Activity,
    Edit3,
    ArrowUpDown,
    LayoutGrid
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterPanel as FilterPanelComp, TransactionFilters } from "@/components/transactions/filter-panel";
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
import { getCategoryConfig } from "@/lib/constants/categories";

type SortField = "date" | "amount" | "category" | "confidence";
type SortDirection = "asc" | "desc";

// Using categories from schema (simplified list for UI)
const CATEGORIES = [
    "Receitas", "Moradia", "Mercados", "Compras Online",
    "Transporte", "Saúde", "Lazer", "Viagem", "Roupas",
    "Tecnologia", "Alimentação", "Energia", "Internet",
    "Educação", "Presentes", "Streaming", "Academia",
    "Investimentos", "Outros", "Interno", "Assinaturas", "Compras",
    "Doações", "Esportes", "Finanças", "Férias", "Mobilidade",
    "Pets", "Telefone", "Trabalho", "Transferências", "Vendas"
];

export function TransactionList({ transactions, initialFilters = {}, aliasMap = {} }: { transactions: any[], initialFilters?: TransactionFilters, aliasMap?: Record<string, string> }) {
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCompact, setIsCompact] = useState(false);
    const [hideCents, setHideCents] = useState(false);
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    // Format date as DD.MM.YY
    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString().slice(-2);
        return `${day}.${month}.${year}`;
    };

    // Format currency
    const formatAmount = (amount: number) => {
        const absAmount = Math.abs(amount);
        if (hideCents) {
            return new Intl.NumberFormat("pt-PT", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(Math.round(absAmount));
        }
        return new Intl.NumberFormat("pt-PT", {
            style: "currency",
            currency: "EUR"
        }).format(absAmount);
    };

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
        if (selectedIds.size === filtered.length) {
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

    const handleCategoryUpdate = async (id: string, category: string) => {
        try {
            await updateTransactionCategory(id, { category1: category });
            toast.success("Categoria atualizada");
        } catch (error) {
            toast.error("Erro ao atualizar categoria");
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
                window.location.reload(); // Refresh data
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
                window.location.reload(); // Refresh data
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
                // Create download link
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

    // Helper to get category style and icon using centralized config
    const getCategoryStyles = (category: string) => {
        const config = getCategoryConfig(category);
        return {
            color: config.textColor,
            bg: config.bgColor,
            border: config.borderColor,
            icon: config.lucideIcon
        };
    };

    // Sortable header component
    const SortableHeader = ({ field, children, className }: { field: SortField, children: React.ReactNode, className?: string }) => (
        <button
            onClick={() => handleSort(field)}
            className={cn("flex items-center gap-1 hover:text-foreground transition-colors", className)}
        >
            {children}
            {sortField === field && (
                sortDirection === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
            )}
        </button>
    );

    return (
        <div className="space-y-6 pb-32">
            {/* Filters & Search - Premium Style */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-6 rounded-[2.5rem] border border-border shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="w-full lg:flex-1 max-w-lg">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar estabelecimento, valor ou categoria..."
                            className="pl-12 h-14 bg-secondary/50 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all text-sm font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <FilterPanelComp
                        categories={Array.from(new Set(transactions.map(t => t.category1).filter(Boolean)))}
                        accounts={Array.from(new Set(transactions.map(t => t.source).filter(Boolean)))}
                        onFilterChange={setFilters}
                    />
                    <Button
                        variant="outline"
                        className={cn(
                            "h-14 px-6 border-border rounded-2xl text-foreground font-bold gap-2 text-sm transition-all",
                            isCompact && "bg-primary text-white border-transparent"
                        )}
                        onClick={() => setIsCompact(!isCompact)}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        {isCompact ? "Normal" : "Compacta"}
                    </Button>
                    <Button
                        variant="outline"
                        className={cn(
                            "h-14 px-4 border-border rounded-2xl text-foreground font-medium gap-2 text-sm transition-all",
                            hideCents && "bg-secondary"
                        )}
                        onClick={() => setHideCents(!hideCents)}
                    >
                        {hideCents ? "€123" : "€123,45"}
                    </Button>
                    <Button variant="outline" className="h-14 px-6 border-border hover:bg-secondary rounded-2xl text-foreground font-bold gap-2 text-sm" onClick={handleBulkExport}>
                        <FileText className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Table Header (Desktop Only) - Premium Style */}
            <div className="hidden md:grid grid-cols-[40px_80px_2.5fr_1fr_1.2fr_1fr_80px_80px] gap-3 px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider bg-secondary/50 rounded-t-3xl border border-border backdrop-blur-sm">
                <div className="flex justify-center">
                    <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleSelectAll} className="h-4 w-4 rounded border-2" />
                </div>
                <SortableHeader field="date">Data</SortableHeader>
                <div>Estabelecimento</div>
                <SortableHeader field="amount">Valor</SortableHeader>
                <SortableHeader field="category">Categoria</SortableHeader>
                <div>Cat 1 / Cat 2</div>
                <SortableHeader field="confidence">AI %</SortableHeader>
                <div className="text-center">Ações</div>
            </div>

            {/* Transaction Rows */}
            <div className="bg-card border border-border border-t-0 rounded-b-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-border/30">
                    {filtered.length === 0 ? (
                        <div className="text-center py-32 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 rounded-[3rem] bg-gradient-to-br from-secondary to-secondary/30 flex items-center justify-center mb-8 shadow-xl text-muted-foreground/40">
                                <Search className="h-12 w-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Nenhuma transação encontrada</h3>
                            <p className="text-base text-muted-foreground mt-3 font-medium max-w-md mx-auto">
                                Tente ajustar seus filtros ou remover termos de busca para encontrar o que procura.
                            </p>
                            <Button 
                                variant="outline" 
                                className="mt-8 rounded-2xl h-12 px-8 font-bold border-border hover:bg-secondary transition-all hover:scale-105 active:scale-95"
                                onClick={() => { setSearch(""); setFilters(initialFilters); }}
                            >
                                Limpar Filtros
                            </Button>
                        </div>
                    ) : (
                        sortedDateKeys.map(dateKey => (
                            <div key={dateKey} className="contents">
                                <div className="bg-secondary/30 px-6 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md border-y border-border/50">
                                    {new Date(dateKey).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                </div>
                                {groupedTransactions[dateKey].map((tx) => {
                                    const { color: catColor, bg: catBg, border: catBorder, icon: CatIcon } = getCategoryStyles(tx.category1);
                                    const isNegative = Number(tx.amount) < 0;
                                    const score = tx.confidence || tx.score || (tx.needsReview ? 40 : 98);
                                    const scoreText = score >= 90 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-slate-500";

                                    return (
                                        <div
                                            key={tx.id}
                                            className={cn(
                                                "group flex flex-col md:grid md:grid-cols-[40px_80px_2.5fr_1fr_1.2fr_1fr_80px_80px] gap-2 md:gap-3 items-stretch md:items-center hover:bg-secondary/40 transition-all duration-200 cursor-pointer",
                                                isCompact ? "px-4 py-2 md:px-6" : "px-4 py-4 md:px-6",
                                                selectedIds.has(tx.id) && "bg-primary/5 border-l-4 border-l-primary"
                                            )}
                                            onClick={() => setSelectedTx(tx)}
                                        >
                                            {/* Column: Checkbox */}
                                            <div className="hidden md:flex justify-center" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox checked={selectedIds.has(tx.id)} onCheckedChange={() => toggleSelect(tx.id)} className="h-4 w-4 rounded border-2" />
                                            </div>

                                            {/* Column: Date (DD.MM.YY format, no time) */}
                                            <div className="hidden md:flex items-center text-xs font-medium text-muted-foreground">
                                                {formatDate(tx.date)}
                                            </div>

                                            {/* Mobile: Top Row with Avatar, Name, Amount */}
                                            <div className="flex items-center gap-3 w-full md:contents">
                                                {/* Mobile Checkbox */}
                                                <div className="md:hidden" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox checked={selectedIds.has(tx.id)} onCheckedChange={() => toggleSelect(tx.id)} className="h-4 w-4 rounded border-2" />
                                                </div>

                                                {/* Logo/Avatar - Rectangle/flexible */}
                                                <div className="flex flex-row items-center gap-3 min-w-0 flex-1">
                                                    {tx.aliasDesc && aliasMap[tx.aliasDesc] ? (
                                                        <img
                                                            src={aliasMap[tx.aliasDesc]}
                                                            alt={tx.aliasDesc}
                                                            className={cn(
                                                                "object-contain border border-border bg-white flex-shrink-0 rounded-lg",
                                                                isCompact ? "w-8 h-8" : "w-10 h-8"
                                                            )}
                                                        />
                                                    ) : (
                                                        <div className={cn(
                                                            "rounded-lg flex items-center justify-center flex-shrink-0",
                                                            catBg, catBorder, "border",
                                                            isCompact ? "w-8 h-8" : "w-10 h-8"
                                                        )}>
                                                            <CatIcon className={cn("w-4 h-4", catColor)} />
                                                        </div>
                                                    )}

                                                    {/* Description (not bold) & Source */}
                                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <span className={cn(
                                                                "text-foreground tracking-tight line-clamp-1",
                                                                isCompact ? "text-sm" : "text-sm"
                                                            )}>
                                                                {tx.aliasDesc || tx.description || tx.descRaw}
                                                            </span>

                                                            {/* Amount (Mobile Only) */}
                                                            <div className={cn(
                                                                "md:hidden text-sm font-semibold tracking-tight whitespace-nowrap",
                                                                isNegative ? "text-red-600" : "text-emerald-600"
                                                            )}>
                                                                {isNegative ? "-" : "+"} {formatAmount(Number(tx.amount))}
                                                            </div>
                                                        </div>

                                                        {/* Mobile info badges */}
                                                        <div className="flex items-center gap-2 flex-wrap text-xs md:hidden">
                                                            <span className="text-[9px] text-muted-foreground">{formatDate(tx.date)}</span>
                                                            <span className="text-[9px] text-muted-foreground">•</span>
                                                            <span className="text-[9px] text-muted-foreground">{tx.category1 || "N/A"}</span>
                                                            {tx.conflictFlag && (
                                                                <Badge className="h-4 px-1 rounded bg-red-100 text-red-700 border-none text-[8px]">
                                                                    <AlertCircle className="w-3 h-3 mr-0.5" />
                                                                    Conflito
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Desktop Amount */}
                                                <div className={cn(
                                                    "hidden md:flex items-center font-semibold",
                                                    isNegative ? "text-red-600" : "text-emerald-600"
                                                )}>
                                                    {isNegative ? "-" : "+"} {formatAmount(Number(tx.amount))}
                                                </div>

                                                {/* Desktop Category (App Category) */}
                                                <div className="hidden md:flex items-center">
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border",
                                                        catBg, catColor, catBorder
                                                    )}>
                                                        <CatIcon className="h-3.5 w-3.5" />
                                                        <span className="truncate max-w-[100px]">{tx.appCategoryName || tx.category1 || "OPEN"}</span>
                                                    </div>
                                                </div>

                                                {/* Desktop Cat1 / Cat2 */}
                                                <div className="hidden md:flex flex-col text-xs text-muted-foreground">
                                                    <span className="truncate">{tx.category1 || "-"}</span>
                                                    {tx.category2 && (
                                                        <span className="truncate text-[10px] text-muted-foreground/70">{tx.category2}</span>
                                                    )}
                                                </div>

                                                {/* Desktop AI Score - percentage only */}
                                                <div className="hidden md:flex items-center justify-center">
                                                    <span className={cn("text-xs font-bold", scoreText)}>{score}%</span>
                                                </div>

                                                {/* Action Button - Edit only (opens drawer) */}
                                                <div className="hidden md:flex items-center justify-center">
                                                    <button
                                                        className="p-2.5 hover:bg-secondary rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95"
                                                        onClick={(e) => { e.stopPropagation(); setSelectedTx(tx); }}
                                                        title="Editar transação"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Transaction Detail Drawer */}
            <TransactionDrawer 
                transaction={selectedTx}
                open={!!selectedTx}
                onOpenChange={(open) => !open && setSelectedTx(null)}
                onConfirm={handleConfirm}
                onDelete={handleDelete}
                onCategoryChange={handleCategoryUpdate}
            />

            {/* Bulk Actions Bar */}
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
