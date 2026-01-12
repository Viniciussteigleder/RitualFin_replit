"use server";

import { db } from "@/lib/db";
import { transactions, rules, appCategory } from "@/lib/db/schema";
import { eq, ilike } from "drizzle-orm";

export async function diagnoseRuleMatch() {
  const logs: string[] = [];
  const log = (msg: string) => {
      console.log(msg);
      logs.push(msg);
  };

  log("🔍 Diagnosing Rule Match for Hommer Fitness...\n");

  // 1. Fetch the transaction
  const tx = await db.query.transactions.findFirst({
    where: (t, { like, or }) => or(like(t.id, "ccbd801b%"), like(t.descRaw, "%Hommer Fitness%"))
  });

  if (!tx) {
    log("❌ Transaction not found!");
  } else {
    log("📄 Transaction found:");
    log(`  ID: ${tx.id}`);
    log(`  Desc Raw: ${tx.descRaw}`);
    log(`  Desc Norm: ${tx.descNorm}`);
    log(`  Amount: ${tx.amount}`);
    log(`  Leaf ID: ${tx.leafId}`);
    log(`  Current C1: ${tx.category1}`);
  }

  // 2. Fetch the rule
  const rule = await db.query.rules.findFirst({
    where: (r, { like }) => like(r.id, "440f9939%")
  });

  if (!rule) {
    log("\n❌ Rule 440f9939 not found!");
    // Search for any rule with "Fitness" or "Hommer"
    const fallbackRules = await db.query.rules.findMany({
        where: (r, { ilike }) => ilike(r.keyWords, "%Fitness%"),
        limit: 3
    });
    log(`  Found ${fallbackRules.length} other potential rules for 'Fitness':`);
    fallbackRules.forEach(r => log(`  - ID: ${r.id}, Keywords: ${r.keyWords}`));

  } else {
    log("\n📏 Rule 440f9939 found:");
    log(`  ID: ${rule.id}`);
    log(`  Keywords: ${rule.keyWords}`);
    log(`  Negatives: ${rule.keyWordsNegative}`);
    log(`  Priority: ${rule.priority}`);
  }

  // 3. Match Simulation
  if (tx && rule && rule.keyWords) { 
      const descNorm = tx.descNorm.toUpperCase();
      const keywords = rule.keyWords.toUpperCase().split(";");
      const matched = keywords.find(k => descNorm.includes(k.trim()));
      
      log("\n🧠 Match Simulation:");
      log(`  Transaction Norm: "${descNorm}"`);
      if (matched) {
          log(`  ✅ MATCH! Keyword "${matched}" found in description.`);
      } else {
          log(`  ❌ NO MATCH. Checked keywords: ${keywords.join(", ")}`);
      }
      
      if (rule.keyWordsNegative && matched) {
          const negs = rule.keyWordsNegative.toUpperCase().split(";");
          const negMatch = negs.find(n => descNorm.includes(n.trim()));
          if (negMatch) {
              log(`  ⛔ NEGATIVE MATCH! Blocked by "${negMatch}"`);
          }
      }
  }

  return { logs };
}
