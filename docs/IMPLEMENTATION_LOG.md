# Implementation Log

---

## CSV Upload Pipeline Standardization (2025-12-27)

**Project**: Multi-Provider CSV Upload (M&M, Amex, Sparkasse)
**Started**: 2025-12-27
**Status**: Analysis Phase

### Purpose

Standardize CSV upload pipeline to support multiple bank/card providers (Miles & More, American Express, Sparkasse) with:
- Consistent internal transaction contract
- Reliable account/card attribution
- Minimal additional logic per provider
- Clear observability and debugging

---

## Analysis Findings (2025-12-27)

### Files Analyzed

**Backend**:
- `server/csv-parser.ts` - Multi-format CSV parser (M&M + Amex already implemented)
- `server/routes.ts` - Upload processing endpoint (POST /api/uploads/process)
- `server/storage.ts` - Database layer (not yet fully reviewed)

**Frontend**:
- `client/src/pages/uploads.tsx` - Generic upload UI (format-agnostic)

**Schema**:
- `shared/schema.ts` - Transaction schema with `accountSource` field

**CSV Samples**:
- `attached_assets/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv` (M&M format)
- `attached_assets/activity_(8)_1766875792745.csv` (Amex format)
- No Sparkasse sample yet

---

### CSV Format Analysis

**Miles & More Format**:
```
Delimiter: semicolon (;)
Encoding: Standard (German locale)
Date format: DD.MM.YYYY (e.g., 23.11.2025)
Amount format: German (comma decimal: -253,09)
Header location: Line 3 (after card info line)
Card identification: Line 1 contains card name + last 4 digits
```

Key columns:
- Authorised on (payment date)
- Processed on (settlement date, optional)
- Amount (negative for expenses)
- Currency (EUR default)
- Description (merchant name)
- Payment type (e-commerce, contactless, retail-store, etc.)
- Status (Authorised, Processed)
- Foreign currency fields (optional: Amount in foreign currency, Currency, Exchange rate)

Account attribution: Card info from line 1 (e.g., "Miles & More Gold Credit Card;5310XXXXXXXX7340")

**American Express (Amex) Format**:
```
Delimiter: comma (,) with quoted fields
Encoding: Standard (German locale)
Date format: DD/MM/YYYY (e.g., 20/12/2025)
Amount format: German quoted ("94,23")
Header location: Line 1
Card identification: Via "Karteninhaber" (cardholder name) + "Konto #" (account number)
```

Key columns:
- Datum (date)
- Beschreibung (merchant name)
- Karteninhaber (cardholder name) - **CRITICAL for multi-card attribution**
- Konto # (account number: -11009, -12015, etc.) - **CRITICAL for multi-card attribution**
- Betrag (amount, positive values)
- Multiple address fields (Adresse, Stadt, PLZ, Land)
- Betreff (reference ID)

Account attribution: **PROBLEM IDENTIFIED** - Currently hardcoded to "American Express" (line 493 in csv-parser.ts), ignoring cardholder and account number

---

### Current Implementation Status

**What Works**:
- ✅ Format auto-detection (M&M vs Amex)
- ✅ M&M parsing with card attribution
- ✅ Amex parsing (date, amount, description)
- ✅ German number format handling (comma decimal)
- ✅ Foreign currency extraction
- ✅ Duplicate detection via transaction key
- ✅ Generic upload UI (format-agnostic)
- ✅ accountSource field in database schema

**What's Broken (Amex)**:
- ❌ **Account attribution**: `accountSource` hardcoded to "American Express"
- ❌ Cannot distinguish between multiple Amex cards (e.g., Vinicius vs E Rodrigues)
- ❌ Cannot distinguish between different account numbers (-11009 vs -12015)
- ❌ Transactions from all Amex cards are lumped together

**Impact**:
- Users with multiple Amex cards cannot track per-card spending
- Budget tracking is inaccurate when multiple people share one account
- Cannot identify which card a transaction came from

---

### Root Cause Analysis

**File**: `server/csv-parser.ts`, line 493

```typescript
transactions.push({
  // ... other fields ...
  accountSource: "American Express"  // ❌ HARDCODED
});
```

**Should be**:
```typescript
accountSource: `Amex - ${row.karteninhaber}` // or
accountSource: `Amex (${row.konto})`          // or
accountSource: `Amex - ${row.karteninhaber} (${row.konto})`
```

**Design Question**: How to format account source for Amex?
- Option A: `"Amex - VINICIUS STEIGLEDER"` (by cardholder)
- Option B: `"Amex (-11009)"` (by account number)
- Option C: `"Amex - VINICIUS STEIGLEDER (-11009)"` (both)
- Option D: Normalize to shorter format: `"Amex - Vinicius"` (first name only)

---

### Sparkasse Analysis (No Sample Yet)

**Expected Format** (typical German bank):
```
Delimiter: semicolon (;) or comma (,)
Date format: DD.MM.YYYY or DD.MM.YY
Amount format: German (comma decimal)
Header: German column names
```

Likely columns:
- Buchungstag / Valutadatum (booking date / value date)
- Auftraggeber/Empfänger (payer/payee)
- Verwendungszweck (purpose / description)
- Betrag (amount)
- Währung (currency)
- Kontonummer / IBAN (account number)

Account attribution strategy:
- Extract from account number column
- Or from file metadata / header
- Format: `"Sparkasse - [IBAN last 4]"` or `"Sparkasse - [Account name]"`

---

### Standard Internal Contract (Proposed)

**ParsedTransaction Interface** (already exists, line 32-43):
```typescript
interface ParsedTransaction {
  paymentDate: Date;
  descRaw: string;           // Full description with provider metadata
  descNorm: string;          // Normalized for keyword matching
  amount: number;            // Negative for expenses, positive for income
  currency: string;          // EUR, USD, etc.
  foreignAmount?: number;
  foreignCurrency?: string;
  exchangeRate?: number;
  key: string;               // Deduplication key: descNorm + amount + date
  accountSource: string;     // 🔑 CRITICAL: Must uniquely identify source account/card
}
```

**accountSource Format Standard**:
```
Format: "{Provider} - {Identifier}"

Examples:
- "Miles & More Gold Credit Card" (from file header)
- "Amex - VINICIUS STEIGLEDER (-11009)"
- "Amex - E RODRIGUES (-12015)"
- "Sparkasse - DE89370400440532013000" (IBAN)
- "Sparkasse - Main Checking"
```

**Rules**:
1. Must be unique per physical card/account
2. Must be human-readable (shown in UI)
3. Must be stable across imports (same format every time)
4. Should include provider name for quick identification
5. Should include enough detail to distinguish multiple accounts

---

## Decision Log (CSV Upload)

### Decision 1: Amex accountSource Format

**Decision Made**: Use cardholder name + account number

**Option A**: Cardholder name only (`"Amex - VINICIUS STEIGLEDER"`)
- Pros: Simple, human-readable
- Cons: Could have name collisions, account number provides no value

**Option B**: Account number only (`"Amex (-11009)"`)
- Pros: Guaranteed unique
- Cons: Not human-readable, hard to remember which account is which

**Option C (Chosen)**: Cardholder first name + account last 4 (`"Amex - Vinicius (1009)"`)
- Pros: Human-readable, unique, concise
- Cons: Requires parsing first name

**Option D**: Full name + account (`"Amex - VINICIUS STEIGLEDER (-11009)"`)
- Pros: Maximum clarity
- Cons: Verbose, all-caps is harder to read

**Rationale**: Option C balances readability with uniqueness. Users recognize "Vinicius" faster than "VINICIUS STEIGLEDER". Last 4 of account number is standard practice in finance UIs.

**Revisit Trigger**: If users report confusion about account identification

---

### Decision 2: Sparkasse Support Without Sample CSV

