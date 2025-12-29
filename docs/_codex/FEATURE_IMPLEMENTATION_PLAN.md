# Feature Implementation Plan (Execution Contract)

## 0) Document Header

- Purpose: Define the contractual feature packages, scope, dependencies, and acceptance criteria that govern execution.
- Inputs used: `docs/_codex/USER_FEEDBACK_VERBATIM.md`, `docs/_codex/PRD_FROM_USER_FEEDBACK.md`, `docs/_codex/CATEGORY_CLASSIFICATION_PROPOSAL.md`, `docs/ARCHITECTURE_AND_AI_LOGIC.md`, `docs/IMPLEMENTATION_LOG.md`.
- Audience: Claude (review/approval/final sequencing) and Codex (execution after approval).
- Rules of use: No feature work outside this document; changes require Claude approval and log updates.

## 1) Global Execution Principles

- Financial truth > visual polish.
- Projection-aware budgeting is mandatory for “available to spend.”
- “Interna” must never distort analytics or budgets.
- Rules target N3 (never N1/N2) to keep taxonomy stable.
- All classifications must be auditable and explainable.
- Imports must be deduplicated and traceable with logs.

## 2) Feature Packages (Core)

## [P0] Data Ingestion: CSV + Screenshot

### 1. Purpose (User Value)
Reliable, repeatable imports without duplicates, so users trust the data.

### 2. Description
Ingest CSVs and screenshots, normalize transactions, and record balances from screenshots.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: multi-provider CSV parsing, screenshot recognition, normalization, import summaries.
- Excluded: Open Finance, custom user-defined mappings.
- Required behaviors: deterministic parsing, logging, and dedup across sources.
- Edge cases handled: overlapping uploads, mixed sources, missing optional fields.
- Edge cases not handled: unsupported provider formats.

### 4. Inputs
- CSV files by provider layout.
- Screenshot images from supported accounts/cards.
- Provider metadata for account identification.

### 5. Outputs
- Normalized transactions.
- Balance snapshots with timestamps.
- Import summary per upload.

### 6. Category & Rules Interaction
- Transactions enter uncategorized or auto-categorized by rules.
- “Interna” detection applied via rules when possible.

### 7. Dependencies
- Category taxonomy (N1–N3).
- Rules engine and normalization logic.

### 8. Failure Modes & Risks
- Parsing errors cause missing data; must surface in logs.
- Screenshot recognition failures must not create partial data.

### 9. Acceptance Criteria
- Re-uploading identical CSVs produces zero visible duplicates.
- Screenshot uploads produce balance snapshots with timestamps.

### 10. Complexity Assessment
- Data complexity: High
- Logic complexity: High
- UX coupling: Medium
- Overall: High

## [P1] Deduplication & Upload Logs

### 1. Purpose (User Value)
Transparency and trust in import history and dedup outcomes.

### 2. Description
Track uploads with status, counts, and detailed error/dup logs.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: upload history, counts, detailed logs per upload.
- Excluded: raw transaction data in logs.
- Required behaviors: deterministic duplicate detection and visible counts.
- Edge cases handled: partial failures, invalid rows.
- Edge cases not handled: fuzzy duplicate detection.

### 4. Inputs
- Import results, duplicate keys, parse errors.

### 5. Outputs
- Upload history entries.
- Error and dedup summaries.

### 6. Category & Rules Interaction
- None directly, but logs must note if rules were applied.

### 7. Dependencies
- Data ingestion package.

### 8. Failure Modes & Risks
- Missing logs reduce trust; must fail safe with summaries.

### 9. Acceptance Criteria
- Each upload shows counts for read/imported/duplicate/failed.
- Detailed logs accessible per upload.

### 10. Complexity Assessment
- Data complexity: Medium
- Logic complexity: Medium
- UX coupling: Low
- Overall: Medium

## [P2] Transactions Ledger & Status

### 1. Purpose (User Value)
Complete, auditable ledger with clear operational status and editability.

