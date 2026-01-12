
import { neon } from '@neondatabase/serverless';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Starting Legacy Category Linking...");

  // 1. Load Taxonomy Maps
  console.log("Loading Taxonomy...");
  const level1 = await sql`SELECT * FROM taxonomy_level_1`;
  const level2 = await sql`SELECT * FROM taxonomy_level_2`;
  const leaves = await sql`SELECT * FROM taxonomy_leaf`;

  const l1Map = new Map(level1.map(l => [l.nivel_1_pt.toLowerCase(), l.level_1_id]));
  const l2Map = new Map(); // key: l1_id:name -> l2_id
  level2.forEach(l => l2Map.set(`${l.level_1_id}:${l.nivel_2_pt.toLowerCase()}`, l.level_2_id));

  const leafMap = new Map(); // key: l2_id:name -> leaf_id
  leaves.forEach(l => leafMap.set(`${l.level_2_id}:${l.nivel_3_pt.toLowerCase()}`, l.leaf_id));

  // 2. Load Unlinked Transactions
  console.log("Fetching unlinked transactions...");
  const unlinked = await sql`
    SELECT id, category_1, category_2, category_3 
    FROM transactions 
    WHERE leaf_id IS NULL AND category_1 IS NOT NULL
  `;
  console.log(`Found ${unlinked.length} unlinked transactions.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const tx of unlinked) {
      const c1 = tx.category_1?.toLowerCase().trim();
      const c2 = tx.category_2?.toLowerCase().trim();
      const c3 = tx.category_3?.toLowerCase().trim();

      if (!c1) {
          skippedCount++;
          continue;
      }

      const l1Id = l1Map.get(c1);
      if (!l1Id) {
          // console.log(`Skipping: L1 '${c1}' not found in taxonomy.`);
          skippedCount++;
          continue;
      }

      let l2Id = null;
      if (c2) {
          l2Id = l2Map.get(`${l1Id}:${c2}`);
      }
      
      // If L2 not found by name, try finding a default/first L2? 
      // For now, only match if L2 name matches.
      if (!l2Id) {
           // check if category 2 is empty but there is only one L2 option? No, risky.
           skippedCount++;
           continue;
      }

      let leafId = null;
      if (c3) {
          leafId = leafMap.get(`${l2Id}:${c3}`);
      }

      // If exact leaf match failed, look for matches like "Geral", "Outros"
      if (!leafId) {
          leafId = leafMap.get(`${l2Id}:geral`) || leafMap.get(`${l2Id}:outros`) || leafMap.get(`${l2Id}:diversos`);
      }

      // If still no leaf, check if there is a leaf with same name as L2?
      if (!leafId && c2) {
          leafId = leafMap.get(`${l2Id}:${c2}`);
      }

      if (leafId) {
          await sql`
            UPDATE transactions 
            SET leaf_id = ${leafId} 
            WHERE id = ${tx.id}
          `;
          updatedCount++;
          if (updatedCount % 50 === 0) process.stdout.write(".");
      } else {
          skippedCount++;
      }
  }

  console.log(`\n\nDone! Linked: ${updatedCount}, Skipped: ${skippedCount}`);
}

main().catch(console.error);
