"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appCategory, appCategoryLeaf, taxonomyLeaf, taxonomyLevel1, taxonomyLevel2 } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureOpenCategoryCore } from "@/lib/actions/setup-open";

const normalizeName = (value: string) => value.trim().replace(/\s+/g, " ");

export async function createClassificationPath(input: {
  appCategoryName: string;
  category1Name: string;
  category2Name: string;
  category3Name: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const appCategoryName = normalizeName(input.appCategoryName);
  const category1Name = normalizeName(input.category1Name);
  const category2Name = normalizeName(input.category2Name);
  const category3Name = normalizeName(input.category3Name);

  if (!appCategoryName || !category1Name || !category2Name || !category3Name) {
    return { success: false as const, error: "Preencha todos os níveis da classificação." };
  }

  if ([appCategoryName, category1Name, category2Name, category3Name].some((s) => s.length > 80)) {
    return { success: false as const, error: "Nome muito longo (máx 80 caracteres por nível)." };
  }

  const userId = session.user.id;

  // 1) App Category (UI layer)
  let appCat = await db.query.appCategory.findFirst({
    where: and(
      eq(appCategory.userId, userId),
      sql`LOWER(${appCategory.name}) = LOWER(${appCategoryName})`
    ),
  });
  if (!appCat) {
    const created = await db
      .insert(appCategory)
      .values({ userId, name: appCategoryName, active: true })
      .returning();
    appCat = created[0]!;
  }

  // 2) Taxonomy Level 1
  let l1 = await db.query.taxonomyLevel1.findFirst({
    where: and(
      eq(taxonomyLevel1.userId, userId),
      sql`LOWER(${taxonomyLevel1.nivel1Pt}) = LOWER(${category1Name})`
    ),
  });
  if (!l1) {
    const created = await db.insert(taxonomyLevel1).values({ userId, nivel1Pt: category1Name }).returning();
    l1 = created[0]!;
  }

  // 3) Taxonomy Level 2 (scoped under Level 1)
  let l2 = await db.query.taxonomyLevel2.findFirst({
    where: and(
      eq(taxonomyLevel2.userId, userId),
      eq(taxonomyLevel2.level1Id, l1.level1Id),
      sql`LOWER(${taxonomyLevel2.nivel2Pt}) = LOWER(${category2Name})`
    ),
  });
  if (!l2) {
    const created = await db
      .insert(taxonomyLevel2)
      .values({ userId, level1Id: l1.level1Id, nivel2Pt: category2Name })
      .returning();
    l2 = created[0]!;
  }

  // 4) Taxonomy Leaf (scoped under Level 2)
  let leaf = await db.query.taxonomyLeaf.findFirst({
    where: and(
      eq(taxonomyLeaf.userId, userId),
      eq(taxonomyLeaf.level2Id, l2.level2Id),
      sql`LOWER(${taxonomyLeaf.nivel3Pt}) = LOWER(${category3Name})`
    ),
  });
  if (!leaf) {
    const created = await db
      .insert(taxonomyLeaf)
      .values({ userId, level2Id: l2.level2Id, nivel3Pt: category3Name })
      .returning();
    leaf = created[0]!;
  }

  // 5) Link leaf to App Category (1:1 for a given leaf per user)
  const existingLink = await db.query.appCategoryLeaf.findFirst({
    where: and(eq(appCategoryLeaf.userId, userId), eq(appCategoryLeaf.leafId, leaf.leafId)),
  });
  if (!existingLink) {
    await db.insert(appCategoryLeaf).values({ userId, appCatId: appCat.appCatId, leafId: leaf.leafId });
  } else if (existingLink.appCatId !== appCat.appCatId) {
    await db
      .update(appCategoryLeaf)
      .set({ appCatId: appCat.appCatId })
      .where(eq(appCategoryLeaf.id, existingLink.id));
  }

  // 6) Keep category_1 enum aligned with taxonomy L1 names
  await ensureOpenCategoryCore(userId);

  revalidatePath("/confirm");
  revalidatePath("/settings/categories");
  revalidatePath("/settings/rules");
  revalidatePath("/transactions");

  return {
    success: true as const,
    option: {
      leafId: leaf.leafId,
      label: `${appCat.name} > ${l1.nivel1Pt} > ${l2.nivel2Pt} > ${leaf.nivel3Pt}`,
      appCategory: appCat.name,
      category1: l1.nivel1Pt,
      category2: l2.nivel2Pt,
      category3: leaf.nivel3Pt,
    },
  };
}

