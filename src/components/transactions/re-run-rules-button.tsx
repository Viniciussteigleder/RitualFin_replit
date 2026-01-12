"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, PlayCircle, CheckCircle2 } from "lucide-react";
import { applyCategorization } from "@/lib/actions/categorization";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export function ReRunRulesButton() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending && isOpen) {
        setProgress(10);
        // Simulate progress for UX
        interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 15;
            });
        }, 800);
    } else if (!isPending && isOpen && progress > 0) {
        setProgress(100);
    } else {
        setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPending, isOpen]);

  const handleReRun = () => {
    setIsOpen(true);
    // Short delay to show popup start
    setTimeout(() => {
        startTransition(async () => {
        try {
            const result = await applyCategorization();
            if (result.success) {
            setProgress(100);
            toast.success("Regras Reaplicadas", {
                description: `${result.categorized} transações categorizadas. ${result.total} processadas.`,
            });
            setTimeout(() => {
                setIsOpen(false);
                router.refresh();
            }, 1000); // Close after 1s of 100%
            } else {
            setIsOpen(false);
            toast.error("Falha ao reaplicar regras", {
                description: result.error,
            });
            }
        } catch (error) {
            setIsOpen(false);
            toast.error("Erro inesperado");
        }
        });
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isPending && setIsOpen(open)}>
        <DialogTrigger asChild>
            <Button 
                variant="outline" 
                className="gap-2 font-medium border-emerald-500/20 hover:bg-emerald-50 text-emerald-700"
                title="Reaplicar regras em transações não manuais"
            >
                <RefreshCw className="w-4 h-4" />
                Re-processar Regras
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    {isPending ? <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    Atualizando Inteligência
                </DialogTitle>
                <DialogDescription>
                    O sistema está reavaliando todas as transações com base nas suas regras mais recentes.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>Processando...</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Isso pode levar alguns instantes. Por favor, aguarde.
                </p>
            </div>
        </DialogContent>
    </Dialog>
  );
}
