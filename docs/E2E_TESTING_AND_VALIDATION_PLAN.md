# RitualFin E2E Testing and Validation Plan

This plan validates UI, workflows, business rules, AI logic, and production deployment for RitualFin. It reflects current repo behavior and routing.

## 0) Current app reality (source of truth)
- Routes /confirm, /rules, /merchant-dictionary, /ai-keywords are legacy and currently redirect to /settings (see client/src/App.tsx). Review queue, rule tests, and alias tests live in Settings > Classificacao & Dados.
- AI assistant modal and Notifications page are UI shells. Validate UI behavior and graceful messaging; backend integration is pending.
- Auth is demo-only (login creates/uses user "demo").
- CSV import supports Miles & More, Amex, Sparkasse with auto-detect (server/csv-parser.ts).
- Categorization is rules-based:
  - Keywords split only by ';' and matched by contains after normalization.
  - Strict rule auto-applies (confidence 100).
  - Category "Interno" sets internalTransfer and excludeFromBudget.
  - manualOverride transactions must not be re-categorized by rules (see /api/rules/reapply-all).
- Production API base resolves to VITE_API_URL + "/api" (client/src/lib/api.ts). Must not call /api on Vercel origin in production.

## 1) Test strategy (multi-approach)
- Manual scripted E2E: validate critical flows and UI details end-to-end with evidence capture.
- Automated browser E2E: Playwright with data seeding and deterministic fixtures.
- API smoke tests: curl coverage for health, auth, uploads, rules, transactions, settings.
- Contract tests: assert response schemas and required fields per endpoint.
- DB integrity tests: SQL invariants for dedupe, unique constraints, referential integrity.
- Observability: verify structured logs, error clarity, AI usage logs if OpenAI enabled.
- Chaos testing: simulate backend down, slow network, DB unavailability, API timeouts.
- Security baseline: auth/session, CORS, input validation, injection checks, secrets scan.
- Performance: CSV upload size/time, dashboard query time, confirm queue rendering.

## 2) Environments and baseline data
- Local dev: Vite + Express on port 5000, DB via Supabase or local PG.
- Staging/Prod: Vercel frontend, Render backend, Supabase DB.
- Baseline reset:
  - UI: Settings > Classificacao & Dados > Danger Zone > Resetar dados.
  - API: POST /api/settings/reset.
- Sample CSV files (repo):
  - Miles & More: attached_assets/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv
  - Amex: attached_assets/activity_(8)_1766875792745.csv
  - Sparkasse: attached_assets/20250929-22518260-umsatz_1766876653600.CSV
- Classification/aliases Excel: use exported templates from Settings to avoid schema drift.

## 3) Priority definitions
- P0: Release blocking, core data integrity, auth/login, import, confirm queue, deployment routing.
- P1: Major feature correctness, reporting accuracy, AI behavior, accessibility.
- P2: Nice-to-have UX, copy, minor visual issues.

## 4) Test ID scheme
- UI/NAV: NAV-xx, LOGIN-xx, DASH-xx, UP-xx, TX-xx, ACC-xx, BUD-xx, GOAL-xx, RIT-xx, CAL-xx, EVT-xx, NOTIF-xx, SET-xx, LEG-xx, NF-xx, AI-UI-xx
- Core logic: CSV-xx, RULE-xx, AI-LOGIC-xx, MANUAL-xx
- Data/DB: DB-xx
- Deployment/ops: DEP-xx, OBS-xx, CHAOS-xx, PERF-xx, SEC-xx, API-xx

## 5) Requirements-to-tests traceability
### UX / UI
- Every page loads and renders without errors -> NAV-01, LOGIN-01, DASH-01, UP-01, TX-01, ACC-01, BUD-01, GOAL-01, RIT-01, CAL-01, EVT-01, NOTIF-01, SET-01, LEG-01, NF-01 (P0)
- All actions (click, submit, modal open/close, filters, search, pagination) -> NAV-02..NAV-06, UP-02..UP-05, TX-02..TX-07, ACC-02..ACC-03, BUD-02..BUD-04, GOAL-02..GOAL-04, RIT-02..RIT-04, CAL-02..CAL-03, EVT-02..EVT-03, SET-02..SET-14 (P0/P1)
- Accessibility for critical flows -> NAV-05, LOGIN-04, UP-02, TX-05, SET-07 (P1)

### Core data & business logic
- Import normalization and key logic -> CSV-01..CSV-06 (P0)
- Dedupe and idempotency -> CSV-04, DB-01 (P0)
- Account attribution -> CSV-05, ACC-01 (P0)
- Rules engine correctness -> RULE-01..RULE-06 (P0)
- Priority and strict rules -> RULE-04..RULE-06 (P0)
- Manual overrides are immutable -> MANUAL-01, RULE-07, DB-03 (P0)
- Goals/Budgets uniqueness -> DB-05 (P1)

### AI & confidence logic
- Auto-confirm obeys settings -> AI-LOGIC-01..AI-LOGIC-03 (P0)
- Threshold boundaries -> AI-LOGIC-02 (P0)
- UI vs backend consistency -> AI-LOGIC-03, TX-06 (P0)
- AI assistant behavior and missing key -> AI-UI-01..AI-UI-03 (P1)
- Guardrails (contains match, no token split, Interno exclusion, manual override) -> RULE-01..RULE-06, MANUAL-01 (P0)

### Deployment & environment correctness
- Frontend calls VITE_API_URL/api -> DEP-01, DEP-02 (P0)
- Vercel SPA rewrites -> DEP-03 (P0)
- Render CORS -> DEP-04 (P0)
- Version/health checks -> DEP-05 (P1)

## 6) Screen-by-screen test cases
Each test lists Preconditions, Steps, Expected (UI + API + DB), Pass/Fail, Evidence.

### Global shell (sidebar, layout, AI, shortcuts)
- NAV-01 (P0): Sidebar navigation routes
  - Preconditions: Logged in, sidebar visible.
  - Steps: Click each nav item (Dashboard, Calendar, Notifications, Budgets, Goals, Transactions, Uploads, Accounts, Rituals, Settings).
  - Expected: URL updates, correct page header renders, no console errors, API calls succeed.
  - Pass/Fail: Pass if all routes load without errors; fail if any route breaks or errors.
  - Evidence: Screenshot per destination + console log export.
