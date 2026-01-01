# How to run
1. Open Codex CLI in the RitualFin repo.
2. Paste the prompt below verbatim and run.

---

# Prompt (verbatim)
You are Codex working on the RitualFin repository as a Principal Software Architect + Principal Product/UX Designer.

You combine deep expertise across:
- Software Engineering: TypeScript/React, Node, Supabase/Postgres, storage/CDN, data integrity, migrations safety, performance, RLS/security, observability
- UX/Product Design leadership inspired by:
  - Jony Ive (clarity, calm, reduction)
  - Luke Wroblewski (flows, conversion, friction removal)
  - Aarron Walter (trust, emotional design, product personality without gimmicks)
  - Steve Krug (obvious usability, self-evident UI)
  - Don Norman (human-centered design, error prevention, mental models)
  - Jakob Nielsen / Nielsen Norman Group (heuristics, usability fundamentals)
  - Dieter Rams (principles of good design, restraint)
  - Alan Cooper (goal-directed design, personas, task flows)
  - Kim Goodwin (service design + interaction models)
  - Jared Spool (information scent, UX strategy)
  - Shneiderman (HCI principles, feedback, direct manipulation)
  - Julie Zhuo (design systems, team-level product design execution)

TASK TYPE
This is a UX/UI + Product specification and implementation plan for the COMPLETE RitualFin app (all features and screens), not a single module.

PRIMARY OUTPUT (REQUIRED)
Create OR update a single, implementation-ready Markdown document:
- `docs/UX_UI_MASTER_PLAN.md`

This document must be “engineer-executable”: explicit screen contracts, user journeys, validations, states, data contracts, and a phased implementation roadmap with ticket-ready backlog.

IMPORTANT: In this task, you may write documentation files only.
Do NOT implement application code or database changes unless explicitly asked in a later task.

──────────────────────────────────────────────────────────────────────────────
0) HARD CONSTRAINTS (NON-NEGOTIABLE)
──────────────────────────────────────────────────────────────────────────────
A) Preserve current look & feel
- Do not redesign or rebrand. Keep current visual language and components.
- You may propose consistency upgrades (spacing, hierarchy, table density, truncation, icon alignment), but no new style direction.

B) Localization quality is mandatory (PT-BR, DE-DE, EN-US)
- Every screen must have microcopy triplets (PT/DE/EN) for key labels, helper text, buttons, confirmations, and errors.
- No broken accents/diacritics in UI, exports, previews, downloads, or CSV parsing reports.

C) UX must be “Preview → Confirm → Commit” for destructive or irreversible actions
- Imports, bulk updates, rule changes, and deletions must never silently apply.
- Always show a diff/summary before applying.

D) Keywords governance (critical)
- Keyword lists contain “key expressions” separated by “;”.
- Treat each token between “;” as an atomic expression. Never split into words. Never auto-add/remove “;”.
Example:
  OK: "SV Fuerstenfeldbrucker Wasserratten e.V.; Schwimmverein"
  NOT OK: "SV; Fuerstenfeldbrucker; Wasserratten; e.V.; Schwimmverein"

E) Transactions classification completeness
- Every transaction must end with exactly one final leaf classification (1:1).
- UI grouping is allowed, but analytical classification remains unique.

F) Observability is part of UX
- Every failure must provide:
  - User-facing reason + next action
  - Technical debug payload (log record, import_id, counts, hash, sample row errors)
  - A visible “Status” component on screen (not only a toast)

──────────────────────────────────────────────────────────────────────────────
1) WHAT YOU MUST DO (STEP-BY-STEP)
──────────────────────────────────────────────────────────────────────────────
1) Repo audit (mandatory)
- Scan the repo and inventory the full app surface:
  - routes/screens
  - navigation/IA
  - shared components / UI kit
  - localization approach (where strings live)
  - CSV import implementation (frontend vs backend, parsing lib, error handling)
  - Supabase usage patterns (tables, storage, RLS assumptions)
  - current logging (console, server logs, db logs), and where it is insufficient

2) Market benchmark synthesis (lightweight, no web scraping required)
- Summarize best-practice patterns used by modern personal finance tools:
  - import wizard patterns
  - transaction list readability patterns
  - rule management and review queues
  - budgeting + forecasting UI patterns
  - settings/danger zone patterns
- Convert benchmarks into “RitualFin design rules” aligned with current look & feel.

3) Define “As-Is” vs “To-Be”
- Produce an As-Is IA map and a To-Be IA map.
- Identify missing screens and weak flows.
- Provide a prioritized gap list.

4) Specify end-to-end user journeys (success + recovery)
- Cover the complete app, at minimum:
  - Auth (Google/email)
  - First-time setup / minimal onboarding strategy (even if “soft”)
  - Imports (M&M / Amex / Sparkasse)
  - Transactions (list, filtering, details)
  - Classification + review queue
  - Rules management (keywords and exclusions)
  - Aliases + logos (merchant readability layer)
  - Budget/month overview
  - Recurrence detection + forecasting
  - Settings (data management, exports/imports, danger zone)
  - Error recovery flows (failed import, partial parse, duplicates, conflicting rules)

5) Produce screen contracts for every screen
- Each screen must be specified with:
  - Route + navigation placement
  - Primary job-to-be-done
  - Data dependencies (tables, storage buckets, endpoints)
  - Inputs/outputs (what user can change)
  - State model (loading/empty/partial/error/success)
  - Validation rules (front + back)
  - Error taxonomy with user message + technical payload
  - Audit trail events (who/when/what changed, ids, versioning)
  - Microcopy triplets PT/DE/EN for critical elements

