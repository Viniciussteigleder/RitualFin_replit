# Branch Cleanup Report

Date: 2026-01-02

## Summary

- Main branch: `origin/main`
- Branch count (before): 12
- Branch count (after): 6
- Merged: 0
- Deleted: 6
- Archived: 0
- Kept: 3
- PRs opened: 3

## Branch Decisions

| Branch | Last commit (SHA + date) | Ahead/Behind vs main | Status | Decision | Rationale | Action executed |
| --- | --- | --- | --- | --- | --- | --- |
| `origin/Sparkasse-upload-fix` | `3b61ced91a6e6510825a6eb0b886b26535f2305c` (2026-01-01) | ahead 0 / behind 14 | OBSOLETE | CLOSE | Branch head is already contained in `origin/main` (fully merged, no unique commits). | Deleted remote branch (success). |
| `origin/claude/access-display-app-2bTSq` | `8fd27f67056d69743acdd4eac493e4f02e76d104` (2025-12-31) | ahead 0 / behind 34 | OBSOLETE | CLOSE | Merged via PR #8; branch head is already contained in `origin/main`. | Deleted remote branch (success). |
| `origin/feat/phase1-taxonomy-migration` | `45d82e6b3a4f67ffd391d73a4b184ce7dc069cb8` (2026-01-02) | ahead 0 / behind 2 | OBSOLETE | CLOSE | Branch head is already contained in `origin/main` (no unique commits). | Deleted remote branch (success). |
| `origin/feature/classification-alias-logos-excel` | `e551c005db0a96d54169745701d31d83bef360d6` (2026-01-01) | ahead 0 / behind 29 | OBSOLETE | CLOSE | Branch head is already contained in `origin/main` (no unique commits). | Deleted remote branch (success). |
| `origin/fix/full-deploy-protocol` | `abc6e2106759a5757c7cbdb520109f54fb00963b` (2026-01-01) | ahead 0 / behind 23 | OBSOLETE | CLOSE | Branch head is already contained in `origin/main` (no unique commits). | Deleted remote branch (success). |
| `origin/ux-ui-protocol` | `40d7db0a52404b49838bd9698ec8285167628f78` (2026-01-01) | ahead 0 / behind 10 | OBSOLETE | CLOSE | Branch head is already contained in `origin/main` (no unique commits). | Deleted remote branch (success). |
| `origin/branch_feat` | `53113643eab7b1c542a429c1da0b95dfe240c860` (2025-12-31) | ahead 1 / behind 39 | OPEN | KEEP | Recent, large UX/feature change set; requires review and possible PR before merge. | Kept. |
| `origin/codex/impl-phases-1-4` | `327d62b2e1721f8727b0b51a53ab631ef9bf845e` (2025-12-29) | ahead 7 / behind 78 | OPEN | KEEP | Recent server + docs changes; needs review for relevance and conflicts. | Kept. |
| `origin/codex/next-10-workpackages` | `c02b553fadc4fcc90c82d988d0aabf82534d3fb6` (2025-12-29) | ahead 1 / behind 79 | MERGEABLE | MERGE | Doc-only planning update; suitable for review + merge. | PR #10 opened: https://github.com/Viniciussteigleder/RitualFin_replit/pull/10 |
| `origin/fix/classificacao-dados-ui-enhancements-2026-01-02` | `0239cfa3d7e561f2d29df48c6d1dd3393a0a79bf` (2026-01-02) | ahead 1 / behind 7 | MERGEABLE | MERGE | Recent UX copy additions; suitable for review + merge. | PR #9 opened: https://github.com/Viniciussteigleder/RitualFin_replit/pull/9 |
| `origin/fix/deployment-connectivity` | `c400778273a4618116f864b5d33e57767569c5dd` (2025-12-29) | ahead 2 / behind 85 | OPEN | KEEP | PR #1 merged, but branch still has unique commits; needs reconciliation before close. | Kept. |
| `origin/fix/sparkasse-import-diagnostics-20260101` | `eb0a43eacc03ece70ac988587c0c696a42c8a6f8` (2026-01-01) | ahead 2 / behind 24 | MERGEABLE | MERGE | Diagnostics helpers appear relevant; needs review and merge. | PR #11 opened: https://github.com/Viniciussteigleder/RitualFin_replit/pull/11 |

## Notes

- No archives created: all deleted branches had zero unique commits vs `origin/main`.
- Remote branches removed: `Sparkasse-upload-fix`, `claude/access-display-app-2bTSq`, `feat/phase1-taxonomy-migration`, `feature/classification-alias-logos-excel`, `fix/full-deploy-protocol`, `ux-ui-protocol`.
- PRs opened: https://github.com/Viniciussteigleder/RitualFin_replit/pull/9, https://github.com/Viniciussteigleder/RitualFin_replit/pull/10, https://github.com/Viniciussteigleder/RitualFin_replit/pull/11.