### 2. Description
List and detail transactions with status states, icons, and explainable categorization.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: list, details, edit, status taxonomy.
- Excluded: hiding audit data or removing internal entries.
- Required behaviors: simplified merchant display, status meaning, rule explanation.
- Edge cases handled: missing categories, low confidence, duplicates.
- Edge cases not handled: automated edits without user confirmation.

### 4. Inputs
- Transactions, rules, categories, status flags.

### 5. Outputs
- Status labels, explanations, edit updates, audit trail.

### 6. Category & Rules Interaction
- Display N1–N3 path.
- Show rule and keywords used.
- “Interna” flagged and excluded from analytics.

### 7. Dependencies
- Rules engine, taxonomy, data ingestion.

### 8. Failure Modes & Risks
- Misleading status labels undermine trust.

### 9. Acceptance Criteria
- Each transaction has a clear status definition.
- Detail view shows category path and rule explanation.

### 10. Complexity Assessment
- Data complexity: Medium
- Logic complexity: Medium
- UX coupling: High
- Overall: Medium

## [P3] Rules Engine & Taxonomy Governance

### 1. Purpose (User Value)
Consistent, explainable auto-categorization that can evolve safely.

### 2. Description
Manage keyword rules against N3 targets, with priority, conflicts, and preview.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: rule CRUD, priority, AND/OR, negative keywords, impact preview, tests.
- Excluded: rules pointing to N1/N2.
- Required behaviors: rules target N3; preview before apply.
- Edge cases handled: conflicting rules, overlaps.
- Edge cases not handled: AI-only auto-categorization.

### 4. Inputs
- Rules, category tree (N1–N3), sample descriptions.

### 5. Outputs
- Rule matches, preview counts, applied categories.

### 6. Category & Rules Interaction
- Rules bind to N3 and cascade to N1/N2 for display.
- “Interna” rules have highest priority.

### 7. Dependencies
- Taxonomy definition, normalization.

### 8. Failure Modes & Risks
- Poor rule priority leads to misclassification.

### 9. Acceptance Criteria
- Rule test returns a category for a sample description.
- Preview shows how many transactions change before apply.

### 10. Complexity Assessment
- Data complexity: Medium
- Logic complexity: High
- UX coupling: Medium
- Overall: High

## [P4] Confirm Queue (Unclassified Bundling)

### 1. Purpose (User Value)
Fast resolution of unclassified items with minimal effort.

### 2. Description
Bundle transactions by merchant and allow bulk classification and rule creation.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: bundling by merchant-normalized, bulk apply, keyword edits.
- Excluded: bundling by account or amount.
- Required behaviors: one-click access to full Key_Desc.
- Edge cases handled: mixed accounts, repeated imports.
- Edge cases not handled: semantic clustering beyond merchant.

### 4. Inputs
- Unclassified transactions, merchant normalization, key descriptions.

### 5. Outputs
- Bulk classification updates, optional rule creation.

### 6. Category & Rules Interaction
- Apply N3 categories; optional rule creation targets N3.
- “Interna” handled via rule option.

### 7. Dependencies
- Rules engine, taxonomy, normalization.

### 8. Failure Modes & Risks
- Wrong merchant normalization causes mis-bundling.

### 9. Acceptance Criteria
- All “LIDL” variants appear in a single bundle.

### 10. Complexity Assessment
- Data complexity: Medium
- Logic complexity: Medium
- UX coupling: High
- Overall: Medium

## [P5] Budget & Commitments

### 1. Purpose (User Value)
Define monthly limits and recognize future obligations for accurate availability.

### 2. Description
Monthly budget inputs with category limits and commitment definitions.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: month selection, income estimate, category limits, copy previous month.
- Excluded: long-term goals (handled in Goals).
- Required behaviors: commitments inform availability.
- Edge cases handled: missing income estimate.
- Edge cases not handled: automatic bill pay.

### 4. Inputs
- Budget targets, commitments/recurrences, transactions.

### 5. Outputs
- Budget limits by category, commitment totals.

### 6. Category & Rules Interaction
- Category limits align with N1/N2 displays, rules target N3.
- “Interna” excluded from budget consumption.