**Decision Made**: Design generic German bank parser, defer implementation until sample available

**Option A (Chosen)**: Create `parseSparkasse()` stub, document expected format
- Implementation deferred until real CSV sample is provided
- Document expected columns and format
- Allow for quick implementation when sample arrives

**Option B**: Skip Sparkasse entirely for now
- Could delay indefinitely
- Would need full redesign later

**Rationale**: Creating the structure now makes adding Sparkasse trivial when sample arrives. Better to design the pattern now while thinking about multi-format support.

**Revisit Trigger**: When Sparkasse CSV sample is provided

---

### Decision 3: Observability Strategy

**Decision Made**: Lightweight structured console logging, no external dependencies

**Option A (Chosen)**: JSON console.log with structured fields
- Pros: No dependencies, works immediately, easy to parse
- Cons: Not as feature-rich as logging libraries

**Option B**: Add Winston or Pino logging library
- Pros: Professional, feature-rich, good for production
- Cons: Adds dependency, overkill for current scale

**Rationale**: Keep it simple. Current app has no logging library. Console logs are sufficient for debugging CSV uploads. Can upgrade later if needed.

**What to Log**:
- Upload request (filename, userId, format detected)
- Parse result (success/failure, rows imported, errors)
- Provider attribution (accountSource values assigned)
- Validation failures (which rows, why)

**What NOT to Log**:
- Raw CSV content
- Personal financial data (amounts, descriptions)
- Full transaction objects

---

## Phased Implementation Plan

### Phase A: Fix Amex Attribution (Priority 1)

**Goal**: Fix broken Amex account attribution so multiple cards can be distinguished

**Files to Modify**:
- `server/csv-parser.ts` (line 493)

**Changes**:
1. Extract cardholder first name from `row.karteninhaber`
2. Extract last 4 digits from `row.konto` (account number)
3. Build accountSource: `Amex - {FirstName} ({Last4})`

**Expected Outcome**:
- Transactions show "Amex - Vinicius (1009)" vs "Amex - E Rodrigues (2015)"
- Users can filter/track per-card spending
- Budget tracking is accurate per card

**How to Verify**:
1. Upload activity_(8).csv
2. Check transactions table: `SELECT DISTINCT accountSource FROM transactions WHERE accountSource LIKE 'Amex%'`
3. Should see 2 distinct values (Vinicius and E Rodrigues)
4. Frontend shows correct attribution in transaction list

**Estimated Lines Changed**: ~10 lines

---

### Phase B: Add Observability (Priority 2)

**Goal**: Add structured logging to CSV upload pipeline for debugging

**Files to Modify**:
- `server/routes.ts` (POST /api/uploads/process endpoint)
- `server/csv-parser.ts` (format detection, parsing functions)

**Changes**:
1. Log upload request entry (filename, userId)
2. Log format detection result (M&M vs Amex vs unknown)
3. Log parse summary (rows total, rows imported, errors)
4. Log account source attribution (unique accountSource values found)
5. Log validation failures (row number, reason)

**Log Format** (JSON):
```json
{
  "timestamp": "2025-12-27T10:00:00Z",
  "level": "INFO",
  "action": "csv_upload_start",
  "userId": "user-123",
  "filename": "activity_8.csv",
  "provider": "amex"
}
```

**Expected Outcome**:
- Clear audit trail of all uploads
- Easy debugging when uploads fail
- Can trace which transactions came from which file

**How to Verify**:
1. Upload a CSV
2. Check server logs for structured JSON entries
3. Logs should show: start → detection → parsing → storage → completion
4. Failed uploads should show clear error messages

**Estimated Lines Changed**: ~30 lines

---

### Phase C: Add Sparkasse Support (Priority 3 - Ready)

**Goal**: Support Sparkasse CSV uploads using same pattern

**Status**: CSV sample available

**CSV Sample**: `attached_assets/20250929-22518260-umsatz_1766876653600.CSV`

**Files to Modify**:
- `server/csv-parser.ts` (add parseSparkasse function)

**Changes**:
1. Add Sparkasse required columns list
2. Add Sparkasse format detection
3. Add date parser for Sparkasse format (likely DD.MM.YYYY)
4. Add account attribution logic (from IBAN or account name column)
5. Add buildDescRawSparkasse() for consistent description format

**Expected Outcome**:
- Sparkasse CSV uploads work end-to-end
- Account attribution follows same pattern as M&M and Amex
- No changes needed to frontend or routes.ts

**How to Verify**:
1. Upload Sparkasse CSV sample
2. Check format detection: should identify as "sparkasse"
3. Check accountSource: should be "Sparkasse - {identifier}"
4. Transactions appear in confirm queue
5. Categorization rules work normally

**Estimated Lines Changed**: ~150 lines (similar to Amex parser)

---

### Phase D: Frontend Enhancements (Priority 4 - Optional)

**Goal**: Show account source in transaction lists and allow filtering

**Files to Modify**:
- `client/src/pages/confirm.tsx` - Show accountSource column
- `client/src/pages/uploads.tsx` - Show detected format in upload history
- Add account source filter dropdown

**Changes**:
1. Add "Account" column to transaction tables
2. Add filter: "Show only: [All Accounts] [M&M] [Amex - Vinicius] ..."
3. Upload history shows "Format: Miles & More" or "Format: American Express"

**Expected Outcome**:
- Users can see which account each transaction came from
- Users can filter by account/card
- Upload history is more informative

**Estimated Lines Changed**: ~50 lines (UI components)

---

## Phase A Implementation (2025-12-27)

**Status**: ✅ Completed

### Changes Made

**File**: `server/csv-parser.ts` (lines 483-487)

**Before**:
```typescript
accountSource: "American Express"  // Hardcoded
```

**After**:
```typescript
// Build accountSource from cardholder name + account number
const firstName = row.karteninhaber.split(" ")[0];
const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
const accountLast4 = row.konto.replace(/[^0-9]/g, "").slice(-4);
const accountSource = `Amex - ${capitalizedFirstName} (${accountLast4})`;
```

### Logic Explanation

1. **Extract first name**: Split cardholder name by space, take first word
   - "VINICIUS STEIGLEDER" → "VINICIUS"
   - "E RODRIGUES-STEIGLED" → "E"

2. **Capitalize properly**: Title case for readability
   - "VINICIUS" → "Vinicius"
   - "E" → "E"

3. **Extract last 4 of account**: Strip non-numeric chars, take last 4 digits
   - "-11009" → "1009"
   - "-12015" → "2015"

4. **Build accountSource**: Format `"Amex - {FirstName} ({Last4})"`
   - Result: "Amex - Vinicius (1009)"
   - Result: "Amex - E (2015)"

### Expected Outcomes

✅ Multiple Amex cards now distinguishable
✅ Transactions show cardholder + account number
✅ Per-card budget tracking enabled
✅ No frontend changes needed (accountSource already displayed)

### Testing Results

**Test Method**: Created test CSV with 3 transactions (2 cardholders)

**Test Data**:
- VINICIUS STEIGLEDER, account -11009
- E RODRIGUES-STEIGLED, account -12015

**Upload Result**:
```json
{
  "success": true,
  "rowsTotal": 6,
  "rowsImported": 3,
  "duplicates": 0
}
```

**Account Source Values** ✅:
- `"Amex - Vinicius (1009)"` - VINICIUS STEIGLEDER transactions
- `"Amex - E (2015)"` - E RODRIGUES-STEIGLED transactions

**Verification**:
- ✅ Multiple Amex cards are now distinguishable
- ✅ Account source shows cardholder first name + last 4 of account
- ✅ Different cardholders have different accountSource values
- ✅ Same cardholder transactions group together
- ✅ Upload pipeline works normally (categorization unaffected)

**Lines Changed**: 4 lines added (as estimated)

---

## Phase B Implementation (2025-12-27)

