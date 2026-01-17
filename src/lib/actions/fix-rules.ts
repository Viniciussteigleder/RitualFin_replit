"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appCategory, appCategoryLeaf, rules } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureOpenCategoryCore } from "@/lib/actions/setup-open";
import { buildLeafHierarchyMaps, taxonomyPathKey } from "@/lib/taxonomy/hierarchy";

export async function fixAppCategoryIssues() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const log: string[] = [];
  
  try {
    const ensured = await ensureOpenCategoryCore(session.user.id);
    if (!ensured.success || !ensured.openLeafId) {
      return { success: false, message: ensured.error || "Failed to ensure OPEN classification", log };
    }

    const openLeafId = ensured.openLeafId;
    const openAppCat = await db.query.appCategory.findFirst({
      where: and(eq(appCategory.userId, session.user.id), eq(appCategory.name, "OPEN")),
    });
    if (!openAppCat) {
      return { success: false, message: "OPEN app category not found", log };
    }

    const { byLeafId: taxonomyByLeafId, byPathKey: taxonomyByPathKey } = await buildLeafHierarchyMaps(session.user.id);
    const openHierarchy = taxonomyByLeafId.get(openLeafId);
    if (!openHierarchy) {
      return { success: false, message: "OPEN leaf exists but is missing from taxonomy lookup", log };
    }

    const allRules = await db.query.rules.findMany({
      where: eq(rules.userId, session.user.id),
    });

    let updatedRuleLeafIds = 0;
    let linkedLeavesToOpen = 0;
    let missingTaxonomyLeaves = 0;

    for (const rule of allRules) {
      const normalizedLeafId = rule.leafId === "open" ? null : rule.leafId;
      const pathLeafId =
        !normalizedLeafId && rule.category1 && rule.category2 && rule.category3
          ? taxonomyByPathKey.get(
              taxonomyPathKey({ category1: rule.category1, category2: rule.category2, category3: rule.category3 })
            ) ?? null
          : null;

      const effectiveLeafId = normalizedLeafId ?? pathLeafId ?? openLeafId;

      // Hydrate legacy leafId='open' and rules missing leafId but having a valid taxonomy path.
      if (rule.leafId === "open" && openLeafId) {
        await db.update(rules).set({ leafId: openLeafId }).where(eq(rules.id, rule.id));
        updatedRuleLeafIds++;
      } else if (!rule.leafId && pathLeafId) {
        await db.update(rules).set({ leafId: pathLeafId }).where(eq(rules.id, rule.id));
        updatedRuleLeafIds++;
      }

      if (effectiveLeafId === openLeafId) continue;

      const hierarchy = taxonomyByLeafId.get(effectiveLeafId);
      if (!hierarchy) {
        missingTaxonomyLeaves++;
        continue;
      }

      // If the leaf has no app category mapping, default it to OPEN (instead of creating new taxonomy).
      if (!hierarchy.appCategoryId) {
        const existingLink = await db.query.appCategoryLeaf.findFirst({
          where: and(eq(appCategoryLeaf.userId, session.user.id), eq(appCategoryLeaf.leafId, effectiveLeafId)),
        });
        if (!existingLink) {
          await db.insert(appCategoryLeaf).values({
            userId: session.user.id,
            appCatId: openAppCat.appCatId,
            leafId: effectiveLeafId,
          });
          linkedLeavesToOpen++;
        }
      }
    }

    log.push(`Updated ${updatedRuleLeafIds} rule leafIds (hydrated legacy/missing leafId).`);
    log.push(`Linked ${linkedLeavesToOpen} taxonomy leaves to App Category 'OPEN'.`);
    if (missingTaxonomyLeaves > 0) log.push(`Found ${missingTaxonomyLeaves} rules pointing to missing taxonomy leaves (not auto-fixed).`);

    revalidatePath("/diagnose");
    revalidatePath("/settings/rules");

    return { 
      success: true, 
      message: "Fix completed.",
      log 
    };

  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message, log };
  }
}
