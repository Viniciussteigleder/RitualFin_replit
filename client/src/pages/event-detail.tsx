import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Lightbulb,
  Package,
  Film,
  Plane,
  Music,
  Dumbbell
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { eventOccurrencesApi } from "@/lib/api";
import { eventDetailCopy, translateCategory, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Mercado": ShoppingCart,
  "Transporte": Car,
  "Saúde": Heart,
  "Lazer": Film,
  "Compras Online": Package,
  "Viagem": Plane,
  "Streaming": Music,
  "Academia": Dumbbell,
  "Outros": CreditCard
};

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Moradia": "#f97316",
  "Transporte": "#3b82f6",
  "Lazer": "#a855f7",
  "Saúde": "#ef4444",
  "Compras Online": "#ec4899",
  "Viagem": "#06b6d4",
  "Streaming": "#f43f5e",
  "Receitas": "#10b981",
  "Outros": "#6b7280"
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
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long" });
  const dateLongFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long", year: "numeric" });
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "short" });
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);

  const { data: event, isLoading } = useQuery<CalendarEvent>({
    queryKey: ["calendar-event", id],
    queryFn: async () => {
      const res = await fetch(`/api/calendar-events/${id}`);
      if (!res.ok) throw new Error(translate(locale, eventDetailCopy.errorNotFound));
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
      if (!res.ok) throw new Error(translate(locale, eventDetailCopy.errorDelete));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast({ title: translate(locale, eventDetailCopy.toastDeleted) });
      navigate("/calendar");
    }
  });

  const updateOccurrence = useMutation({
    mutationFn: ({ occId, status }: { occId: string; status: string }) =>
      eventOccurrencesApi.update(occId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-occurrences", id] });
      toast({ title: translate(locale, eventDetailCopy.toastStatusUpdated) });
    },
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

  const Icon = CATEGORY_ICONS[event.category1] || CreditCard;
  const color = CATEGORY_COLORS[event.category1] || "#6b7280";
  const dueDate = new Date(event.nextDueDate);
  const recurrenceLabels = translate(locale, eventDetailCopy.recurrenceLabels) as Record<string, string>;

  const totalPaid = occurrences.filter(o => o.status === "paid").reduce((sum, o) => sum + o.amount, 0);
  const avgAmount = occurrences.length > 0 
    ? occurrences.reduce((sum, o) => sum + o.amount, 0) / occurrences.length 
    : event.amount;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link href="/calendar" className="hover:text-primary transition-colors">{translate(locale, eventDetailCopy.breadcrumbCalendar)}</Link>
          <span>/</span>
          <Link href="/calendar" className="hover:text-primary transition-colors">{translate(locale, eventDetailCopy.breadcrumbEvents)}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{event.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{translate(locale, eventDetailCopy.title)}</h1>
          <Link href="/calendar">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {translate(locale, eventDetailCopy.back)}
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
                      {event.isActive ? translate(locale, eventDetailCopy.active) : translate(locale, eventDetailCopy.inactive)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {formatMessage(translate(locale, eventDetailCopy.nextDue), { date: dateFormatter.format(dueDate) })}
                  </p>
                  <div className="mt-3">
                    <span className="text-4xl md:text-5xl font-black text-foreground">
                      {currencyFormatter.format(event.amount)}
                    </span>
                    {event.recurrence !== "none" && (
                      <span className="text-muted-foreground ml-2">
                        {formatMessage(translate(locale, eventDetailCopy.recurrencePer), {
                          label: recurrenceLabels[event.recurrence]?.toLowerCase() || event.recurrence
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  {translate(locale, eventDetailCopy.editEvent)}
                </Button>
                <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 text-rose-600 hover:bg-rose-50 border-rose-200">
                      <Trash2 className="h-4 w-4" />
                      {translate(locale, eventDetailCopy.delete)}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{translate(locale, eventDetailCopy.deleteTitle)}</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground py-4">
                      {formatMessage(translate(locale, eventDetailCopy.deleteBody), { name: event.name })}
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                        {translate(locale, eventDetailCopy.cancel)}
                      </Button>
                      <Button variant="destructive" onClick={() => deleteEvent.mutate()}>
                        {translate(locale, eventDetailCopy.delete)}
                      </Button>
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
                <CardTitle className="text-lg font-semibold">{translate(locale, eventDetailCopy.detailsTitle)}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{translate(locale, eventDetailCopy.category)}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-semibold">
                        {translateCategory(locale, event.category1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{translate(locale, eventDetailCopy.recurrence)}</p>
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{recurrenceLabels[event.recurrence] || event.recurrence}</span>
                    </div>
                  </div>
                  {event.paymentMethod && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{translate(locale, eventDetailCopy.paymentMethod)}</p>
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
                <CardTitle className="text-lg font-semibold">{translate(locale, eventDetailCopy.historyTitle)}</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">{translate(locale, eventDetailCopy.viewAll)}</Button>
              </CardHeader>
              <CardContent className="p-0">
                {occurrences.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{translate(locale, eventDetailCopy.historyEmptyTitle)}</p>
                    <p className="text-xs mt-1">{translate(locale, eventDetailCopy.historyEmptyBody)}</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 text-left">{translate(locale, eventDetailCopy.tableDate)}</th>
                        <th className="px-6 py-3 text-left">{translate(locale, eventDetailCopy.tableAmount)}</th>
                        <th className="px-6 py-3 text-left">{translate(locale, eventDetailCopy.tableStatus)}</th>
                        <th className="px-6 py-3 text-right">{translate(locale, eventDetailCopy.tableAction)}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {occurrences.slice(0, 5).map(occurrence => (
                        <tr key={occurrence.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">
                            {dateLongFormatter.format(new Date(occurrence.date))}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold">
                            {currencyFormatter.format(occurrence.amount)}
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
                              {occurrence.status === "paid"
                                ? translate(locale, eventDetailCopy.statusPaid)
                                : translate(locale, eventDetailCopy.statusPending)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateOccurrence.mutate({
                                  occId: occurrence.id,
                                  status: occurrence.status === "paid" ? "pending" : "paid",
                                })
                              }
                              disabled={updateOccurrence.isPending}
                              className="text-xs"
                            >
                              {occurrence.status === "paid"
                                ? translate(locale, eventDetailCopy.markPending)
                                : translate(locale, eventDetailCopy.markPaid)}
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
                  {translate(locale, eventDetailCopy.insightsTitle)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <p className="text-sm font-semibold text-amber-900">{translate(locale, eventDetailCopy.insightAboveAvgTitle)}</p>
                    <p className="text-xs text-amber-700 mt-1">
                      {formatMessage(translate(locale, eventDetailCopy.insightAboveAvgBody), { percent: 12 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">{translate(locale, eventDetailCopy.trendTitle)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{translate(locale, eventDetailCopy.average)}</span>
                  <span className="font-semibold">
                    {currencyFormatter.format(avgAmount)}
                  </span>
                </div>
                <div className="h-24 flex items-end gap-1">
                  {occurrences.slice(-6).map((o, i) => (
                    <div 
                      key={o.id}
                      className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                      style={{ height: `${(o.amount / (avgAmount * 1.5)) * 100}%`, minHeight: "10%" }}
                      title={`${monthFormatter.format(new Date(o.date))}: ${currencyFormatter.format(o.amount)}`}
                    />
                  ))}
                  {occurrences.length === 0 && (
                    <div className="flex-1 text-center text-sm text-muted-foreground">
                      {translate(locale, eventDetailCopy.noData)}
                    </div>
                  )}
                </div>
                {occurrences.length > 0 && (
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                    {occurrences.slice(-6).map((o, i) => (
                      <span key={i}>{monthFormatter.format(new Date(o.date))}</span>
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
