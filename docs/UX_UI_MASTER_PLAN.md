# UX/UI Master Plan — RitualFin

## 1. Executive Summary
RitualFin already ships a complete, PT-BR-first personal finance experience (dashboard, transactions, imports, budgets, goals, rituals, settings) with a solid data model and CSV parsing pipeline. The primary UX risks are trust and predictability in data operations: imports and bulk updates do not consistently enforce Preview → Confirm → Commit, localization is hardcoded, and observability is mostly backend-only.

This plan keeps the current visual language, codifies UX standards, and defines engineer-executable screen contracts, microcopy triplets, and a roadmap to harden reliability (imports, rules, review queue, aliases/logos) while introducing missing screens (Import Wizard, Parsing Report, Import History, Conflict Resolution, Forecasting).

### Repo Audit Snapshot (As-Is)
**Routes / Screens**
- Router (Wouter): `client/src/App.tsx`
- Public: `/`, `/login`
- Main: `/dashboard`, `/transactions`, `/uploads`, `/accounts`, `/budgets`, `/goals`, `/calendar`, `/calendar/:id`, `/rituals`, `/notifications`, `/settings`
- Legacy redirect routes → `/settings`: `/confirm`, `/rules`, `/merchant-dictionary`, `/ai-keywords`
- 404: `not-found`

**Navigation / IA**
- Sidebar clusters: Visão Geral (Dashboard, Calendário, Notificações), Planejamento (Orçamentos, Metas), Ações (Transações), Operações (Uploads, Contas), Colaboração (Rituais), Sistema (Configurações).

**Shared Components / UI Kit**
- shadcn/Radix UI components (`client/src/components/ui/*`), Tailwind, lucide icons.
- Layout: Sidebar + AppLayout, TopNav; reusable badges, cards, dialogs, tables, skeletons.
- Custom widgets: Onboarding modal, transaction detail modal, alias logo, bank badge, account badge, AI assistant button/modal.

**Localization Approach**
- Hardcoded PT-BR strings in components/pages; no i18n framework or string registry.
- Dates and numbers format via `toLocaleString("pt-BR")` and `date-fns/ptBR`.

**CSV Import Implementation**
- Frontend: uploads page calls `/api/uploads/process` directly; settings import tab supports preview via `/api/imports/preview`.
- Backend: `server/csv-parser.ts` (manual parsing for M&M/Amex), `server/sparkasse-pipeline.ts` (csv-parse + diagnostics). Errors saved to `upload_errors`, Sparkasse diagnostics to `upload_diagnostics`.
- No mandatory Preview → Confirm → Commit for imports in the Uploads page.

**Supabase Usage Patterns**
- Postgres via Supabase pooler (`server/db.ts`), Drizzle ORM, no Supabase Auth.
- RLS + storage bucket for logos exists in `migrations/004_classification_alias_logos.sql` (not enforced by app code).
- Logo storage is local `public/logos/...` with bucket path parity.

**Current Logging / Observability**
- Structured JSON logger in `server/logger.ts`, primarily used in import pipeline.
- Limited user-facing error surfacing (mostly toasts); no standard on-screen Status component.
- No unified correlation IDs displayed to users.

## 2. Product North Star (RitualFin)
Deliver a calm, predictable ritual for financial clarity: “import once, confirm once, then trust.” Users should understand why every transaction is categorized, how rules were applied, and what will change before it changes.

## 3. Design Principles (RitualFin-specific, aligned to current UI)
1. Preserve current look & feel; refine spacing/hierarchy, not aesthetics.
2. Make every irreversible action explicit: Preview → Confirm → Commit.
3. Explainability over automation: show why a rule, alias, or recurrence is suggested.
4. Observability is part of UX: every failure has a visible status panel + debug payload.
5. Localization is first-class: PT/DE/EN parity, correct diacritics everywhere.
6. Keyword expressions are atomic: never split or auto-edit `;` separated expressions.
7. Classification completeness: each transaction ends with exactly one leaf category.

## 4. Market Benchmark Synthesis → Practical Patterns
### Benchmark Patterns (no web scraping)
- **Import Wizards**: multi-step (source detect → preview → confirm); show sample rows, format detection, and error summaries.
- **Transaction Lists**: dense but scannable rows, aligned columns, consistent amount signage, sticky filters.
- **Rule Management**: explainable keyword expressions, impact preview, and retroactive scope.
- **Budgeting & Forecasting**: monthly snapshots + projected runway; show confidence and variance.
- **Settings / Danger Zone**: explicit scope selection, typed confirmation, audit summary.

### RitualFin Design Rules (applied to current UI)
- Keep card-based layouts and green primary accent; improve table density and column alignment.
- Use explicit “Status” panels for imports, rules, and data updates.
- Every bulk action shows: count, affected months, and example rows before commit.
- Always surface source + key_desc + alias_desc together to reduce classification ambiguity.

## 5. Information Architecture (As-Is vs To-Be)
### As-Is IA
- **Visão Geral**: Dashboard, Calendário, Notificações
- **Planejamento**: Orçamentos, Metas
- **Ações**: Transações
- **Operações**: Uploads, Contas
- **Colaboração**: Rituais
- **Sistema**: Configurações (tabs: Conta, Preferências, Classificação & Dados, Dicionários, Integrações, Segurança, Danger Zone)

### To-Be IA
- **Overview**: Dashboard, Notifications
- **Transactions**: List, Detail, Export
- **Imports**: Import Wizard, Preview, Parsing Report, Import History, Conflict Resolution
- **Classification**: Review Queue, Rules Manager, Categories (Taxonomy), AI Keyword Suggestions
- **Aliases & Logos**: Aliases, Logos Download/Refresh
- **Planning**: Budgets, Goals, Forecasting
- **Calendar**: Calendar, Recurrence Signals, Event Detail
- **Settings**: Account/Preferences, Localization, Data Management, Integrations, Security, Danger Zone

### Prioritized Gap List
1. Enforce Preview → Confirm → Commit for imports, rules, and deletions.
2. Add Parsing Report + Import History + Conflict Resolution screens.
3. Add localization system (PT/DE/EN) and migrate critical copy.
4. Add on-screen Status component with debug payload for all data operations.
5. Unify classification flows: review queue, rules, and aliases in one IA cluster.

## 6. End-to-End User Journeys (happy path + failure recovery)
### Auth (Google / Email)
- **Happy path**: open `/login` → choose Google/email → authenticated → routed to `/dashboard`.
- **Recovery**: invalid credentials → error banner with reason + action; network error → retry + request ID.

### First-Time Setup (soft onboarding)
- **Happy path**: onboarding modal → “Importar CSV” → import wizard → preview → confirm → review queue.
- **Recovery**: onboarding dismissed → reminder card on dashboard with CTA.

### Imports (M&M / Amex / Sparkasse)
- **Happy path**: Import Wizard → format auto-detected → Preview grid (20 rows) → Parsing Report → confirm → commit → summary.
- **Recovery**: missing columns → Parsing Report lists required headers + sample; user fixes CSV → re-upload.

### Transactions (list + details)
- **Happy path**: filter + search → open transaction detail → edit classification → save.
- **Recovery**: edit conflict → show latest values + user choice to overwrite or cancel.

### Classification + Review Queue
- **Happy path**: review queue → select leaf (Nivel 1/2/3) → optionally create rule → preview impact → confirm.
- **Recovery**: rule conflict → show competing rules + pick priority.

