"use client";

import { useState } from "react";
import { format, isAfter, isBefore, addDays, startOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowRight
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { advanceRecurringEvent, toggleCalendarEventActive } from "@/lib/actions/calendar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AgendaClientProps {
  initialEvents: any[];
}

export function AgendaClient({ initialEvents }: AgendaClientProps) {
  const [events, setEvents] = useState(initialEvents);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleComplete = async (id: string, name: string) => {
    setLoadingId(id);
    try {
      const result = await advanceRecurringEvent(id);
      if (result.success) {
        toast.success(`Pagamento "${name}" registrado!`, {
          description: "A próxima ocorrência foi agendada."
        });
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao atualizar pagamento");
      }
    } catch (error) {
      toast.error("Erro ao atualizar pagamento");
    } finally {
      setLoadingId(null);
    }
  };

  const today = startOfDay(new Date());
  
  // Categorize events
  const overdue = events.filter(e => isBefore(new Date(e.nextDueDate), today) && e.isActive);
  const todayEvents = events.filter(e => format(new Date(e.nextDueDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && e.isActive);
  const upcoming = events.filter(e => isAfter(new Date(e.nextDueDate), today) && e.isActive).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

  const renderEventCard = (event: any, status: 'overdue' | 'today' | 'upcoming') => {
    const dueDate = new Date(event.nextDueDate);
    const isRecurring = event.recurrence !== 'none';

    return (
      <Card key={event.id} className={cn(
        "rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden",
        status === 'overdue' && "border-l-4 border-l-red-500",
        status === 'today' && "border-l-4 border-l-amber-500",
        status === 'upcoming' && "hover:border-primary/50"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              status === 'overdue' ? "bg-red-500/10 text-red-600" :
              status === 'today' ? "bg-amber-500/10 text-amber-600" :
              "bg-blue-500/10 text-blue-600"
            )}>
              <CalendarDays className="h-6 w-6" />
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground truncate max-w-[200px] md:max-w-none">
                  {event.name}
                </h3>
                {isRecurring && (
                  <Badge variant="secondary" className="bg-secondary/50 text-[10px] uppercase font-black tracking-widest px-1.5 py-0.5">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {event.recurrence === 'weekly' ? 'Semanal' : event.recurrence === 'monthly' ? 'Mensal' : 'Anual'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {format(dueDate, "dd 'de' MMMM", { locale: pt })}
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                  {event.category1}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1">
              <span className="text-2xl font-black text-foreground font-display tabular-nums">
                {formatCurrency(event.amount)}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-xl font-bold h-9 gap-2"
                  onClick={() => handleComplete(event.id, event.name)}
                  disabled={loadingId === event.id}
                >
                  <CheckCircle2 className={cn("h-4 w-4", loadingId === event.id ? "animate-spin" : "text-emerald-500")} />
                  Pago
                </Button>
                <Link href={`/calendar/events/${event.id}`}>
                  <Button size="sm" variant="ghost" className="rounded-xl h-9 w-9 p-0">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-12 animate-fade-in-up">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-border bg-red-50/50 dark:bg-red-950/10 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Atrasados</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-foreground font-display">{overdue.length}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">compromissos</span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border bg-amber-50/50 dark:bg-amber-950/10 shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Para Hoje</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-foreground font-display">{todayEvents.length}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">compromissos</span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border bg-blue-50/50 dark:bg-blue-950/10 shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Próximos 30 dias</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-foreground font-display">{upcoming.length}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">compromissos</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Section */}
      {overdue.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-bold text-foreground font-display">Pendentes / Atrasados</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {overdue.map(e => renderEventCard(e, 'overdue'))}
          </div>
        </div>
      )}

      {/* Today Section */}
      {todayEvents.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <Clock className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground font-display">Hoje</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {todayEvents.map(e => renderEventCard(e, 'today'))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-bold text-foreground font-display">Próximos Pagamentos</h2>
          </div>
          <Link href="/calendar">
            <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest gap-2">
              Ver no Calendário <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        
        {upcoming.length === 0 && overdue.length === 0 && todayEvents.length === 0 ? (
          <Card className="rounded-[2.5rem] border-dashed border-2 p-20 flex flex-col items-center justify-center text-center bg-secondary/10">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-foreground font-display">Sua agenda está limpa!</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-2">
              Não há pagamentos próximos cadastrados. Adicione novos eventos no calendário.
            </p>
            <Link href="/calendar">
              <Button className="mt-8 rounded-2xl px-8 font-bold gap-2">
                Ir ao Calendário
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {upcoming.map(e => renderEventCard(e, 'upcoming'))}
          </div>
        )}
      </div>
    </div>
  );
}
