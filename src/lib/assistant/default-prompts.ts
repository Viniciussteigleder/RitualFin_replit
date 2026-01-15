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

export const DEFAULT_ANALYSIS_PROMPT = `Ao analisar gastos:
1. Compare SEMPRE com o mes anterior (% de variacao)
2. Identifique as 3 categorias com maior gasto
3. Calcule a media diaria de gastos
4. Destaque gastos atipicos (muito acima da media)
5. Se houver aumento significativo (>20%), investigue a causa
6. Mostre valores em formato EUR: €1.234,56`;

export const DEFAULT_ADVICE_PROMPT = `Ao dar conselhos financeiros:
1. Base-se nos dados reais do usuario, nao em suposicoes
2. Sugira acoes concretas e realizaveis
3. Priorize economia em categorias com maior gasto variavel
4. Considere que gastos fixos (Moradia, Financiamento) sao dificeis de reduzir
5. Foque em Alimentacao, Lazer e Compras para sugestoes de economia
6. Nunca sugira investimentos especificos
7. Seja motivador, nao critico`;

export const DEFAULT_SUMMARY_PROMPT = `Ao resumir financas:
1. Comece com o saldo atual e fluxo do mes
2. Liste top 5 categorias de gasto
3. Compare com mes anterior
4. Destaque transacoes pendentes de revisao
5. Mencione proximos vencimentos do calendario
6. Use bullet points para clareza
7. Termine com uma frase motivacional baseada na situacao`;

export const DEFAULT_ASSISTANT_SETTINGS = {
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
} as const;

