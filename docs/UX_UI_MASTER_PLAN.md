# UX/UI Master Plan — RitualFin

**Last Updated**: 2026-01-02
**Scope**: Full app UX/UI + product specification with engineer-executable contracts for all screens and flows.

## 1. Executive Summary
RitualFin will preserve the current visual language while standardizing end-to-end workflows across imports, classification, aliases/logos, forecasting, and settings. This plan formalizes the entire surface area, enforces Preview → Confirm → Commit for destructive actions, and elevates observability to a visible on-screen status component with debug payloads. The goal is a localized, reliable, and auditable experience that can be implemented without ambiguity.

## 2. Product North Star (RitualFin)
- RitualFin helps users import and classify every transaction with clarity and trust.
- Every change is explainable: what changed, why it changed, and how to recover.
- Localization (PT-BR, DE-DE, EN-US) and data integrity are always first-class.

## 3. Design Principles (RitualFin-specific, aligned to current UI)
- Preserve the existing UI: card-based layouts, gradient sidebar, muted backgrounds, and compact data tables.
- Reduce cognitive load: single primary action per screen; advanced controls behind progressive disclosure.
- Preview first, commit last: no irreversible changes without explicit confirmation.
- Classification completeness: each transaction must end with exactly one leaf category.
- Observability is UX: all failures show a visible status panel with reason + next step + debug payload.

## 4. Market Benchmark Synthesis → Practical Patterns
Best-practice patterns (lightweight synthesis):
- Import wizards: source auto-detection, preview grids, and row-level error samples.
- Transactions: sticky headers, aligned amounts, and stable merchant labels.
- Rules: explicit impact preview, strict keyword governance, and review queues.
- Forecasting: confidence indicators and rationale for recurring predictions.
- Settings: clear danger zone with typed confirmation and post-action summary.

RitualFin design rules (aligned to current look & feel):
- All imports have a visible Parsing Report in the same flow context.
- Tables keep current density; improve consistency (row height, icon alignment, truncation with tooltip).
- Rule changes always show impact counts before apply.
- Forecasting surfaces confidence + rationale without changing core navigation.
- All destructive actions end with a summary panel and audit log link.

## 5. Information Architecture (As-Is vs To-Be)
### 5.1 As-Is IA Map (from repo)
- Auth
  - Login (`/`, `/login`)
- Visão Geral
  - Dashboard (`/dashboard`)
  - Calendário (`/calendar`)
  - Transações (`/transactions`)
  - Contas (`/accounts`)
  - Insights (`/insights`)
- Operações
  - Upload (`/uploads`)
  - Lista de Confirmação (`/confirm`)
  - Regras (`/rules`)
  - AI Keywords (`/ai-keywords`)
  - Notificações (`/notifications`)
- Planejamento
  - Orçamento (`/budgets`)
  - Metas (`/goals`)
- Rituais
  - Semanal/Mensal (`/rituals?type=weekly|monthly`)
- Sistema
  - Configurações (`/settings`)

### 5.2 To-Be IA Map (complete app)
- Auth
  - Login / Sign-in
  - First-time Setup (soft onboarding)
- Overview
  - Dashboard
  - Forecast & Recurrence
- Transactions
  - Transactions List
  - Transaction Detail (drawer/modal)
  - Export
- Imports
  - Import Wizard (auto-detect + manual override)
  - Import Preview Grid
  - Parsing Report
  - Import History
  - Conflict Resolution (duplicates/overlaps)
- Classification
  - Categories (taxonomy manager)
  - Rules Manager (keywords + exclusions)
  - Review Queue
- Aliases & Logos
  - Alias Definitions
  - Logo Management
- Planning
  - Budgets
  - Goals
- Calendar & Rituals
  - Calendar (month/week)
  - Event Detail
  - Rituals (weekly/monthly)
- Settings
  - Profile & Preferences
  - Localization
  - Data Management (download/edit/upload with diff)
  - Integrations
  - Audit Log
  - Danger Zone

### 5.3 Repo Audit Highlights (mandatory)
- **Routes/screens**: defined in `client/src/App.tsx` with Wouter (see As-Is map above).
- **Navigation/IA**: sidebar clusters in `client/src/components/layout/sidebar.tsx` (Visão Geral, Operações, Planejamento, Rituais, Sistema).
- **Shared components/UI kit**: shadcn-style components in `client/src/components/ui/*` with Tailwind; cards, tables, dialog/drawer, sidebar, forms.
- **Localization approach**: strings are hardcoded in PT-BR; dates and numbers use `pt-BR` locale directly; no i18n system.
- **CSV import implementation**:
  - Frontend: `client/src/pages/uploads.tsx` handles preview + process; detects encoding via TextDecoder; uses `/imports/preview` and `/uploads/process`.
  - Backend: `server/csv-parser.ts` auto-detects bank formats; `server/csv-imports.ts` handles contract-driven imports with delimiter/encoding detection and row samples.
