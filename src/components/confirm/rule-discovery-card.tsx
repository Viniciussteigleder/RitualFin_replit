"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRule } from "@/lib/actions/rules";
import { applyCategorization } from "@/lib/actions/categorization";
import { DiscoveryCandidate, TaxonomyOption } from "@/lib/actions/discovery";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface RuleDiscoveryCardProps {
    candidate: DiscoveryCandidate;
    taxonomyOptions: TaxonomyOption[];
}

export function RuleDiscoveryCard({ candidate, taxonomyOptions }: RuleDiscoveryCardProps) {
    const [isPending, startTransition] = useTransition();
    const [keywords, setKeywords] = useState(candidate.description);
    const [selectedLeafId, setSelectedLeafId] = useState<string>("");

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
                    category1: selectedOption.category1,
                    category2: selectedOption.category2,
                    category3: selectedOption.category3,
                    leafId: selectedOption.leafId,
                    type: selectedOption.category1 === "Renda Extra" || selectedOption.category1 === "Trabalho" ? "Receita" : "Despesa",
                    fixVar: "Variável" // Default
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

    return (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {candidate.count} ocorrências
                    </Badge>
                    {candidate.currentCategory1 === 'OPEN' && (
                        <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-200">OPEN</Badge>
                    )}
                </div>
                <h3 className="text-lg font-bold font-display truncate text-foreground" title={candidate.description}>
                    {candidate.description}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Ex: {formatCurrency(candidate.sampleAmount)}</span>
                    <span>•</span>
                    <span>{new Date(candidate.sampleDate).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto bg-secondary/30 p-3 rounded-xl border border-border/50">
               <div className="flex flex-col gap-1 w-full md:w-64">
                   <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Palavras-chave</label>
                   <Input 
                        value={keywords} 
                        onChange={(e) => setKeywords(e.target.value)} 
                        className="bg-background h-9 text-sm"
                   />
               </div>

               <div className="flex flex-col gap-1 w-full md:w-64">
                   <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Categoria (Leaf)</label>
                   <select 
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={selectedLeafId}
                        onChange={(e) => setSelectedLeafId(e.target.value)}
                   >
                       <option value="">Selecione...</option>
                       {taxonomyOptions.map(opt => (
                           <option key={opt.leafId} value={opt.leafId}>
                               {opt.label}
                           </option>
                       ))}
                   </select>
               </div>

               <Button 
                    onClick={handleCreate} 
                    disabled={isPending}
                    className="h-auto py-2 md:self-end bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
               >
                   {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                   {isPending ? "Criando..." : "Criar Regra"}
               </Button>
            </div>
        </div>
    );
}
