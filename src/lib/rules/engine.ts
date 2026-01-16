// Rules Engine for AI-powered transaction categorization with confidence levels

import type { Rule, Transaction, AliasAssets } from "@/lib/db/schema";
import { evaluateRuleMatch, normalizeForMatch } from "./classification-utils";

export interface RuleMatch {
  ruleId: string;
  type: "Despesa" | "Receita";
  fixVar: "Fixo" | "Variável";
  category1: string;
  category2?: string;
  category3?: string;
  priority: number;
  strict: boolean;
  isSystem: boolean;
  matchedKeyword?: string;
  leafId?: string | null;  // Added leafId to match logic
}

export interface CategorizationResult {
  needsReview: boolean;
  matches: RuleMatch[];
  appliedRule?: RuleMatch;
  confidence: number;
  reason?: string;
}

export interface UserSettings {
  autoConfirmHighConfidence?: boolean;
  confidenceThreshold?: number;
}

export function matchRules(descNorm: string, rules: Rule[], settings: UserSettings = {}): CategorizationResult {
  const {
    autoConfirmHighConfidence = false,
    confidenceThreshold = 80
  } = settings;

  const haystack = normalizeForMatch(descNorm);
  const matches: RuleMatch[] = [];

  const sortedRules = [...rules].sort((a, b) => (b.priority || 500) - (a.priority || 500));

  for (const rule of sortedRules) {
    if (rule.active === false) continue;
    if (!rule.keyWords) continue; // Skip rules without key_words (legacy keywords removed)

    const evalResult = evaluateRuleMatch(haystack, rule);
    if (evalResult.isMatch && evalResult.positiveMatch) {
      const match: RuleMatch = {
        ruleId: rule.id,
        type: rule.type || "Despesa",
        fixVar: rule.fixVar || "Variável",
        category1: rule.category1 || "Outros",
        category2: rule.category2 || undefined,
        category3: rule.category3 || undefined,
        priority: rule.priority || 500,
        strict: rule.strict || false,
        isSystem: rule.isSystem || false,
        matchedKeyword: evalResult.positiveMatch,
        leafId: rule.leafId ?? null,
      };

      matches.push(match);
    }
  }

  if (matches.length === 0) {
    return {
      needsReview: true,
      matches: [],
      confidence: 0,
      reason: "Nenhuma regra encontrada"
    };
  }

  const keyFor = (m: RuleMatch) =>
    m.leafId ? `leaf:${m.leafId}` : `cats:${m.category1}|${m.category2 || ""}|${m.category3 || ""}`;

  const uniqueKeys = new Set(matches.map(keyFor));

  // STRICT LOGIC: if we match multiple different category targets, do not auto-pick.
  if (uniqueKeys.size > 1) {
    return {
      needsReview: true,
      matches,
      confidence: 0,
      reason: `Conflito: ${uniqueKeys.size} classificações possíveis`,
    };
  }

  const applied = matches.find((m) => m.strict) ?? matches[0];
  const confidence = calculateConfidence(applied);

  if (applied.strict) {
    return {
      needsReview: false,
      matches,
      appliedRule: applied,
      confidence,
      reason: "Regra estrita aplicada automaticamente",
    };
  }

  const meetsThreshold = confidence >= confidenceThreshold;
  const autoApply = autoConfirmHighConfidence && meetsThreshold;

  return {
    needsReview: !autoApply,
    matches,
    appliedRule: applied,
    confidence,
    reason: autoApply
      ? `Alta confianca (${confidence}%) - aplicado automaticamente`
      : meetsThreshold
        ? `Alta confianca (${confidence}%) - revisar (auto-confirm desativado)`
        : `Confianca media (${confidence}%) - revisar`,
  };
}

function calculateConfidence(match: RuleMatch): number {
  let confidence = 70;
  
  if (match.isSystem) confidence += 10;
  if (match.priority >= 800) confidence += 15;
  else if (match.priority >= 600) confidence += 10;
  else if (match.priority >= 500) confidence += 5;
  
  if (match.strict) confidence = 100;
  
  return Math.min(confidence, 100);
}

export function categorizeTransaction(
  descNorm: string,
  rules: Rule[],
  settings: UserSettings = {}
): Partial<Transaction> & { confidence?: number; matches?: RuleMatch[] } {
  const result = matchRules(descNorm, rules, settings);
  
  if (result.appliedRule) {
    const rule = result.appliedRule;
    const isInterno = rule.category1 === "Interno";
    
    return {
      type: rule.type,
      fixVar: rule.fixVar,
      category1: rule.category1 as any,
      category2: rule.category2,
      category3: rule.category3,
      needsReview: result.needsReview,
      ruleIdApplied: rule.ruleId,
      leafId: rule.leafId, // Added leafId
      matchedKeyword: rule.matchedKeyword,
      internalTransfer: isInterno,
      excludeFromBudget: isInterno,
      confidence: result.confidence,
      matches: result.matches // Return all candidates
    };
  }

  return {
    needsReview: true,
    confidence: 0,
    matches: result.matches
  };
}

export function suggestKeyword(descNorm: string): string {
  const parts = descNorm.split("--");
  if (parts.length > 0) {
    const mainPart = parts[0].trim();
    const words = mainPart.split(" ").slice(0, 3).join(" ");
    return words;
  }
  return descNorm.slice(0, 30);
}

export interface KeyDescMatchResult {
  ruleId?: string;
  leafId?: string;
  matchedExpression?: string;
}

export function classifyByKeyDesc(keyDesc: string, rules: Rule[]): KeyDescMatchResult {
  for (const rule of rules.filter(r => r.active !== false && r.keyWords)) {
    const result = evaluateRuleMatch(keyDesc, rule);
    if (result.isMatch) {
      return {
        ruleId: rule.id,
        leafId: rule.leafId || undefined,
        matchedExpression: result.positiveMatch || undefined
      };
    }
  }

  return {};
}

export function matchAlias(descNorm: string, aliases: AliasAssets[]): AliasAssets | undefined {
  const haystack = normalizeForMatch(descNorm);
  
  for (const alias of aliases) {
    if (!alias.keyWordsAlias) continue;
    
    // Split keywords
    const keywords = alias.keyWordsAlias.split(";").map(k => normalizeForMatch(k)).filter(k => k.length > 0);
    
    // Check match
    if (keywords.some(k => haystack.includes(k))) {
        return alias;
    }
  }
  return undefined;
}

export const AI_SEED_RULES = [
  {
    name: "Interno",
    keyWords: "AMEX - ZAHLUNG;ZAHLUNG ERHALTEN;PAGAMENTO AMEX;PAGAMENTO M&M;AMERICAN EXPRESS ZAHLUNG;DEUTSCHE KREDITBANK;CREDIT CARD PAYMENT RECEIVED",
    type: "Despesa" as const,
    fixVar: "Fixo" as const,
    category1: "Interno" as const,
    category2: "Transferencias",
    category3: "Transferencias",
    priority: 1000,
    strict: true,
    isSystem: true
  },
  {
    name: "Mercados",
    keyWords: "REWE;EDEKA;ALDI;LIDL;NETTO;NORMA;DM;DM-DROGERIE;ROSSMANN;MUELLER;MÜLLER;ASIA MARKT;BACKSTUBE;BAECKEREI;IHLE;WUENSCHE;FRUCHTWERK",
    type: "Despesa" as const,
    fixVar: "Variável" as const,
    category1: "Mercados" as const,
    category2: "Alimentação",
    category3: "Supermercado",
    priority: 900,
    strict: true,
    isSystem: true
  }
  // ... more seeds can be added later if needed
];
