# Branch Cleanup Report

Date: 2026-01-02

## Summary (Final)

- Default branch: `origin/main`
- Branch count (before): 6
- Branch count (after): 0
- Merged: 1
- Cherry-picked: 0
- Archived + deleted: 5
- Deleted (ahead=0): 0
- Integration branch: `release/integration-branch-cleanup`

## Inventory

| Branch | Last commit (SHA + date) | Ahead/Behind vs main | Merged into main? | Diffstat (summary) |
| --- | --- | --- | --- | --- |
| `origin/branch_feat` | `53113643eab7b1c542a429c1da0b95dfe240c860` (2025-12-31) | ahead 1 / behind 46 | No | 49 files, +6554/-1120 |
| `origin/codex/impl-phases-1-4` | `327d62b2e1721f8727b0b51a53ab631ef9bf845e` (2025-12-29) | ahead 7 / behind 85 | No | 22 files, +1655/-165 |
| `origin/codex/next-10-workpackages` | `c02b553fadc4fcc90c82d988d0aabf82534d3fb6` (2025-12-29) | ahead 1 / behind 86 | Yes | 1 file, +1337/-0 |
| `origin/fix/classificacao-dados-ui-enhancements-2026-01-02` | `0239cfa3d7e561f2d29df48c6d1dd3393a0a79bf` (2026-01-02) | ahead 1 / behind 14 | No | 1 file, +49/-0 |
| `origin/fix/deployment-connectivity` | `c400778273a4618116f864b5d33e57767569c5dd` (2025-12-29) | ahead 2 / behind 92 | No | 6 files, +156/-2 |
| `origin/fix/sparkasse-import-diagnostics-20260101` | `eb0a43eacc03ece70ac988587c0c696a42c8a6f8` (2026-01-01) | ahead 2 / behind 31 | No | 3 files, +198/-0 |

## Touched Files (Top 80)

- `origin/branch_feat`
  - client/src/App.tsx
  - client/src/components/ai-chat-modal.tsx
  - client/src/components/ai-keywords-panel.tsx
  - client/src/components/calendar/detail-panel.tsx
  - client/src/components/layout/sidebar.tsx
  - client/src/components/layout/top-nav.tsx
  - client/src/components/transaction-detail-modal.tsx
  - client/src/lib/api.ts
  - client/src/lib/merchant-metadata.ts
  - client/src/pages/accounts.tsx
  - client/src/pages/ai-keywords.tsx
  - client/src/pages/budgets.tsx
  - client/src/pages/calendar.tsx
  - client/src/pages/categories.tsx
  - client/src/pages/confirm.tsx
  - client/src/pages/dashboard.tsx
  - client/src/pages/event-detail.tsx
  - client/src/pages/goals.tsx
  - client/src/pages/login.tsx
  - client/src/pages/merchant-dictionary.tsx
  - client/src/pages/merchant-metadata.tsx
  - client/src/pages/notifications.tsx
  - client/src/pages/rituals.tsx
  - client/src/pages/rules.tsx
  - client/src/pages/settings.tsx
  - client/src/pages/transactions.tsx
  - client/src/pages/uploads.tsx
  - docs/_codex/CODEX_ACTIVITY_LOG.md
  - docs/_codex/PHASE_3_4_IMPLEMENTATION_SPEC.md
  - docs/_codex/reviews/2025-12-29/EXECUTIVE_SUMMARY.md
  - docs/_codex/reviews/2025-12-29/FEATURE_VERIFICATION_MATRIX.md
  - docs/_codex/reviews/2025-12-29/IMPROVEMENT_ROADMAP.md
  - docs/_codex/reviews/2025-12-29/QA_RUNBOOK.md
  - docs/_codex/reviews/2025-12-29/TECHNICAL_ASSESSMENT.md
  - docs/_codex/reviews/2025-12-29/UX_UI_REVIEW.md
  - docs/_codex/ux_review/MICROCOPY_AND_LANGUAGE_REVIEW.md
  - docs/_codex/ux_review/MISSING_FEATURES_AND_OPPORTUNITIES.md
  - docs/_codex/ux_review/MISSING_FEATURES_PLAN.md
  - docs/_codex/ux_review/NAVIGATION_AND_INFORMATION_ARCHITECTURE.md
  - docs/_codex/ux_review/PHASE_B_UX_IMPLEMENTATION_CHECKLIST.md
  - docs/_codex/ux_review/PRODUCT_EXPERIENCE_OVERVIEW.md
  - docs/_codex/ux_review/SCREEN_BY_SCREEN_REVIEW.md
  - docs/_codex/ux_review/UX_CONTRACTS_AND_RULES.md
  - docs/_codex/ux_review/UX_IMPROVEMENT_ROADMAP.md
  - server/csv-parser.ts
  - server/index.ts
  - server/routes.ts
  - server/storage.ts
  - shared/schema.ts
- `origin/codex/impl-phases-1-4`
  - client/src/pages/uploads.tsx
  - docs/_codex/CODEX_ACTIVITY_LOG.md
  - docs/_codex/DECISION_LOG.md
  - docs/_codex/DEPLOYMENT_NOTES.md
  - docs/_codex/DIFF_SUMMARY.md
  - docs/_codex/ISSUES_REGISTER.md
  - docs/_codex/PHASES_1_TO_4_COMPLETE_SUMMARY.md
  - docs/_codex/PHASES_1_TO_4_QA_COMPLETE_SUMMARY.md
  - docs/_codex/PLAN_LOG.md
  - docs/_codex/QA_NOTES.md
  - package-lock.json
  - package.json
  - server/ai-context.ts
  - server/ai-logger.ts
  - server/ai-usage.ts
  - server/csv-parser.ts
  - server/db.ts
  - server/replit_integrations/chat/routes.ts
  - server/replit_integrations/chat/storage.ts
  - server/routes.ts
  - server/storage.ts
  - shared/schema.ts
