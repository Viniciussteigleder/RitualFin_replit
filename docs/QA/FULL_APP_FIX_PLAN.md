# RitualFin Full-App Fix Plan

This plan captures discovered issues, root cause, fix approach, and validation. It is updated after diagnostics and each fix cycle.

## Status legend
- Status: Pending | In progress | Fixed | Deferred (Shell) | Blocked

## Baseline
- Branch: fix/full-app-e2e-qa-security-2026-01-02
- Baseline git SHA: 576033f4ba5ecb692f35c87c099c8bcd83f7fb30

## P0 issues (Release blockers)
| Issue ID | Test ID(s) | Summary | Proof/Evidence | Root cause | Fix approach | Validation | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0-001 | DB-01 | Duplicate transaction keys detected | `scripts/qa/run_db_invariants.sh` shows multiple keys with count 2-5 | Existing data duplicates and no in-upload dedupe for repeated keys | Added in-upload dedupe by tracking keys; removed historical duplicates via `scripts/qa/dedupe_transactions.ts --apply` | Re-run `scripts/qa/run_db_invariants.sh` with DB-01 returning 0 rows | Fixed |
| P0-002 | NAV-01..DEP-05 | Manual UI P0 smoke checklist pending | No manual UI run yet | Manual evidence not captured | Run P0 smoke checklist and capture screenshots/HAR | Complete checklist in `docs/QA/E2E_VALIDATION_PLAN.md` | Pending |

## P1 issues (Major correctness)
| Issue ID | Test ID(s) | Summary | Proof/Evidence | Root cause | Fix approach | Validation | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P1-001 | TBD | Pending diagnostics | TBD | TBD | TBD | TBD | Pending |

## P2 issues (Minor UX / polish)
| Issue ID | Test ID(s) | Summary | Proof/Evidence | Root cause | Fix approach | Validation | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P2-001 | TBD | Pending diagnostics | TBD | TBD | TBD | TBD | Pending |

## Deferred / blocked
| Issue ID | Test ID(s) | Reason | Mitigation | Status |
| --- | --- | --- | --- | --- |
| BLOCK-001 | TBD | Pending diagnostics | TBD | Pending |

## Notes
- Diagnostics and evidence collection are pending. Update this file after running the P0 smoke checklist and local checks.