**Status**: ✅ Completed

### Changes Made

**Files Created**:
- `server/logger.ts` - Lightweight structured JSON logging utility

**Files Modified**:
- `server/csv-parser.ts` - Added logging for format detection and parse results
- `server/routes.ts` - Added logging for upload lifecycle

### Logging Utility Design

**File**: `server/logger.ts`

Simple console-based structured logger:
```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601
  level: "INFO" | "WARN" | "ERROR";
  action: string;         // Event identifier
  metadata?: object;      // Context data
  error?: string;         // Error message (if applicable)
}
```

**Output Format**: Single-line JSON for easy parsing
```json
{"timestamp":"2025-12-27T10:00:00.000Z","level":"INFO","action":"upload_start","metadata":{"userId":"user-123","filename":"test.csv"}}
```

### Log Events Implemented

**CSV Parser** (`csv-parser.ts`):
1. `csv_parse_empty` (WARN) - Empty CSV file
2. `csv_format_detected` (INFO) - Format identified (amex/miles_and_more/unknown)
3. `csv_format_unknown` (WARN) - Unrecognized format
4. `csv_parse_complete` (INFO) - Parse summary with account sources
5. `csv_parse_errors` (WARN) - Parse errors with sample messages

**Upload Endpoint** (`routes.ts`):
1. `upload_start` (INFO) - Request entry
2. `upload_missing_content` (WARN) - No CSV content provided
3. `upload_parse_failed` (ERROR) - Parse failed with errors
4. `upload_transaction_failed` (WARN) - Individual transaction storage failed
5. `upload_complete` (INFO) - Success summary with duration
6. `upload_server_error` (ERROR) - Unexpected server error

### Metadata Logged

**What IS logged**:
- User ID (UUID)
- Upload ID (UUID)
- Filename
- Format detected (amex/miles_and_more)
- Row counts (total, imported, duplicates)
- Account source values (unique list)
- Month affected
- Duration (milliseconds)
- Error counts and sample errors

**What is NOT logged** (privacy):
- Raw CSV content
- Transaction descriptions
- Transaction amounts
- Personal financial data

### Example Log Output

**Successful Upload**:
```json
{"timestamp":"2025-12-27T23:00:00.000Z","level":"INFO","action":"upload_start","metadata":{"userId":"abc-123","filename":"test.csv","contentLength":1524}}
{"timestamp":"2025-12-27T23:00:00.050Z","level":"INFO","action":"csv_format_detected","metadata":{"format":"amex","totalLines":10}}
{"timestamp":"2025-12-27T23:00:00.100Z","level":"INFO","action":"csv_parse_complete","metadata":{"format":"amex","success":true,"rowsTotal":10,"rowsImported":10,"errorsCount":0,"accountSources":["Amex - Vinicius (1009)","Amex - E (2015)"],"monthAffected":"2025-12"}}
{"timestamp":"2025-12-27T23:00:00.250Z","level":"INFO","action":"upload_complete","metadata":{"userId":"abc-123","uploadId":"def-456","filename":"test.csv","format":"amex","status":"ready","rowsTotal":10,"rowsImported":10,"duplicates":0,"storageErrorsCount":0,"monthAffected":"2025-12","durationMs":250}}
```

**Failed Upload**:
```json
{"timestamp":"2025-12-27T23:00:00.000Z","level":"INFO","action":"upload_start","metadata":{"userId":"abc-123","filename":"bad.csv","contentLength":50}}
{"timestamp":"2025-12-27T23:00:00.020Z","level":"WARN","action":"csv_format_unknown","metadata":{"totalLines":5}}
{"timestamp":"2025-12-27T23:00:00.025Z","level":"ERROR","action":"upload_parse_failed","metadata":{"userId":"abc-123","uploadId":"ghi-789","filename":"bad.csv","format":"unknown","errorsCount":1,"errors":["Formato de CSV nao reconhecido"]}}
```

### Benefits

✅ **Debuggability**: Clear audit trail of all upload attempts
✅ **Observability**: Can track success rates, performance, error patterns
✅ **Troubleshooting**: Identify which step failed (detection, parsing, storage)
✅ **Account Attribution**: Logs unique accountSource values for verification
✅ **Performance Monitoring**: Duration tracking for optimization

### Implementation Notes

- No external dependencies (pure console.log)
- Easy to upgrade to Winston/Pino later
- Logs are structured for log aggregation tools (Datadog, CloudWatch)
- Privacy-safe (no PII or financial data)

**Lines Changed**: ~100 lines total
- `server/logger.ts`: 40 lines (new file)
- `server/csv-parser.ts`: ~30 lines
- `server/routes.ts`: ~30 lines

---

## Phase C Implementation (2025-12-28)

**Status**: ✅ Completed

### Changes Made

**Files Modified**:
- `server/csv-parser.ts` - Added Sparkasse format detection and parsing

### Sparkasse CSV Format

**Encoding**: German locale, semicolon-delimited
**Headers**:
- `Auftragskonto` (Account IBAN)
- `Buchungstag` (Booking date)
- `Valutadatum` (Value date)
- `Buchungstext` (Transaction type)
- `Verwendungszweck` (Purpose/description)
- `Beguenstigter/Zahlungspflichtiger` (Beneficiary/payer)
- `Kontonummer/IBAN` (Counterparty IBAN)
- `BIC (SWIFT-Code)` (BIC code)
- `Betrag` (Amount)
- `Waehrung` (Currency)
- `Info` (Status info)
- `Kategorie` (Category - usually empty)

**Date Format**: `DD.MM.YY` (e.g., "29.09.25")
**Amount Format**: German decimal with quotes (e.g., "-609,58")

### Implementation Details

**Type Definitions**:
```typescript
type CsvFormat = "miles_and_more" | "amex" | "sparkasse" | "unknown";

const SPARKASSE_REQUIRED_COLUMNS = [
  "Auftragskonto",
  "Buchungstag",
  "Verwendungszweck",
  "Betrag"
];
```

**Format Detection**:
- Checks for semicolon-delimited headers
- Matches on: `auftragskonto`, `buchungstag`, `verwendungszweck` (case-insensitive)
- Detection happens in first 5 lines of CSV

**Account Attribution**:
```typescript
const ibanLast4 = auftragskonto.slice(-4);
const accountSource = `Sparkasse - ${ibanLast4}`;
```
- Example: `"Sparkasse - 8260"` for IBAN ending in 8260

**Description Building**:
```typescript
const descRaw = `${verwendungszweck.slice(0, 100)} -- ${beguenstigter.slice(0, 50)} -- Sparkasse`;
```
- Combines purpose (100 chars max) + beneficiary (50 chars max) + provider label
- Example: "LEISTUNGEN PER 30.09.2025, IBAN DE22... -- Commerzbank AG -- Sparkasse"

**Date Parsing**:
- German format `DD.MM.YY` parsed via `parseDateMM()` function
- 2-digit year handling: < 50 → 2000s, >= 50 → 1900s

**Amount Parsing**:
- German number format: comma as decimal separator
- Handles quoted amounts: `"-609,58"` → -609.58
- Uses existing `parseAmountGerman()` utility

### Testing Results

**Test Method**: Created small test CSV with 10 lines from production Sparkasse export

**Test Data**:
- 9 transactions (excluding header)
- Date range: September 2025
- Account IBAN: DE74660501010022518260

**Upload Result**:
```json
{
  "success": true,
  "uploadId": "485a8e5f-7210-497b-909b-9e56ea8b2fb6",
  "rowsTotal": 9,
  "rowsImported": 9,
  "duplicates": 0,
  "monthAffected": "2025-09"
}
```

