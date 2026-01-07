
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.query.accounts.findMany({
    where: eq(accounts.userId, session.user.id),
    orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
  });
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
