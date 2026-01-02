# RitualFin Security Audit Report

## Summary
- Status: In progress
- Scope: Secrets hygiene, CORS, input validation, dependency posture, demo-auth gating
- Release gate: Pending baseline checks and remediation

## Environment
- Branch: main
- Git SHA: e8e8c470c1355a1fb720fc9bff5e17aebb34e3dc
- Node: v24.4.0
- npm: 11.4.2

## Findings
| Severity | ID | Area | Description | Evidence | Remediation | Status |
| --- | --- | --- | --- | --- | --- | --- |
| High | SEC-LOCAL-001 | Secrets hygiene | Local `.env.local` contains multiple secrets/tokens; must remain uncommitted and credentials rotated if ever shared. | Local file inspection | Ensure `.env.local` remains in `.gitignore`; rotate any exposed credentials. | Open |
| High | SEC-PROD-001 | Auth posture | Demo-only auth, no multi-user isolation or RLS; production blocker until Phase D. | SECURITY.md | Guardrail added: production API blocked unless `ALLOW_DEMO_AUTH_IN_PROD=true`. | Mitigated (Guardrail) |
| High | SEC-DEP-002 | Dependencies | `xlsx` prototype pollution + ReDoS; no fix available in current version. | `npm audit` 2026-01-02 | Evaluate alternative library or isolate usage; document risk. | Open |
| Moderate | SEC-DEP-004 | Dependencies | `esbuild` dev-server request exposure via `drizzle-kit` chain. | `npm audit` 2026-01-02 | Update `drizzle-kit` if compatible or accept dev-only risk. | Open |

## Checks executed
- Repo secrets scan: Completed (no hardcoded secrets found; references in docs only)
- Bundle secrets scan: Completed (no matches in `dist/public`)
- CORS validation: Completed (localhost allowed; unknown origin not echoed)
- Input validation checks: Completed (rules + upload payloads)
- Dependency audit (`npm audit`): Completed (5 vulnerabilities: 4 moderate, 1 high after `npm audit fix`)

## Evidence log
- `rg` scan for secrets completed (docs references only).
- Bundle scan completed with no matches under `dist/public`.
- `npm audit` run on 2026-01-02 (post-fix; 5 remaining vulnerabilities).
- CORS check: `Origin: http://localhost:5173` returns `Access-Control-Allow-Origin: http://localhost:5173`; `Origin: http://evil.example` does not return ACAO.
- Input validation: rules accept injection-like strings without error; invalid payloads rejected with 400 (`keyWords` array) and upload missing `csvContent` returns 400.

## Remediation plan
- Executed `npm audit fix` (remaining: `xlsx` high, `esbuild` moderate via `drizzle-kit`).
- Execute remaining baseline checks (CORS, input validation).
- Document any production blockers with clear warnings and remediation steps.
