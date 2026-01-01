# Diff Summary (Codex)

## 2025-12-29T11:40:14Z (UTC)
- Modified: .gitignore
  - Change: Add `.vercel/` to ignore Vercel CLI artifacts.
  - Reason: Prevent local Vercel metadata from appearing as untracked.
- New: docs/_codex/*
  - Change: Introduced Codex-only documentation system files.
  - Reason: Required governance for analysis, plans, decisions, QA, and risks.

## 2025-12-29T12:37:15Z (UTC)
- New: docs/_codex/USER_FEEDBACK_VERBATIM.md
  - Change: Added verbatim user feedback source of truth.
  - Reason: Required Deliverable 1.
- New: docs/_codex/PRD_FROM_USER_FEEDBACK.md
  - Change: Added structured PRD derived from user feedback.
  - Reason: Required Deliverable 2.
- New: docs/_codex/CATEGORY_CLASSIFICATION_PROPOSAL.md
  - Change: Added initial N1–N3 taxonomy proposal.
  - Reason: Required Deliverable 3.
- New: docs/_codex/PLAN_STRUCTURE_CONTRACT.md
  - Change: Added plan structure contract for future execution.
  - Reason: Required Deliverable 4.
- Modified: docs/_codex/PLAN_LOG.md
  - Change: Marked plan as approved.
  - Reason: User approval to proceed.
- Modified: docs/_codex/CODEX_ACTIVITY_LOG.md, docs/_codex/DECISION_LOG.md, docs/_codex/ISSUES_REGISTER.md, docs/_codex/QA_NOTES.md
  - Change: Logged session activity, decisions, issues, and QA notes.
  - Reason: Documentation discipline requirements.

## 2025-12-29T12:44:32Z (UTC)
- Modified: docs/_codex/USER_FEEDBACK_VERBATIM.md
  - Change: Appended provided PRD and detailed category table to the verbatim source.
  - Reason: User requested inclusion of appended materials.
- Modified: docs/_codex/CATEGORY_CLASSIFICATION_PROPOSAL.md
  - Change: Added detailed category table as a reference section.
  - Reason: Expand proposal with provided detailed taxonomy.
- New: docs/_codex/FEATURE_IMPLEMENTATION_PLAN.md
  - Change: Added feature implementation plan using the plan contract structure.
  - Reason: User requested a feature implementation plan.
- Modified: docs/_codex/PLAN_LOG.md
  - Change: Marked new plan as approved.
  - Reason: User approval to proceed.
- Modified: docs/_codex/CODEX_ACTIVITY_LOG.md, docs/_codex/DECISION_LOG.md, docs/_codex/ISSUES_REGISTER.md, docs/_codex/QA_NOTES.md
  - Change: Logged session activity, decisions, issues, and QA notes.
  - Reason: Documentation discipline requirements.

## 2025-12-29T13:02:14Z (UTC)
- Modified: docs/_codex/FEATURE_IMPLEMENTATION_PLAN.md
  - Change: Rewritten to the required contractual structure with feature packages, phases, and dependency map.
  - Reason: Align plan with mandated template and inputs.
- Modified: docs/_codex/PLAN_LOG.md
  - Change: Marked plan as approved for documentation updates.
  - Reason: User instruction to proceed.
- Modified: docs/_codex/CODEX_ACTIVITY_LOG.md, docs/_codex/DECISION_LOG.md, docs/_codex/ISSUES_REGISTER.md, docs/_codex/QA_NOTES.md
  - Change: Logged session activity, decisions, risks, and QA notes.
  - Reason: Documentation discipline requirements.

## 2025-12-29T13:07:57Z (UTC)
- New: docs/_codex/CODEX_HANDOFF_TO_CLAUDE.md
  - Change: Added Claude handoff summary and review instructions.
  - Reason: User requested a copyable handoff for Claude.
- Modified: docs/_codex/PLAN_LOG.md
  - Change: Added and approved plan entry for handoff document.
  - Reason: Required by Codex governance.
- Modified: docs/_codex/CODEX_ACTIVITY_LOG.md, docs/_codex/DECISION_LOG.md, docs/_codex/ISSUES_REGISTER.md, docs/_codex/QA_NOTES.md
  - Change: Logged session activity, decisions, issues, and QA notes.
  - Reason: Documentation discipline requirements.

## 2025-12-29T13:50:17Z (UTC)
- Modified: client/src/lib/queryClient.ts
  - Change: Align API URL building with `/api` prefix behavior for production and dev.
  - Reason: Prevent 404s from missing `/api` on TanStack Query calls.
- Modified: server/db.ts
  - Change: Add conditional SSL for Supabase pooler connections.
  - Reason: Render-to-Supabase connectivity requires SSL on managed pooler.
- Modified: server/routes.ts
  - Change: Add `/api/health` endpoint with DB ping; make OpenAI client optional and guard AI endpoint.
  - Reason: Health checks and optional AI features should not crash the server.
- Modified: .env.example
  - Change: Clarify VITE_API_URL should not include `/api`; remove unused SESSION_SECRET section.
  - Reason: Reduce configuration drift and confusion.
- Modified: docs/DEPLOYMENT_GUIDE.md, docs/DEPLOYMENT_INSTRUCTIONS.md
  - Change: Clarify VITE_API_URL usage and remove SESSION_SECRET references.
  - Reason: Align docs with current code and deployment wiring.
- Modified: docs/_codex/PLAN_LOG.md, docs/_codex/CODEX_ACTIVITY_LOG.md, docs/_codex/QA_NOTES.md
  - Change: Logged plan amendment, activity, and QA outcomes.
  - Reason: Governance and traceability.

## 2025-12-29T13:49:17Z (UTC)
- Modified: shared/schema.ts
  - Change: Added `ai_usage_logs` and `notifications` tables and schemas.
  - Reason: Batch 1 C.4/C.5 requirements.
- New: server/ai-usage.ts
  - Change: Added OpenAI usage logging helper with safe metadata storage.
  - Reason: Centralize usage logging for all OpenAI calls.
- Modified: server/storage.ts
  - Change: Added storage methods for AI usage logs and notifications.
  - Reason: Support new tables and API endpoints.
- Modified: server/routes.ts
  - Change: Added notifications CRUD, AI usage GET, and OpenAI logging wrapper.
  - Reason: Batch 1 API requirements.
- Modified: server/replit_integrations/chat/routes.ts
  - Change: Log OpenAI usage for chat streaming calls.
  - Reason: Ensure all OpenAI calls are tracked.
- Modified: server/replit_integrations/image/routes.ts, server/replit_integrations/image/client.ts
  - Change: Log OpenAI usage for image generation/editing calls.
  - Reason: Ensure all OpenAI calls are tracked.
- Modified: server/replit_integrations/batch/utils.ts
  - Change: Fix AbortError typing for p-retry usage.
  - Reason: QA typecheck failure surfaced during Batch 1.
- Modified: docs/IMPLEMENTATION_LOG.md, docs/ARCHITECTURE_AND_AI_LOGIC.md
  - Change: Documented Batch 1 observability and notifications additions.
  - Reason: Keep architecture and implementation logs current.
- Modified: docs/_codex/CODEX_ACTIVITY_LOG.md, docs/_codex/DECISION_LOG.md, docs/_codex/ISSUES_REGISTER.md
  - Change: Logged session constraints, decisions, and missing docs.
  - Reason: Codex governance.

## 2026-01-01
- Added: `README.md`, `server/classification-utils.ts`, `server/logo-downloader.ts`, `server/recurrence.ts`, `client/src/components/alias-logo.tsx`, `script/test-imports.ts`, `migrations/004_classification_alias_logos.sql`, `server/seed-data/categorias.csv`, `server/seed-data/alias_desc.csv`
- Modified: `shared/schema.ts`, `server/csv-parser.ts`, `server/routes.ts`, `server/storage.ts`, `server/rules-engine.ts`, `client/src/lib/api.ts`, `client/src/pages/settings.tsx`, `client/src/pages/transactions.tsx`, `client/src/pages/confirm.tsx`, `client/src/pages/uploads.tsx`, `client/src/pages/dashboard.tsx`, `client/src/components/calendar/detail-panel.tsx`, `client/src/components/transaction-detail-modal.tsx`, `docs/ARCHITECTURE_AND_AI_LOGIC.md`, `docs/IMPLEMENTATION_LOG.md`
- Notes: Added settings UI for classification/imports/aliases, new taxonomy + alias tables, logo downloader, recurrence inference, and CSV preview support.

## 2026-01-01 (Follow-up)
- Fixed TS issues in `server/csv-parser.ts`, `server/routes.ts`, `server/rules-engine.ts`, `server/storage.ts`.
- Dashboard aggregations now use app_category mapping in `server/storage.ts`.
