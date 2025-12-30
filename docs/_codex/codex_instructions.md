# Codex Operational Instructions

Summary: Codex must operate under analysis → plan → approval → execution → QA, and log every action in docs/_codex. Never modify Claude-owned documentation unless explicitly instructed.

Checklist:
1) Read mandatory files in order when instructed (CLAUDE.md, docs/ARCHITECTURE_AND_AI_LOGIC.md, docs/IMPLEMENTATION_LOG.md).
2) Create a plan in PLAN_LOG before executing work. Do not execute without an Approved plan.
3) Log all activity in CODEX_ACTIVITY_LOG with timestamps and approval status.
4) Record decisions in DECISION_LOG; avoid duplicating Claude-owned logs.
5) Summarize changes in DIFF_SUMMARY (no raw diffs).
6) Record QA commands and results in QA_NOTES.
7) Track risks in ISSUES_REGISTER.
8) Maintain specialized notes (deployment, data pipeline, AI, environment drift).
9) Redact secrets: never include tokens, keys, database URLs, or full env values.

STOP Conditions:
- If approval is missing for any non-doc change, stop and request it.
- If asked to change UI or introduce breaking API changes, stop and request explicit approval.
- If required files are missing, state this and proceed only with available context.