### Rules Management
- **Happy path**: create rule with `key_words` expressions → impact preview → confirm → reapply.
- **Recovery**: invalid expression (empty token) → inline validation; duplicates → show existing rule.

### Aliases + Logos
- **Happy path**: define alias + key_words_alias → preview matches → confirm → logo fetch queue.
- **Recovery**: logo fetch fails → show error with retry + URL validation.

### Budgets / Month Overview
- **Happy path**: set budgets → dashboard updates → alerts when limits exceeded.
- **Recovery**: missing data → show empty state with “Importar CSV”.

### Recurrence & Forecasting
- **Happy path**: system flags recurring → user sees confidence + day window → forecast agenda shows expected amounts.
- **Recovery**: low confidence → allow manual mark or dismissal.

### Settings / Data Management
- **Happy path**: export → preview → download; import taxonomy → preview diff → confirm.
- **Recovery**: mismatched categories → require confirmRemap + explicit confirmation.

### Error Recovery Flows
- Failed import → Parsing Report + upload_diagnostics details + suggestion to adjust encoding.
- Partial parse → show row errors + allow commit of valid rows.
- Duplicate conflicts → Conflict Resolution screen to merge/skip.

## 7. Screen Inventory (As-Is vs To-Be)
### As-Is Screens
- `/login`, `/dashboard`, `/transactions`, `/uploads`, `/accounts`, `/budgets`, `/goals`, `/calendar`, `/calendar/:id`, `/rituals`, `/notifications`, `/settings`
- Onboarding modal, AI assistant chat modal, keyboard shortcuts overlay
- Hidden/legacy: `/confirm`, `/rules`, `/merchant-dictionary`, `/ai-keywords` (redirects to `/settings`)

### To-Be Screens (minimum)
- Auth: Login
- Core: Dashboard, Transactions List, Transaction Detail, Search/Filter/Sort, Export
- Imports: Import Wizard, Import Preview Grid, Parsing Report, Import History, Conflict Resolution
- Classification: Review Queue, Rules Manager, Categories (Taxonomy), AI Keywords
- Aliases & Logos: Alias Manager, Logo Manager
- Forecasting: Forecast Agenda + Recurrence Signals
- Settings: Account, Preferences, Localization, Security, Integrations, Data Management, Danger Zone
- Planning: Budgets, Goals
- Calendar: Calendar, Event Detail
 - System: AI Assistant Chat, Not Found

## 8. Screen Contracts (one subsection per screen)
All error taxonomy entries must surface a user-facing reason + next action and include a technical payload (at minimum: `request_id`, `user_id`, `entity_id` when applicable) rendered in the on-screen Status component.

### Login / Auth
- **Route + Nav**: `/login` (public), no nav.
- **Primary JTBD**: authenticate user safely and quickly.
- **Data dependencies**: `users` table; endpoints `/api/auth/login`, `/api/auth/me`.
- **Inputs/Outputs**: email/username + password OR Google OAuth; outputs session + user profile.
- **State model**: loading, error, success; empty state N/A.
- **Validation rules (front + back)**: email format, password length >= 8 (front); server validates credentials.
- **Error taxonomy (user + technical)**:
  - AUTH_INVALID: “Credenciais inválidas.” + `{ code, request_id }`
  - AUTH_NETWORK: “Sem conexão. Tente novamente.” + `{ code, request_id }`
- **Audit trail events**: `auth.login_attempt`, `auth.login_success`, `auth.login_failed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Entrar” / “Anmelden” / “Sign in”
  - Helper text: “Use seu e-mail ou Google.” / “Mit E-Mail oder Google.” / “Use email or Google.”
  - Empty state: “Nenhuma conta encontrada.” / “Kein Konto gefunden.” / “No account found.”
  - Validation error: “E-mail inválido.” / “Ungültige E-Mail.” / “Invalid email.”
  - Confirmation/destructive: “Login realizado.” / “Anmeldung erfolgreich.” / “Signed in.”

### Onboarding Modal (First-time Setup)
- **Route + Nav**: modal on `/dashboard`.
- **JTBD**: explain CSV import + review process.
- **Data dependencies**: localStorage key `ritualfin_onboarding_completed`.
- **Inputs/Outputs**: step navigation; output flag completion.
- **State model**: step 1/2/3, dismiss.
- **Validation rules (front + back)**: none.
- **Error taxonomy**: N/A (client only).
- **Audit trail events**: `onboarding.viewed`, `onboarding.completed`, `onboarding.skipped`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Começar” / “Starten” / “Get started”
  - Helper text: “Importe um CSV para iniciar.” / “Importiere eine CSV zum Start.” / “Import a CSV to begin.”
  - Empty state: “Nenhuma etapa disponível.” / “Keine Schritte verfügbar.” / “No steps available.”
  - Validation error: “Etapa inválida.” / “Ungültiger Schritt.” / “Invalid step.”
  - Confirmation: “Pronto! Vamos importar.” / “Fertig! Jetzt importieren.” / “Ready! Let’s import.”

### Dashboard
- **Route + Nav**: `/dashboard` (Overview).
- **JTBD**: see monthly health, pending reviews, recent imports.
- **Data dependencies**: `/api/dashboard`, `/api/transactions?month`, `/api/uploads/last-by-account`, `/api/calendar-events`; tables `transactions`, `uploads`, `budgets`, `calendar_events`.
- **Inputs/Outputs**: month selector, account filter; outputs insights and summaries.
- **State model**: loading skeleton, empty (no imports), success, error.
- **Validation rules (front + back)**: month format `YYYY-MM`.
- **Error taxonomy**:
  - DASHBOARD_FETCH_FAILED: “Não foi possível carregar o resumo.” + `{ request_id, month }`
- **Audit trail events**: `dashboard.viewed`, `dashboard.month_changed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Importar CSV” / “CSV importieren” / “Import CSV”
  - Empty state: “Nenhuma transação ainda.” / “Noch keine Transaktionen.” / “No transactions yet.”
  - Helper text: “Selecione o mês.” / “Monat wählen.” / “Select a month.”
  - Validation error: “Mês inválido.” / “Ungültiger Monat.” / “Invalid month.”
  - Confirmation: “Mês atualizado.” / “Monat aktualisiert.” / “Month updated.”

### Transactions List
- **Route + Nav**: `/transactions` (Transactions).
- **JTBD**: browse, filter, and edit transactions.
- **Data dependencies**: `/api/transactions`, `/api/accounts`; tables `transactions`, `accounts`.
- **Inputs/Outputs**: search, filters (account/category/type), edit modal; output updates to transaction.
- **State model**: loading, empty list, partial (filters), error.
- **Validation rules (front + back)**: amount numeric; category leaf required on save.
- **Error taxonomy**:
  - TX_FETCH_FAILED: “Falha ao carregar transações.” + `{ request_id, month }`
  - TX_UPDATE_FAILED: “Erro ao salvar a transação.” + `{ request_id, transaction_id }`
- **Audit trail events**: `transactions.viewed`, `transaction.updated`, `transaction.filtered`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Exportar CSV” / “CSV exportieren” / “Export CSV”
  - Helper text: “Filtre por conta ou categoria.” / “Nach Konto oder Kategorie filtern.” / “Filter by account or category.”
  - Empty state: “Sem transações neste mês.” / “Keine Transaktionen in diesem Monat.” / “No transactions this month.”
  - Validation error: “Categoria obrigatória.” / “Kategorie erforderlich.” / “Category required.”
  - Confirmation: “Exportação concluída.” / “Export abgeschlossen.” / “Export completed.”

