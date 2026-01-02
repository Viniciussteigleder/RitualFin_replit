# Issue Ledger

**Generated**: 2026-01-02
**Branch**: `fix/full-app-autonomous-qa-claude-2026-01-02`

This ledger tracks all discovered issues during autonomous QA execution.

---

## Issue Status Legend

- 🔴 **OPEN** - Issue identified, not yet fixed
- 🟡 **IN_PROGRESS** - Fix in development
- 🟢 **FIXED** - Fix completed and verified
- 🔵 **VERIFIED** - Fix tested in E2E
- ⚫ **CLOSED** - Issue resolved and documented

---

## Priority Levels

- **P0** - Blocking: App unusable or critical feature broken
- **P1** - High: Important feature degraded or missing
- **P2** - Medium: Nice-to-have or optimization
- **P3** - Low: Documentation or cosmetic

---

## P0 Issues (CRITICAL - Must fix)

### IAL-001: Settings Link Missing from Sidebar
**Status**: 🔴 OPEN
**Priority**: P0
**Severity**: High
**Found**: Documentation audit

**Where**: `client/src/components/layout/sidebar.tsx`

**Reproduce**:
1. Open application
2. Check sidebar navigation
3. Observe: No "Configurações" link in bottom section

**Expected**:
- Settings link in bottom section of sidebar (per mission requirements)
- Settings icon, label "Configurações"
- Links to `/settings`

**Actual**:
- Settings route exists at `/settings`
- Settings page implemented with tabs
- But no sidebar link to access it

**Suspected Root Cause**:
- NAV_CLUSTERS array in sidebar.tsx doesn't include Settings in "Sistema" section
- Missing bottom section structure entirely

**Fix Strategy**:
1. Add "Sistema" section to NAV_CLUSTERS
2. Add Settings item with icon, href, description
3. Verify Settings loads when clicked
4. Update test matrix NAV-014

**Test IDs**: NAV-014, SIDE-003

**Evidence**: Code inspection of sidebar.tsx lines 29-139

---

### IAL-002: Demo Auth Warning Banner Missing
**Status**: 🔴 OPEN
**Priority**: P0
**Severity**: Critical (Security)
**Found**: Documentation audit

**Where**: Frontend app (no visible warning)

**Reproduce**:
1. Login to application
2. Observe no warning about demo authentication mode

**Expected**:
- Visible warning banner when using demo auth
- Message: "⚠️ Demo Mode: This app uses simplified authentication. NOT production-ready."
- Only visible when demo auth is active
- Dismissible but persists across sessions

**Actual**:
- No warning displayed
- Users unaware of security limitations

**Suspected Root Cause**:
- No component implementing auth warning
- No check for auth mode in frontend

**Fix Strategy**:
1. Create `AuthWarningBanner` component
2. Check if demo auth mode enabled
3. Display banner at top of AppLayout
4. Add localStorage dismiss flag (per-session)
5. Document in security baseline

**Test IDs**: AUTH-001

**Evidence**: Visual inspection, code review

---

### IAL-003: Sparkasse Diagnostics Not Returned to Client
**Status**: 🔴 OPEN
**Priority**: P0
**Severity**: High
**Found**: Code inspection

**Where**: `server/csv-parser.ts` parseSparkasse function

**Reproduce**:
1. Upload Sparkasse CSV with errors
2. Check API response
3. Observe: Generic error, no diagnostics

**Expected (per mission requirements)**:
```json
{
  "success": false,
  "diagnostics": {
    "encodingDetected": "UTF-8",
    "delimiterDetected": ";",
    "headerMatch": {
      "found": ["Auftragskonto", "Buchungstag"],
      "missing": ["Betrag"],
      "extra": ["CustomColumn"]
    },
    "rowParseErrors": {
      "count": 15,
      "examples": [
        { "row": 5, "reason": "INVALID_DATE", "data": "32.13.2025" },
        { "row": 8, "reason": "INVALID_AMOUNT", "data": "abc" }
      ]
    },
    "rejectionReasons": {
      "INVALID_DATE": 5,
      "MISSING_COLUMN": 10
    }
  }
}
```

**Actual**:
- Logging exists (`logger.info`, `logger.error`)
- But diagnostics not structured or returned to client
- Client gets generic error message

**Suspected Root Cause**:
- parseSparkasse logs diagnostics but doesn't build diagnostic object
- ParseResult doesn't have diagnostics field
- Client can't show actionable error details

**Fix Strategy**:
1. Add `diagnostics` field to ParseResult interface
2. Build diagnostic object during Sparkasse parsing
3. Return diagnostics in error response
4. Update client to display diagnostic details
5. Add toast with expandable error details

**Test IDs**: SPARK-001 through SPARK-006, DIAG-001 through DIAG-005

**Evidence**: server/csv-parser.ts lines 553-700

---

### IAL-004: Keyword Expressions May Be Space-Tokenized
**Status**: 🟡 IN_PROGRESS (Needs verification)
**Priority**: P0
**Severity**: Critical (Data corruption risk)
**Found**: Mission requirements review

**Where**: Rules engine, keyword matching logic

**Reproduce**:
1. Create rule with keyword: `SV Fuerstenfeldbrucker Wasserratten e.V.`
2. Save rule
3. Check database: are keywords split into tokens?
4. Test transaction match with full expression

**Expected**:
- Keyword stored exactly as entered
- Match checks if description contains full expression
- No tokenization by spaces

**Actual**:
- Code inspection shows `keywords.split(";")` - CORRECT
- But need to verify no secondary splitting occurs
- Need to test with complex expressions

**Suspected Root Cause**:
- Unclear - code looks correct
- May be issue in UI or secondary processing

**Fix Strategy**:
1. Add E2E test with complex expression (RULE-002)
2. Verify DB storage
3. Verify match logic
4. Add integration test
5. Document expression syntax in rules

