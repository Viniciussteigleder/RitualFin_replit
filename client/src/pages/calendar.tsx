import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Home, 
  ShoppingCart, 
  Car, 
  Heart, 
  Coffee, 
  Repeat, 
  ChevronRight,
  CreditCard,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useMonth } from "@/lib/month-context";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Mercado": ShoppingCart,
  "Transporte": Car,
  "Saúde": Heart,
  "Lazer": Coffee,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Moradia": "#f97316",
  "Transporte": "#3b82f6",
  "Lazer": "#a855f7",
  "Saúde": "#ef4444",
  "Receitas": "#10b981",
  "Outros": "#6b7280"
};

const RECURRENCE_LABELS: Record<string, string> = {
  "none": "Unico",
  "weekly": "Semanal",
  "biweekly": "Quinzenal",
  "monthly": "Mensal",
  "yearly": "Anual"
};

interface CalendarEvent {
  id: string;
  name: string;
  amount: number;
  category1: string;
  category2?: string;
  recurrence: string;
  nextDueDate: string;
  paymentMethod?: string;
  isActive: boolean;
}

export default function CalendarPage() {
  const { month, formatMonth } = useMonth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({
    name: "",
    amount: "",
    category1: "Outros",
    recurrence: "monthly",
    paymentMethod: ""
  });

  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const res = await fetch("/api/calendar-events");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const createEvent = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/calendar-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Erro ao criar evento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      setIsDialogOpen(false);
      setNewEvent({ name: "", amount: "", category1: "Outros", recurrence: "monthly", paymentMethod: "" });
      toast({ title: "Evento criado com sucesso!" });
    }
  });

  const [year, monthNum] = month.split("-").map(Number);
  const currentDate = new Date(year, monthNum - 1, 1);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const upcomingEvents = events.filter(e => {
    const dueDate = new Date(e.nextDueDate);
    return isSameMonth(dueDate, currentDate) && e.isActive;
  }).sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

  const totalCommitted = upcomingEvents.reduce((sum, e) => sum + e.amount, 0);

  const handleCreateEvent = () => {
    if (!newEvent.name || !newEvent.amount) return;
    createEvent.mutate({
      name: newEvent.name,
      amount: parseFloat(newEvent.amount.replace(",", ".")),
      category1: newEvent.category1,
      recurrence: newEvent.recurrence,
      nextDueDate: selectedDate?.toISOString() || new Date().toISOString(),
      paymentMethod: newEvent.paymentMethod || null
    });
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(e => isSameDay(new Date(e.nextDueDate), day));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendario Financeiro</h1>
            <p className="text-muted-foreground">
              Gerencie seus compromissos de {formatMonth(month)}
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2" data-testid="button-add-event">
                <Plus className="h-4 w-4" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Evento Recorrente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nome do Evento</Label>
                  <Input 
                    id="name" 
                    placeholder="Ex: Aluguel, Netflix..." 
                    value={newEvent.name}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Valor (EUR)</Label>
                  <Input 
                    id="amount" 
                    placeholder="0,00" 
                    value={newEvent.amount}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={newEvent.category1} onValueChange={(v) => setNewEvent(prev => ({ ...prev, category1: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Moradia">Moradia</SelectItem>
                      <SelectItem value="Mercado">Mercado</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Lazer">Lazer</SelectItem>
                      <SelectItem value="Saúde">Saude</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recorrencia</Label>
                  <Select value={newEvent.recurrence} onValueChange={(v) => setNewEvent(prev => ({ ...prev, recurrence: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unico</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quinzenal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment">Metodo de Pagamento (opcional)</Label>
                  <Input 
                    id="payment" 
                    placeholder="Ex: Cartao XP" 
                    value={newEvent.paymentMethod}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  />
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={handleCreateEvent}
                  disabled={createEvent.isPending}
                >
                  {createEvent.isPending ? "Criando..." : "Criar Evento"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Compromissos do Mes</p>
                  <p className="text-2xl font-bold text-foreground">{upcomingEvents.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Total Comprometido</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalCommitted.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Proximos 7 Dias</p>
                  <p className="text-2xl font-bold text-foreground">
                    {upcomingEvents.filter(e => new Date(e.nextDueDate) <= addDays(new Date(), 7)).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {formatMonth(month)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-20" />
                ))}
                {daysInMonth.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const hasEvents = dayEvents.length > 0;
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={cn(
                        "h-20 p-1.5 rounded-lg border transition-colors cursor-pointer",
                        isToday(day) ? "bg-primary/10 border-primary/30" : "border-transparent hover:bg-muted/50",
                        hasEvents && "bg-muted/30"
                      )}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        isToday(day) ? "text-primary" : "text-foreground"
                      )}>
                        {format(day, "d")}
                      </div>
                      {dayEvents.slice(0, 2).map(event => {
                        const color = CATEGORY_COLORS[event.category1] || "#6b7280";
                        return (
                          <div 
                            key={event.id}
                            className="text-[10px] truncate rounded px-1 py-0.5 mb-0.5"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            {event.name}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Proximos Vencimentos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {upcomingEvents.length === 0 ? (
                  <div className="px-5 py-8 text-center text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum evento programado</p>
                  </div>
                ) : (
                  upcomingEvents.slice(0, 8).map(event => {
                    const Icon = CATEGORY_ICONS[event.category1] || ShoppingCart;
                    const color = CATEGORY_COLORS[event.category1] || "#6b7280";
                    const dueDate = new Date(event.nextDueDate);
                    const daysUntil = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <Link key={event.id} href={`/calendar/${event.id}`}>
                        <div 
                          className="px-5 py-3.5 hover:bg-muted/30 transition-colors flex items-center gap-4 cursor-pointer"
                          data-testid={`event-item-${event.id}`}
                        >
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Icon className="h-5 w-5" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{event.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{format(dueDate, "dd MMM", { locale: ptBR })}</span>
                              {event.recurrence !== "none" && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  <Repeat className="h-2.5 w-2.5 mr-1" />
                                  {RECURRENCE_LABELS[event.recurrence]}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-semibold text-sm">
                              {event.amount.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                            </span>
                            {daysUntil <= 7 && daysUntil >= 0 && (
                              <Badge variant="outline" className={cn(
                                "text-[10px]",
                                daysUntil <= 3 ? "border-rose-300 text-rose-600" : "border-amber-300 text-amber-600"
                              )}>
                                {daysUntil === 0 ? "Hoje" : daysUntil === 1 ? "Amanha" : `${daysUntil} dias`}
                              </Badge>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
