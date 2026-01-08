import { db } from "../src/lib/db";
import { rules, transactions } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function reclassifyAll() {
  console.log("🔍 Re-classifying ALL transactions with new rules...\n");

  // Get all active rules, ordered by priority
  const allRules = await db.query.rules.findMany({
    where: eq(rules.active, true),
    orderBy: (rules, { desc }) => [desc(rules.priority)],
  });

  console.log(`📋 Found ${allRules.length} active classification rules`);

  // Get ALL transactions (not just unclassified)
  const allTransactions = await db.query.transactions.findMany();

  console.log(`📊 Found ${allTransactions.length} total transactions to classify\n`);

  let classified = 0;
  let unmatched = 0;

  for (const transaction of allTransactions) {
    let matched = false;

    for (const rule of allRules) {
      if (!rule.keyWords) continue;

      // Split keywords by semicolon and clean them
      const keywords = rule.keyWords.split(";").map(k => k.trim()).filter(k => k);
      const negativeKeywords = rule.keyWordsNegative 
        ? rule.keyWordsNegative.split(";").map(k => k.trim()).filter(k => k)
        : [];

      // Get the description (prefer normalized, fallback to raw)
      const description = (transaction.descNorm || transaction.descRaw || "").toLowerCase();
      
      // Check if description matches any keyword (case-insensitive)
      const hasMatch = keywords.some(keyword => 
        description.includes(keyword.toLowerCase())
      );

      // Check for negative matches (exclusions)
      const hasNegativeMatch = negativeKeywords.length > 0 && negativeKeywords.some(keyword =>
        description.includes(keyword.toLowerCase())
      );

      if (hasMatch && !hasNegativeMatch) {
        // Apply the classification from this rule
        await db.update(transactions)
          .set({
            category1: rule.category1,
            category2: rule.category2,
            category3: rule.category3,
            type: rule.type,
            fixVar: rule.fixVar,
            classifiedBy: "AUTO_KEYWORDS",
          })
          .where(eq(transactions.id, transaction.id));

        console.log(`✅ Matched: "${transaction.descNorm}" → ${rule.category1} > ${rule.category2}`);
        
        classified++;
        matched = true;
        break; // Stop at first rule match (highest priority)
      }
    }

    if (!matched) {
      unmatched++;
      // Optionally log unmatched for debugging
      if (unmatched <= 10) { // Only show first 10
        console.log(`⚠️  Unmatched: "${transaction.descNorm}"`);
      }
    }
  }

  console.log(`\n📈 Results:`);
  console.log(`   ✅ Classified: ${classified}`);
  console.log(`   ⚠️  Unmatched: ${unmatched}`);
  console.log(`   📊 Success Rate: ${((classified / allTransactions.length) * 100).toFixed(1)}%`);
}

async function main() {
  console.log("🚀 Starting transaction re-classification...\n");
  
  try {
    await reclassifyAll();
    
    console.log("\n✨ Classification complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  }
}

main();