- `origin/codex/next-10-workpackages`
  - docs/_codex/NEXT_10_WORKPACKAGES.md
- `origin/fix/classificacao-dados-ui-enhancements-2026-01-02`
  - docs/UX_UI_MASTER_PLAN.md
- `origin/fix/deployment-connectivity`
  - docs/_codex/CODEX_ACTIVITY_LOG.md
  - docs/_codex/DEPLOYMENT_CONNECTIVITY_QA_COMPLETE_SUMMARY.md
  - docs/_codex/DIFF_SUMMARY.md
  - docs/_codex/ISSUES_REGISTER.md
  - docs/_codex/QA_NOTES.md
  - package-lock.json
- `origin/fix/sparkasse-import-diagnostics-20260101`
  - package.json
  - script/sparkasse-debug.ts
  - server/sparkasse-pipeline.ts

## Overlap Clusters

- Cluster A: `docs/_codex/*`
  - Branches: `origin/branch_feat`, `origin/codex/impl-phases-1-4`, `origin/codex/next-10-workpackages`, `origin/fix/deployment-connectivity`
- Cluster B: `server/*` + `shared/schema.ts`
  - Branches: `origin/branch_feat`, `origin/codex/impl-phases-1-4`
- Cluster C: `docs/UX_UI_MASTER_PLAN.md`
  - Branches: `origin/fix/classificacao-dados-ui-enhancements-2026-01-02`
- Cluster D: `server/sparkasse-pipeline.ts` + `script/sparkasse-debug.ts`
  - Branches: `origin/fix/sparkasse-import-diagnostics-20260101`
- Cluster E: `client/*`
  - Branches: `origin/branch_feat`

## Integration Log (Merge-First)

| Branch | Approach | Result | Conflicts | Quick Gate |
| --- | --- | --- | --- | --- |
| `origin/codex/next-10-workpackages` | Rebase onto `origin/main`, then merge into `release/integration-branch-cleanup` | Integrated | None | `npm run build` (exit 0) |
| `origin/fix/classificacao-dados-ui-enhancements-2026-01-02` | Cherry-pick attempt | Not integrated | `docs/UX_UI_MASTER_PLAN.md` content conflict | N/A |
| `origin/fix/deployment-connectivity` | Rebase attempt | Not integrated | `docs/_codex/CODEX_ACTIVITY_LOG.md`, `docs/_codex/DIFF_SUMMARY.md`, `docs/_codex/ISSUES_REGISTER.md`, `docs/_codex/QA_NOTES.md` conflicts | N/A |
| `origin/fix/sparkasse-import-diagnostics-20260101` | Rebase attempt | Not integrated | `server/sparkasse-pipeline.ts` add/add conflict | N/A |
| `origin/codex/impl-phases-1-4` | Rebase attempt | Not integrated | Conflicts in multiple docs and server files (`server/routes.ts`, `server/storage.ts`, `shared/schema.ts`, etc.) | N/A |
| `origin/branch_feat` | Rebase attempt | Not integrated | Conflicts across client, server, and docs | N/A |

## Gates

- Install: `npm ci` (exit 0)
- Quick gate after each integration:
  - `npm run build` (exit 0)
- Final full gate:
  - `npm run check` (exit 0)
  - `npm run build` (exit 0)

## Archive + Delete Log

| Branch | Archive Patch | Notes | Decision |
| --- | --- | --- | --- |
| `origin/branch_feat` | `docs/branch-archive/branch_feat__53113643eab7b1c542a429c1da0b95dfe240c860.patch` | `docs/branch-archive/branch_feat__notes.md` | ARCHIVE + DELETE |
| `origin/codex/impl-phases-1-4` | `docs/branch-archive/codex_impl-phases-1-4__327d62b2e1721f8727b0b51a53ab631ef9bf845e.patch` | `docs/branch-archive/codex_impl-phases-1-4__notes.md` | ARCHIVE + DELETE |
| `origin/fix/classificacao-dados-ui-enhancements-2026-01-02` | `docs/branch-archive/fix_classificacao-dados-ui-enhancements-2026-01-02__0239cfa3d7e561f2d29df48c6d1dd3393a0a79bf.patch` | `docs/branch-archive/fix_classificacao-dados-ui-enhancements-2026-01-02__notes.md` | ARCHIVE + DELETE |
| `origin/fix/deployment-connectivity` | `docs/branch-archive/fix_deployment-connectivity__c400778273a4618116f864b5d33e57767569c5dd.patch` | `docs/branch-archive/fix_deployment-connectivity__notes.md` | ARCHIVE + DELETE |
| `origin/fix/sparkasse-import-diagnostics-20260101` | `docs/branch-archive/fix_sparkasse-import-diagnostics-20260101__eb0a43eacc03ece70ac988587c0c696a42c8a6f8.patch` | `docs/branch-archive/fix_sparkasse-import-diagnostics-20260101__notes.md` | ARCHIVE + DELETE |

## Merge Log

- `origin/codex/next-10-workpackages` merged into `release/integration-branch-cleanup` (merge commit: `0f842f7`), then merged into `origin/main` (merge commit: `24fd342`).

## Limitations

- None. All non-merged branches were archived before deletion.
- PRs #9-#14 were already closed at the time of automated closure attempts.
