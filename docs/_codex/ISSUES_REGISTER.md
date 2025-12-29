# Issues Register (Codex)

## 2025-12-29T11:40:14Z (UTC)
- Issue: Secrets present in documentation (database URLs and keys referenced in docs).
  - Severity: Critical
  - Status: Open
  - Owner: Claude
  - Mitigation: Redact secrets in docs and rotate exposed credentials.
- Issue: Demo auth and RLS disabled in production plan.
  - Severity: High
  - Status: Open
  - Owner: Claude
  - Mitigation: Implement proper auth and RLS prior to production use.
- Issue: Deployment relies on Vercel Git integration noted as unreliable.
  - Severity: Medium
  - Status: Open
  - Owner: Claude
  - Mitigation: Standardize on CLI deploy or repair Git integration.

## 2025-12-29T12:37:15Z (UTC)
- Issue: Reference text for “Análise Inteligente de Keywords” is not provided (“Conforme o texto que você já trouxe”).
  - Severity: Medium
  - Status: Open
  - Owner: Claude
  - Mitigation: Confirm the missing reference text or provide it for PRD completeness.
- Issue: Category depth alternates between N1–N3 and N1–N4 in feedback.
  - Severity: Low
  - Status: Open
  - Owner: Claude
  - Mitigation: Confirm whether N4 should be supported or treated as future-only.

## 2025-12-29T13:02:14Z (UTC)
- Issue: Commitments source is not fully defined (manual only vs AI-assisted suggestions).
  - Severity: Medium
  - Status: Open
  - Owner: Claude
  - Mitigation: Decide commitment creation source and update plan accordingly.
- Issue: AI features opt-in requirement unclear (per user vs global).
  - Severity: Medium
  - Status: Open
  - Owner: Claude
  - Mitigation: Define AI enablement policy before implementation.

## 2025-12-29T12:44:32Z (UTC)
- Issue: Ambiguity on whether appended PRD and category tables in the prompt should be included in the verbatim source of truth.
  - Severity: Low
  - Status: Closed
  - Owner: Claude
  - Mitigation: User approved inclusion; verbatim updated accordingly.

## 2025-12-29T13:07:57Z (UTC)
- Issue: Feature implementation plan may require package regrouping or scope edits after Claude review.
  - Severity: Low
  - Status: Open
  - Owner: Claude
  - Mitigation: Claude to confirm final package set and sequencing in the plan.

## 2025-12-29T13:50:17Z (UTC)
- Issue: `npm run check` fails due to TypeScript errors in `server/replit_integrations/*`.
  - Severity: Medium
  - Status: Open
  - Owner: Claude
  - Mitigation: Fix or exclude the replit integrations from typecheck if unused in production.
- Issue: Local dev server cannot bind to `0.0.0.0:5000` in this environment (ENOTSUP), blocking `/api/health` verification.
  - Severity: Low
  - Status: Open
  - Owner: Codex
  - Mitigation: Verify `/api/health` in a supported environment (Render) or adjust local runtime constraints.
- Issue: Optional OpenAI key caused server startup failure.
  - Severity: High
  - Status: Resolved
  - Owner: Codex
  - Mitigation: Guard OpenAI client initialization and AI endpoint when `OPENAI_API_KEY` is unset.

## 2025-12-29T13:49:17Z (UTC)
- Issue: Mandatory handoff/decision files missing from repo (`CODEX_HANDOFF_INSTRUCTION.md`, `docs/_codex/RESOLVED_DECISIONS.md`).
  - Severity: Low
  - Status: Open
  - Owner: Claude
  - Mitigation: Restore or confirm canonical locations for missing docs.

## 2025-12-29T17:20:16Z (UTC)
- Issue: Mandatory deployment docs not found at expected paths (`docs/DEPLOYMENT_STATUS.md`, `docs/WHY_GIT_INTEGRATION_BROKEN.md`).
  - Severity: Low
  - Status: Open
  - Owner: Codex
  - Mitigation: Confirm canonical paths or add redirects/links in docs.
- Issue: Local runtime QA blocked by missing DATABASE_URL (dev server not started).
  - Severity: Low
  - Status: Open
  - Owner: Codex
  - Mitigation: Provide DATABASE_URL in environment and rerun `npm run dev` + `/api/health`.
