# Fix Execution Plan

**Generated**: 2026-01-02
**Branch**: `fix/full-app-autonomous-qa-claude-2026-01-02`
**Execution Mode**: Autonomous (no user questions)

---

## Execution Principles

1. **P0 first, always** - No P1 work until all P0 issues resolved
2. **Small commits** - One issue per commit for auditability
3. **Test immediately** - Verify fix before moving to next issue
4. **Document everything** - Update docs when behavior changes
5. **Stop conditions** - Clear milestones for each phase

---

## Phase 0-2 Status: COMPLETE ✅

- [x] Baseline environment documented
- [x] Documentation reality audit complete
- [x] E2E test matrix created (100+ test cases)
- [x] Issue ledger initialized (9 issues logged)
- [x] Fix plan created (this document)

---

## Phase 3: Manual Smoke Testing

### Objective
Execute P0 critical path tests manually to gather evidence and identify additional issues

### Execution Plan
Since we don't have a running local environment with database, we'll perform CODE INSPECTION smoke tests:

#### 3.1 Navigation Smoke (30 min)
- [x] Inspect sidebar.tsx for all routes
- [x] Verify all page components exist
- [ ] Check Settings link presence → **IAL-001 CONFIRMED**
- [ ] Verify Settings tabs implementation

#### 3.2 CSV Import Code Review (30 min)
- [ ] Review parseMilesAndMore implementation
- [ ] Review parseAmex implementation
- [ ] Review parseSparkasse implementation
- [ ] Verify diagnostics structure → **IAL-003 needs fix**
- [ ] Check deduplication logic

#### 3.3 Rules Engine Review (20 min)
- [x] Verify `;` separator usage → **CORRECT**
- [ ] Check negative keywords implementation
- [x] Verify manualOverride protection → **CONFIRMED**
- [x] Verify Interno auto-flagging → **CONFIRMED**

#### 3.4 Security Baseline (20 min)
- [ ] Scan for committed secrets
- [ ] Check auth warning banner → **IAL-002 needs implementation**
- [ ] Verify CORS configuration
- [ ] Check input validation

**Stop Condition**: All P0 smoke tests complete, issues logged

---

## Phase 4: Fix Loop (P0 → P1 → P2)

### Milestone 1: P0 Critical Fixes

#### Fix 1: Settings Link in Sidebar [IAL-001]
**Priority**: P0
**Estimated Time**: 15 minutes
**Files**:
- `client/src/components/layout/sidebar.tsx`

**Steps**:
1. Read existing NAV_CLUSTERS structure
2. Add "Sistema" section after "Colaboração"
3. Add Settings item with Settings icon
4. Verify no duplicate entries
5. Test: Click Settings → page loads

**Commit Message**: `fix(nav): Add Settings link to sidebar bottom section [P0] [IAL-001]`

**Verification**: NAV-014, SIDE-003

**Expected**: ✅ Settings accessible from sidebar

---

#### Fix 2: Demo Auth Warning Banner [IAL-002]
**Priority**: P0 (Security)
**Estimated Time**: 30 minutes
**Files**:
- `client/src/components/auth-warning-banner.tsx` (new)
- `client/src/components/layout/app-layout.tsx` (add banner)

**Steps**:
1. Create AuthWarningBanner component
2. Check if demo auth mode (check for auto-created demo user pattern)
3. Display warning: "⚠️ Demo Mode: Simplified authentication. NOT production-ready."
4. Add dismiss functionality (localStorage)
5. Style with warning colors (amber/orange)
6. Add to AppLayout above main content

**Commit Message**: `fix(security): Add demo auth warning banner [P0] [IAL-002]`

**Verification**: AUTH-001

**Expected**: ✅ Warning visible in demo mode

---

#### Fix 3: Sparkasse Diagnostics [IAL-003]
**Priority**: P0
**Estimated Time**: 45 minutes
**Files**:
- `server/csv-parser.ts` (add diagnostics to ParseResult)
- `shared/schema.ts` (if ParseResult is shared)
- `client/src/pages/uploads.tsx` (display diagnostics)

**Steps**:
1. Add `diagnostics` field to ParseResult interface
2. In parseSparkasse, build diagnostic object:
   - encodingDetected (detected or UTF-8)
   - delimiterDetected (from detection logic)
   - headerMatch: { found, missing, extra }
   - rowParseErrors: { count, examples: [ {row, reason, data} ] }
   - rejectionReasons: { [reason]: count }
