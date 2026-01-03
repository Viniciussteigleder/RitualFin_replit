# Missing and New Features Plan (Sprint-Ready)

This plan aligns with backend readiness and splits items into quick wins vs dependency-bound work.

Legend
- Estimate: S (0.5–1d), M (2–4d), L (5–8d)
- Owner: FE, BE, Design, QA, PM
- Backend Ready: Yes/No

## Quick Wins (Backend Ready)

### Ticket QW-01: Upload Errors UI + Format Detected
- Backend Ready: Yes (upload_errors endpoint exists)
- Owner: FE, Design, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Call GET `/api/uploads/:id/errors` on demand.
  2) Store error rows in local state for modal display.
- UX/UI
  1) Add \"Formato\" badge per upload (M&M, Amex, Sparkasse).
  2) Add \"Ver erros\" link when errors exist.
  3) Modal lists row number, message, raw data (if present).
  4) Empty state: \"Nenhum erro encontrado\".
- Acceptance
  - User can open row-level errors for a given upload.

### Ticket QW-02: Notifications Backend Integration
- Backend Ready: Yes (notifications endpoints exist)
- Owner: FE, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Replace mock data with GET `/api/notifications`.
  2) Wire PATCH `/api/notifications/:id/read` and DELETE.
- UX/UI
  1) Keep tabs (Todas/Não lidas/Importantes).
  2) Add loading + empty states.
  3) Add unread badge in sidebar.
- Acceptance
  - Notifications list reflects real data and persists read state.

### Ticket QW-03: Merchant Metadata UI
- Backend Ready: Yes (merchant_metadata endpoints exist)
- Owner: FE, Design, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) CRUD UI for `/api/merchant-metadata`.
  2) Add match preview (description -> matched merchant).
- UX/UI
  1) Table/list with pattern, icon, color.
  2) Edit modal with live preview.
- Acceptance
  - Users can add/edit merchant icons without code changes.

### Ticket QW-04: \"Why this category\" in Confirm + Transactions
- Backend Ready: Yes (ruleIdApplied, suggestedKeyword, confidence exist)
- Owner: FE, Design, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Ensure list queries include ruleIdApplied/suggestedKeyword/confidence.
  2) Add inline popover component.
- UX/UI
  1) \"Por que?\" icon in Confirm + Transactions list.
  2) Popover shows rule name, keyword, confidence.
- Acceptance
  - Explanation visible in 1 click without leaving list.

### Ticket QW-05: Preview de erros no card de upload
- Backend Ready: Yes (upload_errors endpoint exists)
- Owner: FE, Design
- Estimate: S
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Prefetch dos erros por upload com status de erro.
  2) Mostrar as 2 primeiras linhas no card.
- UX/UI
  1) Texto enxuto com linha + mensagem.
  2) Link \"Ver erros\" continua abrindo modal completo.
- Acceptance
  - Usuário vê os principais erros sem abrir modal.

### Ticket QW-06: Filtros de projetado/realizado no Calendário
- Backend Ready: Yes
- Owner: FE, Design
- Estimate: S
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Toggle para ocultar transações realizadas.
  2) Toggle para ocultar projeções de compromissos.
- UX/UI
  1) Controles próximos da legenda.
  2) Estado persistente na sessão.
- Acceptance
  - Usuário controla visibilidade por tipo de item.

### Ticket QW-07: Merchant metadata aplicado na UI
- Backend Ready: Yes (merchant_metadata endpoints)
- Owner: FE, Design
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Resolver override por pattern no cliente.
  2) Priorizar friendlyName + cor + ícone do cadastro.
- UX/UI
  1) Dashboard, Transações e Calendário usam override.
  2) Fallback para ícones padrão quando não houver match.
- Acceptance
  - Cadastro de merchant altera o visual nas listas.

### Ticket QW-08: Preview leve do impacto em Regras
- Backend Ready: Yes (confirm queue)
- Owner: FE, Design
- Estimate: S
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Mostrar contagem de pendentes ao lado do botão de reaplicar.
- UX/UI
  1) Badge discreto com número de pendências.
- Acceptance
  - Usuário entende o alcance antes de executar.

### Ticket QW-09: Guia N1/N2/N3 no formulário de regras
- Backend Ready: Yes
- Owner: Design, FE
- Estimate: S
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Texto curto explicando os níveis.
- UX/UI
  1) Microcopy abaixo das categorias.
- Acceptance
  - Usuário entende a hierarquia sem documentação externa.

### Ticket QW-10: CTAs de onboarding e recência de saldo
- Backend Ready: Yes
- Owner: FE, Design
- Estimate: S
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) CTA de metas quando vazio.
  2) Timestamp de atualização do saldo em contas.
