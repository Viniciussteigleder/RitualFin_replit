// Rules Engine for transaction categorization

import type { Rule, Transaction } from "@shared/schema";

export interface RuleMatch {
  ruleId: string;
  type: "Despesa" | "Receita";
  fixVar: "Fixo" | "Variável";
  category1: string;
  category2?: string;
}

export interface CategorizationResult {
  needsReview: boolean;
  matches: RuleMatch[];
  appliedRule?: RuleMatch;
  reason?: string;
}

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchRules(descNorm: string, rules: Rule[]): CategorizationResult {
  const normalizedDesc = normalizeForMatch(descNorm);
  const matches: RuleMatch[] = [];

  for (const rule of rules) {
    const keywords = rule.keywords.split(";").map(k => normalizeForMatch(k)).filter(k => k);
    
    const hasMatch = keywords.some(keyword => normalizedDesc.includes(keyword));
    
    if (hasMatch) {
      matches.push({
        ruleId: rule.id,
        type: rule.type,
        fixVar: rule.fixVar,
        category1: rule.category1,
        category2: rule.category2 || undefined
      });
    }
  }

  if (matches.length === 0) {
    return {
      needsReview: true,
      matches: [],
      reason: "Nenhuma regra encontrada"
    };
  }

  if (matches.length > 1) {
    return {
      needsReview: true,
      matches,
      reason: `Conflito: ${matches.length} regras encontradas`
    };
  }

  // Single match - apply it
  return {
    needsReview: false,
    matches,
    appliedRule: matches[0]
  };
}

export function categorizeTransaction(
  descNorm: string, 
  rules: Rule[]
): Partial<Transaction> {
  const result = matchRules(descNorm, rules);
  
  if (result.appliedRule) {
    const rule = result.appliedRule;
    return {
      type: rule.type,
      fixVar: rule.fixVar,
      category1: rule.category1 as any,
      category2: rule.category2,
      needsReview: false,
      ruleIdApplied: rule.ruleId,
      internalTransfer: rule.category1 === "Interno",
      excludeFromBudget: rule.category1 === "Interno"
    };
  }

  return {
    needsReview: true
  };
}

export function suggestKeyword(descNorm: string): string {
  // Extract main merchant name (first part before --)
  const parts = descNorm.split("--");
  if (parts.length > 0) {
    const mainPart = parts[0].trim();
    // Take first 2-3 words as keyword suggestion
    const words = mainPart.split(" ").slice(0, 3).join(" ");
    return words;
  }
  return descNorm.slice(0, 30);
}