- NAV-02 (P0): Mobile menu open/close
  - Preconditions: Mobile viewport.
  - Steps: Tap menu icon to open, tap overlay to close.
  - Expected: Sidebar slides in/out, overlay toggles, focus remains usable.
  - Pass/Fail: Pass if open/close works; fail on stuck overlay or broken scroll.
  - Evidence: Screen recording or before/after screenshots.
- NAV-03 (P1): Sidebar collapse/expand
  - Preconditions: Desktop viewport.
  - Steps: Toggle collapse button, then expand.
  - Expected: Sidebar width changes, tooltips visible when collapsed.
  - Pass/Fail: Pass if layout stable and nav still works.
  - Evidence: Screenshot collapsed and expanded.
- NAV-04 (P1): Month selector in sidebar
  - Preconditions: Any page using Month context (Dashboard or Transactions).
  - Steps: Click prev/next month buttons.
  - Expected: Month label changes; data queries refetch with new month.
  - Pass/Fail: Pass if month state updates and data changes accordingly.
  - Evidence: Screenshot + network log showing month param change.
- NAV-05 (P1): Keyboard shortcuts overlay
  - Preconditions: Any page loaded.
  - Steps: Press '?' to open overlay, press ESC to close.
  - Expected: Overlay opens with shortcuts list and closes on ESC.
  - Pass/Fail: Pass if overlay opens/closes and focus is restored.
  - Evidence: Screenshot of overlay.
- AI-UI-01 (P1): AI assistant button and modal
  - Preconditions: Any page loaded.
  - Steps: Click floating AI button, use quick action, send a message, close modal.
  - Expected: Modal opens, message appears, simulated response appears, no API errors.
  - Pass/Fail: Pass if UI flow works without crashes.
  - Evidence: Screenshot of modal + console log.

### Login
- LOGIN-01 (P0): Demo login via Google button
  - Preconditions: Logged out, on /login.
  - Steps: Click "Continuar com Google".
  - Expected: Success state visible, redirect to /dashboard.
  - Pass/Fail: Pass if redirected and dashboard loads.
  - Evidence: Screenshot of success state + final URL.
- LOGIN-02 (P0): Email/password login
  - Preconditions: Logged out, on /login.
  - Steps: Enter email/password, submit form.
  - Expected: Redirect to /dashboard, user session created.
  - Pass/Fail: Pass if dashboard loads and API /auth/login returns success.
  - Evidence: Network log of /auth/login + dashboard screenshot.
- LOGIN-03 (P1): Show/hide password
  - Preconditions: On /login.
  - Steps: Toggle eye icon.
  - Expected: Password field toggles text/hidden.
  - Pass/Fail: Pass if toggle works and no errors.
  - Evidence: Screenshot showing toggled state.
- LOGIN-04 (P1): Forgot password button
  - Preconditions: On /login.
  - Steps: Click "Esqueceu?".
  - Expected: No crash, no unexpected navigation.
  - Pass/Fail: Pass if app remains stable.
  - Evidence: Screenshot after click + console log.

### Dashboard
- DASH-01 (P0): Dashboard load and summary
  - Preconditions: Logged in with sample data.
  - Steps: Open /dashboard.
  - Expected: Summary cards render, no console errors, API /dashboard returns data.
  - Pass/Fail: Pass if data renders and totals are non-empty when data exists.
  - Evidence: Screenshot + /api/dashboard response.
- DASH-02 (P1): Account filter
  - Preconditions: Multiple accounts exist.
  - Steps: Select different account in filter.
  - Expected: Recent transactions list updates to selected account.
  - Pass/Fail: Pass if list updates and totals reflect filter.
  - Evidence: Screenshot before/after + network logs.
- DASH-03 (P0): Confirm queue CTA
  - Preconditions: Review queue has items.
  - Steps: Click "Ver fila" CTA.
  - Expected: Redirect to /settings and review queue visible.
  - Pass/Fail: Pass if redirect occurs and queue is visible.
  - Evidence: Screenshot of settings review queue.
- DASH-04 (P1): Calendar CTA
  - Preconditions: Any data.
  - Steps: Click calendar link from dashboard.
  - Expected: /calendar loads.
  - Pass/Fail: Pass if calendar page loads without errors.
  - Evidence: Screenshot of calendar.
- DASH-05 (P2): "Mais opcoes" button
  - Preconditions: Dashboard loaded.
  - Steps: Click "Mais opcoes" button.
  - Expected: No crash; if menu appears, items are clickable.
  - Pass/Fail: Pass if UI remains stable.
  - Evidence: Screenshot or console log.

### Uploads
- UP-01 (P0): File selection and CSV validation
  - Preconditions: On /uploads.
  - Steps: Click "Selecionar Arquivo" and choose a CSV file.
  - Expected: Upload starts; non-CSV file shows validation error.
  - Pass/Fail: Pass if CSV accepted and non-CSV rejected.
  - Evidence: Screenshot + toast message.
- UP-02 (P0): Drag and drop upload
  - Preconditions: On /uploads.
  - Steps: Drag a CSV onto dropzone.
  - Expected: Upload starts, progress updates, result toast shown.
  - Pass/Fail: Pass if upload completes and history updates.
  - Evidence: Screenshot + /api/uploads/process response.
- UP-03 (P0): Upload success and history
  - Preconditions: Valid sample CSV.
  - Steps: Upload sample file, wait for completion.
  - Expected: Upload entry appears with status ready; rowsImported > 0.
  - Pass/Fail: Pass if history shows new entry and counts correct.
  - Evidence: Screenshot of history + DB query for uploads.
- UP-04 (P0): Dedupe on re-upload
  - Preconditions: Same CSV already imported.
  - Steps: Re-upload same file.
  - Expected: rowsImported = 0, duplicates > 0, toast indicates already imported.
  - Pass/Fail: Pass if no duplicates created and UI reports duplicates.
  - Evidence: Toast screenshot + DB duplicate query.
- UP-05 (P2): History card menu button
  - Preconditions: At least one upload.
  - Steps: Click "More" (kebab) button on history card.
  - Expected: No crash; if menu exists, items clickable.
  - Pass/Fail: Pass if UI stable.
  - Evidence: Screenshot.

