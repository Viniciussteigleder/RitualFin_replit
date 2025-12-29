/**
 * Seed Script: Keyword Dictionary
 *
 * Populates system rules with consolidated keyword dictionary.
 * Keywords are case-insensitive and use "contains" matching.
 *
 * Run: tsx server/seeds/001_keywords.ts
 */

import { db, pool } from "../db.js";
import { rules } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Demo user ID (hardcoded for now, will be dynamic when multi-user is implemented)
const DEMO_USER_ID = "e9d1c9aa-fa90-4483-b132-b06db86792ac";

interface CategoryRule {
  name: string;
  category1: "Receitas" | "Moradia" | "Mercado" | "Compras Online" | "Transporte" | "Saúde" | "Lazer" | "Outros" | "Interno";
  type: "Despesa" | "Receita";
  fixVar: "Fixo" | "Variável";
  keywords: string;
  priority: number;
  strict: boolean;
}

const CATEGORY_RULES: CategoryRule[] = [
  // 1) RECEITAS (highest priority after Interno)
  {
    name: "Receitas - Sistema",
    category1: "Receitas",
    type: "Receita",
    fixVar: "Variável",
    keywords: "ENTGELT;SALARIO;BONUS;KINDERGELD;ARBEIT - FAMILIEN KASSE;BUNDESAGENTUR;MIETE INCL. NEBENKOSTEN;HAUS KARLSRUHE MIETE;HAUS KARLSRUHE NK;FINANZAMT;STEUERERKLÄRUNG;BOSCH GMBHTVL EXP;REEMBOLSO BOSCH;MANGOPAY;ANDRESSA VILAS BOAS NOGUEIRA LIMA;BIANCA DE FREITAS LIMA;BIANCaflima;FLAVIA FRATTINI;DR. MARCO ROCHA CURADO;MARCELO GUIDA TAVARES;BETTINA TAVARES;MARILIA DUARTE VIANA",
    priority: 900,
    strict: false
  },

  // 2) MORADIA
  {
    name: "Moradia - Sistema",
    category1: "Moradia",
    type: "Despesa",
    fixVar: "Fixo",
    keywords: "DARLEHENSABSCHLUSS;FINANCIAMENTO;IBAN DE20701694600020137367;R + V LEBENSVERSICHERUNG;WEG LOSWOHNEN;HG VORAUSZAHLUNG;GRUNDSTEUER;GRUNDSTEUER B;FERNWÄRME;VERTRAGSNR;STROM;LICHTBLICK;VATTENFALL;WASSER;VERTRAGSKONTO;MONATSMIETE;SCHROEDER;DAUERAUFTRAG;RUNDFUNK ARD;BAYERISCHER RUNDFUNK;AGF IMMOBILIEN;HAUSHALTSSTELLE;REPARATUR;MANUTENÇÃO;MATERIAL;SERVICOS;DANKE BZO OLCHING GMBH",
    priority: 700,
    strict: false
  },

  // 3) MERCADO
  {
    name: "Mercado - Sistema",
    category1: "Mercado",
    type: "Despesa",
    fixVar: "Variável",
    keywords: "REWE;EDEKA;ALDI;LIDL;NETTO;NORMA;DM;DM-DROGERIE;ROSSMANN;MUELLER;MÜLLER;ASIA MARKT;MADE IN PORTUGAL;BACKSTUBE;BAECKEREI;IHLE;RISCHARTS;BACKZEIT;WUENSCHE",
    priority: 600,
    strict: false
  },

  // 4) COMPRAS ONLINE
  {
    name: "Compras Online - Sistema",
    category1: "Compras Online",
    type: "Despesa",
    fixVar: "Variável",
    keywords: "AMAZON;AMZN;AMZ*;TEMU;ZALANDO;ABOUT YOU;HM.COM;DECATHLON;MEDIAMARKT;SATURN;KLEINANZEIGEN;JYSK;MOEMAX;TEDI;IDEA",
    priority: 650,
    strict: false
  },

  // 5) TRANSPORTE
  {
    name: "Transporte - Sistema",
    category1: "Transporte",
    type: "Despesa",
    fixVar: "Variável",
    keywords: "TANKSTELLE;ALLGUTH;KFZ-STEUER;KFZ-VERSICHERUNG;PARKHAUS;HANDYPARKEN;PARKGARAGE;PARKEN OLYMPIA;STADT MANNHEIM;MVV;TICKETSHOP LOGPAY;VOI",
    priority: 550,
    strict: false
  },

  // 6) SAÚDE
  {
    name: "Saúde - Sistema",
    category1: "Saúde",
    type: "Despesa",
    fixVar: "Variável",
    keywords: "APOTHEKE;ZAHNARZT;ZAHNARZTPRAXIS;KINDERZAHNHEILKUNDE;PRAXIS;ARZT;HAUTARZT;LABOR;LABOR AUGSBURG MVZ;APOLLO OPTIK;PALMILHA;AGM MUELLER;BOTOX;COLAGENO;LIMPEZA DE PELE;NATALIA.FERTSC;L'OCCITANE",
    priority: 600,
    strict: false
  },

  // 7) LAZER
  {
    name: "Lazer - Sistema",
    category1: "Lazer",
    type: "Despesa",
    fixVar: "Variável",
    keywords: "RESTAURANT;MCDONALDS;PIZZA HUT;RISTORANTE;EISCAFE;BELMONDO;HANS IM TAL;BOTECO;ABACCOS;DING TEA;I LOVE LEO;WEINTREFF;GAUCHO STEAKHOUSE;PRIME VIDEO;CINEMA;ROBLOX;OKTOBERFEST;FERIAS;FLUGSTRECKE;LONDON;EUROPAPARK;BRASIL;THISTLEMARBLE;WARNER BROS;WOLFSSCHLUCHT;BJJ;TENNIS;SCHWIMM;SV;OLC-;GEORGI KRANCHEV;TANJA MAYR",
    priority: 500,
    strict: false
  },

  // 8) OUTROS
  {
    name: "Outros - Sistema",
    category1: "Outros",
    type: "Despesa",
    fixVar: "Variável",
    keywords: "APPLE.COM/BILL;GOOGLE*GOOGLE ONE;NETFLIX;DISNEY;PARAMOUNT;AMZNPRIME;AUDIBLE;OPENAI *CHATGPT;ACTIVECAMP;CANVA;CAPCUT;INSTORIES;DEVK;AOK;VERSICHERUNG;ZINSBELASTUNG;ENTGELTABSCHLUSS;KARTENPREIS;1,95%;ING-DIBA;RAHMENKREDIT;POSTBANK;DARLEHENSRATE;GYMNASIUM;SCHULHILFE;BUCHLADEN;EINSUNDZWEI;FRESSNAPF;FUTALIS;MITGLIEDSBEITRAG;BRUEDERLICHKEIT;BARGELDAUSZAHLUNG;GELDAUTOMAT;TRANSFERWISE;WISE;WESTERN UNION",
    priority: 400,
    strict: false
  },

  // 9) INTERNO (VERY STRICT - highest priority)
  {
    name: "Interno - Sistema",
    category1: "Interno",
    type: "Despesa",
    fixVar: "Fixo",
    keywords: "AMEX - ZAHLUNG;ZAHLUNG ERHALTEN;PAGAMENTO AMEX;PAGAMENTO M&M;AMERICAN EXPRESS ZAHLUNG;DEUTSCHE KREDITBANK AKTIENGESELLSCHAFT",
    priority: 1000, // Highest priority
    strict: true // Auto-confirm, exclude from budget
  }
];