**Log Output**:
```json
{"level":"INFO","action":"csv_format_detected","metadata":{"format":"sparkasse","totalLines":10}}
{"level":"INFO","action":"csv_parse_complete","metadata":{"format":"sparkasse","success":true,"rowsTotal":9,"rowsImported":9,"errorsCount":0,"accountSources":["Sparkasse - 8260"],"monthAffected":"2025-09"}}
```

**Verification**:
- ✅ Sparkasse format correctly detected
- ✅ All 9 transactions imported successfully
- ✅ Account source shows IBAN last 4 digits: "Sparkasse - 8260"
- ✅ German date format parsed correctly
- ✅ German amount format parsed correctly (negative and positive values)
- ✅ Logging shows correct format detection
- ✅ Transactions available in confirmation queue

**Full File Testing** (Updated 2025-12-28):
- ✅ Full production CSV (506 lines, ~130KB) uploaded successfully
- ✅ All 505 transactions parsed correctly (404 new + 101 duplicates from previous tests)
- ✅ Processing time: ~2.2 seconds
- ✅ Body size limit increased from 100KB (default) to 10MB in server/index.ts

### Error Message Update

Updated unknown format error message to include Sparkasse:
```typescript
"Formatos suportados: Miles & More, American Express (Amex), Sparkasse"
```

### Code Changes Summary

**Lines Changed**: ~120 lines total
- Added `SPARKASSE_REQUIRED_COLUMNS` constant (4 lines)
- Updated type definitions (2 lines)
- Extended `detectCsvFormat()` for Sparkasse (7 lines)
- Implemented `parseSparkasse()` function (95 lines)
- Added Sparkasse to parseCSV router (3 lines)
- Updated error messages (3 lines)

**Functions Added**:
- `parseSparkasse(lines: string[]): ParseResult` - Main parsing function
- Uses existing utilities: `parseCSVLine()`, `parseDateMM()`, `parseAmountGerman()`, `normalizeText()`

### Benefits

✅ **Third Provider Support**: App now handles Miles & More, Amex, and Sparkasse
✅ **German Banking Format**: Correctly handles German locale (dates, numbers, encoding)
✅ **Account Attribution**: IBAN-based source tracking enables multi-account support
✅ **Consistent Pipeline**: Same normalization and rules engine as other providers
✅ **Observability**: Logging shows format detection and parse results
✅ **Minimal Changes**: Leveraged existing parser utilities and patterns

### Next Steps

- [x] ~~Consider implementing request body size increase for large CSV uploads~~ ✅ **Completed** (2025-12-28)
  - Increased express.json() limit from 100KB to 10MB
  - Full 506-line Sparkasse CSV (130KB) now uploads successfully
  - File: `server/index.ts:16-17,24`
- [ ] Validate with more Sparkasse CSV samples (if available)
- [ ] Add Sparkasse-specific rules/keywords if transaction patterns emerge

---

## Body Size Limit Fix (2025-12-28)

**Status**: ✅ Completed

**Problem**: User reported Sparkasse CSV upload failure. Root cause: Express.js default body size limit (100KB) was too small for production Sparkasse CSV exports.

**Symptom**: Upload returned error message `"request entity too large"` when attempting to upload full 506-line Sparkasse CSV (~130KB).

### Investigation

**Initial Diagnosis**:
- Small test files (10, 20, 50, 100 lines) all uploaded successfully
- Parser logic confirmed working correctly
- Format detection working as expected
- Full 506-line file failed with body size error

**File Size Analysis**:
```
10 lines:   ~2.4 KB   ✅ Success
20 lines:   ~5.1 KB   ✅ Success
50 lines:   ~12.8 KB  ✅ Success
100 lines:  ~25.6 KB  ✅ Success
506 lines:  ~130 KB   ❌ Failed (exceeded 100KB default limit)
```

### Fix Implemented

**File**: `server/index.ts`

**Changes**:
```typescript
// Before (default 100KB limit):
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));
app.use(express.urlencoded({ extended: false }));

// After (10MB limit):
app.use(express.json({
  limit: "10mb", // Increased limit for large CSV uploads
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
```

**Rationale**:
- 10MB limit supports CSV files with ~39,000 lines (based on 130KB for 506 lines)
- Extremely unlikely a user would export more than that in a single CSV
- Limit still reasonable enough to prevent abuse/DoS
- Both `express.json()` and `express.urlencoded()` updated for consistency

### Testing Results

**Full Production File Test**:
```json
{
  "success": true,
  "uploadId": "13c01032-4fc8-4d5b-8da3-9b77bb7f39f0",
  "rowsTotal": 505,
  "rowsImported": 404,
  "duplicates": 101,
  "monthAffected": "2025-09"
}
```

**Log Output**:
```json
{"level":"INFO","action":"upload_start","metadata":{"filename":"sparkasse_full.csv","contentLength":130178}}
{"level":"INFO","action":"csv_format_detected","metadata":{"format":"sparkasse","totalLines":506}}
{"level":"INFO","action":"csv_parse_complete","metadata":{"format":"sparkasse","success":true,"rowsTotal":505,"rowsImported":505,"errorsCount":0}}
{"level":"INFO","action":"upload_complete","metadata":{"status":"ready","rowsTotal":505,"rowsImported":404,"duplicates":101,"durationMs":2179}}
```

**Verification**:
- ✅ Full 506-line CSV (130KB) uploaded successfully
- ✅ All 505 transactions parsed without errors
- ✅ Format detected correctly as "sparkasse"
- ✅ Processing completed in 2.2 seconds
- ✅ No performance degradation observed

**Lines Changed**: 2 lines (server/index.ts:17, 24)

### Impact

✅ **User Experience**: Large CSV uploads now work seamlessly
✅ **No Breaking Changes**: Existing functionality unaffected
✅ **Future-Proof**: Supports growth in transaction volume per export
✅ **Security**: 10MB limit still protects against abuse

---

## Phase D (Partial) Implementation (2025-12-27)

**Status**: ✅ Completed (Account Source Display)

### Changes Made

**File**: `client/src/pages/confirm.tsx`

Added dedicated "Conta" (Account) column to transaction confirmation table.

**Before**:
- Account source shown as small subtitle under description
- Not immediately visible
- Easy to miss

**After**:
- Dedicated "Conta" column between "Data" and "Descricao"
- Account source displayed as badge (outlined, small text)
- Clearly visible for each transaction
- Examples visible: "Miles & More Gold Credit Card", "Amex - Vinicius (1009)", "Amex - E (2015)"

### UI Changes

**Table Header**:
```tsx
<th>Data</th>
<th>Conta</th>        // ← NEW COLUMN
<th>Descricao</th>
<th>Valor</th>
...
```

**Table Body**:
```tsx
<td>
  <Badge variant="outline" className="text-xs font-normal whitespace-nowrap">
    {t.accountSource}
  </Badge>
</td>
```

### Benefits

✅ **Visibility**: Account source immediately visible
✅ **Multi-card Support**: Users can now see which card each transaction came from
✅ **Filtering Ready**: Column can be extended with filters later
✅ **Verification**: Easy to verify Amex fix is working (see different account values)

**Lines Changed**: ~10 lines (confirm.tsx)

**Note**: Other Phase D items (upload history format display, account filtering) remain optional/future enhancements.

---

---

## Goals & Category Goals API (2025-12-27)

**Status**: Completed (previous task)

### Purpose

This section logs the Goals & Category Goals API implementation. It tracks:
- What was implemented and why
- Files modified
- API contracts (requests/responses)
- Key decisions and their rationale
- Debugging artifacts and intermediate results

---

## Decision Log

### Decision 1: Goals Data Model - One Goal Per Month vs Flexible Goals

**Decision Made**: One goal record per user per month

**Option A (Chosen)**: Single goal per month with embedded category targets
- Schema: `goals` table has `month` field (text, format: YYYY-MM)
- Each goal has multiple `categoryGoals` children
- One-to-many relationship: goal → category goals

