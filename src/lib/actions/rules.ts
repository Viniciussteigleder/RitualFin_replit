"use server";

import { db } from "@/lib/db";
import { rules } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { categorizeTransaction } from "@/lib/rules/engine";
import { revalidatePath } from "next/cache";

export async function getRules() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.query.rules.findMany({
    where: eq(rules.userId, session.user.id),
    orderBy: [desc(rules.priority)]
  });
}

export async function testRuleCategorization(description: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userRules = await getRules();
  const result = categorizeTransaction(description, userRules);
  
  return result;
}

export async function createRule(data: typeof rules.$inferInsert) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await db.insert(rules).values({
    ...data,
    userId: session.user.id
  });
  
  revalidatePath("/rules");
}