- **Supabase usage patterns**: not present in runtime code; DB via `drizzle-orm` + `pg` with `DATABASE_URL`. No explicit RLS or Supabase storage.
- **Storage/CDN**: logos stored in `public/logos` via `server/logo-downloader.ts`.
- **Logging**: JSON console logger (`server/logger.ts`), audit logs in `audit_logs`, upload diagnostics in `upload_diagnostics`.

### 5.4 Prioritized Gap List
1) Import pipeline lacks explicit Preview → Confirm → Commit in UI, and Parsing Report is not a dedicated screen.
2) Review queue lacks an explicit impact preview for rule changes.
3) Localization is hardcoded PT-BR with no triplet system.
4) Observability exists in logs but is not consistently surfaced on-screen.
5) Forecasting/recurrence lacks a confidence model and rationale display.

## 6. End-to-End User Journeys (happy path + failure recovery)
### 6.1 Auth & First-time Setup
- Happy path: login → choose language/currency → landing on empty dashboard with import call-to-action.
- Recovery: invalid credentials → localized error + retry.

### 6.2 Imports (M&M / Amex / Sparkasse)
- Happy path: upload → auto-detect → preview → confirm → commit → review queue.
- Recovery: delimiter/header error → parsing report → fix guidance → re-upload.

### 6.3 Transactions + Review Queue
- Happy path: filter list → open detail → assign leaf → confirm; optional rule creation.
- Recovery: conflicting rule → show conflict reason + override options.

### 6.4 Rules Management
- Happy path: create/edit rule → preview impact → confirm → apply retroactively.
- Recovery: zero-impact warning → cancel or adjust.

### 6.5 Aliases + Logos
- Happy path: edit aliases → preview diff → confirm → logos queued for download.
- Recovery: logo URL invalid → show error + retry.

### 6.6 Budget/Forecast
- Happy path: set budget → view deltas → forecast shows upcoming recurring items.
- Recovery: insufficient data → empty state + guidance to import.

### 6.7 Settings & Danger Zone
- Happy path: export → edit → preview diff → confirm → audit record.
- Recovery: invalid CSV → parsing report, no changes applied.

## 7. Screen Inventory (As-Is vs To-Be)
### 7.1 As-Is Screens
Login, Dashboard, Notifications, Calendar, Event Detail, Goals, Budgets, Rituals, Uploads, Confirm Queue, Transactions, Rules, Merchant Dictionary, Accounts, AI Keywords, Insights, Settings, Not Found.

### 7.2 To-Be Screens
All As-Is plus: Import Wizard, Import Preview Grid, Parsing Report, Import History, Conflict Resolution, Categories Manager, Rules Manager (expanded), Review Queue (expanded), Alias Definitions, Logo Management, Forecast & Recurrence, Export (explicit), Data Management with diff preview, Audit Log view, Danger Zone.

## 8. Screen Contracts (one subsection per screen)
Each contract includes route/placement, JTBD, data dependencies, inputs/outputs, state model, validation, errors + debug payload, audit events, and microcopy triplets (PT/DE/EN).

### 8.1 Login / Auth
- **Route**: `/login` (and `/`)
- **Nav placement**: standalone
- **JTBD**: authenticate via email/password or Google.
- **Data dependencies**: tables `users`, `settings`; endpoints `POST /auth/login`, `GET /auth/me`.
- **Inputs/Outputs**: credentials → session + redirect.
- **States**: loading | success | error.
- **Validation**: email format, password length >= 8 (front + back).
- **Errors (user + payload)**: `AUTH_INVALID` — "Credenciais inválidas" / "Ungültige Zugangsdaten" / "Invalid credentials"; payload `{requestId}`.
- **Audit events**: `auth.login.success`, `auth.login.failure`.
- **Microcopy (PT/DE/EN)**:
  - Primary: "Entrar" / "Anmelden" / "Sign in"
  - Helper: "Use seu e-mail e senha" / "E-Mail und Passwort verwenden" / "Use your email and password"
  - Error: "Credenciais inválidas. Tente novamente." / "Ungültige Zugangsdaten. Bitte erneut versuchen." / "Invalid credentials. Try again."

