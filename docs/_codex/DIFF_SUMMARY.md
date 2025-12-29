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

## 2025-12-29T16:03:03Z (UTC)
- Modified: shared/schema.ts
  - Change: Reworked `ai_usage_logs` schema to match C.4 spec (operation/tokens/cost/modelUsed).
  - Reason: Align AI usage tracking schema with Batch 1 C.4.
- New: server/ai-logger.ts
  - Change: Added logAIUsage wrapper with pricing-based cost calculation.
  - Reason: Centralize AI usage logging per spec.
- Modified: server/ai-usage.ts
  - Change: Adapted OpenAI usage helper to call logAIUsage with operation mapping.
  - Reason: Preserve existing OpenAI instrumentation while using new schema.
- Modified: server/routes.ts
  - Change: Added `/api/ai/suggest-keyword`, `/api/ai/bulk-categorize`, and upgraded `/api/ai/usage` with date filtering and totals.
  - Reason: Implement Batch 1 C.4 endpoints and logging integration.
- Modified: server/storage.ts
  - Change: Updated AI usage log types to new schema names.
  - Reason: Align storage types with schema changes.

## 2025-12-29T16:07:04Z (UTC)
- Modified: shared/schema.ts
  - Change: Added `notification_type` enum and aligned `notifications` table with C.5 schema.
  - Reason: Implement Batch 1 C.5 notification backend spec.
- Modified: server/storage.ts
  - Change: Replaced notification update method with mark-as-read helper.
  - Reason: Match notification API contract.
- Modified: server/routes.ts
  - Change: Updated notification endpoints to GET/POST/PATCH :id/read/DELETE with validation.
  - Reason: Match C.5 CRUD behavior and validation requirements.

## 2025-12-29T16:19:05Z (UTC)
- Modified: shared/schema.ts
  - Change: Added upload progress/rows fields and `completed` status enum value.
  - Reason: Support async CSV progress tracking.
- Modified: server/csv-parser.ts
  - Change: Added streaming parser with progress callbacks; deprecated parseCSV to use streaming.
  - Reason: Replace buffered parsing with chunked streaming.
- Modified: server/storage.ts
  - Change: Added upload progress updates and user-scoped getUpload.
  - Reason: Store progress and enforce user isolation on progress polling.
- Modified: server/routes.ts
  - Change: Refactored uploads processing to use streaming parser with progress updates and added `/api/uploads/:id/progress`.
  - Reason: Implement async CSV processing per C.7.
- Modified: client/src/pages/uploads.tsx
  - Change: Treat `completed` status as successful uploads in UI badges and stats.
  - Reason: Align UI with new upload status.
- Modified: package.json, package-lock.json
  - Change: Added `csv-parse` dependency.
  - Reason: Streaming CSV parsing requirement.

## 2025-12-29T16:27:20Z (UTC)
- New: server/ai-context.ts
  - Change: Added chat context assembly using recent transactions and goals.
  - Reason: Provide AI assistant context for SSE chat.
- Modified: shared/schema.ts
  - Change: Updated conversations/messages tables to match C.6 schema (UUID text ids, role enum, cascade delete).
  - Reason: Enable AI chat persistence with user scoping.
- Modified: server/storage.ts
  - Change: Added conversation/message storage helpers and extended `getTransactions` for date range queries.
  - Reason: Support AI chat context and persistence.
- Modified: server/routes.ts
  - Change: Added `/api/ai/chat` SSE endpoint with context assembly and usage logging.
  - Reason: Implement Batch 3 C.6 AI assistant streaming backend.
- Modified: server/replit_integrations/chat/storage.ts, server/replit_integrations/chat/routes.ts
  - Change: Added demo user scoping for conversations and role typing.
  - Reason: Align integrations with new conversations schema.

## 2025-12-29T16:28:46Z (UTC)
- New: docs/_codex/PHASES_1_TO_4_COMPLETE_SUMMARY.md
  - Change: Added consolidated completion summary for phases 1–4.
  - Reason: Required final deliverable.
- Modified: docs/_codex/DEPLOYMENT_NOTES.md
  - Change: Documented deployment-relevant schema changes, endpoints, and dependency additions.
  - Reason: Deployment-impact documentation requirement.

## 2025-12-29T16:58:22Z (UTC)
- Modified: server/db.ts
  - Change: Replace thrown error with explicit console error and exit when DATABASE_URL missing.
  - Reason: Provide clear, non-noisy startup failure for DB-free QA.
