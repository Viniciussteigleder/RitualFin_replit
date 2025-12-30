# Codex Documentation System

Purpose: Codex-only logs to help Claude reconstruct context, decisions, and risks without re-reading code. This folder is isolated from Claude-owned documentation.

How to read these logs:
- Start with `docs/_codex/CODEX_ACTIVITY_LOG.md` for a chronological timeline.
- Consult `docs/_codex/PLAN_LOG.md` for plans and approval states.
- Use `docs/_codex/DECISION_LOG.md` for rationale and tradeoffs.
- Check `docs/_codex/DIFF_SUMMARY.md` for changes overview (no raw diffs).
- Review `docs/_codex/QA_NOTES.md` for commands and test results.

Redaction policy:
- Never record secrets, credentials, tokens, database URLs, or full env values.
- Replace sensitive values with "[REDACTED]".

Correlating with commits/bugs:
- Each log entry includes date/time, files touched, and approval gate state.
- Use commit hashes if explicitly provided by Claude or user.

Relationship to Claude docs:
- Codex logs are standalone and do not duplicate Claude-owned logs.
- Do not reference Claude docs for operational decisions unless explicitly instructed.