### 7. Dependencies
- Transactions ledger, rules engine, taxonomy.

### 8. Failure Modes & Risks
- Incomplete commitments cause inflated availability.

### 9. Acceptance Criteria
- Budget copy duplicates prior month limits.

### 10. Complexity Assessment
- Data complexity: Medium
- Logic complexity: Medium
- UX coupling: Medium
- Overall: Medium

## [P6] Dashboard (Financial Truth)

### 1. Purpose (User Value)
Instant understanding of month status and safe-to-spend capacity.

### 2. Description
Show KPIs, commitments, category spend vs limit, and recent transactions.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: MTD spend, committed, available-to-spend (week/end-week/end-month), category status.
- Excluded: real-time banking or payments.
- Required behaviors: availability subtracts projections and commitments.
- Edge cases handled: no budget set, partial data.
- Edge cases not handled: forecast beyond known commitments.

### 4. Inputs
- Transactions, budgets, commitments, recurrences.

### 5. Outputs
- KPIs, category usage %, alerts for upcoming obligations.

### 6. Category & Rules Interaction
- Category rollups show N1/N2 with N3 rule inputs.
- “Interna” excluded from spend totals.

### 7. Dependencies
- Budget & commitments, transactions ledger.

### 8. Failure Modes & Risks
- Incorrect projection math misleads spending decisions.

### 9. Acceptance Criteria
- “Available to spend” uses realized + projected obligations.

### 10. Complexity Assessment
- Data complexity: High
- Logic complexity: High
- UX coupling: High
- Overall: High

## [P7] Calendar (Month + 4-Week)

### 1. Purpose (User Value)
See past vs projected cash flow by day/week and drill down quickly.

### 2. Description
Month view with past actuals and future projections; 4-week selection with summaries.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: day totals, week totals, contextual detail panel.
- Excluded: real-time updates or external calendar sync.
- Required behaviors: clearly label projected vs realized.
- Edge cases handled: future weeks with only projections.
- Edge cases not handled: custom week ranges.

### 4. Inputs
- Transactions, projections, commitments.

### 5. Outputs
- Daily totals, weekly totals, contextual detail lists.

### 6. Category & Rules Interaction
- Categories shown in detail lists; “Interna” excluded from totals.

### 7. Dependencies
- Transactions, commitments, budget calculations.

### 8. Failure Modes & Risks
- Mislabeling projected values erodes trust.

### 9. Acceptance Criteria
- Clicking a future day shows projected items labeled as such.

### 10. Complexity Assessment
- Data complexity: Medium
- Logic complexity: Medium
- UX coupling: High
- Overall: Medium

## [P8] Accounts & Balances

### 1. Purpose (User Value)
See balances, limits, and net position in one place.

### 2. Description
Show account cards with balances, last update, credit limits, and net position.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: last upload, balance timestamp, credit limits, net position formula.
- Excluded: Open Finance.
- Required behaviors: net position derived from bank balance minus card usage.
- Edge cases handled: stale balances.
- Edge cases not handled: multi-currency consolidation.

### 4. Inputs
- Balance snapshots, card usage totals, account metadata.

### 5. Outputs
- Account summary cards, consolidated net position.

### 6. Category & Rules Interaction
- Internal transfers excluded from usage totals.

### 7. Dependencies
- Ingestion, ledger, balance snapshots.

### 8. Failure Modes & Risks
- Stale balances must be surfaced to avoid false confidence.

### 9. Acceptance Criteria
- Net position matches stated formula using latest balances.

### 10. Complexity Assessment
- Data complexity: Medium
- Logic complexity: Medium
- UX coupling: Medium
- Overall: Medium

## [P9] Goals (Metas)

### 1. Purpose (User Value)
Separate strategic goals from operational budgets.

### 2. Description
Define goals with value, purpose, type (monthly vs deadline), and dates.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: goal creation, type, dates, link to budget via reserve concept.
- Excluded: investment tracking.
- Required behaviors: goals do not replace budgets.
- Edge cases handled: missing deadline for monthly goals.
- Edge cases not handled: multi-currency goals.

