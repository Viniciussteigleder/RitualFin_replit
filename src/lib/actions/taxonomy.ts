"use server";

import { db } from "@/lib/db";
import { appCategory, appCategoryLeaf, taxonomyLevel1, taxonomyLevel2, taxonomyLeaf } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { ensureOpenCategoryCore } from "@/lib/actions/setup-open";

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

  await ensureOpenCategoryCore(session.user.id);

  return { success: true, data: result[0] };
}

export async function updateLevel1(id: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.update(taxonomyLevel1)
    .set({ nivel1Pt: name })
    .where(eq(taxonomyLevel1.level1Id, id));

  await ensureOpenCategoryCore(session.user.id);

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

  // App Category is mandatory for correct UI navigation; default to OPEN when created via taxonomy editor.
  await ensureOpenCategoryCore(session.user.id);
  const openAppCat = await db.query.appCategory.findFirst({
    where: and(eq(appCategory.userId, session.user.id), eq(appCategory.name, "OPEN")),
  });
  if (openAppCat) {
    const leaf = result[0]!;
    const existingLink = await db.query.appCategoryLeaf.findFirst({
      where: and(eq(appCategoryLeaf.userId, session.user.id), eq(appCategoryLeaf.leafId, leaf.leafId)),
    });
    if (!existingLink) {
      await db.insert(appCategoryLeaf).values({
        userId: session.user.id,
        appCatId: openAppCat.appCatId,
        leafId: leaf.leafId,
      });
    }
  }

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
