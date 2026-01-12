
import { neon } from '@neondatabase/serverless';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Starting Taxonomy Join Debug (via Direct Neon Client)...");

  // 1. Get a transaction that has a leaf_id
  console.log("1. Finding a transaction with leaf_id...");
  try {
      // Using direct sql tagged template
      const txResult = await sql`
        SELECT id, payment_date, desc_raw, leaf_id, matched_keyword
        FROM transactions 
        WHERE leaf_id IS NOT NULL 
        LIMIT 1
      `;

      if (txResult.length === 0) {
        console.error("❌ No transactions with leaf_id found! The classification script might not have persisted changes properly.");
        return;
      }

      const tx = txResult[0];
      console.log("\nSample Transaction Found:");
      console.log(tx);

      const leafId = tx.leaf_id;
      
      if (!leafId) {
          console.error("❌ leaf_id is null/undefined despite query filtering.");
          return;
      }

      // 2. Check if this leaf_id exists in taxonomy_leaf
      console.log(`\n2. Checking existence of leaf_id '${leafId}' in taxonomy_leaf table...`);
      const leafResult = await sql`
        SELECT * FROM taxonomy_leaf WHERE leaf_id = ${leafId}
      `;

      if (leafResult.length === 0) {
        console.error(`❌ leaf_id '${leafId}' NOT FOUND in taxonomy_leaf table. Referencing integrity broken.`);
      } else {
        console.log("✅ Found in taxonomy_leaf:");
        console.log(leafResult[0]);
        const leaf = leafResult[0];

        // 3. Check Level 2
        console.log(`\n3. Checking Level 2 (ID: ${leaf.level_2_id})...`);
        const l2Result = await sql`
            SELECT * FROM taxonomy_level_2 WHERE level_2_id = ${leaf.level_2_id}
        `;
        
        if (l2Result.length === 0) {
            console.error(`❌ level_2_id '${leaf.level_2_id}' NOT FOUND in taxonomy_level_2.`);
        } else {
            console.log("✅ Found in taxonomy_level_2:");
            console.log(l2Result[0]);
            const l2 = l2Result[0];

            // 4. Check Level 1
            console.log(`\n4. Checking Level 1 (ID: ${l2.level_1_id})...`);
            const l1Result = await sql`
                SELECT * FROM taxonomy_level_1 WHERE level_1_id = ${l2.level_1_id}
            `;

            if (l1Result.length === 0) {
                console.error(`❌ level_1_id '${l2.level_1_id}' NOT FOUND in taxonomy_level_1.`);
            } else {
                 console.log("✅ Found in taxonomy_level_1:");
                 console.log(l1Result[0]);
            }
        }
      }

      // 5. Test the Full Join Query used in the app
      console.log("\n5. Testing the Full Query used in transactions.ts ...");
      const fullQueryResult = await sql`
        SELECT 
          t.id,
          t.matched_keyword,
          COALESCE(t1.nivel_1_pt, 'OPEN') as level_1,
          COALESCE(t2.nivel_2_pt, 'OPEN') as level_2,
          COALESCE(tl.nivel_3_pt, 'OPEN') as level_3
        FROM transactions t
        LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
        LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
        LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
        WHERE t.id = ${tx.id}
      `;

      console.log("Query Result:");
      console.log(fullQueryResult[0]);

  } catch (error) {
      console.error("Error executing queries:", error);
  }
}

main().catch((err) => {
  console.error("Error running script:", err);
  process.exit(1);
});
