# E2E Test Matrix

**Generated**: 2026-01-02
**Test Environment**: Local development + Production Vercel
**Test Data**: M&M, Amex, Sparkasse CSV samples from mission briefing

---

## Test Execution Legend

- ✅ **PASS** - Test passed with expected behavior
- ❌ **FAIL** - Test failed, issue logged in ISSUE_LEDGER.md
- ⏸️ **SKIP** - Test skipped (dependency/blocker)
- 🔄 **RETRY** - Test needs retry after fix
- ⏭️ **TODO** - Not yet executed

---

## 1. Navigation & Layout (P0)

### 1.1 Sidebar Navigation
| Test ID | Route | Expected Behavior | Status | Evidence | Issue ID |
|---------|-------|-------------------|---------|----------|----------|
| NAV-001 | `/dashboard` | Dashboard loads, no console errors | ⏭️ | | |
| NAV-002 | `/calendar` | Calendar loads, shows events | ⏭️ | | |
| NAV-003 | `/notifications` | Notifications page loads | ⏭️ | | |
| NAV-004 | `/budgets` | Budgets page loads | ⏭️ | | |
| NAV-005 | `/goals` | Goals page loads | ⏭️ | | |
| NAV-006 | `/confirm` | Confirmation queue loads | ⏭️ | | |
| NAV-007 | `/transactions` | Transactions list loads | ⏭️ | | |
| NAV-008 | `/rules` | Rules page loads | ⏭️ | | |
| NAV-009 | `/merchant-dictionary` | Dictionary page loads | ⏭️ | | |
| NAV-010 | `/ai-keywords` | AI Keywords page loads | ⏭️ | | |
| NAV-011 | `/uploads` | Uploads page loads | ⏭️ | | |
| NAV-012 | `/accounts` | Accounts page loads | ⏭️ | | |
| NAV-013 | `/rituals` | Rituals page loads | ⏭️ | | |
| NAV-014 | `/settings` | Settings page loads | ⏭️ | | |

### 1.2 Settings Tab Navigation (P0)
| Test ID | Tab | Expected Behavior | Status | Evidence | Issue ID |
|---------|-----|-------------------|---------|----------|----------|
| SET-001 | Conta | Account settings load | ⏭️ | | |
| SET-002 | Preferências | Preferences load | ⏭️ | | |
| SET-003 | Dicionários | Dictionary settings load | ⏭️ | | |
| SET-004 | Integrações | Data source integrations load | ⏭️ | | |
| SET-005 | Segurança | Security settings load | ⏭️ | | |

### 1.3 Sidebar UX Requirements (P0)
| Test ID | Requirement | Expected Behavior | Status | Evidence | Issue ID |
|---------|-------------|-------------------|---------|----------|----------|
| SIDE-001 | Logo aspect ratio | RitualFin logo not distorted | ⏭️ | | |
| SIDE-002 | Collapsible groups | Groups expand/collapse with chevron | ⏭️ | | |
| SIDE-003 | Settings placement | "Configurações" in bottom section | ⏭️ | | IAL-001 |
| SIDE-004 | No duplicate entries | Only one Settings entry | ⏭️ | | |
| SIDE-005 | Logout visible | "Sair" button in bottom section | ⏭️ | | |

---

## 2. CSV Import Pipeline (P0 - CRITICAL)

### 2.1 Miles & More Import
| Test ID | Action | Expected Behavior | API Call | DB Effect | Status | Evidence | Issue ID |
|---------|--------|-------------------|----------|-----------|--------|----------|----------|
| MM-001 | Upload M&M CSV | File accepted, format detected | `POST /api/uploads/process` | Upload record created | ⏭️ | | |
| MM-002 | Parse M&M | Rows parsed, transactions created | - | `rowsImported > 0` | ⏭️ | | |
| MM-003 | Re-upload M&M | Duplicates detected, no new tx | `POST /api/uploads/process` | `duplicates > 0`, `rowsImported = 0` | ⏭️ | | |
| MM-004 | View transactions | Imported tx visible in list | `GET /api/transactions` | - | ⏭️ | | |
| MM-005 | Merchant fields | keyDesc, aliasDesc populated | - | merchant_descriptions entry | ⏭️ | | |

