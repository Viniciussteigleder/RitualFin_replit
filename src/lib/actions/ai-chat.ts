"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, rules, accounts, assistantSettings, calendarEvents } from "@/lib/db/schema";
import { eq, desc, sql, and, gte, lte, ne } from "drizzle-orm";
import OpenAI from "openai";
import { rateLimit } from "@/lib/security/rate-limit";
import {
  DEFAULT_DATABASE_CONTEXT,
  DEFAULT_ANALYSIS_PROMPT,
  DEFAULT_ADVICE_PROMPT,
  DEFAULT_SUMMARY_PROMPT,
} from "@/lib/assistant/default-prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder-for-build",
});

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Fetch user's assistant settings
async function getUserSettings(userId: string) {
  const [settings] = await db
    .select()
    .from(assistantSettings)
    .where(eq(assistantSettings.userId, userId))
    .limit(1);

  return settings || {
    databaseContext: DEFAULT_DATABASE_CONTEXT,
    analysisPrompt: DEFAULT_ANALYSIS_PROMPT,
    advicePrompt: DEFAULT_ADVICE_PROMPT,
    summaryPrompt: DEFAULT_SUMMARY_PROMPT,
    responseLanguage: "pt-BR",
    responseStyle: "professional",
    maxResponseLength: 500,
    includeEmojis: false,
    contextAware: true,
    includeRecentTransactions: true,
    includeCategoryBreakdown: true,
  };
}

