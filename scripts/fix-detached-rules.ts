
import { config } from 'dotenv';
config({ path: '.env.local' });

async function fixDetachedRules() {
    const { db } = await import("@/lib/db");
    const { rules, taxonomyLeaf, taxonomyLevel2, taxonomyLevel1, appCategoryLeaf, appCategory } = await import("@/lib/db/schema");
    const { isNull, and, eq, like } = await import("drizzle-orm");

    console.log("--- Fixing Detached Rules ---");

    // 1. Fetch all taxonomy map
    const taxonomy = await db.select({
        leafId: taxonomyLeaf.leafId,
        leafName: taxonomyLeaf.nivel3Pt,
        l2Name: taxonomyLevel2.nivel2Pt,
        l1Name: taxonomyLevel1.nivel1Pt,
        appCatName: appCategory.name,
        appCatId: appCategory.appCatId
    })
    .from(taxonomyLeaf)
    .leftJoin(taxonomyLevel2, eq(taxonomyLeaf.level2Id, taxonomyLevel2.level2Id))
    .leftJoin(taxonomyLevel1, eq(taxonomyLevel2.level1Id, taxonomyLevel1.level1Id))
    .leftJoin(appCategoryLeaf, eq(taxonomyLeaf.leafId, appCategoryLeaf.leafId))
    .leftJoin(appCategory, eq(appCategoryLeaf.appCatId, appCategory.appCatId));

    // Create lookup map: "Cat1|Cat2|Cat3" -> leafId
    const taxonomyMap = new Map();
    taxonomy.forEach(t => {
        const key = `${t.l1Name}|${t.l2Name}|${t.leafName}`.toLowerCase();
        taxonomyMap.set(key, t);
    });

    // 2. Fetch detached rules
    const detachedRules = await db.query.rules.findMany({
        where: and(isNull(rules.leafId))
    });

    console.log(`Found ${detachedRules.length} potential detached rules.`);

    let fixedCount = 0;
    
    for (const rule of detachedRules) {
        if (!rule.category1 || !rule.category3) continue;

        // Try to match exact path
        const lookupKey = `${rule.category1}|${rule.category2 || ''}|${rule.category3}`.toLowerCase();
        let match = taxonomyMap.get(lookupKey);

        // Fallback: Try searching for leaf name only if unique
        if (!match) {
             const leafMatches = taxonomy.filter(t => t.leafName.toLowerCase() === rule.category3!.toLowerCase());
             if (leafMatches.length === 1) {
                 match = leafMatches[0];
                 console.log(`Fuzzy match for ${rule.category3}: Found ${match.l1Name} > ${match.l2Name} > ${match.leafName}`);
             }
        }

        if (match) {
            console.log(`Fixing Rule [${rule.id.slice(0,8)}] "${rule.keyWords}": Linking to Leaf ${match.leafName}`);
            await db.update(rules)
                .set({
                    leafId: match.leafId,
                    appCategoryId: match.appCatId || null,
                    appCategoryName: match.appCatName || null,
                    category1: match.l1Name, // Ensure casing is correct
                    category2: match.l2Name,
                    category3: match.leafName
                })
                .where(eq(rules.id, rule.id));
            fixedCount++;
        } else {
            console.log(`Could not find taxonomy for: ${rule.category1} > ${rule.category2} > ${rule.category3}`);
        }
    }

    console.log(`\nFixed ${fixedCount} rules.`);
}

fixDetachedRules()
    .catch(console.error)
    .then(() => process.exit(0));