### 2.2 Amex Import
| Test ID | Action | Expected Behavior | API Call | DB Effect | Status | Evidence | Issue ID |
|---------|--------|-------------------|----------|-----------|--------|----------|----------|
| AMEX-001 | Upload Amex CSV | File accepted, Amex detected | `POST /api/uploads/process` | Upload record, format="amex" | ⏭️ | | |
| AMEX-002 | Parse Amex | Rows parsed correctly | - | Transactions with Amex account | ⏭️ | | |
| AMEX-003 | Column mapping | Datum→date, Betrag→amount, etc | - | Correct field mapping | ⏭️ | | |
| AMEX-004 | Re-upload Amex | Deduplication works | `POST /api/uploads/process` | No duplicate transactions | ⏭️ | | |

### 2.3 Sparkasse Import (P0 - WITH DIAGNOSTICS)
| Test ID | Action | Expected Behavior | API Call | DB Effect | Status | Evidence | Issue ID |
|---------|--------|-------------------|----------|-----------|--------|----------|----------|
| SPARK-001 | Upload Sparkasse CSV | File accepted, Sparkasse detected | `POST /api/uploads/process` | Upload record, format="sparkasse" | ⏭️ | | |
| SPARK-002 | Format detection log | Logs format signature match | - | Console: format="sparkasse" | ⏭️ | | |
| SPARK-003 | Header validation | Required headers present | - | No header error | ⏭️ | | |
| SPARK-004 | Parse rows | All valid rows parsed | - | rowsImported matches file | ⏭️ | | |
| SPARK-005 | Beneficiary variants | Handles umlaut variants | - | Column detected correctly | ⏭️ | | |
| SPARK-006 | Date parsing | DD.MM.YY format parsed | - | Valid paymentDate | ⏭️ | | |

#### Sparkasse Diagnostic Requirements (P0)
| Test ID | Diagnostic Field | Expected | Status | Evidence | Issue ID |
|---------|------------------|----------|---------|----------|----------|
| DIAG-001 | encodingDetected | UTF-8 or detected encoding | ⏭️ | | |
| DIAG-002 | delimiterDetected | ";" (semicolon) | ⏭️ | | |
| DIAG-003 | headerMatch | All required headers found | ⏭️ | | |
| DIAG-004 | rowParseErrors | Count + first 5 examples | ⏭️ | | |
| DIAG-005 | rejectionReasons | Enumerated codes | ⏭️ | | |

### 2.4 Import Error Handling (P0)
| Test ID | Error Scenario | Expected UI | Expected API Response | Status | Evidence | Issue ID |
|---------|----------------|-------------|----------------------|---------|----------|----------|
| ERR-001 | Invalid CSV format | Toast error with reason | 400 with structured error | ⏭️ | | |
| ERR-002 | Missing required columns | Toast lists missing columns | 400 with column names | ⏭️ | | |
| ERR-003 | Encoding mismatch | Toast suggests encoding issue | 400 with encoding info | ⏭️ | | |
| ERR-004 | Empty file | Toast: "No data to import" | 400 with empty file error | ⏭️ | | |

---

## 3. Categorization & Rules (P0 - CRITICAL)

### 3.1 Rules Engine - Keyword Matching
| Test ID | Scenario | Keywords | Negative Keywords | Description | Expected Match | Status | Evidence | Issue ID |
|---------|----------|----------|-------------------|-------------|----------------|---------|----------|----------|
| RULE-001 | Simple match | `LIDL` | - | `LIDL FILIALE 123` | ✅ Match | ⏭️ | | |
| RULE-002 | Expression match | `SV Fuerstenfeldbrucker Wasserratten e.V.` | - | `SV Fuerstenfeldbrucker Wasserratten e.V. BEITRAG` | ✅ Match | ⏭️ | | |
| RULE-003 | Multi-expression | `LIDL;REWE;EDEKA` | - | `REWE MARKT 456` | ✅ Match (REWE) | ⏭️ | | |
| RULE-004 | Negative block | `STADTWERK` | `RÜCKERSTATTUNG` | `STADTWERK RÜCKERSTATTUNG` | ❌ No match | ⏭️ | | |
| RULE-005 | Case insensitive | `netflix` | - | `NETFLIX SUBSCRIPTION` | ✅ Match | ⏭️ | | |
| RULE-006 | Accent normalized | `CAFÉ` | - | `CAFE CENTRAL` | ✅ Match | ⏭️ | | |