### Transactions
- TX-01 (P0): Transactions list load
  - Preconditions: Data exists.
  - Steps: Open /transactions.
  - Expected: List renders with rows; /api/transactions returns data.
  - Pass/Fail: Pass if rows match API count.
  - Evidence: Screenshot + API response.
- TX-02 (P0): Search filter
  - Preconditions: Known transaction text exists.
  - Steps: Enter search text.
  - Expected: List filters to matching items.
  - Pass/Fail: Pass if only matching rows remain.
  - Evidence: Screenshot before/after.
- TX-03 (P0): Advanced filters
  - Preconditions: Multiple accounts/categories/types.
  - Steps: Toggle filters panel; set account, category, type.
  - Expected: List updates, filter chips reflect selection.
  - Pass/Fail: Pass if results match filters.
  - Evidence: Screenshot + network log.
- TX-04 (P1): Clear filters
  - Preconditions: Filters active.
  - Steps: Click clear filters.
  - Expected: Filters reset and full list returns.
  - Pass/Fail: Pass if defaults restored.
  - Evidence: Screenshot.
- TX-05 (P1): Transaction detail modal
  - Preconditions: At least one transaction.
  - Steps: Open detail modal.
  - Expected: Modal shows details; ESC closes.
  - Pass/Fail: Pass if modal opens/closes and data matches row.
  - Evidence: Screenshot of modal.
- TX-06 (P0): Edit transaction sets manualOverride
  - Preconditions: Transaction exists.
  - Steps: Edit a transaction, change category, save.
  - Expected: UI updates; API /transactions/:id returns updated; DB manual_override = true.
  - Pass/Fail: Pass if manualOverride set and values persisted.
  - Evidence: Screenshot + DB query.
- TX-07 (P0): Exclude from budget / internal transfer toggles
  - Preconditions: Transaction exists.
  - Steps: Toggle excludeFromBudget and internalTransfer, save.
  - Expected: Dashboard totals adjust; DB flags updated.
  - Pass/Fail: Pass if flags saved and dashboard reflects exclusion.
  - Evidence: Screenshot + DB query + dashboard diff.
- TX-08 (P1): Export CSV
  - Preconditions: Transactions list visible.
  - Steps: Click Export CSV.
  - Expected: CSV download initiated with current filters applied.
  - Pass/Fail: Pass if file downloads and rows match filtered list.
  - Evidence: Downloaded file + screenshot.

### Accounts
- ACC-01 (P0): Create account
  - Preconditions: On /accounts.
  - Steps: Click "Nova Conta", fill name/type/number/icon/color, save.
  - Expected: Account appears in list; API /accounts POST succeeds.
  - Pass/Fail: Pass if account persists and appears on dashboard filters.
  - Evidence: Screenshot + API response.
- ACC-02 (P1): Edit account
  - Preconditions: Existing account.
  - Steps: Open edit dialog, change icon/color/name, save.
  - Expected: UI updates; API /accounts/:id PUT succeeds.
  - Pass/Fail: Pass if changes persist.
  - Evidence: Screenshot + API response.
- ACC-03 (P1): Archive account
  - Preconditions: Existing account.
  - Steps: Click archive, confirm.
  - Expected: Account removed from active list; transactions unaffected.
  - Pass/Fail: Pass if account no longer listed and tx count unchanged.
  - Evidence: Screenshot + DB query.

### Budgets
- BUD-01 (P0): Create budget
  - Preconditions: On /budgets.
  - Steps: Select category, enter amount, save.
  - Expected: Budget appears; API /budgets POST succeeds.
  - Pass/Fail: Pass if new budget persists.
  - Evidence: Screenshot + API response.
- BUD-02 (P1): Update budget amount
  - Preconditions: Existing budget.
  - Steps: Edit amount inline or field, blur to save.
  - Expected: API /budgets/:id PATCH succeeds; values update.
  - Pass/Fail: Pass if amount persists after refresh.
  - Evidence: Screenshot + API response.
- BUD-03 (P1): Delete budget
  - Preconditions: Existing budget.
  - Steps: Click delete.
  - Expected: Budget removed; API /budgets/:id DELETE succeeds.
  - Pass/Fail: Pass if removed from list.
  - Evidence: Screenshot + API response.
- BUD-04 (P2): Apply AI suggestions
  - Preconditions: Prior months data exists.
  - Steps: Click "Aplicar Sugestoes".
  - Expected: Suggested budgets created and suggestions hidden.
  - Pass/Fail: Pass if new budgets appear.
  - Evidence: Screenshot + API logs.

### Goals
- GOAL-01 (P0): Create goal
  - Preconditions: No goal for current month.
  - Steps: Enter estimated income and category budgets, click save.
  - Expected: Goal created; categoryGoals created; API /goals POST succeeds.
  - Pass/Fail: Pass if goal persists and progress visible.
  - Evidence: Screenshot + API response.
- GOAL-02 (P1): Update goal
  - Preconditions: Existing goal.
  - Steps: Edit income or category targets, save.
  - Expected: API /goals/:id PATCH and categoryGoals POST/PUT succeed.
  - Pass/Fail: Pass if values persist after reload.
  - Evidence: Screenshot + API response.
- GOAL-03 (P1): Progress accuracy
  - Preconditions: Transactions for current month.
  - Steps: Compare goal progress to dashboard totals.
  - Expected: Progress uses same exclusions (internalTransfer/excludeFromBudget).
  - Pass/Fail: Pass if totals match within rounding.
  - Evidence: Screenshot + DB query.
- GOAL-04 (P2): Copy or suggestion actions
  - Preconditions: Previous month data exists.
  - Steps: Use any copy/suggestion buttons.
  - Expected: Suggestions applied or toast indicates action.
  - Pass/Fail: Pass if UI stable and expected values appear.
  - Evidence: Screenshot.

### Rituals
- RIT-01 (P1): Start ritual
  - Preconditions: On /rituals.
  - Steps: Start weekly ritual.
  - Expected: Ritual created; stepper advances.
  - Pass/Fail: Pass if ritual persisted and steps navigable.
  - Evidence: Screenshot + API response.
- RIT-02 (P1): Complete ritual with notes
  - Preconditions: Ritual in progress.
  - Steps: Enter notes, complete ritual.
  - Expected: Ritual marked complete; notes saved.
  - Pass/Fail: Pass if status updates and notes persist.
  - Evidence: Screenshot + API response.
