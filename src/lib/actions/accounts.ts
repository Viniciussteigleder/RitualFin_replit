import { db } from "@/lib/db";
import { accounts, transactions } from "@/lib/db/schema";
import { and, eq, isNotNull, ne, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const accountsList = await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
    orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
  });

  const balancesBySourceRows = await db
    .select({
      source: transactions.source,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        ne(transactions.display, "no"),
        isNotNull(transactions.source)
      )
    )
    .groupBy(transactions.source);

  const balancesBySource = new Map<string, number>();
  for (const row of balancesBySourceRows) {
    if (row.source) balancesBySource.set(row.source, Number(row.total ?? 0));
  }

  const activityBySourceRows = await db
    .select({
      source: transactions.source,
      lastUploadAt: sql<Date | null>`MAX(${transactions.importedAt})`,
      lastTransactionAt: sql<Date | null>`MAX(${transactions.paymentDate})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        ne(transactions.display, "no"),
        isNotNull(transactions.source)
      )
    )
    .groupBy(transactions.source);

  const activityBySource = new Map<string, { lastUploadAt: Date | null; lastTransactionAt: Date | null }>();
  for (const row of activityBySourceRows) {
    if (row.source) {
      activityBySource.set(row.source, {
        lastUploadAt: row.lastUploadAt ? new Date(row.lastUploadAt) : null,
        lastTransactionAt: row.lastTransactionAt ? new Date(row.lastTransactionAt) : null,
      });
    }
  }

  function inferSourceFromAccount(account: { name: string; institution: string | null }) {
    const haystack = `${account.name} ${account.institution ?? ""}`.toLowerCase();
    if (haystack.includes("sparkasse")) return "Sparkasse";
    if (haystack.includes("amex") || haystack.includes("american express")) return "Amex";
    if (haystack.includes("miles") || haystack.includes("m&m") || haystack.includes("miles & more")) return "M&M";
    return null;
  }

  const result = accountsList.map((account) => {
    const inferredSource = inferSourceFromAccount(account);
    const balance = inferredSource ? (balancesBySource.get(inferredSource) ?? 0) : null;
    const activity = inferredSource ? (activityBySource.get(inferredSource) ?? { lastUploadAt: null, lastTransactionAt: null }) : { lastUploadAt: null, lastTransactionAt: null };

    return {
      ...account,
      balance,
      inferredSource,
      lastUploadAt: activity.lastUploadAt,
      lastTransactionAt: activity.lastTransactionAt,
    };
  });

  return result;
}

export async function createAccount(data: {
  name: string;
  type: "credit_card" | "debit_card" | "bank_account" | "cash";
  accountNumber?: string;
  icon?: string;
  color?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.insert(accounts).values({
    userId: session.user.id,
    ...data,
  });

  revalidatePath("/accounts");
}

export async function deleteAccount(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(accounts).where(eq(accounts.id, id));

  revalidatePath("/accounts");
}