### Transaction Detail Modal / Drawer
- **Route + Nav**: modal on `/transactions`.
- **JTBD**: inspect source fields, alias, classification, recurrence signals.
- **Data dependencies**: `transactions`, `accounts`, `rules`, `alias_assets`, `key_desc_map`.
- **Inputs/Outputs**: edit category, flags (internal transfer, exclude budget); output updated transaction.
- **State model**: loading details, success, error.
- **Validation rules (front + back)**: leafId required to finalize classification.
- **Error taxonomy**:
  - TX_DETAIL_LOAD_FAILED: “Detalhes indisponíveis.” + `{ request_id, transaction_id }`
- **Audit trail events**: `transaction.detail_viewed`, `transaction.edited`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Salvar alterações” / “Änderungen speichern” / “Save changes”
  - Helper text: “Escolha um nível 3.” / “Wähle Level 3.” / “Pick a level 3.”
  - Empty state: “Sem detalhes adicionais.” / “Keine weiteren Details.” / “No additional details.”
  - Validation error: “Categoria obrigatória.” / “Kategorie erforderlich.” / “Category required.”
  - Confirmation: “Transação atualizada.” / “Transaktion aktualisiert.” / “Transaction updated.”

### Export (CSV/Excel)
- **Route + Nav**: `/transactions` action + Settings → Data Management.
- **JTBD**: export transactions or classification safely with locale-safe encoding.
- **Data dependencies**: `/api/classification/export`, `/api/classification/export-csv`, `/api/aliases/export`.
- **Inputs/Outputs**: export scope (month/all), format (CSV/Excel).
- **State model**: loading, success download, error.
- **Validation rules (front + back)**: scope required; file size warning.
- **Error taxonomy**: EXPORT_FAILED with payload `{ request_id, scope, format }`.
- **Audit trail events**: `export.started`, `export.completed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Baixar Excel” / “Excel herunterladen” / “Download Excel”
  - Helper text: “Inclui categorias e regras.” / “Enthält Kategorien und Regeln.” / “Includes categories and rules.”
  - Empty state: “Nenhum dado para exportar.” / “Keine Daten zum Export.” / “No data to export.”
  - Validation error: “Formato inválido.” / “Ungültiges Format.” / “Invalid format.”
  - Confirmation: “Download iniciado.” / “Download gestartet.” / “Download started.”

### Import Wizard (New)
- **Route + Nav**: `/imports/new` (Imports).
- **JTBD**: guide CSV upload with auto-detection and preflight checks.
- **Data dependencies**: `/api/imports/preview`, `/api/uploads/process`.
- **Inputs/Outputs**: file, source override; output `import_attempt_id`.
- **State model**: idle, uploading, preview-ready, error.
- **Validation rules (front + back)**: file type `.csv`, max size, encoding detected.
- **Error taxonomy**:
  - IMPORT_FILE_INVALID: “Arquivo inválido.” + `{ request_id, mime_type }`
  - IMPORT_PREVIEW_FAILED: “Pré-visualização falhou.” + `{ request_id, details }`
- **Audit trail events**: `import.previewed`, `import.confirmed`, `import.committed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Pré-visualizar” / “Vorschau” / “Preview”
  - Helper text: “Detectamos o banco automaticamente.” / “Bank automatisch erkannt.” / “Auto-detected bank.”
  - Empty state: “Nenhum arquivo selecionado.” / “Keine Datei ausgewählt.” / “No file selected.”
  - Validation error: “Selecione um CSV.” / “Bitte CSV auswählen.” / “Select a CSV.”
  - Confirmation: “Pré-visualização pronta.” / “Vorschau bereit.” / “Preview ready.”

### Import Preview Grid
- **Route + Nav**: `/imports/preview/:id` (step 2).
- **JTBD**: validate rows + show sample mapping before commit.
- **Data dependencies**: preview payload from `/api/imports/preview`.
- **Inputs/Outputs**: confirm preview; output proceed to Parsing Report.
- **State model**: loading preview, success, error.
- **Validation rules (front + back)**: show missing columns; block confirm if required missing.
- **Error taxonomy**:
  - IMPORT_MISSING_COLUMNS: “Faltam colunas obrigatórias.” + `{ missing_columns }`
- **Audit trail events**: `import.preview_viewed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Continuar” / “Weiter” / “Continue”
  - Helper text: “Amostra de 20 linhas.” / “20 Zeilen Vorschau.” / “20-row preview.”
  - Empty state: “Sem linhas para exibir.” / “Keine Zeilen verfügbar.” / “No rows to display.”
  - Validation error: “Cabeçalhos ausentes.” / “Fehlende Header.” / “Missing headers.”
  - Confirmation: “Pré-visualização aprovada.” / “Vorschau bestätigt.” / “Preview confirmed.”

### Parsing Report (New)
- **Route + Nav**: `/imports/report/:id`.
- **JTBD**: show parse diagnostics, encoding, delimiter, row errors.
- **Data dependencies**: `upload_diagnostics`, `upload_errors`; endpoint `/api/uploads/:id/errors` + diagnostic payload.
- **Inputs/Outputs**: confirm commit or cancel.
- **State model**: loading, success (with warnings), error.
- **Validation rules (front + back)**: block commit if zero valid rows.
- **Error taxonomy**:
  - IMPORT_PARSE_FAILED: “Falha na análise.” + `{ error_code, sample_rows }`
- **Audit trail events**: `import.report_viewed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Confirmar importação” / “Import bestätigen” / “Confirm import”
  - Helper text: “Veja erros por linha.” / “Zeilenfehler anzeigen.” / “See row errors.”
  - Empty state: “Nenhum erro encontrado.” / “Keine Fehler gefunden.” / “No errors found.”
  - Validation error: “Nenhuma linha válida.” / “Keine gültige Zeile.” / “No valid rows.”
  - Confirmation: “Importação iniciada.” / “Import gestartet.” / “Import started.”

