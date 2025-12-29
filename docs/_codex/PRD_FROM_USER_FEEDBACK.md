# PRD From User Feedback

## 1) Product Vision

RitualFin is a desktop-first, mobile-optimized personal finance app that turns imported CSVs and screenshots into a trustworthy monthly and weekly financial picture, helping users understand what is truly available to spend after commitments and enabling fast, explainable categorization with minimal manual work.

What success looks like: users can open the app and in seconds understand where they are in the month, what obligations are still coming, what is safe to spend now, and quickly correct or teach categorization without losing trust.

## 2) Target User & Context

- Who this is for: individuals or couples who manage monthly spending rituals and want clarity, not complexity.
- How it is used: data is imported via CSV and mobile screenshots; no Open Finance or live bank sync.

## 3) Core Modules (Mapped 1–14)

### 1) Dashboard
- User problem: unclear, misleading “available” money when future obligations already exist.
- Core responsibilities: show month-to-date spend, remaining safe-to-spend, commitments still due, category vs budget status, and recent activity.
- Inputs: imported transactions, monthly budget, commitments/recurrences, balances (manual/screenshot) with last update date.
- Outputs: KPI summary, commitments list with critical alerts, category spend vs limit, recent transactions, short-term capacity view.
- Non-goals: visual redesign, bank sync, or payment execution.

### 2) Calendar
- User problem: cannot see past vs projected financial activity by day/week or drill down quickly.
- Core responsibilities: month view with past actuals and future projections, 4-week selection view with weekly totals and capacity, contextual detail panel.
- Inputs: transactions (actual), projections/recurrences, weekly capacity derived from commitments and budget.
- Outputs: day totals, week totals, contextual detail panel for day or week, clear projected vs realized labeling.
- Non-goals: real-time syncing or complex forecasting beyond known commitments.

### 3) Upload (CSV + Images)
- User problem: frequent uploads create duplicates and lack transparency.
- Core responsibilities: reliable import, deduplication, full history and debug logs, and a guided next step to review.
- Inputs: CSV files by provider layout, screenshots from supported accounts/cards.
- Outputs: upload history, detailed logs, batch summaries, and a clear CTA to review imported transactions.
- Non-goals: custom CSV mapping by users or Open Finance integration.

### 4) Transactions
- User problem: no trustworthy ledger view with clear status and quick edits.
- Core responsibilities: complete ledger, search/navigation, clear status states, detailed view with category path and rule explanation, and quick corrections.
- Inputs: transactions, categories (N1–N3), rule explanations, status states.
- Outputs: transaction list with icons/labels, detail view with hierarchy and explanation, edit actions.
- Non-goals: hiding audit data or removing transparency for classification logic.

### 5) Rules
- User problem: rules are hard to govern without a clear taxonomy and impact preview.
- Core responsibilities: manage keyword rules, hierarchical categories, rule priority, and preview/simulation before apply.
- Inputs: category tree, keyword definitions, conflict rules, sample descriptions for tests.
- Outputs: rule configurations, impact preview, test results.
- Non-goals: opaque auto-categorization without user control.

### 6) Internal Category (“Interna”)
- User problem: internal transfers distort spending and income analytics.
- Core responsibilities: recognize internal transfers and exclude them from analytics while keeping them auditable.
- Inputs: transactions, rule keywords for internal transfers.
- Outputs: internal flag on transactions, exclusion from reports and budgets.
- Non-goals: removing internal movements from the ledger.

### 7) Monthly Budget (Orçamento Mensal)
- User problem: monthly planning is slow and disconnected from actuals.
- Core responsibilities: set estimated income and category limits, offer simple suggestions from past averages, and allow copying prior month.
- Inputs: month selection, historical spend summaries, category list.
- Outputs: monthly budget targets feeding dashboard/calendar calculations.
- Non-goals: long-term goal planning (handled in Metas).

### 8) Goals (Metas)
- User problem: strategic goals are mixed with operational budgeting.
- Core responsibilities: define goals with value, purpose, type (monthly vs deadline), and dates; connect to budget via reserved amounts.
- Inputs: goal definitions and timeframes.
- Outputs: goal records separated from monthly budget.
- Non-goals: replacing monthly budgeting.

### 9) Financial Rituals
- User problem: couples lack a structured, low-stress ritual to review finances and agreements.
- Core responsibilities: schedule weekly/monthly rituals, capture agreements, track follow-through, and surface insights.
- Inputs: ritual schedule, budget status, prior agreements.
- Outputs: ritual records, agreements with status, insights for next steps.
- Non-goals: automated enforcement or punitive controls.

### 10) Intelligent Keyword Analysis
- User problem: remaining uncategorized transactions require guidance.
- Core responsibilities: analyze uncategorized items to suggest keywords and categories for review.
- Inputs: uncategorized transaction descriptions and existing rules.
- Outputs: suggested keywords and category hints for review.
- Non-goals: fully automatic reclassification without user confirmation.

### 11) Accounts
- User problem: no consolidated view of balances, limits, and recency.
- Core responsibilities: show accounts/cards, last update, balances, limits, and consolidated net position.
- Inputs: balances from screenshots/manual entry, transaction totals, account metadata.
- Outputs: account cards with balance and limits, net position summary, last update info.
- Non-goals: Open Finance connectivity or future real-time sync.

### 12) AI Assistant
- User problem: difficulty asking ad-hoc questions across data contexts.
- Core responsibilities: answer questions about transactions, projections, balances, and budgets; distinguish contextual vs global questions.
- Inputs: current screen context, filters, and app data.
- Outputs: fast, actionable answers that guide next steps.
- Non-goals: replacing structured dashboards or acting without user review.

### 13) General Product Adjustments
- User problem: inconsistent navigation labels and lack of cohesive clustering.
- Core responsibilities: intuitive clustering in left menu, consistent Portuguese labels, merchant logos/icons.
- Inputs: navigation structure, merchant list, normalized merchant names.
- Outputs: consistent UX labels and icon usage guidelines.
- Non-goals: visual redesign beyond clarity and consistency.

### 14) Confirm Queue (Fila de Confirmação)
- User problem: slow, repetitive classification of uncategorized items.
- Core responsibilities: list unclassified transactions, bundle by merchant, allow bulk categorization, and quick keyword edits with full description access.
- Inputs: unclassified transactions, merchant normalization, key descriptions.
- Outputs: faster classification, optional rule creation from keywords.
- Non-goals: hidden auto-approval without user intent.

## 4) Core Product Principles

- Financial truth > visual polish
- Projection-aware budgeting
- Transparency and auditability
- Learning system (rules + keywords)
- Rituals over “control”

## 5) Out of Scope (Explicit)

- Open Finance
- Real-time bank sync
- Automatic payments
- Investment tracking

## 6) Risks & Assumptions

- Data quality: imported data may be incomplete or inconsistent.
- Projection accuracy: projections depend on correct recurrence and commitment inputs.
- User trust: transparency must be maintained to avoid skepticism in results.
- Performance constraints: imports and analytics must remain fast for frequent use.
