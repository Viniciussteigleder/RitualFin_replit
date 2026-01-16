"use client";

import { useState } from "react";
import { QuickReviewCard } from "./QuickReviewCard";
import { confirmTransaction } from "@/lib/actions/transactions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface QuickReviewFeedProps {
    transactions: any[];
    aliasMap?: Record<string, string>;
}

export function QuickReviewFeed({ transactions: initialTransactions, aliasMap = {} }: QuickReviewFeedProps) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentTx = transactions[currentIndex];

    const handleConfirm = async (id: string) => {
        try {
            await confirmTransaction(id);
            toast.success("Transação confirmada!");
            // Smoothly move to next
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 300);
        } catch (error) {
            toast.error("Erro ao confirmar transação");
        }
    };

    const handleSkip = (tx: any) => {
        // For now, "Skip/Edit" just moves to next or we could open a drawer
        // The report says "Skip" could be "Edit". 
        // For the "Feed" experience, we'll just move to next for now 
        // or the user can click the buttons.
        setCurrentIndex(prev => prev + 1);
    };

    if (transactions.length === 0 || currentIndex >= transactions.length) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
            >
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold font-display">Tudo Revisado!</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                    Você classificou todas as transações pendentes. Ótimo trabalho!
                </p>
                <Link href="/transactions" className="mt-6">
                    <Button variant="outline" className="rounded-xl font-bold">
                        Ver Extrato Completo
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold font-display tracking-tight text-foreground">Review Rápido</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                        {transactions.length - currentIndex} itens restantes
                    </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
            </div>

            <QuickReviewCard
                transaction={currentTx}
                onConfirm={handleConfirm}
                onSkip={handleSkip}
                aliasMap={aliasMap}
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
                <Link href="/confirm" className="col-span-2">
                    <div className="bg-secondary/50 border border-border/50 p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ver Todos em Lista</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
