
import { neon } from '@neondatabase/serverless';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Checking Taxonomy Content...");

  // 1. Get all Level 1 categories
  const level1 = await sql`SELECT * FROM taxonomy_level_1`;
  console.log("\nLevel 1 Categories:");
  level1.forEach(r => console.log(`- ${r.nivel_1_pt} (ID: ${r.level_1_id})`));

  // 2. Get all Level 2 categories
  const level2 = await sql`
    SELECT t2.nivel_2_pt, t1.nivel_1_pt 
    FROM taxonomy_level_2 t2
    JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
    ORDER BY t1.nivel_1_pt, t2.nivel_2_pt
  `;
  console.log("\nLevel 2 Categories:");
  level2.forEach(r => console.log(`- ${r.nivel_1_pt} > ${r.nivel_2_pt}`));

  // 3. Check specific mismatch examples (e.g. Moradia)
  console.log("\nChecking for 'Moradia' leaves...");
  
  // Find Moradia Level 1
  const l1 = await sql`SELECT * FROM taxonomy_level_1 WHERE nivel_1_pt = 'Moradia'`;
  if (l1.length > 0) {
      const l1Id = l1[0].level_1_id;
      console.log(`Found Moradia (ID: ${l1Id})`);

      // Find Esting Level 2
      const l2 = await sql`SELECT * FROM taxonomy_level_2 WHERE level_1_id = ${l1Id} AND nivel_2_pt = 'Esting'`;
      if (l2.length > 0) {
          const l2Id = l2[0].level_2_id;
          console.log(`Found Esting (ID: ${l2Id})`);

          // Find Leaves
          const leaves = await sql`SELECT * FROM taxonomy_leaf WHERE level_2_id = ${l2Id}`;
          console.log("Leaves for Moradia > Esting:");
          leaves.forEach(l => console.log(`- ${l.nivel_3_pt} (ID: ${l.leaf_id})`));
      } else {
          console.log("Esting not found under Moradia");
      }
  } else {
      console.log("Moradia not found");
  }
}

main().catch(console.error);
