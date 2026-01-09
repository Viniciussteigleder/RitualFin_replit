import { db } from "@/lib/db";
import { accounts, transactions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const accountsWithBalance = await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
    orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
  });

  // Fetch balances for all accounts
  const result = await Promise.all(
    accountsWithBalance.map(async (account) => {
      const [balanceRes] = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(transactions)
        .where(eq(transactions.accountId, account.id));
      
      return {
        ...account,
        balance: Number(balanceRes?.total || 0)
      };
    })
  );

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