- UX/UI
  1) Card discreto em Metas.
  2) \"Atualizado HH:mm\" em Contas.
- Acceptance
  - Usuário entende onde começar e quando o saldo foi atualizado.

### Ticket QW-11: CTA "Criar regra" em detalhe da transação
- Backend Ready: Yes
- Owner: FE, Design, QA
- Estimate: S
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Expor CTA no detalhe da transação com deep link para `/rules`.
  2) Prefill de descrição, categoria, tipo, fixo/variável e palavra-chave.
- UX/UI
  1) Botão secundário "Criar regra".
  2) Feedback por toast ao abrir modal já preenchido.
- Acceptance
  - Usuário cria regra em 1 clique a partir de uma transação.

### Ticket QW-12: Notificações automáticas (uploads, metas, rituais)
- Backend Ready: Yes (notifications endpoints + triggers)
- Owner: BE, FE, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Criar notificações ao finalizar upload (sucesso/duplicado/erro).
  2) Criar notificações ao criar/atualizar metas.
  3) Criar notificações ao concluir rituais.
- UX/UI
  1) Copys claras com resultado e ação sugerida.
  2) Badge de não lidas atualizado.
- Acceptance
  - Eventos críticos geram notificações automaticamente.

### Ticket QW-13: Regras — export/import com Classificações completas
- Backend Ready: Yes
- Owner: FE, BE, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Exportar planilha com duas abas: "Regras" e "Classificacoes".
  2) "Classificacoes" contém todas as categorias (mesmo sem keywords).
  3) Import aceita ambas as abas, ignora linhas vazias.
- UX/UI
  1) Microcopy explicando a diferença entre regras e classificações.
  2) Mensagem de sucesso com contagem por aba.
- Acceptance
  - Usuário consegue migrar regras e mapa de categorias.

### Ticket QW-14: Dicionário de Comerciantes dentro de Configurações
- Backend Ready: Yes
- Owner: FE, Design, QA
- Estimate: S
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Links diretos na aba Integrações das Configurações.
  2) Remover item do menu principal para reduzir ruído.
- UX/UI
  1) Descrição clara do objetivo do dicionário.
- Acceptance
  - Dicionário encontrado onde o usuário espera (Configurações).

### Ticket QW-15: Análise Inteligente de Keywords (mapeamento real)
- Backend Ready: Yes
- Owner: BE, FE, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Basear análise em tabelas de mapeamento e alias.
  2) Remover sugestões já presentes nas regras.
  3) Expor dados consolidados para o painel.
- UX/UI
  1) Indicar fontes (mapeamento vs regras).
  2) Mostrar exemplos de descrições agrupadas.
- Acceptance
  - Sugestões refletem dados reais do usuário.

### Ticket QW-16: Sparkasse CSV — fix de detecção com BOM
- Backend Ready: Yes
- Owner: BE, QA
- Estimate: S
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Remover BOM na detecção e parsing.
- UX/UI
  1) Nenhuma mudança visível, mas erro eliminado.
- Acceptance
  - CSV Sparkasse com BOM é detectado corretamente.

### Ticket QW-17: Ícones antes da descrição (listas e agrupamentos)
- Backend Ready: Yes
- Owner: FE, Design, QA
- Estimate: S
- Dependencies: Merchant metadata
- Status: Done (branch_feat)
- Logic
  1) Usar merchant metadata para resolver ícone/nome.
  2) Fallback para ícones genéricos quando não houver match.
- UX/UI
  1) Ícone alinhado com o texto da descrição.
- Acceptance
  - Listas mostram ícones consistentes antes da descrição.

### Ticket QW-18: Revisão de Português (acentos e clareza)
- Backend Ready: Yes
- Owner: Design, FE, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Varredura de strings sem acento/termos ambíguos.
  2) Ajustar labels e microcopy conforme guia.
- UX/UI
  1) Manter tom calmo e preciso.
- Acceptance
  - Interface em português consistente e correta.

## Dependency-Bound Items

### Ticket DEP-01: Dashboard \"Disponível Real\"
- Backend Ready: Partial (needs consistent income source)
- Owner: FE, BE, Design, QA
- Estimate: M
- Dependencies: Goals/Budget as income source
- Status: Done (branch_feat, using Goals)
- Logic
  1) Pull estimated income from Goals or Budget total.
  2) Fetch commitments (calendar events) for month.
  3) Compute `disponivel = renda_estimada - gasto_real - compromissos_futuros`.
