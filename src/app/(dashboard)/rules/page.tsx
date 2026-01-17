import { auth } from "@/auth";
import { getRules } from "@/lib/actions/rules";
import { Brain, Zap, Activity, ShieldCheck } from "lucide-react";
import { RulesManager } from "@/components/rules/rules-manager";

export default async function RulesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para ver suas regras.</p>
      </div>
    );
  }

  const rules = await getRules();
  const activeRulesCount = rules.filter(r => r.active).length;
  const coverageMock = 94.2; // This would ideally be calculated from transactions

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32 px-1 font-sans">
        {/* Neural Engine Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
          
          <div className="flex flex-col gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display">
                Neural Engine <span className="text-primary/50 text-xl font-medium ml-2 font-mono">v2.0</span>
              </h1>
            </div>
            <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
              O núcleo de inteligência do RitualFin. Gerencie as conexões neurais que transformam descrições brutas em insights financeiros precisos.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full xl:w-auto relative z-10">
             <div className="bg-secondary/30 p-4 rounded-3xl border border-border flex flex-col gap-1 min-w-[140px]">
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                   <Zap className="h-3 w-3 text-amber-500" /> Ativas
                </div>
                <span className="text-2xl font-bold tabular-nums">{activeRulesCount}</span>
             </div>
             <div className="bg-secondary/30 p-4 rounded-3xl border border-border flex flex-col gap-1 min-w-[140px]">
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                   <Activity className="h-3 w-3 text-emerald-500" /> Cobertura
                </div>
                <span className="text-2xl font-bold tabular-nums">{coverageMock}%</span>
             </div>
             <div className="hidden sm:flex bg-secondary/30 p-4 rounded-3xl border border-border flex-col gap-1 min-w-[140px]">
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                   <ShieldCheck className="h-3 w-3 text-blue-500" /> Status
                </div>
                <span className="text-sm font-bold text-emerald-500 flex items-center gap-1.5 mt-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   Operacional
                </span>
             </div>
          </div>
        </div>
      
        <RulesManager initialRules={rules} />
    </div>
  );
}
