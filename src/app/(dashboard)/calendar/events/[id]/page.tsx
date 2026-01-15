import { db } from "@/lib/db";
import { calendarEvents, accounts } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  ShoppingBag,
  RefreshCw
} from "lucide-react";
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

  const event = await db.query.calendarEvents.findFirst({
    where: and(
      eq(calendarEvents.id, params.id),
      eq(calendarEvents.userId, session.user.id)
    ),
  });

  if (!event) {
    return (
      <div className="flex flex-col gap-6 pb-32 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
          <Link href="/calendar" className="hover:text-primary transition-colors">Calendário</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Evento</span>
        </div>
        <Card className="rounded-[2.5rem] border-border shadow-sm bg-card">
          <CardContent className="p-10">
            <h1 className="text-2xl font-bold text-foreground font-display">Evento não encontrado</h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Este evento não existe ou você não tem permissão para visualizá-lo.
            </p>
            <div className="mt-6">
              <Button asChild className="rounded-xl font-bold">
                <Link href="/calendar">Voltar ao calendário</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const account = event.accountId
    ? await db.query.accounts.findFirst({
        where: and(eq(accounts.id, event.accountId), eq(accounts.userId, session.user.id)),
      })
    : null;

  const recurrenceLabel =
    event.recurrence === "weekly"
      ? "Semanal"
      : event.recurrence === "monthly"
        ? "Mensal"
        : event.recurrence === "yearly"
          ? "Anual"
          : "Não recorrente";

  const recurrenceSuffix = event.recurrence === "none" ? null : recurrenceLabel.toLowerCase();

  const nextDueDateLabel = new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(event.nextDueDate));

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
        <span className="text-foreground">{event.name}</span>
      </div>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-3xl font-bold text-foreground tracking-tight font-display">Detalhes do Evento</h2>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold gap-2 border-border h-11" disabled>
            <Pencil className="h-4 w-4" />
            Editar Evento
          </Button>
          <Button variant="outline" className="rounded-xl font-bold gap-2 border-border text-destructive hover:bg-destructive/5 h-11" disabled>
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
                <h3 className="text-2xl font-bold text-foreground font-display">{event.name}</h3>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black uppercase tracking-wider">
                  {event.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Próximo vencimento: <span className="text-foreground font-bold">{nextDueDateLabel}</span>
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-foreground font-display">{formatCurrency(Number(event.amount))}</span>
                {recurrenceSuffix ? (
                  <span className="text-muted-foreground font-bold text-sm">/ {recurrenceSuffix}</span>
                ) : null}
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
                        <span className="text-sm font-bold text-foreground">
                          {event.category1}{event.category2 ? ` • ${event.category2}` : ""}
                        </span>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recorrência</span>
                     <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">{recurrenceLabel}</span>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Conta</span>
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{account?.name || "—"}</span>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Criado em</span>
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {new Date(event.createdAt).toLocaleDateString("pt-PT")}
                        </span>
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
               </div>
               <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-6">
                 <p className="text-sm font-medium text-muted-foreground">
                   Ainda não há ocorrências registradas para este evento.
                 </p>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-8">
           <Card className="rounded-[2.5rem] border-border shadow-sm bg-card overflow-hidden">
              <CardContent className="p-8">
                 <h4 className="text-lg font-bold text-foreground font-display mb-2">Insights e tendência</h4>
                 <p className="text-sm font-medium text-muted-foreground">
                   Em breve: métricas e histórico baseados em dados reais associados ao evento.
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
