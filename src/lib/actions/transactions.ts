"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTransactions(limit = 50) {
  const session = await auth();
  if (!session?.user?.id) return [];

  // TODO: Add filtering and pagination support
  return await db.query.transactions.findMany({
    where: (tx, { eq }) => eq(tx.userId, session.user.id),
    orderBy: [desc(transactions.date)],
    limit: limit,
    with: {
      rule: true,
      evidenceLinks: {
        with: {
          ingestionItem: true
        }
      }
    }
  });
}

export async function updateTransactionCategory(
  transactionId: string, 
  data: { category1: string; category2?: string; category3?: string }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.update(transactions)
    .set({
      category1: data.category1,
      category2: data.category2,
      category3: data.category3,
      needsReview: false, // Auto-confirm on manual edit
      isManual: true
    })
    .where(eq(transactions.id, transactionId));

  revalidatePath("/transactions");
  revalidatePath("/"); // Dashboard
  return { success: true };
}

export async function confirmTransaction(transactionId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await db.update(transactions)
        .set({ needsReview: false })
        .where(eq(transactions.id, transactionId));

    revalidatePath("/transactions");
    return { success: true };
}
