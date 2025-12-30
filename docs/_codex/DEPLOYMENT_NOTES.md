# Deployment Notes (Codex)

## 2025-12-29T11:40:14Z (UTC)
- Preferred deployment model: Vercel frontend + separate backend runtime (Render/Fly/Railway) due to serverless timeouts for CSV/AI.
- Risks noted: serverless timeouts, bundle limits, and Git integration reliability.
- Rollback guidance: Use platform rollback features; avoid relying on untested auto-deploy.
- CORS required for split backend; ensure ALLOWED_ORIGIN is set (value redacted).
