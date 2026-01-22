"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { resetDatabaseCore } from "@/lib/reset-core";

export async function resetDatabase() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const result = await resetDatabaseCore(db);

  if (result.success) {
    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/uploads");
  }

  return result;
}
