"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions, rules, accounts } from "@/lib/db/schema";
import { eq, desc, sql, and, gte, ne } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder-for-build",
});

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Build context for the AI based on user's current screen and financial data
async function buildFinancialContext(userId: string, currentScreen?: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
      sql`${transactions.category1} NOT IN ('Interno', 'Transferências')`,
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
      sql`${transactions.category1} NOT IN ('Interno', 'Transferências')`,
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
      sql`${transactions.category1} NOT IN ('Interno', 'Transferências')`,
      ne(transactions.display, "no")
    ))
    .groupBy(transactions.appCategoryName, transactions.category1)
    .orderBy(sql`SUM(amount) ASC`)
    .limit(10);

  // Get recent transactions (last 20)
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

  // Calculate daily average spend
  const dailyAverage = monthSpending / Math.max(now.getDate(), 1);

  return {
    currentDate: now.toISOString().split('T')[0],
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
      pendingReviewCount: pendingCount,
      activeRulesCount: Number(rulesCount?.count || 0),
    },
    categoryBreakdown: categorySpending.map(c => ({
      category: c.category || c.category1 || "Sem categoria",
      amount: Math.abs(Number(c.total)).toFixed(2),
      transactions: Number(c.count),
    })),
    recentTransactions: recentTransactions.map(t => ({
      description: t.description?.substring(0, 50),
      amount: Number(t.amount).toFixed(2),
      category: t.category || "Sem categoria",
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : "N/A",
      type: t.type,
    })),
    accounts: userAccounts.map(a => ({
      name: a.name,
      institution: a.institution,
      type: a.type,
    })),
  };
}

const SYSTEM_PROMPT = `Você é o Analista Ritual, um assistente financeiro inteligente do aplicativo RitualFin. Você ajuda usuários a entender e gerenciar suas finanças pessoais.

PERSONALIDADE:
- Profissional mas amigável
- Conciso e direto ao ponto
- Usa números e dados para fundamentar suas respostas
- Evita jargões financeiros complexos
- Responde em português brasileiro

CAPACIDADES:
- Analisar gastos por categoria
- Comparar gastos entre períodos
- Identificar padrões de consumo
- Sugerir áreas de economia
- Explicar transações específicas
- Responder perguntas sobre o saldo e fluxo de caixa
- Ajudar a entender as categorias de gastos

FORMATO DE RESPOSTA:
- Use frases curtas e objetivas
- Quando mostrar valores, use o formato €X.XXX,XX
- Destaque insights importantes
- Sugira próximas ações quando relevante

LIMITAÇÕES:
- Não pode executar transações ou alterações
- Não tem acesso a dados de outros usuários
- Não fornece conselhos de investimento
- Não pode prever o futuro financeiro`;

export async function sendChatMessage(
  userMessage: string,
  conversationHistory: Message[],
  currentScreen?: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: "API de IA não configurada" };
  }

  try {
    // Build financial context
    const context = await buildFinancialContext(session.user.id, currentScreen);

    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}

CONTEXTO FINANCEIRO ATUAL DO USUÁRIO (data: ${context.currentDate}):
${JSON.stringify(context, null, 2)}

Use esses dados para responder às perguntas do usuário de forma contextualizada.`
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
      max_tokens: 500,
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

// Export sample questions for the UI - 50 questions from easy to complex
export const SAMPLE_QUESTIONS = [
  // =========================================
  // NÍVEL 1: BÁSICO (Perguntas diretas simples)
  // =========================================
  "Quanto gastei este mês?",
  "Qual meu saldo atual?",
  "Quanto recebi de salário?",
  "Quantas transações tenho para revisar?",
  "Qual minha categoria mais cara?",
  "Quanto tenho de receita este mês?",
  "Qual foi minha última compra?",
  "Quantas regras de categorização tenho ativas?",
  "Qual meu gasto total?",
  "Tenho transações pendentes?",

  // =========================================
  // NÍVEL 2: INTERMEDIÁRIO (Uma condição/filtro)
  // =========================================
  "Quanto gastei em mercado este mês?",
  "Como estão meus gastos comparado ao mês passado?",
  "Qual meu gasto médio diário?",
  "Quais são minhas maiores despesas fixas?",
  "Quanto gastei em restaurantes nas últimas semanas?",
  "Qual foi meu maior gasto este mês?",
  "Quanto gastei com transporte?",
  "Quais são minhas despesas variáveis?",
  "Quanto gastei com lazer?",
  "Qual o total de assinaturas que pago?",

  // =========================================
  // NÍVEL 3: AVANÇADO (Análises e comparações)
  // =========================================
  "Onde posso economizar este mês?",
  "Qual categoria aumentou mais em relação ao mês passado?",
  "Tenho alguma assinatura que esqueci?",
  "Como está minha saúde financeira?",
  "Estou gastando mais em lazer ou necessidades básicas?",
  "Qual categoria representa maior porcentagem dos gastos?",
  "Estou economizando ou gastando mais que ganho?",
  "Qual estabelecimento mais frequento?",
  "Identifique gastos recorrentes",
  "Meus gastos estão aumentando ou diminuindo?",

  // =========================================
  // NÍVEL 4: COMPLEXO (Múltiplas condições)
  // =========================================
  "Comparando mercado e restaurantes, qual está consumindo mais?",
  "Se continuar assim, vou gastar mais ou menos que o mês passado?",
  "Quais categorias variáveis estão acima da média?",
  "Identifique padrões incomuns nos meus gastos",
  "Resumo completo do mês: gastos, receitas e análise",
  "Quais gastos fixos posso reduzir?",
  "Compare meus gastos essenciais vs supérfluos",
  "Qual dia da semana gasto mais?",
  "Tenho gastos duplicados ou suspeitos?",
  "Analise meu comportamento de consumo",

  // =========================================
  // NÍVEL 5: EXPERT (Análise profunda e estratégica)
  // =========================================
  "Crie um plano de economia baseado nos meus dados",
  "Quais são os 3 maiores vazamentos no meu orçamento?",
  "Se eu cortar gastos de lazer pela metade, quanto economizo?",
  "Analise tendências nos últimos meses e projete o próximo",
  "Quais categorias têm maior variação mês a mês?",
  "Sugira metas de economia realistas baseadas no meu histórico",
  "Faça um diagnóstico completo das minhas finanças",
  "Identifique oportunidades de otimização nos gastos fixos",
  "Compare minha proporção gastos/receita com benchmarks saudáveis",
  "Quais mudanças teriam maior impacto positivo nas minhas finanças?",
];
