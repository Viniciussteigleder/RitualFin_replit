"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, rules, taxonomyLeaf, taxonomyLevel2, taxonomyLevel1, appCategoryLeaf, appCategory } from "@/lib/db/schema";
import { eq, and, sql, desc, or, isNull, lt } from "drizzle-orm";

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

    // Fetch transactions that are candidates for rule creation
    // Criteria: 'OPEN', 'Outros', NULL, or Low Confidence
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
        .where(and(
            eq(transactions.userId, session.user.id),
            or(
                eq(transactions.category1, 'OPEN' as any),
                eq(transactions.category1, 'Outros'),
                isNull(transactions.category1),
                lt(transactions.confidence, 80)
            )
        ))
        .orderBy(desc(transactions.paymentDate))
        .limit(200);

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
        .leftJoin(appCategoryLeaf, eq(taxonomyLeaf.leafId, appCategoryLeaf.leafId))
        .leftJoin(appCategory, eq(appCategoryLeaf.appCatId, appCategory.appCatId));
    
    // Transform to options
    return rows.map(r => ({
        leafId: r.leafId,
        label: `${r.appCategoryName || 'OPEN'} > ${r.level1Name} > ${r.level2Name} > ${r.leafName}`,
        appCategory: r.appCategoryName || 'OPEN',
        category1: r.level1Name || 'Outros',
        category2: r.level2Name || 'Outros',
        category3: r.leafName || 'Outros'
    })).sort((a, b) => a.label.localeCompare(b.label));
}
