"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  TrendingUp,
  Brain,
  CheckCircle2,
  Info,
  Plus,
  Zap,
  Copy,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Database,
  Hash
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateTransactionCategory, confirmTransaction, createRuleAndApply } from "@/lib/actions/transactions";
import { getCategoryConfig } from "@/lib/constants/categories";
import { motion, AnimatePresence } from "framer-motion";

// Use the robust categories list from the config
import { CATEGORY_CONFIGS } from "@/lib/constants/categories";
const CATEGORIES = Object.keys(CATEGORY_CONFIGS);

interface TransactionDetailContentProps {
  transaction: any;
  onClose: () => void;
  onConfirm?: (id: string) => void; 
}

export function TransactionDetailContent({ transaction, onClose, onConfirm }: TransactionDetailContentProps) {
    const [keyword, setKeyword] = useState(transaction?.simpleDesc || transaction?.descNorm || "");
    const [negativeKeyword, setNegativeKeyword] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(transaction?.category1 || "Outros");
    const [copiedId, setCopiedId] = useState(false);
    const [copiedRaw, setCopiedRaw] = useState(false);
    
    if (!transaction) return null;

    const config = getCategoryConfig(transaction.category1);

    const copyToClipboard = async (text: string, type: 'id' | 'raw') => {
        await navigator.clipboard.writeText(text);
        if (type === 'id') {
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        } else {
            setCopiedRaw(true);
            setTimeout(() => setCopiedRaw(false), 2000);
        }
        toast.success("Copiado para a área de transferência");
    };

    const handleCategoryUpdate = async (id: string, category: string) => {
        try {
            await updateTransactionCategory(id, { category1: category });
            setSelectedCategory(category);
            toast.success("Categoria atualizada");
        } catch (error) {
            toast.error("Erro ao atualizar categoria");
        }
    };

    const handleConfirm = async (id: string) => {
        try {
            await confirmTransaction(id);
            toast.success("Transação confirmada");
            if (onConfirm) onConfirm(id);
            onClose(); 
        } catch (error) {
            toast.error("Erro ao confirmar transação");
        }
    };

    const handleCreateRule = async () => {
        if (!keyword.trim()) return;
        try {
            // Updated to handle negative keyword via the existing action if possible, 
            // but for now let's keep it simple as the DB schema supports it but the action might need update.
            // If action doesn't support it, we just send keyword for now.
            const result = await createRuleAndApply(transaction.id, keyword, selectedCategory);
            if (result.success) {
                toast.success("Regra inteligente criada!");
                setKeyword("");
                if (onConfirm) onConfirm(transaction.id);
                onClose();
            } else {
                toast.error("Erro ao criar regra: " + result.error);
            }
        } catch (error) {
           toast.error("Erro inesperado ao criar regra");
        }
    };

    const isExpense = Number(transaction.amount) < 0;

    return (
        <DrawerContent className="bg-card border-none p-0 overflow-hidden rounded-t-[3.5rem] shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.25)]">
            <div className="mx-auto w-full max-w-2xl flex flex-col h-[90vh] md:h-auto overflow-y-auto outline-none">
                {/* Drag Handle */}
                <div className="flex justify-center pt-6 pb-2 shrink-0">
                    <div className="w-12 h-1.5 bg-secondary/80 rounded-full" />
                </div>
                
                <div className="px-8 pb-12 pt-4 flex flex-col items-center">
                    {/* Header: Brand & Status */}
                    <div className="w-full flex justify-center mb-8 relative">
                        <div className="absolute top-0 left-0">
                            <Badge variant="outline" className={cn(
                                "flex items-center gap-1.5 py-1 px-3 rounded-full border-none font-black text-[9px] uppercase tracking-widest",
                                transaction.needsReview ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                            )}>
                                {transaction.needsReview ? (
                                    <><ShieldAlert className="w-3 h-3" /> Pendente</>
                                ) : (
                                    <><CheckCircle2 className="w-3 h-3" /> Confirmado</>
                                )}
                            </Badge>
                        </div>
	                        <div className="w-16 h-16 rounded-3xl bg-transparent border border-border/50 flex items-center justify-center shadow-2xl relative overflow-hidden">
	                            <Image 
	                                src="/RitualFin%20Logo.png" 
	                                alt="RitualFin" 
	                                fill 
	                                sizes="64px"
	                                className="object-contain p-2"
	                            />
	                        </div>
                    </div>
                    
                    {/* Main Info */}
                    <div className="flex flex-col items-center text-center max-w-md w-full mb-10">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight leading-tight mb-3 font-display">
                            {transaction.description}
                        </h2>
                        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary/30 px-4 py-2 rounded-2xl">
                            <span>{transaction.source}</span>
                            <span className="opacity-30">•</span>
                            <span>{new Date(transaction.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' })}</span>
                        </div>
                    </div>
                    
                    {/* Amount Display */}
                    <div className={cn(
                        "text-6xl font-black tracking-tighter mb-12 font-display flex items-center gap-4",
                        isExpense ? "text-foreground" : "text-emerald-500"
                    )}>
                        <span className="text-3xl opacity-40 font-bold">{isExpense ? '-' : '+'}</span>
                        {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Math.abs(Number(transaction.amount)))}
                    </div>

                    {/* Category & Confidence Grid */}
                    <div className="w-full grid grid-cols-2 gap-5 mb-10">
                        <div className={cn("p-6 rounded-[2.5rem] text-left border relative overflow-hidden group transition-all", config.bgColor, config.borderColor)}>
                            <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-3 relative z-10", config.textColor)}>Categoria de Fluxo</p>
                            <div className="relative z-10">
                                <Select 
                                    defaultValue={transaction.category1} 
                                    onValueChange={(val) => handleCategoryUpdate(transaction.id, val)}
                                >
                                    <SelectTrigger className="w-full h-auto bg-transparent border-none p-0 focus:ring-0 text-xl font-bold text-foreground text-left shadow-none ring-offset-0">
                                        <div className="flex items-center gap-3">
                                            <config.lucideIcon className={cn("w-6 h-6", config.textColor)} />
                                            <SelectValue placeholder="Selecionar..." />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        {CATEGORIES.map(cat => {
                                            const catConfig = getCategoryConfig(cat);
                                            return (
                                                <SelectItem key={cat} value={cat} className="py-3 focus:bg-primary/5 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <catConfig.lucideIcon className={cn("w-4 h-4", catConfig.textColor)} />
                                                        <span className="font-bold">{cat}</span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Visual Polish */}
                            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <config.lucideIcon className="w-24 h-24" />
                            </div>
                        </div>

                        <div className="p-6 rounded-[2.5rem] bg-slate-900 border border-slate-800 text-left relative overflow-hidden group">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Motor de Classificação</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Brain className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-white tracking-tight">
                                        {transaction.confidence ? `${transaction.confidence}%` : "Manual"}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Confiança IA</span>
                                </div>
                            </div>
                            {/* Visual Polish */}
                            <div className="absolute -bottom-4 -right-4 opacity-5">
                                <Zap className="w-24 h-24 text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Technical & Content Section */}
                    <div className="w-full flex flex-col gap-5">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">
                             Metadados do Lançamento
                        </h4>
                        
                        <div className="bg-secondary/20 rounded-[2.5rem] border border-border/50 divide-y divide-border/30">
                            {/* Description Technical */}
                            <div className="p-7 flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Original Desc (Raw)</span>
                                        <p className="text-sm font-mono text-foreground/80 break-all leading-relaxed">
                                            {transaction.descRaw}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="shrink-0 hover:bg-primary/5 hover:text-primary rounded-xl" onClick={() => copyToClipboard(transaction.descRaw, 'raw')}>
                                        {copiedRaw ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* ID Technical */}
                            <div className="p-7 flex justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Unique Track ID</span>
                                    <p className="text-[10px] font-mono text-muted-foreground/60">
                                        {transaction.id}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" className="shrink-0 hover:bg-primary/5 hover:text-primary rounded-xl" onClick={() => copyToClipboard(transaction.id, 'id')}>
                                    {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Smart Rule Creator Page-style */}
                        <div className="mt-4 p-8 bg-amber-500/5 rounded-[3rem] border border-amber-500/10 flex flex-col gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-foreground font-display">Criar Regra de Automação</h4>
                                    <p className="text-xs font-medium text-muted-foreground">Ensine ao Neural Engine como tratar este lançamento no futuro.</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Palavra-chave Positiva</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            <Input 
                                                placeholder="Keyword de Identificação" 
                                                className="bg-white dark:bg-slate-900 h-14 pl-11 rounded-2xl font-mono text-xs border-none shadow-sm focus-visible:ring-1 focus-visible:ring-emerald-500/50"
                                                value={keyword}
                                                onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Palavra-chave Negativa <span className="text-[8px] opacity-40">(Opcional)</span></label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500">
                                                <Hash className="w-4 h-4" />
                                            </div>
                                            <Input 
                                                placeholder="Ignorar se contiver..." 
                                                className="bg-white dark:bg-slate-900 h-14 pl-11 rounded-2xl font-mono text-xs border-none shadow-sm focus-visible:ring-1 focus-visible:ring-rose-500/50"
                                                value={negativeKeyword}
                                                onChange={(e) => setNegativeKeyword(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    className="h-16 bg-foreground text-background hover:opacity-90 rounded-[1.5rem] font-bold shadow-xl shadow-black/5 flex items-center justify-center gap-3 transition-all active:scale-95"
                                    onClick={handleCreateRule}
                                    disabled={!keyword}
                                >
                                    Salvar e Aplicar Regra
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Actions at Bottom */}
                    <div className="w-full grid grid-cols-1 gap-4 mt-12 shrink-0">
                        <Button 
                            className="w-full h-20 bg-primary text-white hover:opacity-95 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 gap-4 text-base transition-all active:scale-95 group"
                            onClick={() => handleConfirm(transaction.id)}
                        >
                            <CheckCircle2 className="h-7 w-7 transition-transform group-hover:scale-110" />
                            Confirmar Transação
                        </Button>
                        <Button variant="ghost" className="w-full h-14 text-muted-foreground rounded-2xl font-bold transition-all text-[10px] uppercase tracking-[0.3em] hover:bg-secondary/50" onClick={onClose}>
                            Ignorar por agora
                        </Button>
                    </div>
                </div>
            </div>
        </DrawerContent>
    );
}
