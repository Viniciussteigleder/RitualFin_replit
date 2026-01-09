import { db } from "@/lib/db";
import { calendarEvents, transactions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  User,
  CreditCard,
  ShoppingBag,
  MoreHorizontal,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Por favor, faça login</div>;
  }

  // In a real app, we would fetch the event by ID. 
  // For now, let's look for one or use dummy data if not found.
  const event = await db.query.calendarEvents.findFirst({
    where: and(
      eq(calendarEvents.id, params.id),
      eq(calendarEvents.userId, session.user.id)
    ),
  });

  // Dummy data for the "Wow" effect based on the provided image
  const dummyEvent = {
    name: "Supermercado Semanal",
    amount: 450,
    frequency: "Toda Sexta-feira",
    nextDueDate: "15 de Outubro",
    category: "Alimentação",
    responsible: "Casal (50/50)",
    paymentMethod: "Cartão XP Infinity",
    status: "Ativo",
    history: [
      { date: "08 Out, 2023", amount: 442.10, status: "Pago" },
      { date: "01 Out, 2023", amount: 460.00, status: "Pago" },
      { date: "24 Set, 2023", amount: 435.50, status: "Pago" },
    ]
  };

  const displayEvent = event ? { 
    ...dummyEvent, 
    name: event.name, 
    amount: Number(event.amount),
    nextDueDate: event.nextDueDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })
  } : dummyEvent;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <div className="flex flex-col gap-8 pb-32 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
        <Link href="/calendar" className="hover:text-primary transition-colors">Calendário</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/calendar" className="hover:text-primary transition-colors">Eventos</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{displayEvent.name}</span>
      </div>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-3xl font-bold text-foreground tracking-tight font-display">Detalhes do Evento</h2>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold gap-2 border-border h-11">
            <Pencil className="h-4 w-4" />
            Editar Evento
          </Button>
          <Button variant="outline" className="rounded-xl font-bold gap-2 border-border text-destructive hover:bg-destructive/5 h-11">
            <Trash2 className="h-4 w-4" />
            Excluir Evento
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="rounded-[2.5rem] border-border shadow-sm bg-card overflow-hidden">
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
               <ShoppingBag className="h-10 w-10" />
            </div>
            <div className="flex flex-col gap-2 flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h3 className="text-2xl font-bold text-foreground font-display">{displayEvent.name}</h3>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-black uppercase tracking-wider">Ativo</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Próximo vencimento: <span className="text-foreground font-bold">{displayEvent.nextDueDate}</span></p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-foreground font-display">{formatCurrency(displayEvent.amount)}</span>
                <span className="text-muted-foreground font-bold text-sm">/ semana</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Informações Detalhadas */}
          <Card className="rounded-[2.5rem] border-border shadow-sm bg-card">
            <CardContent className="p-8">
               <h4 className="text-lg font-bold text-foreground font-display mb-8">Informações Detalhadas</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="flex flex-col gap-1.5">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Categoria</span>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-sm font-bold text-foreground">{displayEvent.category}</span>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recorrência</span>
                     <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">{displayEvent.frequency}</span>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Responsável</span>
                     <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                           <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white" />
                           <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-white" />
                        </div>
                        <span className="text-sm font-bold text-foreground">{displayEvent.responsible}</span>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Método de Pagamento</span>
                     <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">{displayEvent.paymentMethod}</span>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* Histórico de Ocorrências */}
          <Card className="rounded-[2.5rem] border-border shadow-sm bg-card">
            <CardContent className="p-8">
               <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-bold text-foreground font-display">Histórico de Ocorrências</h4>
                  <button className="text-primary font-bold text-xs hover:underline">Ver tudo</button>
               </div>
               <div className="flex flex-col gap-1">
                  <div className="grid grid-cols-4 px-4 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                     <span>Data</span>
                     <span>Valor</span>
                     <span>Status</span>
                     <span className="text-right">Ação</span>
                  </div>
                  {displayEvent.history.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-4 px-4 py-5 hover:bg-secondary/50 rounded-2xl transition-colors items-center">
                       <span className="text-sm font-bold text-foreground">{item.date}</span>
                       <span className="text-sm font-bold text-foreground">{formatCurrency(item.amount)}</span>
                       <div>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-bold flex items-center gap-1.5 w-fit">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             {item.status}
                          </Badge>
                       </div>
                       <div className="text-right">
                          <button className="p-2 hover:bg-white rounded-lg transition-colors text-muted-foreground">
                             <MoreHorizontal className="h-4 w-4" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-8">
           {/* Insights Card */}
           <Card className="rounded-[2.5rem] bg-primary p-8 text-white border-none shadow-xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              <CardContent className="p-0 flex flex-col gap-4 relative z-10">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                    <Lightbulb className="h-4 w-4 text-white" /> Insights Relacionados
                 </div>
                 <h5 className="text-xl font-bold font-display leading-tight">Gasto acima da média</h5>
                 <p className="text-sm font-medium text-white/80">Este evento representou <span className="text-white font-black underline decoration-2 underline-offset-4">12% dos gastos totais</span> do casal no último mês. Considere revisar a lista de compras.</p>
              </CardContent>
           </Card>

           {/* Tendência de Gastos */}
           <Card className="rounded-[2.5rem] border-border shadow-sm bg-card overflow-hidden">
              <CardContent className="p-8">
                 <h4 className="text-lg font-bold text-foreground font-display mb-8">Tendência de Gastos</h4>
                 <div className="flex flex-col gap-6">
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                       {/* Simple dummy chart representation */}
                       {[40, 60, 45, 80, 55, 70].map((height, i) => (
                         <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                            <div 
                              className={cn(
                                "w-full rounded-t-xl transition-all duration-500 group-hover/bar:bg-primary/80",
                                i === 5 ? "bg-primary shadow-lg shadow-primary/20" : "bg-primary/20"
                              )} 
                              style={{ height: `${height}%` }}
                            />
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", i === 5 ? "text-primary" : "text-muted-foreground")}>
                               {['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'][i]}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