### 8.2 Dashboard
- **Route**: `/dashboard`
- **Nav placement**: Visão Geral
- **JTBD**: view monthly health, budgets, recent imports, and alerts.
- **Data dependencies**: tables `transactions`, `budgets`, `uploads`, `goals`; endpoint `GET /dashboard`.
- **Inputs/Outputs**: month selector → summary + charts.
- **States**: loading | empty | partial | error | success.
- **Validation**: month `YYYY-MM`.
- **Errors**: `DASHBOARD_LOAD_FAILED` — localized message; payload `{month, requestId}`.
- **Audit events**: `dashboard.viewed` (optional).
- **Microcopy**:
  - Primary: "Ver detalhes" / "Details ansehen" / "View details"
  - Helper: "Baseado nas importações mais recentes" / "Basierend auf den letzten Importen" / "Based on recent imports"
  - Empty: "Ainda não há transações neste mês." / "Noch keine Transaktionen in diesem Monat." / "No transactions for this month yet."

### 8.3 Transactions List
- **Route**: `/transactions`
- **Nav placement**: Visão Geral
- **JTBD**: scan, filter, and update transactions; open detail drawer.
- **Data dependencies**: `transactions`, `rules`, `alias_assets`, `merchant_icons`; endpoint `GET /transactions`.
- **Inputs/Outputs**: filters/search → list updates; export → CSV.
- **States**: loading | empty | error | success.
- **Validation**: date range validity; numeric filters.
- **Errors**: `TX_LIST_FAILED` — localized message; payload `{month, filters, requestId}`.
- **Audit events**: `transactions.exported`, `transactions.bulk_updated`.
- **Microcopy**:
  - Primary: "Exportar CSV" / "CSV exportieren" / "Export CSV"
  - Helper: "Filtre por categoria, valor ou origem" / "Nach Kategorie, Betrag oder Quelle filtern" / "Filter by category, amount, or source"
  - Empty: "Nenhuma transação encontrada." / "Keine Transaktionen gefunden." / "No transactions found."

### 8.4 Transaction Detail Drawer
- **Route**: overlay from `/transactions` and `/confirm`
- **Nav placement**: contextual
- **JTBD**: inspect raw fields, alias, category, recurrence signals.
- **Data dependencies**: `transactions`, `rules`, `taxonomy_leaf`; endpoint `PATCH /transactions/:id`.
- **Inputs/Outputs**: update category/alias/flags → transaction updated.
- **States**: loading | error | success.
- **Validation**: leaf required; alias max length 80.
- **Errors**: `TX_UPDATE_FAILED` — localized message; payload `{transactionId, requestId}`.
- **Audit events**: `transaction.updated` (before/after diff).
- **Microcopy**:
  - Primary: "Salvar" / "Speichern" / "Save"
  - Helper: "Classificação final obrigatória" / "Endgültige Klassifikation erforderlich" / "Final classification required"
  - Error: "Não foi possível atualizar a transação." / "Transaktion konnte nicht aktualisiert werden." / "Could not update transaction."

### 8.5 Uploads / Import Wizard
- **Route**: `/uploads` (To-Be: `/imports`)
- **Nav placement**: Imports
- **JTBD**: upload CSV, auto-detect source, preview, and confirm.
- **Data dependencies**: `uploads`, `upload_diagnostics`; endpoints `POST /imports/preview`, `POST /uploads/process`, `GET /uploads`.
- **Inputs/Outputs**: file + import date → preview payload → confirmed import.
- **States**: idle | previewing | confirm-ready | importing | error | success.
- **Validation**: file extension `.csv`, size < 10MB, import date required.
- **Errors**: `IMPORT_PREVIEW_FAILED` — localized message; payload `{reasonCodes, importRunId, requestId}`.
- **Audit events**: `import.previewed`, `import.committed`.
- **Microcopy**:
  - Primary: "Pré-visualizar" / "Vorschau" / "Preview"
  - Confirmation: "Confirmar importação" / "Import bestätigen" / "Confirm import"
  - Error: "Falha ao ler o arquivo." / "Datei konnte nicht gelesen werden." / "Could not read the file."

### 8.6 Import Preview Grid
- **Route**: step within import wizard
- **Nav placement**: Imports
- **JTBD**: show first 20 rows and header validation.
- **Data dependencies**: import preview payload.
- **States**: loading | preview | error.
- **Validation**: headers must match contract; row lengths consistent.
- **Errors**: `HEADER_MISMATCH` or `ROW_SHAPE_INVALID` — localized; payload `{headerFound, headerDiff, rowSamples, requestId}`.
- **Audit events**: `import.previewed`.
- **Microcopy**:
  - Primary: "Continuar" / "Weiter" / "Continue"
  - Helper: "Revise colunas e valores" / "Spalten und Werte prüfen" / "Review columns and values"
  - Error: "Cabeçalhos incompatíveis." / "Kopfzeilen nicht kompatibel." / "Headers do not match."