- RIT-03 (P2): Switch weekly/monthly
  - Preconditions: On /rituals.
  - Steps: Toggle ritual type.
  - Expected: UI and period change, data refetches.
  - Pass/Fail: Pass if correct period displayed.
  - Evidence: Screenshot.
- RIT-04 (P2): Filters and step navigation
  - Preconditions: Ritual loaded.
  - Steps: Change filter and move between steps.
  - Expected: UI updates without errors.
  - Pass/Fail: Pass if no UI errors.
  - Evidence: Screenshot.

### Calendar
- CAL-01 (P0): Calendar load
  - Preconditions: Transactions exist.
  - Steps: Open /calendar.
  - Expected: Month view renders; totals exclude internal transfers.
  - Pass/Fail: Pass if calendar shows data and no errors.
  - Evidence: Screenshot + DB query.
- CAL-02 (P1): Month navigation
  - Preconditions: Any data.
  - Steps: Click prev/next month.
  - Expected: Month label changes; transactions refetch.
  - Pass/Fail: Pass if view changes and data updates.
  - Evidence: Screenshot + network log.
- CAL-03 (P1): Switch to week blocks view
  - Preconditions: Calendar open.
  - Steps: Switch view to 4 weeks; select week.
  - Expected: Detail panel shows week summary.
  - Pass/Fail: Pass if selection updates detail panel.
  - Evidence: Screenshot.
- CAL-04 (P2): Day selection
  - Preconditions: Calendar open.
  - Steps: Select a day in month view.
  - Expected: Detail panel shows day details.
  - Pass/Fail: Pass if details match transactions.
  - Evidence: Screenshot.

### Event detail
- EVT-01 (P1): Open event detail
  - Preconditions: Calendar event exists.
  - Steps: Navigate to /calendar/:id.
  - Expected: Event details load; occurrences list visible.
  - Pass/Fail: Pass if event data matches API.
  - Evidence: Screenshot + API response.
- EVT-02 (P1): Update occurrence status
  - Preconditions: Occurrence exists.
  - Steps: Change occurrence status.
  - Expected: API /event-occurrences update succeeds; UI reflects change.
  - Pass/Fail: Pass if status persists.
  - Evidence: Screenshot + API response.
- EVT-03 (P1): Delete event
  - Preconditions: Event exists.
  - Steps: Delete event and confirm.
  - Expected: Event removed; redirect to /calendar.
  - Pass/Fail: Pass if event not found after delete.
  - Evidence: Screenshot + API response.

### Notifications
- NOTIF-01 (P1): Notifications list
  - Preconditions: On /notifications.
  - Steps: Load page.
  - Expected: Mock notifications render; no API calls required.
  - Pass/Fail: Pass if UI renders without errors.
  - Evidence: Screenshot.
- NOTIF-02 (P2): Filter tabs
  - Preconditions: Notifications visible.
  - Steps: Switch All/Unread/Important.
  - Expected: List filters accordingly.
  - Pass/Fail: Pass if filter results change.
  - Evidence: Screenshot.
- NOTIF-03 (P2): Mark as read
  - Preconditions: Unread items present.
  - Steps: Mark a notification read and use "mark all".
  - Expected: UI state updates.
  - Pass/Fail: Pass if unread count decreases.
  - Evidence: Screenshot.

### Settings
- SET-01 (P0): Tab switching
  - Preconditions: On /settings.
  - Steps: Click each top-level tab (Conta, Preferencias, Classificacao, Dicionarios, Integracoes, Seguranca).
  - Expected: Content switches without errors.
  - Pass/Fail: Pass if each tab renders.
  - Evidence: Screenshot of each tab.
- SET-02 (P2): Conta - profile update button
  - Preconditions: Conta tab visible.
  - Steps: Edit name field, click Save.
  - Expected: UI remains stable (no backend yet).
  - Pass/Fail: Pass if no crash.
  - Evidence: Screenshot.
- SET-03 (P2): Conta - export buttons
  - Preconditions: Conta tab visible.
  - Steps: Click Export CSV and Export JSON.
  - Expected: If download exists, file starts; otherwise no crash.
  - Pass/Fail: Pass if UI stable and any download works.
  - Evidence: Screenshot + download evidence.
- SET-04 (P2): Preferencias - selects
  - Preconditions: Preferencias tab.
  - Steps: Open language and currency dropdowns and select values.
  - Expected: UI updates selection.
  - Pass/Fail: Pass if dropdown works without errors.
  - Evidence: Screenshot.
- SET-05 (P2): Preferencias - theme and cents toggles
  - Preconditions: Preferencias tab.
  - Steps: Toggle dark mode and show cents.
  - Expected: Switch state toggles (UI only).
  - Pass/Fail: Pass if toggles work and no errors.
  - Evidence: Screenshot.
- SET-06 (P0): Preferencias - auto-confirm high confidence
  - Preconditions: Preferencias tab; settings loaded.
  - Steps: Toggle autoConfirmHighConfidence on/off; adjust slider to 80, 79, 85.
  - Expected: API /settings PATCH called; stored threshold updates.
  - Pass/Fail: Pass if settings persist after reload.
  - Evidence: Network log + screenshot.
- SET-07 (P0): Classificacao - import preview and process
  - Preconditions: Classificacao & Dados > Importacoes.
  - Steps: Choose source, select CSV, click Preview, then Import.
  - Expected: Preview shows format/meta; import success toast; uploads/transactions updated.
  - Pass/Fail: Pass if preview matches file format and import succeeds.
  - Evidence: Screenshot + /api/imports/preview + /api/uploads/process responses.
- SET-08 (P1): Classificacao - categories Excel import
  - Preconditions: Categories tab; exported template.
  - Steps: Upload Excel, preview, confirm remap if required, apply.
  - Expected: Categories/rules updated; API /classification/import/apply success.
  - Pass/Fail: Pass if categories reflect new data.
  - Evidence: Screenshot + API response.
- SET-09 (P1): Aliases & logos - import/apply
  - Preconditions: Aliases tab; exported template.
  - Steps: Upload aliases Excel, preview, apply.
  - Expected: alias tables update; transactions show aliasDesc.
  - Pass/Fail: Pass if alias shown in transactions.
  - Evidence: Screenshot + API response.
