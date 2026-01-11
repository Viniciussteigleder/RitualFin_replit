import type { Rule, AliasAssets } from "@/lib/db/schema";

export function normalizeForMatch(text: string): string {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitKeyExpressions(input?: string | null): string[] {
  if (!input) return [];
  return input
    .split(";")
    .map((expr) => expr.trim())
    .filter((expr) => expr.length > 0);
}

export function findMatchedExpression(haystack: string, expressions: string[]): string | null {
  for (const expr of expressions) {
    if (haystack.includes(expr)) {
      return expr;
    }
  }
  return null;
}

export function evaluateRuleMatch(keyDesc: string, rule: Rule) {
  const haystack = normalizeForMatch(keyDesc);
  const positives = splitKeyExpressions(rule.keyWords || "");
  const negatives = splitKeyExpressions(rule.keyWordsNegative);

  const normalizedPositives = positives.map(normalizeForMatch);
  const normalizedNegatives = negatives.map(normalizeForMatch);

  const positiveMatch = findMatchedExpression(haystack, normalizedPositives);
  const negativeMatch = findMatchedExpression(haystack, normalizedNegatives);

  return {
    positiveMatch,
    negativeMatch,
    isMatch: Boolean(positiveMatch) && !negativeMatch
  };
}

export function evaluateAliasMatch(keyDesc: string, alias: AliasAssets) {
  const haystack = normalizeForMatch(keyDesc);
  const expressions = splitKeyExpressions(alias.keyWordsAlias || "");
  const normalized = expressions.map(normalizeForMatch);
  const matched = findMatchedExpression(haystack, normalized);
  return {
    matched,
    isMatch: Boolean(matched)
  };
}
