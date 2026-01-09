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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-[#1a2c26] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="w-full lg:flex-1 max-w-lg">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar estabelecimento, valor ou categoria..."
                            className="pl-10 h-11 bg-gray-50 dark:bg-black/20 border-transparent focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <FilterPanelComp
                        categories={Array.from(new Set(transactions.map(t => t.category1).filter(Boolean)))}
                        accounts={Array.from(new Set(transactions.map(t => t.accountSource).filter(Boolean)))}
                        onFilterChange={setFilters}
                    />
                    <Button variant="outline" className="h-11 px-4 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-gray-600 dark:text-gray-300 font-bold gap-2">
                        <FileText className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Table Header (Desktop Only) */}
            <div className="hidden md:grid grid-cols-[48px_1fr_2fr_1.5fr_1.5fr_1.5fr_100px] gap-4 px-6 py-4 bg-gray-50/50 dark:bg-black/10 border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex justify-center">
                    <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleSelectAll} />
                </div>
                <div>Data</div>
                <div>Estabelecimento</div>
                <div>Valor</div>
                <div>Categoria Sugerida</div>
                <div>Score AI</div>
                <div className="text-right">Ações</div>
            </div>

            {/* Transaction Rows */}
            <div className="bg-white dark:bg-[#1a2c26] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-600">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-[#111816] dark:text-white">Nenhuma transação encontrada</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tente ajustar seus filtros ou busca.</p>
                        </div>
                    ) : (
                        filtered.map((tx) => {
                            const { color: catColor, bg: catBg, icon: CatIcon } = getCategoryStyles(tx.category1);
                            const isNegative = Number(tx.amount) < 0;
                            const score = tx.score || (tx.needsReview ? 40 : 98);
                            const scoreColor = score >= 90 ? "bg-emerald-500" : score >= 70 ? "bg-yellow-400" : "bg-red-500";
                            const scoreText = score >= 90 ? "text-emerald-600" : score >= 70 ? "text-yellow-600" : "text-red-500";

                            return (
                                <div
                                    key={tx.id}
                                    className={cn(
                                        "group flex flex-col md:grid md:grid-cols-[48px_1fr_2fr_1.5fr_1.5fr_1.5fr_100px] gap-2 md:gap-4 items-center p-4 md:p-0 md:h-[72px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer",
                                        selectedIds.has(tx.id) && "bg-primary/5 dark:bg-primary/5"
                                    )}
                                    onClick={() => setSelectedTx(tx)}
                                >
                                    {/* Column: Checkbox */}
                                    <div className="hidden md:flex justify-center" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox checked={selectedIds.has(tx.id)} onCheckedChange={() => toggleSelect(tx.id)} />
                                    </div>

                                    {/* Column: Data */}
                                    <div className="md:px-6 md:py-4 text-xs font-bold text-gray-500 dark:text-gray-400 self-start md:self-center">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </div>

                                    {/* Column: Estabelecimento */}
                                    <div className="md:py-4 flex flex-col gap-0.5 w-full md:w-auto">
                                        <span className="text-sm font-extrabold text-[#111816] dark:text-white truncate">
                                            {tx.description}
                                        </span>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{tx.accountSource}</span>
                                            {tx.needsReview && <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>}
                                        </div>
                                    </div>

                                    {/* Column: Valor */}
                                    <div className={cn(
                                        "md:py-4 text-base font-black tracking-tight w-full md:w-auto",
                                        isNegative ? "text-[#111816] dark:text-white" : "text-emerald-600 dark:text-emerald-400"
                                    )}>
                                        {Number(tx.amount) > 0 ? "+" : "-"} {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Math.abs(Number(tx.amount)))}
                                    </div>

                                    {/* Column: Categoria */}
                                    <div className="md:py-4 flex items-center w-full md:w-auto">
                                        <button className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors hover:opacity-80",
                                            catBg,
                                            catColor
                                        )}>
                                            <CatIcon className="h-3.5 w-3.5" />
                                            {tx.category1 || "Unclassified"}
                                            <Edit3 className="h-3 w-3 opacity-50" />
                                        </button>
                                    </div>

                                    {/* Column: Score AI */}
                                    <div className="md:py-4 flex items-center gap-3 w-full md:w-auto">
                                        <div className="flex-1 max-w-[80px] h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all", scoreColor)} style={{ width: `${score}%` }}></div>
                                        </div>
                                        <span className={cn("text-[10px] font-black", scoreText)}>{score}%</span>
                                    </div>

                                    {/* Column: Ações */}
                                    <div className="md:pr-6 md:py-4 flex items-center justify-end gap-2 text-gray-400 dark:text-gray-500 self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 bg-primary hover:bg-primary-dark text-[#111816] rounded-lg transition-colors">
                                            <Check className="h-4 w-4" />
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
                <DrawerContent className="bg-white dark:bg-[#1a2c26] border-none p-0 overflow-hidden rounded-t-[40px] shadow-2xl">
                    {selectedTx && (
                        <div className="mx-auto w-full max-w-2xl flex flex-col h-[75vh] md:h-auto">
                            <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mt-4 mb-6" />
                            
                            <div className="px-8 pb-8 flex flex-col items-center text-center">
                                <div className={cn(
                                    "w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform",
                                    Number(selectedTx.amount) < 0 ? "bg-gray-100 dark:bg-white/5 text-[#111816] dark:text-white" : "bg-primary text-[#111816]"
                                )}>
                                    <ShoppingBag className="h-8 w-8" />
                                </div>
                                
                                <h2 className="text-2xl font-black text-[#111816] dark:text-white tracking-tight leading-tight mb-1">{selectedTx.description}</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4 flex items-center gap-2">
                                    <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg text-[10px]">{selectedTx.accountSource}</span>
                                    •
                                    <span>{new Date(selectedTx.date).toLocaleDateString()}</span>
                                </p>
                                
                                <div className="text-5xl font-black text-[#111816] dark:text-white tracking-tighter mb-8 font-display">
                                    {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Math.abs(Number(selectedTx.amount)))}
                                </div>

                                <div className="w-full grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Categoria AI</p>
                                        <p className="text-sm font-extrabold text-[#111816] dark:text-white flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-primary" />
                                            {selectedTx.category1 || "Não classificado"}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Confiabilidade</p>
                                        <p className="text-sm font-extrabold text-[#111816] dark:text-white flex items-center gap-2">
                                            <Brain className="h-4 w-4 text-purple-500" />
                                            {selectedTx.needsReview ? "Revisão Manual" : "Alta (AI)"}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    <Button className="w-full h-14 bg-primary hover:bg-primary-dark text-[#111816] rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Confirmar Lançamento
                                    </Button>
                                    <Button variant="outline" className="w-full h-14 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl font-bold transition-all" onClick={() => setSelectedTx(null)}>
                                        Ignorar por enquanto
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
