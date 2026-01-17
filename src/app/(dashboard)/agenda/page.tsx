import { auth } from "@/auth";
import { getCalendarEvents } from "@/lib/actions/calendar";
import { PageHeader, PageContainer } from "@/components/ui/page-header";
import { CalendarDays, ListOrdered } from "lucide-react";
import { AgendaClient } from "./agenda-client";

export default async function AgendaPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para ver sua agenda.</p>
      </div>
    );
  }

  // Fetch all future events (starting from start of today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events = await getCalendarEvents(today);

  return (
    <PageContainer>
      <PageHeader
        icon={ListOrdered}
        iconColor="blue"
        title="Agenda de Pagamentos"
        subtitle="Visualize seus próximos compromissos financeiros em ordem cronológica."
      />

      <AgendaClient initialEvents={events.map(e => ({
        ...e,
        nextDueDate: e.nextDueDate.toISOString()
      }))} />
    </PageContainer>
  );
}
