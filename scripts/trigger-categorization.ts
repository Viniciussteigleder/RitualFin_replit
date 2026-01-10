
import dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });
dotenv.config({ path: ".env.local" });
dotenv.config();

// Dynamic import for db
const { db } = await import("../src/lib/db");
import { transactions, rules, aliasAssets } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { categorizeTransaction, matchAlias } from "../src/lib/rules/engine";

const USER_EMAIL = "vinicius.steigleder@gmail.com";

async function main() {
  console.log("🚀 Triggering Categorization & Alias Application...");
  
  const user = await db.query.users.findFirst({
    where: eq(users.email, USER_EMAIL), // users table import needed
  });

  if (!user) {
     console.error("User not found");
     process.exit(1);
  }

  const userId = user.id;

  // Get all active rules
  const userRules = await db.query.rules.findMany({
    where: eq(rules.userId, userId),
  });
  console.log(`Found ${userRules.length} rules.`);

  // Get all aliases
  const userAliases = await db.query.aliasAssets.findMany({
    where: eq(aliasAssets.userId, userId),
  });
  console.log(`Found ${userAliases.length} aliases.`);

  // Get transactions
  const allTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
  });
  console.log(`Found ${allTransactions.length} transactions.`);

  let categorized = 0;
  let aliased = 0;
  let needsReview = 0;

  for (const tx of allTransactions) {
      const result = categorizeTransaction(tx.descNorm, userRules);
      const aliasMatch = matchAlias(tx.descNorm, userAliases);

      if (result.category1 || aliasMatch) {
        await db.update(transactions)
          .set({
            category1: result.category1 || tx.category1,
            ...(result.category1 ? {
                category2: result.category2 || null,
                category3: result.category3 || null,
                type: result.type,
                fixVar: result.fixVar,
                ruleIdApplied: result.ruleIdApplied || null,
                confidence: result.confidence || 0,
                needsReview: result.needsReview !== undefined ? result.needsReview : true,
                classifiedBy: result.ruleIdApplied ? 'AUTO_KEYWORDS' : 'MANUAL',
            } : {}),
            aliasDesc: aliasMatch ? aliasMatch.aliasDesc : tx.aliasDesc, 
          })
          .where(eq(transactions.id, tx.id));

        if (result.ruleIdApplied) {
          categorized++;
        }
        if (aliasMatch) {
            aliased++;
        }
        if (result.needsReview) {
          needsReview++;
        }
      }
  }

  console.log(`\n✅ Summary:`);
  console.log(`Categorized: ${categorized}`);
  console.log(`Aliased: ${aliased}`);
  console.log(`Needs Review: ${needsReview}`);
  
  process.exit(0);
}

// Need users import
import { users } from "../src/lib/db/schema";

main().catch(console.error);