- SET-10 (P1): Aliases & logos - refresh logos
  - Preconditions: Aliases tab.
  - Steps: Click "Atualizar logos".
  - Expected: API /aliases/refresh-logos called; logos update after refresh.
  - Pass/Fail: Pass if response returns total and UI remains stable.
  - Evidence: Network log.
- SET-11 (P0): Review queue assign
  - Preconditions: Review queue has items, taxonomy leaves loaded.
  - Steps: Select category for a row, optionally add expression, click Apply.
  - Expected: API /classification/review/assign succeeds; row removed; rule created if requested.
  - Pass/Fail: Pass if transaction leaves queue and DB updates leaf_id.
  - Evidence: Screenshot + API response + DB query.
- SET-12 (P0): Danger zone reset
  - Preconditions: Data exists.
  - Steps: Click Resetar dados and confirm.
  - Expected: Transactions, rules, aliases reset; base seed applied.
  - Pass/Fail: Pass if DB reset verified by counts.
  - Evidence: Screenshot + DB queries.
- SET-13 (P2): Dicionarios tab
  - Preconditions: Dicionarios tab visible.
  - Steps: Click "Acessar Dicionario Completo".
  - Expected: Redirects to /settings (legacy route), no crash.
  - Pass/Fail: Pass if UI stable after redirect.
  - Evidence: Screenshot + URL.
- SET-14 (P2): Integracoes and Seguranca tabs
  - Preconditions: Tabs visible.
  - Steps: Toggle through cards and forms; click Update Password and Delete Account buttons.
  - Expected: UI remains stable (placeholders); no crash.
  - Pass/Fail: Pass if no errors.
  - Evidence: Screenshot.

### Legacy routes and Not Found
- LEG-01 (P0): Legacy route redirects
  - Preconditions: Logged in.
  - Steps: Navigate to /confirm, /rules, /merchant-dictionary, /ai-keywords.
  - Expected: Redirect to /settings.
  - Pass/Fail: Pass if each route redirects correctly.
  - Evidence: URL + screenshot.
- NF-01 (P1): Not found page
  - Preconditions: Logged in.
  - Steps: Navigate to /unknown-path.
  - Expected: NotFound page renders.
  - Pass/Fail: Pass if 404 page appears and no crash.
  - Evidence: Screenshot.

## 7) Business rules and AI logic verification suite
- CSV-01 (P0): Format detection
  - Preconditions: Sample CSVs available.
  - Steps: Upload each sample file via /uploads or Settings import.
  - Expected: Format detected correctly (miles_and_more, amex, sparkasse), delimiter and encoding correct.
  - Pass/Fail: Pass if preview format matches file.
  - Evidence: Preview screenshot + /imports/preview response.
- CSV-02 (P0): Date and amount normalization
  - Preconditions: Known amounts/dates in CSV.
  - Steps: Import file and inspect stored values.
  - Expected: paymentDate/bookingDate parsed; amounts normalized with correct sign conventions.
  - Pass/Fail: Pass if DB values match expected.
  - Evidence: DB query results.
- CSV-03 (P0): Key and key_desc creation
  - Preconditions: Sample CSV row with known fields.
  - Steps: Import and check key_desc and key.
  - Expected: key_desc concatenation and key format match README.
  - Pass/Fail: Pass if key equals expected format.
  - Evidence: DB query.
- CSV-04 (P0): Idempotency and dedupe
  - Preconditions: File already imported.
  - Steps: Import same file again.
  - Expected: No new transactions created; duplicates count reported.
  - Pass/Fail: Pass if transaction count unchanged.
  - Evidence: DB query + upload response.
- CSV-05 (P0): Account attribution
  - Preconditions: Amex, Sparkasse, M&M files.
  - Steps: Import each file.
  - Expected: accountSource and accountId reflect correct card/account; Amex uses cardholder + last4; Sparkasse uses IBAN last4; M&M uses card name.
  - Pass/Fail: Pass if account list shows distinct accounts.
  - Evidence: DB query + accounts page screenshot.
- CSV-06 (P1): Foreign currency fields
  - Preconditions: File with foreignAmount.
  - Steps: Import and inspect transaction fields.
  - Expected: foreignAmount/foreignCurrency/exchangeRate populated.
  - Pass/Fail: Pass if values stored.
  - Evidence: DB query.

- RULE-01 (P0): Contains match, case-insensitive
  - Preconditions: Rule with keywords "netflix;hbo".
  - Steps: Import transaction with desc "NETFLIX monthly".
  - Expected: Rule matches regardless of case.
  - Pass/Fail: Pass if category applied.
  - Evidence: DB query + confirm queue status.
- RULE-02 (P0): Expressions not tokenized
  - Preconditions: Rule keyword "UBER EATS" (single expression).
  - Steps: Import desc "UBER EATS PROMO".
  - Expected: Match occurs without splitting "UBER" and "EATS" separately.
  - Pass/Fail: Pass if matched expression recorded as "UBER EATS".
  - Evidence: Rule test output + DB query.
- RULE-03 (P0): Diacritics and punctuation
  - Preconditions: Rule keyword "ACAI" and "MULLER".
  - Steps: Import desc "AcaI Muller" and "AcaI, Muller".
  - Expected: Match after normalization (accents removed, punctuation ignored by contains).
  - Pass/Fail: Pass if matched.
  - Evidence: DB query.
- RULE-04 (P0): Negative keywords block
  - Preconditions: Rule keyword "AMAZON" with negative "REEMBOLSO".
  - Steps: Import desc containing both.
  - Expected: Rule does not apply.
  - Pass/Fail: Pass if transaction remains needsReview.
  - Evidence: DB query.
- RULE-05 (P0): Strict rule precedence
  - Preconditions: Strict rule "NETFLIX"; non-strict rule also matches.
  - Steps: Import matching transaction.
  - Expected: Strict rule applies, confidence 100, needsReview false.
  - Pass/Fail: Pass if strict rule applied.
  - Evidence: DB query.
- RULE-06 (P0): Priority ordering
  - Preconditions: Two rules match, different priorities.
  - Steps: Import desc matching both rules.
  - Expected: Higher priority rule wins; confidence adjusted.
  - Pass/Fail: Pass if applied rule matches highest priority.
  - Evidence: DB query.
