# Plan Structure Contract

## 1) Purpose of a Plan

Define a shared, auditable agreement for scope, risks, dependencies, and acceptance so execution stays aligned with user value and governance.

## 2) Mandatory Sections (no exceptions)

- Goal (user value)
- In Scope
- Out of Scope
- Dependencies
- Data implications
- Risks
- Acceptance criteria
- QA approach

## 3) Approval Rules

- Claude approval is required for any plan that changes product scope, data model, API surface, or user-facing behavior.
- Codex must stop if instructions conflict, if a required file is missing, or if a request violates governance rules.
- Documentation-only changes may proceed with user approval.

## 4) Change Control

- Any scope change must be written as a plan amendment before execution.
- Amendments must state the reason, impact, and new acceptance criteria.
- No silent scope expansion is allowed.

## 5) Definition of “Done”

- All mandatory sections completed.
- Acceptance criteria are met and recorded.
- QA approach executed or explicitly waived with reason.
- Logs updated (activity, decisions, issues, diff summary).

## 6) Anti-patterns (not allowed)

- Skipping out-of-scope items.
- Introducing implementation details in a PRD.
- Making changes without approval.
- Mixing Claude-owned documentation with Codex outputs.
- Hiding risks or unresolved questions.
