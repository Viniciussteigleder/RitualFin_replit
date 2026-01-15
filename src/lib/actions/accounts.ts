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

    return {
      ...account,
      balance,
      inferredSource,
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
