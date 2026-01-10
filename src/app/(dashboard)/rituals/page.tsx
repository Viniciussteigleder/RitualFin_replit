import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Target, 
  Zap, 
  BarChart3,
  MoreHorizontal
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default async function RitualsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Por favor, faça login para acessar os rituais</div>;
  }

  const ritualsList = [
    {
      id: "daily",
      name: "Ritual Diário",
      period: "Diário",
      estimatedTime: "3–5 min",
      nextExecution: "Hoje, às 20:00",
      description: "Revisar pendências, itens não categorizados e verificar previsão.",
      icon: Zap,
      status: "Ativo",
      streak: 5
    },
    {
      id: "weekly",
      name: "Ritual Semanal",
      period: "Semanal",
      estimatedTime: "10–15 min",
      nextExecution: "Segunda, 12 de Jan",
      description: "Revisar gastos por categoria, ajustar eventos recorrentes e regras.",
      icon: BarChart3,
      status: "Ativo",
      streak: 2
    },
    {
       id: "monthly",
       name: "Check-in Mensal",
       period: "Mensal",
       estimatedTime: "20–30 min",
       nextExecution: "31 de Janeiro",
       description: "Planejamento do próximo mês e análise de fechamento.",
       icon: Target,
       status: "Pendente",
       streak: 1
    }
  ];

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-5xl mx-auto">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-2xl">
                 <Zap className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Fluxo Operacional</h1>
           </div>
           <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
             A consistência é a chave. Execute seus rituais para manter o sistema sempre atualizado.
           </p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end mr-2 bg-secondary/30 p-4 rounded-3xl border border-border px-6">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Sequência Atual</span>
                <div className="flex items-center gap-2">
                   <span className="text-2xl font-bold text-amber-500 tracking-tighter">5 Dias</span>
                   <span className="text-xs">🔥</span>
                </div>
           </div>
        </div>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <div className="flex items-center justify-between mb-8 px-1">
          <TabsList className="bg-secondary/50 p-1 rounded-2xl border border-border h-auto">
            <TabsTrigger value="daily" className="rounded-xl px-6 py-2 h-9 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Diário</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-xl px-6 py-2 h-9 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Semanal</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-xl px-6 py-2 h-9 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Mensal</TabsTrigger>
          </TabsList>
        </div>

        {["daily", "weekly", "monthly"].map((period) => (
          <TabsContent key={period} value={period} className="focus-visible:outline-none flex flex-col gap-6">
            {ritualsList.filter(r => r.id === period).map((ritual) => (
              <Card key={ritual.id} className="rounded-[2.5rem] bg-card border-border shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-500">
                <CardContent className="p-10">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:rotate-6">
                      <ritual.icon className="h-10 w-10" />
                    </div>
                    
                    <div className="flex flex-col gap-6 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-2xl font-bold text-foreground font-display">{ritual.name}</h3>
                          <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-lg">{ritual.description}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-all">
                                    <MoreHorizontal className="h-6 w-6" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl">
                                <DropdownMenuItem className="rounded-xl font-bold">Ver Histórico</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl font-bold">Configurar Lembrete</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl font-bold text-red-500">Pular Ocorrência</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-bold text-foreground">{ritual.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-bold text-foreground">{ritual.nextExecution}</span>
                        </div>
                        <Badge className={cn(
                          "border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                          ritual.status === "Ativo" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                        )}>
                          {ritual.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center md:justify-end">
                       <Link href={ritual.id === 'daily' ? '/transactions' : ritual.id === 'weekly' ? '/calendar' : '/goals'}>
                           <Button className="h-16 px-10 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all text-base gap-3">
                              Iniciar
                              <ChevronRight className="h-5 w-5" />
                           </Button>
                       </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="bg-secondary/30 border border-dashed border-border rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center opacity-60">
               <RefreshCw className="h-10 w-10 text-muted-foreground mb-4 opacity-30" />
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Nenhum outro ritual</p>
               <p className="text-xs text-muted-foreground font-medium">Você está em dia com suas obrigações financeiras.</p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
