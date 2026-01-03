// Rules Engine for AI-powered transaction categorization with confidence levels

import type { Rule, Transaction } from "@shared/schema";
import { evaluateRuleMatch } from "./classification-utils";

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
}

export interface CategorizationResult {
  needsReview: boolean;
  matches: RuleMatch[];
  appliedRule?: RuleMatch;
  confidence: number;
  reason?: string;
}

function normalizeForMatch(text: string): string {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
    // CRITICAL: Keywords are split ONLY on semicolon (;) separator
    // Each expression between semicolons is preserved as a whole unit
    // Example: "LIDL;SV Fuerstenfeldbrucker Wasserratten e.V.;REWE"
    // Results in 3 expressions: ["LIDL", "SV Fuerstenfeldbrucker Wasserratten e.V.", "REWE"]
    // Spaces within expressions are PRESERVED and normalized together
    const keywords = rule.keywords
      .split(";")
      .map(k => normalizeForMatch(k))
      .filter(k => k.length > 0);

    const matchedKeyword = keywords.find(keyword => haystack.includes(keyword));
    
    if (matchedKeyword) {
      const match: RuleMatch = {
        ruleId: rule.id,
        type: rule.type,
        fixVar: rule.fixVar,
        category1: rule.category1,
        category2: rule.category2 || undefined,
        category3: rule.category3 || undefined,
        priority: rule.priority || 500,
        strict: rule.strict || false,
        isSystem: rule.isSystem || false,
        matchedKeyword
      };

      if (rule.strict) {
        return {
          needsReview: false,
          matches: [match],
          appliedRule: match,
          confidence: 100,
          reason: "Regra estrita aplicada automaticamente"
        };
      }

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

  if (matches.length === 1) {
    const match = matches[0];
    const confidence = calculateConfidence(match);
    const meetsThreshold = confidence >= confidenceThreshold;
    const autoApply = autoConfirmHighConfidence && meetsThreshold;

    return {
      needsReview: !autoApply,
      matches,
      appliedRule: match,
      confidence,
      reason: autoApply
        ? `Alta confianca (${confidence}%) - aplicado automaticamente`
        : meetsThreshold
          ? `Alta confianca (${confidence}%) - revisar (auto-confirm desativado)`
          : `Confianca media (${confidence}%) - revisar`
    };
  }

  const topMatches = matches.filter(m => m.priority === matches[0].priority);

  if (topMatches.length === 1) {
    const match = topMatches[0];
    const confidence = Math.min(calculateConfidence(match) - 10, 85);
    const meetsThreshold = confidence >= confidenceThreshold;
    const autoApply = autoConfirmHighConfidence && meetsThreshold;

    return {
      needsReview: !autoApply,
      matches,
      appliedRule: match,
      confidence,
      reason: autoApply
        ? `Multiplas regras mas prioridade clara (${confidence}%)`
        : meetsThreshold
          ? `Alta confianca (${confidence}%) - revisar (auto-confirm desativado)`
          : `Multiplas regras (${confidence}%) - revisar`
    };
  }

  return {
    needsReview: true,
    matches,
    appliedRule: matches[0],
    confidence: 50,
    reason: `Conflito: ${matches.length} regras com mesma prioridade`
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
): Partial<Transaction> & { confidence?: number } {
  const result = matchRules(descNorm, rules, settings);
  
  if (result.appliedRule && !result.needsReview) {
    const rule = result.appliedRule;
    const isInterno = rule.category1 === "Interno";
    
    return {
      type: rule.type,
      fixVar: rule.fixVar,
      category1: rule.category1 as any,
      category2: rule.category2,
      category3: rule.category3,
      needsReview: false,
      ruleIdApplied: rule.ruleId,
      internalTransfer: isInterno,
      excludeFromBudget: isInterno,
      confidence: result.confidence
    };
  }

  if (result.appliedRule && result.needsReview) {
    const rule = result.appliedRule;
    const isInterno = rule.category1 === "Interno";

    return {
      type: rule.type,
      fixVar: rule.fixVar,
      category1: rule.category1 as any,
      category2: rule.category2,
      category3: rule.category3,
      needsReview: true,
      ruleIdApplied: rule.ruleId,
      internalTransfer: isInterno,
      excludeFromBudget: isInterno,
      confidence: result.confidence
    };
  }

  return {
    needsReview: true,
    confidence: 0
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

export const AI_SEED_RULES = [
  {
    name: "Interno",
    keywords: "AMEX - ZAHLUNG;ZAHLUNG ERHALTEN;PAGAMENTO AMEX;PAGAMENTO M&M;AMERICAN EXPRESS ZAHLUNG;DEUTSCHE KREDITBANK;LASTSCHRIFT",
    type: "Despesa" as const,
    fixVar: "Fixo" as const,
    category1: "Interno" as const,
    category2: "Transferencias",
    priority: 1000,
    strict: true,
    isSystem: true
  },
  {
    name: "Mercado",
    keywords: "REWE;EDEKA;ALDI;LIDL;NETTO;NORMA;DM;DM-DROGERIE;ROSSMANN;MUELLER;MÜLLER;ASIA MARKT;BACKSTUBE;BAECKEREI;IHLE;WUENSCHE;FRUCHTWERK",
    type: "Despesa" as const,
    fixVar: "Variável" as const,
    category1: "Mercado" as const,
    category2: "Supermercado",
    priority: 900,
    strict: true,
    isSystem: true
  },
  {
    name: "Receitas",
    keywords: "ENTGELT;SALARIO;BONUS;KINDERGELD;ARBEIT;BUNDESAGENTUR;FINANZAMT;STEUER;REEMBOLSO",
    type: "Receita" as const,
    fixVar: "Fixo" as const,
    category1: "Receitas" as const,
    category2: "Salario",
    priority: 800,
    strict: false,
    isSystem: true
  },
  {
    name: "Moradia",
    keywords: "DARLEHEN;FINANCIAMENTO;GRUNDSTEUER;FERNWARME;STROM;LICHTBLICK;VATTENFALL;WASSER;MONATSMIETE;RUNDFUNK ARD;BAYERISCHER RUNDFUNK",
    type: "Despesa" as const,
    fixVar: "Fixo" as const,
    category1: "Moradia" as const,
    category2: "Casa",
    priority: 700,
    strict: false,
    isSystem: true
  },
  {
    name: "Compras Online",
    keywords: "AMAZON;AMZN;AMZ*;TEMU;ZALANDO;ABOUT YOU;HM.COM;DECATHLON;MEDIAMARKT;SATURN;KLEINANZEIGEN;JYSK;HOLLISTER",
    type: "Despesa" as const,
    fixVar: "Variável" as const,
    category1: "Compras Online" as const,
    category2: "E-commerce",
    priority: 650,
    strict: false,
    isSystem: true
  },
  {
    name: "Saude",
    keywords: "APOTHEKE;ZAHNARZT;PRAXIS;ARZT;HAUTARZT;LABOR;APOLLO OPTIK;BOTOX;COLAGENO",
    type: "Despesa" as const,
    fixVar: "Variável" as const,
    category1: "Saúde" as const,
    category2: "Medico",
    priority: 620,
    strict: false,
    isSystem: true
  },
  {
    name: "Transporte",
    keywords: "TANKSTELLE;ALLGUTH;KFZ-STEUER;KFZ-VERSICHERUNG;PARKHAUS;HANDYPARKEN;MVV;TICKETSHOP;LOGPAY;VOI;UBER;99APP;LIME;TFL TRAVEL",
    type: "Despesa" as const,
    fixVar: "Variável" as const,
    category1: "Transporte" as const,
    category2: "Taxi/Apps",
    priority: 600,
    strict: false,
    isSystem: true
  },
  {
    name: "Lazer",
    keywords: "RESTAURANT;MCDONALDS;PIZZA HUT;RISTORANTE;EISCAFE;FIVE GUYS;BURGER KING;CAFE;COFFEE;PRIME VIDEO;CINEMA;ROBLOX;NETFLIX;DISNEY;SPOTIFY;YOUTUBE;APPLE.COM/BILL;GOOGLE*GOOGLE ONE",
    type: "Despesa" as const,
    fixVar: "Variável" as const,
    category1: "Lazer" as const,
    category2: "Entretenimento",
    priority: 580,
    strict: false,
    isSystem: true
  },
  {
    name: "Assinaturas",
    keywords: "NETFLIX;SPOTIFY;APPLE TV;DISNEY;PARAMOUNT;AMAZON PRIM;AUDIBLE;OPENAI;CHATGPT;CLAUDE.AI;FIGMA;CANVA;CAPCUT;GOOGLE*GOOGLE ONE;YOUTUBE PREMIU",
    type: "Despesa" as const,
    fixVar: "Fixo" as const,
    category1: "Lazer" as const,
    category2: "Streaming",
    priority: 570,
    strict: false,
    isSystem: true
  },
  {
    name: "Outros",
    keywords: "DEVK;AOK;VERSICHERUNG;ZINSBELASTUNG;ENTGELTABSCHLUSS;KARTENPREIS;1,95%;ING-DIBA;RAHMENKREDIT;FRESSNAPF;FUTALIS;WISE;WESTERN UNION;WAHRUNGSUMRECHN",
    type: "Despesa" as const,
    fixVar: "Variável" as const,
    category1: "Outros" as const,
    category2: null,
    priority: 500,
    strict: false,
    isSystem: true
  }
];
