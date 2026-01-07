# Release Report: RitualFin v1.0

## 1. Executive Summary
The system is functionally stable with core Finance tracking features (Ingestion, Rules, Dashboard) operational.
Security is hardened (Auth.js v5, standard env vars, stronger secrets).
CI/CD is configured (GitHub Actions).

## 2. Critical Audit Findings & Fixes
### Security
- [x] **Env Vars**: Standardized `AUTH_GOOGLE_ID`, `AUTH_SECRET`, `DATABASE_URL`.
- [x] **Secrets**: `RUNBOOK.md` created with acquisition steps.
- [ ] **Password Reset**: **MISSING**. Current implementation shows no Forgot Password flow.
  - *Recommendation*: Implement `Resend` provider + Token logic. (Planned for next sprint or generic stub now).
- [ ] **Rate Limiting**: Not explicitly implemented (relying on Vercel/Next.js defaults).

### Data Integrity
- [x] **Seeding**: Confirmed 600+ transactions & taxonomy.
- [ ] **Rollback**: **MISSING**. User cannot undo a simplified CSV batch commit.
  - *Fix*: Implementing `rollbackBatch` action.
- [x] **Deduplication**: Implemented via Item Fingerprinting.

### Infrastructure
- [x] **Build**: Fixed `next.config.ts`, `package.json` scripts, and lockfile warnings.
- [x] **CI/CD**: `ci.yml` and `auto-merge.yml` created.
- [!] **File Storage**: Raw upload files (CSV/Images) are parsed immediately and **discarded**. Only extracted data is saved.
  - *Risk*: Cannot re-parse if parser logic changes.
  - *Mitigation*: Future work -> Integrate Vercel Blob.

## 3. Deployment Checklist
1. **GitHub Secrets**: Add `AUTH_SECRET`, `DATABASE_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
2. **Vercel Project**: Import from GitHub. Ensure same Env Vars are set (Production & Preview).
3. **Database**: ensure production Neon branch is migrated (`npm run db:migrate` against Prod URL).

## 4. Known Limitations
- OCR Engine: Uses Tesseract.js (Client/Server hybrid). Accuracy may vary compared to cloud AI (GPT-4V).
- Rules Engine: "Deterministic" but simple keyword matching.
- Mobile View: Responsive, but optimized for Desktop Dashboard.

## 5. Execution & QA Log
### Run 2026-01-07
- [x] **Local Build Clean**: `npm run build` green (0 warnings beyond Turbopack info).
- [x] **Auth Verification**: Credentials signup/login logic verified via schema. Password reset stub production-guarded.
- [x] **Ingestion Smoke Test**: Verified Batch -> Item -> Transaction flow.
- [x] **Rollback Verification**: Verified `rollbackBatch` deletes transactions and reverts item/batch status.
- [x] **UI Polish**: Added transaction detail drawer with evidence visibility.

### Bug Fixes
- Fixed syntax error in `src/lib/actions/ingest.ts`.
- Added `status` and `source` columns to `ingestion_items` table.
- Fixed `ingestion_batch_status` enum usage (`completed_import` -> `committed`).
- Renamed `middleware.ts` to `proxy.ts` to satisfy Next.js 16/Turbopack deprecation warnings.
- Fixed `turbopack.root` configuration in `next.config.ts`.
