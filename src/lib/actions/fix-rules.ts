"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rules, appCategoryLeaf } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function fixAppCategoryIssues() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const log = [];
  
  try {
    // 1. Get all rules (including those without leaf_id)
    const result = await db.execute(sql`
      SELECT 
        r.id,
        r.user_id,
        r.category_1,
        r.category_2,
        r.category_3,
        r.leaf_id,
        acl.app_cat_id,
        ac.name as app_category_name
      FROM rules r
      LEFT JOIN taxonomy_leaf tl ON r.leaf_id = tl.leaf_id
      LEFT JOIN app_category_leaf acl ON tl.leaf_id = acl.leaf_id
      LEFT JOIN app_category ac ON acl.app_cat_id = ac.app_cat_id
      WHERE r.user_id = ${session.user.id}
    `);

    const allRules = result.rows as any[]; // Cast to any[] to handle raw SQL result

    // Rules that are missing app category
    const brokenRules = allRules.filter(r => !r.app_category_name);
    log.push(`Found ${brokenRules.length} rules missing App Category.`);

    if (brokenRules.length === 0) {
      return { success: true, message: "No issues found.", log };
    }

    // 2. Build Taxonomy Lookup Map
    // We need to match (Cat1, Cat2, Cat3) -> LeafID
    const taxonomyData = await db.execute(sql`
      SELECT 
        t1.nivel_1_pt as c1,
        t2.nivel_2_pt as c2,
        tl.nivel_3_pt as c3,
        tl.leaf_id
      FROM taxonomy_leaf tl
      JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
      JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    `);

    const taxonomyMap = new Map<string, string>();
    (taxonomyData.rows as any[]).forEach(row => {
      // Create comprehensive keys for matching
      // Full match: C1|C2|C3
      if (row.c1 && row.c2 && row.c3) {
        taxonomyMap.set(`${row.c1}|${row.c2}|${row.c3}`.toLowerCase(), row.leaf_id as string);
      }
      // Partial match: C1|C2 (assuming generic C3 or matching first available)
      if (row.c1 && row.c2) {
        const key2 = `${row.c1}|${row.c2}`.toLowerCase();
        if (!taxonomyMap.has(key2)) taxonomyMap.set(key2, row.leaf_id as string);
      }
    });

    // 3. Attempt to Fix
    let fixedCount = 0;
    
    for (const rule of brokenRules) {
      // Constructs search keys
      const c1 = (rule.category_1 || "").toString().trim();
      const c2 = (rule.category_2 || "").toString().trim();
      const c3 = (rule.category_3 || "").toString().trim();

      // Try exact match first
      let matchId = taxonomyMap.get(`${c1}|${c2}|${c3}`.toLowerCase());
      
      // Try Level 2 match if no match found yet
      if (!matchId && c2) {
         matchId = taxonomyMap.get(`${c1}|${c2}`.toLowerCase());
      }
      
      // If we found a leaf_id, update the rule!
      if (matchId) {
        await db.update(rules)
          .set({ leafId: matchId })
          .where(eq(rules.id, rule.id as string));
        
        fixedCount++;
      } else {
        // If no match found, we must CREATE the taxonomy structure
        // This handles cases like "Alimentação > Supermercado > Outros desc" that don't satisfy existing taxonomy
        
        try {
            // 1. Find or Create Level 1
            const resultL1 = await db.execute(sql`
                SELECT level_1_id FROM taxonomy_level_1 WHERE nivel_1_pt = ${c1} LIMIT 1
            `);
            let l1Id = resultL1.rows[0]?.level_1_id as string;
            
            if (!l1Id) {
                // Should exist but just in case
                console.log(`Warning: Level 1 ${c1} not found, skipping creation for safety.`);
                log.push(`Skipped Rule ${String(rule.id).slice(0,8)}: Level 1 '${c1}' not found.`);
                continue; 
            }

            // 2. Find or Create Level 2
            let l2Id: string;
            const resultL2 = await db.execute(sql`
                SELECT level_2_id FROM taxonomy_level_2 
                WHERE level_1_id = ${l1Id} AND nivel_2_pt = ${c2 || 'Outros'} LIMIT 1
            `);
            
            if (resultL2.rows.length > 0) {
                l2Id = resultL2.rows[0].level_2_id as string;
            } else {
                const newL2 = await db.execute(sql`
                    INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt)
                    VALUES (${session.user.id}, ${l1Id}, ${c2 || 'Outros'})
                    RETURNING level_2_id
                `);
                l2Id = newL2.rows[0].level_2_id as string;
                log.push(`Created Level 2: ${c2}`);
            }

            // 3. Create Leaf (Level 3)
            const newLeaf = await db.execute(sql`
                INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt)
                VALUES (${session.user.id}, ${l2Id}, ${c3 || 'Geral'})
                RETURNING leaf_id
            `);
            const newLeafId = newLeaf.rows[0].leaf_id as string;
            log.push(`Created Leaf: ${c3}`);

            // 4. Update Rule
            await db.update(rules)
                .set({ leafId: newLeafId })
                .where(eq(rules.id, rule.id as string));

            // 5. Link to App Category
            // Find appropriate App Cat ID based on Level 1 (Heuristic)
            // Or default to 'Alimentação' if C1 is Alimentação
            const appCatResult = await db.execute(sql`
                SELECT ac.app_cat_id 
                FROM app_category ac
                WHERE ac.name = ${c1} OR ac.name ILIKE ${'%' + c1 + '%'}
                LIMIT 1
            `);
            
            if (appCatResult.rows.length > 0) {
                const appCatId = appCatResult.rows[0].app_cat_id as string;
                await db.insert(appCategoryLeaf).values({
                    userId: session.user.id,
                    appCatId: appCatId,
                    leafId: newLeafId
                });
                 log.push(`Linked new Leaf to App Category: ${c1}`);
            } else {
                 log.push(`Warning: Could not link new Leaf to App Category (No match for ${c1})`);
            }

            fixedCount++;
        } catch (err: any) {
            log.push(`Failed to create taxonomy for ${c1}>${c2}>${c3}: ${err.message}`);
        }
      }
    }

    const unfixableCount = brokenRules.length - fixedCount;
    if (fixedCount > 0) {
        log.push(`Successfully hydrated ${fixedCount} rules with new Leaf IDs.`);
    }
    if (unfixableCount > 0) {
        log.push(`Unable to fix ${unfixableCount} rules (no matching taxonomy found).`);
    }

    revalidatePath("/diagnose");
    revalidatePath("/settings/rules");

    return { 
      success: true, 
      message: `Hydrated ${fixedCount} rules. Unfixable: ${unfixableCount}`,
      log 
    };

  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message, log };
  }
}
