# Documentation Changelog

This file tracks all major documentation changes to the RitualFin project.

---

## 2026-01-02 - Autonomous QA Session + Phase 7 Documentation Consistency

**Author**: Claude (Autonomous QA Mission)
**Branch**: `claude/qa-fixes-2bTSq`
**Phase**: Phase C (Demo Auth) → Phase 7 (Documentation Consistency)

### New Documents Created

#### QA Infrastructure (Phase 0-2)

1. **`docs/QA/BASELINE_ENV_AND_RUNBOOK.md`**
   - Purpose: Document baseline environment, runtime versions, build results
   - Contents:
     - Node/npm versions, TypeScript check results
     - Build output sizes (client: 1.2MB, server: 1.2MB)
     - Required environment variables (DATABASE_URL, SESSION_SECRET, OPENAI_API_KEY)
     - Development runbook (dev, build, check, test commands)
     - Automated E2E test documentation (Playwright)
   - Status: ✅ Complete

2. **`docs/QA/DOCS_REALITY_SUMMARY.md`**
   - Purpose: Audit documentation vs actual implementation
   - Contents:
     - Documented: Only M&M import; Reality: M&M + Amex + Sparkasse
     - Documented: Basic rules; Reality: Complex rules with negative keywords, priority, strict mode
     - Missing: Manual override protection, Interno auto-flagging, keyword syntax
     - Missing: Deployment strategy, security baseline
   - Status: ✅ Complete

3. **`docs/QA/E2E_TEST_MATRIX.md`**
   - Purpose: Comprehensive test catalog for manual and automated testing
   - Contents:
     - 100+ test cases across 7 major areas
     - Navigation tests (NAV-001 through NAV-014)
     - CSV import tests for all 3 formats
     - Rules engine tests (keyword matching, manual override, Interno)
     - Build and deployment verification tests
     - Security baseline tests
   - Status: ✅ Complete

4. **`docs/QA/ISSUE_LEDGER.md`**
   - Purpose: Track all discovered issues with priorities and status
   - Contents:
     - 9 issues logged (4 P0, 3 P1, 1 P2, 1 P3)
     - Status tracking (OPEN, IN_PROGRESS, FIXED, VERIFIED, CLOSED)
     - Fix strategies and evidence
     - Issue statistics table
   - Status: ✅ Complete, actively maintained

5. **`docs/QA/FIX_PLAN.md`**
   - Purpose: Ordered execution plan for fixing all issues
   - Contents:
     - 8-phase execution blueprint
     - 4 milestones (P0, P1, P2, P3)
     - Time estimates (13.5 hours total)
     - Stop conditions for each milestone
     - Risk mitigation strategies
   - Status: ✅ Complete, milestones 1 & 2 done

#### Security (Phase 6)

6. **`docs/SECURITY/SECURITY_BASELINE.md`**
   - Purpose: Comprehensive security audit and posture documentation
   - Contents:
     - Authentication & authorization (demo auth limitations)
     - Secrets management (repository scan results)
     - CORS configuration
     - Input validation (CSV, API endpoints)
     - Database security (Drizzle ORM, Transaction Pooler)
     - Transport security (HTTPS, security headers)
     - Known limitations and Phase D roadmap
     - Security checklist for deployment
   - Status: ✅ Complete

#### Technical Specifications (Phase 7)

7. **`docs/IMPORT_CONTRACT.md`**
   - Purpose: Define CSV import formats and parsing rules
   - Contents:
     - Format detection algorithm (Sparkasse → Amex → M&M)
     - Miles & More format specification (columns, parsing rules, examples)
     - Amex Germany format specification (German columns, date/amount formats)
     - Sparkasse format specification (semicolon delimiter, encoding detection, diagnostics)
     - Deduplication strategy (unique key formula)
     - Merchant description generation (keyDesc, aliasDesc, source)
     - Error handling and diagnostic reporting
     - API response formats
   - Status: ✅ Complete

8. **`docs/RULES_ENGINE_SPEC.md`**
   - Purpose: Document keyword matching and categorization rules
   - Contents:
     - Rule data model and hierarchy (Level 1/2/3 categories)
     - Keyword syntax (semicolon separator, space preservation)
     - Normalization algorithm (uppercase, remove accents)
     - Negative keywords (blocking matches)
     - Matching algorithm (priority-based resolution)
     - Confidence calculation
     - Manual override protection (immutability)
     - Interno auto-flagging (internal transfer detection)
     - AI integration (keyword suggestion, bulk categorization)
     - Rule seeding (system rules)
     - Best practices and troubleshooting
   - Status: ✅ Complete

