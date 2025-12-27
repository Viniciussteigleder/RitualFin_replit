import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Home, 
  ShoppingCart, 
  Car, 
  Heart, 
  Coffee,
  Repeat,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  MoreHorizontal,
  Lightbulb
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
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
  "weekly": "Toda semana",
  "biweekly": "Quinzenal",
  "monthly": "Todo mes",
  "yearly": "Todo ano"
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

interface EventOccurrence {
  id: string;
  eventId: string;
  date: string;
  amount: number;
  status: string;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: event, isLoading } = useQuery<CalendarEvent>({
    queryKey: ["calendar-event", id],
    queryFn: async () => {
      const res = await fetch(`/api/calendar-events/${id}`);
      if (!res.ok) throw new Error("Evento nao encontrado");
      return res.json();
    },
    enabled: !!id
  });

  const { data: occurrences = [] } = useQuery<EventOccurrence[]>({
    queryKey: ["event-occurrences", id],
    queryFn: async () => {
      const res = await fetch(`/api/calendar-events/${id}/occurrences`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id
  });

  const deleteEvent = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/calendar-events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir evento");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast({ title: "Evento excluido com sucesso" });
      navigate("/calendar");
    }
  });

  if (isLoading || !event) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  const Icon = CATEGORY_ICONS[event.category1] || ShoppingCart;
  const color = CATEGORY_COLORS[event.category1] || "#6b7280";
  const dueDate = new Date(event.nextDueDate);

  const totalPaid = occurrences.filter(o => o.status === "paid").reduce((sum, o) => sum + o.amount, 0);
  const avgAmount = occurrences.length > 0 
    ? occurrences.reduce((sum, o) => sum + o.amount, 0) / occurrences.length 
    : event.amount;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link href="/calendar" className="hover:text-primary transition-colors">Calendario</Link>
          <span>/</span>
          <Link href="/calendar" className="hover:text-primary transition-colors">Eventos</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{event.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Detalhes do Evento</h1>
          <Link href="/calendar">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card className="bg-gradient-to-br from-white to-primary/5 border-0 shadow-sm overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex gap-5">
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="h-8 w-8 md:h-10 md:w-10" style={{ color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">{event.name}</h2>
                    <Badge variant={event.isActive ? "default" : "secondary"} className={event.isActive ? "bg-green-100 text-green-700" : ""}>
                      {event.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Proximo vencimento: <span className="font-semibold text-foreground">{format(dueDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                  </p>
                  <div className="mt-3">
                    <span className="text-4xl md:text-5xl font-black text-foreground">
                      {event.amount.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                    </span>
                    {event.recurrence !== "none" && (
                      <span className="text-muted-foreground ml-2">/ {RECURRENCE_LABELS[event.recurrence].toLowerCase()}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Editar Evento
                </Button>
                <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 text-rose-600 hover:bg-rose-50 border-rose-200">
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Exclusao</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground py-4">
                      Tem certeza que deseja excluir o evento "{event.name}"? Esta acao nao pode ser desfeita.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
                      <Button variant="destructive" onClick={() => deleteEvent.mutate()}>Excluir</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">Informacoes Detalhadas</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Categoria</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-semibold">{event.category1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recorrencia</p>
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{RECURRENCE_LABELS[event.recurrence]}</span>
                    </div>
                  </div>
                  {event.paymentMethod && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Metodo de Pagamento</p>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{event.paymentMethod}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Historico de Ocorrencias</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">Ver tudo</Button>
              </CardHeader>
              <CardContent className="p-0">
                {occurrences.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum historico de pagamentos</p>
                    <p className="text-xs mt-1">O historico sera criado conforme os pagamentos forem registrados</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 text-left">Data</th>
                        <th className="px-6 py-3 text-left">Valor</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-right">Acao</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {occurrences.slice(0, 5).map(occurrence => (
                        <tr key={occurrence.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">
                            {format(new Date(occurrence.date), "dd MMM, yyyy", { locale: ptBR })}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold">
                            {occurrence.amount.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "gap-1",
                                occurrence.status === "paid" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-amber-100 text-amber-700"
                              )}
                            >
                              {occurrence.status === "paid" ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {occurrence.status === "paid" ? "Pago" : "Pendente"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-800">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Insights Relacionados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <p className="text-sm font-semibold text-amber-900">Gasto acima da media</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Este evento representou <span className="font-bold">12%</span> dos gastos totais do ultimo mes. Considere revisar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Tendencia de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Media</span>
                  <span className="font-semibold">
                    {avgAmount.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
                <div className="h-24 flex items-end gap-1">
                  {occurrences.slice(-6).map((o, i) => (
                    <div 
                      key={o.id}
                      className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                      style={{ height: `${(o.amount / (avgAmount * 1.5)) * 100}%`, minHeight: "10%" }}
                      title={`${format(new Date(o.date), "MMM", { locale: ptBR })}: ${o.amount.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}`}
                    />
                  ))}
                  {occurrences.length === 0 && (
                    <div className="flex-1 text-center text-sm text-muted-foreground">
                      Sem dados suficientes
                    </div>
                  )}
                </div>
                {occurrences.length > 0 && (
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                    {occurrences.slice(-6).map((o, i) => (
                      <span key={i}>{format(new Date(o.date), "MMM", { locale: ptBR })}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