- UX/UI
  1) KPI \"Disponível real\".
  2) Breakdown tooltip: renda, gasto, compromissos.
  3) CTA if income missing.
- Acceptance
  - Dashboard shows a trustworthy number with explanation.

### Ticket DEP-02: Confirm Queue Merchant Bundling
- Backend Ready: Yes
- Owner: FE, Design, QA
- Estimate: L
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Group pending transactions by normalized merchant.
  2) Apply category to group.
  3) Optional rule creation from group keyword.
- UX/UI
  1) Toggle \"Agrupar por merchant\".
  2) Group card shows count, total, samples.
  3) One form applies to all.
- Acceptance
  - User can confirm 10+ similar transactions in one action.

### Ticket DEP-03: Calendar Projected vs Realized
- Backend Ready: Partial (needs projected markers)
- Owner: FE, Design, QA
- Estimate: M
- Dependencies: Commitments data and tagging
- Status: Done (branch_feat)
- Logic
  1) Tag events as projected and transactions as realized.
  2) Week view totals split.
- UX/UI
  1) Legend (Projetado vs Realizado).
  2) Distinct styles (solid vs dashed).
  3) Summary card with two totals.
- Acceptance
  - Users visually separate future commitments from actual spend.

### Ticket DEP-04: Categories Management Screen
- Backend Ready: Yes
- Owner: BE, FE, Design, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Read hierarchy (N1/N2/N3) from schema or config.
  2) Allow rename/move with validation.
- UX/UI
  1) Tree view.
  2) Impact preview: \"X regras / Y transações\".
- Acceptance
  - Taxonomy is editable and explainable.

### Ticket DEP-05: Goals vs Budget Clarification
- Backend Ready: Yes
- Owner: Design, FE, QA
- Estimate: S
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Align data source for dashboard totals.
- UX/UI
  1) Rename labels to \"Objetivos\" vs \"Orçamento\".
  2) Add explainer text on both screens.
- Acceptance
  - Users understand difference without reading docs.

### Ticket DEP-06: Notifications + recomendações de ação
- Backend Ready: Yes
- Owner: FE, Design, QA
- Estimate: S
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Mapear notificações por título para ação sugerida.
  2) Exibir CTA contextual (Uploads, Metas, Rituais).
- UX/UI
  1) Botão "Ver uploads", "Ver metas", "Ver rituais".
- Acceptance
  - Notificações guiam ações concretas.

### Ticket DEP-07: Dicionário de Comerciantes — upload/download
- Backend Ready: Yes
- Owner: BE, FE, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Upload CSV/Excel de aliases.
  2) Export com padrões e contagem de ocorrências.
- UX/UI
  1) Validação com preview e erros por linha.
- Acceptance
  - Usuário consegue migrar dicionário sem esforço.

### Ticket DEP-08: Regras com preview de impacto real
- Backend Ready: Yes
- Owner: BE, FE, Design, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Simular regra e retornar número de transações afetadas.
- UX/UI
  1) Preview no modal antes de salvar.
- Acceptance
  - Usuário entende o impacto antes de aplicar.

### Ticket DEP-09: AI Assistant com contexto real
- Backend Ready: Yes (chat endpoint + contexto resumido)
- Owner: BE, FE, Design, QA
- Estimate: L
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) SSE com contexto de transações, metas e orçamento.
  2) Persistência de conversas.
- UX/UI
  1) Respostas com referências ("com base em...").
- Acceptance
  - Chat entrega respostas úteis e verificáveis.

### Ticket DEP-10: Gestão de Categorias completa
- Backend Ready: Yes
- Owner: BE, FE, Design, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) CRUD com validação e impacto em regras/transações.
- UX/UI
  1) Árvore + painel de impacto.
- Acceptance
  - Usuário controla a taxonomia sem riscos.

### Ticket DEP-06: AI Chat History + Context Badge
- Backend Ready: Yes
- Owner: BE, FE, Design, QA
- Estimate: M
- Dependencies: None
- Status: Done (branch_feat)
- Logic
  1) Persist conversation list or local history.
  2) Pass current route as context.
- UX/UI
  1) Badge \"Contexto atual\" in chat header.
  2) Simple list of past conversations.
- Acceptance
  - Users know what data the AI is using.

## Suggested Sprint Order

Sprint 1 (Quick Wins)
- QW-01, QW-02, QW-03, QW-04, QW-05, QW-06, QW-07, QW-08, QW-09, QW-10

Sprint 2 (Core UX)
- DEP-01, DEP-02, DEP-03

Sprint 3 (Platform UX)
- DEP-04, DEP-05, DEP-06
