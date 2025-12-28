# Quality Assurance & Debugging Guide

**Purpose**: Executable QA playbook for validating RitualFin functionality and debugging production issues.

**Last Updated**: 2025-12-28

---

## A) STARTUP & HEALTH CHECKS

### Prerequisites
```bash
# Verify environment
node --version        # >= 18.x
npm --version         # >= 9.x
psql --version        # PostgreSQL client installed
```

### Environment Setup
```bash
# Required environment variables
DATABASE_URL=postgresql://user:pass@host:port/dbname
OPENAI_API_KEY=sk-...  # Optional, AI features disabled if missing
NODE_ENV=development   # or production
```

### Startup Sequence
```bash
# 1. Install dependencies
npm install

# 2. Verify database connection
npm run db:push  # Should complete without errors

# 3. Start dev server
npm run dev      # Should start on port 5000

# 4. Verify logs show:
#    ✅ "Database connected"
#    ✅ "Server listening on port 5000"
#    ✅ "Vite dev server started"
```

### Health Check Endpoints
```bash
# Manual verification (curl or browser)
curl http://localhost:5000/             # → 200 OK (serves React app)
curl http://localhost:5000/api/auth/me  # → 200 or 401 (auth working)
```

**PASS CRITERIA**:
- ✅ Server starts without errors
- ✅ Database connection established
- ✅ Browser loads login page at http://localhost:5000
- ✅ Console shows no TypeScript errors

---

## B) UI-DRIVEN END-TO-END CHECKS

### Flow 1: CSV Upload (Multi-Format)

**Test Case 1.1: Miles & More CSV**
1. Navigate to `/uploads`
2. Click "Choose File"
3. Select `attached_assets/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv`
4. Click "Upload"

**Expected**:
- ✅ Upload status changes to "processing" → "ready"
- ✅ File appears in upload history table
- ✅ `rowsImported` > 0 (check for non-zero count)
- ✅ `accountSource` = "Miles & More Gold Credit Card" or similar

**Debug if FAIL**:
- Check browser console for errors
- Check server logs for parsing errors
- Verify CSV format matches `parseMilesAndMore()` expectations

**Test Case 1.2: American Express CSV**
1. Navigate to `/uploads`
2. Upload `attached_assets/activity_(8)_1766875792745.csv`

**Expected**:
- ✅ Format detected as "amex"
- ✅ Multiple `accountSource` values created (e.g., "Amex - Vinicius (1009)", "Amex - E Rodrigues (2015)")
- ✅ Cardholder names extracted correctly

**Debug if FAIL**:
- Check `detectCsvFormat()` logic in `server/csv-parser.ts:55-90`
- Verify "Karteninhaber" column exists in CSV
- Check account attribution regex in `server/routes.ts:248-318`

**Test Case 1.3: Sparkasse CSV**
1. Navigate to `/uploads`
2. Upload `attached_assets/20250929-22518260-umsatz_1766876653600.CSV`

**Expected**:
- ✅ Format detected as "sparkasse"
- ✅ `accountSource` = "Sparkasse - 8260" (last 4 digits of IBAN)
- ✅ Date format DD.MM.YY parsed correctly

**Debug if FAIL**:
- Check `parseSparkasse()` implementation
- Verify "Auftragskonto" column present
- Check date parsing for 2-digit year handling

---

### Flow 2: Account Attribution & Multi-Card Support

**Test Case 2.1: Multiple Accounts Visible**
1. After uploading all 3 CSVs (M&M, Amex, Sparkasse)
2. Navigate to `/accounts`

**Expected**:
- ✅ At least 5 distinct accounts shown:
  - "Miles & More Gold Credit Card"
  - "Amex - Vinicius (1009)"
  - "Amex - E Rodrigues (2015)"
  - "Sparkasse - 8260"
  - (plus any others from CSV data)
- ✅ Each account shows correct `accountType` (credit_card vs checking)
- ✅ Icons and colors display correctly

**Debug if FAIL**:
- Check `POST /api/uploads/process` response in Network tab
- Verify account creation logic in `server/routes.ts:248-318`
- Check accounts table in database: `SELECT DISTINCT accountName FROM accounts;`

---

### Flow 3: Rules Engine & Auto-Categorization

**Test Case 3.1: Create Rule**
1. Navigate to `/rules`
2. Click "Add Rule"
3. Fill in:
   - Keywords: "lidl;aldi;rewe"
   - Type: "Despesa"
   - Fix/Var: "Variável"
   - Category 1: "Mercado"
   - Priority: 500
   - Strict: false
