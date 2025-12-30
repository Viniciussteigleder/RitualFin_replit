# _______________________

User Feedback

---

# 1) Dashboard (visão mensal + curto prazo + categorias + alertas)

## 1.1 Objetivo da tela

- Ser a visão principal para responder, rapidamente:
    - quanto já foi gasto no mês
    - quanto ainda pode ser gasto
    - quais compromissos inevitáveis ainda vão cair
    - como estão as categorias vs orçamento
    - quais são os gastos recentes
- Entregar um “orçamento disponível real”:
    - considera gasto realizado + compromissos projetados
    - evita a falsa sensação de “sobrou” quando já existe obrigação futura

## 1.2 Entradas de dados (o que o dashboard usa)

- Transações importadas (CSV + screenshots), com:
    - data, valor, conta/cartão, receita/despesa
    - categoria (N1–N3/N4), fixo/variável, recorrente, reembolso
    - marcação “Interna” para transferências (excluída de relatórios)
- Orçamento Mensal (por mês selecionado):
    - receita estimada
    - limite por categoria
- Compromissos e recorrências:
    - contas recorrentes (ex.: Netflix)
    - eventos projetados do mês (ex.: fatura do cartão)
- Saldos (manuais/screenshot) e data do último update (quando aplicável)

## 1.3 Saídas esperadas (o que a tela mostra)

- No topo:
    - **Total gasto no mês até agora**
    - **Quanto posso gastar nesta semana**
    - **Quanto posso gastar até o final desta semana**
    - **Quanto posso gastar até o final do mês**
- “Compromissos”:
    - lista/valor total de recorrências e contas que ainda cairão
    - destaque para eventos críticos (fatura do cartão)
- Visão por categorias:
    - gasto do mês por categoria
    - meta/limite da categoria
    - percentual consumido
- Painel de gastos recentes (lado direito)

## 1.4 Requisito central: cálculo de “posso gastar” precisa descontar projeções

- O app deve considerar:
    - o que já foi gasto (realizado)
    - o que é fixo/recorrente e ainda vai acontecer
    - o orçamento mensal (limites por categoria)
- “Interna” não pode distorcer:
    - total gasto, total receita, gráficos e percentuais

## 1.5 Layout e componentes recomendados

- Topo com KPIs (números grandes)
- Bloco “Compromissos/Próximos eventos” com alertas
- Grade/lista de categorias com:
    - gasto, limite, % consumida
- Painel lateral direito com “gastos recentes”
- Seção adicional de “próximos 7–14 dias” sugerindo capacidade por categoria

## 1.6 Resultado esperado

- Você entende em segundos:
    - onde está o mês
    - o que ainda vai cair
    - o que está livre para gastar (real)
    - quais categorias exigem ajuste imediato

---

# 2) Calendário (Mês + Semana) com painel de detalhes

## 2.1 Objetivo da tela

- Visualizar finanças no tempo:
    - passado (realizado) vs futuro (projetado/recorrente)
- Facilitar drill-down:
    - clicar em dia/semana e ver detalhes no painel direito
- Mostrar, no topo:
    - comprometimento do mês e projeção dos próximos 7 dias

## 2.2 Visualização “Mês” (Month View)

### 2.2.1 O que aparece em cada dia

- Dias passados:
    - **Receita em verde**
    - **Despesa em vermelho**
- Dias futuros:
    - valores projetados, especialmente recorrências (Netflix etc.)
    - deve ficar claro que não é realizado

### 2.2.2 Clique em um dia: painel direito

- Abre painel lateral direito com:
    - lista de transações daquele dia
    - separando entradas e saídas (se necessário)
- Para dia futuro:
    - mostrar compromissos/recorrências esperadas e explicar “projetado”

## 2.3 Visualização “Semana” (4 semanas do mês)

- Ao selecionar semana:
    - não mostrar apenas 7 dias
    - mostrar as **4 semanas do mês** como blocos selecionáveis
- Cada semana deve mostrar:
    - total de receitas da semana
    - total de despesas da semana
- Semanas futuras:
    - mostrar recorrências/projeções já conhecidas
    - mostrar “quanto posso gastar naquela semana” (capacidade)

## 2.4 Painel direito: título e função contextual

- Substituir “Próximos Vencimentos” por um título contextual, por exemplo:
    - “Detalhes do Dia” / “Movimentações do Dia” / “Detalhes do Período”
- Regra:
    - se clicar em dia: mostra transações do dia
    - se clicar em semana: mostra resumo da semana, e para semanas futuras, capacidade por categoria

## 2.5 Lista de transações do dia (com ícones)

- Cada item precisa mostrar:
    - merchant (ex.: LIDL)
    - abaixo: categoria
    - indicadores por ícones:
        - fixo/variável
        - recorrente/não recorrente
        - origem (conta/cartão)
- Motivo:
    - leitura rápida sem texto longo

## 2.6 Resultado esperado

- Você vê padrões diários/semanais, entende futuro vs passado,
- e consegue abrir rapidamente detalhes sem sair do calendário.

---

# 3) Upload (CSV + Imagens) com deduplicação e logs

## 3.1 Objetivo da tela

- Importar dados de forma recorrente e confiável
- Evitar duplicidade entre uploads
- Garantir transparência total (histórico + logs detalhados)
- Guiar o fluxo para o próximo passo: revisar transações importadas

## 3.2 Upload CSV (Sparkasse + cartões)

### 3.2.1 Leitura por layout mapeado

- CSVs têm layout definido (por banco/cartão)
- Requisito:
    - mapeamento prévio por fonte
    - parsing robusto e automático

### 3.2.2 Deduplicação

- Upload frequente causa sobreposição
- Requisito:
    - detectar transações já importadas e ignorar duplicatas
    - evitar que apareçam em dobro no app

### 3.2.3 Histórico de uploads

- Lista de todos os uploads com:
    - data/hora
    - conta/cartão
    - status (sucesso/erro)
    - resumo (linhas lidas, importadas, duplicadas, falhas)

### 3.2.4 Log detalhado (debug)

- Log por upload com:
    - layout detectado
    - mapeamento aplicado (colunas → campos)
    - parsing: linhas válidas, inválidas
    - erros (linha/coluna, tipo de erro)
    - relatório de duplicação (quantas e por quê)

## 3.3 Upload de imagens (screenshots)

### 3.3.1 Reconhecimento de conta por layout

- Identificar automaticamente origem do print:
    - Sparkasse / Amex / Miles & More etc.

### 3.3.2 Extração de saldo e transações

- Do print, extrair:
    - saldo naquele momento
    - transações visíveis
- Persistir no banco de dados:
    - saldo com timestamp
    - transações

### 3.3.3 Deduplicação cross-source

- Verificar duplicidade:
    - entre screenshots
    - entre screenshot e CSV

### 3.3.4 Upload em lote

- Permitir upload de várias imagens
- Após processamento, exibir resumo consolidado:
    - quantas imagens reconhecidas
    - quantas falharam
    - quantas transações adicionadas
    - quantas duplicadas ignoradas
    - saldos capturados

## 3.4 Próximo passo orientado

- Após importação:
    - CTA claro: “Revisar transações importadas”
    - direciona para Fila de Confirmação / revisão

## 3.5 Resultado esperado

- Importação frequente sem dor, com rastreabilidade e sem duplicidade.

---

# 4) Tela Transações (listagem + detalhes + edição + transparência)

## 4.1 Objetivo da tela

- Ser o “ledger” completo:
    - todas as transações importadas
    - pesquisa/navegação
    - ajustes e auditoria da categorização

## 4.2 Lista de transações (colunas e UX)

- Mostrar por transação:
    - data
    - conta/cartão via ícone (não texto)
    - ícones para:
        - fixo/variável
        - receita/despesa
        - recorrente/não recorrente
        - reembolso (ícone claro)
    - descrição simplificada (remover ruído como “4691”)
    - categoria (abaixo do merchant)
    - valor:
        - negativo vermelho
        - positivo verde
- Ações:
    - olho (detalhes)
    - pincel (editar)

## 4.3 “Status” (clareza necessária)

