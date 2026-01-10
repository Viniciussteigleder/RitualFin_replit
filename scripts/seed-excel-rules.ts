import dotenv from "dotenv";
// dotenv.config({ path: ".env.production.local" });
// dotenv.config({ path: ".env.local" });
dotenv.config();

console.log("DB URL set?", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.includes("@")) {
        console.log("DB Host:", process.env.DATABASE_URL.split("@")[1].split("/")[0]);
    }
}

import { 
  users, 
  aliasAssets, 
  taxonomyLevel1, 
  taxonomyLevel2, 
  taxonomyLeaf, 
  appCategory, 
  appCategoryLeaf, 
  rules 
} from "../src/lib/db/schema";
import { eq, and } from "drizzle-orm";
import * as path from "path";
import XLSX from "xlsx";
import { fileURLToPath } from "url";
import slugify from "slugify";

const { db } = await import("../src/lib/db");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_EMAIL = "vinicius.steigleder@gmail.com";

async function main() {
  console.log("🚀 Starting Excel rules seeding...");

  // 1. Get User
  const user = await db.query.users.findFirst({
    where: eq(users.email, USER_EMAIL),
  });

  if (!user) {
    // try finding ANY user if specific one fails, just for robustness
    const anyUser = await db.query.users.findFirst();
    if (anyUser) {
        console.warn(`⚠️ User ${USER_EMAIL} not found, using first available user: ${anyUser.email}`);
        // But let's stick to the requested one or fail if critical. 
        // Given this is a personal app likely, finding first user is a good fallback.
    } else {
        console.error(`❌ No users found!`);
        process.exit(1);
        return;
    }
    // But let's keep strict for now unless error persists.
     console.error(`❌ User ${USER_EMAIL} not found!`);
     process.exit(1);
     return;
  }
  const userId = user.id;
  console.log(`👤 Found user: ${user.name} (${userId})`);

  // 2. Read Excel
  const filePath = path.join(__dirname, "../docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx");
  const workbook = XLSX.readFile(filePath);

  // 3. Process Alias
  console.log("\n📦 Processing Aliases...");
  let aliasSheet = workbook.Sheets["Alias_desc"];
  if (!aliasSheet) {
      const name = workbook.SheetNames.find(n => n.trim().toLowerCase() === "alias_desc");
      if (name) aliasSheet = workbook.Sheets[name];
  }
  
  if (aliasSheet) {
    const aliasData = XLSX.utils.sheet_to_json(aliasSheet);
    
    for (const row of aliasData as any[]) {
        const aliasDesc = row["Alias_Desc"];
        const keywords = row["Key_words_alias"];
        const logoUrl = row["URL_icon_internet"];

        if (!aliasDesc) continue;

        const keywordsClean = keywords ? String(keywords).split(";").map((k: string) => k.trim()).filter((k: string) => k).join(";") : null;
        const aliasKey = slugify(aliasDesc, { lower: true });

        const existing = await db.query.aliasAssets.findFirst({
        where: and(
            eq(aliasAssets.userId, userId),
            eq(aliasAssets.aliasKey, aliasKey)
        )
        });

        if (existing) {
        await db.update(aliasAssets)
            .set({ 
            aliasDesc, 
            keyWordsAlias: keywordsClean, 
            logoUrl,
            updatedAt: new Date()
            })
            .where(eq(aliasAssets.id, existing.id));
        } else {
        await db.insert(aliasAssets).values({
            userId,
            aliasKey,
            aliasDesc,
            keyWordsAlias: keywordsClean,
            logoUrl
        });
        }
    }
  } else {
      console.warn("⚠️ Alias_desc sheet not found!");
  }
  console.log("✅ Aliases processed.");

  // 4. Process Categories & Rules
  console.log("\n📂 Processing Categories & Rules...");
  let catSheet = workbook.Sheets["Categorias"];
  if (!catSheet) {
      const name = workbook.SheetNames.find(n => n.trim().toLowerCase() === "categorias");
      if (name) catSheet = workbook.Sheets[name];
  }

  if (catSheet) {
    const catData = XLSX.utils.sheet_to_json(catSheet);

    for (const row of catData as any[]) {
        const appCatName = row["App classificação"];
        const l1Name = row["Nivel_1_PT"];
        const l2Name = row["Nivel_2_PT"];
        const l3Name = row["Nivel_3_PT"];
        const keywords = row["Key_words"];
        const negativeKeywords = row["Key_words_negative"];
        const type = row["Receita/Despesa"]; 
        const fixVar = row["Fixo/Variável"]; 
        const recorrenteStr = row["Recorrente"]; 

        if (!l1Name || !l2Name || !l3Name) {
            continue;
        }

        // --- Taxonomy Level 1 ---
        let l1Id: string;
        const existingL1 = await db.query.taxonomyLevel1.findFirst({
        where: and(
            eq(taxonomyLevel1.userId, userId),
            eq(taxonomyLevel1.nivel1Pt, l1Name)
        )
        });
        if (existingL1) {
        l1Id = existingL1.level1Id;
        } else {
        const [inserted] = await db.insert(taxonomyLevel1).values({
            userId,
            nivel1Pt: l1Name
        }).returning();
        l1Id = inserted.level1Id;
        }

        // --- Taxonomy Level 2 ---
        let l2Id: string;
        const existingL2 = await db.query.taxonomyLevel2.findFirst({
        where: and(
            eq(taxonomyLevel2.userId, userId),
            eq(taxonomyLevel2.level1Id, l1Id),
            eq(taxonomyLevel2.nivel2Pt, l2Name)
        )
        });
        if (existingL2) {
        l2Id = existingL2.level2Id;
        } else {
        const [inserted] = await db.insert(taxonomyLevel2).values({
            userId,
            level1Id: l1Id,
            nivel2Pt: l2Name,
            fixoVariavelDefault: fixVar,
            receitaDespesaDefault: type,
            recorrenteDefault: recorrenteStr
        }).returning();
        l2Id = inserted.level2Id;
        }

        // --- Taxonomy Leaf ---
        let leafId: string;
        const existingLeaf = await db.query.taxonomyLeaf.findFirst({
        where: and(
            eq(taxonomyLeaf.userId, userId),
            eq(taxonomyLeaf.level2Id, l2Id),
            eq(taxonomyLeaf.nivel3Pt, l3Name)
        )
        });
        if (existingLeaf) {
        leafId = existingLeaf.leafId;
        } else {
        const [inserted] = await db.insert(taxonomyLeaf).values({
            userId,
            level2Id: l2Id,
            nivel3Pt: l3Name,
            fixoVariavelDefault: fixVar,
            receitaDespesaDefault: type,
            recorrenteDefault: recorrenteStr
        }).returning();
        leafId = inserted.leafId;
        }

        // --- App Category ---
        if (appCatName) {
            let appCatId: string;
            const existingAppCat = await db.query.appCategory.findFirst({
            where: and( 
                eq(appCategory.userId, userId),
                eq(appCategory.name, appCatName)
            )
            });
            if (existingAppCat) {
            appCatId = existingAppCat.appCatId;
            } else {
            const [inserted] = await db.insert(appCategory).values({
                userId,
                name: appCatName,
                active: true
            }).returning();
            appCatId = inserted.appCatId;
            }

            const existingLink = await db.query.appCategoryLeaf.findFirst({
                where: and(
                eq(appCategoryLeaf.appCatId, appCatId),
                eq(appCategoryLeaf.leafId, leafId)
                )
            });
            if (!existingLink) {
                await db.insert(appCategoryLeaf).values({
                    userId,
                    appCatId,
                    leafId
                });
            }
        }

        // --- Rule ---
        if (keywords) {
            const kwClean = String(keywords).split(";").map((k: string) => k.trim()).filter((k: string) => k).join(";");
            const negKwClean = negativeKeywords ? String(negativeKeywords).split(";").map((k: string) => k.trim()).filter((k: string) => k).join(";") : null;
            
            const ruleKey = slugify(`${l1Name}-${l2Name}-${l3Name}`, { lower: true });
            const ruleName = `${l3Name} Rule`;

            let cat1 = row["App classificação"];
            if (cat1 === "Mercados") cat1 = "Mercado";
            const validCats = [
                "Receitas", "Moradia", "Mercado", "Compras Online",
                "Transporte", "Saúde", "Lazer", "Viagem", "Roupas",
                "Tecnologia", "Alimentação", "Energia", "Internet",
                "Educação", "Presentes", "Streaming", "Academia",
                "Investimentos", "Outros", "Interno", "Assinaturas", "Compras",
                "Doações", "Esportes", "Finanças", "Férias", "Mobilidade",
                "Pets", "Telefone", "Trabalho", "Transferências", "Vendas"
            ];
            
            if (!validCats.includes(cat1)) {
                if (validCats.includes(cat1.slice(0, -1))) cat1 = cat1.slice(0, -1);
                else cat1 = "Outros";
            }

            // Ensure Type respects Enum
            const safeType = (type === "Receita" || type === "Despesa") ? type : "Despesa";
            const safeFixVar = (fixVar === "Fixo" || fixVar === "Variável") ? fixVar : "Variável";

            const ruleValues = {
                userId,
                name: ruleName,
                ruleKey: ruleKey,
                keywords: kwClean,
                keyWords: kwClean,
                keyWordsNegative: negKwClean,
                type: safeType,
                fixVar: safeFixVar,
                category1: cat1 as any,
                category2: l2Name,
                category3: l3Name,
                leafId: leafId,
                priority: 500,
                active: true,
                strict: false,
                isSystem: true
            };

            const existingRule = await db.query.rules.findFirst({
                where: and(
                    eq(rules.userId, userId),
                    eq(rules.ruleKey, ruleKey)
                )
            });

            if (existingRule) {
                await db.update(rules).set(ruleValues).where(eq(rules.id, existingRule.id));
            } else {
                await db.insert(rules).values(ruleValues);
            }
        }
    }
  } else {
      console.warn("⚠️ Categorias sheet not found!");
  }

  console.log("✅ Categories & Rules processed.");
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
