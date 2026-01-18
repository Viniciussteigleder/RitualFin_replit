
import { config } from 'dotenv';
config({ path: '.env.local' });

async function auditDetachedRules() {
    const { db } = await import("@/lib/db");
    const { rules } = await import("@/lib/db/schema");
    const { isNull, and, ne, isNotNull } = await import("drizzle-orm");

    console.log("--- Auditing Detached Rules ---");
    const detachedRules = await db.query.rules.findMany({
        where: and(
            isNull(rules.leafId),
            isNotNull(rules.category1) 
        )
    });

    console.log(`Found ${detachedRules.length} detached rules.`);
    detachedRules.forEach(r => {
        console.log(`[${r.id}] ${r.keyWords} -> ${r.category1} > ${r.category2} > ${r.category3}`);
    });
}

auditDetachedRules()
    .catch(console.error)
    .then(() => process.exit(0));
