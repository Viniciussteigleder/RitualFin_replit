# RitualFin Security Baseline

This document defines the minimum security checks and acceptable posture for the current release cycle.

## Scope
- Demo-only auth posture (single-user)
- API and CSV upload validation
- CORS configuration
- Secrets hygiene (repo + client bundle)
- Dependency audit

## Severity definitions
- Critical: immediate data exposure or remote compromise risk
- High: significant data leakage or privilege escalation risk
- Medium: likely abuse, but limited impact
- Low: hygiene or hardening improvements

## Required checks
1) Secrets scan (repo + built bundle)
2) CORS behavior (explicit origin, no wildcard in prod)
3) Input validation (CSV upload, rules, settings)
4) Error handling (clear messages, no sensitive data in logs)
5) Dependency audit (`npm audit`)
6) Demo auth warnings + production gating

## Evidence capture
- CLI outputs for scans and audits
- Screenshots or logs for CORS tests
- Repro steps for any findings

## Baseline findings (initial)
- Local `.env.local` contains multiple secrets/tokens and must remain uncommitted; rotate any credentials that were shared outside the local machine.
- Demo-only auth posture remains a production blocker until Phase D security work is completed.
- `npm audit` after `npm audit fix` reports 5 vulnerabilities (4 moderate, 1 high). High item: `xlsx` (no fix available).
- Repo/bundle secrets scans found no secrets in `dist/public`; doc references only.
- Local CORS check: allowed `http://localhost:5173`, disallowed origin not echoed.

## Owner checklist
- [x] Run repo secrets scan
- [x] Run bundle secrets scan
- [x] Verify CORS headers on local dev
- [ ] Verify CORS headers on prod/staging
- [x] Validate upload/rules input validation paths
- [x] Run `npm audit` and capture output
- [x] Update SECURITY.md with any new blockers or mitigations