- Você pediu definir propósito do status
- Requisito:
    - status deve ser útil operacionalmente, por exemplo:
        - pendente de classificação
        - categorizado automaticamente (alta/baixa confiança)
        - revisado/confirmado
        - possível duplicata
        - recorrência não confirmada
    - Não pode ser um campo sem significado prático.

## 4.4 Detalhes (olho)

- Layout aprovado, com ajustes:
    - não repetir “forma de pagamento” por extenso; o ícone da conta já basta
- Mostrar hierarquia:
    - categoria N1–N3 (ex.: Mercado → Supermercado → Lidl)
- Mostrar explicação:
    - keywords usadas para classificar
    - regra aplicada
- Permitir aprendizado:
    - adicionar novos keywords ali
    - atualizar automaticamente regras futuras

## 4.5 Resultado esperado

- Você confia na classificação e consegue corrigir/treinar o sistema com mínimo esforço.

---

# 5) Tela Regras (Rules Engine com categorias por níveis)

## 5.1 Objetivo da tela

- Definir e manter regras (keywords/expressões) para categorização automática
- Dar controle e governança sobre a taxonomia

## 5.2 Requisito central: categorias por níveis (N1–N3/N4)

- Classificação deve ser hierárquica para permitir mudanças futuras
- Estratégia recomendada:
    - regras apontam para nível específico (N3/N4)
    - N1/N2 podem ser reorganizados no futuro sem recategorizar todo histórico

## 5.3 Funções essenciais

- Gerenciar keywords por categoria:
    - adicionar/remover
    - suportar combinações (AND/OR) e exceções (negative keywords)
- Visualizar árvore completa N1–N4 e editar:
    - renomear, mover, criar, desativar
- Conflitos e prioridade:
    - regras precisam de prioridade e critério de desempate

## 5.4 Transparência e qualidade

- Mostrar impacto da regra antes de aplicar:
    - quantas transações mudariam
- Suportar teste/simulação:
    - colar descrição e ver resultado

## 5.5 Resultado esperado

- Categorização automática consistente e flexível, com governança.

---

# 6) Categoria “Interna” (transferências entre contas, invisível em relatórios)

## 6.1 Objetivo e definição

- Movimentação entre suas próprias contas, ex.:
    - Sparkasse pagando fatura do cartão
- Não é gasto nem receita real (analítico)

## 6.2 Regras de visibilidade

- “Interna” deve:
    - existir no banco de dados e na lista de transações (auditável)
    - ser excluída de relatórios, orçamento e métricas de gasto/receita
- Deve ser reconhecida por keywords (Rules Engine), com alta prioridade

## 6.3 Resultado esperado

- Evita inflar despesas e mantém coerência de saldos e reconciliação.

---

# 7) Orçamento Mensal (o que antes estava como “Metas”)

## 7.1 Objetivo da tela

- Planejamento tático-operacional do mês:
    - receita estimada
    - limites por categoria
    - revisão mensal rápida

## 7.2 Funções

- Selecionar mês
- Definir receita estimada
- Definir limites por categoria
- Sugestões (IA):
    - mostrar gasto mês passado e média 3 meses
    - pré-preencher com média 3 meses para confirmação
- Copiar orçamento do mês anterior

## 7.3 Resultado esperado

- Você configura o mês rapidamente e alimenta cálculos do dashboard/calendário.

---

# 8) Metas (novo módulo separado de orçamento)

## 8.1 Objetivo da tela

- Objetivos estratégicos:
    - sobrar X€/mês para investir
    - juntar X€ até uma data (deadline)

## 8.2 Modelo de dados

- Cada meta precisa de:
    - valor
    - motivo (investir/viagem/compra)
    - tipo:
        - mensal (sobra recorrente)
        - deadline (valor até data)
    - data (deadline ou início/fim)
- Conectar metas ao orçamento via “reserva para metas” (conceito)

## 8.3 Resultado esperado

- Separação clara:
    - metas = destino/resultado
    - orçamento = plano de execução

---

# 9) Rituais Financeiros (semanal e mensal) com calendário e acordos

## 9.1 Objetivo

- Criar um ritual estruturado para casal, sem estresse:
    - revisar gastos
    - alinhar decisões
    - registrar acordos
    - acompanhar no próximo ritual

## 9.2 Setup (agendamento)

- Definir frequência:
    - semanal (ex.: quarta 20:00)
    - mensal
- Notificação:
    - lembrete e “prepare os arquivos para upload”
- Marcar no calendário (evento recorrente)

## 9.3 Ritual semanal

- Revisar semana e situação vs orçamento
- Registrar acordos:
    - reduzir categoria X
    - teto de gasto na próxima semana
- No ritual seguinte:
    - revisar se cumpriu ou não
- IA com insights:
    - padrões de gasto
    - oportunidades de ajuste

## 9.4 Ritual mensal

- Fechamento do mês:
    - visão mês inteiro
    - revisão dos rituais semanais
    - ajustes para próximo mês (orçamento + metas)

## 9.5 Resultado esperado

- Processo contínuo de alinhamento e melhoria, com rastreabilidade.

---

# 10) Tela “Análise Inteligente de Keywords”

- Conforme o texto que você já trouxe (mantido como referência padrão).

---

# 11) Tela Contas (accounts + vencimentos + limite disponível + saldo consolidado)

## 11.1 Objetivo

- Ver contas/cartões conectados (CSV/screenshot, sem Open Finance)
- Entender atualização:
    - último upload
    - transações importadas até qual dia
- Ver saldos atuais e data de atualização
- Calcular “saldo financeiro simulado” (posição líquida)

## 11.2 Requisitos por conta

- Amex e Miles & More:
    - vencimento típico do mês
    - limite – gasto = “quanto ainda posso gastar”
    - saldo/consumo atual + data
- Sparkasse:
    - saldo atual + data

## 11.3 Saldo consolidado (posição líquida)

- Exibir:
    - Sparkasse saldo – (gasto acumulado dos cartões) = saldo líquido
- Motivo:
    - ciclo do cartão ≠ ciclo mensal do app
    - simulação dá a visão “se eu fechasse tudo hoje”

## 11.4 Escalabilidade

- Futuro: PayPal Erika e PayPal Vinícius
- Requisito de escopo:
    - Open Finance fora do escopo agora e no futuro

## 11.5 Resultado esperado

- Você vê em um lugar:
    - atualização, saldos, limites e posição líquida.

---

# 12) Assistente de IA (bolinha AI + painel lateral)

## 12.1 Objetivo

- Permitir perguntas sobre:
    - transações, projeções, recorrências, saldo, tudo do app
- Abrir via botão flutuante no canto inferior esquerdo, com painel no lado direito

## 12.2 Requisito central: entender contexto da tela vs pergunta geral

- IA deve classificar:
    - pergunta contextual (relacionada à tela atual)
    - pergunta global (independente da tela)
- Usar filtros/seleções da tela atual quando contextual fizer sentido

## 12.3 Resultado esperado

- Um “copiloto” que responde rápido e orienta o próximo passo no app.

---

# 13) Ajustes gerais de produto (UI/UX, idioma, clusters no menu, logos)

## 13.1 UX e navegação

- App intuitivo, simples
- Menu lateral esquerdo agrupado por clusters (jornada)
- Responsivo desktop e mobile

## 13.2 Consistência de textos em português (crisp)

- Padronizar títulos entre menu e telas
- Corrigir acentuação (ex.: “Confirmação”)
- Unificar naming (ex.: “Fila de Classificação” vs “Fila de Confirmação”)

## 13.3 Ícones/logos de merchants

- Identificar empresas (Amazon, Temu, Zalando, Netflix etc.) e mostrar ícones
- Baixar uma vez e salvar localmente (cache) para não buscar sempre
- Matching por merchant normalizado

---

# 14) Tela “Confirmar” (Fila de Confirmação / Fila de Classificação)

## 14.1 Objetivo

- Mostrar transações sem categoria (pendentes)
- Acelerar classificação e criação de regras

## 14.2 Bundling (agrupar transações parecidas)

- Agrupar por merchant/padrão:
    - Lidl, TED etc.
- Permitir aplicar categoria em massa
- Idealmente, permitir “salvar keywords” junto para virar regra

## 14.3 Keywords e Key_Desc