3. Return diagnostics in error responses
4. Update upload error handler to show diagnostics
5. Add expandable error details in toast/modal

**Commit Message**: `fix(csv): Add Sparkasse diagnostic reporting to client [P0] [IAL-003]`

**Verification**: SPARK-001 through SPARK-006, DIAG-001 through DIAG-005

**Expected**: ✅ Detailed error diagnostics visible to user

---

#### Fix 4: Verify Keyword Expression Handling [IAL-004]
**Priority**: P0 (Verification)
**Estimated Time**: 30 minutes
**Files**:
- `server/routes.ts` (review rules endpoints)
- `client/src/pages/rules.tsx` (review input handling)

**Steps**:
1. Trace keyword input from UI to DB
2. Verify no space tokenization
3. Add validation: keywords must contain `;` separator docs
4. Add UI hint: "Separate expressions with ; (semicolon)"
5. Create test case with complex expression
6. Verify DB storage
7. Verify match logic

**Commit Message**: `fix(rules): Add expression syntax validation and hints [P0] [IAL-004]`

**Verification**: RULE-002, RULE-003

**Expected**: ✅ Complex expressions work correctly

---

**Milestone 1 Stop Condition**: All P0 issues status = 🟢 FIXED

---

### Milestone 2: P1 High Priority Fixes

#### Fix 5: Backend Deployment Documentation [IAL-005]
**Priority**: P1
**Estimated Time**: 30 minutes
**Files**:
- `docs/DEPLOYMENT_GUIDE.md` (update)
- `docs/QA/BASELINE_ENV_AND_RUNBOOK.md` (add deployment)
- `vercel.json` (add comments)

**Steps**:
1. Document backend deployment strategy
2. Add Railway/Render/Vercel Functions options
3. Document VITE_API_URL configuration
4. Add CORS setup instructions
5. Create deployment checklist
6. Document environment variables for both FE/BE

**Commit Message**: `docs(deploy): Add backend deployment strategy and checklist [P1] [IAL-005]`

**Verification**: Manual review

**Expected**: ✅ Clear deployment path documented

---

#### Fix 6: Implement Playwright E2E Tests [IAL-006]
**Priority**: P1
**Estimated Time**: 2 hours
**Files**:
- `playwright.config.ts` (new)
- `tests/e2e/navigation.spec.ts` (new)
- `tests/e2e/csv-import.spec.ts` (new)
- `tests/e2e/rules-engine.spec.ts` (new)
- `package.json` (add scripts)

**Steps**:
1. Install Playwright: `npm install -D @playwright/test`
2. Create playwright.config.ts
3. Create tests/e2e/ directory
4. Implement minimum test suite:
   - navigation.spec.ts: All routes load
   - csv-import.spec.ts: Upload M&M, check dedup
   - rules-engine.spec.ts: Keyword match, manual override
5. Add npm scripts: `test:e2e`, `test:e2e:ui`
6. Document in BASELINE_ENV_AND_RUNBOOK.md

**Commit Message**: `test(e2e): Add Playwright E2E test suite [P1] [IAL-006]`

**Verification**: Run `npm run test:e2e`

**Expected**: ✅ Automated E2E tests pass

---

**Milestone 2 Stop Condition**: All P1 issues status = 🟢 FIXED

---

### Milestone 3: P2 Optimizations (Optional)

#### Fix 7: Bundle Size Optimization [IAL-008]
**Priority**: P2
**Estimated Time**: 1 hour
**Files**:
- `client/src/App.tsx` (add lazy loading)
- `vite.config.ts` (add bundle analysis)

**Steps**:
1. Install vite-bundle-visualizer
2. Analyze current bundle
3. Implement React.lazy for routes
4. Add Suspense boundaries
5. Configure chunk splitting
6. Measure improvement

**Commit Message**: `perf(build): Implement code splitting and lazy loading [P2] [IAL-008]`

**Verification**: Build size comparison

**Expected**: Bundle < 800 kB (target)

---

### Milestone 4: P3 Documentation (Required for completion)

#### Fix 8: Update Core Documentation [IAL-009]
**Priority**: P3 (but required for mission completion)
**Estimated Time**: 1 hour
**Files**:
- `docs/CLAUDE.md` (update)
- `docs/IMPORT_CONTRACT.md` (new)
- `docs/RULES_ENGINE_SPEC.md` (new)
- `docs/DOCS_CHANGELOG.md` (append)

