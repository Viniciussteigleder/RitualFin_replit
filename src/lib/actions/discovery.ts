"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, taxonomyLeaf, taxonomyLevel2, taxonomyLevel1, appCategoryLeaf, appCategory } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { ensureOpenCategory } from "@/lib/actions/setup-open";

export interface DiscoveryCandidate {
    description: string;
    count: number;
    sampleId: string;
    sampleDate: Date;
    sampleAmount: number;
    currentCategory1: string | null;
    currentAppCategory: string | null;
}

export interface TaxonomyOption {
    leafId: string;
    label: string; // "AppCat > Cat1 > Cat2 > Leaf"
    appCategory: string;
    category1: string;
    category2: string;
    category3: string; 
}

export async function getDiscoveryCandidates(): Promise<DiscoveryCandidate[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const ensured = await ensureOpenCategory();
    if (!ensured.openLeafId) return [];

    // STRICT: Discovery only for truly unclassified (OPEN) cases.
    const txs = await db
      .select({
        descNorm: transactions.descNorm,
        descRaw: transactions.descRaw,
        id: transactions.id,
        date: transactions.paymentDate,
        amount: transactions.amount,
        cat1: transactions.category1,
        leafId: transactions.leafId,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, session.user.id),
          eq(transactions.leafId, ensured.openLeafId),
          sql`${transactions.display} != 'no'`
        )
      )
      .orderBy(desc(transactions.paymentDate))
      .limit(500);

    // Group by description to find frequency
    const grouped = new Map<string, DiscoveryCandidate>();

    for (const tx of txs) {
        // Use normalized description for grouping
        const key = (tx.descNorm || tx.descRaw || "Sem descrição").toUpperCase();
        if (grouped.has(key)) {
            grouped.get(key)!.count++;
        } else {
            grouped.set(key, {
                description: key,
                count: 1,
                sampleId: tx.id,
                sampleDate: tx.date,
                sampleAmount: Number(tx.amount),
                currentCategory1: tx.cat1,
                currentAppCategory: null // Need join to get this, keeping simple for now
            });
        }
    }

    return Array.from(grouped.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);
}

export async function getTaxonomyOptions(): Promise<TaxonomyOption[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const rows = await db
        .select({
            leafId: taxonomyLeaf.leafId,
            leafName: taxonomyLeaf.nivel3Pt, 
            level2Name: taxonomyLevel2.nivel2Pt, 
            level1Name: taxonomyLevel1.nivel1Pt, 
            appCategoryName: appCategory.name,
        })
        .from(taxonomyLeaf)
        .leftJoin(taxonomyLevel2, eq(taxonomyLeaf.level2Id, taxonomyLevel2.level2Id))
        .leftJoin(taxonomyLevel1, eq(taxonomyLevel2.level1Id, taxonomyLevel1.level1Id))
        // Join App Category - this is critical for the "AppCat > Cat1" logic
        .leftJoin(appCategoryLeaf, and(eq(taxonomyLeaf.leafId, appCategoryLeaf.leafId), eq(appCategoryLeaf.userId, session.user.id)))
        .leftJoin(appCategory, and(eq(appCategoryLeaf.appCatId, appCategory.appCatId), eq(appCategory.userId, session.user.id)))
        .where(eq(taxonomyLeaf.userId, session.user.id));
    
    // Transform to options
    return rows.map(r => ({
        leafId: r.leafId,
        label: `${r.appCategoryName || 'OPEN'} > ${r.level1Name} > ${r.level2Name} > ${r.leafName}`,
        appCategory: r.appCategoryName || 'OPEN',
        category1: r.level1Name || 'OPEN',
        category2: r.level2Name || 'OPEN',
        category3: r.leafName || 'OPEN'
    })).sort((a, b) => a.label.localeCompare(b.label));
}