**Test IDs**: RULE-002, RULE-003

**Evidence**: server/routes.ts:1037

**Status Update**: Code review suggests this is NOT a bug, but needs E2E verification

---

## P1 Issues (High Priority)

### IAL-005: Vercel Backend Deployment Strategy Undefined
**Status**: 🔴 OPEN
**Priority**: P1
**Severity**: Medium (Deployment blocker)
**Found**: Documentation audit

**Where**: Deployment documentation, vercel.json

**Issue**:
- vercel.json only configures frontend (SPA rewrites)
- No backend deployment strategy documented
- No API routing configuration
- VITE_API_URL must point to separate backend

**Expected**:
- Backend deployed separately (Vercel Serverless, Railway, Render, etc.)
- VITE_API_URL environment variable configured
- CORS configured for frontend domain
- Database connection from backend

**Actual**:
- Frontend config exists
- Backend deployment unclear
- No documented strategy

**Fix Strategy**:
1. Document backend deployment options
2. Add Vercel Functions configuration (if using Vercel)
3. Or document external deployment (Railway/Render)
4. Add VITE_API_URL to env var checklist
5. Update deployment guide

**Test IDs**: VER-002

**Evidence**: vercel.json, deployment docs

---

### IAL-006: No Automated E2E Tests
**Status**: 🔴 OPEN
**Priority**: P1
**Severity**: Medium (Quality risk)
**Found**: Baseline audit

**Where**: Repository root (missing `tests/` or `e2e/`)

**Issue**:
- No Playwright configuration
- No E2E test scripts
- Manual testing only

**Expected (per mission)**:
- Playwright configured
- Minimum E2E suite covering:
  - Navigation
  - Uploads (all 3 formats)
  - Deduplication
  - Manual override
  - Rules engine

**Actual**:
- No test framework
- `package.json` has no test scripts

**Fix Strategy**:
1. Install Playwright
2. Create `playwright.config.ts`
3. Add `tests/e2e/` directory
4. Implement minimum suite
5. Add npm scripts: `test:e2e`
6. Document in runbook

**Test IDs**: All tests in E2E matrix

**Evidence**: File system inspection

---

### IAL-007: Rules Export Missing Category Reference Sheets
**Status**: 🟢 FIXED
**Priority**: P1
**Severity**: Low
**Found**: Recent implementation

**Issue**:
- Rules export recently enhanced with category reference
- Implementation complete but needs verification

**Fix Strategy**:
- Verify implementation in rules.tsx
- Test export functionality
- Confirm 3 sheets present

**Test IDs**: N/A (verification only)

**Evidence**: Recent commit

---

## P2 Issues (Medium Priority)

### IAL-008: Bundle Size Optimization Needed
**Status**: 🔴 OPEN
**Priority**: P2
**Severity**: Low (Performance)
**Found**: Baseline build

**Where**: Build output

**Issue**:
- Client bundle: 1,171 kB (350 kB gzipped)
- Server bundle: 1.2 MB
- Build warning about chunk size

**Expected**:
- Code splitting implemented
- Lazy loading for routes
- Dynamic imports for heavy dependencies

**Actual**:
- Single bundle
- All routes loaded upfront

**Fix Strategy**:
1. Implement React.lazy for routes
2. Split vendor chunks
3. Analyze bundle with `vite-bundle-visualizer`
4. Move heavy deps to dynamic imports

**Test IDs**: BUILD-002

**Evidence**: Build output logs

---

## P3 Issues (Low Priority)

### IAL-009: Documentation Outdated
**Status**: 🔴 OPEN
**Priority**: P3
**Severity**: Low (Documentation)
**Found**: Documentation audit

**Where**: Multiple docs files

**Issue**:
- CLAUDE.md mentions only M&M import
- Missing Amex, Sparkasse documentation
- Rules engine behavior undocumented
- Many docs in `docs/_codex/` may be historical

**Fix Strategy**:
1. Update CLAUDE.md (per DOCS_REALITY_SUMMARY.md)
2. Create IMPORT_CONTRACT.md
3. Create RULES_ENGINE_SPEC.md
4. Archive outdated _codex docs

**Test IDs**: N/A

**Evidence**: DOCS_REALITY_SUMMARY.md

---

## Issue Workflow

### When Issue Discovered
1. Assign unique ID (IAL-XXX)
2. Set priority (P0/P1/P2/P3)
3. Document reproduce steps
4. Add to this ledger
5. Reference in test matrix

### When Fix Started
1. Update status to 🟡 IN_PROGRESS
2. Create fix branch or use current QA branch
3. Implement fix
4. Update test IDs

### When Fix Completed
1. Update status to 🟢 FIXED
2. Add verification evidence
3. Run related test IDs
4. Commit with `fix(area): description [P0] [IAL-XXX]`

### When Fix Verified
1. Update status to 🔵 VERIFIED
2. Add E2E test evidence
3. Mark test IDs as ✅ PASS

### When Issue Closed
1. Update status to ⚫ CLOSED
2. Document in FIX_PLAN.md
3. Update QA_REPORT.md

---

## Issue Statistics

| Priority | Open | In Progress | Fixed | Verified | Closed | Total |
|----------|------|-------------|-------|----------|--------|-------|
| P0       | 4    | 0           | 0     | 0        | 0      | 4     |
| P1       | 2    | 0           | 1     | 0        | 0      | 3     |
| P2       | 1    | 0           | 0     | 0        | 0      | 1     |
| P3       | 1    | 0           | 0     | 0        | 0      | 1     |
| **Total**| **8**| **0**       | **1** | **0**    | **0**  | **9** |

---

**Last Updated**: 2026-01-02
**Next Review**: After Phase 3 manual smoke tests