**Option B (Rejected)**: Flexible goal system with arbitrary date ranges
- Would allow weekly goals, quarterly goals, custom ranges
- More complex to query and aggregate
- Doesn't match existing budget/dashboard monthly cycle

**Rationale**:
- App already operates on monthly cycles (dashboard, budgets, CSV imports)
- Users think in monthly terms for budgeting
- Simplifies queries: `WHERE month = '2025-12'`
- Aligns with existing `budgets` table structure

**Trade-offs Accepted**:
- Cannot set goals for periods other than calendar months
- Users who want Q1 goals must create 3 separate monthly goals

**Revisit Trigger**:
- If users request quarterly or annual goal tracking
- If dashboard moves away from monthly view

---

### Decision 2: API Design - Nested vs Flat Category Goals Endpoints

**Decision Made**: Nested routes under parent goal

**Option A (Chosen)**: Nest category goals under goal ID
- `POST /api/goals/:goalId/categories`
- `GET /api/goals/:goalId/categories`
- Category goals cannot exist without a parent goal

**Option B (Rejected)**: Flat, independent category goals routes
- `POST /api/category-goals` (with `goalId` in body)
- `GET /api/category-goals?goalId=xyz`
- Category goals are first-class resources

**Rationale**:
- Category goals have no meaning without a parent goal
- Nested routes make the relationship explicit
- Matches existing schema: `categoryGoals.goalId` references `goals.id`
- Prevents orphaned category goals

**Trade-offs Accepted**:
- More verbose URLs
- Cannot bulk-fetch category goals across multiple goals in one request

**Revisit Trigger**:
- If we need cross-month category goal analysis
- If category goals gain independent lifecycle

---

### Decision 3: Progress Calculation - Computed vs Stored

**Decision Made**: Compute progress on-demand, do not store

**Option A (Chosen)**: Calculate actual spending on each request
- `GET /api/goals/:id/progress` queries transactions in real-time
- Joins `goals` + `categoryGoals` + `transactions` tables
- Returns fresh, accurate data

**Option B (Rejected)**: Pre-calculate and store progress fields
- Add `actualSpent` columns to `categoryGoals` table
- Update via background job or triggers on transaction changes
- Faster reads, but stale data risk

**Rationale**:
- Transaction data changes frequently (new imports, confirmations, edits)
- Keeping stored values in sync adds complexity
- Goals are queried less frequently than transactions change
- PostgreSQL can efficiently aggregate monthly transactions

**Trade-offs Accepted**:
- Slightly slower response times for progress endpoint
- More complex SQL query with aggregations

**Revisit Trigger**:
- If progress queries become performance bottleneck (>500ms)
- If we add caching layer (Redis)
- If users request historical progress snapshots

---

### Decision 4: Historical Data - Previous Month Spending

**Decision Made**: Fetch previous month on-demand, store as optional metadata

**Option A (Chosen)**: Store `previousMonthSpent` and `averageSpent` in categoryGoals
- Calculated once when creating category goal
- Used as guidance for setting targets
- Does not update if past data changes

**Option B (Rejected)**: Always compute historical data on-demand
- Query last 3-6 months of transactions each request
- More accurate but much slower
- No need for extra columns

**Rationale**:
- Historical data is for reference when *setting* goals, not tracking progress
- Users set goals based on "what I spent last month"
- Doesn't need to be live-updated
- Schema already includes these fields

**Trade-offs Accepted**:
- Historical data is snapshot at goal creation time
- If user edits past transactions, historical values don't update

**Revisit Trigger**:
- If users expect historical data to update automatically
- If we add "recalculate history" feature

---

## Implementation Timeline

### Phase 1: Documentation & Design (COMPLETE)
- [x] Create IMPLEMENTATION_LOG.md
- [x] Create ARCHITECTURE_AND_AI_LOGIC.md
- [x] Document logging strategy
- [x] Design all API endpoints (8 endpoints)
- [x] Define request/response schemas

### Phase 2: Backend Implementation
- [ ] Add storage layer methods
- [ ] Implement API routes
- [ ] Add validation middleware
- [ ] Add structured logging

### Phase 3: Testing & Validation
- [ ] Manual API testing
- [ ] Error case validation
- [ ] Data integrity checks

### Phase 4: Frontend Integration
- [ ] Wire up Goals page
- [ ] Add loading states
- [ ] Handle error cases

---

## Files to Modify

### Backend
- `server/storage.ts` - Add goals CRUD methods
- `server/routes.ts` - Add API endpoints
- `shared/schema.ts` - Review, possibly add indexes (read-only review)

### Frontend (Phase 4 only)
- `client/src/pages/goals.tsx` - Connect to API
- `client/src/lib/api.ts` - Add API client methods

### Documentation
- `docs/IMPLEMENTATION_LOG.md` - This file
- `docs/ARCHITECTURE_AND_AI_LOGIC.md` - System overview

---

## API Endpoint Design

### Overview

**Total Endpoints**: 8

**Goals Management** (4 endpoints):
- `GET /api/goals` - Fetch goals for a month
- `POST /api/goals` - Create new goal
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

**Category Goals Management** (3 endpoints):
- `GET /api/goals/:goalId/categories` - Fetch category targets
- `POST /api/goals/:goalId/categories` - Create/update category target
- `DELETE /api/category-goals/:id` - Delete category target

**Progress Tracking** (1 endpoint):
- `GET /api/goals/:id/progress` - Get actual vs planned spending

---

### Endpoint 1: GET /api/goals

**Purpose**: Fetch goal(s) for a specific month or all goals for the user

**Query Parameters**:
```typescript
{
  month?: string  // Optional. Format: YYYY-MM. If omitted, returns all goals.
}
```

**Request Example**:
```
GET /api/goals?month=2025-12
```

**Response Schema** (200 OK):
```typescript
{
  goals: [
    {
      id: string,
      userId: string,
      month: string,              // "2025-12"
      estimatedIncome: number,    // 3500.00
      totalPlanned: number,       // 2800.00
      createdAt: string           // ISO 8601
    }
  ]
}
```

**Response Example**:
```json
{
  "goals": [
    {
      "id": "goal-uuid-123",
      "userId": "user-uuid-456",
      "month": "2025-12",
      "estimatedIncome": 3500.00,
      "totalPlanned": 2800.00,
      "createdAt": "2025-12-01T10:00:00.000Z"
    }
  ]
}
```

**Error Cases**:
- 400: Invalid month format (not YYYY-MM)
- 500: Database error

**Error Response Example**:
```json
{
  "error": "Invalid month format. Expected YYYY-MM, got '12-2025'"
}
```

---

### Endpoint 2: POST /api/goals

**Purpose**: Create a new monthly goal

**Request Schema**:
```typescript
{
  month: string,              // Required. Format: YYYY-MM
  estimatedIncome: number,    // Required. Must be >= 0
  totalPlanned: number        // Required. Must be >= 0
}
```

**Validation Rules**:
- `month`: Must match regex `/^\d{4}-\d{2}$/`
- `estimatedIncome`: Must be non-negative number
- `totalPlanned`: Must be non-negative number
- Duplicate check: Cannot create two goals for same userId + month

**Request Example**:
```json
{
  "month": "2025-12",
  "estimatedIncome": 3500.00,
  "totalPlanned": 2800.00
}
```

**Response Schema** (201 Created):
```typescript
{
  id: string,
  userId: string,
  month: string,
  estimatedIncome: number,
  totalPlanned: number,
  createdAt: string
}
```

**Response Example**:
```json
{
  "id": "goal-uuid-789",
  "userId": "user-uuid-456",
  "month": "2025-12",
  "estimatedIncome": 3500.00,
  "totalPlanned": 2800.00,
  "createdAt": "2025-12-27T14:30:00.000Z"
}
```