// Build context for the AI based on user's current screen and financial data
async function buildFinancialContext(
  userId: string,
  currentScreen?: string,
  includeRecentTransactions = true,
  includeCategoryBreakdown = true
) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get total balance
  const [balanceRes] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  const totalBalance = Number(balanceRes?.total || 0);

  // Get this month's spending (excluding internal transfers)
	  const [thisMonthSpend] = await db
	    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
	    .from(transactions)
	    .where(and(
	      eq(transactions.userId, userId),
	      eq(transactions.type, "Despesa"),
	      gte(transactions.paymentDate, startOfMonth),
	      eq(transactions.internalTransfer, false),
	      sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
	      ne(transactions.display, "no")
	    ));
  const monthSpending = Math.abs(Number(thisMonthSpend?.total || 0));

  // Get last month's spending for comparison
	  const [lastMonthSpend] = await db
	    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
	    .from(transactions)
	    .where(and(
	      eq(transactions.userId, userId),
	      eq(transactions.type, "Despesa"),
	      gte(transactions.paymentDate, startOfLastMonth),
	      sql`${transactions.paymentDate} <= ${endOfLastMonth}`,
	      eq(transactions.internalTransfer, false),
	      sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
	      ne(transactions.display, "no")
	    ));
  const lastMonthSpending = Math.abs(Number(lastMonthSpend?.total || 0));

  // Get this month's income
  const [thisMonthIncome] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, "Receita"),
      gte(transactions.paymentDate, startOfMonth),
      ne(transactions.display, "no")
    ));
  const monthIncome = Number(thisMonthIncome?.total || 0);

  // Get spending by category (top 10 this month)
  let categoryBreakdown: { category: string; amount: string; transactions: number }[] = [];
  if (includeCategoryBreakdown) {
    const categorySpending = await db
      .select({
        category: transactions.appCategoryName,
        category1: transactions.category1,
        total: sql<number>`COALESCE(SUM(amount), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
	      .where(and(
	        eq(transactions.userId, userId),
	        eq(transactions.type, "Despesa"),
	        gte(transactions.paymentDate, startOfMonth),
	        eq(transactions.internalTransfer, false),
	        sql`(${transactions.category1} IS NULL OR ${transactions.category1} <> 'Interno')`,
	        ne(transactions.display, "no")
	      ))
      .groupBy(transactions.appCategoryName, transactions.category1)
      .orderBy(sql`SUM(amount) ASC`)
      .limit(10);

    categoryBreakdown = categorySpending.map(c => ({
      category: c.category || c.category1 || "Sem categoria",
      amount: Math.abs(Number(c.total)).toFixed(2),
      transactions: Number(c.count),
    }));
  }

  // Get recent transactions (last 20)
  let recentTxList: { description: string | undefined; amount: string; category: string; date: string; type: string | null }[] = [];
  if (includeRecentTransactions) {
    const recentTransactions = await db
      .select({
        description: transactions.rawDescription,
        amount: transactions.amount,
        category: transactions.appCategoryName,
        date: transactions.paymentDate,
        type: transactions.type,
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        ne(transactions.display, "no")
      ))
      .orderBy(desc(transactions.paymentDate))
      .limit(20);

    recentTxList = recentTransactions.map(t => ({
      description: t.description?.substring(0, 50),
      amount: Number(t.amount).toFixed(2),
      category: t.category || "Sem categoria",
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : "N/A",
      type: t.type,
    }));
  }

  // Get pending review count
  const [pendingRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.needsReview, true),
      ne(transactions.display, "no")
    ));
  const pendingCount = Number(pendingRes?.count || 0);

  // Get accounts
  const userAccounts = await db
    .select({
      name: accounts.name,
      institution: accounts.institution,
      type: accounts.type,
    })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  // Get rules count
  const [rulesCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rules)
    .where(and(
      eq(rules.userId, userId),
      eq(rules.active, true)
    ));

  // Get upcoming calendar events (next 30 days)
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const upcomingEvents = await db
    .select({
      name: calendarEvents.name,
      amount: calendarEvents.amount,
      nextDueDate: calendarEvents.nextDueDate,
      category: calendarEvents.category1,
      recurrence: calendarEvents.recurrence,
    })
    .from(calendarEvents)
    .where(and(
      eq(calendarEvents.userId, userId),
      eq(calendarEvents.isActive, true),
      gte(calendarEvents.nextDueDate, now),
      lte(calendarEvents.nextDueDate, thirtyDaysLater)
    ))
    .orderBy(calendarEvents.nextDueDate)
    .limit(10);

  // Calculate daily average spend
  const dailyAverage = monthSpending / Math.max(now.getDate(), 1);

  // Calculate savings rate
  const savingsRate = monthIncome > 0
    ? ((monthIncome - monthSpending) / monthIncome * 100).toFixed(1)
    : "N/A";

  return {
    currentDate: now.toISOString().split('T')[0],
    currentMonth: now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    currentScreen: currentScreen || "unknown",
    summary: {
      totalBalance: totalBalance.toFixed(2),
      thisMonthSpending: monthSpending.toFixed(2),
      lastMonthSpending: lastMonthSpending.toFixed(2),
      monthOverMonthChange: lastMonthSpending > 0
        ? (((monthSpending - lastMonthSpending) / lastMonthSpending) * 100).toFixed(1) + "%"
        : "N/A",
      thisMonthIncome: monthIncome.toFixed(2),
      dailyAverageSpend: dailyAverage.toFixed(2),
      savingsRate: savingsRate + "%",
      pendingReviewCount: pendingCount,
      activeRulesCount: Number(rulesCount?.count || 0),
    },
    categoryBreakdown,
    recentTransactions: recentTxList,
    accounts: userAccounts.map(a => ({
      name: a.name,
      institution: a.institution,
      type: a.type,
    })),
    upcomingEvents: upcomingEvents.map(e => ({
      name: e.name,
      amount: Number(e.amount).toFixed(2),
      dueDate: e.nextDueDate ? new Date(e.nextDueDate).toISOString().split('T')[0] : "N/A",
      category: e.category,
      recurrence: e.recurrence,
    })),
  };
}

// Build system prompt based on user settings
function buildSystemPrompt(
  settings: Awaited<ReturnType<typeof getUserSettings>>,
  questionType: "analysis" | "advice" | "summary" | "general" = "general"
) {
  const styleDescriptions: Record<string, string> = {
    professional: "Profissional e objetivo, usando linguagem clara e dados precisos.",
    casual: "Amigavel e descontraido, como um amigo que entende de financas.",
    detailed: "Detalhado e analitico, fornecendo explicacoes completas.",
  };

  const languageInstructions: Record<string, string> = {
    "pt-BR": "Responda sempre em portugues brasileiro.",
    "pt-PT": "Responda sempre em portugues de Portugal.",
    "en": "Always respond in English.",
    "de": "Antworten Sie immer auf Deutsch.",
  };

  // Get specific prompt based on question type
  let specificPrompt = "";
  switch (questionType) {
    case "analysis":
      specificPrompt = settings.analysisPrompt || DEFAULT_ANALYSIS_PROMPT;
      break;
    case "advice":
      specificPrompt = settings.advicePrompt || DEFAULT_ADVICE_PROMPT;
      break;
    case "summary":
      specificPrompt = settings.summaryPrompt || DEFAULT_SUMMARY_PROMPT;
      break;
    default:
      specificPrompt = "";
  }

  return `Voce e o Analista Ritual, um assistente financeiro inteligente do aplicativo RitualFin.

## ESTILO DE COMUNICACAO
${styleDescriptions[settings.responseStyle || "professional"]}
${languageInstructions[settings.responseLanguage || "pt-BR"]}
${settings.includeEmojis ? "Use emojis moderadamente para tornar a comunicacao mais amigavel." : "NAO use emojis nas respostas."}

## CONHECIMENTO DO SISTEMA
${settings.databaseContext || DEFAULT_DATABASE_CONTEXT}

## CAPACIDADES
- Analisar gastos por categoria e periodo
- Comparar gastos entre meses
- Identificar padroes de consumo e gastos recorrentes
- Sugerir areas de economia baseado nos dados reais
- Explicar transacoes especificas
- Calcular saldo, fluxo de caixa e taxa de poupanca
- Informar sobre proximos vencimentos do calendario

## FORMATO DE RESPOSTA
- Use frases curtas e objetivas
- Valores em formato EUR: €1.234,56
- Destaque insights importantes com negrito ou bullet points
- Sugira proximas acoes quando relevante
- Limite respostas a informacoes uteis e acionaveis

## LIMITACOES
- NAO pode executar transacoes ou alteracoes no sistema
- NAO tem acesso a dados de outros usuarios
- NAO fornece conselhos de investimento especificos
- NAO pode prever o futuro financeiro com certeza

${specificPrompt ? `## INSTRUCOES ESPECIFICAS PARA ESTA PERGUNTA\n${specificPrompt}` : ""}`;
}

// Detect question type from user message
function detectQuestionType(message: string): "analysis" | "advice" | "summary" | "general" {
  const lowerMsg = message.toLowerCase();

  // Analysis keywords
  if (lowerMsg.includes("analis") || lowerMsg.includes("compar") ||
      lowerMsg.includes("quanto gastei") || lowerMsg.includes("categoria") ||
      lowerMsg.includes("gasto") || lowerMsg.includes("despesa") ||
      lowerMsg.includes("mes passado") || lowerMsg.includes("evolucao")) {
    return "analysis";
  }

  // Advice keywords
  if (lowerMsg.includes("conselho") || lowerMsg.includes("sugest") ||
      lowerMsg.includes("economizar") || lowerMsg.includes("melhorar") ||
      lowerMsg.includes("dica") || lowerMsg.includes("como posso") ||
      lowerMsg.includes("o que fazer") || lowerMsg.includes("recomend")) {
    return "advice";
  }

  // Summary keywords
  if (lowerMsg.includes("resum") || lowerMsg.includes("visao geral") ||
      lowerMsg.includes("situacao") || lowerMsg.includes("como estou") ||
      lowerMsg.includes("status") || lowerMsg.includes("panorama")) {
    return "summary";
  }

  return "general";
}

export async function sendChatMessage(
  userMessage: string,
  conversationHistory: Message[],
  currentScreen?: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  // Rate Limiting: 20 messages per 1 hour
  const ratelimitResult = await rateLimit(session.user.id, "ai-chat", { limit: 20, windowMs: 60 * 60 * 1000 });
  if (!ratelimitResult.success) {
    return { 
      success: false, 
      error: `Limite de mensagens atingido. Tente novamente em ${Math.ceil((ratelimitResult.reset - Date.now()) / 60000)} minutos.` 
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: "API de IA não configurada" };
  }

  try {
    // Get user settings
    const settings = await getUserSettings(session.user.id);

    // Detect question type
    const questionType = detectQuestionType(userMessage);

    // Build financial context based on settings
    const context = await buildFinancialContext(
      session.user.id,
      settings.contextAware ? currentScreen : undefined,
      settings.includeRecentTransactions !== false,
      settings.includeCategoryBreakdown !== false
    );

    // Build system prompt with user settings
    const systemPrompt = buildSystemPrompt(settings, questionType);

    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `${systemPrompt}

## DADOS FINANCEIROS ATUAIS (${context.currentMonth})
${JSON.stringify(context, null, 2)}

Use esses dados para responder de forma contextualizada e precisa.`
      },
      // Include conversation history (last 10 messages to avoid token limits)
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user",
        content: userMessage,
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: settings.maxResponseLength || 500,
    });

    const assistantMessage = response.choices[0].message.content;

    if (!assistantMessage) {
      return { success: false, error: "Resposta vazia da IA" };
    }

    return { success: true, response: assistantMessage };
  } catch (err) {
    console.error("AI Chat Error:", err);
    return { success: false, error: "Erro ao processar sua pergunta" };
  }
}