4. Save

**Expected**:
- ✅ Rule appears in table
- ✅ `id` is auto-generated
- ✅ Keywords stored uppercase without accents

**Test Case 3.2: Rule Applies on New Upload**
1. Upload CSV containing "LIDL" transaction
2. Navigate to `/confirm`

**Expected**:
- ✅ LIDL transaction auto-categorized as "Mercado"
- ✅ `confidence` > 0
- ✅ `ruleIdApplied` matches created rule
- ✅ If confidence >= 80: `needsReview = false`

**Debug if FAIL**:
- Check `matchRules()` in `server/rules-engine.ts`
- Verify keyword normalization (uppercase, no accents)
- Check confidence calculation logic
- Verify rule priority ordering

---

### Flow 4: Transaction Confirmation Queue

**Test Case 4.1: View Pending Transactions**
1. Navigate to `/confirm`

**Expected**:
- ✅ Only transactions with `needsReview = true` shown
- ✅ Transactions grouped by similarity (optional)
- ✅ Category dropdowns populated
- ✅ AI suggestion button visible (if OpenAI key configured)

**Test Case 4.2: Bulk Confirm**
1. Select 3-5 transactions
2. Set categories:
   - Type: "Despesa"
   - Fix/Var: "Variável"
   - Category 1: "Lazer"
3. Click "Confirm Selected"

**Expected**:
- ✅ POST `/api/transactions/bulk-confirm` succeeds
- ✅ Transactions disappear from queue
- ✅ Database updated: `needsReview = false`, categories set
- ✅ Dashboard reflects new categorizations

**Debug if FAIL**:
- Check Network tab for 400/500 errors
- Verify request body format matches API expectations
- Check server logs for validation errors
- Verify Zod schema in `shared/schema.ts`

---

### Flow 5: Auto-Confirm High-Confidence Transactions

**Test Case 5.1: Strict Rule Auto-Confirm**
1. Create rule with `strict: true`, keywords: "netflix"
2. Upload CSV with Netflix transaction

**Expected**:
- ✅ Netflix transaction does NOT appear in `/confirm` queue
- ✅ Transaction auto-categorized immediately
- ✅ `needsReview = false`
- ✅ `confidence = 100`

**Test Case 5.2: High-Confidence Auto-Confirm (>= 80%)**
1. Create rule with `strict: false`, priority: 700
2. Upload CSV matching rule keywords

**Expected**:
- ✅ If no conflicting rules: auto-confirms
- ✅ If multiple rules match: highest priority wins
- ✅ If confidence < 80: goes to review queue

**Debug if FAIL**:
- Check `applyRulesToTransaction()` logic
- Verify confidence threshold in code (should be 80)
- Check rule priority ordering in database query
- Verify strict flag honored

---

### Flow 6: Dashboard & Budget Projections

**Test Case 6.1: Monthly Overview**
1. Navigate to `/dashboard`
2. Select current month

**Expected**:
- ✅ Total spending calculated correctly
- ✅ Category breakdown shown
- ✅ Budget vs actual comparison
- ✅ Progress bars accurate
- ✅ Internal transfers excluded (`internalTransfer: true`)
- ✅ Budget exclusions honored (`excludeFromBudget: true`)

**Test Case 6.2: Multi-Account Dashboard**
1. With multiple accounts in database
2. View dashboard

**Expected**:
- ✅ All accounts' transactions aggregated
- ✅ No duplicate counting
- ✅ Account filter works (if implemented)

**Debug if FAIL**:
- Check `/api/dashboard` response in Network tab
- Verify SQL query in `storage.ts`
- Check transaction flags (`internalTransfer`, `excludeFromBudget`)
- Verify date range filtering

---

### Flow 7: Navigation & Page Load

**Test Case 7.1: All Pages Load**
Visit each page and verify no errors:
- `/` → Dashboard
- `/uploads` → Upload history
- `/confirm` → Confirmation queue
- `/transactions` → Transaction list
- `/rules` → Rules management
- `/accounts` → Accounts list
- `/goals` → Budget planning
- `/calendar` → Recurring payments
- `/settings` → User settings
- `/ai-keywords` → AI analysis (if OpenAI key set)

**Expected**:
- ✅ Each page loads without console errors
- ✅ Navigation between pages works
- ✅ Page titles correct
- ✅ No broken components

**Debug if FAIL**:
- Check browser console for React errors
- Verify routing in `client/src/App.tsx`
- Check API endpoint availability
- Verify TanStack Query cache

