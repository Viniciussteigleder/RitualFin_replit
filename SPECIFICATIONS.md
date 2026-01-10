# RitualFin — Documento Base do App (V1)

**Idioma:** Português (Portugal - `pt-PT`)
**Moeda:** Euro (€) com formatação PT (ex.: `1.234,56 €`)
**Localização:** Alemanha / Portugal (timezone Europe/Berlin / Europe/Lisbon; semana começa na segunda-feira)
**Escopo V1:** Redesign Premium UI/UX + Dashboard Executivo + Calendário Financeiro + Rituais Financeiros + Gestão de Contas e Orçamentos + Previsão Inteligente.

---

# 1) Diretrizes globais de UI/UX (V1 Premium)

## 1.1 Estética e Componentes
* **Design "Executive-Level":** Minimalista, limpo e extremamente premium.
* **Geometria:** Uso de `rounded-[2.5rem]` em cards principais e contêineres.
* **Tipografia:** Foco na `font-display` (Manrope/Sora) para títulos e `font-sans` para legibilidade.
* **Paleta de Cores:** Verde RitualFin (Emerald/Green), tons de Cinza/Slate para profundidade, e acentos vibrantes para status.
* **Micro-interações:** Hover effects com scale (`hover:scale-[1.02]`), sombras dinâmicas, e transições de opacidade suaves.
* **Layout:** Max-width `7xl`, espaçamento generoso (`gap-10`, `p-10`).

## 1.2 Padrões de Dados e Formatação
* **Moeda:** Sempre `EUR` formatado com `Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })`.
* **Datas:** Formato dia/mês/ano (`DD/MM/YYYY`) ou relativo ("Hoje", "Ontem").
* **Semana:** Início obrigatório na **Segunda-feira**.

---

# 2) Funcionalidades e Telas (Detalhamento V1)

## 2.1 Dashboard Executivo (`/`)
* **TopSummaryRow:** Três cards principais (Saldo em Caixa, Saldo Projetado, Previsão Diária).
* **Sync Status Banner:** Indicador visual de última sincronização/importação.
* **AccountCardsGrid:** Grid de 3 colunas com cards de contas (Credit Card usage UI com barras de progresso).
* **Ritual Insight Card:** Card de IA com mensagem contextual e score de confiança.
* **Quick Review Queue:** Mini-lista de transações pendentes para ação rápida.

## 2.2 Calendário Financeiro (`/calendar`)
* **Layout:** Grid de 7 colunas (Seg-Dom) com side-panel para eventos do dia selecionado.
* **Toolbar:** Controle de mês, botão "Novo evento" e "Recarregar".
* **Visual:** Eventos representados por chips coloridos com valor e status.

## 2.3 Detalhes de Evento (`/calendar/events/[id]`)
* **Hero Card:** Título do evento, valor médio, e frequencia.
* **Timeline de Ocorrências:** Histórico vertical de pagamentos passados.
* **Insights IA:** Análise de variação de preço e tendências.
* **Trend Chart:** Gráfico linear simples mostrando a evolução do gasto neste evento.

## 2.4 Rituais Financeiros (`/rituals`)
* **Tabs:** Diário, Semanal e Mensal.
* **Ritual Cards:** Cards premium com Tempo Estimado, Próxima Execução, e botão "Iniciar".
* **Gamificação:** Badge de "Streak" (sequência de rituais concluídos).

## 2.5 Metas e Previsão (`/goals`)
* **Projeção de Saldo:** Gráfico linear com área preenchida (`gradient-to-t`) mostrando o saldo futuro.
* **Agenda de Pagamentos:** Mini-calendário focado em datas de vencimento.
* **Lista de Próximos Pagamentos:** Cards detalhados com ícone de categoria e data.

## 2.6 Contas e Cartões (`/accounts`)
* **Visual:** Cards com aspeto de "cartão físico", exibindo instituição, saldo atual, e limite disponível.
* **Progresso:** Barras de utilização para cartões de crédito.

## 2.7 Orçamentos (`/budgets`)
* **Monitorização:** Progress bars coloridas baseadas no gasto (Verde < 80%, Laranja 80-100%, Vermelho > 100%).
* **Badges de Status:** "Em Dia", "Atenção", "Excedido".

## 2.8 Histórico de Transações (`/transactions`)
* **Listagem:** Grid densa com data, estabelecimento, valor (positivo/negativo), categoria e Score de IA.
* **Bulk Actions:** Barra flutuante para ações em massa (Classificar, Excluir, Exportar).
* **Transaction Drawer:** Detalhes profundos da transação ao clicar, com visualização de categoria e confiabilidade IA.

## 2.9 Estúdio de Regras IA (`/admin/rules`)
* **Sugestões:** Análise de frequência de termos em transações sem categoria.
* **Simulador:** Teste em tempo real de keywords ("What-if" analysis) para ver impacto antes de salvar.
* **Criação de Regras:** Transformação de simulações em regras oficiais do sistema (Prioridade 950).

## 2.10 Atualizações de Design (Feedback Jan 2026)
* **Visual Geral:**
    - Remover todas as animações de ícones (ex: `animate-spin`, `animate-pulse`). O app deve ser estático e sóbrio.
    - Valores monetários: Simplificar removendo casas decimais em widgets gerais (ex: `1.234 €`). Manter decimais Apenas em tabelas de transações detalhadas.
    - Título do Dashboard: Alterar "Resumo Executivo" para "Dashboard".
* **Widgets Específicos:**
    - **Disponível:** Adicionar barra de progresso visual abaixo do valor para contexto de limite.
    - **Gastos por Categoria:**
        - Filtro de visualização: Top 5 / Top 8 / Todas.
        - Exclusão de "Transferências Internas" (pagamentos de cartão, transferências entre contas) dos cálculos.
        - Ícones: Usar ícones simples representativos, remover "pontos" ou bolinhas abstratas.
        - Drill-down: Permitir clique para expandir hierarquia (Categoria -> L1 -> L2 -> L3 -> Transações).
        - Botão "Revisar": Estilo Gradient Verde (ex: `bg-gradient-to-r from-emerald-500 to-green-600`).
* **Aliases e Logos:**
    - Priorizar sempre a exibição do LOGO do estabelecimento seguido pelo ALIAS (nome fantasia) em todas as listagens.

---

# 3) Lógica de Inteligência Artificial

* **Classificação Automática:** Motor de IA (OpenAI/Regras) atribui categorias com base no `descNorm`.
* **Confidence Engine:** Transações recebem um score (0-100%). Scores baixos (< 90%) são enviados para a fila de revisão (`/confirm`).
* **Insights Preditivos:** IA analisa recorrências para prever valores de contas variáveis (Luz, Água, Salário).

---

# 4) Importação e Processamento

* **Import Preview:** Tela de confirmação com diagnósticos (Novas vs Duplicadas) e grid de pré-visualização antes do persistir no DB.
* **Deduplicação Forensic:** Match por hash de campos (data, valor, descrição, conta) para evitar duplicados.

---

# 5) Configurações (`/settings`)

* **Preferências:** Controle de Idioma (Default: PT-PT) e Moeda (Default: EUR).
* **Gestão de Dados:** Exportação em CSV/JSON e Zona de Perigo para limpeza de dados.