async function seedKeywords() {
  try {
    console.log("🌱 Seeding keyword dictionary...\n");

    // Step 1: Delete existing system rules for demo user
    console.log("1️⃣ Removing old system rules...");
    const deleted = await db.delete(rules)
      .where(and(
        eq(rules.userId, DEMO_USER_ID),
        eq(rules.isSystem, true)
      ));

    console.log(`   ✅ Removed ${deleted.rowCount || 0} old system rules\n`);

    // Step 2: Insert new system rules
    console.log("2️⃣ Creating new system rules...\n");

    for (const rule of CATEGORY_RULES) {
      await db.insert(rules).values({
        userId: DEMO_USER_ID,
        name: rule.name,
        keywords: rule.keywords,
        type: rule.type,
        fixVar: rule.fixVar,
        category1: rule.category1,
        category2: null,
        category3: null,
        priority: rule.priority,
        strict: rule.strict,
        isSystem: true
      });

      const keywordCount = rule.keywords.split(";").length;
      console.log(`   ✅ ${rule.category1.padEnd(20)} | ${keywordCount} keywords | Priority: ${rule.priority}${rule.strict ? " | STRICT" : ""}`);
    }

    console.log("\n3️⃣ Summary:");
    console.log(`   Total rules created: ${CATEGORY_RULES.length}`);
    console.log(`   Total keywords: ${CATEGORY_RULES.reduce((sum, r) => sum + r.keywords.split(";").length, 0)}`);

    // Step 3: Verify
    const allSystemRules = await db.query.rules.findMany({
      where: eq(rules.isSystem, true)
    });

    console.log(`\n✅ Seed completed! ${allSystemRules.length} system rules in database.\n`);

  } catch (error: any) {
    console.error("❌ Seed failed:", error.message);
    throw error;
  } finally {
    if (pool) await pool.end();
  }
}

// Run seed
seedKeywords().catch(console.error);
