import { db } from "@/lib/db";
import { appCategory, appCategoryLeaf, taxonomyLeaf, taxonomyLevel1, taxonomyLevel2 } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { normalizeForMatch } from "@/lib/rules/classification-utils";

export type LeafHierarchy = {
  leafId: string;
  appCategoryId: string | null;
  appCategoryName: string | null;
  category1: string;
  category2: string;
  category3: string;
  typeDefault: "Despesa" | "Receita" | null;
  fixVarDefault: "Fixo" | "Variável" | null;
};

export function taxonomyPathKey(parts: { category1?: string | null; category2?: string | null; category3?: string | null }): string {
  return [
    normalizeForMatch(parts.category1 || ""),
    normalizeForMatch(parts.category2 || ""),
    normalizeForMatch(parts.category3 || ""),
  ].join("|");
}

export async function buildLeafHierarchyMaps(userId: string) {
  const rows = await db
    .select({
      leafId: taxonomyLeaf.leafId,
      category3: taxonomyLeaf.nivel3Pt,
      category2: taxonomyLevel2.nivel2Pt,
      category1: taxonomyLevel1.nivel1Pt,
      typeDefault: taxonomyLevel2.receitaDespesaDefault,
      fixVarDefault: taxonomyLevel2.fixoVariavelDefault,
      appCategoryId: appCategory.appCatId,
      appCategoryName: appCategory.name,
    })
    .from(taxonomyLeaf)
    .leftJoin(taxonomyLevel2, eq(taxonomyLeaf.level2Id, taxonomyLevel2.level2Id))
    .leftJoin(taxonomyLevel1, eq(taxonomyLevel2.level1Id, taxonomyLevel1.level1Id))
    .leftJoin(appCategoryLeaf, and(eq(taxonomyLeaf.leafId, appCategoryLeaf.leafId), eq(appCategoryLeaf.userId, userId)))
    .leftJoin(appCategory, and(eq(appCategoryLeaf.appCatId, appCategory.appCatId), eq(appCategory.userId, userId)))
    .where(eq(taxonomyLeaf.userId, userId));

  const byLeafId = new Map<string, LeafHierarchy>();
  const byPathKey = new Map<string, string>(); // normalized Cat1|Cat2|Cat3 -> leafId

  for (const row of rows) {
    if (!row.leafId || !row.category1 || !row.category2 || !row.category3) continue;
    const hierarchy: LeafHierarchy = {
      leafId: row.leafId,
      appCategoryId: row.appCategoryId ?? null,
      appCategoryName: row.appCategoryName ?? null,
      category1: row.category1,
      category2: row.category2,
      category3: row.category3,
      typeDefault: (row.typeDefault as any) ?? null,
      fixVarDefault: (row.fixVarDefault as any) ?? null,
    };
    byLeafId.set(row.leafId, hierarchy);
    byPathKey.set(taxonomyPathKey(hierarchy), row.leafId);
  }

  const openLeafId =
    rows.find(
      (r) => r.category1 === "OPEN" && r.category2 === "OPEN" && r.category3 === "OPEN"
    )?.leafId ?? null;

  return { byLeafId, byPathKey, openLeafId };
}

export function hydrateFromLeafId(leafId: string, maps: { byLeafId: Map<string, LeafHierarchy> }, fallbackOpen: LeafHierarchy): LeafHierarchy {
  return maps.byLeafId.get(leafId) ?? fallbackOpen;
}
