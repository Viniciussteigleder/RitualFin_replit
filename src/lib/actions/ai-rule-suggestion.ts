"use server";

import { auth } from "@/auth";
import { ensureOpenCategory } from "@/lib/actions/setup-open";
import { buildLeafHierarchyMaps } from "@/lib/taxonomy/hierarchy";
import { getAIRuleSuggestion } from "@/lib/ai/openai";
import { normalizeForMatch } from "@/lib/rules/classification-utils";

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function suggestRuleForOpenCandidate(description: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const ensured = await ensureOpenCategory();
  if (!ensured.openLeafId) return { success: false as const, error: "OPEN taxonomy not initialized" };

  const { byLeafId } = await buildLeafHierarchyMaps(session.user.id);
  const taxonomyContext = JSON.stringify(
    Array.from(byLeafId.values()).map((l) => ({
      leaf_id: l.leafId,
      app_category: l.appCategoryName ?? "OPEN",
      category_1: l.category1,
      category_2: l.category2,
      category_3: l.category3,
    }))
  );

  const suggestion = await getAIRuleSuggestion(description, taxonomyContext);
  if (!suggestion) return { success: false as const, error: "AI suggestion unavailable" };

  let resolvedLeafId: string | null = null;
  if (looksLikeUuid(suggestion.suggested_leaf_id)) {
    resolvedLeafId = suggestion.suggested_leaf_id;
  } else {
    const target = normalizeForMatch(suggestion.suggested_leaf_id);
    const candidates = Array.from(byLeafId.values()).filter((l) => normalizeForMatch(l.category3) === target);
    resolvedLeafId = candidates.length === 1 ? candidates[0]!.leafId : null;
  }

  if (!resolvedLeafId || !byLeafId.has(resolvedLeafId)) {
    return { success: false as const, error: "AI returned an unknown taxonomy leaf" };
  }

  return {
    success: true as const,
    suggestion: {
      leafId: resolvedLeafId,
      confidence: suggestion.confidence,
      rationale: suggestion.rationale,
      keyWords: suggestion.proposed_key_words,
      keyWordsNegative: suggestion.proposed_key_words_negative,
    },
  };
}