- RULE-07 (P0): Interno exclusion
  - Preconditions: Rule category1 "Interno".
  - Steps: Import matching transaction.
  - Expected: internalTransfer = true and excludeFromBudget = true.
  - Pass/Fail: Pass if flags set and dashboard excludes it.
  - Evidence: DB query + dashboard totals.

- AI-LOGIC-01 (P0): Auto-confirm off by default
  - Preconditions: autoConfirmHighConfidence = false.
  - Steps: Import a transaction with high confidence.
  - Expected: needsReview remains true (auto-confirm disabled).
  - Pass/Fail: Pass if transaction appears in review queue.
  - Evidence: Review queue screenshot + DB query.
- AI-LOGIC-02 (P0): Threshold boundaries
  - Preconditions: autoConfirmHighConfidence = true; threshold set to 80.
  - Steps: Import transactions that yield confidence 79, 80, 85.
  - Expected: 79 remains in review; 80 and 85 auto-confirm.
  - Pass/Fail: Pass if behavior matches threshold boundary.
  - Evidence: DB query + review queue count.
- AI-LOGIC-03 (P0): UI/backend consistency
  - Preconditions: Known confidence values.
  - Steps: Verify UI badges or status reflect backend confidence and needsReview.
  - Expected: UI state matches DB flags and ruleIdApplied.
  - Pass/Fail: Pass if UI and DB match.
  - Evidence: Screenshot + DB query.

- MANUAL-01 (P0): Manual override invariance
  - Preconditions: Transaction edited with manualOverride = true.
  - Steps: Run /api/rules/reapply-all and /api/rules/:id/apply.
  - Expected: Manual override transaction remains unchanged.
  - Pass/Fail: Pass if transaction unchanged.
  - Evidence: DB query before/after.

## 8) Data integrity and DB suite
### SQL invariants
- DB-01 (P0): Dedupe by key per user
  - Query:
    ```sql
    SELECT user_id, key, COUNT(*)
    FROM transactions
    GROUP BY user_id, key
    HAVING COUNT(*) > 1;
    ```
  - Expected: 0 rows.
- DB-02 (P0): AccountId coverage
  - Query:
    ```sql
    SELECT COUNT(*) AS missing_account
    FROM transactions
    WHERE account_id IS NULL;
    ```
  - Expected: 0 for modern imports; legacy data may be non-zero (note in report).
- DB-03 (P0): Manual override and rule reapply
  - Query:
    ```sql
    SELECT id, manual_override, rule_id_applied, needs_review
    FROM transactions
    WHERE manual_override = true;
    ```
  - Expected: manual_override true transactions retain their categories after reapply.
- DB-04 (P0): Interno exclusion
  - Query:
    ```sql
    SELECT id, category_1, internal_transfer, exclude_from_budget
    FROM transactions
    WHERE category_1 = 'Interno';
    ```
  - Expected: internal_transfer = true and exclude_from_budget = true.
- DB-05 (P1): Uniqueness constraints
  - Query:
    ```sql
    SELECT user_id, month, category_1, COUNT(*)
    FROM budgets
    GROUP BY user_id, month, category_1
    HAVING COUNT(*) > 1;

    SELECT user_id, month, COUNT(*)
    FROM goals
    GROUP BY user_id, month
    HAVING COUNT(*) > 1;

    SELECT goal_id, category_1, COUNT(*)
    FROM category_goals
    GROUP BY goal_id, category_1
    HAVING COUNT(*) > 1;
    ```
  - Expected: 0 rows.
- DB-06 (P1): Referential integrity
  - Query:
    ```sql
    SELECT t.id
    FROM transactions t
    LEFT JOIN accounts a ON t.account_id = a.id
    WHERE t.account_id IS NOT NULL AND a.id IS NULL;
    ```
  - Expected: 0 rows.

### Baseline reset procedure
- Use Settings > Classificacao & Dados > Danger Zone > Resetar dados.
- Verify seeds applied (taxonomy, aliases) by checking counts in taxonomy tables and alias_assets.

## 9) API smoke tests
- API-01 (P0): /api/health
  - Preconditions: Backend running.
  - Steps: GET /api/health.
  - Expected: JSON with status, timestamp, database, version.
  - Pass/Fail: Pass if status ok or degraded (when DB not configured) and JSON shape valid.
  - Evidence: Response body + status code.
- API-02 (P0): /api/version
  - Preconditions: Backend running.
  - Steps: GET /api/version.
  - Expected: service, gitSha, buildTime, env present.
  - Pass/Fail: Pass if fields present and non-empty.
  - Evidence: Response body.
- API-03 (P0): /api/auth/login
  - Preconditions: None.
  - Steps: POST /api/auth/login with demo credentials.
  - Expected: success true and user object.
  - Pass/Fail: Pass if response success and HTTP 200.
  - Evidence: Response body.
- API-04 (P0): /api/settings read/update
  - Preconditions: Auth created (API-03).
  - Steps: GET /api/settings, then PATCH autoConfirmHighConfidence and confidenceThreshold.
  - Expected: Updated values returned; subsequent GET reflects changes.
  - Pass/Fail: Pass if persisted.
  - Evidence: Response bodies.
- API-05 (P0): /api/uploads/process
  - Preconditions: Sample CSV available.
  - Steps: POST /api/uploads/process with csvContent.
  - Expected: uploadId, rowsTotal, rowsImported, duplicates, monthAffected.
  - Pass/Fail: Pass if rowsTotal > 0 and uploadId present.
  - Evidence: Response body + DB upload record.
- API-06 (P1): /api/transactions list
  - Preconditions: Transactions exist.
  - Steps: GET /api/transactions?month=YYYY-MM.
  - Expected: Array of transactions with id, paymentDate, amount, descRaw.
  - Pass/Fail: Pass if array length matches DB count for month.
  - Evidence: Response body + DB query.
- API-07 (P1): /api/classification/review-queue
  - Preconditions: needsReview transactions exist.
  - Steps: GET /api/classification/review-queue.
  - Expected: Array of pending items with id, keyDesc, amount.
  - Pass/Fail: Pass if items match DB needs_review=true count.
  - Evidence: Response body + DB query.
- API-08 (P1): /api/rules/reapply-all
  - Preconditions: Rules exist and needsReview transactions exist.
  - Steps: POST /api/rules/reapply-all.
  - Expected: success true with categorized/stillPending counts.
  - Pass/Fail: Pass if counts reasonable and manualOverride untouched.
  - Evidence: Response body + DB query.

