# Codex Decision Log

## 2025-12-29T11:40:14Z (UTC)
- Decision: Create Codex-only documentation system under docs/_codex/.
- Alternatives considered: None (explicit instruction).
- Tradeoffs: Minor repo noise vs. strong traceability and governance compliance.
- Rationale: Required by governance to isolate Codex documentation from Claude-owned logs.
- Risks: None (documentation-only).
- Follow-ups: Keep logs updated per session; avoid duplicating Claude docs.

## 2025-12-29T12:37:15Z (UTC)
- Decision: Treat the “User Feedback” section as the sole verbatim source for docs/_codex/USER_FEEDBACK_VERBATIM.md.
- Alternatives considered: Include the subsequent PRD and taxonomy tables from the prompt in the verbatim file.
- Tradeoffs: Clear separation of raw feedback vs. derived artifacts, but requires cross-check if future instructions expect appended content.
- Rationale: The prompt labels “User Feedback” explicitly; downstream documents are “derived” deliverables.
- Risks: If the appended PRD/taxonomy text was intended as feedback, it would be omitted from the verbatim source.
- Follow-ups: Confirm whether the appended PRD and category table should be merged into the verbatim source of truth.

## 2025-12-29T12:37:15Z (UTC)
- Decision: Provide a minimal, stable N1–N3 category proposal focused on common spend types and an explicit “Interna” category.
- Alternatives considered: Replicate the full detailed category table from the prompt.
- Tradeoffs: Simplicity and long-term stability vs. less immediate specificity.
- Rationale: The requirement asks for a short, business-readable, future-proof proposal.
- Risks: The initial proposal may feel too high-level for immediate rules definition.
- Follow-ups: Validate whether the detailed category table should replace or extend this minimal proposal.

## 2025-12-29T12:44:32Z (UTC)
- Decision: Append the provided PRD and detailed category table to the verbatim feedback source of truth.
- Alternatives considered: Keep verbatim limited to the “User Feedback” section only.
- Tradeoffs: Larger verbatim file vs. stricter inclusion of all prompt-provided materials.
- Rationale: User explicitly requested including appended PRD and category table in verbatim.
- Risks: None (documentation-only, explicit instruction).
- Follow-ups: None.

## 2025-12-29T12:44:32Z (UTC)
- Decision: Keep the concise taxonomy proposal and add the detailed category table as a reference section.
- Alternatives considered: Replace the concise proposal entirely with the detailed table.
- Tradeoffs: Longer document vs. maintaining a stable, readable proposal at the top.
- Rationale: Preserves the intended “short, future-proof” proposal while honoring the request to expand with the detailed table.
- Risks: Readers may treat the detailed table as prescriptive rather than reference.
- Follow-ups: Confirm whether the reference table should be separated into its own appendix file.

## 2025-12-29T13:02:14Z (UTC)
- Decision: Define 15 feature packages in the implementation plan to cover all PRD modules and governance requirements.
- Alternatives considered: Fewer broad packages grouped by page only.
- Tradeoffs: More packages increase planning detail but reduce ambiguity and execution risk.
- Rationale: The required contract template expects per-feature clarity and testable acceptance criteria.
- Risks: Claude may prefer a different package granularity or grouping.
- Follow-ups: Confirm preferred package granularity for final sequencing.

## 2025-12-29T13:07:57Z (UTC)
- Decision: Create a dedicated Claude handoff document with review instructions and file reading order.
- Alternatives considered: Provide the handoff content only in chat.
- Tradeoffs: Extra file maintenance vs. clearer, reusable handoff guidance.
- Rationale: Claude needs a stable, copyable summary and review steps.
- Risks: None (documentation-only).
- Follow-ups: Keep handoff updated if plan structure changes.