### 4. Inputs
- Goal definitions.

### 5. Outputs
- Goal records with status.

### 6. Category & Rules Interaction
- Goals may reference categories but do not alter rules.

### 7. Dependencies
- Budget package.

### 8. Failure Modes & Risks
- Goals over-commit budgets if not clearly separated.

### 9. Acceptance Criteria
- Goals exist independently from budget limits.

### 10. Complexity Assessment
- Data complexity: Low
- Logic complexity: Low
- UX coupling: Medium
- Overall: Low

## [P10] Financial Rituals

### 1. Purpose (User Value)
Create a repeatable, low-stress review process with accountability.

### 2. Description
Schedule weekly/monthly rituals, capture agreements, and track outcomes.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: scheduling, reminders, agreement capture, review next ritual.
- Excluded: enforcement or penalties.
- Required behaviors: agreements are structured and reviewable.
- Edge cases handled: skipped rituals.
- Edge cases not handled: multi-user conflict resolution.

### 4. Inputs
- Ritual schedules, agreements, budget/actual summaries.

### 5. Outputs
- Ritual records and agreement statuses.

### 6. Category & Rules Interaction
- Agreements reference categories; “Interna” excluded from analytics.

### 7. Dependencies
- Budget and dashboard data.

### 8. Failure Modes & Risks
- Missing ritual data reduces accountability.

### 9. Acceptance Criteria
- Next ritual shows previous agreements and outcomes.

### 10. Complexity Assessment
- Data complexity: Medium
- Logic complexity: Medium
- UX coupling: Medium
- Overall: Medium

## [P11] Intelligent Keyword Analysis

### 1. Purpose (User Value)
Reduce manual classification by suggesting keywords and categories.

### 2. Description
Analyze uncategorized clusters and propose keyword/category suggestions for review.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: suggestions, coverage estimates, accept/edit/reject.
- Excluded: automatic application without confirmation.
- Required behaviors: explainable suggestions; controlled enrichment.
- Edge cases handled: small sample clusters.
- Edge cases not handled: full semantic classification.

### 4. Inputs
- Unclassified transactions, existing rules.

### 5. Outputs
- Suggested keywords and N3 targets.

### 6. Category & Rules Interaction
- Suggestions target N3; accepted suggestions can generate rules.

### 7. Dependencies
- Rules engine, confirm queue, normalization.

### 8. Failure Modes & Risks
- Low-quality suggestions cause mistrust; must be reviewable.

### 9. Acceptance Criteria
- Suggestions never auto-apply without user confirmation.

### 10. Complexity Assessment
- Data complexity: Medium
- Logic complexity: Medium
- UX coupling: Medium
- Overall: Medium

## [P12] AI Assistant Panel

### 1. Purpose (User Value)
Answer ad-hoc questions quickly with contextual awareness.

### 2. Description
Provide a contextual and global Q&A interface based on app data.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: contextual vs global classification, response based on app data.
- Excluded: actions without confirmation.
- Required behaviors: uses current filters when contextual.
- Edge cases handled: unclear context defaults to global.
- Edge cases not handled: autonomous decision making.

### 4. Inputs
- Screen context, filters, transactions, budgets, goals.

### 5. Outputs
- Natural language answers and next-step guidance.

### 6. Category & Rules Interaction
- Must respect “Interna” exclusions and N3-based classification.

### 7. Dependencies
- Transactions, budgets, goals, projections.

### 8. Failure Modes & Risks
- Misinterpreted context produces incorrect answers.

### 9. Acceptance Criteria
- Contextual queries use current screen filters when available.

### 10. Complexity Assessment
- Data complexity: High
- Logic complexity: High
- UX coupling: Medium
- Overall: High

## [P13] Merchant Icon Registry

### 1. Purpose (User Value)
Faster recognition of merchants and cleaner transaction lists.