### Curl examples
```bash
curl -s https://<render-url>/api/health
curl -s https://<render-url>/api/version
curl -s -X POST https://<render-url>/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo"}'

curl -s https://<render-url>/api/settings
curl -s -X PATCH https://<render-url>/api/settings \
  -H 'Content-Type: application/json' \
  -d '{"autoConfirmHighConfidence":true,"confidenceThreshold":80}'

python3 - <<'PY' > /tmp/upload.json
import json, pathlib
path = pathlib.Path('attached_assets/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv')
content = path.read_text(encoding='utf-8', errors='ignore')
print(json.dumps({"filename": path.name, "csvContent": content, "encoding": "utf-8"}))
PY
curl -s -X POST https://<render-url>/api/uploads/process \
  -H 'Content-Type: application/json' \
  -d @/tmp/upload.json
```

## 10) API contract tests
- API-CON-01 (P0): /api/health schema
  - Preconditions: Backend running.
  - Steps: GET /api/health.
  - Expected: {status: string, timestamp: string, database: string, version: string} or {status: string, timestamp: string, database: string, error: string}.
  - Pass/Fail: Pass if required keys exist with correct types.
  - Evidence: Response body.
- API-CON-02 (P0): /api/version schema
  - Preconditions: Backend running.
  - Steps: GET /api/version.
  - Expected: {service, gitSha, buildTime, env} as strings.
  - Pass/Fail: Pass if all keys present.
  - Evidence: Response body.
- API-CON-03 (P0): /api/uploads/process schema
  - Preconditions: Valid csvContent payload.
  - Steps: POST /api/uploads/process.
  - Expected: {success, uploadId, rowsTotal, rowsImported, duplicates, monthAffected} plus optional meta.
  - Pass/Fail: Pass if required keys present and types correct.
  - Evidence: Response body.
- API-CON-04 (P1): /api/transactions schema
  - Preconditions: Transactions exist.
  - Steps: GET /api/transactions?month=YYYY-MM.
  - Expected: Array of objects with id, paymentDate, amount, currency, descRaw, needsReview, manualOverride.
  - Pass/Fail: Pass if required fields exist on all items.
  - Evidence: Response body.
- API-CON-05 (P1): /api/settings schema
  - Preconditions: Settings exist.
  - Steps: GET /api/settings.
  - Expected: {id, userId, autoConfirmHighConfidence, confidenceThreshold, createdAt, updatedAt}.
  - Pass/Fail: Pass if types are correct and values in valid range.
  - Evidence: Response body.

## 11) Deployment verification suite
- DEP-01 (P0): Frontend API base
  - Preconditions: Vercel deployment live with VITE_API_URL configured.
  - Steps: Open DevTools Network and trigger API calls (dashboard, transactions).
  - Expected: Requests go to Render domain, not Vercel origin.
  - Pass/Fail: Pass if no requests hit <vercel-origin>/api.
  - Evidence: HAR export.
- DEP-02 (P0): Bundle check
  - Preconditions: Build artifacts available.
  - Steps: Search built assets for backend URL.
  - Expected: Only Render API base appears.
  - Pass/Fail: Pass if no Vercel-origin /api in bundle.
  - Evidence: rg output or grep log.
- DEP-03 (P0): SPA rewrites
  - Preconditions: Vercel deployment live.
  - Steps: Open /transactions and /calendar directly on Vercel.
  - Expected: App loads (vercel.json rewrites working).
  - Pass/Fail: Pass if app loads without 404.
  - Evidence: Screenshot + response status.
- DEP-04 (P0): CORS
  - Preconditions: Render backend live with CORS_ORIGIN set.
  - Steps: Call backend API from Vercel origin or via browser.
  - Expected: Access-Control-Allow-Origin includes Vercel domain.
  - Pass/Fail: Pass if CORS header matches allowed origin.
  - Evidence: Response headers.
- DEP-05 (P1): Version and health checks
  - Preconditions: Render and Vercel deployments live.
  - Steps: GET /api/health, /api/version, /version.json.
  - Expected: Versions include gitSha/buildTime; health returns ok and DB connected.
  - Pass/Fail: Pass if endpoints return expected JSON.
  - Evidence: curl output + deployment IDs.

## 12) Observability checks
- OBS-01 (P1): Request logging
  - Preconditions: Backend running with log output.
  - Steps: Trigger /api/uploads/process and /api/transactions.
  - Expected: Logs include method, path, status, duration, and response body snippet.
  - Pass/Fail: Pass if logs include timing and error context.
  - Evidence: Log excerpt.
- OBS-02 (P1): CSV import logs
  - Preconditions: Upload sample CSV.
  - Steps: Import file.
  - Expected: Logs show format detected, rows parsed, duplicates count.
  - Pass/Fail: Pass if logs include key fields.
  - Evidence: Log excerpt.
- OBS-03 (P1): AI usage logs
  - Preconditions: OpenAI key configured and AI keyword analysis run.
  - Steps: Trigger AI feature (if available in current UI).
  - Expected: ai_usage_logs receives entry with model, tokens, cost estimate.
  - Pass/Fail: Pass if log row inserted.
  - Evidence: DB query.

## 13) Chaos testing
- CHAOS-01 (P1): Backend down
  - Preconditions: Frontend open; backend stopped or blocked.
  - Steps: Load dashboard and attempt upload.
  - Expected: UI shows error toasts and retry states.
  - Pass/Fail: Pass if failures are handled gracefully without crash.
  - Evidence: Screenshot + console log.
- CHAOS-02 (P1): Slow network
  - Preconditions: DevTools throttling enabled (Slow 3G).
  - Steps: Run upload and dashboard load.
  - Expected: Loading states visible; progress indicators visible; no UI freeze.
  - Pass/Fail: Pass if UI stays responsive.
  - Evidence: Screen recording or screenshots.
- CHAOS-03 (P1): DB unavailable
  - Preconditions: Backend running; DB connection broken.
  - Steps: Call /api/health and /api/uploads/process.
  - Expected: /api/health returns error; upload returns clear error message.
  - Pass/Fail: Pass if responses are explicit and logged.
  - Evidence: Responses + logs.