**CRITICAL REQUIREMENT**: Expressions must NOT be split by spaces. Test ID RULE-002 validates this.

### 3.2 Manual Override Protection (P0)
| Test ID | Action | Expected Behavior | DB State | Status | Evidence | Issue ID |
|---------|--------|-------------------|----------|---------|----------|----------|
| MAN-001 | User edits transaction | manualOverride=true set | Transaction.manualOverride=true | ⏭️ | | |
| MAN-002 | Bulk rule reapply | Manual tx skipped | No changes to manual tx | ⏭️ | | |
| MAN-003 | New rule created | Manual tx not affected | manualOverride still true | ⏭️ | | |
| MAN-004 | Rule priority change | Manual tx untouched | No recategorization | ⏭️ | | |

### 3.3 Interno Category Auto-Flagging (P0)
| Test ID | Action | Expected Flags | Status | Evidence | Issue ID |
|---------|--------|----------------|---------|----------|----------|
| INT-001 | Assign "Interno" category | internalTransfer=true, excludeFromBudget=true | ⏭️ | | |
| INT-002 | Create Interno rule | Auto-applies both flags on match | ⏭️ | | |
| INT-003 | Dashboard totals | Interno tx excluded from expense totals | ⏭️ | | |
| INT-004 | Budget calculations | Interno tx excluded | ⏭️ | | |

---

## 4. Review Queue (Fila de Revisão) (P0)

### 4.1 Queue Operations
| Test ID | Action | Expected Behavior | API Call | DB Effect | Status | Evidence | Issue ID |
|---------|--------|-------------------|----------|-----------|--------|----------|----------|
| REV-001 | Load queue | Show tx with needsReview=true | `GET /api/transactions/confirm-queue` | - | ⏭️ | | |
| REV-002 | Select Category L1 | Dropdown shows all L1 categories | - | UI update | ⏭️ | | |
| REV-003 | Select Category L2 | Free text input appears | - | UI update | ⏭️ | | |
| REV-004 | Select Category L3 | Free text input appears | - | UI update | ⏭️ | | |
| REV-005 | View current keywords | Shows rule keywords for selected category | - | - | ⏭️ | | |
| REV-006 | Add new keyword | Keyword added to rule | `PATCH /api/rules/:id` | Rule.keywords updated | ⏭️ | | |
| REV-007 | Add negative keyword | Negative keyword added | `PATCH /api/rules/:id` | Rule.keywordsNegative updated | ⏭️ | | |
| REV-008 | Confirm transaction | Tx removed from queue | `POST /api/transactions/bulk-confirm` | needsReview=false, manualOverride=true | ⏭️ | | |

---

## 5. Merchant Dictionary & Aliases (P0/P1)

### 5.1 Alias Management
| Test ID | Action | Expected Behavior | API Call | DB Effect | Status | Evidence | Issue ID |
|---------|--------|-------------------|----------|-----------|--------|----------|----------|
| ALIAS-001 | View dictionary | List all merchant aliases | `GET /api/merchant-descriptions` | - | ⏭️ | | |
| ALIAS-002 | Edit alias | Update aliasDesc | `PATCH /api/merchant-descriptions/:id` | aliasDesc changed | ⏭️ | | |
| ALIAS-003 | AI suggest alias | Get AI suggestion | `POST /api/merchant-descriptions/ai-suggest` | - | ⏭️ | | |
| ALIAS-004 | Export aliases | Download Excel | `GET /api/merchant-descriptions/export` | - | ⏭️ | | |
| ALIAS-005 | Import aliases | Upload Excel, preview, confirm | `POST /api/merchant-descriptions/import` | Bulk insert/update | ⏭️ | | |