### Updated Documents

#### Core Project Documentation

9. **`CLAUDE.md`**
   - **Section Added**: Deployment (lines 154-183)
   - **Contents**:
     - Architecture diagram (Vercel → Render → Supabase)
     - Required environment variables for frontend and backend
     - Deployment guide reference
     - Key deployment principles
   - **Reason**: Address IAL-005 (backend deployment strategy undefined)
   - **Commit**: `849bd27` (docs(deploy): Add deployment documentation)

10. **`vercel.json`**
    - **Changes**: Added explanatory comments
      - Line 4: `"_comment": "FRONTEND ONLY - Backend deployed separately to Render. See docs/DEPLOYMENT_GUIDE.md"`
      - Line 13: `"_comment": "SPA routing - all routes serve index.html"`
    - **Reason**: Clarify frontend-only configuration
    - **Commit**: `849bd27` (docs(deploy): Add deployment documentation)

#### Rules Engine (Code Documentation)

11. **`server/rules-engine.ts`**
    - **Section Added**: Code comments (lines 52-56)
    - **Contents**:
      - CRITICAL comment explaining semicolon-only splitting
      - Example showing space preservation in expressions
      - Clarification that normalization happens AFTER splitting
    - **Reason**: Address IAL-004 (keyword expression verification)
    - **Commit**: `99bb52a` (fix(rules): Document keyword expression behavior)

12. **`client/src/pages/rules.tsx`**
    - **Section Updated**: Keyword input field (lines 730-745)
    - **Changes**:
      - Enhanced placeholder: Added multi-word expression example
      - Updated help text: Explicit about space preservation
      - Added amber warning example with complex expression
    - **Reason**: Document keyword syntax in UI
    - **Commit**: `99bb52a` (fix(rules): Document keyword expression behavior)

### Documentation Gaps Closed

The following gaps identified in DOCS_REALITY_SUMMARY.md have been addressed:

| Gap | Document | Status |
|-----|----------|--------|
| CSV import only mentions M&M | `docs/IMPORT_CONTRACT.md` | ✅ All 3 formats documented |
| Rules engine behavior undocumented | `docs/RULES_ENGINE_SPEC.md` | ✅ Complete specification |
| Keyword matching syntax unclear | `RULES_ENGINE_SPEC.md`, code comments | ✅ Semicolon separator documented |
| Manual override protection missing | `RULES_ENGINE_SPEC.md` (Manual Override Protection section) | ✅ Documented |
| Interno auto-flagging incomplete | `RULES_ENGINE_SPEC.md` (Interno Category Auto-Flagging section) | ✅ Documented |
| Sparkasse diagnostics not exposed | `IMPORT_CONTRACT.md` (Diagnostic Reporting section) | ✅ Documented + implemented (IAL-003) |
| Backend deployment strategy undefined | `CLAUDE.md`, `vercel.json` | ✅ Documented (references DEPLOYMENT_GUIDE.md) |
| No security baseline | `docs/SECURITY/SECURITY_BASELINE.md` | ✅ Comprehensive security audit |
| No E2E test documentation | `docs/QA/BASELINE_ENV_AND_RUNBOOK.md` (Testing section) | ✅ Playwright tests documented |

### Maintenance Notes

**Document Owners**:
- QA docs (`docs/QA/`): Maintained during QA sessions, updated per phase
- Security docs (`docs/SECURITY/`): Review quarterly or before Phase D
- Technical specs (`IMPORT_CONTRACT.md`, `RULES_ENGINE_SPEC.md`): Update when implementation changes
- Core docs (`CLAUDE.md`, `README.md`): Update with major features

**Review Cycle**:
- Before each phase deployment (C → D, etc.)
- After major feature additions
- Quarterly security baseline review
- Before public releases

---

## Previous Changes (Pre-QA)

### 2025-12-28 - Deployment Documentation

**Author**: Previous development session
**Documents**:
- `docs/DEPLOYMENT_GUIDE.md` - Vercel + Render + Supabase deployment
- `docs/DEPLOYMENT_INSTRUCTIONS.md`, `docs/DEPLOYMENT_COMPLETE.md`, etc.

### Earlier

See git history for commit-level documentation changes before structured changelog.

---

**Last Updated**: 2026-01-02
**Next Review**: Before Phase D deployment or quarterly review