- Permitir escrever/ajustar keywords diretamente
- Acesso rápido à descrição completa (Key_Desc):
    - combinação de colunas do upload
    - ajuda a identificar tokens certos e evitar números inúteis

## 14.4 Resultado esperado

- Reduz backlog de “não classificado” com velocidade e melhora o motor de regras.

________

# PRD baseado no User Feedback

# PRD — RitualFin (Final, Refined, Precise)

## 0) Product summary

RitualFin is a desktop-first, mobile-optimized personal finance web app designed for weekly/monthly “financial rituals.” It ingests data via **CSV uploads** and **mobile screenshots** (no Open Finance). Core capabilities: accurate month-to-date spending, reliable future commitments and projections, fast keyword-based categorization, a Confirm Queue to resolve “Unclassified” efficiently, and an AI layer for explainable suggestions and natural-language queries.

---

## 1) Goals and success metrics

### 1.1 Product goals

- Provide **trustworthy** spending and planning views:
    - month-to-date spend, committed obligations, and true available-to-spend.
- Reduce manual effort through:
    - rules-based categorization
    - bulk confirmation/classification
    - AI keyword discovery for remaining gaps
- Make the system debuggable:
    - strict deduplication
    - detailed import logs
    - explainable rule decisions

### 1.2 Success metrics (MVP targets)

- Import success rate: **>95%** jobs succeed.
- Dedup outcome: **0 duplicates** visible after overlapping re-uploads.
- Categorization coverage:
    - **>90%** auto-categorized after initial setup
    - **>98%** after Confirm Queue processing
- Review efficiency: clear a month’s unclassified backlog in **<15 minutes** using bundling.
- Ritual adoption: weekly ritual completed **≥3 times/month**.

---

## 2) Scope boundaries

### 2.1 In-scope

- CSV import for **Sparkasse**, **Amex**, **Miles & More**.
- Screenshot import (batch) to capture:
    - account/card balances
    - visible transactions
- Deduplication across CSV and screenshots.
- Category taxonomy **N1–N3** (no Level 4).
- Rules engine (keywords + expressions + exclusions), **global scope**.
- Confirm Queue for unclassified/low-confidence items, with merchant-based bundling.
- Dashboard, Calendar (month + “4-week selection”), Transactions, Accounts.
- Monthly Budget (Orçamento) separate from Goals (Metas).
- Financial Rituals (weekly + monthly) with structured agreements.
- AI Assistant panel + Intelligent Keyword Analysis.

### 2.2 Out of scope (now and future)

- **Open Finance / bank APIs / PSD2 aggregation**.

---

## 3) Key decisions (locked) — detailed definitions and implications

This section defines the rules that must be applied consistently across ingestion, storage, analytics, and UI. Each decision includes what it means, where it applies, and what must be shown to the user.

### 3.1 Transaction “truth date” (hybrid) — **Authorised for cards, Posting for bank**

**Definition**

- For credit card transactions (Amex, Miles & More):
    - Use **Authorised date** as the primary transaction_date **when available**.
- For Sparkasse (bank account):
    - Use the bank **Posting date** as the transaction_date.

**Why**

- Credit card “authorised” date reflects when spending occurred; posting can lag.
- Bank posting date is typically the stable settlement date.

**Where it applies**

- Calendar day totals and drill-down lists.
- Dashboard month-to-date and “this week” calculations.
- Confirm Queue clustering and filtering by date.
- All reporting and time-based projections.

**UI requirement**

- Transaction details must show both:
    - “Date (used in reporting): …”
    - “Source date: authorised/posting …” when both exist.

**Acceptance criteria**

- The same credit card transaction appears on the date it was authorised, not the later posting date, whenever authorised exists.

---

### 3.2 “Committed” definition — **Recurring + card bill projection + scheduled items**

**Definition**

Committed (Compromissos) for a given month/week includes:

1. **Recurring/fixed obligations** already known (e.g., Netflix).
2. **Card bill projection events** (expected payment of card balances on due dates).
3. Any **scheduled future items** (manual or AI-generated) that are marked as “expected” and have a date.

**What it is not**

- It is not the same as “spent.”
- It is a forward-looking obligation view.

**Where it applies**

- Dashboard “Committed” KPI.
- Dashboard “Available to spend” for:
    - this week
    - until end of week
    - until end of month
- Calendar future day/week projections.

**UI requirement**

- Committed must be explorable:
    - list the top upcoming obligations
    - show next 7 days committed value
    - show card bill expectation (by card) with due date.

**Acceptance criteria**

- If the month has €X in known recurring + €Y expected card payment + €Z scheduled, Committed = X+Y+Z.

---

### 3.3 Internal transfers (“Interna”) treatment — **excluded from analytics totals**

**Definition**

Internal transfers are movements between your own accounts, such as:

- Sparkasse paying Amex/Miles & More bills.
- Transfers between your own accounts (future scenarios).

**Reporting rule**

- Internal transactions are:
    - **visible** in transaction lists and detail views (auditability)
    - **excluded** from:
        - spend totals
        - income totals
        - category spend analytics
        - budget consumption
        - dashboard KPIs “spent” and “available”
        - calendar red/green daily totals (locked behavior)

**Where it applies**

- Dashboard, Budget, Calendar daily totals.
- Category analytics and any aggregated reporting.

**UI requirement**

- Internal should have:
    - a distinct icon/flag
    - explanation on hover/detail: “Internal transfer — excluded from reports.”

**Acceptance criteria**

- A card payment classified as Internal does not change “spent this month” and does not consume any category budget.

---

### 3.4 Confirm Queue bundling logic — **merchant-normalized only**

**Definition**

Bundling groups transactions into a single review unit based on:

- the **normalized merchant key** only (not by account, not by amount).

**Reason**

- Simplifies workflow and maximizes speed in clearing unclassified items.
- Works well with your preference for simplicity and global rules.

**Where it applies**

- Confirm Queue grouping view.
- Intelligent Keyword Analysis clustering may still do more advanced clustering internally, but Confirm Queue bundles are merchant-only.

**UI requirement**

- Bundle card must show:
    - merchant key
    - count of transactions
    - 2–3 example descriptions
    - total amount (optional but useful)

**Acceptance criteria**

- All unclassified “LIDL …” variants appear in one bundle regardless of account.

---

### 3.5 Rules scope — **global only**

**Definition**

Rules apply across the entire dataset:

- no per-account constraints
- no per-time constraints
- no currency constraints (currency is €)

**Implication**

- Matching must rely on robust merchant normalization and stable keyword patterns.
- For rare edge cases, negative keywords can be used to avoid misclassification.

**Acceptance criteria**

- A rule created for a merchant applies whether the transaction came from Sparkasse CSV or card CSV/screenshot.

---

### 3.6 Category depth — **N1–N3 only**

**Definition**

Taxonomy is fixed at 3 levels:

- N1 macro
- N2 domain
- N3 specific

**Implication**

- N3 must be expressive enough to represent stable classification targets (e.g., “Supermercado > Lidl” is N2>N3).
- No location-specific N4 (e.g., “Lidl – Olching”).

**Acceptance criteria**

- UI and rule targets never require N4 fields.

---

### 3.7 Internet enrichment — **only for merchants ≥3 occurrences and on-demand**

**Definition**

External enrichment (web lookup) to infer merchant type (restaurant, pharmacy, etc.) is allowed only when:

- merchant appears **≥3 times**, OR
- user clicks a dedicated “Enrich” button.

**Why**

- Avoid noisy one-off lookups.
- Focus on high-impact merchants.

**UI requirement**

- Clearly mark suggestions derived from enrichment.
- Show short evidence (normalized name/type) and allow accept/reject.

**Acceptance criteria**

- Enrichment never runs automatically for merchants with <3 occurrences unless manually triggered.

---

### 3.8 Merchant icons policy — **public fallback allowed, with attribution stored**

**Definition**

Icons can come from public sources when official assets are unavailable, but:

- origin metadata must be stored (source + date).
- runtime must use local cached assets only.

**Acceptance criteria**

- The app never fetches icons from the internet during normal UI rendering.

---

### 3.9 Balances update method — **screenshot preferred, manual fallback**

**Definition**

Account/card balances are updated via:

- screenshot extraction as the preferred method
- manual entry when screenshot not available

**Acceptance criteria**

