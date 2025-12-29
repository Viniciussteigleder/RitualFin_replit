# Deployment Notes (Codex)

## 2025-12-29T11:40:14Z (UTC)
- Preferred deployment model: Vercel frontend + separate backend runtime (Render/Fly/Railway) due to serverless timeouts for CSV/AI.
- Risks noted: serverless timeouts, bundle limits, and Git integration reliability.
- Rollback guidance: Use platform rollback features; avoid relying on untested auto-deploy.
- CORS required for split backend; ensure ALLOWED_ORIGIN is set (value redacted).

## 2025-12-29T16:28:46Z (UTC)
- Schema changes require db:push: `ai_usage_logs` (operation/tokens/cost), `notification_type` enum + notifications update, uploads progress fields, conversations/messages tables, `upload_status` enum includes `completed`.
- New/updated endpoints: `/api/ai/usage` (date filters + totals), `/api/ai/suggest-keyword`, `/api/ai/bulk-categorize`, `/api/ai/chat` (SSE), `/api/uploads/:id/progress`, `/api/notifications` CRUD with `/read` patch.
- New dependency: `csv-parse` for streaming CSV parsing.