---

## C) DEBUGGING GUIDE

### Log Event Reference

**CSV Upload Flow**:
```
[INFO] CSV upload started: filename=<name>, userId=<id>
[INFO] Format detected: <miles_and_more|amex|sparkasse>
[INFO] Parsed <N> transactions
[INFO] Creating account: <accountName> (type: <type>)
[INFO] Transaction matched rule: ruleId=<id>, confidence=<score>
[WARN] Duplicate transaction skipped: key=<key>
[ERROR] CSV parse error: <details>
```

**Rules Engine**:
```
[INFO] Applying rules to transaction: desc=<normalized>
[INFO] Rule matched: ruleId=<id>, keywords=<keywords>, priority=<N>
[WARN] Multiple rules matched, using highest priority
[INFO] Auto-confirm: confidence=<score>, threshold=80
[INFO] Review required: confidence=<score>
```

**Account Attribution**:
```
[INFO] Account created: <accountName> (source: <accountSource>)
[WARN] Account already exists, skipping creation
[ERROR] Failed to parse account info from CSV
```

### Failure Pattern Analysis

**Pattern 1: Zero Rows Imported**
```
Symptom: upload.rowsImported = 0, rowsTotal > 0
Causes:
  1. All transactions are duplicates (check duplicate key logic)
  2. CSV format mismatch (wrong columns)
  3. Date parsing failures (check date format)
  4. Database constraint violations

Debug Steps:
  1. Check server logs for "Duplicate transaction skipped"
  2. Verify CSV headers match expected format
  3. Test date parsing: parseDateMM("23.11.2025")
  4. Check database constraints on transactions table
```

**Pattern 2: Wrong Account Attribution**
```
Symptom: All Amex transactions show "American Express" instead of "Amex - Name (####)"
Causes:
  1. Regex pattern not matching
  2. CSV columns missing
  3. Parser using wrong accountSource logic

Debug Steps:
  1. Check CSV has "Karteninhaber" and "Konto #" columns
  2. Verify parseAmex() extracts cardholder name
  3. Test regex in server/routes.ts:248-268
  4. Check accountSource value in parsed transactions
```

**Pattern 3: Rules Not Matching**
```
Symptom: Transactions go to review despite matching rule keywords
Causes:
  1. Keyword normalization mismatch (accents, case)
  2. Rule priority too low
  3. Confidence below threshold
  4. Rule disabled or deleted

Debug Steps:
  1. Normalize transaction desc manually: descNorm.toUpperCase()
  2. Check rule.keywords includes matching term
  3. Verify rule.priority > other conflicting rules
  4. Check matchRules() return value
  5. Verify confidence >= 80 for auto-confirm
```

**Pattern 4: Dashboard Shows Wrong Totals**
```
Symptom: Spending totals don't match transaction sum
Causes:
  1. Internal transfers not excluded
  2. Budget exclusions not honored
  3. Date range filtering wrong
  4. Duplicate transactions counted

Debug Steps:
  1. Query transactions with filters:
     SELECT SUM(amount) WHERE internalTransfer = false AND excludeFromBudget = false
  2. Verify date range matches displayed month
  3. Check for duplicate keys in transactions table
  4. Verify currency conversion if multiple currencies
```

### Root Cause Isolation

**Step 1: Identify Error Layer**
```
Frontend error (React/UI)?
  → Check browser console, component props, TanStack Query state

Backend error (API)?
  → Check server logs, HTTP response codes, request body

Database error (PostgreSQL)?
  → Check Drizzle ORM logs, constraint violations, query results

CSV parsing error?
  → Check csv-parser.ts logs, format detection, column mapping
```

**Step 2: Test Isolation**
```
# Test CSV parser directly
node -e "
const {parseCSV} = require('./server/csv-parser.ts');
const result = parseCSV(csvContent);
console.log(result);
"

# Test rules engine directly
node -e "
const {matchRules} = require('./server/rules-engine.ts');
const match = matchRules('netflix monthly', rules);
console.log(match);
"

# Query database directly
psql $DATABASE_URL -c "SELECT * FROM transactions WHERE needsReview = true LIMIT 10;"
```

