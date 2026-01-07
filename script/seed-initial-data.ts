import { createRequire } from "module";
import path from "path";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm"; // named export, can stay if generic, but better move

dotenv.config({ path: ".env.local" });

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

async function seed() {
  console.log("🌱 Starting seed...");
  console.log("DB URL Length:", process.env.DATABASE_URL?.length);

  // Dynamic import to ensure process.env is populated
  const { db } = await import("../src/lib/db");
  const { taxonomyLevel1, taxonomyLevel2, taxonomyLeaf, rules } = await import("../src/lib/db/schema");

  const filePath = path.resolve(process.cwd(), "docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx");
  const workbook = XLSX.readFile(filePath);

  // --- Phase 1: Categories & Rules ---
  const catSheet = workbook.Sheets["Categorias"];
  const catData = XLSX.utils.sheet_to_json(catSheet);

  console.log(`Processing ${catData.length} category rows...`);

  // Cache IDs to avoid frequent lookups
  const l1Cache = new Map<string, string>();
  const l2Cache = new Map<string, string>();

  // Use a default user ID for system rules (or null if schema allows, but schema usually requires userId)
  // Since we don't have a user here, we might need to fetch the first user or create a system user. 
  // Ideally, these are "System Rules" (userId is nullable? or we assign to a master user).
  // Checking schema... database user definition might be strict.
  // For this context, I will try to fetch the first user or just proceed if I can insert without userId (if nullable).
  // Schema check showed userId is likely required for Rules. 
  // I will fetch the first user in the DB. If none, I'll create a placeholder.
  
  const { users: usersTable } = await import("../src/lib/db/schema");
  
  const existingUsers = await db.query.users.findMany({ limit: 1 });
  let userId = existingUsers[0]?.id;
  
  if (!userId) {
      console.log("No users found. Creating a seed user 'admin'...");
      const [newUser] = await db.insert(usersTable).values({
          username: "admin",
          email: "admin@ritualfin.com",
          passwordHash: "$2a$10$abcdefg..." // Dummy hash
      }).returning();
      userId = newUser.id;
      console.log("✅ Created seed user:", userId);
  }

  /* 
    Schema assumptions (verified in view_file):
    taxonomyLevel1: id, nivel1Pt
    taxonomyLevel2: id, nivel2Pt, parentId
    taxonomyLeaves: id, leafPt, parentId
    rules: id, userId (NotNull?), name, ...
  */

  for (const row of catData as any[]) {
      const l1Name = (row["Nivel_1_PT"] || "").trim();
      const l2Name = (row["Nivel_2_PT"] || "").trim();
      const l3Name = (row["Nivel_3_PT"] || "").trim(); // Leaf
      const keywords = row["Key_words"];

      if (!l1Name) continue;

      // 1. Level 1
      let l1Id = l1Cache.get(l1Name);
      if (!l1Id) {
          const [existing] = await db.select().from(taxonomyLevel1).where(eq(taxonomyLevel1.nivel1Pt, l1Name));
          if (existing) {
              l1Id = existing.level1Id; // Schema key is level1Id
          } else {
              const [inserted] = await db.insert(taxonomyLevel1).values({ 
                  nivel1Pt: l1Name,
                  userId: userId 
                }).returning();
              l1Id = inserted.level1Id;
          }
          l1Cache.set(l1Name, l1Id);
      }

      // 2. Level 2
      let l2Id = l2Cache.get(`${l1Name}-${l2Name}`);
      if (l2Name && l1Id) {
           if (!l2Id) {
               // Find existing L2 under this L1 (complex query, simplification: just insert if name unique or find by name)
               // For robust seeding, we search by name and parent.
               // Since Drizzle queries are async, better to cache.
               // Assuming unique names for now for simplicity or simple query.
               const existing = await db.query.taxonomyLevel2.findFirst({
                   where: (t, { and, eq }) => and(eq(t.nivel2Pt, l2Name), eq(t.level1Id, l1Id!)) 
               });

               if (existing) {
                   l2Id = existing.level2Id; // Schema key is level2Id
               } else {
                   const [inserted] = await db.insert(taxonomyLevel2).values({ 
                       nivel2Pt: l2Name, 
                       level1Id: l1Id,
                       userId: userId
                    }).returning();
                   l2Id = inserted.level2Id;
               }
               l2Cache.set(`${l1Name}-${l2Name}`, l2Id);
           }
      }

      // 3. Leaf
      let leafId;
      if (l3Name && l2Id) {
           const existing = await db.query.taxonomyLeaf.findFirst({
               where: (t, { and, eq }) => and(eq(t.nivel3Pt, l3Name), eq(t.level2Id, l2Id!)) 
           });
           if (!existing) {
                console.log("Inserting Leaf:", l3Name);
                const [inserted] = await db.insert(taxonomyLeaf).values({
                    nivel3Pt: l3Name,
                    level2Id: l2Id,
                    userId: userId
                }).returning();
                leafId = inserted.leafId; 
           } else {
               leafId = existing.leafId;
           }
      }

      // 4. Rule
      if (userId && keywords) {
          console.log("Inserting Rule for:", l3Name || l2Name);
          const ruleName = l3Name ? `${l1Name} > ${l2Name} > ${l3Name}` : `${l1Name} > ${l2Name}`;
          
          await db.insert(rules).values({
              userId, 
              name: ruleName,
              active: true,
              priority: 1,
              // description: `Auto-generated from Excel`, // Removed description as it might not indicate column exists or valid
              keyWords: keywords, 
              category1: l1Name as any, // Cast to any to bypass string vs enum
              category2: l2Name,
              category3: l3Name,
              type: row["Receita/Despesa"] === "Receita" ? "Receita" : "Despesa",
              fixVar: row["Fixo/Variável"] === "Fixo" ? "Fixo" : "Variável",
              isSystem: true
          });
      }
  }

  console.log("✅ Seed completed.");
  process.exit(0);
}

seed().catch(e => {
    console.error(e);
    process.exit(1);
});
