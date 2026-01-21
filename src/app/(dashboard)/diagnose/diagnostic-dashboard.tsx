"use client";

import { useState } from "react";
import { diagnoseAppCategoryIssues } from "@/lib/actions/diagnose";
import { fixDataIntegrityIssues } from "@/lib/actions/categorization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Brain, 
    Network, 
    RefreshCw, 
    ShieldAlert, 
    AlertCircle, 
    Info, 
    CheckCircle2, 
    Plus, 
    Zap, 
    Activity,
    ShieldCheck,
    Search,
    Database,
    Loader2,
    ChevronRight,
    ArrowRightCircle,
    Play
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP: Record<string, any> = {
    Brain,
    Network,
    RefreshCw,
    ShieldCheck,
    Database,
    ShieldAlert
};

export function DiagnosticDashboard({ initialData }: { initialData: any }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(initialData);
    const [step, setStep] = useState<"idle" | "processing" | "results">("idle");
    const [progress, setProgress] = useState(0);

    const runFullDiagnostics = async () => {
        setLoading(true);
        setStep("processing");
        setProgress(10);
        
        try {
            // Simulate steps for better UX
            setTimeout(() => setProgress(30), 500);
            setTimeout(() => setProgress(60), 1200);
            
            const result = await diagnoseAppCategoryIssues();
            
            setProgress(100);
            setTimeout(() => {
                setData(result);
                setStep("results");
                setLoading(false);
                toast.success("Diagnóstico concluído com sucesso!");
            }, 500);
        } catch (error) {
            toast.error("Erro ao executar diagnóstico");
            setLoading(false);
            setStep("idle");
        }
    };

    const handleQuickFix = async () => {
        try {
            const res = await fixDataIntegrityIssues();
            if (res.success) {
                toast.success("Correções aplicadas com sucesso!");
                runFullDiagnostics(); // Refresh
            } else {
                toast.error("Erro ao aplicar correções");
            }
        } catch (error) {
            toast.error("Erro inesperado durante a correção");
        }
    };

    return (
        <div className="space-y-10">
            {/* Header / Intro */}
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-10 border border-slate-800 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-primary" />
                            </div>
                            <Badge variant="outline" className="text-primary border-primary/20 uppercase tracking-widest text-[10px] bg-primary/5">
                                Neural Health Center
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-4 font-display">
                            Diagnóstico de Integridade de Dados
                        </h1>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            Analise a consistência da sua estrutura financeira, taxonomias e regras de automação. 
                            Identifique desvios críticos entre registros e definições de arquitetura.
                        </p>
                    </div>
                    <div className="shrink-0">
                        {step !== "processing" ? (
                            <Button 
                                onClick={runFullDiagnostics} 
                                size="lg" 
                                disabled={loading}
                                className="h-16 px-8 rounded-2xl bg-primary text-white font-bold gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Iniciar Diagnóstico Completo
                            </Button>
                        ) : (
                            <div className="flex flex-col items-end gap-3 min-w-[240px]">
                                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processando Arquitetura...
                                </div>
                                <Progress value={progress} className="h-2 w-full bg-slate-800" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{progress}% concluído</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Abstract background blobs */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>

            {/* Results Topics */}
            <AnimatePresence mode="wait">
                {step === "results" && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {data.topics?.map((topic: any) => {
                            const Icon = ICON_MAP[topic.icon] || Info;
                            return (
                                <Card key={topic.id} className="rounded-[2.5rem] overflow-hidden border-border/50 group hover:shadow-xl transition-all duration-300">
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                                                topic.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                                                topic.status === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                                                'bg-rose-500/10 text-rose-600'
                                            )}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                "uppercase text-[9px] font-black tracking-widest border-none",
                                                topic.status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                                                topic.status === 'warning' ? 'bg-amber-50 text-amber-700' :
                                                'bg-rose-50 text-rose-700'
                                            )}>
                                                {topic.status === 'success' ? 'Saudável' : topic.status === 'warning' ? 'Revisão' : 'Crítico'}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl font-bold tracking-tight mb-2">{topic.title}</CardTitle>
                                        <CardDescription className="text-xs font-semibold leading-relaxed text-muted-foreground/80">
                                            {topic.rationale}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0">
                                        <div className="mt-4 p-4 rounded-2xl bg-secondary/30 border border-border/30">
                                            <p className="text-sm font-bold text-foreground mb-1">Status Summary</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{topic.summary}</p>
                                        </div>
                                        <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary transition-colors cursor-pointer">
                                            Ver Detalhes Técnicos
                                            <ArrowRightCircle className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detailed Logs & Actions */}
            <AnimatePresence>
                {step === "results" && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-4 gap-8"
                    >
                        {/* Sidebar: Integrity Quick Summary */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="rounded-[2.5rem] border border-amber-200/50 bg-amber-50/10 h-full">
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4" />
                                        Integrity Engine
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-4 rounded-3xl border shadow-sm text-center">
                                            <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Total</p>
                                            <p className="text-2xl font-black">{data.integrity?.summary?.totalIssues ?? 0}</p>
                                        </div>
                                        <div className="bg-rose-600 p-4 rounded-3xl text-white shadow-lg shadow-rose-600/20 text-center">
                                            <p className="text-[9px] font-bold opacity-70 uppercase mb-1">Críticos</p>
                                            <p className="text-2xl font-black">{data.integrity?.summary?.critical ?? 0}</p>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                                        <p className="text-[10px] font-bold text-amber-700 uppercase mb-2">Recomendação:</p>
                                        <p className="text-sm font-medium text-amber-900/80 leading-relaxed italic">
                                            "{data.integrity?.recommendation}"
                                        </p>
                                    </div>
                                    {(data.integrity?.summary?.critical ?? 0) > 0 && (
                                        <Button 
                                            onClick={handleQuickFix}
                                            className="w-full h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 shadow-lg shadow-amber-600/10 transition-all active:scale-95"
                                        >
                                            <Zap className="w-4 h-4 fill-current" />
                                            Apply Smart Fix
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Audit Log Content */}
                        <div className="lg:col-span-3">
                            <Card className="rounded-[2.5rem] h-full overflow-hidden border-border/50">
                                <CardHeader className="p-8 bg-slate-50 border-b border-border/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold tracking-tight mb-1">Relatório Neural Detalhado</CardTitle>
                                            <CardDescription>Análise item a item das inconsistências encontradas pelo motor AUDIT.</CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="font-mono text-[9px] px-3 py-1">
                                            v2.4.0 Engine
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/20 max-h-[600px] overflow-y-auto">
                                        {!data.integrity?.issues || data.integrity.issues.length === 0 ? (
                                            <div className="p-20 text-center flex flex-col items-center gap-6">
                                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold text-foreground">Sistema em Perfeita Ordem</p>
                                                    <p className="text-sm text-muted-foreground mt-2">Nenhuma inconsistência de dados foi detectada nesta varredura.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            data.integrity.issues.map((issue: any, idx: number) => (
                                                <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors group">
                                                    <div className="flex items-start justify-between gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Badge className={cn(
                                                                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-md",
                                                                    issue.severity === 'critical' ? 'bg-rose-600' :
                                                                    issue.severity === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                                                                )}>
                                                                    {issue.severity}
                                                                </Badge>
                                                                <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                                                                    {issue.table}
                                                                </span>
                                                                <span className="text-[9px] font-black text-muted-foreground/30 ml-auto uppercase tracking-tighter">
                                                                    {issue.type}
                                                                </span>
                                                            </div>
                                                            <p className="text-base font-bold text-slate-800 leading-tight mb-2 pr-6">
                                                                {issue.description}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-500/5 inline-flex px-3 py-1.5 rounded-xl border border-emerald-500/10">
                                                                <ArrowRightCircle className="w-3.5 h-3.5" />
                                                                Ação Recomendada: {issue.suggestedFix}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Tip */}
            {step === "results" && (
                <div className="flex justify-center pt-8">
                    <div className="inline-flex items-center gap-4 bg-primary/5 border border-primary/10 px-6 py-4 rounded-3xl">
                        <Info className="w-5 h-5 text-primary" />
                        <p className="text-xs font-bold text-primary/80 uppercase tracking-widest">
                            Dica: Execute diagnósticos após grandes importações ou mudanças manuais nas regras.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
