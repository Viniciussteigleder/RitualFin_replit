
import { db } from "@/lib/db";
import { budgets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getBudgets(month: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.query.budgets.findMany({
    where: and(eq(budgets.userId, session.user.id), eq(budgets.month, month)),
  });
}

export async function updateBudget(id: string, amount: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.update(budgets)
    .set({ amount })
    .where(eq(budgets.id, id));

  revalidatePath("/budgets");
}
