"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Sparkles, Brain } from "lucide-react";
import { formatAmount, getCategoryStyles } from "@/lib/utils/transaction-formatters";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";

interface QuickReviewCardProps {
    transaction: any;
    onConfirm: (id: string) => void;
    onSkip: (tx: any) => void;
    aliasMap?: Record<string, string>;
}

export function QuickReviewCard({ 
    transaction, 
    onConfirm, 
    onSkip,
    aliasMap = {}
}: QuickReviewCardProps) {
    if (!transaction) return null;

    const { color: catColor } = getCategoryStyles(transaction.category1);
    const amount = Number(transaction.amount);
    
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={transaction.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 200, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full"
            >
                <Card className="w-full max-w-sm mx-auto overflow-hidden relative aspect-[4/5] shadow-2xl border-border bg-card group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col items-center justify-between h-full p-8 text-center">
                        {/* Header: AI Confidence Badge */}
                        <div className="w-full flex justify-between items-center mb-4">
                            <Badge variant="outline" className="bg-secondary/50 border-primary/20 text-[10px] font-black uppercase tracking-widest gap-1 px-3 py-1">
                                <Brain className="w-3 h-3 text-primary" />
                                Sugestão IA
                            </Badge>
                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">
                                1 de 12 pendentes
                            </span>
                        </div>

                        {/* Middle: Brand/Icon */}
                        <div className="flex-1 flex flex-col items-center justify-center gap-6">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                {transaction.aliasDesc && aliasMap[transaction.aliasDesc] ? (
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center border border-border overflow-hidden relative p-4">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={aliasMap[transaction.aliasDesc]}
                                            alt={transaction.aliasDesc}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <CategoryIcon category={transaction.category1} size="lg" className="h-24 w-24 rounded-[2.5rem]" />
                                )}
                            </motion.div>
                            
                            <div>
                                <h3 className="text-2xl font-bold font-display tracking-tight text-foreground line-clamp-2 px-2">
                                    {transaction.aliasDesc || transaction.description || transaction.descRaw}
                                </h3>
                                <p className="text-4xl font-black text-foreground mt-4 tracking-tighter">
                                    {formatAmount(amount)}
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-2 mt-4 bg-secondary/30 px-6 py-4 rounded-3xl border border-border/50">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Mover para</span>
                                <div className="flex items-center gap-2">
                                    <CategoryIcon category={transaction.category1} size="sm" />
                                    <span className="text-sm font-bold text-foreground">
                                        {transaction.appCategoryName || transaction.category1 || "Indefinido"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer: Actions */}
                        <div className="flex gap-4 w-full mt-8">
                            <Button 
                                variant="outline" 
                                className="flex-1 h-16 rounded-2xl border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-[background-color,color,border-color,box-shadow,opacity] duration-150 font-bold gap-2 text-base" 
                                onClick={() => onSkip(transaction)}
                            >
                                <X className="w-5 h-5" />
                                Editar
                            </Button>
                            <Button 
                                className="flex-1 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-base shadow-lg shadow-emerald-500/20 active:scale-95 transition-[background-color,box-shadow,transform,opacity] duration-150" 
                                onClick={() => onConfirm(transaction.id)}
                            >
                                <Check className="w-5 h-5" />
                                Sim
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