**Step 3: Common Database Queries**
```sql
-- Check for duplicate transaction keys
SELECT key, COUNT(*) FROM transactions GROUP BY key HAVING COUNT(*) > 1;

-- Find uncategorized transactions
SELECT id, descRaw, needsReview, confidence FROM transactions WHERE category1 IS NULL;

-- Verify rule application
SELECT t.descRaw, t.ruleIdApplied, r.keywords, t.confidence
FROM transactions t
LEFT JOIN rules r ON t.ruleIdApplied = r.id
WHERE t.needsReview = true;

-- Check account attribution
SELECT DISTINCT accountSource FROM transactions;
SELECT * FROM accounts ORDER BY created_at DESC;

-- Monthly spending by category
SELECT category1, SUM(amount) as total
FROM transactions
WHERE paymentDate >= '2025-12-01' AND paymentDate < '2026-01-01'
  AND internalTransfer = false
  AND excludeFromBudget = false
GROUP BY category1;
```

---

## D) FINAL QA CHECKLIST

**Run this checklist before deployment or handoff.**

### 1. Environment Setup
- [ ] `npm install` completes without errors
- [ ] `npm run check` passes (no TypeScript errors)
- [ ] `npm run build` succeeds
- [ ] Database connection works (`npm run db:push`)
- [ ] Environment variables set correctly

### 2. CSV Upload (All Formats)
- [ ] Miles & More CSV uploads successfully
- [ ] American Express CSV uploads successfully
- [ ] Sparkasse CSV uploads successfully
- [ ] Unknown format shows error message
- [ ] Duplicate detection prevents re-imports
- [ ] File size limits enforced (50MB)

### 3. Account Attribution
- [ ] M&M: Card name extracted from header
- [ ] Amex: Multiple cardholders distinguished (e.g., "Vinicius (1009)")
- [ ] Sparkasse: IBAN last 4 digits extracted
- [ ] Accounts auto-created on first upload
- [ ] Account icons and colors display correctly

### 4. Rules & Categorization
- [ ] Create rule via `/rules` page
- [ ] Keywords normalized (uppercase, no accents)
- [ ] Rule priority ordering works
- [ ] Strict rules auto-confirm without review
- [ ] Non-strict rules require review if confidence < 80
- [ ] Multiple rule matches use highest priority

### 5. Transaction Confirmation
- [ ] `/confirm` shows only `needsReview = true` transactions
- [ ] Bulk confirm updates multiple transactions
- [ ] Individual confirm works
- [ ] Manual category override sets `manualOverride = true`
- [ ] Confirmed transactions disappear from queue

### 6. Auto-Confirm (Phase 5)
- [ ] High-confidence transactions (>= 80%) auto-confirm
- [ ] Strict rules skip review queue entirely
- [ ] Low-confidence transactions go to queue
- [ ] `manualOverride` prevents re-categorization

### 7. Dashboard & Budgets
- [ ] Monthly spending totals accurate
- [ ] Category breakdown correct
- [ ] Internal transfers excluded
- [ ] Budget exclusions honored
- [ ] Progress bars reflect actual vs target
- [ ] Multi-account aggregation works

### 8. Navigation & UI
- [ ] All pages load without errors
- [ ] Page navigation works (Wouter routing)
- [ ] Forms validate input correctly
- [ ] Error messages display when needed
- [ ] Loading states shown during API calls

### 9. AI Features (Optional)
- [ ] AI keyword suggestion works (if OpenAI key set)
- [ ] Bulk categorize analyzes multiple transactions
- [ ] AI errors handled gracefully (no crash)
- [ ] Missing API key shows appropriate message

### 10. Edge Cases
- [ ] Empty CSV upload shows error
- [ ] Invalid date formats rejected
- [ ] Negative amounts handled correctly
- [ ] Foreign currency transactions parse
- [ ] Long descriptions don't break layout
- [ ] Special characters in descriptions handled

### 11. Performance
- [ ] Large CSV (500+ rows) uploads in < 10 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] No N+1 query warnings in logs
- [ ] TanStack Query caching works

### 12. Error Handling
- [ ] 500 errors show user-friendly message
- [ ] Network errors display retry option
- [ ] Validation errors highlight fields
- [ ] Server logs contain debugging info

---

## PASS/FAIL SUMMARY

**PASS** = All 12 sections checked with no blockers
**FAIL** = Any critical issue in sections 1-8
**WARN** = Non-critical issues in sections 9-12 (AI, edge cases, performance)

**Final Sign-Off**:
- [ ] All critical flows tested and passing
- [ ] Known issues documented
- [ ] Database state clean (no test data)
- [ ] Ready for production deployment

**Date**: __________
**Tested By**: __________
**Result**: PASS / FAIL / WARN

---

**END OF QA GUIDE**
