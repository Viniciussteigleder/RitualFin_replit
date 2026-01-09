"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Search,
    Calendar,
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
    TrendingUp,
    Utensils,
    Home,
    Car,
    Activity,
    Smartphone,
    Wallet,
    Edit3
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterPanel as FilterPanelComp, TransactionFilters } from "@/components/transactions/filter-panel";
import { BulkActionsBar as BulkActionsBarComp } from "@/components/transactions/bulk-actions-bar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TransactionList({ transactions }: { transactions: any[] }) {
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<TransactionFilters>({});
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const filtered = transactions.filter(tx => {
        const descMatch = (tx.descNorm || tx.descRaw || "").toLowerCase();
        const catMatch = (tx.category1 || "").toLowerCase();
        const matchesSearch = descMatch.includes(search.toLowerCase()) ||
            catMatch.includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filters.categories?.length && !filters.categories.includes(tx.category1)) return false;
        if (filters.accounts?.length && !filters.accounts.includes(tx.accountSource)) return false;
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
                        accounts={Array.from(new Set(transactions.map(t => t.accountSource).filter(Boolean)))}
                        onFilterChange={setFilters}
                    />
                    <Button variant="outline" className="h-14 px-6 border-border hover:bg-secondary rounded-2xl text-foreground font-bold gap-2 text-sm">
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
                        <div className="text-center py-32">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center mx-auto mb-6 text-muted-foreground/40">
                                <Search className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground font-display">Nenhuma transação encontrada</h3>
                            <p className="text-sm text-muted-foreground mt-2 font-medium">Tente ajustar seus filtros para encontrar o que procura.</p>
                        </div>
                    ) : (
                        filtered.map((tx) => {
                            const { color: catColor, bg: catBg, icon: CatIcon } = getCategoryStyles(tx.category1);
                            const isNegative = Number(tx.amount) < 0;
                            const score = tx.score || (tx.needsReview ? 40 : 98);
                            const scoreColor = score >= 90 ? "bg-primary" : score >= 70 ? "bg-orange-400" : "bg-destructive";
                            const scoreText = score >= 90 ? "text-primary" : score >= 70 ? "text-orange-500" : "text-destructive";

                            return (
                                <div
                                    key={tx.id}
                                    className={cn(
                                        "group flex flex-col md:grid md:grid-cols-[60px_1fr_2.5fr_1.5fr_1.5fr_1.2fr_120px] gap-2 md:gap-6 items-center p-6 md:p-0 md:h-[90px] hover:bg-secondary/40 transition-all cursor-pointer",
                                        selectedIds.has(tx.id) && "bg-primary/5"
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
                                    <div className="md:py-4 flex flex-col gap-1 w-full md:w-auto">
                                        <span className="text-base font-bold text-foreground truncate tracking-tight">
                                            {tx.description}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tx.accountSource}</span>
                                            {tx.needsReview && <Badge className="h-2 w-2 p-0 rounded-full bg-orange-400 border-none animate-pulse"></Badge>}
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
                                        <button className="p-3 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <button className="p-3 bg-foreground text-background hover:opacity-90 rounded-xl transition-all shadow-lg shadow-foreground/5">
                                            <Check className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Bottom Drawer Revamp */}
            <Drawer open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
                <DrawerContent className="bg-card border-none p-0 overflow-hidden rounded-t-[3rem] shadow-2xl">
                    {selectedTx && (
                        <div className="mx-auto w-full max-w-2xl flex flex-col h-[80vh] md:h-auto">
                            <div className="w-16 h-1.5 bg-secondary rounded-full mx-auto mt-6 mb-8" />
                            
                            <div className="px-10 pb-12 flex flex-col items-center text-center">
                                <div className={cn(
                                    "w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl transition-transform hover:scale-110 duration-500",
                                    Number(selectedTx.amount) < 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"
                                )}>
                                    {Number(selectedTx.amount) < 0 ? <ShoppingBag className="h-10 w-10" /> : <TrendingUp className="h-10 w-10" />}
                                </div>
                                
                                <h2 className="text-3xl font-bold text-foreground tracking-tight leading-tight mb-2 font-display">{selectedTx.description}</h2>
                                <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <span className="bg-secondary px-3 py-1 rounded-lg text-[10px]">{selectedTx.accountSource}</span>
                                    <span>•</span>
                                    <span>{new Date(selectedTx.date).toLocaleDateString()}</span>
                                </p>
                                
                                <div className={cn(
                                   "text-6xl font-black tracking-tighter mb-10 font-display",
                                   Number(selectedTx.amount) < 0 ? "text-destructive" : "text-emerald-500"
                                )}>
                                    {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Math.abs(Number(selectedTx.amount)))}
                                </div>

                                <div className="w-full grid grid-cols-2 gap-6 mb-10">
                                    <div className="p-6 rounded-3xl bg-secondary/50 border border-border text-left group">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Categoria AI</p>
                                        <p className="text-lg font-bold text-foreground flex items-center gap-3">
                                            <Tag className="h-5 w-5 text-primary" />
                                            {selectedTx.category1 || "Não classificado"}
                                        </p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-secondary/50 border border-border text-left group">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Confiabilidade</p>
                                        <p className="text-lg font-bold text-foreground flex items-center gap-3">
                                            <Brain className="h-5 w-5 text-primary" />
                                            {selectedTx.needsReview ? "Revisão Manual" : "Alta (AI)"}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full space-y-4">
                                    <Button className="w-full h-16 bg-primary text-white hover:opacity-95 rounded-2xl font-bold shadow-2xl shadow-primary/20 gap-3 text-lg transition-all active:scale-95">
                                        <CheckCircle2 className="h-6 w-6" />
                                        Confirmar Lançamento
                                    </Button>
                                    <Button variant="outline" className="w-full h-16 border-border hover:bg-secondary text-muted-foreground rounded-2xl font-bold transition-all text-sm uppercase tracking-widest" onClick={() => setSelectedTx(null)}>
                                        Fechar Detalhes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DrawerContent>
            </Drawer>

            {/* Bulk Actions Bar Revamp */}
            <BulkActionsBarComp
                selectedCount={selectedIds.size}
                onClassifyAll={() => toast.success(`Classificadas ${selectedIds.size} transações`)}
                onExport={() => toast.success(`Exportando ${selectedIds.size} transações`)}
                onDelete={() => toast.error(`Deletadas ${selectedIds.size} transações`)}
                onClearSelection={() => setSelectedIds(new Set())}
            />
        </div>
    );
}
