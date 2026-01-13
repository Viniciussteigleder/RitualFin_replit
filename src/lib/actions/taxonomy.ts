"use server";

import { db } from "@/lib/db";
import { taxonomyLevel1, taxonomyLevel2, taxonomyLeaf } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function getTaxonomyTreeCore(userId: string) {
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

export async function getTaxonomyTree() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await getTaxonomyTreeCore(session.user.id);
}

export async function createLevel1(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db.insert(taxonomyLevel1).values({
    userId: session.user.id,
    nivel1Pt: name,
  }).returning();

  return { success: true, data: result[0] };
}

export async function updateLevel1(id: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.update(taxonomyLevel1)
    .set({ nivel1Pt: name })
    .where(eq(taxonomyLevel1.level1Id, id));

  return { success: true };
}

export async function deleteLevel1(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(taxonomyLevel1).where(eq(taxonomyLevel1.level1Id, id));
  return { success: true };
}

export async function createLevel2(level1Id: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db.insert(taxonomyLevel2).values({
    userId: session.user.id,
    level1Id: level1Id,
    nivel2Pt: name,
  }).returning();

  return { success: true, data: result[0] };
}

export async function updateLevel2(id: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.update(taxonomyLevel2)
    .set({ nivel2Pt: name })
    .where(eq(taxonomyLevel2.level2Id, id));

  return { success: true };
}

export async function deleteLevel2(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(taxonomyLevel2).where(eq(taxonomyLevel2.level2Id, id));
  return { success: true };
}

export async function createLeaf(level2Id: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db.insert(taxonomyLeaf).values({
    userId: session.user.id,
    level2Id: level2Id,
    nivel3Pt: name,
  }).returning();

  return { success: true, data: result[0] };
}

export async function updateLeaf(id: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.update(taxonomyLeaf)
    .set({ nivel3Pt: name })
    .where(eq(taxonomyLeaf.leafId, id));

  return { success: true };
}

export async function deleteLeaf(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(taxonomyLeaf).where(eq(taxonomyLeaf.leafId, id));
  return { success: true };
}