### 8.7 Parsing Report
- **Route**: `/imports/report` (embedded)
- **Nav placement**: Imports
- **JTBD**: explain parsing decisions and errors.
- **Data dependencies**: `import_runs`, `upload_diagnostics`.
- **States**: success | warning | error.
- **Validation**: display detected encoding/delimiter.
- **Errors**: `PARSING_FAILED` — localized; payload `{reasonCodes, rowErrorSamples, importRunId}`.
- **Audit events**: `import.report.viewed`.
- **Microcopy**:
  - Primary: "Ver relatório" / "Bericht anzeigen" / "View report"
  - Helper: "Inclui erros por linha" / "Enthält Zeilenfehler" / "Includes row-level errors"

### 8.8 Import History
- **Route**: `/imports/history`
- **Nav placement**: Imports
- **JTBD**: audit past uploads and outcomes.
- **Data dependencies**: `uploads`, `import_runs`, `upload_errors`.
- **States**: loading | empty | error | success.
- **Errors**: `IMPORT_HISTORY_FAILED` — localized; payload `{requestId}`.
- **Microcopy**:
  - Empty: "Nenhum upload registrado." / "Keine Uploads gefunden." / "No uploads yet."
  - Helper: "Clique para ver detalhes" / "Klicken für Details" / "Click to view details"

### 8.9 Conflict Resolution
- **Route**: `/imports/conflicts` (or wizard step)
- **Nav placement**: Imports
- **JTBD**: resolve duplicates/overlaps before commit.
- **Data dependencies**: `transactions`, `uploads`.
- **States**: loading | decision | error | success.
- **Validation**: show diff counts; require explicit choice.
- **Errors**: `DUPLICATE_RESOLUTION_FAILED` — localized; payload `{duplicateIds, requestId}`.
- **Microcopy**:
  - Primary: "Manter existentes" / "Vorhandene behalten" / "Keep existing"
  - Secondary: "Substituir" / "Ersetzen" / "Replace"

### 8.10 Review Queue (Confirm)
- **Route**: `/confirm`
- **Nav placement**: Operações
- **JTBD**: classify open transactions with leaf categories.
- **Data dependencies**: `transactions`, `taxonomy_leaf`, `rules`; endpoint `GET /classification/review-queue`, `POST /transactions/confirm`.
- **States**: loading | empty | error | success.
- **Validation**: leaf required; keywords separated by `;` only.
- **Errors**: `REVIEW_ASSIGN_FAILED` — localized; payload `{transactionId, leafId, requestId}`.
- **Audit events**: `review.assigned`, `rule.created`.
- **Microcopy**:
  - Primary: "Aplicar classificação" / "Klassifikation anwenden" / "Apply classification"
  - Helper: "Expressões separadas por “;”" / "Ausdrücke getrennt durch “;”" / "Expressions separated by “;”"
  - Empty: "Fila vazia. Tudo classificado." / "Warteschlange leer. Alles klassifiziert." / "Queue empty. All classified."

### 8.11 Rules Manager
- **Route**: `/rules`
- **Nav placement**: Operações
- **JTBD**: manage keyword rules and exclusions.
- **Data dependencies**: `rules`, `taxonomy_leaf`; endpoints `GET /rules`, `POST /rules`, `PATCH /rules/:id`, `DELETE /rules/:id`, `POST /rules/:id/apply`.
- **States**: loading | empty | error | success.
- **Validation**: keywords as atomic expressions separated by `;`.
- **Errors**: `RULE_UPDATE_FAILED` — localized; payload `{ruleId, requestId}`.
- **Audit events**: `rule.created`, `rule.updated`, `rule.deleted`.
- **Microcopy**:
  - Primary: "Salvar regra" / "Regel speichern" / "Save rule"
  - Helper: "Não dividir expressões" / "Ausdrücke nicht trennen" / "Do not split expressions"
  - Error: "Falha ao salvar regra." / "Regel konnte nicht gespeichert werden." / "Failed to save rule."

### 8.12 Categories (taxonomy manager)
- **Route**: `/classification/categories` (new)
- **Nav placement**: Classification
- **JTBD**: manage Nivel 1/2/3 taxonomy and UI grouping.
- **Data dependencies**: `taxonomy_level_1`, `taxonomy_level_2`, `taxonomy_leaf`, `app_category`.
- **States**: loading | error | success.
- **Validation**: each leaf must belong to one level2; each transaction maps to one leaf.
- **Errors**: `TAXONOMY_UPDATE_FAILED` — localized; payload `{levelId, requestId}`.
- **Audit events**: `taxonomy.updated`.
- **Microcopy**:
  - Primary: "Adicionar categoria" / "Kategorie hinzufügen" / "Add category"
  - Helper: "Nível 3 é obrigatório" / "Ebene 3 ist erforderlich" / "Level 3 is required"