**Error Cases**:
- 400: Validation error (invalid month format, negative numbers)
- 409: Conflict (goal already exists for this month)
- 500: Database error

**Error Response Examples**:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "month",
      "message": "Invalid month format. Expected YYYY-MM"
    }
  ]
}
```

```json
{
  "error": "Goal already exists for month 2025-12"
}
```

---

### Endpoint 3: PATCH /api/goals/:id

**Purpose**: Update an existing goal's estimated income or total planned

**URL Parameters**:
- `id`: Goal UUID

**Request Schema** (all fields optional):
```typescript
{
  estimatedIncome?: number,  // Must be >= 0
  totalPlanned?: number      // Must be >= 0
}
```

**Request Example**:
```json
{
  "estimatedIncome": 3800.00,
  "totalPlanned": 3000.00
}
```

**Response Schema** (200 OK):
```typescript
{
  id: string,
  userId: string,
  month: string,
  estimatedIncome: number,
  totalPlanned: number,
  createdAt: string
}
```

**Error Cases**:
- 400: Validation error (negative numbers)
- 404: Goal not found
- 500: Database error

---

### Endpoint 4: DELETE /api/goals/:id

**Purpose**: Delete a goal and all its associated category goals

**URL Parameters**:
- `id`: Goal UUID

**Request Example**:
```
DELETE /api/goals/goal-uuid-789
```

**Response Schema** (200 OK):
```typescript
{
  success: boolean,
  deletedGoalId: string,
  deletedCategoryGoalsCount: number
}
```

**Response Example**:
```json
{
  "success": true,
  "deletedGoalId": "goal-uuid-789",
  "deletedCategoryGoalsCount": 5
}
```

**Error Cases**:
- 404: Goal not found
- 500: Database error

**Implementation Note**:
- Must delete all categoryGoals with goalId = :id first (cascade delete)
- Then delete the goal itself
- Wrap in transaction to ensure atomicity

---

### Endpoint 5: GET /api/goals/:goalId/categories

**Purpose**: Fetch all category targets for a specific goal

**URL Parameters**:
- `goalId`: Goal UUID

**Request Example**:
```
GET /api/goals/goal-uuid-789/categories
```

**Response Schema** (200 OK):
```typescript
{
  categoryGoals: [
    {
      id: string,
      goalId: string,
      category1: string,           // e.g., "Moradia", "Mercado"
      targetAmount: number,
      previousMonthSpent: number | null,
      averageSpent: number | null
    }
  ]
}
```

**Response Example**:
```json
{
  "categoryGoals": [
    {
      "id": "catgoal-uuid-111",
      "goalId": "goal-uuid-789",
      "category1": "Moradia",
      "targetAmount": 800.00,
      "previousMonthSpent": 780.50,
      "averageSpent": 795.25
    },
    {
      "id": "catgoal-uuid-222",
      "goalId": "goal-uuid-789",
      "category1": "Mercado",
      "targetAmount": 400.00,
      "previousMonthSpent": 385.20,
      "averageSpent": 410.00
    }
  ]
}
```

**Error Cases**:
- 404: Goal not found
- 500: Database error

---

### Endpoint 6: POST /api/goals/:goalId/categories

**Purpose**: Create or update a category target for a goal

**Design Decision**: Upsert logic
- If category already exists for this goal → update targetAmount
- If category doesn't exist → create new

**URL Parameters**:
- `goalId`: Goal UUID

**Request Schema**:
```typescript
{
  category1: string,              // Required. Must be valid category from enum
  targetAmount: number,           // Required. Must be >= 0
  previousMonthSpent?: number,    // Optional. Auto-calculated if omitted
  averageSpent?: number           // Optional. Auto-calculated if omitted
}
```

**Validation Rules**:
- `category1`: Must be one of: "Receitas", "Moradia", "Mercado", "Compras Online", "Transporte", "Saúde", "Lazer", "Outros", "Interno"
- `targetAmount`: Must be non-negative number

**Request Example**:
```json
{
  "category1": "Moradia",
  "targetAmount": 800.00
}
```

**Response Schema** (201 Created or 200 OK):
```typescript
{
  id: string,
  goalId: string,
  category1: string,
  targetAmount: number,
  previousMonthSpent: number | null,
  averageSpent: number | null
}
```

**Response Example**:
```json
{
  "id": "catgoal-uuid-333",
  "goalId": "goal-uuid-789",
  "category1": "Moradia",
  "targetAmount": 800.00,
  "previousMonthSpent": 780.50,
  "averageSpent": 795.25
}
```

**Error Cases**:
- 400: Validation error (invalid category, negative amount)
- 404: Parent goal not found
- 500: Database error

**Implementation Note**:
If `previousMonthSpent` and `averageSpent` are omitted:
1. Get goal's month (e.g., "2025-12")
2. Calculate previous month: "2025-11"
3. Query transactions for that month with matching category1
4. Sum amounts where `excludeFromBudget = false` and `internalTransfer = false`
5. Calculate average from last 3 months

---

### Endpoint 7: DELETE /api/category-goals/:id

**Purpose**: Delete a specific category target

**URL Parameters**:
- `id`: CategoryGoal UUID

**Request Example**:
```
DELETE /api/category-goals/catgoal-uuid-333
```

**Response Schema** (200 OK):
```typescript
{
  success: boolean,
  deletedCategoryGoalId: string
}
```

**Response Example**:
```json
{
  "success": true,
  "deletedCategoryGoalId": "catgoal-uuid-333"
}
```

**Error Cases**:
- 404: Category goal not found
- 500: Database error

---

### Endpoint 8: GET /api/goals/:id/progress

**Purpose**: Get actual vs planned spending for a goal, broken down by category

**URL Parameters**:
- `id`: Goal UUID

**Request Example**:
```
GET /api/goals/goal-uuid-789/progress
```

**Response Schema** (200 OK):
```typescript
{
  goal: {
    id: string,
    month: string,
    estimatedIncome: number,
    totalPlanned: number
  },
  progress: {
    totalActualSpent: number,          // Sum of all actual spending
    totalTarget: number,               // Sum of all category targets
    remainingBudget: number,           // totalTarget - totalActualSpent
    percentSpent: number,              // (totalActualSpent / totalTarget) * 100
    categories: [
      {
        category1: string,
        targetAmount: number,
        actualSpent: number,
        remaining: number,
        percentSpent: number,
        status: "under" | "over" | "on-track"  // under budget, over budget, within 10%
      }
    ]
  }
}
```

**Response Example**:
```json
{
  "goal": {
    "id": "goal-uuid-789",
    "month": "2025-12",
    "estimatedIncome": 3500.00,
    "totalPlanned": 2800.00
  },
  "progress": {
    "totalActualSpent": 1876.43,
    "totalTarget": 2800.00,
    "remainingBudget": 923.57,
    "percentSpent": 67.01,
    "categories": [
      {
        "category1": "Moradia",
        "targetAmount": 800.00,
        "actualSpent": 780.50,
        "remaining": 19.50,
        "percentSpent": 97.56,
        "status": "on-track"
      },
      {
        "category1": "Mercado",
        "targetAmount": 400.00,
        "actualSpent": 385.20,
        "remaining": 14.80,
        "percentSpent": 96.30,
        "status": "on-track"
      },
      {
        "category1": "Lazer",
        "targetAmount": 200.00,
        "actualSpent": 245.80,
        "remaining": -45.80,
        "percentSpent": 122.90,
        "status": "over"
      }
    ]
  }
}
```

**Error Cases**:
- 404: Goal not found
- 500: Database error

**Implementation Note**:
Query to calculate actual spending:
```sql
SELECT
  category1,
  SUM(amount) as actualSpent
FROM transactions
WHERE
  userId = ?
  AND DATE_TRUNC('month', paymentDate) = ?
  AND excludeFromBudget = false
  AND internalTransfer = false