- Each balance shows “updated at” timestamp.
- Net position warns if balances are stale.

---

### 3.10 Ritual agreements — **structured**

**Definition**

Weekly/monthly ritual outputs include structured agreements:

- category
- target amount
- timeframe
- status (planned / in progress / achieved / missed)

**Acceptance criteria**

- Next ritual view shows previous agreements with status and outcome.

---

## 4) Information architecture and navigation

- Left menu grouped in clusters:
    - Overview: Dashboard, Calendar
    - Action: Confirm Queue, Transactions
    - Planning: Monthly Budget, Goals
    - Automation: Rules, Intelligent Keyword Analysis
    - Operations: Upload, Accounts
    - Collaboration: Financial Rituals
- Consistent Portuguese naming and accents across menu and H1 titles.
- Remove “lazy mode” badge entirely.

---

## 5) Data ingestion and trust layer

### 5.1 CSV import

- Source-specific mapping (Sparkasse / Amex / Miles & More).
- Normalization:
    - merchant_normalized
    - key_desc (raw combined fields)
- Dedup across all existing transactions.
- Import job history + detailed log.

### 5.2 Screenshot import (batch)

- Account detection by layout.
- Extract:
    - balance snapshot (value + timestamp)
    - visible transactions (with raw, normalized, key_desc)
- Dedup cross-source.
- Batch summary UI.

### 5.3 Deduplication requirements

- Must eliminate duplicates across:
    - repeated CSV uploads
    - repeated screenshot uploads
    - CSV ↔ screenshot overlap
- Must be deterministic and logged.

---

## 6) Functional requirements by module (precise)

### 6.1 Dashboard

- KPIs:
    - spent MTD (excluding Internal)
    - committed (definition 3.2)
    - available-to-spend:
        - this week
        - until end of week
        - until end of month
- Category budget view:
    - spent vs limit, %.
- Recent activity list.
- Alerts:
    - next 7 days recurring obligations
    - expected card bill payments (due date + amount).

### 6.2 Calendar

- Month view:
    - daily income (green) and expense (red) totals excluding Internal
    - click day → right panel day transaction list
    - future days show projected recurring/scheduled items
- Week mode:
    - show 4 weeks as selectable blocks
    - future weeks show projected obligations and available-to-spend
- Right panel title is contextual (not “Próximos Vencimentos”), e.g. “Detalhes do Dia/Período”.

### 6.3 Upload

- CSV upload + history + log viewer.
- Screenshot batch import + batch summary + per-image results.
- Post-import CTA to Confirm Queue or filtered Transactions.

### 6.4 Transactions

- List view with icons:
    - account, fixed/variable, recurring, refund, internal, income/expense
- Merchant display is simplified.
- Detail view:
    - category path N1–N3
    - rule explanation (keywords + rule id/name)
    - add keywords and update rules.
- Status field defined and consistent with Confirm Queue workflow.

### 6.5 Confirm Queue

- Shows unclassified and/or low-confidence items.
- Bundles by merchant-normalized only (3.4).
- Apply category to bundle in one action.
- Add keywords quickly and optionally create/update rule.
- One-click Key_Desc access.

### 6.6 Rules

- Maintain category tree N1–N3 with stable IDs.
- Rules:
    - keywords/expressions, AND/OR, negative keywords
    - priority conflict resolution
    - test mode + impact preview
- Internal category:
    - dedicated patterns to capture card bill payments and transfers
    - excluded from analytics/budgets.

### 6.7 Intelligent Keyword Analysis

- Finds unclassified clusters and proposes:
    - category (prefer N3)
    - keyword candidates + expressions
    - coverage estimate + leakage risk
- Accept/edit/reject actions.
- Enrichment controlled by 3.7.

### 6.8 Accounts

- Account cards show:
    - balances + updated_at
    - last upload timestamp
    - imported_through_date
- Credit cards additionally show:
    - due day
    - limit, used, available-to-spend
- Consolidated net position:
    - Sparkasse balance − card used/outstanding totals
    - warn on stale balances
- Future extensibility for PayPal accounts (still via CSV/screenshot).

### 6.9 Monthly Budget (Orçamento)

- Month selector.
- Income estimate.
- Category limits.
- AI suggestions:
    - last month spend
    - last 3-month average
    - prefill with 3-month average
- Copy previous month budget.

### 6.10 Goals (Metas)

- Create goals with:
    - value, purpose, type (monthly vs deadline), target date, status
- Separate from budget.

### 6.11 Financial Rituals

- Schedule weekly/monthly rituals with reminders (“prepare uploads”).
- Weekly ritual:
    - review vs budget
    - structured agreements (3.10)
    - AI insights on overspend/opportunities
- Monthly ritual:
    - month closing
    - review weekly agreements
    - adjust next month budget and optionally goals.

### 6.12 AI Assistant panel

- Floating AI button opens right drawer (mobile: bottom sheet/full).
- Answers questions using app data:
    - transactions, projections, recurring, balances, budget, goals
- Detects whether question is contextual to current screen vs global and uses current filters accordingly.

### 6.13 Merchant icon registry

- Merchant icon mapping by merchant_normalized key.
- Stored locally; no runtime internet fetch.
- Attribution stored for each icon source.

---

## 7) Acceptance test checklist (system-level)

- Upload overlap test: re-upload same CSV twice → no duplicates.
- Cross-source test: CSV contains a transaction also present in screenshot batch → only one record remains.
- Internal test: card bill payment classified as Internal → does not affect spend/budget/calendar totals.
- Date truth test: card authorised date differs from posting → calendar shows authorised date.
- Confirm Queue test: all “LIDL” variants bundle together → classify once → all updated.
- Rules preview test: before saving a rule update, app shows count of affected transactions.
- Enrichment test: merchant appears twice → no auto-enrichment; appears 3 times → enrichment allowed; on-demand always possible.

---

## 8) Release plan

### v1.0 (trust + classification core)

- CSV upload + logs + dedup
- Transactions list + details + edit
- Rules engine + taxonomy N1–N3 + Internal
- Confirm Queue bundling + Key_Desc
- Accounts (balances, last upload, net position)
- Dashboard (spent/committed/available)

### v1.1 (screenshot + calendar + AI)

- Screenshot batch import
- Calendar month + 4-week mode
- Intelligent Keyword Analysis + controlled enrichment
- AI assistant drawer
- Financial rituals + structured agreements
- Merchant icon registry workflow

---

Proposta de categorias Nivel 1 a Nivel 3