### 8.13 AI Keywords
- **Route**: `/ai-keywords`
- **Nav placement**: Operações
- **JTBD**: suggest keywords from uncategorized transactions.
- **Data dependencies**: AI endpoints; `transactions`.
- **States**: loading | error | success.
- **Validation**: confirmation before apply.
- **Errors**: `AI_KEYWORDS_FAILED` — localized; payload `{requestId}`.
- **Audit events**: `ai.keywords.applied`.
- **Microcopy**:
  - Primary: "Aplicar sugestões" / "Vorschläge anwenden" / "Apply suggestions"
  - Error: "Erro ao analisar transações." / "Fehler bei der Analyse." / "Error analyzing transactions."

### 8.14 Merchant Dictionary (Aliases)
- **Route**: `/merchant-dictionary`
- **Nav placement**: Operações (As-Is) / Aliases & Logos (To-Be)
- **JTBD**: manage alias_desc and key_words_alias.
- **Data dependencies**: `key_desc_map`, `alias_assets`, `merchant_descriptions`; endpoints `/merchant-descriptions`.
- **States**: loading | empty | error | success.
- **Validation**: alias required; keywords separated by `;`.
- **Errors**: `ALIAS_UPDATE_FAILED` — localized; payload `{aliasDesc, requestId}`.
- **Audit events**: `alias.created`, `alias.updated`.
- **Microcopy**:
  - Primary: "Salvar alias" / "Alias speichern" / "Save alias"
  - Helper: "Use “;” para separar expressões" / "„;“ zum Trennen verwenden" / "Use “;” to separate expressions"

### 8.15 Logo Management
- **Route**: `/merchant-dictionary/logos` (new)
- **Nav placement**: Aliases & Logos
- **JTBD**: manage logo URLs, download status, and local paths.
- **Data dependencies**: `merchant_icons`, `alias_assets`, storage `public/logos`; endpoint `/merchant-icons`.
- **States**: loading | error | success.
- **Validation**: allowed mime `png|jpeg|svg`, max 2MB.
- **Errors**: `LOGO_DOWNLOAD_FAILED` — localized; payload `{aliasDesc, url, requestId}`.
- **Audit events**: `logo.downloaded`, `logo.failed`.
- **Microcopy**:
  - Primary: "Baixar logo" / "Logo herunterladen" / "Download logo"
  - Error: "Formato de logo não suportado." / "Logo-Format nicht unterstützt." / "Unsupported logo format."

### 8.16 Accounts
- **Route**: `/accounts`
- **Nav placement**: Visão Geral
- **JTBD**: manage bank accounts/cards.
- **Data dependencies**: `accounts`; endpoints `/accounts`.
- **States**: loading | empty | error | success.
- **Validation**: name required; type in enum.
- **Errors**: `ACCOUNT_SAVE_FAILED` — localized; payload `{accountId, requestId}`.
- **Audit events**: `account.created`, `account.updated`, `account.archived`.
- **Microcopy**:
  - Primary: "Salvar conta" / "Konto speichern" / "Save account"
  - Error: "Erro ao salvar conta." / "Konto konnte nicht gespeichert werden." / "Failed to save account."

### 8.17 Budgets
- **Route**: `/budgets`
- **Nav placement**: Planejamento
- **JTBD**: set budgets per category.
- **Data dependencies**: `budgets`, `transactions`; endpoints `/budgets`.
- **States**: loading | empty | error | success.
- **Validation**: amount numeric > 0.
- **Errors**: `BUDGET_SAVE_FAILED` — localized; payload `{budgetId, requestId}`.
- **Audit events**: `budget.created`, `budget.updated`.
- **Microcopy**:
  - Primary: "Salvar orçamento" / "Budget speichern" / "Save budget"
  - Error: "Preencha todos os campos." / "Bitte alle Felder ausfüllen." / "Please fill all fields."

### 8.18 Goals
- **Route**: `/goals`
- **Nav placement**: Planejamento
- **JTBD**: set monthly targets and category goals.
- **Data dependencies**: `goals`, `category_goals`; endpoints `/goals`, `/goals/:id/categories`.
- **States**: loading | empty | error | success.
- **Validation**: amounts numeric; month format.
- **Errors**: `GOAL_SAVE_FAILED` — localized; payload `{goalId, requestId}`.
- **Audit events**: `goal.created`, `goal.updated`, `goal.deleted`.
- **Microcopy**:
  - Primary: "Salvar meta" / "Ziel speichern" / "Save goal"
  - Helper: "Valores mensais" / "Monatliche Werte" / "Monthly values"