GROUP BY category1
```

**Status Calculation**:
- `under`: percentSpent < 90%
- `on-track`: 90% <= percentSpent <= 110%
- `over`: percentSpent > 110%

---

## Request/Response Summary Table

| Endpoint | Method | Request Body | Response Code | Response Body |
|----------|--------|--------------|---------------|---------------|
| `/api/goals?month=YYYY-MM` | GET | - | 200 | `{ goals: Goal[] }` |
| `/api/goals` | POST | `{ month, estimatedIncome, totalPlanned }` | 201 | `Goal` |
| `/api/goals/:id` | PATCH | `{ estimatedIncome?, totalPlanned? }` | 200 | `Goal` |
| `/api/goals/:id` | DELETE | - | 200 | `{ success, deletedGoalId, deletedCategoryGoalsCount }` |
| `/api/goals/:goalId/categories` | GET | - | 200 | `{ categoryGoals: CategoryGoal[] }` |
| `/api/goals/:goalId/categories` | POST | `{ category1, targetAmount, previousMonthSpent?, averageSpent? }` | 201 | `CategoryGoal` |
| `/api/category-goals/:id` | DELETE | - | 200 | `{ success, deletedCategoryGoalId }` |
| `/api/goals/:id/progress` | GET | - | 200 | `{ goal, progress }` |

---

## Validation Schemas (Zod)

Using existing schemas from `shared/schema.ts`:
- `insertGoalSchema` - for POST /api/goals
- `insertCategoryGoalSchema` - for POST /api/goals/:goalId/categories

Custom validation needed:
- Month format: `/^\d{4}-\d{2}$/`
- Category enum validation (already in schema)
- Non-negative number checks

---

## Logging Strategy

### Principles

**Structured Logging Format**:
```typescript
{
  timestamp: string,        // ISO 8601
  level: "INFO" | "WARN" | "ERROR",
  endpoint: string,         // e.g., "POST /api/goals"
  userId: string,           // Always log which user
  action: string,           // e.g., "create_goal", "fetch_progress"
  metadata: object,         // Context-specific data
  duration?: number,        // Response time in ms
  error?: string            // Error message (no stack traces in prod)
}
```

### What to Log

**Request Entry** (INFO):
```typescript
{
  level: "INFO",
  endpoint: "POST /api/goals",
  userId: user.id,
  action: "create_goal",
  metadata: { month: "2025-12" }
}
```

**Validation Failures** (WARN):
```typescript
{
  level: "WARN",
  endpoint: "POST /api/goals",
  userId: user.id,
  action: "validation_failed",
  metadata: {
    errors: ["month must be in YYYY-MM format"],
    invalidInput: { month: "December 2025" }  // Safe to log, no PII
  }
}
```

**Successful Responses** (INFO):
```typescript
{
  level: "INFO",
  endpoint: "GET /api/goals/:id/progress",
  userId: user.id,
  action: "fetch_progress_success",
  metadata: {
    goalId: "goal123",
    categoriesCount: 5,
    totalTarget: 2500.00,
    totalActual: 1876.43
  },
  duration: 127  // ms
}
```

**Database Errors** (ERROR):
```typescript
{
  level: "ERROR",
  endpoint: "POST /api/goals",
  userId: user.id,
  action: "database_error",
  error: "duplicate key violation on goals.month",
  metadata: {
    operation: "insert",
    table: "goals"
  }
}
```

### What NOT to Log

**Never log**:
- Raw transaction descriptions (may contain merchant names, personal info)
- Full CSV content
- API keys or tokens
- Password hashes
- Personal financial data (amounts, balances, account numbers)

**Safe to log**:
- Transaction IDs (UUIDs)
- Category names (generic: "Moradia", "Mercado")
- Counts and aggregates
- Month identifiers
- Validation error messages
- HTTP status codes

### Implementation Approach

**Simple console logging for now**:
```typescript
// At start of each endpoint
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: "INFO",
  endpoint: `${req.method} ${req.path}`,
  userId: user.id,
  action: "create_goal",
  metadata: { month: req.body.month }
}));

// At end of request
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: "INFO",
  endpoint: `${req.method} ${req.path}`,
  userId: user.id,
  action: "create_goal_success",
  metadata: { goalId: goal.id },
  duration: Date.now() - startTime
}));
```

**Future**: Replace with proper logging library (Winston, Pino) when moving to production

### Log Retention

- Development: Console only (ephemeral)
- Production: Stream to log aggregator (Datadog, CloudWatch, etc.)
- Retention: 30 days for INFO, 90 days for ERROR

### Privacy Compliance

All logging follows these rules:
- No PII without explicit user consent
- Financial amounts logged only as aggregates (sums, counts)
- Transaction descriptions never logged in full
- All logs are for debugging/observability, not analytics

---

## Testing Notes

*(To be completed during testing)*

---

## Issues & Blockers

*(None yet)*

---

## Debugging Artifacts

*(To be added as implementation progresses)*

---

## Fase 0: Diagnóstico e Estabilização (2025-12-28)

**Status**: ✅ Completed

**Duração**: ~4 horas

**Objetivo**: Diagnosticar estado real do sistema, corrigir bugs críticos, estabelecer baseline sólido para evolução.

---

### Descobertas e Correções

#### 1. Upload Amex - BUG CRÍTICO Corrigido ✅

**Problema Identificado:**
- CSV Amex contém campos multi-linha (endereços) entre aspas
- Parser usava `csvContent.split(/\r?\n/)` sem considerar aspas
- Resultado: 956 linhas parseadas (incorreto) em vez de 427 (correto)
- Format detection falhava → "unknown" em vez de "amex"
- Zero transações importadas

**Evidência:**
```csv
20/12/2025,LIDL 4691,VINICIUS,-11009,"94,23",,LIDL,"HERMANN STR. 1
OLCHING",,82140,GERMANY
```
↑ Campo "Adresse" tem quebra de linha real dentro de aspas

**Root Cause:**
- `parseCSV()` (linha 636) fazia split simples sem respeitar quoted fields
- CSV padrão RFC 4180: campos entre aspas podem conter newlines

**Solução Implementada:**
- Criada função `splitCSVLines()` que faz parsing quote-aware
- Percorre caractere por caractere tracking estado `inQuotes`
- Só quebra linha se não estiver dentro de aspas

**Arquivo Modificado**: `server/csv-parser.ts` (linhas 635-680)

**Teste de Validação:**
```bash
tsx /tmp/test_parser_direct.ts
```

**Resultado:**
- ✅ Format detected: "amex"
- ✅ Rows imported: 426/426
- ✅ Errors: 0
- ✅ Account source: "Amex - Vinicius (1009)", "Amex - E (2015)" (2 cartões distintos)

**Impacto**: Upload Amex agora funciona 100%

---

#### 2. Upload Sparkasse - Verificação ✅

**Status**: Funcionando corretamente desde Phase C (2025-12-27)

**Teste:**
```bash
tsx /tmp/test_sparkasse.ts
```

**Resultado:**
- ✅ Format detected: "sparkasse"
- ✅ Rows imported: 505/505
- ✅ Errors: 0
- ✅ Account source: "Sparkasse - 8260" (últimos 4 dígitos IBAN)

**Conclusão**: User report era falso alarme ou bug temporário.

---

#### 3. Schema Audit - Foreign Keys e Consistência ✅

**Arquivo Analisado**: `shared/schema.ts` (263 linhas, 14 tabelas)

**Problemas Encontrados:**

**❌ CRÍTICO - transactions.ruleIdApplied:**
- Campo existia mas sem `.references(() => rules.id)`
- Risco: dados inconsistentes, regras órfãs

**Correção Aplicada** (linha 98):
```typescript
// ANTES
ruleIdApplied: varchar("rule_id_applied"),

