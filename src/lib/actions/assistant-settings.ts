"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assistantSettings, AssistantSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Comprehensive Database Context - explains the data structure to the AI
export const DEFAULT_DATABASE_CONTEXT = `## Estrutura do RitualFin

### Visao Geral
RitualFin e um app de financas pessoais. Todos os valores estao em EUR. O usuario mora na Europa.

### Tabelas Principais

**transactions** - Tabela principal de transacoes
- paymentDate: Data do pagamento (usar para filtros de periodo)
- amount: Valor (negativo = despesa, positivo = receita)
- type: "Despesa" ou "Receita"
- category1: Categoria nivel 1 (Alimentacao, Moradia, Transporte, etc.)
- category2, category3: Subcategorias
- appCategoryName: Nome amigavel da categoria para exibicao
- descRaw: Descricao original do banco
- simpleDesc: Descricao simplificada
- aliasDesc: Apelido definido pelo usuario
- needsReview: true se precisa revisao manual
- internalTransfer: true se e transferencia entre contas proprias
- recurringFlag: true se e transacao recorrente
- display: "yes" ou "no" - se deve ser exibida nos relatorios

**accounts** - Contas bancarias
- name: Nome da conta
- institution: Banco (Sparkasse, Amex, etc.)
- type: credit_card, debit_card, bank_account, cash

**calendarEvents** - Eventos recorrentes planejados
- name, amount, nextDueDate, recurrence

**rules** - Regras de categorizacao automatica
- keyWords: Palavras-chave para match
- Quando uma transacao contem a keyword, aplica a categoria da regra

### Categorias Disponiveis (category1)
Alimentacao, Mercados, Lazer/Esporte, Compras, Financiamento, Transporte, Moradia, Saude, Trabalho, Renda Extra, Interno, Outros

### Fontes de Dados
- Sparkasse: Conta corrente alema
- Amex: Cartao de credito American Express
- M&M: Miles & More (programa de milhas)

### Calculos Importantes
- Saldo total: SUM(amount) de todas transacoes
- Gastos do mes: SUM(amount) WHERE type='Despesa' AND paymentDate >= inicio_mes
- Receita do mes: SUM(amount) WHERE type='Receita' AND paymentDate >= inicio_mes
- Excluir de calculos: category1='Interno' ou internalTransfer=true ou display='no'`;

// Default Analysis Prompt
export const DEFAULT_ANALYSIS_PROMPT = `Ao analisar gastos:
1. Compare SEMPRE com o mes anterior (% de variacao)
2. Identifique as 3 categorias com maior gasto
3. Calcule a media diaria de gastos
4. Destaque gastos atipicos (muito acima da media)
5. Se houver aumento significativo (>20%), investigue a causa
6. Mostre valores em formato EUR: €1.234,56`;

// Default Advice Prompt
export const DEFAULT_ADVICE_PROMPT = `Ao dar conselhos financeiros:
1. Base-se nos dados reais do usuario, nao em suposicoes
2. Sugira acoes concretas e realizaveis
3. Priorize economia em categorias com maior gasto variavel
4. Considere que gastos fixos (Moradia, Financiamento) sao dificeis de reduzir
5. Foque em Alimentacao, Lazer e Compras para sugestoes de economia
6. Nunca sugira investimentos especificos
7. Seja motivador, nao critico`;

// Default Summary Prompt
export const DEFAULT_SUMMARY_PROMPT = `Ao resumir financas:
1. Comece com o saldo atual e fluxo do mes
2. Liste top 5 categorias de gasto
3. Compare com mes anterior
4. Destaque transacoes pendentes de revisao
5. Mencione proximos vencimentos do calendario
6. Use bullet points para clareza
7. Termine com uma frase motivacional baseada na situacao`;

// Default values for assistant settings
const DEFAULT_SETTINGS = {
  databaseContext: DEFAULT_DATABASE_CONTEXT,
  analysisPrompt: DEFAULT_ANALYSIS_PROMPT,
  advicePrompt: DEFAULT_ADVICE_PROMPT,
  summaryPrompt: DEFAULT_SUMMARY_PROMPT,
  responseLanguage: "pt-BR",
  responseStyle: "professional",
  maxResponseLength: 500,
  includeEmojis: false,
  autoSuggestions: true,
  contextAware: true,
  includeRecentTransactions: true,
  includeCategoryBreakdown: true,
};

export async function getAssistantSettings(): Promise<{
  success: boolean;
  data?: AssistantSettings;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const [settings] = await db
      .select()
      .from(assistantSettings)
      .where(eq(assistantSettings.userId, session.user.id))
      .limit(1);

    if (!settings) {
      // Create default settings for the user
      const [newSettings] = await db
        .insert(assistantSettings)
        .values({
          userId: session.user.id,
          ...DEFAULT_SETTINGS,
        })
        .returning();

      return { success: true, data: newSettings };
    }

    return { success: true, data: settings };
  } catch (err) {
    console.error("Error fetching assistant settings:", err);
    return { success: false, error: "Erro ao buscar configurações" };
  }
}

export async function updateAssistantSettings(data: {
  databaseContext?: string;
  analysisPrompt?: string;
  advicePrompt?: string;
  summaryPrompt?: string;
  responseLanguage?: string;
  responseStyle?: string;
  maxResponseLength?: number;
  includeEmojis?: boolean;
  autoSuggestions?: boolean;
  contextAware?: boolean;
  includeRecentTransactions?: boolean;
  includeCategoryBreakdown?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    // Check if settings exist
    const [existing] = await db
      .select()
      .from(assistantSettings)
      .where(eq(assistantSettings.userId, session.user.id))
      .limit(1);

    if (existing) {
      // Update existing settings
      await db
        .update(assistantSettings)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(assistantSettings.userId, session.user.id));
    } else {
      // Create new settings
      await db.insert(assistantSettings).values({
        userId: session.user.id,
        ...DEFAULT_SETTINGS,
        ...data,
      });
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Error updating assistant settings:", err);
    return { success: false, error: "Erro ao salvar configurações" };
  }
}

// Reset assistant settings to defaults
export async function resetAssistantSettings(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    await db
      .update(assistantSettings)
      .set({
        ...DEFAULT_SETTINGS,
        updatedAt: new Date(),
      })
      .where(eq(assistantSettings.userId, session.user.id));

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Error resetting assistant settings:", err);
    return { success: false, error: "Erro ao resetar configurações" };
  }
}
