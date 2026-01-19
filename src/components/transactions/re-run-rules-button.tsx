"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, PlayCircle, CheckCircle2, Sparkles } from "lucide-react";
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
import { cn } from "@/lib/utils";

export function ReRunRulesButton() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Iniciando...");
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending && isOpen) {
        setProgress(5);
        setStatusText("Iniciando motor de IA...");
        
        // Simulate progress for UX
        interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return prev;
                const next = prev + Math.random() * 8; // Slower, smoother
                
                // Update status text based on progress
                if (next > 15 && next < 40) setStatusText("Analisando novas regras...");
                else if (next >= 40 && next < 70) setStatusText("Reclassificando transações...");
                else if (next >= 70 && next < 85) setStatusText("Aplicando correções...");
                else if (next >= 85) setStatusText("Finalizando processamento...");
                
                return next;
            });
        }, 600);
    } else if (!isPending && isOpen && progress > 0) {
        setProgress(100);
        setStatusText("Concluído!");
    } else {
        setProgress(0);
        setStatusText("Aguardando...");
    }
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- progress is intentionally not a trigger for restarting the animation loop
  }, [isPending, isOpen]);

  const handleReRun = () => {
    // Actually trigger the dialog open only via the button click if not using asChild
    // But here we use DialogTrigger. 
    // Wait, the button IS the trigger.
  };

  const onOpenChange = (open: boolean) => {
      if (open) {
          setIsOpen(true);
          // Auto-start when opened? Or user clicks "Start"?
          // Previous logic auto-started on click because handleReRun was called?
          // No, previous logic called handleReRun which set Open true.
          // BUT the DialogTrigger wraps the button.
          // Let's change the pattern: Button opens generic confirmation or starts immediately?
          // User asked for "pop up about re-run rules", usually implies clicking runs it.
          // I'll make it auto-run on mount of dialog content or keep logic.
          // The previous code had a bug: handleReRun was essentially unused inside the component correctly if Trigger controls open.
          // I will make the button manually control open state to start the process.
      } else if (!isPending) {
          setIsOpen(false);
      }
  };

  const startProcess = () => {
      setIsOpen(true);
      setTimeout(() => {
        startTransition(async () => {
            try {
                const result = await applyCategorization();
                if (result.success) {
                    setProgress(100);
                    setStatusText("Sucesso!");
                    toast.success("Regras Reaplicadas", {
                        description: `${result.categorized} transações categorizadas.`,
                    });
                    setTimeout(() => {
                        setIsOpen(false);
                        router.refresh();
                    }, 1500);
                } else {
                    setIsOpen(false);
                    toast.error("Falha ao processar", { description: result.error });
                }
            } catch (error) {
                setIsOpen(false);
                toast.error("Erro inesperado");
            }
        });
      }, 500);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <div onClick={startProcess}>
            <Button 
                variant="outline" 
                className="gap-2 font-medium border-emerald-500/20 hover:bg-emerald-50 text-emerald-700 transition-[background-color] duration-150"
                title="Reaplicar regras em transações não manuais"
                disabled={isPending}
            >
                <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
                Re-processar Regras
            </Button>
        </div>
        <DialogContent className="sm:max-w-md border-emerald-100 dark:border-emerald-900 shadow-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                    <div className={cn("p-2 rounded-full bg-emerald-100 text-emerald-600 transition-all duration-500", isPending ? "rotate-180" : "")}>
                         {isPending ? <RefreshCw className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <span className="font-display tracking-tight text-foreground">Atualizando Inteligência</span>
                </DialogTitle>
                <DialogDescription className="text-base pt-2">
                    O sistema está reavaliando seu histórico financeiro com base nas regras mais recentes.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        <span className="animate-pulse">{statusText}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden border border-border">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <div className="bg-secondary/50 p-4 rounded-xl flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Dica:</strong> Isso garante que novas regras sejam aplicadas retroativamente a transações passadas que ainda estavam em aberto.
                    </p>
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
}
