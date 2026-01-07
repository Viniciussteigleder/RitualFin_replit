"use server";

import { db } from "@/lib/db";
import { taxonomyLevel1, taxonomyLevel2, taxonomyLeaf } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function getTaxonomyTree() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  const level1 = await db.query.taxonomyLevel1.findMany({
    where: eq(taxonomyLevel1.userId, userId),
    with: {
      level2s: {
        with: {
          leaves: true
        }
      }
    }
  });

  return level1;
}

export async function createLevel1(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await db.insert(taxonomyLevel1).values({
    userId: session.user.id,
    nivel1Pt: name,
  }).returning();
}

// Additional CRUD actions can be added as needed