### 8.19 Calendar
- **Route**: `/calendar`
- **Nav placement**: Visão Geral
- **JTBD**: view recurring events and month aggregates.
- **Data dependencies**: `calendar_events`, `event_occurrences`, `transactions`.
- **States**: loading | empty | error | success.
- **Validation**: dates in range.
- **Errors**: `CALENDAR_LOAD_FAILED` — localized; payload `{month, requestId}`.
- **Audit events**: `calendar.viewed`.
- **Microcopy**:
  - Primary: "Novo evento" / "Neues Ereignis" / "New event"
  - Empty: "Nenhum evento neste mês." / "Keine Ereignisse in diesem Monat." / "No events this month."

### 8.20 Event Detail
- **Route**: `/calendar/:id`
- **Nav placement**: Calendar
- **JTBD**: manage recurring event, view occurrences.
- **Data dependencies**: `calendar_events`, `event_occurrences`; endpoints `/calendar-events`.
- **States**: loading | error | success.
- **Validation**: amount numeric; recurrence enum.
- **Errors**: `EVENT_UPDATE_FAILED` — localized; payload `{eventId, requestId}`.
- **Audit events**: `event.updated`, `event.deleted`.
- **Microcopy**:
  - Primary: "Atualizar evento" / "Ereignis aktualisieren" / "Update event"
  - Error: "Erro ao atualizar evento." / "Ereignis konnte nicht aktualisiert werden." / "Failed to update event."

### 8.21 Rituals (Weekly/Monthly)
- **Route**: `/rituals?type=weekly|monthly`
- **Nav placement**: Rituais
- **JTBD**: review planned vs actual and mark completion.
- **Data dependencies**: `rituals`, `goals`, `transactions`; endpoints `/rituals`.
- **States**: loading | empty | error | success.
- **Validation**: notes optional.
- **Errors**: `RITUAL_SAVE_FAILED` — localized; payload `{ritualId, requestId}`.
- **Audit events**: `ritual.completed`.
- **Microcopy**:
  - Primary: "Concluir ritual" / "Ritual abschließen" / "Complete ritual"
  - Helper: "Resumo da semana/mês" / "Wochen-/Monatsübersicht" / "Weekly/monthly summary"

### 8.22 Insights
- **Route**: `/insights`
- **Nav placement**: Visão Geral
- **JTBD**: surface trends and category breakdowns.
- **Data dependencies**: `transactions`, `budgets`.
- **States**: loading | empty | error | success.
- **Errors**: `INSIGHTS_LOAD_FAILED` — localized; payload `{requestId}`.
- **Microcopy**:
  - Primary: "Ver mais" / "Mehr anzeigen" / "View more"
  - Empty: "Sem dados suficientes." / "Nicht genügend Daten." / "Not enough data."

### 8.23 Notifications
- **Route**: `/notifications`
- **Nav placement**: Operações
- **JTBD**: view system/import alerts.
- **Data dependencies**: `notifications`.
- **States**: loading | empty | error | success.
- **Errors**: `NOTIFICATIONS_LOAD_FAILED` — localized; payload `{requestId}`.
- **Microcopy**:
  - Empty: "Nenhuma notificação." / "Keine Benachrichtigungen." / "No notifications."

### 8.24 Settings (Hub)
- **Route**: `/settings`
- **Nav placement**: Sistema
- **JTBD**: manage preferences, data, and dangerous actions.
- **Data dependencies**: `settings`; endpoints `/settings`.
- **States**: loading | error | success.
- **Validation**: language in {pt-BR,de-DE,en-US}.
- **Errors**: `SETTINGS_SAVE_FAILED` — localized; payload `{requestId}`.
- **Audit events**: `settings.updated`.
- **Microcopy**:
  - Primary: "Salvar configurações" / "Einstellungen speichern" / "Save settings"
  - Helper: "Preferências gerais" / "Allgemeine Einstellungen" / "General preferences"

### 8.25 Settings → Data Management
- **Route**: `/settings/data`
- **Nav placement**: Settings
- **JTBD**: download/edit/upload datasets with diff preview.
- **Data dependencies**: CSV contracts, `import_runs`; endpoints `/data-imports/preview`, `/data-imports/confirm`.
- **States**: loading | preview | error | success.
- **Validation**: contract headers and delimiter; no auto-edit of keywords.
- **Errors**: `DATA_IMPORT_FAILED` — localized; payload `{importRunId, reasonCodes, requestId}`.
- **Audit events**: `data.import.previewed`, `data.import.committed`.
- **Microcopy**:
  - Primary: "Pré-visualizar alterações" / "Änderungen prüfen" / "Preview changes"
  - Confirmation: "Aplicar alterações" / "Änderungen anwenden" / "Apply changes"

