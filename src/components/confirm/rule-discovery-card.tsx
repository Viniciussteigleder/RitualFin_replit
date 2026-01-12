"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRule } from "@/lib/actions/rules";
import { applyCategorization } from "@/lib/actions/categorization";
import { DiscoveryCandidate, TaxonomyOption } from "@/lib/actions/discovery";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Sparkles, AlertCircle, ArrowRight, Ban } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RuleDiscoveryCardProps {
    candidate: DiscoveryCandidate;
    taxonomyOptions: TaxonomyOption[];
}

export function RuleDiscoveryCard({ candidate, taxonomyOptions }: RuleDiscoveryCardProps) {
    const [isPending, startTransition] = useTransition();
    const [keywords, setKeywords] = useState(candidate.description);
    const [negativeKeywords, setNegativeKeywords] = useState("");
    const [selectedLeafId, setSelectedLeafId] = useState<string>("");
    const [type, setType] = useState<"Receita" | "Despesa">("Despesa");
    const [fixVar, setFixVar] = useState<"Fixo" | "Variável">("Variável");

    const handleCreate = () => {
        if (!selectedLeafId) {
            toast.error("Por favor, selecione uma categoria.");
            return;
        }

        const selectedOption = taxonomyOptions.find(o => o.leafId === selectedLeafId);
        if (!selectedOption) return;

        startTransition(async () => {
            try {
                // 1. Create Rule
                const res = await createRule({
                    keyWords: keywords,
                    keyWordsNegative: negativeKeywords,
                    category1: selectedOption.category1,
                    category2: selectedOption.category2,
                    category3: selectedOption.category3,
                    leafId: selectedOption.leafId,
                    type: type,
                    fixVar: fixVar
                });

                if (res.success) {
                    toast.success("Regra criada!", { description: "Aplicando em transações..." });
                    // 2. Re-apply to catch this and others
                    await applyCategorization();
                    toast.success("Regra aplicada com sucesso.");
                } else {
                    toast.error("Erro ao criar regra", { description: res.error });
                }
            } catch (error) {
                toast.error("Erro inesperado");
            }
        });
    };

    // Auto-select type based on category heuristic if category changed
    const onCategoryChange = (val: string) => {
        setSelectedLeafId(val);
        const option = taxonomyOptions.find(o => o.leafId === val);
        if (option) {
             if (option.category1 === "Renda Extra" || option.category1 === "Trabalho" || option.category1.includes("Receita")) {
                 setType("Receita");
             } else {
                 setType("Despesa");
             }
        }
    }

    return (
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/50 to-transparent rounded-bl-3xl -z-10" />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Info Block */}
                <div className="flex flex-col gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="bg-secondary/80 font-mono text-[10px] tracking-wider text-muted-foreground">
                            {candidate.count} OCORRÊNCIAS
                        </Badge>
                        {candidate.currentCategory1 === 'OPEN' && (
                           <Badge variant="destructive" className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 text-[10px]">OPEN</Badge> 
                        )}
                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">
                            {new Date(candidate.sampleDate).toLocaleDateString()}
                        </span>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold font-display truncate text-foreground pr-4" title={candidate.description}>
                            {candidate.description}
                        </h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-sm font-bold", Number(candidate.sampleAmount) < 0 ? "text-destructive" : "text-emerald-500")}>
                                {formatCurrency(Math.abs(Number(candidate.sampleAmount)))}
                            </span>
                             <span className="text-xs text-muted-foreground">valor recente</span>
                         </div>
                    </div>

                    <div className="mt-auto hidden lg:block">
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                            Crie uma regra para automatizar futuros lançamentos similares a este.
                        </p>
                    </div>
                </div>

                {/* Right: Action Form Block */}
                <div className="w-full lg:w-[600px] bg-secondary/20 p-5 rounded-xl border border-border/40 flex flex-col gap-4">
                    
                    {/* Row 1: Keywords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Palavra-chave (Positiva)
                            </label>
                            <Input 
                                value={keywords} 
                                onChange={(e) => setKeywords(e.target.value)} 
                                className="bg-background h-9 text-sm font-medium border-border/60 focus:border-primary/50"
                                placeholder="Termo obrigatório"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                <Ban className="w-3 h-3" /> Palavra-chave (Negativa)
                            </label>
                            <Input 
                                value={negativeKeywords} 
                                onChange={(e) => setNegativeKeywords(e.target.value)} 
                                className="bg-background h-9 text-sm font-medium border-border/60 focus:border-primary/50"
                                placeholder="Opcional (Ex: Transferência)"
                            />
                        </div>
                    </div>

                    {/* Row 2: Classification */}
                    <div className="grid grid-cols-[1fr_100px_100px] gap-4">
                         <div className="space-y-1.5 col-span-3 md:col-span-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Classificar como</label>
                            <select 
                                className="h-9 w-full rounded-md border border-border/60 bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={selectedLeafId}
                                onChange={(e) => onCategoryChange(e.target.value)}
                            >
                                <option value="">Selecione a categoria...</option>
                                {taxonomyOptions.map(opt => (
                                    <option key={opt.leafId} value={opt.leafId}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                         <div className="space-y-1.5 col-span-3 md:col-span-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Tipo</label>
                            <select 
                                className="h-9 w-full rounded-md border border-border/60 bg-background px-3 py-1 text-sm shadow-sm"
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                            >
                                <option value="Despesa">Despesa</option>
                                <option value="Receita">Receita</option>
                            </select>
                        </div>

                         <div className="space-y-1.5 col-span-3 md:col-span-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Frequência</label>
                            <select 
                                className="h-9 w-full rounded-md border border-border/60 bg-background px-3 py-1 text-sm shadow-sm"
                                value={fixVar}
                                onChange={(e) => setFixVar(e.target.value as any)}
                            >
                                <option value="Variável">Variável</option>
                                <option value="Fixo">Fixo</option>
                            </select>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2 flex justify-end">
                        <Button 
                                onClick={handleCreate} 
                                disabled={isPending}
                                className={cn(
                                    "h-10 px-6 font-bold transition-all duration-300 shadow-md",
                                    isPending ? "bg-muted text-muted-foreground" : "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-95"
                                )}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Criar Regra e Aplicar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