| **Nivel_1_PT** | **Nivel_2_PT** | **Nivel_3_PT** | **Nivel_1_DE** | **Nivel_2_DE** | **Nivel_3_DE** | **Palavras_chave_exemplos** |
| --- | --- | --- | --- | --- | --- | --- |
| Moradia | Casa Olching | Casa Olching – Aluguel (Pago) | Wohnen | Haus Olching | Haus Olching – Miete (Gezahlt) | Schroeder; Monatsmiete; Miete; DAUERAUFTRAG; Dauerauftrag; Mietzahlung; Vermieter; Mietvertrag; Kaltmiete; Warmmiete; Haus Olching; Olching |
| Moradia | Casa Olching | Casa Olching – Energia (Strom) | Wohnen | Haus Olching | Haus Olching – Strom | LichtBlick; LICHTBLICK SE; Abschlag; Strom; Energie; Kunden-Nr.; Kundennr; November; FOLGELASTSCHRIFT; Lastschrift; Einzug; Haus Olching; Olching |
| Moradia | Casa Olching | Casa Olching – Internet/TV/Telefone (Casa) | Wohnen | Haus Olching | Haus Olching – Internet/TV/Telefon (Haus) | Vodafone; Vodafone Deutschland; meinkabel; Kabel; Internet; K-NR.; Kd-Nr; Rechnung online; FOLGELASTSCHRIFT; Lastschrift; Haus Olching; Olching; DSL |
| Moradia | Casa Olching | Casa Olching – Nebenkosten/Condomínio | Wohnen | Haus Olching | Haus Olching – Nebenkosten/Hausgeld | Nebenkosten; NK; Hausgeld; WEG; Hausverwaltung; Betriebskosten; Abrechnung; Vorauszahlung; Nachzahlung; Jahresabrechnung; Wohneinheit; Umlage |
| Moradia | Casa Olching | Casa Olching – Manutenção e Reparos | Wohnen | Haus Olching | Haus Olching – Instandhaltung & Reparaturen | Handwerker; Reparatur; Instandhaltung; Wartung; Notdienst; Rechnung; Service; Hausmeister; Sanitär; Elektro; Maler |
| Moradia | Casa Olching | Casa Olching – Materiais e Compras para Casa | Wohnen | Haus Olching | Haus Olching – Materialien & Hausbedarf | Baumarkt; OBI; HORNBACH; Bauhaus; Toom; Material; Baustoff; Farbe; Schrauben; Werkzeug; Garten; Renovierung |
| Moradia | Casa Olching | Casa Olching – Impostos e Taxas (Imóvel) | Wohnen | Haus Olching | Haus Olching – Steuern & Abgaben (Immobilie) | Grundsteuer; Gemeinde; Stadt; Steueramt; Abgaben; Bescheid; Haus Olching; Olching; Eigentum; Finanzamt; Müllgebühren |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Aluguel (Recebido) | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Miete (Erhalten) | Dr. David Mueller; David Mueller; Miete; Miete incl; Nebenkosten; GUTSCHR. UEBERW; GUTSCHRIFT; DAUERAUFTR; Dauerauftrag; Knielingen; Karlsruhe; Mietzahlung |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Financiamento | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Finanzierung | Commerzbank; COMMERZBANK AG; LEISTUNGEN PER; Tilgung; Zinsen; AZ; IBAN DE22; IBAN DE92; FOLGELASTSCHRIFT; Lastschrift; Darlehen; Kredit; Haus Karlsruhe |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Nebenkosten/WEG/Hausverwaltung | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Nebenkosten/WEG/Hausverwaltung | WEG loswohnen; WEG Loswohnen 2; Hausgeld; HG Vorauszahlung; Abrechnung; Jahresabrechnung; Nachzahlung; Wohneinheit; Eggensteiner Str; Karlsruhe; FOLGELASTSCHRIFT; ONLINE-UEBERWEISUNG |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Aquecimento/Fernwärme | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Heizung/Fernwärme | KES; Karlsruher Energieservice; Energieservice; Fernwärme; Heizung; Wärme; V 2004774510; BEL; VK; Abschlag; GUTSCHR. UEBERWEISUNG; Rechnung; Karlsruhe |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Energia/Água (Utilidades) | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Energie/Wasser (Nebenkosten) | Stadtwerke; Wasser; Abwasser; Strom; Gas; Energie; Abschlag; Zähler; Verbrauch; Karlsruhe; Einzug; Lastschrift; Rechnung |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Internet/TV (Imóvel) | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Internet/TV (Immobilie) | Vodafone; Telekom; 1&1; O2; Internet; Kabel; DSL; Router; Haus Karlsruhe; Karlsruhe; Lastschrift; Rechnung |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Manutenção e Reparos | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Instandhaltung & Reparaturen | Handwerker; Reparatur; Instandhaltung; Wartung; Hausmeister; Service; Rechnung; Baumarkt; Renovierung; Karlsruhe; Knielingen; Material |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Impostos e Taxas (Imóvel) | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Steuern & Abgaben (Immobilie) | Grundsteuer; Finanzamt; Stadt Karlsruhe; Gemeinde; Steuer; Abgaben; Bescheid; Müllgebühren; Straßenreinigung; Haus Karlsruhe; Karlsruhe |
| Moradia | Casa Esting | Casa Esting – Financiamento | Wohnen | Haus Esting | Haus Esting – Finanzierung | R+V; R + V; R+V LEBENSVERSICHERUNG; DARLEHEN; Darlehen 20016850601; ZINSEN; Tilgung; V.Steigleder; DARLEHENSABSCHLUSS; IBAN DE207016946; FOLGELASTSCHRIFT |
| Moradia | Casa Esting | Casa Esting – Materiais e Obras (Construção) | Wohnen | Haus Esting | Haus Esting – Baumaterial & Bauarbeiten | Baustelle; Bau; Bauunternehmen; Handwerker; Material; Baustoff; Rechnung; Esting; Neubau; Ausbau; Elektrik; Sanitär; Rohbau; Innenausbau |
| Moradia | Casa Esting | Casa Esting – Serviços (Projetos/Arquitetura/Admin) | Wohnen | Haus Esting | Haus Esting – Dienstleistungen (Planung/Verwaltung) | Architekt; Statik; Vermesser; Bauamt; Genehmigung; Planung; Projekt; Gutachten; Gebühren; Esting; Rechnung; Honorar |
| Moradia | Casa Esting | Casa Esting – Utilidades (Provisório/Construção) | Wohnen | Haus Esting | Haus Esting – Versorger (Bau/Provisorium) | Baustrom; Baustellenstrom; Wasseranschluss; Bauwasser; Netzbetreiber; Anschluss; Zähler; Esting; Abschlag; Rechnung; Einzug |
| Moradia | Casa Esting | Casa Esting – Manutenção e Reparos | Wohnen | Haus Esting | Haus Esting – Instandhaltung & Reparaturen | Reparatur; Wartung; Service; Handwerker; Esting; Rechnung; Mangel; Gewährleistung; Nachbesserung; Bauleistung |
| Alimentação | Supermercado e Mercearia | Supermercado – REWE/Lidl/Edeka/Netto/Aldi | Essen | Supermarkt & Lebensmittel | Supermarkt – REWE/Lidl/Edeka/Netto/Aldi | REWE; REWE 0887; REWE MARKT; REWE Markt GmbH; LIDL; Lidl sagt Danke; EDEKA; EDEKA OLCHING; Netto Marken-Discount; NETTO; ALDI; ALDI SUED; Norma; contactless; retail-store |
| Alimentação | Supermercado e Mercearia | Supermercado – Outros/Mercados especiais | Essen | Supermarkt & Lebensmittel | Supermarkt – Sonstige/Spezialmärkte | Asia Markt; Asia Markt Olching; NATURKOSTINSEL; Naturkost; Fruchtwerk; FRUCHTWERK E.K.; Bio; Feinkost; Markt; Lebensmittel; grocery; retail-store; contactless |
| Alimentação | Padaria e Café | Padaria/Café – Ihle/Wünsche e similares | Essen | Bäckerei & Café | Bäckerei/Café – Ihle/Wünsche u.ä. | Landbaeckerei Ihle; Bäckerei Ihle; Backstube Wuensche; Wuensche; Privat Baeckerei; BÄCKEREI; Konditorei; Peter s gute Backstube; bakery; Kaffee; contactless; retail-store |
| Alimentação | Padaria e Café | Padaria/Café – Outros | Essen | Bäckerei & Café | Bäckerei/Café – Sonstige | Baeckerei Nussbaum; Wimme; Backstube; Café; Konditorei; Snack; Brötchen; Croissant; To-go; contactless; retail-store; QSR |
| Alimentação | Restaurantes e Alimentação fora | Restaurante – Geral | Essen | Restaurant & Auswärtsessen | Restaurant – Allgemein | Restaurant; Ristorante; Pizzeria; Steakhouse; Gaucho Steakhouse; Bei Rosario; La Burrita; KatNi Asia Bistro; Five Guys; Pret A Manger; UZR*Ristorante; QSR |
| Alimentação | Restaurantes e Alimentação fora | Fast-food – McDonald’s e similares | Essen | Restaurant & Auswärtsessen | Fast-Food – McDonald’s u.ä. | MCDONALDS; MCDONALDS1741; McDonalds Fil.; Burger; BK; Burger King; Pizza Hut; QSR; Drive; contactless; Processed; Authorised |
| Alimentação | Bebidas e Especialidades | Bebidas – Vinhos/Loja especializada | Essen | Getränke & Spezialitäten | Getränke – Wein/Fachhandel | Weintreff; Weintreff Zom Hasatanz; Vinothek; Getränkemarkt; Wein; Spirits; Edeka Getränke; retail-store; contactless; Processed |
| Alimentação | Refeição no trabalho | Almoço – Bosch | Essen | Essen bei der Arbeit | Mittagessen – Bosch | Bosch; Mittag; Lunch; Almoco; almoço; FRUCHTWERK; Kantine; Mensa; Business Lunch; weekday; Processed; retail-store |
| Compras & Estilo de Vida | Compras online & marketplace | Marketplace – Amazon | Konsum & Lifestyle | Online-Käufe & Marktplätze | Marktplatz – Amazon | AMAZON; AMZN; AMZN MKTP; AMZN Mktp; AMZN.COM/BILL; AMAZON.DE; AMAZON PRIM*; AMZN MKTP DE*; e-commerce; Authorised; Processed; 800-279-6620 |
| Compras & Estilo de Vida | Compras online & marketplace | Marketplace – Temu | Konsum & Lifestyle | Online-Käufe & Marktplätze | Marktplatz – Temu | TEMU; TEMU.COM; TEMU.COM DUBLIN; temu*; reembolso; refund; Rückerstattung; e-commerce; DUBLIN 2; Processed; Authorised |
| Compras & Estilo de Vida | Compras online & marketplace | Loja online – Zalando | Konsum & Lifestyle | Online-Käufe & Marktplätze | Online-Shop – Zalando | ZALANDO; [WWW.ZALANDO.DE](http://www.zalando.de/); ZALANDO.DE; Berlin; zalando*; fashion; e-commerce; Processed; Authorised |
| Compras & Estilo de Vida | Compras online & marketplace | Pagamentos online – PayPal (Compras) | Konsum & Lifestyle | Online-Käufe & Marktplätze | Online-Zahlung – PayPal (Einkäufe) | PAYPAL ; PayPal; PP.; Ihr Einkauf bei; purchase; compra; e-commerce; -GUTSCHR; -GUTSCHRIFT; -REFUND; -Rückerstattung; 4029357733 |
| Compras & Estilo de Vida | Lojas para casa & utilidades | Casa – TEDi/lojas de utilidades | Konsum & Lifestyle | Haushalt & Einrichtung | Haushalt – TEDi/Discounter | TEDI; TEDI FIL.; FIL. 4534; FIL. 5385; OLCHING; BERGKIRCHEN; Deko; Haushaltswaren; discount; retail-store; contactless; Processed |
| Compras & Estilo de Vida | Vestuário & calçados | Roupas – Geral (H&M/About You/Hollister etc.) | Konsum & Lifestyle | Kleidung & Schuhe | Kleidung – Allgemein (H&M/About You/Hollister etc.) | HM.COM; H&M; ABOUT YOU; Hollister; C & A; C&A; NKD; Mode; clothing; apparel; e-commerce; deposit; refund; Processed; Authorised |
| Compras & Estilo de Vida | Vestuário & calçados | Esportes/roupa esportiva – Decathlon | Konsum & Lifestyle | Kleidung & Schuhe | Sportartikel – Decathlon | DECATHLON; Decathlon Deutschland; Sport; sportswear; contactless; Authorised; Processed; retail-store |
| Compras & Estilo de Vida | Higiene & drogaria | Drogaria – DM | Konsum & Lifestyle | Drogerie & Körperpflege | Drogerie – DM | DM; DM-DROGERIE; DM-DROGERIE MARKT; Drogeriemarkt; d2gl; 1557; 1681; Bergkirchen; Memmingen; retail-store; contactless; Processed |
| Compras & Estilo de Vida | Higiene & drogaria | Drogaria – Rossmann | Konsum & Lifestyle | Drogerie & Körperpflege | Drogerie – Rossmann | ROSSMANN; Rossmann 4032; Rossmann Olching; Drogerie; Körperpflege; contactless; Processed; retail-store; Fil. |
| Compras & Estilo de Vida | Higiene & drogaria | Drogaria/Perfumaria – Müller | Konsum & Lifestyle | Drogerie & Körperpflege | Drogerie/Parfümerie – Müller | MUELLER; MUeLLER; MUELLER 1500; Müller Olching; Parfümerie; Drogerie; contactless; Processed; retail-store |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – Apple (iCloud/App Store) | Konsum & Lifestyle | Digitale Abos & Software | Abo – Apple (iCloud/App Store) | APPLE.COM/BILL; Apple iCloud; iCloud; App Store; apple.com; billing; assinatura; subscription; e-commerce; retail-store; Processed; Authorised |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – Google One/Google | Konsum & Lifestyle | Digitale Abos & Software | Abo – Google One/Google | GOOGLEGOOGLE ONE; Google One; GOOGLE ONE; assinatura; subscription; e-commerce; Processed; Authorised; Google; Drive; storage |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – Netflix | Konsum & Lifestyle | Digitale Abos & Software | Abo – Netflix | NETFLIX; NETFLIX.COM; Netflix.com; assinatura; subscription; streaming; e-commerce; Processed; Authorised; NETFLIX.COM NETFLIX.COM |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – Disney+ | Konsum & Lifestyle | Digitale Abos & Software | Abo – Disney+ | DisneyPlus; Disney+; DISNEY PLUS; Ihr Einkauf bei DisneyPlus; PayPal; PP.; streaming; assinatura; subscription; FOLGELASTSCHRIFT; Lastschrift |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – YouTube Premium | Konsum & Lifestyle | Digitale Abos & Software | Abo – YouTube Premium | YouTube Premiu; YouTube Premium; GOOGLE YouTube; GOOGLE; assinatura; subscription; e-commerce; Processed; Authorised |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – OpenAI (ChatGPT) | Konsum & Lifestyle | Digitale Abos & Software | Abo – OpenAI (ChatGPT) | OPENAI *CHATGPT; CHATGPT SUBSCR; OpenAI; compra internacional; USD; e-commerce; Processed; Authorised; subscription; assinatura; foreign |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – Claude.ai | Konsum & Lifestyle | Digitale Abos & Software | Abo – Claude.ai | CLAUDE.AI; Claude AI; CLAUDE.AI SUBSCRIPTION; e-commerce; Processed; subscription; assinatura; AI |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – ElevenLabs | Konsum & Lifestyle | Digitale Abos & Software | Abo – ElevenLabs | ELEVENLABS; ELEVENLABS.IO; elevenlabs.io; e-commerce; Processed; compra internacional; USD; subscription; assinatura |
| Compras & Estilo de Vida | Pets | Pets – Alimentação e acessórios | Konsum & Lifestyle | Haustiere | Haustiere – Futter & Zubehör | Fressnapf; Tiernahrungs; Tiernahrung; Haustier; pet; Futter; Zubehör; retail-store; Processed |
| Compras & Estilo de Vida | Esportes & Fitness | Academia – Hommer Fitness (Olching) | Konsum & Lifestyle | Sport & Fitness | Fitnessstudio – Hommer Fitness (Olching) | Hommer Fitness; cfOlching; RED LABEL; Schueler Studenten Azubis; OLC--; Offline; FOLGELASTSCHRIFT; Lastschrift; Fitness; Gym; Mitgliedschaft |
| Compras & Estilo de Vida | Esportes & Fitness | Artes marciais – BJJ/treinos | Konsum & Lifestyle | Sport & Fitness | Kampfsport – BJJ/Training | BJJ Ausbildung; Julian Fazekas-Con; Fazekas; Dachau; JJ David; Event; Mitglied; FOLGELASTSCHRIFT; Lastschrift; Training; Dojo |
| Compras & Estilo de Vida | Presentes & Festas | Presentes – Geral | Konsum & Lifestyle | Geschenke & Feiern | Geschenke – Allgemein | Geschenk; Present; Gutschein; Wuensche; Wünsche; Geburtstag; Party; Feier; Ticket; Souvenir; retail-store; e-commerce |
| Mobilidade | Carro | Carro – Combustível/Posto | Mobilität | Auto | Auto – Kraftstoff/Tankstelle | Tankstelle; Q1; Q1 REWE TANKSTELLE; Esso; Shell; Aral; Total; OMV; Benzin; Diesel; Kraftstoff; fueling; contactless |
| Mobilidade | Carro | Carro – Seguro | Mobilität | Auto | Auto – Versicherung | DEVK; DEVK Allgemeine; Kfz-Versicherung; Kfz Versicherung; Kennzeichen; FFB FA; Versicherung Nr; Beitrag; Einzug; Lastschrift; FOLGELASTSCHRIFT |
| Mobilidade | Carro | Carro – Estacionamento/Pedágio | Mobilität | Auto | Auto – Parken/Maut | Handyparken; HANDYPARKEN; Parkhaus; Parkhausbet; Parkschein; Parkplatz; Parking; Maut; TFL; contactless; Processed |
| Mobilidade | Carro | Carro – Multas/Infrações | Mobilität | Auto | Auto – Bußgeld/Verstöße | Stadt Mannheim; Bußgeld; Ordnungswidrigkeit; Strafzettel; Verwarnung; Aktenzeichen; online-ueberweisung; Rechnung; Verkehrsordnungswidrigkeit |
| Mobilidade | Transporte público | Transporte – MVV/Ônibus/Trem | Mobilität | Öffentlicher Verkehr | ÖPNV – MVV/Bus/Bahn | MVV; PAYPAL *MVV; Ticket; Monatskarte; Bahn; DB; Abellio; TFL TRAVEL; Oyster; Bus; Tram; ÖPNV; e-commerce; retail-store |
| Saúde & Seguros | Saúde | Médico/Clínica – PVS/consultas | Gesundheit & Versicherungen | Gesundheit | Arzt/Praxis – PVS/Behandlungen | PVS bayern; PVS Bayern GmbH; Rechnung; Rechnungsnr; Arzt; Praxis; Behandlung; ONLINE-UEBERWEISUNG; Medico; consulta; Gebühr |
| Saúde & Seguros | Saúde | Dentista/Ortodontia | Gesundheit & Versicherungen | Gesundheit | Zahnarzt/Kieferorthopädie | Kinderzahnheilkunde; Gemeinschaftspraxis; Zahn; Zahnarzt; Rechnungsnummer; Rechnungsnr; ONLINE-UEBERWEISUNG; Dental; KFO |
| Saúde & Seguros | Saúde | Farmácia | Gesundheit & Versicherungen | Gesundheit | Apotheke | Apotheke; APOTHEKE; APOTHEKE CENTER; ROSEN-APOTHEKE; Rezept; Pharma; Medikament; Arznei; contactless; retail-store; Processed |
| Saúde & Seguros | Saúde | Ótica e óculos (Compra) | Gesundheit & Versicherungen | Gesundheit | Optik & Brille (Kauf) | Apollo Optik; APOLLO OPTIK; Optik; Brille; Kontaktlinsen; Sehtest; contactless; retail-store; Processed; Authorised |
| Saúde & Seguros | Seguros | Seguro saúde – AOK | Gesundheit & Versicherungen | Versicherungen | Krankenversicherung – AOK | AOK; AOK Baden-Wuerttemberg; EINZUG BEITRAG; Beitrag; Krankenversicherung; FOLGELASTSCHRIFT; Lastschrift; LS WIEDERGUTSCHRIFT; Rückgabe Lastschrift |
| Saúde & Seguros | Seguros | Seguros – DEVK (Vida/Residencial/RC/Legal) | Gesundheit & Versicherungen | Versicherungen | Versicherungen – DEVK (Leben/Haftpflicht/Rechtsschutz etc.) | DEVK; Lebensversicherungsverein; DEVK Riehlerstrasse; Hausrat; Haftpflicht; Rechtsschutz; Leben; Haushaltglas; Beitrag; FOLGELASTSCHRIFT; Erstattung Rücklastschriftgebühren |
| Saúde & Seguros | Seguros | Seguro vida/financiamento – R+V | Gesundheit & Versicherungen | Versicherungen | Lebensversicherung/Finanzierung – R+V | R+V; R + V; Lebensversicherung; Darlehen; Zinsen; Tilgung; Beitrag; FOLGELASTSCHRIFT; Lastschrift |
| Educação & Crianças | Escola & taxas | Escola – Gymnasium Olching (Taxas/viagens/licenças) | Bildung & Kinder | Schule & Gebühren | Schule – Gymnasium Olching (Gebühren/Fahrten/Lizenzen) | Freistaat Bayern Gymnasium Olching; Gymnasium Olching; EPZ-; Schullandheim; Oberammergau; iPad-Jamf; Lizenz; bitte anweisen; ONLINE-UEBERWEISUNG; TERM. |
| Educação & Crianças | Benefícios família | Benefício – Kindergeld | Bildung & Kinder | Familienleistungen | Leistung – Kindergeld | Familienkasse; Bundesagentur fuer Arbeit; Kindergeld; KG; GUTSCHR. UEBERWEISUNG; Überweisung; Familienkasse; Zahlungseingang |
| Educação & Crianças | Atividades | Atividades – Cursos/clubes (Crianças) | Bildung & Kinder | Aktivitäten | Aktivitäten – Kurse/Vereine (Kinder) | Kurs; Verein; Beitrag; Anmeldung; Training; Musikschule; Sportverein; Mitgliedschaft; Teilnahmegebühr; Rechnung; Lastschrift |
| Lazer & Viagens | Viagens | Viagens – Hotéis | Freizeit & Reisen | Reisen | Reisen – Hotels | Hotel; Hilton; HILTON HOTELS; Novotel; NOVOTEL; Sheraton; SHERATON; booking; lodging; Aufenthalt; Processed; Authorised |
| Lazer & Viagens | Viagens | Viagens – Aluguel de carro (Car rental) | Freizeit & Reisen | Reisen | Reisen – Mietwagen | Hertz; HERTZ CAR RENTAL; car rental; Mietwagen; airport; travel; reservation; Processed; Authorised |
| Lazer & Viagens | Viagens | Viagens – Transferências internacionais (Wise/TransferWise) | Freizeit & Reisen | Reisen | Reisen – Internationale Transfers (Wise/TransferWise) | Wise; TRANSFERWISE; WISE; transferência; transferencia; envio; remessa; e-commerce; Processed; -internal; -interno |
| Lazer & Viagens | Entretenimento & eventos | Eventos – Ingressos/Tickets | Freizeit & Reisen | Freizeit & Events | Events – Tickets/Eintritt | Muenchen Ticket; München Ticket; LOGMVV; TICKETSHOP; Ticket; Eintritt; Konzert; Event; e-commerce; Processed; Authorised |
| Lazer & Viagens | Entretenimento & eventos | Lazer – Compras/serviços não essenciais | Freizeit & Reisen | Freizeit & Events | Freizeit – Sonstige Ausgaben | Freizeit; Spaß; Hobby; Spiel; Spielzeug; Entertainment; Bowling; Kino; Veranstaltung; retail-store; e-commerce |
| Interna | Pagamento de cartões | Pagamento – Amex (Liquidação/Fatura) | Finanzen & Transfers | Intern | Zahlung – Amex (Ausgleich/Abrechnung) | AMERICAN EXPRESS EUROPE; AMERICAN EXPRESS EUROPE S.A.; AXP; pagamento Amex; FOLGELASTSCHRIFT; EINMAL LASTSCHRIFT; ZAHLUNG ERHALTEN; ÜBERWEISUNG ERHALTEN; LS WIEDERGUTSCHRIFT; Representation |
| Interna | Pagamento de cartões | Pagamento – Miles & More / DKB (Liquidação) | Finanzen & Transfers | Intern | Zahlung – Miles & More / DKB (Ausgleich) | DEUTSCHE KREDITBANK; DKB; KREDITKARTENABRECHNUNG; Lufthansa Miles & More; ABRECHNUNG; pagamento M&M; Lastschrift; direct-debit; Sparkasse; DE98DKB |
| Finanças & Transferências | Transferências & Pix/PayPal | Transferência – PayPal (Top-up/withdraw) | Finanzen & Transfers | Überweisungen & PayPal | Transfer – PayPal (Auf-/Auszahlung) | PayPal Europe; PAYPAL; INSTANT TRANSFER; ECHTZEIT-GUTSCHRIFT; ABBUCHUNG VOM PAYPAL-KONTO; PP.; GUTSCHR. UEBERWEISUNG; Luxembourg; LU947510; LU897510 |
| Finanças & Transferências | Saque em dinheiro | Saque – Caixa eletrônico (Sparkasse/ATM) | Finanzen & Transfers | Bargeld | Bargeldabhebung – Geldautomat (Sparkasse/ATM) | BARGELDAUSZAHLUNG; GELDAUTOMAT; GA NR; SPARKASSE FUERSTENFELDBRUCK; OLCH-NORD; WESTSTADT; Debitk.; Karte; Abhebung; Bargeld; ATM |
| Finanças & Transferências | Taxas & juros | Taxas bancárias – Sparkasse | Finanzen & Transfers | Gebühren & Zinsen | Bankgebühren – Sparkasse | ENTGELTABSCHLUSS; Entgeltabrechnung; Entgelt; Gebühren; Kontoentgelt; Preis; Anlage; Sparkasse; Buchungsposten; -Zinsen |
| Finanças & Transferências | Taxas & juros | Juros/câmbio – Taxa internacional (1,95%) | Finanzen & Transfers | Gebühren & Zinsen | Auslandseinsatz/Wechselkursgebühr (1,95%) | 1,95% für Währungsumrechn; foreign-trx-fee; Auslandseinsatz; Währungsumrechnung; FX fee; compra internacional; USD; GBP; BRL; Processed; M&M |
| Finanças & Transferências | Taxas & juros | Mensalidade cartão – Miles & More | Finanzen & Transfers | Gebühren & Zinsen | Kartenentgelt – Miles & More | monatlicher Kartenpreis; product-fee; Kartenpreis; Monatsgebühr; Gebühr; Miles & More; M&M; Processed; -foreign-trx-fee |
| Finanças & Transferências | Taxas & juros | Taxas – Devolução/Retorno de débito (Chargeback/Lastschrift) | Finanzen & Transfers | Gebühren & Zinsen | Gebühren – Rücklastschrift/Retour (Chargeback) | RETOURNIERTE LASTSCHRIFT; Rückgabe Lastschrift; RECHNUNG Rückgabe; Gebühren für retournierte Lastschrift; Rücklastschriftgebühren; Representation; Chargeback; Erstattung; -Miete; -Strom |
| Finanças & Transferências | Dívidas & crédito | Crédito pessoal – ING DiBa (Rahmenkredit) | Finanzen & Transfers | Kredite & Schulden | Privatkredit – ING DiBa (Rahmenkredit) | ING-DiBa; Rahmenkredit; Tilgung; Zinsen; FOLGELASTSCHRIFT; Lastschrift; Kredit; Darlehen; 10/2025; DE65ING |
| Finanças & Transferências | Dívidas & crédito | Financiamento varejista – Apollo Optik (Parcelamento) | Finanzen & Transfers | Kredite & Schulden | Händlerfinanzierung – Apollo Optik (Raten) | Apollo-Optik Holding; Apollo-Optik; DP25-; FOLGELASTSCHRIFT; Lastschrift; Rechnung; Amsterdam; NL48ZZZ; Raten; Finanzierung |
| Finanças & Transferências | Dívidas & crédito | Empréstimo recebido – Targobank | Finanzen & Transfers | Kredite & Schulden | Kredit-Auszahlung – Targobank | TARGOBANK; INTERNET TARGOBANK; VIELEN DANK; GUTSCHR. UEBERWEISUNG; Auszahlung; Kredit; Darlehen; Vertrag; 0000728540; VINICIUS STEIGLEDER |
| Trabalho & Receitas | Salário | Salário – Vinicius (Bosch) | Arbeit & Einnahmen | Gehalt | Gehalt – Vinicius (Bosch) | Robert Bosch GmbH; LOHN GEHALT; Entgelt; Gehalt; Payroll; Gerlingen-Schillerhoehe; Entgelt 71336818; 10.2025; Überweisung; Gutschrift |
| Trabalho & Receitas | Salário | Salário – Erica (Transferência) | Arbeit & Einnahmen | Gehalt | Gehalt – Erica (Überweisung) | Fernanda Mendonca Finato; Julia Behr; GUTSCHR. UEBERWEISUNG; Gehalt; salário; pagamento; transferência; credit; Überweisung |
| Trabalho & Receitas | Receita profissional | Receita profissional – Clientes (PayPal/Überweisung) | Arbeit & Einnahmen | Selbstständig | Selbstständige Einnahmen – Kunden (PayPal/Überweisung) | Bianca De Freitas Lima; PAYPAL *biancaflima; PayPal; GUTSCHR. UEBERWEISUNG; Überweisung; invoice; serviço; atendimento; client; -refund; -Rückerstattung |
| Trabalho & Receitas | Vendas online | Vendas online – Vinted/Mangopay | Arbeit & Einnahmen | Online-Verkäufe | Online-Verkäufe – Vinted/Mangopay | Mangopay; Vinted; GUTSCHR. UEBERWEISUNG; Verkauf; venda; marketplace; AWV-MELDEPFLICHT; Rue du Fort Wallis; FR5221933; payout; Erlös |
| Trabalho & Receitas | Aluguel e rendas | Renda – Aluguel (Karlsruhe) | Arbeit & Einnahmen | Mieten & Pachten | Mieteinnahmen – Karlsruhe | Dr. David Mueller; Miete; Nebenkosten; Dauerauftrag; GUTSCHR. UEBERW. DAUERAUFTR; Karlsruhe; Knielingen; Mieteinnahme; Zahlungseingang |
| Doações & Outros | Doações/associações | Doação/Associação – Projeto social | Spenden & Sonstiges | Spenden/Vereine | Spende/Verein – Sozialprojekt | PAYPAL *BRUEDERLICH; BOG Mitglied; Mitglied; Beitrag; Spende; doação; donation; Verein; e-commerce; PayPal; -refund |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Financiamento | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Finanzierung | Darlehen; Finanzierung; Hypothek; Kredit; Tilgung; Zinsen; FOLGELASTSCHRIFT; Lastschrift; -Commerzbank; -R+V; -Haus Olching; -Haus Karlsruhe; -Haus Esting |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Nebenkosten/Condomínio | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Nebenkosten/Hausgeld | Nebenkosten; NK; Hausgeld; WEG; Hausverwaltung; Abrechnung; Vorauszahlung; Nachzahlung; Jahresabrechnung; Wohneinheit; Umlage; -loswohnen |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Utilidades | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Versorger | Strom; Gas; Wasser; Heizung; Fernwärme; Abschlag; Energie; Versorger; Rechnung; Lastschrift; Einzug; -Vodafone; -LichtBlick; -KES |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Manutenção/Reparos | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Instandhaltung/Reparaturen | Handwerker; Reparatur; Instandhaltung; Wartung; Service; Rechnung; Material; Notdienst; Hausmeister; Sanitär; Elektro; -Baumarkt |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Materiais/Obras | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Materialien/Bau | Baustoff; Material; Bau; Baustelle; Renovierung; Ausbau; Handwerker; Rechnung; Lieferung; Montage; Projekt; -TEDI; -Amazon |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Aluguel | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Miete | Miete; Monatsmiete; aluguel; rent; Dauerauftrag; DAUERAUFTRAG; Vermieter; Mieter; Nebenkosten; Kaltmiete; Warmmiete; -Schroeder; -David Mueller |
| Revisão & Não Classificado | Transferências pessoais | Transferência – Família/Amigos | Prüfung & Unkategorisiert | Private Transfers | Überweisung – Familie/Freunde | ONLINE-UEBERWEISUNG; GUTSCHR. UEBERWEISUNG; Überweisung; Te amo; Diogo Rodrigues Steigleder; Marion Schanz; Rechnung; IBAN; Sparkasse -; -PayPal; -LOHN GEHALT |
| Revisão & Não Classificado | Despesa não identificada | Despesa – Comerciante não identificado (Revisão) | Prüfung & Unkategorisiert | Unklare Ausgaben | Ausgabe – Händler unklar (Prüfung) | retail-store; e-commerce; contactless; Authorised; Processed; Rechnung; Verwendungszweck; Händler; merchant; -BARGELDAUSZAHLUNG; -KREDITKARTENABRECHNUNG |
| Revisão & Não Classificado | Receita não identificada | Receita – Entrada não identificada (Revisão) | Prüfung & Unkategorisiert | Unklare Einnahmen | Einnahme – Eingang unklar (Prüfung) | GUTSCHR. UEBERWEISUNG; Gutschrift; Zahlungseingang; credit; Überweisung; deposit; Erstattung; -Kindergeld; -LOHN GEHALT; -Miete |

________
