// Rules Engine for AI-powered transaction categorization

import type { Rule, Transaction } from "@shared/schema";

export interface RuleMatch {
  ruleId: string;
  type: "Despesa" | "Receita";
  fixVar: "Fixo" | "Variável";
  category1: string;
  category2?: string;
  priority: number;
  strict: boolean;
  isSystem: boolean;
}

export interface CategorizationResult {
  needsReview: boolean;
  matches: RuleMatch[];
  appliedRule?: RuleMatch;
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

export function matchRules(descNorm: string, rules: Rule[]): CategorizationResult {
  const haystack = normalizeForMatch(descNorm);
  const matches: RuleMatch[] = [];

  const sortedRules = [...rules].sort((a, b) => (b.priority || 500) - (a.priority || 500));

  for (const rule of sortedRules) {
    const keywords = rule.keywords
      .split(";")
      .map(k => normalizeForMatch(k))
      .filter(k => k.length > 0);
    
    const hasMatch = keywords.some(keyword => haystack.includes(keyword));
    
    if (hasMatch) {
      const match: RuleMatch = {
        ruleId: rule.id,
        type: rule.type,
        fixVar: rule.fixVar,
        category1: rule.category1,
        category2: rule.category2 || undefined,
        priority: rule.priority || 500,
        strict: rule.strict || false,
        isSystem: rule.isSystem || false
      };

      if (rule.strict) {
        return {
          needsReview: false,
          matches: [match],
          appliedRule: match,
          reason: "Regra estrita aplicada"
        };
      }

      matches.push(match);
    }
  }

  if (matches.length === 0) {
    return {
      needsReview: true,
      matches: [],
      reason: "Nenhuma regra encontrada"
    };
  }

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
    const isInterno = rule.category1 === "Interno";
    
    return {
      type: rule.type,
      fixVar: rule.fixVar,
      category1: rule.category1 as any,
      category2: rule.category2,
      needsReview: false,
      ruleIdApplied: rule.ruleId,
      internalTransfer: isInterno,
      excludeFromBudget: isInterno
    };
  }

  return {
    needsReview: true
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
