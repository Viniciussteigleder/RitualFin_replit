import { db } from "@/lib/db";
import { goals, categoryGoals } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Trophy, 
  Sparkles, 
  Star, 
  FileDown, 
  PlusCircle, 
  Lightbulb,
  Wifi,
  Zap as ZapIcon,
  PlayCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function GoalsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold font-sans">Por favor, faça login para ver sua previsão.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-7xl mx-auto px-1">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display">Previsão e Metas</h1>
          <p className="text-muted-foreground font-medium leading-relaxed">Projeção inteligente baseada no seu comportamento financeiro habitual.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="secondary" className="h-14 px-8 rounded-2xl font-bold text-sm bg-secondary/50 border-none shadow-sm flex-1 md:flex-none">
            <FileDown className="h-5 w-5 mr-2" />
            Relatório PDF
          </Button>
          <Button className="h-14 px-8 bg-primary text-white hover:scale-105 transition-all rounded-2xl font-bold text-sm flex-1 md:flex-none shadow-xl shadow-primary/20">
            <PlusCircle className="h-5 w-5 mr-2" />
            Nova Meta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Forecast Chart Card */}
        <div className="lg:col-span-2 bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col group p-2 relative">
           <div className="p-10 pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Saldo Projetado</span>
                 <div className="flex items-center gap-4">
                    <span className="text-5xl font-bold text-foreground tracking-tighter font-display">
                      {formatCurrency(14820.50)}
                    </span>
                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-xl">
                      <ArrowUpRight className="h-4 w-4" />
                      2.450 €
                    </div>
                 </div>
                 <p className="text-emerald-600/60 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                   <Sparkles className="h-3 w-3" />
                   Previsto para os próximos 30 dias
                 </p>
              </div>
              <div className="bg-secondary/50 p-1.5 rounded-2xl flex items-center border border-border/50 self-end sm:self-auto backdrop-blur-sm">
                <button className="px-5 py-2 rounded-xl bg-white dark:bg-card text-foreground text-[10px] font-black uppercase shadow-sm transition-all">Mês</button>
                <button className="px-5 py-2 rounded-xl text-muted-foreground text-[10px] font-black uppercase hover:text-foreground transition-all">Trimestre</button>
              </div>
           </div>

           <div className="h-72 mt-10 relative px-10">
              {/* Simulated Chart */}
              <div className="absolute inset-x-10 bottom-4 h-48 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent rounded-[2rem]"></div>
              <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <path 
                  d="M0,150 C100,150 200,80 300,110 C400,140 500,160 600,140 C700,120 800,70 900,90 L1000,50" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  className="text-primary drop-shadow-[0_0_15px_rgba(0,113,227,0.5)]"
                />
                <circle cx="0" cy="150" r="8" className="fill-white stroke-[4] stroke-primary" />
                <circle cx="1000" cy="50" r="8" className="fill-white stroke-[4] stroke-primary" />
              </svg>
              <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-8 px-2 transition-opacity group-hover:opacity-100">
                 <span>12 Jan</span>
                 <span>20 Jan</span>
                 <span>28 Jan</span>
                 <span>04 Fev</span>
              </div>
           </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="bg-card rounded-[2.5rem] border border-border shadow-sm p-10 flex flex-col group hover:shadow-2xl transition-all duration-500">
           <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-8 shadow-inner group-hover:rotate-6 transition-transform">
              <Lightbulb className="h-8 w-8" />
           </div>
           <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Ritual Insight</h3>
           <p className="text-muted-foreground font-medium leading-relaxed mb-10 flex-1">
             Identificamos um padrão de aumento sazonal na sua conta de energia. Recomendamos reservar um adicional de <span className="text-foreground font-bold">{formatCurrency(45)}</span> para evitar surpresas no final do mês.
           </p>
           <div className="mt-auto space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Confiança do Modelo</span>
                 <span className="text-xs font-bold text-foreground">94%</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
                 <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(0,113,227,0.4)]" style={{ width: '94%' }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Calendar Section - Redesigned to match Main Calendar style */}
        <div className="lg:col-span-2 bg-card rounded-[2.5rem] border border-border shadow-sm p-10 flex flex-col">
          <div className="flex justify-between items-center mb-10">
             <div className="flex items-center gap-4">
                <Calendar className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Agenda de Janeiro</h3>
             </div>
             <div className="flex gap-3">
                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary"><ChevronLeft className="h-5 w-5" /></Button>
                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary"><ChevronRight className="h-5 w-5" /></Button>
             </div>
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-border/50 rounded-3xl overflow-hidden border border-border shadow-inner">
             {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
               <div key={day} className="bg-secondary/40 py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">{day}</div>
             ))}
             {Array.from({ length: 14 }).map((_, i) => {
               const day = i + 1;
               return (
                 <div key={i} className="bg-card min-h-[110px] p-4 flex flex-col gap-2 relative group hover:bg-secondary/20 transition-all">
                    <span className="text-[12px] font-bold text-muted-foreground group-hover:text-primary transition-colors">{day}</span>
                    {day === 1 && (
                      <div className="absolute inset-x-2 bottom-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">Aluguel</div>
                    )}
                    {day === 8 && (
                      <div className="absolute inset-x-2 bottom-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Salário</div>
                    )}
                    {day === 10 && (
                      <div className="absolute inset-x-2 bottom-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-tight">Luz</div>
                    )}
                 </div>
               )
             })}
          </div>
        </div>

        {/* Upcoming List */}
        <div className="flex flex-col gap-8">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Próximos</h3>
              <Badge className="bg-secondary text-muted-foreground border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">3 Eventos</Badge>
           </div>
           <div className="flex flex-col gap-6">
              {[
                { name: 'Internet Fibra', amount: 120.00, date: '15 JAN', icon: Wifi, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { name: 'Energia Elétrica', amount: 210.50, date: '20 JAN', icon: ZapIcon, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { name: 'Abono Salarial', amount: 1250.00, date: '25 JAN', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10', type: 'in' },
              ].map((item, idx) => (
                <div key={idx} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm group hover:shadow-2xl hover:-translate-x-1 transition-all duration-500 flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12", item.bg, item.color)}>
                         <item.icon className="h-7 w-7" />
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{item.name}</span>
                         <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] opacity-60">Recorrência Mensal</span>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.date}</span>
                      <span className={cn("text-xl font-bold tracking-tighter", item.type === 'in' ? "text-emerald-500" : "text-foreground")}>
                        {formatCurrency(item.amount)}
                      </span>
                   </div>
                </div>
              ))}
              
              <Button variant="ghost" className="w-full py-8 border-2 border-dashed border-border rounded-[2rem] text-muted-foreground hover:bg-secondary hover:border-primary/30 hover:text-primary transition-all font-bold gap-3">
                 <Plus className="h-5 w-5" />
                 Expandir Projeção
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