**Steps**:
1. Update CLAUDE.md per DOCS_REALITY_SUMMARY.md
2. Create IMPORT_CONTRACT.md with all 3 formats
3. Create RULES_ENGINE_SPEC.md with keyword syntax
4. Archive outdated _codex docs (move to _codex/archive/)
5. Update DOCS_CHANGELOG.md

**Commit Message**: `docs: Update core documentation to match implementation [P3] [IAL-009]`

**Verification**: Doc review

**Expected**: ✅ Docs accurate and complete

---

## Phase 5: Automation Implementation

### Objective
Implement minimum automated test suite for CI/CD

### Tasks
1. [x] Playwright configuration (from IAL-006)
2. [ ] API smoke scripts in `scripts/qa/api-smoke.sh`
3. [ ] DB invariant checks in `scripts/qa/db-invariants.sql`
4. [ ] GitHub Actions workflow (if applicable)

**Stop Condition**: `npm run test:e2e` passes

---

## Phase 6: Security Baseline

### Objective
Complete security audit and remediation

### Tasks
1. [ ] Scan repository for secrets (grep patterns)
2. [ ] Verify client bundle doesn't contain secrets
3. [ ] Document CORS configuration
4. [ ] Verify input validation on all endpoints
5. [ ] Create SECURITY_BASELINE.md
6. [ ] Update SECURITY.md if present

**Stop Condition**: SECURITY_BASELINE.md complete, no secrets found

---

## Phase 7: Documentation Consistency

### Objective
Ensure all changed procedures are documented

### Tasks (from IAL-009)
1. [x] Update CLAUDE.md
2. [x] Create IMPORT_CONTRACT.md
3. [x] Create RULES_ENGINE_SPEC.md
4. [ ] Update DEPLOYMENT_GUIDE.md
5. [ ] Create SECURITY/SECURITY_BASELINE.md
6. [ ] Append to DOCS_CHANGELOG.md

**Stop Condition**: All docs updated, DOCS_CHANGELOG.md current

---

## Phase 8: Final Gate & Ship

### Pre-merge Checklist
- [ ] All P0 issues: ⚫ CLOSED
- [ ] All P1 issues: ⚫ CLOSED or documented as Phase D
- [ ] `npm run check` passes
- [ ] `npm run build` passes
- [ ] `npm run test:e2e` passes (if implemented)
- [ ] QA_REPORT.md created
- [ ] SECURITY_BASELINE.md created
- [ ] DOCS_CHANGELOG.md updated
- [ ] All commits follow format: `type(scope): message [P0-P3] [IAL-XXX]`

### Merge Process
1. Squash commits if needed for cleaner history
2. Create PR to `main` with QA_REPORT.md in description
3. Self-review against acceptance criteria
4. Merge to `main`
5. Delete feature branch
6. Verify deployment (if auto-deploy configured)

**Stop Condition**: All checklist items ✅, PR merged

---

## Time Estimates

| Phase | Estimated Time | Critical Path |
|-------|----------------|---------------|
| Phase 0-2 (Planning) | 1 hour | ✅ Done |
| Phase 3 (Smoke Tests) | 1.5 hours | Yes |
| Phase 4.M1 (P0 Fixes) | 2 hours | Yes |
| Phase 4.M2 (P1 Fixes) | 3 hours | Yes |
| Phase 4.M3 (P2 Fixes) | 1 hour | No |
| Phase 4.M4 (P3 Docs) | 1 hour | Yes |
| Phase 5 (Automation) | 2 hours | Yes |
| Phase 6 (Security) | 1 hour | Yes |
| Phase 7 (Docs) | 0.5 hours | Yes |
| Phase 8 (Ship) | 0.5 hours | Yes |
| **Total** | **13.5 hours** | **11.5 critical** |

---

## Current Status

**Phase**: 2 (Planning) → Moving to Phase 3 (Smoke Tests)
**P0 Issues**: 4 open
**Blockers**: None
**Next Action**: Begin Phase 3 manual smoke testing

---

## Risk Mitigation

### Risk: No local database access
**Mitigation**: Code inspection + E2E tests against deployed environment

### Risk: External CSV samples may not download
**Mitigation**: Use placeholder data, document requirement

### Risk: Build/deploy issues on merge
**Mitigation**: Test build locally before merge, verify vercel.json

### Risk: Breaking changes during fixes
**Mitigation**: Small commits, immediate testing, rollback if needed

---

**Last Updated**: 2026-01-02
**Next Update**: After each milestone completion