6) Implementation roadmap + ticket-ready backlog
- Phased plan (MVP hardening → scale features → polish)
- Each phase includes acceptance criteria and test requirements:
  - unit tests for parsing logic
  - integration tests for import flows
  - regression checklist for localization/accents
  - UX QA checklist (copy, alignment, truncation, empty states)

──────────────────────────────────────────────────────────────────────────────
2) REQUIRED DEEP-DIVE: IMPORTS + CSV RELIABILITY
──────────────────────────────────────────────────────────────────────────────
You must include a dedicated section in the plan for import reliability, with:
- A standardized import pipeline (preview → confirm → commit)
- A “Parsing Report” UI contract
- A “Reasons why upload didn’t work” logging contract (db + UI)

If sample files exist in the repo or available locally, analyze them (first 20 rows) and document:
- delimiter, encoding, date formats, decimal separators
- header anomalies (spaces, duplicates, localization)
- typical line-break/quote pitfalls
- at least 3 likely failure modes per source
- validation checklist per source
- user-facing error messages + next actions

(If sample CSVs are available in this environment, read them; otherwise document how you will detect these properties programmatically and show them in the Parsing Report.)

──────────────────────────────────────────────────────────────────────────────
3) REQUIRED APP MODULES / SCREENS TO INCLUDE (MINIMUM)
──────────────────────────────────────────────────────────────────────────────
Your To-Be plan must include screen specs for at least:

A) Core
- Login / Auth
- Dashboard (month overview, budget, deltas, health signals)
- Transactions list
- Transaction details drawer/modal (source fields, key_desc, alias_desc, category, recurrence signals)
- Search/filter/sort patterns
- Export (CSV/Excel)

B) Imports
- Import wizard (auto-detect source + manual override)
- Import preview grid
- Parsing Report (new)
- Import history (new)
- Conflict resolution (duplicates/overlaps) (new or embedded)

C) Classification
- Categories (taxonomy + UI grouping)
- Rules manager (keywords + exclusions)
- Review queue (open classifications) with:
  - pick Nivel 1/2/3
  - see current rule expressions and exclusions
  - add new expressions (atomic)
  - apply with retroactive scope options and impact preview

D) Aliases & Logos
- Alias definitions (alias_desc + key_words_alias)
- Logo management:
  - URL input
  - download queue/status
  - local storage path + display sizing rules
  - fallback behavior if logo missing

E) Forecasting / Recurrence
- Recurrence detection visibility (why the system thinks it is recurring)
- Forecast calendar/agenda view:
  - typical day-of-month window recognition
  - expected amounts + variance
  - confidence levels

F) Settings
- Data management (download/edit/upload with diff preview)
- Localization settings (if applicable)
- Danger zone:
  - select what to delete
  - two-step confirmation (typed confirm recommended)
  - post-action summary and audit record

──────────────────────────────────────────────────────────────────────────────
4) docs/UX_UI_MASTER_PLAN.md — REQUIRED STRUCTURE
──────────────────────────────────────────────────────────────────────────────
Write `docs/UX_UI_MASTER_PLAN.md` using this structure:

1. Executive Summary
2. Product North Star (RitualFin)
3. Design Principles (RitualFin-specific, aligned to current UI)
4. Market Benchmark Synthesis → Practical Patterns
5. Information Architecture (As-Is vs To-Be)
6. End-to-End User Journeys (happy path + failure recovery)
7. Screen Inventory (As-Is vs To-Be)
8. Screen Contracts (one subsection per screen)
9. UI Kit & Interaction Standards (keep current style)
10. Content System & Microcopy Guidelines (PT/DE/EN)
11. Import Reliability Specification (Preview/Confirm/Commit + Parsing Report + Logging)
12. Data Integrity, Versioning, and Audit Trail Strategy (UX-facing)
13. Implementation Roadmap (phases, risks, acceptance criteria)
14. Ticket-Ready Backlog (epics → tickets, DoD, tests)
15. Open Decisions / Follow-ups

Microcopy requirement:
- For each critical flow, include microcopy triplets (PT/DE/EN) for:
  - primary actions
  - helper text
  - empty states
  - validation errors
  - confirmations and destructive actions

──────────────────────────────────────────────────────────────────────────────
5) QUALITY BAR
──────────────────────────────────────────────────────────────────────────────
- No vague recommendations: every proposal must be implementable.
- Contracts must include data + states + validation + errors + microcopy.
- Preserve current look & feel; focus on clarity, reliability, and consistency.
- Treat observability as part of product UX.
- Provide a roadmap that can be executed without additional clarification.

──────────────────────────────────────────────────────────────────────────────
6) REUSABLE TASK OPTION (REQUIRED)
──────────────────────────────────────────────────────────────────────────────
At the end of your work, create or update BOTH files so this task can be re-run anytime:

A) `docs/prompts/UX_UI_MASTER_PLAN_PROMPT.md`
- Must contain the exact full prompt text you are following (verbatim).
- Include a short “How to run” section at the top.

B) `docs/prompts/README.md`
- List available prompts and when to use them.
- Include a simple “copy/paste into Codex” instruction.

Also add a short section at the bottom of `docs/UX_UI_MASTER_PLAN.md`:
- “Re-run instructions” pointing to `docs/prompts/UX_UI_MASTER_PLAN_PROMPT.md`.

NOW EXECUTE
1) Audit repo and capture As-Is app surface.
2) Produce To-Be IA and complete screen contracts.
3) Write/update `docs/UX_UI_MASTER_PLAN.md`.
4) Save the reusable prompt files as specified.

Work autonomosly
