"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Loader2 } from "lucide-react";
import { confirmHighConfidenceTransactions } from "@/lib/actions/transactions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BulkConfirmButton({ count }: { count: number }) {
    const [isPending, setIsPending] = useState(false);

    const handleBulkConfirm = async () => {
        if (!confirm(`Confirmar todas as ${count} sugestões com mais de 80% de confiança?`)) return;
        
        setIsPending(true);
        try {
            await confirmHighConfidenceTransactions(80);
            toast.success(`${count} transações confirmadas com sucesso!`);
        } catch (error) {
            toast.error("Erro ao realizar confirmação em massa");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Button 
            onClick={handleBulkConfirm}
            disabled={isPending || count === 0}
            className={cn(
                "h-auto py-8 px-8 rounded-[2rem] flex flex-col items-center gap-2 transition-all border-0 shadow-lg",
                isPending ? "bg-secondary text-muted-foreground" : "bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-500/20"
            )}
        >
            {isPending ? (
                <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
                <Zap className="h-8 w-8 fill-current" />
            )}
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Frictionless</span>
                <span className="text-sm font-bold">Aprovação Rápida ({count})</span>
            </div>
        </Button>
    );
}