### 8.26 Settings → Localization
- **Route**: `/settings/localization`
- **Nav placement**: Settings
- **JTBD**: set language, currency, fiscal region.
- **Data dependencies**: `settings`.
- **States**: loading | error | success.
- **Validation**: language enum; currency ISO.
- **Errors**: `LOCALIZATION_SAVE_FAILED` — localized; payload `{requestId}`.
- **Audit events**: `settings.updated`.
- **Microcopy**:
  - Primary: "Atualizar idioma" / "Sprache aktualisieren" / "Update language"

### 8.27 Settings → Audit Log
- **Route**: `/settings/audit`
- **Nav placement**: Settings
- **JTBD**: view/export audit trail.
- **Data dependencies**: `audit_logs`; endpoints `/audit-logs`.
- **States**: loading | empty | error | success.
- **Errors**: `AUDIT_LOAD_FAILED` — localized; payload `{requestId}`.
- **Audit events**: `audit.exported`.
- **Microcopy**:
  - Primary: "Exportar log" / "Protokoll exportieren" / "Export log"
  - Empty: "Sem registros ainda." / "Noch keine Einträge." / "No records yet."

### 8.28 Settings → Danger Zone
- **Route**: `/settings/danger`
- **Nav placement**: Settings
- **JTBD**: delete datasets with typed confirmation.
- **Data dependencies**: `resetApi.deleteData`, `audit_logs`.
- **States**: idle | confirm | deleting | error | success.
- **Validation**: typed confirmation string.
- **Errors**: `DANGER_DELETE_FAILED` — localized; payload `{actionId, requestId}`.
- **Audit events**: `danger.delete` with dataset list.
- **Microcopy**:
  - Primary: "Excluir dados" / "Daten löschen" / "Delete data"
  - Confirmation: "Digite APAGAR" / "LÖSCHEN eingeben" / "Type DELETE"

### 8.29 Forecast & Recurrence
- **Route**: `/forecast`
- **Nav placement**: Overview
- **JTBD**: show predicted recurring payments with confidence.
- **Data dependencies**: `transactions` recurring fields, `calendar_events`.
- **States**: loading | empty | error | success.
- **Validation**: confidence 0-100.
- **Errors**: `FORECAST_LOAD_FAILED` — localized; payload `{requestId}`.
- **Audit events**: `forecast.viewed`.
- **Microcopy**:
  - Primary: "Ver calendário" / "Kalender anzeigen" / "View calendar"
  - Helper: "Confiança calculada" / "Berechnete Zuversicht" / "Calculated confidence"

### 8.30 Not Found
- **Route**: `*`
- **Nav placement**: none
- **JTBD**: route recovery.
- **States**: error only.
- **Microcopy**:
  - Primary: "Voltar ao Dashboard" / "Zurück zum Dashboard" / "Back to Dashboard"

## 9. UI Kit & Interaction Standards (keep current style)
- Use existing components in `client/src/components/ui` (shadcn-style) with current Tailwind tokens.
- Maintain card density; align icons consistently; use truncation + tooltip in tables.
- Keep sidebar gradient and current typography; avoid introducing new font stacks.
- Buttons: primary for commit actions, ghost for secondary, destructive for danger zone.
- Modals/drawers: use existing dialog/drawer with consistent padding and header hierarchy.
- Status component: a visible in-page status block for errors and warnings (not only toasts).

## 10. Content System & Microcopy Guidelines (PT/DE/EN)
- All strings must be localized with PT/DE/EN triplets.
- No broken accents/diacritics in UI or exported files.
- Keyword expressions are atomic, separated by `;` and never auto-split.
- Confirmations for destructive actions always include an explicit action label.

## 11. Import Reliability Specification (Preview/Confirm/Commit + Parsing Report + Logging)
### 11.1 Standardized Import Pipeline
1) **Preview**: parse + validate, return detected encoding, delimiter, header diff, row errors.
2) **Confirm**: show summary + conflict resolution options.
3) **Commit**: apply import, create audit log + import run record.

### 11.2 Parsing Report UI Contract
- **Required fields**: encodingUsed, delimiterUsed, headersFound, headerDiff, rowsTotal, rowsValid, rowErrorSamples, reasonCodes, canonicalCsvHash.
- **UI**: show reason summary + 5 sample row errors + download corrected template.
- **Status component**: always visible on warning/error with diagnostic ids.

### 11.3 Reasons Why Upload Didn’t Work (Logging Contract)
- **DB**: write to `upload_diagnostics` + `import_runs` with reason codes and samples.
- **UI**: show user-facing reason + next actions; surface diagnostic ids.

