import { getRules } from "@/lib/actions/rules";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Brain, Zap, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default async function RulesPage() {
  const rules = await getRules();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32 font-sans px-1">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl">
                        <Brain className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Motor de Regras</h1>
                </div>
                <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
                    Gerencie a lógica de classificação automática do seu sistema financeiro. 
                    <span className="text-foreground font-bold"> {rules.length} regras ativas</span> processando suas transações.
                </p>
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="relative hidden md:block w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar regras..." className="pl-10 h-14 rounded-2xl bg-secondary/30 border-transparent" />
                 </div>
                 <Button className="h-14 px-8 bg-foreground text-background font-bold rounded-2xl shadow-xl shadow-foreground/5 gap-2">
                    <Plus className="h-5 w-5" />
                    Nova Regra
                </Button>
            </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 gap-4">
            {rules.map((rule, i) => (
                <div key={rule.id} className="group bg-card hover:bg-secondary/20 border border-border rounded-[2rem] p-6 transition-all duration-300 hover:shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Input Side */}
                    <div className="flex items-center gap-6 w-full md:w-1/3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center font-black text-muted-foreground/30 text-lg">
                            {i + 1}
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Filter className="h-3 w-3" />
                                Se conter
                            </div>
                            <div className="font-bold text-lg text-foreground bg-secondary/50 px-3 py-1 rounded-lg inline-block border border-border/50">
                                "{rule.keyWords}"
                            </div>
                        </div>
                    </div>

                    {/* Logic Flow Indicator */}
                    <div className="hidden md:flex flex-col items-center justify-center w-12">
                        <ArrowRight className="h-6 w-6 text-muted-foreground/30 group-hover:text-primary group-hover:scale-125 transition-all" />
                    </div>

                    {/* Output Side */}
                    <div className="flex items-center gap-6 w-full md:w-1/3">
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Zap className="h-3 w-3" />
                                Classificar como
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="h-8 px-4 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">
                                    {rule.category1}
                                </Badge>
                                {rule.category2 && (
                                    <>
                                        <span className="text-muted-foreground/50">/</span>
                                        <Badge variant="outline" className="h-8 px-3 rounded-xl text-xs bg-transparent">
                                            {rule.category2}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meta & Actions */}
                    <div className="flex items-center justify-end gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                         <div className="flex flex-col items-end mr-4">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Prioridade</span>
                            <span className="font-mono font-bold text-xs">{rule.priority}</span>
                         </div>
                         <div className={`w-3 h-3 rounded-full ${rule.active ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-secondary"}`}></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
