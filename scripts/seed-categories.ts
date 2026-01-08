import XLSX from "xlsx";
import * as path from "path";
import { fileURLToPath } from "url";
import { db } from "../src/lib/db";
import { rules, transactions } from "../src/lib/db/schema";
import { eq, or, and, like, sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CategoryRow {
  "App classificação": string;
  "Nivel_1_PT": string;
  "Nivel_2_PT": string;
  "Nivel_3_PT": string;
  "Key_words": string | null;
  "Key_words_negative": string | null;
  "Receita/Despesa": "Receita" | "Despesa";
  "Fixo/Variável": "Fixo" | "Variável";
  "Recorrente": string;
}

async function seedCategories() {
  const filePath = path.join(__dirname, "../docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx");
  
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets["Categorias"];
  const data = XLSX.utils.sheet_to_json<CategoryRow>(worksheet);

  console.log(`📥 Processing ${data.length} category rules...`);

  // Get the first user (for system rules)
  const user = await db.query.users.findFirst();
  
  if (!user) {
    console.error("❌ No user found. Please seed transactions first.");
    return;
  }

  let inserted = 0;
  let skipped = 0;

  for (const row of data) {
    try {
      // Skip rows without keywords
      if (!row.Key_words && !row.Key_words_negative) {
        skipped++;
        continue;
      }

      // Create a unique name for the rule
      const ruleName = `${row.Nivel_1_PT} > ${row.Nivel_2_PT} > ${row.Nivel_3_PT}`.trim();

      // Check if rule already exists
      const existingRule = await db.query.rules.findFirst({
        where: and(
          eq(rules.userId, user.id),
          eq(rules.name, ruleName)
        ),
      });

      if (existingRule) {
        skipped++;
        continue;
      }

      // Insert the rule
      await db.insert(rules).values({
        userId: user.id,
        name: ruleName,
        keyWords: row.Key_words || "",
        keyWordsNegative: row.Key_words_negative || "",
        type: row["Receita/Despesa"] === "Receita" ? "Receita" : "Despesa",
        fixVar: row["Fixo/Variável"] === "Fixo" ? "Fixo" : "Variável",
        category1: row.Nivel_1_PT as any, // Using any to bypass enum validation
        category2: row.Nivel_2_PT,
        category3: row.Nivel_3_PT,
        priority: 500,
        strict: false,
        isSystem: false,
        active: true,
      });

      inserted++;
    } catch (error) {
      console.error(`Error processing rule "${row.Nivel_1_PT}":`, error);
    }
  }

  console.log(`✅ Categories: Inserted ${inserted}, Skipped ${skipped}`);
}

async function classifyTransactions() {
  console.log("\n🔍 Classifying transactions...");

  // Get all rules
  const allRules = await db.query.rules.findMany({
    where: eq(rules.active, true),
    orderBy: (rules, { desc }) => [desc(rules.priority)],
  });

  console.log(`Found ${allRules.length} active rules`);

  // Get all unclassified transactions
  const allTransactions = await db.query.transactions.findMany({
    where: or(
      eq(transactions.category1, null as any),
      eq(transactions.category2, null as any),
    ),
  });

  console.log(`Found ${allTransactions.length} unclassified transactions`);

  let classified = 0;
  let unmatched = 0;

  for (const transaction of allTransactions) {
    let matched = false;

    for (const rule of allRules) {
      if (!rule.keyWords) continue;

      // Split keywords by semicolon
      const keywords = rule.keyWords.split(";").map(k => k.trim()).filter(k => k);
      const negativeKeywords = rule.keyWordsNegative 
        ? rule.keyWordsNegative.split(";").map(k => k.trim()).filter(k => k)
        : [];

      // Check if description matches any keyword 
      const description = (transaction.descNorm || transaction.descRaw || "").toLowerCase();
      
      const hasMatch = keywords.some(keyword => 
        description.includes(keyword.toLowerCase())
      );

      const hasNegativeMatch = negativeKeywords.length > 0 && negativeKeywords.some(keyword =>
        description.includes(keyword.toLowerCase())
      );

      if (hasMatch && !hasNegativeMatch) {
        // Apply the rule
        await db.update(transactions)
          .set({
            category1: rule.category1,
            category2: rule.category2,
            category3: rule.category3,
            type: rule.type,
            fixVar: rule.fixVar,
          })
          .where(eq(transactions.id, transaction.id));

        classified++;
        matched = true;
        break; // Stop at first match
      }
    }

    if (!matched) {
      unmatched++;
    }
  }

  console.log(`✅ Classified: ${classified}, Unmatched: ${unmatched}`);
}

async function main() {
  console.log("🚀 Starting category and classification...\n");
  
  try {
    await seedCategories();
    await classifyTransactions();
    
    console.log("\n✨ Complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
}

main();