### Import History (New)
- **Route + Nav**: `/imports/history`.
- **JTBD**: review past uploads with status and counts.
- **Data dependencies**: `/api/uploads`, `uploads` table.
- **Inputs/Outputs**: filter by source/status; output view details.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: N/A.
- **Error taxonomy**: IMPORT_HISTORY_FAILED + `{ request_id }`.
- **Audit trail events**: `import.history_viewed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Ver relatório” / “Bericht ansehen” / “View report”
  - Helper text: “Clique para ver detalhes.” / “Zum Anzeigen klicken.” / “Click to view details.”
  - Empty state: “Nenhum upload ainda.” / “Noch kein Upload.” / “No uploads yet.”
  - Validation error: “Filtro inválido.” / “Ungültiger Filter.” / “Invalid filter.”
  - Confirmation: “Relatório aberto.” / “Bericht geöffnet.” / “Report opened.”

### Conflict Resolution (Duplicates/Overlaps)
- **Route + Nav**: `/imports/conflicts/:id`.
- **JTBD**: resolve duplicates and overlaps before commit.
- **Data dependencies**: `transactions`, `uploads`, conflict detection endpoint (new).
- **Inputs/Outputs**: choose skip/merge/keep both; output resolution summary.
- **State model**: loading conflicts, success, error.
- **Validation rules (front + back)**: require decision for each conflict.
- **Error taxonomy**: IMPORT_CONFLICT_FAILED + `{ conflict_id }`.
- **Audit trail events**: `import.conflict_resolved`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Aplicar decisões” / “Entscheidungen anwenden” / “Apply decisions”
  - Helper text: “Compare valores e datas.” / “Werte und Daten vergleichen.” / “Compare amounts and dates.”
  - Empty state: “Nenhum conflito detectado.” / “Keine Konflikte gefunden.” / “No conflicts found.”
  - Validation error: “Selecione uma decisão.” / “Entscheidung erforderlich.” / “Decision required.”
  - Confirmation: “Conflitos resolvidos.” / “Konflikte gelöst.” / “Conflicts resolved.”

### Review Queue (Classification)
- **Route + Nav**: `/classification/review` (replaces legacy `/confirm`).
- **JTBD**: finalize leaf classification for OPEN transactions.
- **Data dependencies**: `/api/classification/review-queue`, `/api/transactions/confirm`; tables `transactions`, `taxonomy_*`, `rules`.
- **Inputs/Outputs**: choose leaf, optional rule creation, scope; output updated transactions.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: leafId required, keyword expression required if creating rule.
- **Error taxonomy**:
  - REVIEW_ASSIGN_FAILED: “Não foi possível aplicar.” + `{ transaction_id, rule_id }`
- **Audit trail events**: `review.queue_viewed`, `review.assigned`, `rule.created_from_review`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Confirmar seleção” / “Auswahl bestätigen” / “Confirm selection”
  - Helper text: “Selecione Nível 3.” / “Level 3 auswählen.” / “Pick Level 3.”
  - Empty state: “Fila vazia.” / “Warteschlange leer.” / “Queue is empty.”
  - Validation error: “Categoria obrigatória.” / “Kategorie erforderlich.” / “Category required.”
  - Confirmation: “Classificação aplicada.” / “Klassifizierung angewendet.” / “Classification applied.”

### Rules Manager
- **Route + Nav**: `/classification/rules`.
- **JTBD**: create/edit rules with keyword expressions and priorities.
- **Data dependencies**: `/api/rules`, `/api/rules/:id`, `/api/rules/reapply-all`.
- **Inputs/Outputs**: rule form, keyword expressions, priority; output reapply summary.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: `key_words` tokens must be `;`-separated, non-empty; category leaf required.
- **Error taxonomy**:
  - RULE_SAVE_FAILED: “Falha ao salvar regra.” + `{ rule_id }`
- **Audit trail events**: `rule.created`, `rule.updated`, `rule.deleted`, `rule.reapplied`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Salvar regra” / “Regel speichern” / “Save rule”
  - Helper text: “Separe expressões com ';'.” / “Ausdrücke mit ';' trennen.” / “Separate expressions with ';'.”
  - Empty state: “Nenhuma regra.” / “Keine Regeln.” / “No rules.”
  - Validation error: “Expressão inválida.” / “Ungültiger Ausdruck.” / “Invalid expression.”
  - Confirmation: “Regra salva.” / “Regel gespeichert.” / “Rule saved.”

### Categories (Taxonomy)
- **Route + Nav**: `/classification/categories` (Settings → Categorias).
- **JTBD**: manage taxonomy levels and app groupings.
- **Data dependencies**: `/api/classification/leaves`, `/api/classification/import/*`.
- **Inputs/Outputs**: import/export taxonomy; output updated leaf mapping.
- **State model**: loading, success, confirm modal, error.
- **Validation rules (front + back)**: require Nivel 1/2/3; confirm remap if app categories change.
- **Error taxonomy**: CATEGORY_IMPORT_FAILED + `{ missing_columns }`.
- **Audit trail events**: `taxonomy.import_previewed`, `taxonomy.applied`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Aplicar importação” / “Import anwenden” / “Apply import”
  - Helper text: “Mudanças exigem confirmação.” / “Änderungen erfordern Bestätigung.” / “Changes require confirmation.”
  - Empty state: “Nenhuma categoria.” / “Keine Kategorien.” / “No categories.”
  - Validation error: “Colunas obrigatórias ausentes.” / “Pflichtspalten fehlen.” / “Missing required columns.”
  - Confirmation: “Categorias atualizadas.” / “Kategorien aktualisiert.” / “Categories updated.”

### AI Keywords (Batch Suggestions)
- **Route + Nav**: `/classification/ai-keywords`.
- **JTBD**: generate rule suggestions from open transactions.
- **Data dependencies**: `/api/ai/analyze-keywords`, `/api/ai/apply-suggestions`.
- **Inputs/Outputs**: select suggestions and edit metadata; output new rules.
- **State model**: idle, loading, success, error.
- **Validation rules (front + back)**: keyword must be non-empty; category leaf required.
- **Error taxonomy**: AI_SUGGEST_FAILED + `{ request_id, model }`.
- **Audit trail events**: `ai.keywords_analyzed`, `ai.suggestions_applied`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Analisar transações” / “Transaktionen analysieren” / “Analyze transactions”
  - Helper text: “Sugestões em lote.” / “Batch-Vorschläge.” / “Batch suggestions.”

### Alias Manager
- **Route + Nav**: `/aliases`.
- **JTBD**: define alias_desc and key_words_alias mappings.
- **Data dependencies**: `/api/aliases/export`, `/api/aliases/import/*`, `/api/aliases/test`.
- **Inputs/Outputs**: alias form, bulk import; output updated alias assets.
- **State model**: loading, success, error.
- **Validation rules (front + back)**: `key_words_alias` uses `;` separators; alias_desc required.
- **Error taxonomy**: ALIAS_SAVE_FAILED + `{ alias_desc }`.
- **Audit trail events**: `alias.created`, `alias.updated`, `alias.deleted`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Salvar alias” / “Alias speichern” / “Save alias”
  - Helper text: “Não dividir expressões.” / “Ausdrücke nicht trennen.” / “Do not split expressions.”

### Logo Manager
- **Route + Nav**: `/aliases/logos`.
- **JTBD**: manage logo URLs and download status.
- **Data dependencies**: `/api/aliases/refresh-logos`; storage `public/logos` + Supabase bucket.
- **Inputs/Outputs**: URL input, refresh queue; output logo download status.
- **State model**: loading, success, error, partial.
- **Validation rules (front + back)**: URL must be valid; max 2MB; allow PNG/JPG/SVG.
- **Error taxonomy**: LOGO_FETCH_FAILED + `{ alias_desc, url }`.
- **Audit trail events**: `logo.fetch_started`, `logo.fetch_failed`, `logo.fetch_completed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Atualizar logos” / “Logos aktualisieren” / “Refresh logos”
  - Helper text: “Mostra status de download.” / “Download-Status anzeigen.” / “Show download status.”

### Accounts
- **Route + Nav**: `/accounts`.
- **JTBD**: manage accounts and card metadata.
- **Data dependencies**: `/api/accounts`; table `accounts`.
- **Inputs/Outputs**: create/edit/archive account.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: name required; account number last 4 digits.
- **Error taxonomy**: ACCOUNT_SAVE_FAILED + `{ account_id }`.
- **Audit trail events**: `account.created`, `account.updated`, `account.archived`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Nova conta” / “Neues Konto” / “New account”
  - Confirmation: “Conta arquivada.” / “Konto archiviert.” / “Account archived.”

### Budgets
- **Route + Nav**: `/budgets`.
- **JTBD**: set monthly budgets per category.
- **Data dependencies**: `/api/budgets`, `/api/dashboard`.
- **Inputs/Outputs**: create/update/delete budget; output spending progress.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: amount > 0; category required.
- **Error taxonomy**: BUDGET_SAVE_FAILED + `{ budget_id }`.
- **Audit trail events**: `budget.created`, `budget.updated`, `budget.deleted`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Salvar orçamento” / “Budget speichern” / “Save budget”
  - Validation error: “Valor inválido.” / “Ungültiger Betrag.” / “Invalid amount.”

### Goals
- **Route + Nav**: `/goals`.
- **JTBD**: track monthly goals and progress by category.
- **Data dependencies**: `/api/goals`, `/api/goals/:id/progress`, `/api/category-goals`.
- **Inputs/Outputs**: create goal, set category targets.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: month required; target amount >= 0.
- **Error taxonomy**: GOAL_SAVE_FAILED + `{ goal_id }`.
- **Audit trail events**: `goal.created`, `goal.updated`, `goal.deleted`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Criar meta” / “Ziel erstellen” / “Create goal”
  - Empty state: “Nenhuma meta.” / “Keine Ziele.” / “No goals.”

### Calendar
- **Route + Nav**: `/calendar`.
- **JTBD**: visualize calendar events and recurring payments.
- **Data dependencies**: `/api/calendar-events`, `/api/event-occurrences`.
- **Inputs/Outputs**: create/edit events, filter by category.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: date required; amount > 0.
- **Error taxonomy**: CALENDAR_SAVE_FAILED + `{ event_id }`.
- **Audit trail events**: `calendar.viewed`, `event.created`, `event.updated`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Novo evento” / “Neues Ereignis” / “New event”
  - Helper text: “Escolha recorrência.” / “Wiederholung wählen.” / “Pick recurrence.”

### Event Detail
- **Route + Nav**: `/calendar/:id`.
- **JTBD**: inspect recurring event + occurrences.
- **Data dependencies**: `/api/calendar-events/:id`, `/api/calendar-events/:id/occurrences`.
- **Inputs/Outputs**: mark occurrence status, update event.
- **State model**: loading, success, error.
- **Validation rules (front + back)**: occurrence date required.
- **Error taxonomy**: EVENT_LOAD_FAILED + `{ event_id }`.
- **Audit trail events**: `event.detail_viewed`, `occurrence.updated`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Atualizar ocorrência” / “Vorkommen aktualisieren” / “Update occurrence”

### Forecasting / Recurrence Signals (New)
- **Route + Nav**: `/forecast`.
- **JTBD**: show upcoming expected transactions with confidence.
- **Data dependencies**: `transactions` (recurringFlag + group), `event_occurrences`, `calendar_events`.
- **Inputs/Outputs**: filter by confidence; output agenda view.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: N/A.
- **Error taxonomy**: FORECAST_FAILED + `{ request_id }`.
- **Audit trail events**: `forecast.viewed`, `forecast.filtered`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Ver agenda” / “Agenda anzeigen” / “View agenda”
  - Helper text: “Confiança baseada em histórico.” / “Vertrauen basiert auf Verlauf.” / “Confidence based on history.”

### Rituals
- **Route + Nav**: `/rituals`.
- **JTBD**: weekly/monthly review flow and notes.
- **Data dependencies**: `/api/rituals`, `/api/rituals/:id/complete`.
- **Inputs/Outputs**: complete ritual + notes.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: notes optional.
- **Error taxonomy**: RITUAL_SAVE_FAILED + `{ ritual_id }`.
- **Audit trail events**: `ritual.completed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Concluir ritual” / “Ritual abschließen” / “Complete ritual”

### Notifications
- **Route + Nav**: `/notifications`.
- **JTBD**: review system alerts and actions.
- **Data dependencies**: `/api/notifications` (currently UI mock).
- **Inputs/Outputs**: mark read, filter tabs.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: N/A.
- **Error taxonomy**: NOTIFICATIONS_FAILED + `{ request_id }`.
- **Audit trail events**: `notification.read`, `notification.read_all`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Marcar todas como lidas” / “Alle als gelesen markieren” / “Mark all as read”

### Settings — Data Management
- **Route + Nav**: `/settings` → Classificação & Dados.
- **JTBD**: import/export categories, aliases, logos with preview/confirm.
- **Data dependencies**: `/api/classification/export`, `/api/classification/import/*`, `/api/aliases/export`, `/api/aliases/import/*`.
- **Inputs/Outputs**: upload Excel/CSV; output preview diff + apply.
- **State model**: loading, preview, confirm, success, error.
- **Validation rules (front + back)**: required columns; confirm remap.
- **Error taxonomy**: SETTINGS_IMPORT_FAILED + `{ missing_columns }`.
- **Audit trail events**: `classification.previewed`, `classification.applied`, `aliases.applied`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Pré-visualizar” / “Vorschau” / “Preview”
  - Confirmation: “Aplicar mudanças” / “Änderungen anwenden” / “Apply changes”

### Settings — Localization
- **Route + Nav**: `/settings` → Preferências.
- **JTBD**: choose language, number/date formats.
- **Data dependencies**: `settings` table.
- **Inputs/Outputs**: locale selection; output UI re-render.
- **State model**: loading, success, error.
- **Validation rules (front + back)**: locale must be `pt-BR`, `de-DE`, `en-US`.
- **Error taxonomy**: SETTINGS_SAVE_FAILED + `{ request_id }`.
- **Audit trail events**: `settings.locale_changed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Salvar preferências” / “Einstellungen speichern” / “Save preferences”
  - Helper text: “Idioma do aplicativo.” / “App-Sprache.” / “App language.”

### Settings — Danger Zone
- **Route + Nav**: `/settings` → Danger Zone.
- **JTBD**: delete data with strict confirmation.
- **Data dependencies**: `/api/settings/reset` (scope selection required in new design).
- **Inputs/Outputs**: select scope, type confirm text; output deletion summary.
- **State model**: select → confirm → done.
- **Validation rules (front + back)**: require exact typed confirmation string.
- **Error taxonomy**: RESET_FAILED + `{ request_id, scope }`.
- **Audit trail events**: `data.reset_requested`, `data.reset_completed`.
- **Microcopy (PT/DE/EN)**:
  - Confirmation: “Digite APAGAR para confirmar.” / “Geben Sie LÖSCHEN ein.” / “Type DELETE to confirm.”

### Transactions Search / Filter / Sort Patterns
- **Route + Nav**: `/transactions` (inline panel).
- **JTBD**: refine lists quickly without losing context.
- **Data dependencies**: `/api/transactions` (query params).
- **Inputs/Outputs**: search text, account, category, type, sort order; output filtered list.
- **State model**: idle, filtered, no-results.
- **Validation rules (front + back)**: sanitize search input; enforce supported sort keys.
- **Error taxonomy**: FILTER_APPLY_FAILED + `{ request_id, filters }`.
- **Audit trail events**: `transactions.filtered`, `transactions.sorted`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Aplicar filtros” / “Filter anwenden” / “Apply filters”
  - Helper text: “Use busca por alias, descrição ou categoria.” / “Suche nach Alias, Beschreibung oder Kategorie.” / “Search by alias, description, or category.”
  - Empty state: “Nenhum resultado.” / “Keine Ergebnisse.” / “No results.”
  - Validation error: “Filtro inválido.” / “Ungültiger Filter.” / “Invalid filter.”
  - Confirmation: “Filtros limpos.” / “Filter zurückgesetzt.” / “Filters cleared.”

### Uploads (Legacy Import Center)
- **Route + Nav**: `/uploads` (Operações).
- **JTBD**: upload CSV quickly (current direct commit flow).
- **Data dependencies**: `/api/uploads/process`, `/api/uploads` list.
- **Inputs/Outputs**: file upload; output summary counts.
- **State model**: idle, uploading, success, error.
- **Validation rules (front + back)**: file type CSV; encoding detection; block if preview fails.
- **Error taxonomy**: UPLOAD_FAILED + `{ upload_id, error_code }`.
- **Audit trail events**: `upload.started`, `upload.completed`, `upload.failed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Importar CSV” / “CSV importieren” / “Import CSV”
  - Helper text: “Suporta M&M, Amex, Sparkasse.” / “Unterstützt M&M, Amex, Sparkasse.” / “Supports M&M, Amex, Sparkasse.”
  - Empty state: “Nenhum upload ainda.” / “Noch kein Upload.” / “No uploads yet.”
  - Validation error: “Arquivo inválido.” / “Ungültige Datei.” / “Invalid file.”
  - Confirmation: “Importação concluída.” / “Import abgeschlossen.” / “Import completed.”

### Merchant Dictionary (Legacy)
- **Route + Nav**: `/merchant-dictionary` (legacy, to be merged into Aliases).
- **JTBD**: map source key_desc to alias_desc manually.
- **Data dependencies**: `/api/merchant-descriptions`, `/api/merchant-icons`.
- **Inputs/Outputs**: edit alias, delete mapping.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: alias_desc required; source must be one of Sparkasse/Amex/M&M.
- **Error taxonomy**: MERCHANT_MAP_FAILED + `{ mapping_id }`.
- **Audit trail events**: `merchant.map_created`, `merchant.map_updated`, `merchant.map_deleted`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Salvar alias” / “Alias speichern” / “Save alias”
  - Helper text: “Não alterar key_desc.” / “Key_desc nicht ändern.” / “Do not change key_desc.”
  - Empty state: “Nenhum mapeamento.” / “Keine Zuordnungen.” / “No mappings.”
  - Validation error: “Fonte inválida.” / “Ungültige Quelle.” / “Invalid source.”
  - Confirmation: “Mapeamento salvo.” / “Zuordnung gespeichert.” / “Mapping saved.”

### AI Assistant Chat (Floating)
- **Route + Nav**: floating button (global).
- **JTBD**: answer questions and guide user actions.
- **Data dependencies**: `/api/ai/chat` (future), `ai_usage_logs`.
- **Inputs/Outputs**: user message; output assistant response.
- **State model**: idle, sending, success, error.
- **Validation rules (front + back)**: max message length; block empty prompt.
- **Error taxonomy**: AI_CHAT_FAILED + `{ request_id, model }`.
- **Audit trail events**: `ai.chat_started`, `ai.chat_completed`, `ai.chat_failed`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Enviar” / “Senden” / “Send”
  - Helper text: “Pergunte sobre importações ou categorias.” / “Frage zu Importen oder Kategorien.” / “Ask about imports or categories.”
  - Empty state: “Sem mensagens.” / “Keine Nachrichten.” / “No messages.”
  - Validation error: “Mensagem vazia.” / “Leere Nachricht.” / “Empty message.”
  - Confirmation: “Resposta gerada.” / “Antwort erstellt.” / “Response generated.”

### Settings — Account
- **Route + Nav**: `/settings` → Conta.
- **JTBD**: edit profile basics and notifications email.
- **Data dependencies**: `users`, `settings`.
- **Inputs/Outputs**: name/email, notification preferences.
- **State model**: loading, success, error.
- **Validation rules (front + back)**: email format; name required.
- **Error taxonomy**: SETTINGS_ACCOUNT_FAILED + `{ request_id }`.
- **Audit trail events**: `settings.account_updated`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Salvar conta” / “Konto speichern” / “Save account”
  - Helper text: “Atualize seu e-mail.” / “E-Mail aktualisieren.” / “Update your email.”
  - Empty state: “Nenhuma informação.” / “Keine Angaben.” / “No information.”
  - Validation error: “E-mail inválido.” / “Ungültige E-Mail.” / “Invalid email.”
  - Confirmation: “Conta atualizada.” / “Konto aktualisiert.” / “Account updated.”

### Settings — Preferences & Appearance
- **Route + Nav**: `/settings` → Preferências.
- **JTBD**: set behavior (auto-confirm), theme, density.
- **Data dependencies**: `/api/settings` (autoConfirmHighConfidence, confidenceThreshold).
- **Inputs/Outputs**: toggles + sliders; output updated settings.
- **State model**: loading, success, error.
- **Validation rules (front + back)**: confidenceThreshold 0–100.
- **Error taxonomy**: SETTINGS_PREF_FAILED + `{ request_id }`.
- **Audit trail events**: `settings.updated`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Salvar preferências” / “Einstellungen speichern” / “Save preferences”
  - Helper text: “Ativar confirmação automática?” / “Automatische Bestätigung aktivieren?” / “Enable auto-confirm?”
  - Empty state: “Preferências padrão ativas.” / “Standardwerte aktiv.” / “Defaults applied.”
  - Validation error: “Valor fora do intervalo.” / “Wert außerhalb des Bereichs.” / “Value out of range.”
  - Confirmation: “Preferências salvas.” / “Einstellungen gespeichert.” / “Preferences saved.”

### Settings — Security
- **Route + Nav**: `/settings` → Segurança.
- **JTBD**: manage password and sessions.
- **Data dependencies**: `/api/auth/*` (future).
- **Inputs/Outputs**: password change, session revoke.
- **State model**: loading, success, error.
- **Validation rules (front + back)**: password strength, confirm match.
- **Error taxonomy**: SECURITY_UPDATE_FAILED + `{ request_id }`.
- **Audit trail events**: `security.password_changed`, `security.session_revoked`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Atualizar senha” / “Passwort aktualisieren” / “Update password”
  - Helper text: “Use 8+ caracteres.” / “Mind. 8 Zeichen.” / “Use 8+ chars.”
  - Empty state: “Nenhuma sessão ativa.” / “Keine aktiven Sitzungen.” / “No active sessions.”
  - Validation error: “Senhas não coincidem.” / “Passwörter stimmen nicht überein.” / “Passwords do not match.”
  - Confirmation: “Senha atualizada.” / “Passwort aktualisiert.” / “Password updated.”

### Settings — Integrations
- **Route + Nav**: `/settings` → Integrações.
- **JTBD**: connect external services (future).
- **Data dependencies**: integrations registry (future).
- **Inputs/Outputs**: connect/disconnect.
- **State model**: loading, empty, success, error.
- **Validation rules (front + back)**: N/A.
- **Error taxonomy**: INTEGRATION_FAILED + `{ provider }`.
- **Audit trail events**: `integration.connected`, `integration.disconnected`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Conectar” / “Verbinden” / “Connect”
  - Helper text: “Requer autorização.” / “Erfordert Autorisierung.” / “Requires authorization.”
  - Empty state: “Nenhuma integração ativa.” / “Keine aktiven Integrationen.” / “No active integrations.”
  - Validation error: “Autorização inválida.” / “Ungültige Autorisierung.” / “Invalid authorization.”
  - Confirmation: “Integração conectada.” / “Integration verbunden.” / “Integration connected.”

### Not Found (404)
- **Route + Nav**: fallback route.
- **JTBD**: recover from invalid links.
- **Data dependencies**: none.
- **Inputs/Outputs**: navigation back to dashboard.
- **State model**: static.
- **Validation rules (front + back)**: N/A.
- **Error taxonomy**: N/A.
- **Audit trail events**: `route.not_found`.
- **Microcopy (PT/DE/EN)**:
  - Primary action: “Voltar ao dashboard” / “Zurück zum Dashboard” / “Back to dashboard”
  - Helper text: “Página não encontrada.” / “Seite nicht gefunden.” / “Page not found.”

## 9. UI Kit & Interaction Standards (keep current style)
- Continue Tailwind + shadcn; use existing tokens in `client/src/index.css` (green primary, card-based layout).
- Standardize table density: 44–48px row height, numeric alignment right.
- Status component: persistent in-page banner with `status`, `reason`, `request_id`, `upload_id`.
- Modals vs drawers: use modal for single transaction details; use full page for imports.
- Buttons: primary for commit, secondary for preview, destructive only for deletes.

## 10. Content System & Microcopy Guidelines (PT/DE/EN)
- Centralize strings (future i18n) by screen and component.
- Use consistent vocabulary: “Transações”, “Classificação”, “Aliases”, “Regras”.
- Preserve accents in all flows; no normalization in UI display.
- Use explicit action verbs: “Pré-visualizar”, “Confirmar”, “Aplicar”.

### Critical Flow Microcopy Triplets (Required)
**Auth (Login)**
- Primary action: “Entrar” / “Anmelden” / “Sign in”
- Helper text: “Use e-mail ou Google.” / “Mit E-Mail oder Google.” / “Use email or Google.”
- Empty state: “Nenhuma conta encontrada.” / “Kein Konto gefunden.” / “No account found.”
- Validation error: “E-mail inválido.” / “Ungültige E-Mail.” / “Invalid email.”
- Confirmation/destructive: “Login realizado.” / “Anmeldung erfolgreich.” / “Signed in.”

**Imports (Wizard → Preview → Report → Commit)**
- Primary action: “Confirmar importação” / “Import bestätigen” / “Confirm import”
- Helper text: “Detectamos o formato automaticamente.” / “Format automatisch erkannt.” / “Format auto-detected.”
- Empty state: “Nenhum arquivo selecionado.” / “Keine Datei ausgewählt.” / “No file selected.”
- Validation error: “Arquivo inválido.” / “Ungültige Datei.” / “Invalid file.”
- Confirmation/destructive: “Importação aplicada.” / “Import angewendet.” / “Import applied.”

**Review Queue (Classification)**
- Primary action: “Confirmar classificação” / “Klassifizierung bestätigen” / “Confirm classification”
- Helper text: “Escolha Nível 3.” / “Level 3 auswählen.” / “Pick Level 3.”
- Empty state: “Fila vazia.” / “Warteschlange leer.” / “Queue is empty.”
- Validation error: “Categoria obrigatória.” / “Kategorie erforderlich.” / “Category required.”
- Confirmation/destructive: “Classificação aplicada.” / “Klassifizierung angewendet.” / “Classification applied.”

**Rules Manager**
- Primary action: “Salvar regra” / “Regel speichern” / “Save rule”
- Helper text: “Separe expressões com ';'.” / “Ausdrücke mit ';' trennen.” / “Separate expressions with ';'.”
- Empty state: “Nenhuma regra.” / “Keine Regeln.” / “No rules.”
- Validation error: “Expressão inválida.” / “Ungültiger Ausdruck.” / “Invalid expression.”
- Confirmation/destructive: “Regras reaplicadas.” / “Regeln erneut angewendet.” / “Rules reapplied.”

**Aliases & Logos**
- Primary action: “Salvar alias” / “Alias speichern” / “Save alias”
- Helper text: “Use ';' para expressões.” / “';' für Ausdrücke nutzen.” / “Use ';' for expressions.”
- Empty state: “Nenhum alias.” / “Keine Aliases.” / “No aliases.”
- Validation error: “URL inválida.” / “Ungültige URL.” / “Invalid URL.”
- Confirmation/destructive: “Logos atualizados.” / “Logos aktualisiert.” / “Logos refreshed.”

**Transactions (Edit + Export)**
- Primary action: “Salvar alterações” / “Änderungen speichern” / “Save changes”
- Helper text: “Revise a categoria antes de salvar.” / “Kategorie vor dem Speichern prüfen.” / “Review category before saving.”
- Empty state: “Sem transações.” / “Keine Transaktionen.” / “No transactions.”
- Validation error: “Categoria obrigatória.” / “Kategorie erforderlich.” / “Category required.”
- Confirmation/destructive: “Transação atualizada.” / “Transaktion aktualisiert.” / “Transaction updated.”

**Budgets & Goals**
- Primary action: “Salvar orçamento” / “Budget speichern” / “Save budget”
- Helper text: “Defina o limite mensal.” / “Monatslimit festlegen.” / “Set monthly limit.”
- Empty state: “Nenhum orçamento.” / “Keine Budgets.” / “No budgets.”
- Validation error: “Valor inválido.” / “Ungültiger Betrag.” / “Invalid amount.”
- Confirmation/destructive: “Orçamento salvo.” / “Budget gespeichert.” / “Budget saved.”

**Forecasting**
- Primary action: “Ver agenda” / “Agenda anzeigen” / “View agenda”
- Helper text: “Confiança baseada em histórico.” / “Vertrauen basiert auf Verlauf.” / “Confidence based on history.”
- Empty state: “Sem previsões.” / “Keine Prognosen.” / “No forecasts.”
- Validation error: “Filtro inválido.” / “Ungültiger Filter.” / “Invalid filter.”
- Confirmation/destructive: “Preferências aplicadas.” / “Einstellungen angewendet.” / “Preferences applied.”

**Settings — Data Management**
- Primary action: “Pré-visualizar” / “Vorschau” / “Preview”
- Helper text: “Mostramos diferenças antes de aplicar.” / “Änderungen vorab anzeigen.” / “Show diff before apply.”
- Empty state: “Nenhum arquivo.” / “Keine Datei.” / “No file.”
- Validation error: “Colunas faltando.” / “Fehlende Spalten.” / “Missing columns.”
- Confirmation/destructive: “Mudanças aplicadas.” / “Änderungen angewendet.” / “Changes applied.”

**Settings — Danger Zone**
- Primary action: “Excluir dados” / “Daten löschen” / “Delete data”
- Helper text: “Selecione o escopo.” / “Bereich wählen.” / “Select scope.”
- Empty state: “Nada selecionado.” / “Nichts ausgewählt.” / “Nothing selected.”
- Validation error: “Confirmação incorreta.” / “Falsche Bestätigung.” / “Incorrect confirmation.”
- Confirmation/destructive: “Dados excluídos.” / “Daten gelöscht.” / “Data deleted.”

## 11. Import Reliability Specification (Preview → Confirm → Commit + Parsing Report + Logging)
### Standardized Pipeline
1. **Preview**: parse file, detect format, show 20-row grid + mapping.
2. **Confirm**: show Parsing Report (encoding, delimiter, headers, errors).
3. **Commit**: create upload + transactions; show summary + audit.

### Parsing Report UI Contract
- **Fields**: format, encodingUsed, delimiterUsed, headerFound, requiredMissing, rowsTotal, rowsImported, warnings, rowErrors(sample), previewRows.
- **Status Panel**: `status` (ok/warn/error), `request_id`, `upload_id`, `hash`, `sample_errors`.

### Logging Contract (DB + UI)
- DB: `upload_diagnostics` (Sparkasse) + `upload_errors` for row issues.
- UI: show `error_code`, `error_message`, `upload_id`, `rows_total`, `rows_imported`.

### Reasons Why Upload Didn’t Work (DB + UI)
- **DB fields**: `upload_diagnostics.error_code`, `upload_diagnostics.error_message`, `upload_diagnostics.error_details`, `upload_diagnostics.row_errors`, `uploads.status=error`, `upload_errors` rows.
- **UI payload**: `request_id`, `upload_id`, `source`, `encoding`, `delimiter`, `header_found`, `missing_columns`, `rows_total`, `rows_imported`, `sample_row_errors`.
- **Standard reasons (code → next action)**:
  - FILE_EMPTY → “Arquivo vazio.” / reexport CSV
  - HEADER_MISSING_REQUIRED → “Faltam colunas obrigatórias.” / verify headers
  - DELIMITER_MISMATCH → “Delimitador incorreto.” / choose correct separator
  - ENCODING_DETECT_FAILED → “Codificação inválida.” / try UTF-8 or Latin1
  - CSV_PARSE_FAILED → “Falha ao ler CSV.” / check quotes & line breaks
  - DATE_PARSE_FAILED → “Data inválida.” / fix date format
  - AMOUNT_PARSE_FAILED → “Valor inválido.” / fix decimal separator

### Sample CSV Analysis (available files)
**Miles & More (attached_assets/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv)**
- **Delimiter**: `;`.
- **Encoding**: UTF-8.
- **Date format**: `dd.MM.yyyy`.
- **Decimal**: comma decimal (`-253,09`).
- **Header anomalies**: first line contains card info, blank line before header.
- **Pitfalls**: empty “Processed on”; foreign currency columns duplicated (“Currency”).
- **Likely failure modes**: missing header line, delimiter changed to comma, locale decimal in wrong column.
- **Validation checklist**: required headers present, amount parseable, date parseable, description non-empty.
- **User-facing error + next action**:
  - “Cabeçalho inválido. Reexporte o CSV do Miles & More.” / “Ungültiger Header. Export erneut.” / “Invalid header. Re-export.”

**American Express (attached_assets/activity_(8)_1766875792745.csv)**
- **Delimiter**: `,`.
- **Encoding**: UTF-8.
- **Date format**: `dd/MM/yyyy`.
- **Decimal**: comma decimal with quotes (`"94,23"`).
- **Header anomalies**: column `Konto #` (space + #), multi-line addresses in quoted fields.
- **Pitfalls**: multiline fields; commas inside quotes; mixed diacritics in addresses.
- **Likely failure modes**: quotes not closed, line breaks splitting rows, missing `Datum`/`Beschreibung` headers.
- **Validation checklist**: quoted fields intact, amount parseable, date parseable, description non-empty.
- **User-facing error + next action**:
  - “Campos com múltiplas linhas detectados. Reexporte como CSV padrão.” / “Mehrzeilige Felder erkannt.” / “Multiline fields detected.”

**Sparkasse**
- **Sample file**: not found in repo. Detection uses `sparkasse-pipeline`.
- **Expected delimiter**: `;`.
- **Date format**: `dd.MM.yyyy` or `dd.MM.yy`.
- **Headers**: Auftragskonto, Buchungstag, Verwendungszweck, Betrag (others tolerated).
- **Likely failure modes**: encoding mismatch (latin1), header missing, delimiter mismatch.
- **Validation checklist**: required headers present, date parseable, amount parseable.
- **User-facing error + next action**:
  - “CSV Sparkasse inválido: faltam colunas.” / “Sparkasse CSV ungültig.” / “Sparkasse CSV invalid.”

## 12. Data Integrity, Versioning, and Audit Trail Strategy (UX-facing)
- Every data mutation emits an audit event with `user_id`, `entity`, `before`, `after`, `timestamp`.
- Show audit summaries after bulk actions (imports, rule reapply, deletions).
- Enforce classification completeness: block commit if leafId missing.
- Maintain version_id on app categories for diffing taxonomy imports.

## 13. Implementation Roadmap (phases, risks, acceptance criteria)
### Phase 1 — MVP Hardening
- Enforce Preview → Confirm → Commit for imports and bulk updates.
- Add Parsing Report + Import History + Conflict Resolution.
- Introduce Status component + request IDs.
- **Acceptance criteria**: import pipeline shows preview/report; localization regression checklist passes; unit tests for parsing.

### Phase 2 — Scale Features
- Unify classification flows (review queue, rules, aliases) with impact preview.
- Add forecasting agenda with confidence; recurrence visibility.
- **Acceptance criteria**: recurring signals visible; forecast view uses recurringGroup.

### Phase 3 — Polish & Trust
- Localization system (PT/DE/EN) with string registry.
- Accessibility and visual polish (spacing, truncation, alignment).
- **Acceptance criteria**: PT/DE/EN parity for critical screens; UX QA checklist complete.

## 14. Ticket-Ready Backlog (epics → tickets, DoD, tests)
### Epic 1: Import Reliability
- Ticket: Import Wizard UI + Preview → Confirm → Commit flow.
- Ticket: Parsing Report screen with diagnostics panel.
- Ticket: Conflict Resolution screen for duplicates.
- **DoD**: preview requires confirm; errors show status panel.
- **Tests**: parsing unit tests, import integration tests.

### Epic 2: Classification Trust
- Ticket: Review Queue with leaf picker + rule creation preview.
- Ticket: Rules Manager impact preview + retroactive scope.
- **DoD**: leaf required; keyword expressions preserved.
- **Tests**: rule matching unit tests, review queue integration tests.

### Epic 3: Localization
- Ticket: String registry + language selector.
- Ticket: PT/DE/EN microcopy coverage for imports, review, settings.
- **DoD**: no broken diacritics, export previews correct.
- **Tests**: localization regression checklist.

### Epic 4: Forecasting
- Ticket: Forecast agenda view with confidence levels.
- Ticket: Recurrence signals in transaction detail.
- **DoD**: recurringGroup data displayed; confidence shown.
- **Tests**: recurrence heuristic tests.

## 15. Open Decisions / Follow-ups
- Auth strategy: keep demo login vs add Supabase Auth.
- Data export scope: per account vs per month.
- Conflict resolution rules for duplicates across sources.
- Storage: continue local logos vs fully migrate to Supabase storage.

---

## Re-run instructions
See `docs/prompts/UX_UI_MASTER_PLAN_PROMPT.md` for the exact prompt and run steps.
