"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rules, transactions } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { getAIConflictResolution } from "@/lib/ai/openai";

export async function suggestConflictResolution(transactionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const tx = await db.query.transactions.findFirst({
    where: and(eq(transactions.userId, session.user.id), eq(transactions.id, transactionId)),
    columns: {
      id: true,
      descNorm: true,
      descRaw: true,
      keyDesc: true,
      conflictFlag: true,
      classificationCandidates: true,
    },
  });
  if (!tx) return { success: false as const, error: "Transaction not found" };
  if (!tx.conflictFlag) return { success: false as const, error: "Transaction is not marked as conflict" };

  const candidates = Array.isArray(tx.classificationCandidates) ? (tx.classificationCandidates as any[]) : [];
  const ruleIds = Array.from(new Set(candidates.map((c) => String(c?.ruleId || "")).filter(Boolean)));
  if (!ruleIds.length) return { success: false as const, error: "No candidate rules found" };

  const ruleRows = await db
    .select({
      id: rules.id,
      keyWords: rules.keyWords,
      keyWordsNegative: rules.keyWordsNegative,
      leafId: rules.leafId,
      category1: rules.category1,
      category2: rules.category2,
      category3: rules.category3,
      strict: rules.strict,
      priority: rules.priority,
    })
    .from(rules)
    .where(and(eq(rules.userId, session.user.id), inArray(rules.id, ruleIds)));

  const rulesById = new Map(ruleRows.map((r) => [r.id, r]));

  const candidatesContext = JSON.stringify(
    candidates.map((c) => {
      const rule = rulesById.get(String(c.ruleId));
      return {
        rule_id: String(c.ruleId),
        leaf_id: String(c.leafId),
        matched_keyword: c.matchedKeyword ?? null,
        app_category: c.appCategoryName ?? null,
        category_1: c.category1,
        category_2: c.category2,
        category_3: c.category3,
        rule_key_words: rule?.keyWords ?? null,
        rule_key_words_negative: rule?.keyWordsNegative ?? null,
        strict: Boolean(c.strict ?? rule?.strict ?? false),
        priority: Number(c.priority ?? rule?.priority ?? 0),
      };
    })
  );

  const description = tx.keyDesc || tx.descNorm || tx.descRaw;
  const suggestion = await getAIConflictResolution({
    transaction_description: description,
    candidates_context: candidatesContext,
  });

  if (!suggestion) return { success: false as const, error: "AI suggestion unavailable" };

  // Basic safety: only keep suggestions for known rule ids.
  const filtered = suggestion.suggestions.filter((s) => rulesById.has(String(s.rule_id)));

  return {
    success: true as const,
    suggestion: {
      rationale: suggestion.rationale,
      suggestions: filtered,
    },
  };
}
