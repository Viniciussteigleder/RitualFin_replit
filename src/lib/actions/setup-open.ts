"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appCategory, taxonomyLevel1, taxonomyLevel2, taxonomyLeaf, appCategoryLeaf } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function ensureOpenCategory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const log = [];

  try {
    // 0. Ensure 'OPEN' exists in category_1 ENUM
    // This is a runtime migration to support the user request
    try {
        await db.execute(sql`ALTER TYPE category_1 ADD VALUE IF NOT EXISTS 'OPEN'`);
        log.push("Ensured 'OPEN' in category_1 ENUM.");
    } catch (e: any) {
        // Postgres < 12 doesn't support IF NOT EXISTS for enum values, so catch error if it exists
        if (e.message.includes('already exists')) {
             log.push("'OPEN' already in category_1 ENUM.");
        } else {
             // It might be that we can't alter type inside a transaction or permission issue
             console.error("Failed to alter enum:", e);
             log.push("Warning: Could not add 'OPEN' to enum. " + e.message);
        }
    }

    // 1. Ensure App Category "OPEN"
    let openAppCat = await db.query.appCategory.findFirst({
        where: and(eq(appCategory.name, "OPEN"), eq(appCategory.userId, userId))
    });

    if (!openAppCat) {
        log.push("Creating App Category 'OPEN'...");
        const res = await db.insert(appCategory).values({
            userId,
            name: "OPEN",
            active: true
        }).returning();
        openAppCat = res[0];
    } else {
        log.push("App Category 'OPEN' already exists.");
    }

    // 2. Ensure Taxonomy Level 1 "OPEN"
    let l1 = await db.query.taxonomyLevel1.findFirst({
        where: and(eq(taxonomyLevel1.nivel1Pt, "OPEN"), eq(taxonomyLevel1.userId, userId))
    });

    if (!l1) {
        log.push("Creating Level 1 'OPEN'...");
        const res = await db.insert(taxonomyLevel1).values({
            userId,
            nivel1Pt: "OPEN"
        }).returning();
        l1 = res[0];
    } else {
        log.push("Level 1 'OPEN' already exists.");
    }

    // 3. Ensure Taxonomy Level 2 "OPEN"
    let l2 = await db.query.taxonomyLevel2.findFirst({
        where: and(eq(taxonomyLevel2.nivel2Pt, "OPEN"), eq(taxonomyLevel2.level1Id, l1.level1Id))
    });

    if (!l2) {
        log.push("Creating Level 2 'OPEN'...");
        const res = await db.insert(taxonomyLevel2).values({
            userId,
            level1Id: l1.level1Id,
            nivel2Pt: "OPEN"
        }).returning();
        l2 = res[0];
    } else {
        log.push("Level 2 'OPEN' already exists.");
    }

    // 4. Ensure Taxonomy Leaf "OPEN"
    let leaf = await db.query.taxonomyLeaf.findFirst({
        where: and(eq(taxonomyLeaf.nivel3Pt, "OPEN"), eq(taxonomyLeaf.level2Id, l2.level2Id))
    });

    if (!leaf) {
        log.push("Creating Leaf 'OPEN'...");
        const res = await db.insert(taxonomyLeaf).values({
            userId,
            level2Id: l2.level2Id,
            nivel3Pt: "OPEN"
        }).returning();
        leaf = res[0];
    } else {
        log.push("Leaf 'OPEN' already exists.");
    }

    // 5. Link Leaf to App Category
    const link = await db.query.appCategoryLeaf.findFirst({
        where: and(eq(appCategoryLeaf.leafId, leaf.leafId), eq(appCategoryLeaf.appCatId, openAppCat.appCatId))
    });

    if (!link) {
        log.push("Linking Leaf 'OPEN' to App Category 'OPEN'...");
        await db.insert(appCategoryLeaf).values({
            userId,
            appCatId: openAppCat.appCatId,
            leafId: leaf.leafId
        });
    } else {
        log.push("Link already exists.");
    }

    return { 
        success: true, 
        log,
        openLeafId: leaf.leafId
    };

  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message, log };
  }
}
