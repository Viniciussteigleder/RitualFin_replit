"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Search,
    CreditCard,
    Tag,
    Info,
    CheckCircle2,
    AlertCircle,
    FileText,
   ExternalLink,
    Brain,
    MoreHorizontal,
    Trash2,
    Check,
    ChevronDown,
    ShoppingBag,
    Utensils,
    Home,
    Car,
    Activity,
    Wallet,
    Edit3
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

    const filtered = transactions.filter(tx => {

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

    // Helper to get category style and icon
    const getCategoryStyles = (category: string) => {
        const cat = category?.toLowerCase() || "";
        if (cat.includes("alimentação") || cat.includes("restaurante")) {
            return { color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-900/30", icon: Utensils };
        }
        if (cat.includes("transporte") || cat.includes("uber")) {
            return { color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-900/30", icon: Car };
        }
        if (cat.includes("moradia") || cat.includes("aluguel")) {
            return { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-900/30", icon: Home };
        }
        if (cat.includes("lazer") || cat.includes("netflix")) {
            return { color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-900/30", icon: Activity };
        }
        return { color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-100 dark:bg-white/10", icon: Tag };
    };

    return (
        <div className="space-y-6 pb-32">
            {/* Filters & Search - Re-styled */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
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
                        {isCompact ? <Activity className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                        {isCompact ? "Vista Normal" : "Vista Compacta"}
                    </Button>
                    <Button variant="outline" className="h-14 px-6 border-border hover:bg-secondary rounded-2xl text-foreground font-bold gap-2 text-sm" onClick={handleBulkExport}>
                        <FileText className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Table Header (Desktop Only) */}
            <div className="hidden md:grid grid-cols-[60px_1fr_2.5fr_1.5fr_1.5fr_1.2fr_120px] gap-6 px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                <div className="flex justify-center">
                    <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleSelectAll} className="h-5 w-5 rounded-lg border-2" />
                </div>
                <div>Data</div>
                <div>Estabelecimento</div>
                <div>Valor</div>
                <div>Categoria</div>
                <div>AI Status</div>
                <div className="text-right">Ações</div>
            </div>

            {/* Transaction Rows */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="divide-y divide-border">
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
                        filtered.map((tx) => {
                            const { color: catColor, bg: catBg, icon: CatIcon } = getCategoryStyles(tx.category1);
                            const isNegative = Number(tx.amount) < 0;
                            const score = tx.score || (tx.needsReview ? 40 : 98);
                            
                            // Improved AI Confidence Colors
                            const scoreColor = score >= 90 ? "bg-emerald-500" : score >= 60 ? "bg-amber-400" : "bg-slate-300";
                            const scoreText = score >= 90 ? "text-emerald-600 dark:text-emerald-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-slate-500";

                            return (
                                <div
                                    key={tx.id}
                                    className={cn(
                                        "group flex flex-col md:grid md:grid-cols-[60px_1fr_2.5fr_1.5fr_1.5fr_1.2fr_120px] gap-2 md:gap-6 items-center hover:bg-secondary/40 transition-all cursor-pointer",
                                        isCompact ? "p-4 md:p-0 md:h-[60px]" : "p-6 md:p-0 md:h-[80px]",
                                        selectedIds.has(tx.id) && "bg-primary/5 border-l-4 border-l-primary"
                                    )}
                                    onClick={() => setSelectedTx(tx)}
                                >
                                    {/* Column: Checkbox */}
                                    <div className="hidden md:flex justify-center" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox checked={selectedIds.has(tx.id)} onCheckedChange={() => toggleSelect(tx.id)} className="h-5 w-5 rounded-lg border-2" />
                                    </div>

                                    {/* Column: Data */}
                                    <div className="md:px-10 md:py-4 text-[11px] font-black text-muted-foreground self-start md:self-center uppercase tracking-wider">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </div>

                                    {/* Column: Estabelecimento */}
                                    <div className={cn("md:py-4 flex flex-row items-center gap-3 w-full md:w-auto", isCompact && "md:py-2")}>
                                        {tx.aliasDesc && aliasMap[tx.aliasDesc] ? (
                                            <img 
                                                src={aliasMap[tx.aliasDesc]} 
                                                alt={tx.aliasDesc} 
                                                className={cn("rounded-full object-cover border border-border bg-white", isCompact ? "w-8 h-8" : "w-10 h-10")}
                                            />
                                        ) : (
                                            <div className={cn("rounded-full bg-secondary flex items-center justify-center text-muted-foreground/50", isCompact ? "w-8 h-8" : "w-10 h-10")}>
                                                <ShoppingBag className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-0.5 overflow-hidden">
                                            <span className={cn("font-bold text-foreground truncate tracking-tight", isCompact ? "text-sm" : "text-base")}>
                                                {tx.aliasDesc || tx.description}
                                            </span>
                                            {!isCompact && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tx.source}</span>
                                                    {tx.conflictFlag ? (
                                                        <Badge className="h-5 px-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 border-none text-[9px] font-bold uppercase tracking-wide flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Conflito
                                                        </Badge>
                                                    ) : tx.needsReview && (
                                                        <Badge className="h-5 px-2 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 border-none text-[9px] font-bold uppercase tracking-wide">
                                                            Revisar
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Column: Valor */}
                                    <div className={cn(
                                        "md:py-4 text-lg font-bold tracking-tighter w-full md:w-auto",
                                        isNegative ? "text-destructive" : "text-emerald-500"
                                    )}>
                                        {Number(tx.amount) > 0 ? "+" : "-"} {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Math.abs(Number(tx.amount)))}
                                    </div>

                                    {/* Column: Categoria */}
                                    <div className="md:py-4 flex items-center w-full md:w-auto">
                                        <button className={cn(
                                            "flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95",
                                            catBg,
                                            catColor
                                        )}>
                                            <CatIcon className="h-4 w-4" />
                                            {tx.category1 || "Não Classificado"}
                                        </button>
                                    </div>

                                    {/* Column: AI Status */}
                                    <div className="md:py-4 flex items-center gap-4 w-full md:w-auto">
                                        <div className="flex-1 max-w-[60px] h-2 bg-secondary rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-700", scoreColor)} style={{ width: `${score}%` }}></div>
                                        </div>
                                        <span className={cn("text-[10px] font-black", scoreText)}>{score}%</span>
                                    </div>

                                    {/* Column: Ações */}
                                    <div className="md:pr-10 md:py-4 flex items-center justify-end gap-3 text-muted-foreground self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            className="p-3 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <button 
                                            className="p-3 bg-foreground text-background hover:opacity-90 rounded-xl transition-all shadow-lg shadow-foreground/5"
                                            onClick={(e) => { e.stopPropagation(); handleConfirm(tx.id); }}
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
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
