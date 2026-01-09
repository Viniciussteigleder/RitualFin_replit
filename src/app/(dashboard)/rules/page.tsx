
import { getRules } from "@/lib/actions/rules";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck, Tag, Zap, MoreVertical, Edit2, Trash2, ChevronRight, PlusCircle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function RulesPage() {
  const rules = await getRules();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32 px-1 font-sans">
        {/* Page Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight font-display mb-2">Regras de Classificação</h1>
            <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">Crie automações poderosas para organizar seus gastos automaticamente através de palavras-chave.</p>
          </div>
          <Button className="h-12 px-6 bg-foreground text-background hover:opacity-90 rounded-2xl font-bold transition-all shadow-xl shadow-foreground/5 gap-2">
            <PlusCircle className="h-4 w-4" />
            Nova Regra
          </Button>
        </div>
      
        <div className="grid gap-6">
            {rules.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-center bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mt-40 group-hover:bg-primary/10 transition-colors"></div>
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-secondary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <Brain className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3 font-display">Nenhuma regra de automação</h3>
                    <p className="text-muted-foreground max-w-[360px] font-medium leading-relaxed px-6">
                      Regras ajudam você a não precisar classificar transações repetitivas manualmente.
                    </p>
                    <Button className="mt-12 h-14 px-12 bg-foreground text-background rounded-2xl font-bold transition-all shadow-xl hover:opacity-90 active:scale-95">
                      Criar Minha Primeira Regra
                    </Button>
                  </div>
                </div>
            ) : null}

            {rules.map(rule => (
                <div key={rule.id} className="group relative bg-card border border-border rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex gap-8 items-start">
                            <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:rotate-6 transition-transform shadow-inner">
                                <Zap className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-foreground font-display tracking-tight group-hover:text-primary transition-colors">
                                    {rule.name || "Regra Sem Título"}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="bg-secondary/50 border-none text-muted-foreground font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl">
                                        Termo: {rule.keywords || rule.keyWords}
                                    </Badge>
                                    <span className="text-muted-foreground/30">•</span>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/30 px-3 py-1.5 rounded-xl">Prioridade {rule.priority}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3 px-6 py-3 bg-foreground text-background rounded-2xl text-xs font-bold shadow-xl shadow-foreground/5">
                                <Tag className="h-4 w-4" />
                                {rule.category1}
                            </div>
                            {rule.category2 && (
                                <>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                                    <div className="px-6 py-3 bg-secondary text-foreground rounded-2xl text-xs font-bold">
                                        {rule.category2}
                                    </div>
                                </>
                            )}
                            
                            <div className="flex items-center gap-4 ml-auto md:ml-6">
                                <Badge className={cn(
                                   "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none",
                                   rule.active ? "bg-emerald-500/10 text-emerald-500" : "bg-neutral-500/10 text-neutral-500"
                                )}>
                                    {rule.active ? "Ativa" : "Inativa"}
                                </Badge>
                                <Button variant="secondary" size="icon" className="h-12 w-12 rounded-2xl bg-secondary/50 border-none hover:bg-secondary hover:scale-110 transition-all">
                                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}

