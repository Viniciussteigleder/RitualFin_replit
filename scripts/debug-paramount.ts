
import { config } from 'dotenv';
config({ path: '.env.local' });

async function checkParamount() {
  const { db } = await import("@/lib/db");
  const { rules, taxonomyLeaf, taxonomyLevel2, taxonomyLevel1, appCategoryLeaf, appCategory } = await import("@/lib/db/schema");
  const { eq, like, and } = await import("drizzle-orm");

  const ruleId = "4c044864"; // From user screenshot
  
  console.log("--- Checking Rule ---");
  const rule = await db.query.rules.findFirst({
    where: like(rules.id, `${ruleId}%`)
  });
  console.log("Rule:", rule);

  if (rule?.leafId) {
      console.log("\n--- Checking Taxonomy for LeafId:", rule.leafId, "---");
      const leaf = await db.select({
          leafName: taxonomyLeaf.nivel3Pt,
          l2Name: taxonomyLevel2.nivel2Pt,
          l1Name: taxonomyLevel1.nivel1Pt,
          appCatName: appCategory.name
      })
      .from(taxonomyLeaf)
      .leftJoin(taxonomyLevel2, eq(taxonomyLeaf.level2Id, taxonomyLevel2.level2Id))
      .leftJoin(taxonomyLevel1, eq(taxonomyLevel2.level1Id, taxonomyLevel1.level1Id))
      .leftJoin(appCategoryLeaf, eq(taxonomyLeaf.leafId, appCategoryLeaf.leafId))
      .leftJoin(appCategory, eq(appCategoryLeaf.appCatId, appCategory.appCatId))
      .where(eq(taxonomyLeaf.leafId, rule.leafId));
      
      console.log("Taxonomy lookup:", leaf);
  }

  console.log("\n--- Searching for 'Paramount' in Taxonomy ---");
  const search = await db.select({
      leafId: taxonomyLeaf.leafId,
      leafName: taxonomyLeaf.nivel3Pt,
      l2Name: taxonomyLevel2.nivel2Pt,
      l1Name: taxonomyLevel1.nivel1Pt
  })
  .from(taxonomyLeaf)
  .leftJoin(taxonomyLevel2, eq(taxonomyLeaf.level2Id, taxonomyLevel2.level2Id))
  .leftJoin(taxonomyLevel1, eq(taxonomyLevel2.level1Id, taxonomyLevel1.level1Id))
  .where(like(taxonomyLeaf.nivel3Pt, "%Paramount%"));
  
  console.log("Search results:", search);
}

checkParamount().catch(console.error).then(() => process.exit(0));