### 11.4 Sample CSV Analysis (first 20 rows)
**Miles & More (attached_assets/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv)**
- Delimiter: `;`
- Encoding: likely UTF-8 or ISO-8859-1 (contains umlauts).
- Date format: `dd.MM.yyyy`
- Decimal: comma (e.g., `-253,09`)
- Header anomalies: preface line + blank line before header; duplicate header “Currency”.
- Pitfalls: mixed “Amount in foreign currency” + duplicate header.
- Failure modes:
  1) Extra leading line breaks header detection.
  2) Comma decimal interpreted as delimiter in some locales.
  3) Duplicate header names cause mapping ambiguity.
- Validation checklist:
  - Skip leading non-header lines.
  - Confirm required columns.
  - Detect duplicate headers and map by position.
- User-facing error examples:
  - PT: "Cabeçalho inválido. Remova linhas antes do cabeçalho."
  - DE: "Ungültige Kopfzeile. Entfernen Sie Zeilen vor der Kopfzeile."
  - EN: "Invalid header. Remove lines before the header."

**Sparkasse (attached_assets/20250929-22518260-umsatz_1766876653600.CSV)**
- Delimiter: `;` (quoted fields)
- Encoding: likely windows-1252/ISO-8859-1
- Date formats: `dd.MM.yy` and `dd.MM.yyyy`
- Decimal: comma
- Pitfalls: mixed date precision, heavy quotes, special chars (umlauts).
- Failure modes:
  1) Encoding mismatch yields corrupted umlauts.
  2) Date parsing fails on `dd.MM.yy`.
  3) Line breaks inside Verwendungszweck.
- Validation checklist:
  - Detect encoding from BOM/Windows-1252.
  - Normalize date formats.
  - Validate quoted row length.
- User-facing error examples:
  - PT: "Formato de data inválido em algumas linhas."
  - DE: "Datumsformat in einigen Zeilen ungültig."
  - EN: "Invalid date format in some rows."

**Amex**
- Sample file not found; detect programmatically via headers `Datum`, `Beschreibung`, `Karteninhaber` (comma-separated).
- Failure modes:
  1) Comma delimiter misread as semicolon.
  2) Mixed decimal separators.
  3) Missing required columns.
- Validation checklist:
  - Auto-detect delimiter and header language.
  - Validate date with `dd/MM/yyyy`.
  - Require all mandatory columns.

## 12. Data Integrity, Versioning, and Audit Trail Strategy (UX-facing)
- Every mutation creates `audit_logs` with entity id + before/after diff.
- Rules/aliases imports are versioned; show a diff preview before applying.
- All critical actions surface IDs (uploadId, importRunId, ruleId) in the status panel.
- Transactions must end with exactly one leaf category; UI grouping is only display-level.

## 13. Implementation Roadmap (phases, risks, acceptance criteria)
### Phase 1 — MVP Hardening
- Add localization layer and migrate all strings to PT/DE/EN triplets.
- Implement Parsing Report UI and enforce Preview → Confirm → Commit for imports.
- Acceptance criteria: localization regression checklist; import preview parity; status panel visible on error.

### Phase 2 — Scale Features
- Build Import History + Conflict Resolution screens.
- Expand Rules Manager with impact preview and retroactive scope selection.
- Acceptance criteria: rule impact accuracy; keyword governance unit tests.

### Phase 3 — Polish & Observability
- Forecast & Recurrence screen with confidence + rationale.
- Audit Log exports with filters and localized headers.
- Acceptance criteria: forecast confidence visible; audit export localized.

## 14. Ticket-Ready Backlog (epics → tickets, DoD, tests)
**Epic: Localization & Content System**
- Ticket: Implement i18n dictionary and locale switcher.
- DoD: all screens show PT/DE/EN triplets.
- Tests: regression on accented characters in UI + CSV exports.

**Epic: Import Reliability**
- Ticket: Parsing Report UI from preview payload.
- Ticket: Preview → Confirm → Commit steps with conflict resolution.
- DoD: no import applies without confirmation; status panel shows diagnostics.
- Tests: unit tests for parsing; integration tests for preview/commit.

**Epic: Classification & Rules**
- Ticket: Impact preview for rule changes with counts.
- DoD: rule changes never apply without confirmation.
- Tests: keyword tokenization tests (semicolon-only).

**Epic: Forecast & Recurrence**
- Ticket: Forecast calendar view with confidence display.
- DoD: recurrence signals visible in transaction detail.

## 15. Open Decisions / Follow-ups
- Finalize localization storage format (JSON files vs DB-backed).
- Confirm forecast data source (calendar_events vs recurring_group from transactions).
- Decide conflict resolution placement (inline wizard vs standalone screen).

---

## Re-run Instructions
See `docs/prompts/UX_UI_MASTER_PLAN_PROMPT.md` for the full prompt and steps to regenerate this document.