### 2. Description
Map merchant_normalized to locally cached icons with attribution.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: icon mapping, cache-only runtime usage, attribution storage.
- Excluded: runtime external fetches.
- Required behaviors: fallback when icon missing.
- Edge cases handled: unknown merchants.
- Edge cases not handled: dynamic icon changes without manual update.

### 4. Inputs
- merchant_normalized, icon metadata.

### 5. Outputs
- Icon references and display metadata.

### 6. Category & Rules Interaction
- Independent of rules; uses normalized merchant key.

### 7. Dependencies
- Merchant normalization from ingestion.

### 8. Failure Modes & Risks
- Missing icons should not block lists.

### 9. Acceptance Criteria
- App never fetches icons during normal rendering.

### 10. Complexity Assessment
- Data complexity: Low
- Logic complexity: Low
- UX coupling: Medium
- Overall: Low

## [P14] Navigation & Copy Consistency

### 1. Purpose (User Value)
Reduce confusion with consistent Portuguese labels and grouped navigation.

### 2. Description
Standardize screen titles, menu clusters, and key labels.

### 3. Feature Contract (NON-NEGOTIABLE)
- Included: title consistency, accent corrections, menu clustering.
- Excluded: UI redesign or layout changes.
- Required behaviors: consistent naming across menu and pages.
- Edge cases handled: legacy labels.
- Edge cases not handled: new localization languages.

### 4. Inputs
- Existing navigation labels.

### 5. Outputs
- Updated naming map for UI labels.

### 6. Category & Rules Interaction
- None directly.

### 7. Dependencies
- None.

### 8. Failure Modes & Risks
- Inconsistent naming breaks user mental model.

### 9. Acceptance Criteria
- Menu labels and H1 titles match exactly.

### 10. Complexity Assessment
- Data complexity: Low
- Logic complexity: Low
- UX coupling: Medium
- Overall: Low

## 3) Feature Grouping & Phases

- P0 Foundations: P0 Data Ingestion, P1 Dedup & Logs, P2 Transactions Ledger.
- P1 Core Financial Truth: P3 Rules Engine, P4 Confirm Queue, P5 Budget & Commitments.
- P2 Projections & Analytics: P6 Dashboard, P7 Calendar.
- P3 Accounts & Balances: P8 Accounts.
- P4 Goals & Rituals: P9 Goals, P10 Financial Rituals.
- P5 AI & Assistance (Gated): P11 Intelligent Keyword Analysis, P12 AI Assistant.
- P6 UX Consistency: P13 Merchant Icons, P14 Navigation & Copy.

## 4) Dependency Map

- P0 Data Ingestion blocks all analytics and downstream features.
- P3 Rules Engine and P4 Confirm Queue depend on taxonomy and ingestion normalization.
- P5 Budget & Commitments required before Dashboard availability calculations.
- P6 Dashboard depends on P2 Ledger + P5 Budget.
- P7 Calendar depends on P2 Ledger + P5 Commitments.
- P8 Accounts depends on balance snapshots from ingestion.
- P11 Intelligent Keyword Analysis depends on P3 Rules + P4 Confirm Queue.
- P12 AI Assistant depends on core data (P2, P5, P8).

## 5) Recommended Implementation Order (PROPOSAL)

1. P0 Data Ingestion
2. P1 Dedup & Logs
3. P2 Transactions Ledger & Status
4. P3 Rules Engine & Taxonomy Governance
5. P4 Confirm Queue
6. P5 Budget & Commitments
7. P6 Dashboard
8. P7 Calendar
9. P8 Accounts & Balances
10. P9 Goals
11. P10 Financial Rituals
12. P13 Merchant Icon Registry
13. P14 Navigation & Copy Consistency
14. P11 Intelligent Keyword Analysis
15. P12 AI Assistant Panel

## 6) Open Questions & Decisions Needed

- Confirm whether N4 categories are future-only or must be supported now.
- Provide the missing reference text for “Análise Inteligente de Keywords.”
- Define how commitments are created (manual only vs AI-assisted suggestions).
- Clarify whether AI features require opt-in per user or global enablement.