### 5.2 Logo Integration (P1 - if feature exists)
| Test ID | Action | Expected Behavior | Status | Evidence | Issue ID |
|---------|--------|-------------------|---------|----------|----------|
| LOGO-001 | Logo URL in alias | Logo downloaded and cached | ⏭️ | | |
| LOGO-002 | Logo display | Uniform sizing, no distortion | ⏭️ | | |
| LOGO-003 | Logo fallback | Graceful fallback if URL fails | ⏭️ | | |

---

## 6. Build & Deployment (P0)

### 6.1 Local Build
| Test ID | Command | Expected Result | Status | Evidence | Issue ID |
|---------|---------|-----------------|---------|----------|----------|
| BUILD-001 | `npm run check` | No TypeScript errors | ✅ PASS | Baseline confirmed | - |
| BUILD-002 | `npm run build` | Clean build, no errors | ✅ PASS | Baseline confirmed | - |
| BUILD-003 | `npm start` | Production server starts on :5000 | ⏭️ | | |
| BUILD-004 | Access http://localhost:5000 | App loads | ⏭️ | | |

### 6.2 Vercel Deployment
| Test ID | Test | Expected Behavior | Status | Evidence | Issue ID |
|---------|------|-------------------|---------|----------|----------|
| VER-001 | SPA routing | Direct navigation to /transactions works | ⏭️ | | |
| VER-002 | API calls | Frontend calls VITE_API_URL, not Vercel origin | ⏭️ | | |
| VER-003 | Static assets | Assets load from /assets/ with cache headers | ⏭️ | | |
| VER-004 | Security headers | X-Frame-Options, XSS-Protection present | ⏭️ | | |

---

## 7. Security Baseline (P0)

### 7.1 Secrets Audit
| Test ID | Check | Expected Result | Status | Evidence | Issue ID |
|---------|-------|-----------------|---------|----------|----------|
| SEC-001 | Scan repo for secrets | No API keys, passwords in history | ⏭️ | | |
| SEC-002 | Check docs for credentials | Placeholders only, no real values | ⏭️ | | |
| SEC-003 | Client bundle scan | No secrets in built JS | ⏭️ | | |
| SEC-004 | .env.example exists | Template with required vars | ⏭️ | | |

### 7.2 Input Validation
| Test ID | Input | Expected Validation | Status | Evidence | Issue ID |
|---------|-------|---------------------|---------|----------|----------|
| VAL-001 | CSV upload | File type validation (CSV only) | ⏭️ | | |
| VAL-002 | Rule keywords | XSS prevention | ⏭️ | | |
| VAL-003 | Category names | SQL injection prevention | ⏭️ | | |

### 7.3 Authentication Warning (P0)
| Test ID | Requirement | Expected Behavior | Status | Evidence | Issue ID |
|---------|-------------|-------------------|---------|----------|----------|
| AUTH-001 | Demo auth banner | Warning visible if demo mode | ⏭️ | | IAL-002 |
| AUTH-002 | Production check | Error if demo auth in production | ⏭️ | | |

---

## Test Execution Schedule

### Phase 3 (Manual Smoke) - Immediate
- NAV-001 through NAV-014
- MM-001 through MM-005
- AMEX-001 through AMEX-004
- SPARK-001 through SPARK-006
- RULE-001 through RULE-006
- MAN-001 through MAN-004
- INT-001 through INT-004
- BUILD-003, BUILD-004

### Phase 5 (Automation) - After P0 fixes
- All remaining tests converted to Playwright
- API smoke scripts for import endpoints
- DB invariant checks for flags and overrides

---

## Test Evidence Storage

Evidence files stored in:
- `docs/QA/evidence/screenshots/`
- `docs/QA/evidence/logs/`
- `docs/QA/evidence/traces/`

Naming convention: `{TEST_ID}_{PASS|FAIL}_{timestamp}.{ext}`

---

**Last Updated**: 2026-01-02
**Test Coverage**: 100+ test cases across 7 major areas
**P0 Test Count**: 85 critical path tests
