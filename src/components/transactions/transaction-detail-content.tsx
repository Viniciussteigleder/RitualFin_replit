"use client";

import { useState } from "react";
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
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateTransactionCategory, confirmTransaction, createRuleAndApply } from "@/lib/actions/transactions";

// Simplified categories list matching the one in TransactionList
const CATEGORIES = [
  "Receitas", "Moradia", "Mercados", "Compras Online",
  "Transporte", "Saúde", "Lazer", "Viagem", "Roupas",
  "Tecnologia", "Alimentação", "Energia", "Internet",
  "Educação", "Presentes", "Streaming", "Academia",
  "Investimentos", "Outros", "Interno", "Assinaturas", "Compras",
  "Doações", "Esportes", "Finanças", "Férias", "Mobilidade",
  "Pets", "Telefone", "Trabalho", "Transferências", "Vendas"
];

interface TransactionDetailContentProps {
  transaction: any;
  onClose: () => void;
  onConfirm?: (id: string) => void; 
}

export function TransactionDetailContent({ transaction, onClose, onConfirm }: TransactionDetailContentProps) {
    const [keyword, setKeyword] = useState("");
    
    if (!transaction) return null;

    const handleCategoryUpdate = async (id: string, category: string) => {
        try {
            await updateTransactionCategory(id, { category1: category });
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
            const result = await createRuleAndApply(transaction.id, keyword, transaction.category1 || "Outros");
            if (result.success) {
                toast.success("Regra criada e aplicada!");
                setKeyword("");
                if (onConfirm) onConfirm(transaction.id); // Auto confirm
                onClose();
            } else {
                toast.error("Erro ao criar regra: " + result.error);
            }
        } catch (error) {
           toast.error("Erro inesperado ao criar regra");
        }
    };

    return (
        <DrawerContent className="bg-card border-none p-0 overflow-hidden rounded-t-[3rem] shadow-2xl">
            <div className="mx-auto w-full max-w-2xl flex flex-col h-[85vh] md:h-auto overflow-y-auto">
                <div className="w-16 h-1.5 bg-secondary rounded-full mx-auto mt-6 mb-8 shrink-0" />
                
                <div className="px-10 pb-12 flex flex-col items-center text-center">
                    <div className={cn(
                        "w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl transition-transform hover:scale-110 duration-500 shrink-0",
                        Number(transaction.amount) < 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                        {Number(transaction.amount) < 0 ? <ShoppingBag className="h-10 w-10" /> : <TrendingUp className="h-10 w-10" />}
                    </div>
                    
                    <h2 className="text-3xl font-bold text-foreground tracking-tight leading-tight mb-2 font-display">{transaction.description}</h2>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <span className="bg-secondary px-3 py-1 rounded-lg text-[10px]">{transaction.source}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </p>
                    
                    <div className={cn(
                        "text-6xl font-black tracking-tighter mb-10 font-display",
                        Number(transaction.amount) < 0 ? "text-destructive" : "text-emerald-500"
                    )}>
                        {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Math.abs(Number(transaction.amount)))}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-6 mb-10">
                        <div className="p-6 rounded-3xl bg-secondary/50 border border-border text-left group">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Categoria</p>
                            <Select 
                                defaultValue={transaction.category1} 
                                onValueChange={(val) => handleCategoryUpdate(transaction.id, val)}
                            >
                                <SelectTrigger className="w-full h-10 bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-foreground">
                                    <SelectValue placeholder="Selecionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="p-6 rounded-3xl bg-secondary/50 border border-border text-left group">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Confiabilidade</p>
                            <p className="text-lg font-bold text-foreground flex items-center gap-3">
                                <Brain className="h-5 w-5 text-primary" />
                                {transaction.needsReview ? "Revisão Manual" : "Alta (AI)"}
                            </p>
                        </div>
                    </div>

                    {/* Technical Details Section */}
                    <div className="w-full bg-secondary/30 rounded-3xl p-6 mb-10 text-left border border-border/50">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
                            <Info className="h-4 w-4 text-primary" />
                            Info. Técnica de Classificação
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
                            {/* NEW: Data and Account */}
                            <div className="flex flex-col gap-1">
                                <span className="uppercase tracking-widest text-[9px] opacity-70">Data</span>
                                <span className="text-foreground font-mono bg-background/50 p-1.5 rounded border border-border/50">
                                    {new Date(transaction.date).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="uppercase tracking-widest text-[9px] opacity-70">Conta / Fonte</span>
                                <span className="text-foreground font-mono bg-background/50 p-1.5 rounded border border-border/50">
                                    {transaction.source}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 md:col-span-2">
                                <span className="uppercase tracking-widest text-[9px] opacity-70">Descrição Original (Raw)</span>
                                <span className="text-foreground font-mono bg-background/50 p-1.5 rounded border border-border/50 break-all whitespace-pre-wrap text-[10px]" title={transaction.descRaw}>
                                    {transaction.descRaw}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 md:col-span-2">
                                <span className="uppercase tracking-widest text-[9px] opacity-70">Key Desc (Normalizada para Match)</span>
                                <span className="text-foreground font-mono bg-background/50 p-1.5 rounded border border-border/50 break-all whitespace-pre-wrap text-[10px]" title={transaction.keyDesc || transaction.descNorm}>
                                    {transaction.keyDesc || transaction.descNorm || "-"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="uppercase tracking-widest text-[9px] opacity-70">Regra Aplicada</span>
                                <span className="text-foreground font-bold">
                                    {transaction.rule?.name || "Nenhuma regra automática"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="uppercase tracking-widest text-[9px] opacity-70">Keywords da Regra</span>
                                <span className="text-foreground font-mono bg-background/50 p-1.5 rounded border border-border/50 break-words whitespace-pre-wrap text-[10px]" title={transaction.rule?.keywords}>
                                    {transaction.rule?.keywords || "-"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="uppercase tracking-widest text-[9px] opacity-70">Taxonomia Detectada</span>
                                <span className="text-foreground flex gap-2">
                                    {transaction.category2 && <Badge variant="outline" className="text-[9px] h-5">{transaction.category2}</Badge>}
                                    {transaction.category3 && <Badge variant="outline" className="text-[9px] h-5">{transaction.category3}</Badge>}
                                    {!transaction.category2 && !transaction.category3 && "-"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="uppercase tracking-widest text-[9px] opacity-70">ID Transação</span>
                                <span className="text-foreground font-mono opacity-50 text-[9px]">
                                    {transaction.id}
                                </span>
                            </div>
                        </div>

                         {/* Quick Rule Creator */}
                         <div className="mt-8 pt-6 border-t border-border/50">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
                                <Zap className="h-4 w-4 text-amber-500" />
                                Criar Regra Rápida
                            </h4>
                            <div className="flex flex-col gap-3">
                                <p className="text-[10px] text-muted-foreground">
                                    Digite uma palavra-chave presente na descrição acima para criar uma regra automática para "{transaction.category1}".
                                </p>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Ex: AMAZON, UBER, RESTAURANTE..." 
                                        className="bg-background/50 h-12 font-mono text-sm uppercase"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                                    />
                                    <Button 
                                        className="h-12 bg-secondary text-foreground hover:bg-secondary/80 font-bold px-6"
                                        disabled={!keyword}
                                        onClick={handleCreateRule}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Criar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full space-y-4 shrink-0">
                        <Button 
                            className="w-full h-16 bg-primary text-white hover:opacity-95 rounded-2xl font-bold shadow-2xl shadow-primary/20 gap-3 text-lg transition-all active:scale-95"
                            onClick={() => handleConfirm(transaction.id)}
                        >
                            <CheckCircle2 className="h-6 w-6" />
                            Confirmar Lançamento
                        </Button>
                        <Button variant="outline" className="w-full h-16 border-border hover:bg-secondary text-muted-foreground rounded-2xl font-bold transition-all text-sm uppercase tracking-widest" onClick={onClose}>
                            Fechar Detalhes
                        </Button>
                    </div>
                </div>
            </div>
        </DrawerContent>
    );
}