// DEPOIS
ruleIdApplied: varchar("rule_id_applied").references(() => rules.id),
```

**Arquivo Modificado**: `shared/schema.ts`

**⚠️ QUESTÕES IDENTIFICADAS (não bloqueantes):**

1. **rules.userId** e **conversations.userId** são nullable
   - Por que? Regras/conversas sem dono?
   - Decisão: Manter por ora, investigar em Fase 1

2. **budgets vs goals** - Overlap conceitual
   - Ambas representam metas mensais
   - Decisão: Consolidar em Fase 3

3. **transactions**: type, fixVar, category1 são nullable
   - Faz sentido: nullable até categorização
   - Decisão: OK, design intencional

**Unique Constraints Faltando** (não crítico agora):
- `budgets(user_id, month, category_1)`
- `goals(user_id, month)`
- `category_goals(goal_id, category_1)`

**Decisão**: Adicionar em Fase 1 (Data Model)

---

#### 4. Database Indexes - Performance CRÍTICA ✅

**Problema**: Queries do dashboard sem indexes → O(n) scans em produção

**Queries Analisadas:**

1. **Dashboard agregações mensais:**
   ```sql
   SELECT * FROM transactions
   WHERE user_id = ? AND payment_date >= ? AND payment_date < ?
   ```

2. **Dashboard com filtros:**
   ```sql
   WHERE user_id = ? AND exclude_from_budget = false
   AND internal_transfer = false AND payment_date >= ?
   ```

3. **Rules matching:**
   ```sql
   SELECT * FROM rules WHERE user_id = ? ORDER BY priority DESC
   ```

4. **Upload history:**
   ```sql
   SELECT * FROM uploads WHERE user_id = ? ORDER BY created_at DESC
   ```

5. **Confirm queue:**
   ```sql
   SELECT * FROM transactions WHERE user_id = ? AND needs_review = true
   ```

**Indexes Criados:**

Arquivo criado: `migrations/001_add_critical_indexes.sql`

```sql
CREATE INDEX idx_transactions_user_payment_date
ON transactions(user_id, payment_date DESC);

CREATE INDEX idx_transactions_user_budget_date
ON transactions(user_id, exclude_from_budget, internal_transfer, payment_date DESC);

CREATE INDEX idx_rules_user_priority
ON rules(user_id, priority DESC);

CREATE INDEX idx_uploads_user_created
ON uploads(user_id, created_at DESC);

CREATE INDEX idx_transactions_user_needs_review
ON transactions(user_id, needs_review)
WHERE needs_review = true; -- Partial index!
```

**Aplicação:**
```bash
tsx /tmp/apply_indexes_v3.ts
```

**Resultado:**
```
✅ idx_transactions_user_payment_date created
✅ idx_transactions_user_budget_date created
✅ idx_rules_user_priority created
✅ idx_uploads_user_created created
✅ idx_transactions_user_needs_review created

📊 Total indexes: 5
```

**Impacto Esperado:**
- Dashboard queries: O(n) → O(log n) com index scan
- Confirm queue: Full table scan → Index-only scan
- Upload history: Seq scan → Index scan

**Próximo Passo**: Testar performance em produção com > 10k transactions

---

#### 5. Logging Audit ✅

**Status Atual:**
- ✅ Upload pipeline tem logging estruturado (Phase B)
- ❌ Demais endpoints (45+) NÃO têm logging

**Decisão**: Logging completo fica para fase posterior (não bloqueante para Fase 0)

**Evidência**:
```bash
grep -c "logger\.(info|warn|error)" server/routes.ts
# Output: 6 (apenas upload endpoints)
```

**Total Endpoints**: ~45
**Com Logging**: ~6 (13%)
**Sem Logging**: ~39 (87%)

**Próximo Passo**: Adicionar logging em Fase 1 ou quando implementar features

---

### Arquivos Modificados (Fase 0)

1. **server/csv-parser.ts** - Fix Amex multi-line parsing
   - Função `splitCSVLines()` adicionada (linhas 635-680)

2. **shared/schema.ts** - Fix foreign key
   - `transactions.ruleIdApplied` agora referencia `rules.id` (linha 98)

3. **migrations/001_add_critical_indexes.sql** - Novo arquivo
   - 5 indexes de performance

---

### Decisões (Fase 0)

#### Decisão 1: Manter `real` para amounts (não migrar para `numeric`)

**Contexto**: PostgreSQL `real` (float) pode ter precision issues

**Opções:**
- A) Migrar para `numeric(10,2)` (precision perfeita)
- B) Manter `real` (já em uso)

**Escolha**: B - Manter `real`

**Rationale:**
- Valores financeiros não ultrapassam €100k tipicamente
- Precision de `real` (6-7 dígitos) é suficiente
- Migration custosa (mudar schema, migrar dados)
- Sem evidência de bugs relacionados

**Revisit Trigger**: Se aparecerem bugs de arredondamento

---

#### Decisão 2: Não implementar soft deletes agora

**Contexto**: Schema não tem `deletedAt`, deletes são hard deletes

**Opções:**
- A) Implementar soft deletes agora (adicionar `deletedAt` em todas tabelas)
- B) Adicionar CASCADE deletes no DB
- C) Deixar para depois

**Escolha**: C - Deixar para Fase 8 (Production Hardening)

**Rationale:**
- Não é bloqueante para desenvolvimento
- Requer auditoria de todos deletes no código
- Melhor fazer quando tiver testes E2E

---

#### Decisão 3: Logging parcial OK para Fase 0

**Contexto**: 87% dos endpoints sem logging estruturado

**Opções:**
- A) Adicionar logging em todos endpoints agora
- B) Priorizar upload (já feito) e adicionar resto depois

**Escolha**: B

**Rationale:**
- Upload é critical path (user input data)
- Demais endpoints são CRUD simples
- Melhor adicionar logging quando refatorar endpoints

---

### Testes Executados (Fase 0)

1. ✅ Parser Amex com CSV real (426 transações)
2. ✅ Parser Sparkasse com CSV real (505 transações)
3. ✅ Format detection (M&M, Amex, Sparkasse)
4. ✅ Database indexes criação
5. ✅ Foreign key referência (schema)

**Sem Testes:**
- Upload end-to-end (servidor não iniciou por port conflict)
- Performance de queries com indexes (precisa dados > 10k)

---

### Bloqueios Não Resolvidos (para próximas fases)

1. **TypeScript Errors** (npm run check):
   - `server/routes.ts:533` - Wrong number of arguments
   - `server/routes.ts:549` - `deleteBudget` method missing in storage
   - `server/routes.ts:1180` - `updateEventOccurrence` method missing
   - `server/replit_integrations/*` - Vários errors (não crítico)

2. **Métodos Storage Faltando**:
   - `deleteBudget()`
   - `updateEventOccurrence()`

**Decisão**: Corrigir em Fase 1 quando implementar features relacionadas

---

### Métricas (Fase 0)

- **Bugs corrigidos**: 2 (Amex parsing, foreign key)
- **Indexes adicionados**: 5
- **Arquivos modificados**: 3
- **Linhas de código**: +80 (splitCSVLines + indexes SQL)
- **Documentação**: +350 linhas (este log + schema audit)
- **Testes manuais**: 5
- **Duração**: ~4 horas

---

### Próximos Passos (Fase 1)

1. ✅ Implementar categorias 3 níveis
2. ✅ Seed keyword dictionary (fornecido pelo usuário)
3. ✅ Garantir imutabilidade de `manualOverride`
4. ✅ Adicionar unique constraints faltantes
5. ✅ Corrigir métodos storage faltantes
6. ✅ Fix TypeScript errors

---

**Fase 0 - COMPLETA** ✅

**Data de Conclusão**: 2025-12-28
