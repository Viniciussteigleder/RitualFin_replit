# Codex Handoff to Claude

## What Codex Did (Documentation Only)

- Created and updated Codex-owned documentation under `docs/_codex/` based on user feedback, PRD, and current implementation context.
- Appended the provided PRD and detailed taxonomy table into the verbatim source of truth.
- Expanded the taxonomy proposal with a detailed reference table.
- Rewrote `docs/_codex/FEATURE_IMPLEMENTATION_PLAN.md` to the required contractual structure with per-feature packages, phases, dependencies, and open decisions.
- Logged all actions and decisions in Codex logs.

## Files Claude Should Read (Order + Purpose)

1) `docs/_codex/FEATURE_IMPLEMENTATION_PLAN.md`
   - Primary execution contract. Review package definitions, contracts, dependencies, and acceptance criteria.
2) `docs/_codex/PRD_FROM_USER_FEEDBACK.md`
   - Source PRD mapping for features and principles.
3) `docs/_codex/USER_FEEDBACK_VERBATIM.md`
   - Verbatim feedback and appended PRD/category table; source of truth for requirements.
4) `docs/_codex/CATEGORY_CLASSIFICATION_PROPOSAL.md`
   - Taxonomy principles and detailed category reference table.
5) `docs/ARCHITECTURE_AND_AI_LOGIC.md`
   - Current system architecture and AI usage boundaries.
6) `docs/IMPLEMENTATION_LOG.md`
   - Current implementation state, completed backend features, and pending tasks.

## Instructions for Claude Review

- Verify the plan structure matches the required contract format.
- Validate each package aligns with user feedback and PRD scope (no silent scope changes).
- Confirm all non-negotiable principles are reflected in package contracts.
- Check that package dependencies and phases are accurate and realistic.
- Resolve open decisions in the plan (N4 timing, commitment creation source, AI opt-in policy, missing keyword analysis reference text).

## Define Packages for Codex Execution

After review, Claude should:

- Mark which packages are approved for execution and which are deferred.
- Provide the final execution order (or confirm the proposed order).
- Specify any package scope edits, added constraints, or acceptance criteria changes.
- Note any packages that require additional discovery or user clarification.

## Handoff Notes for Codex

- Codex must not implement any package unless Claude explicitly approves it in writing.
- Codex must follow `docs/_codex/codex_instructions.md` for plan/approval/logging steps.
- All future implementation work must reference the final Claude-approved plan.