## 14) Security baseline
- SEC-01 (P0): CORS restriction
  - Preconditions: Render backend live.
  - Steps: Attempt API call from disallowed origin.
  - Expected: CORS blocked or origin rejected.
  - Pass/Fail: Pass if disallowed origin cannot access.
  - Evidence: Browser console and response headers.
- SEC-02 (P1): Injection attempts in inputs
  - Preconditions: UI accessible.
  - Steps: Use SQL-like strings in rule keywords or CSV description fields.
  - Expected: No SQL errors; values stored as plain text.
  - Pass/Fail: Pass if no server error and data intact.
  - Evidence: DB query + logs.
- SEC-03 (P1): Secrets exposure scan
  - Preconditions: Build artifacts available.
  - Steps: Search bundle for OPENAI_API_KEY or DATABASE_URL.
  - Expected: No secrets in client bundle.
  - Pass/Fail: Pass if none found.
  - Evidence: rg output.

## 15) Performance tests
- PERF-01 (P1): Large CSV upload
  - Preconditions: CSV with ~5k rows.
  - Steps: Upload file and measure time to completion.
  - Expected: Upload completes within agreed SLO (define target).
  - Pass/Fail: Pass if under threshold and no errors.
  - Evidence: Time measurement + logs.
- PERF-02 (P1): Dashboard render time
  - Preconditions: Month with ~1k transactions.
  - Steps: Load /dashboard and measure time to interactive.
  - Expected: Render under 2s on standard network.
  - Pass/Fail: Pass if under target.
  - Evidence: Performance profile or network timing.
- PERF-03 (P2): Confirm queue render time
  - Preconditions: 200+ pending items.
  - Steps: Open review queue tab.
  - Expected: UI renders within 2s with smooth scrolling.
  - Pass/Fail: Pass if within target and no jank.
  - Evidence: Screen recording or performance trace.

## 16) Property-based and fuzz testing ideas
- PROP-01 (P1): Random merchant strings
  - Preconditions: Rules engine test harness.
  - Steps: Generate random merchant strings with punctuation, umlauts, and spacing; assert normalization and contains match behave consistently.
  - Expected: No crashes; deterministic match results.
  - Pass/Fail: Pass if rule matches remain stable across runs with fixed seed.
  - Evidence: Test logs.
- PROP-02 (P1): CSV fuzz rows
  - Preconditions: CSV parser test harness.
  - Steps: Fuzz rows with missing columns, extra columns, malformed dates, and mixed encodings.
  - Expected: Parser reports errors gracefully and does not crash.
  - Pass/Fail: Pass if errors are captured and import does not corrupt data.
  - Evidence: Test logs + error summaries.
- PROP-03 (P2): Keyword expression fuzz
  - Preconditions: Rules engine harness.
  - Steps: Generate keywords with varying separators, multiple ';', and whitespace.
  - Expected: Only ';' splitting; empty expressions ignored.
  - Pass/Fail: Pass if splitKeyExpressions behavior consistent.
  - Evidence: Test logs.

## 17) Debugging playbook (symptom -> likely cause -> prove -> fix)
- Upload shows 0 rows imported -> likely all duplicates or parse failure -> check /api/uploads/process response and logs -> verify key format and CSV headers.
- Wrong account attribution -> CSV parsing or accountSource extraction -> inspect parsed rows in /imports/preview -> adjust parser logic.
- Rules not matching -> keyword normalization mismatch or negative keyword -> run rule test in Settings -> adjust keywords or priority.
- Auto-confirm mismatch -> settings not persisted or threshold mismatch -> verify /api/settings values and confidence computed in rules-engine.ts.
- Dashboard totals off -> internalTransfer/excludeFromBudget flags incorrect -> query transactions table and verify flags.
- Frontend calling /api on Vercel origin -> VITE_API_URL missing -> verify Vercel env var and rebuild.
- CORS errors in prod -> CORS_ORIGIN missing Vercel domain -> update Render env and redeploy.

## 18) Evidence requirements
For each completed test run, capture:
- Screenshots of each critical screen and modal.
- HAR export for network requests (upload, dashboard, settings updates).
- Browser console logs (no red errors).
- Backend logs excerpt for upload and rules application.
- DB query outputs for invariants and dedupe checks.
- Short run summary (what passed/failed, release readiness).

## 19) P0 smoke test mini-checklist (10-20 steps)
- Login via demo button and reach /dashboard.
- Open /uploads, upload Miles & More CSV, verify rowsImported > 0.
- Re-upload same file, verify duplicates > 0 and no new rows.
- Open /transactions and verify new rows present.
- Edit one transaction and confirm manualOverride true.
- Open /settings > Classificacao > Fila de Revisao and assign a category to one pending item.
- Verify dashboard totals update and Interno exclusions apply (if present).
- Toggle autoConfirmHighConfidence and set threshold to 80.
- Open /calendar and verify month view renders.
- Open /accounts and verify accounts created from imports.
- Verify /api/health, /api/version, and /version.json endpoints.
- Verify DevTools network shows API calls to Render domain.

## 20) Playwright test suite outline
### Proposed structure
- tests/e2e/auth.spec.ts
- tests/e2e/navigation.spec.ts
- tests/e2e/uploads.spec.ts
- tests/e2e/settings-classification.spec.ts
- tests/e2e/transactions.spec.ts
- tests/e2e/accounts.spec.ts
- tests/e2e/dashboard.spec.ts
- tests/e2e/calendar.spec.ts
- tests/e2e/legacy-routes.spec.ts
- tests/e2e/ai-ui.spec.ts

### First 8-12 tests to automate
- AUTH-01: Login via demo button redirects to /dashboard.
- NAV-01: Sidebar navigation visits all routes without console errors.
- UP-01: Upload sample CSV and assert history entry created.
- UP-02: Re-upload same CSV and assert duplicates reported.
- SET-07: Settings import preview returns detected format and meta.
- SET-11: Review queue assign category removes row.
- TX-06: Edit transaction sets manualOverride and persists.
- RULE-07: Interno rule sets internalTransfer and excludeFromBudget.
- CAL-01: Calendar month view renders with day chips.
- LEG-01: /confirm redirects to /settings.
- AI-UI-01: AI assistant modal opens and quick action sends message.
- DEP-05: /api/version and /version.json return build metadata.

