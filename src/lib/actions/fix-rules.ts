"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rules } from "@/lib/db/schema";
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
        log.push(`Could not find match for Rule ${String(rule.id).slice(0,8)}: ${c1} > ${c2} > ${c3}`);
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
