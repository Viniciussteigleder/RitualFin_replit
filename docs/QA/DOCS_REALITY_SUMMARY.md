# Documentation vs Code Reality Audit

**Generated**: 2026-01-02
**Branch**: `fix/full-app-autonomous-qa-claude-2026-01-02`

## Executive Summary

This audit compares documentation claims against actual code implementation to identify mismatches, gaps, and required corrections.

**Status**: ⚠️ **Moderate Divergence** - Core features implemented correctly, but docs outdated and some critical features missing

---

## CSV Import Contract

### 📄 Docs Claim (CLAUDE.md lines 200-220)
- Expects Miles & More format only
- Required columns: "Authorised on", "Amount", "Currency", "Description", "Payment type", "Status"
- Generates unique `key` for deduplication

### 💻 Code Reality (server/csv-parser.ts)
✅ **CORRECT**: Multi-format support exists (M&M, Amex, Sparkasse)
✅ **CORRECT**: Deduplication via unique key
⚠️ **INCOMPLETE**: Docs only mention M&M, but Amex and Sparkasse are fully implemented

**Conflict**: Documentation severely outdated - only documents M&M but all 3 formats supported

**Fix Required**:
- Update `CLAUDE.md` CSV Import Flow section
- Document all 3 formats with their column requirements
- Document format detection logic

---

## Rules Engine Keyword Matching

### 📄 Docs Claim (CLAUDE.md lines 215-219)
- "Matches keywords using normalized text"
- No mention of delimiter or expression handling

### 💻 Code Reality (server/routes.ts:1037)
```typescript
const keywords = rule.keywords.split(";").map(k => k.toLowerCase().trim());
```

✅ **CORRECT**: Uses `;` separator (per requirements)
❌ **MISSING**: Negative keywords not documented
❌ **MISSING**: Expression preservation not explicitly stated in docs

**Conflict**: Critical keyword matching behavior undocumented

**Fix Required**:
- Document `;` as canonical separator
- Document that expressions must NOT be tokenized by spaces
- Document negative keyword blocking behavior
- Add examples of valid vs invalid keyword expressions

---

## Manual Override Protection

### 📄 Docs Claim
No explicit documentation found in CLAUDE.md

### 💻 Code Reality (server/routes.ts:865-868, 990, 1042)
```typescript
// Manual confirmation sets manualOverride = true
manualOverride: true  // Prevent future auto-recategorization

if (tx.manualOverride) {
  // Skip this transaction
}
```

✅ **IMPLEMENTED**: Manual override flag exists and is respected
❌ **UNDOCUMENTED**: Critical feature completely missing from docs

**Conflict**: Production feature not documented

**Fix Required**:
- Document `manualOverride` flag in schema section
- Document that bulk rule reapply skips manual overrides
- Document user workflow for manual edits

---

## Interno Category Behavior

### 📄 Docs Claim (CLAUDE.md line 185)
- `internal_transfer`: Marks internal account movements (excluded from budgets)
- No auto-setting mentioned

### 💻 Code Reality (server/rules-engine.ts:167-178, server/routes.ts:876-878)
```typescript
const isInterno = rule.category1 === "Interno";
return {
  internalTransfer: isInterno,
  excludeFromBudget: isInterno,
  // ...
};
```

✅ **CORRECT**: Auto-setting implemented
⚠️ **INCOMPLETE**: Docs mention flag but not auto-behavior

**Conflict**: Docs incomplete on Interno auto-flagging

**Fix Required**:
- Document that Interno category automatically sets both flags
- Document that this is enforced at categorization time
- Add to schema documentation

---

## Sparkasse Diagnostics

### 📄 Requirement (Mission briefing)
Must record:
- encodingDetected
- delimiterDetected
- headerMatch result
- rowParseErrors summary
- rejection reasons

### 💻 Code Reality (server/csv-parser.ts:567-608)
✅ **EXISTS**: Enhanced logging added (lines with `logger.info` and `logger.error`)
⚠️ **PARTIAL**: Logging exists but structured diagnostic recording needs verification

**Status**: Needs end-to-end testing to verify diagnostic completeness

**Fix Required**:
- Verify all required diagnostic fields are logged
- Ensure diagnostics are returned to client, not just logged
- Test with actual Sparkasse CSV sample

---

## Deployment Configuration

### 📄 Docs Claim (Multiple deployment docs)
- Vercel deployment supported
- SPA routing required
- API calls to backend

