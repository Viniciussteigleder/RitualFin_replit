"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { calendarEvents } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type CalendarEvent = typeof calendarEvents.$inferSelect;

export interface CreateCalendarEventData {
  name: string;
  amount: number;
  category1: string;
  category2?: string;
  recurrence: string;
  nextDueDate: string;
  accountId?: string;
}

export async function getCalendarEvents(startDate?: Date, endDate?: Date) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const conditions = [eq(calendarEvents.userId, session.user.id)];

  if (startDate) {
    conditions.push(gte(calendarEvents.nextDueDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(calendarEvents.nextDueDate, endDate));
  }

  return await db.query.calendarEvents.findMany({
    where: and(...conditions),
    orderBy: [desc(calendarEvents.nextDueDate)],
  });
}

export async function getCalendarEventById(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return await db.query.calendarEvents.findFirst({
    where: and(
      eq(calendarEvents.id, id),
      eq(calendarEvents.userId, session.user.id)
    ),
  });
}

export async function createCalendarEvent(data: CreateCalendarEventData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const [event] = await db
      .insert(calendarEvents)
      .values({
        userId: session.user.id,
        name: data.name,
        amount: data.amount,
        category1: data.category1 as any,
        category2: data.category2,
        recurrence: data.recurrence,
        nextDueDate: new Date(data.nextDueDate),
        accountId: data.accountId,
        isActive: true,
      })
      .returning();

    revalidatePath("/calendar");
    return { success: true, event };
  } catch (error) {
    console.error("[createCalendarEvent] Error:", error);
    return { success: false, error: "Erro ao criar evento" };
  }
}

export async function updateCalendarEvent(
  id: string,
  data: Partial<CreateCalendarEventData>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.category1 !== undefined) updateData.category1 = data.category1;
    if (data.category2 !== undefined) updateData.category2 = data.category2;
    if (data.recurrence !== undefined) updateData.recurrence = data.recurrence;
    if (data.nextDueDate !== undefined)
      updateData.nextDueDate = new Date(data.nextDueDate);
    if (data.accountId !== undefined) updateData.accountId = data.accountId;

    const [event] = await db
      .update(calendarEvents)
      .set(updateData)
      .where(
        and(
          eq(calendarEvents.id, id),
          eq(calendarEvents.userId, session.user.id)
        )
      )
      .returning();

    revalidatePath("/calendar");
    return { success: true, event };
  } catch (error) {
    console.error("[updateCalendarEvent] Error:", error);
    return { success: false, error: "Erro ao atualizar evento" };
  }
}

export async function deleteCalendarEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    await db
      .delete(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, id),
          eq(calendarEvents.userId, session.user.id)
        )
      );

    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    console.error("[deleteCalendarEvent] Error:", error);
    return { success: false, error: "Erro ao excluir evento" };
  }
}

export async function toggleCalendarEventActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const [event] = await db
      .update(calendarEvents)
      .set({ isActive })
      .where(
        and(
          eq(calendarEvents.id, id),
          eq(calendarEvents.userId, session.user.id)
        )
      )
      .returning();

    revalidatePath("/calendar");
    return { success: true, event };
  } catch (error) {
    console.error("[toggleCalendarEventActive] Error:", error);
    return { success: false, error: "Erro ao atualizar status do evento" };
  }
}

export async function advanceRecurringEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const event = await db.query.calendarEvents.findFirst({
      where: and(
        eq(calendarEvents.id, id),
        eq(calendarEvents.userId, session.user.id)
      ),
    });

    if (!event) {
      return { success: false, error: "Evento não encontrado" };
    }

    let nextDate = new Date(event.nextDueDate);

    switch (event.recurrence) {
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        return { success: false, error: "Evento não é recorrente" };
    }

    const [updated] = await db
      .update(calendarEvents)
      .set({ nextDueDate: nextDate })
      .where(eq(calendarEvents.id, id))
      .returning();

    revalidatePath("/calendar");
    return { success: true, event: updated };
  } catch (error) {
    console.error("[advanceRecurringEvent] Error:", error);
    return { success: false, error: "Erro ao avançar evento" };
  }
}