### 💻 Code Reality (vercel.json)
```json
{
  "outputDirectory": "dist/public",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

✅ **CORRECT**: SPA rewrites configured
⚠️ **UNCLEAR**: No explicit API routing - relies on client `VITE_API_URL`
❌ **MISSING**: Backend deployment not configured in vercel.json

**Conflict**: vercel.json only handles frontend, backend deployment unclear

**Fix Required**:
- Document backend deployment strategy (separate Vercel project? Railway? Render?)
- Document VITE_API_URL configuration for production
- Add deployment checklist to docs

---

## Authentication System

### 📄 Docs Claim (CLAUDE.md lines 261-262)
- "Simplified auth system that auto-creates a 'demo' user"
- All data scoped to `userId`

### 💻 Code Reality (server/routes.ts auth endpoints)
✅ **CORRECT**: Demo user auto-creation exists
⚠️ **SECURITY RISK**: No production-ready multi-user auth
❌ **UNDOCUMENTED**: Security implications not clearly stated

**Conflict**: Production blocker not flagged in docs

**Fix Required**:
- Add explicit warning: "Demo auth - NOT production ready"
- Document multi-user auth as Phase D requirement
- Document RLS (Row Level Security) plan
- Add security warning banner in UI when demo-auth mode

---

## CSV Format Detection

### 📄 Docs Claim
Not documented

### 💻 Code Reality (server/csv-parser.ts:155-194)
```typescript
function detectCsvFormat(lines: string[]): { format: CsvFormat; separator: string } {
  // Checks for Amex, M&M, Sparkasse signatures
  // With enhanced logging
}
```

✅ **IMPLEMENTED**: Auto-detection with logging
❌ **UNDOCUMENTED**: Feature exists but not documented

**Conflict**: Critical feature missing from docs

**Fix Required**:
- Document format detection algorithm
- Document detection signatures for each format
- Document delimiter detection (comma vs semicolon)

---

## Testing Infrastructure

### 📄 Docs Claim (CLAUDE.md lines 284-289)
- "No test framework is currently configured"
- "Manual testing via `/confirm` queue is primary validation"

### 💻 Code Reality
❌ **ACCURATE**: No automated test framework found
❌ **MISSING**: No Playwright, Jest, Vitest configuration

**Status**: Documentation accurate but infrastructure missing

**Fix Required**:
- Implement Playwright for E2E tests (per mission requirements)
- Add test scripts to package.json
- Create `scripts/qa/` for API/DB tests

---

## Security Posture

### 📄 Docs Claim (docs/SECURITY_AUDIT_2025-12-29.md)
Security audit document exists

### 💻 Code Reality (vercel.json headers)
```json
"headers": [
  { "key": "X-Content-Type-Options", "value": "nosniff" },
  { "key": "X-Frame-Options", "value": "DENY" },
  { "key": "X-XSS-Protection", "value": "1; mode=block" }
]
```

✅ **PARTIAL**: Basic security headers configured
❌ **MISSING**: CORS configuration not found
❌ **MISSING**: Input validation documentation
⚠️ **UNCLEAR**: Secrets handling not documented

**Conflict**: Security claims not fully verifiable

**Fix Required**:
- Audit repository for committed secrets
- Document secret rotation procedures (exists: CREDENTIAL_ROTATION_GUIDE.md - verify completeness)
- Verify CORS behavior in production
- Document input validation approach

---

## Summary of Required Documentation Updates

### High Priority (P0)
1. **CLAUDE.md**:
   - Update CSV Import section with all 3 formats
   - Add Rules Engine keyword matching contract
   - Document manualOverride behavior
   - Document Interno auto-flagging
   - Add security warnings for demo auth

2. **New: IMPORT_CONTRACT.md**:
   - Formal CSV import contract
   - All 3 formats with column maps
   - Format detection rules
   - Error handling & diagnostics

3. **New: RULES_ENGINE_SPEC.md**:
   - Keyword expression syntax (`;` separator)
   - Negative keyword blocking
   - Priority-based matching
   - Manual override protection

### Medium Priority (P1)
4. **DEPLOYMENT_GUIDE.md** (update existing):
   - Backend deployment strategy
   - Environment variable checklist
   - VITE_API_URL configuration
   - Vercel + backend coordination

5. **SECURITY_BASELINE.md** (create):
   - Current security posture
   - Known limitations (demo auth)
   - Rotation procedures
   - Production readiness checklist

### Low Priority (P2)
6. **TESTING_GUIDE.md** (create):
   - E2E test execution
   - API smoke tests
   - DB invariant tests
   - CI/CD integration

---

## Immediate Action Items

1. ✅ This audit document created
2. ⏭️ Create E2E_TEST_MATRIX.md
3. ⏭️ Create ISSUE_LEDGER.md
4. ⏭️ Execute P0 manual smoke tests
5. ⏭️ Fix identified issues
6. ⏭️ Update documentation
7. ⏭️ Implement test automation

---

## Docs to Update When Phase Complete

### Must Update
- `docs/CLAUDE.md` - CSV import, rules engine, auth warnings
- `docs/DEPLOYMENT_GUIDE.md` - Backend strategy, env vars
- `docs/SECURITY_AUDIT_2025-12-29.md` - Update with current findings

### Must Create
- `docs/IMPORT_CONTRACT.md`
- `docs/RULES_ENGINE_SPEC.md`
- `docs/SECURITY/SECURITY_BASELINE.md`
- `docs/QA/E2E_TEST_MATRIX.md`
- `docs/QA/ISSUE_LEDGER.md`
- `docs/QA/FIX_PLAN.md`

### Should Create
- `docs/TESTING_GUIDE.md`
- `docs/PRODUCTION_READINESS_CHECKLIST.md`

---

**Last Updated**: 2026-01-02
**Next Review**: After P0 fixes complete
