# Architecture & AI Logic

**RitualFin Personal Finance App**
**Last Updated**: 2025-12-27

---

## Quick Overview (2 minutes)

RitualFin is a personal finance app built around **"Lazy Mode"** - minimize manual categorization by automating transaction processing through rules and AI.

**Core workflow**:
1. User uploads bank CSV (Miles & More format)
2. App automatically categorizes transactions using keyword rules
3. AI suggests keywords for unmatched transactions
4. User confirms/corrects in review queue
5. Dashboard shows spending vs budgets

**Tech stack**:
- Frontend: React 19 + TanStack Query + shadcn/ui
- Backend: Express + PostgreSQL + Drizzle ORM
- AI: OpenAI GPT-4o-mini (user provides API key)

**Observability**:
- OpenAI calls log safe usage metadata to `ai_usage_logs` (model, tokens, cost estimate, feature tag).
- In-app notifications stored in `notifications` and fetched via polling endpoints.

---

## System Architecture (3 minutes)

### Directory Structure

```
/client          Frontend (React + Vite)
  /src/pages       UI pages (dashboard, uploads, confirm, rules, etc.)
  /src/components  Reusable UI components (shadcn/ui)
  /src/lib         API client, utils, context

/server          Backend (Express + TypeScript)
  csv-parser.ts    Parses Miles & More CSV format
  rules-engine.ts  Keyword matching logic
  storage.ts       Database access layer (Drizzle ORM)
  routes.ts        All API endpoints

/shared          Types shared between client and server
  schema.ts        Database schema (Drizzle) + Zod validators
  models/          TypeScript interfaces
```

### Request Flow

```
User uploads CSV
    ↓
POST /api/uploads/process
    ↓
csv-parser.ts → parses rows → generates unique keys
    ↓
For each transaction:
  - Check if duplicate (by key)
  - Match against rules (rules-engine.ts)
  - If no match: needsReview = true
  - If match: auto-categorize
    ↓
Storage layer → INSERT into transactions table
    ↓
Response: {uploadId, rowsImported, rowsTotal, status}
```

### Database Schema (Critical Tables)

**transactions** (canonical ledger)
- `paymentDate`, `descRaw`, `amount`, `currency`
- Categorization: `type`, `fixVar`, `category1`, `category2`
- Flags: `needsReview`, `manualOverride`, `internalTransfer`, `excludeFromBudget`
- AI metadata: `confidence`, `suggestedKeyword`, `ruleIdApplied`

**rules** (keyword-based categorization)
- `keywords` (semicolon-separated: "netflix;hbo;spotify")
- `type`, `fixVar`, `category1`, `category2`
- `priority` (higher = applied first)
- `strict` (if true, auto-confirms without review)

**uploads** (import history)
- `status`: processing | ready | duplicate | error
- `rowsTotal`, `rowsImported`
- `monthAffected` (computed from transaction dates)

**budgets** (monthly spending targets per category)
- `month`, `category1`, `amount`

**goals** (monthly financial planning) - *NEW FEATURE*
- `month`, `estimatedIncome`, `totalPlanned`

**categoryGoals** (budget breakdown per category) - *NEW FEATURE*
- Links to `goals.id`
- `category1`, `targetAmount`, `previousMonthSpent`, `averageSpent`

---

## CSV Upload & Normalization Architecture (15 minutes)

### High-Level Structure

**Purpose**: Transform bank/card provider CSV exports into standardized transaction records

**Flow**:
```
User uploads CSV
    ↓
Frontend (uploads.tsx) → POST /api/uploads/process
    ↓
csv-parser.ts → Format detection (M&M | Amex | Sparkasse | unknown)
    ↓
Provider-specific parser (parseMilesAndMore | parseAmex | parseSparkasse)
    ↓
Normalized ParsedTransaction[] objects
    ↓
rules-engine.ts → Keyword matching + confidence scoring
    ↓
AI suggestion (optional, user-triggered)
    ↓
User confirmation (confirm.tsx)
    ↓
storage.ts → Database INSERT
    ↓
Dashboard updates with new data
```

### Provider Support Matrix

| Provider | Status | Date Format | Delimiter | Account Attribution |
|----------|--------|-------------|-----------|---------------------|
| Miles & More | ✅ Working | DD.MM.YYYY | ; (semicolon) | Card name + last 4 digits from file header |
| American Express | ✅ Working | DD/MM/YYYY | , (comma) | Cardholder name + last 4 of account number |
| Sparkasse | ✅ Working | DD.MM.YY | ; (semicolon) | Last 4 digits of IBAN |

**Note**: All 3 formats fully implemented as of Phase 6C (2025-12-28). See IMPLEMENTATION_LOG.md for details.

### Format Detection Logic

**File**: `server/csv-parser.ts`, function `detectCsvFormat()`

**Strategy**: Scan first 5 lines for characteristic headers

```typescript
// Amex detection
if (headers.includes("Datum") &&
    headers.includes("Beschreibung") &&
    headers.includes("Karteninhaber")) {
  return "amex";
}

// M&M detection
if (headers.includes("Authorised on")) {
  return "miles_and_more";
}

// Fallback
return "unknown";
```

**Why this works**:
- Headers are provider-specific
- Early detection prevents full file parsing
- No file naming conventions needed
- Works with any filename

### Account/Card Attribution Strategy

**Critical Field**: `accountSource` (string)

**Purpose**:
1. Distinguish transactions from multiple cards/accounts
2. Enable per-card budget tracking
3. Identify source for reconciliation
4. Filter views by account

**Current Implementation**:

**Miles & More**:
```typescript
// Extract from line 1 of CSV
accountSource = "Miles & More Gold Credit Card;5310XXXXXXXX7340"
// Splits on semicolon, takes first part
accountSource = "Miles & More Gold Credit Card"
```
✅ Works correctly - each M&M card has unique CSV with card name in header

**American Express** (BROKEN):
```typescript
accountSource = "American Express"  // ❌ Hardcoded
```
⚠️ **ISSUE**: Cannot distinguish between:
- Multiple cardholders (Vinicius vs E Rodrigues)
- Multiple account numbers (-11009 vs -12015)
- All Amex transactions lumped together

**Fix Required**:
```typescript
// Extract from row data
const firstName = row.karteninhaber.split(" ")[0];
const last4 = row.konto.slice(-4);
accountSource = `Amex - ${firstName} (${last4})`;
// Result: "Amex - Vinicius (1009)" vs "Amex - E Rodrigues (2015)"
```

**Sparkasse** (✅ Implemented as of Phase 6C):
```typescript
// Uses last 4 digits of Auftragskonto (IBAN)
const ibanLast4 = auftragskonto.slice(-4);  // "DE74...8260" → "8260"
accountSource = `Sparkasse - ${ibanLast4}`;
// Result: "Sparkasse - 8260"
```

### Normalization Contract

**Interface**: `ParsedTransaction` (defined in `server/csv-parser.ts:32-43`)

```typescript
interface ParsedTransaction {
  paymentDate: Date;         // Always normalized to Date object
  descRaw: string;           // Original + provider metadata for display
  descNorm: string;          // Lowercase, no accents, for keyword matching
  amount: number;            // Negative = expense, positive = income
  currency: string;          // EUR, USD, etc.
  foreignAmount?: number;    // If paid in foreign currency
  foreignCurrency?: string;
  exchangeRate?: number;
  key: string;               // Deduplication: descNorm + amount + date
  accountSource: string;     // 🔑 CRITICAL: Must uniquely identify source
}
```

**Invariants**:
1. `paymentDate` is always a valid Date object (invalid dates are rejected)
2. `descNorm` is always lowercase, no diacritics, trimmed
3. `amount` sign convention: negative for expenses (consistent across all providers)
4. `key` format ensures same transaction from same CSV won't import twice
5. `accountSource` must uniquely identify physical card/account

**Provider-Specific Transformations**:

**Miles & More**:
- Date: `parseDateMM("23.11.2025")` → Date object
- Amount: `parseAmountGerman("-253,09")` → -253.09
- DescRaw: `"AMAZON -- e-commerce -- Authorised -- M&M"`
- Foreign currency: Extracted from dedicated columns

**American Express**:
- Date: `parseDateAmex("20/12/2025")` → Date object
- Amount: `parseAmountGerman("94,23")` → **-94.23** (flips sign! Amex uses positive for expenses)
- DescRaw: `"LIDL 4691 OLCHING -- Amex [VINICIUS STEIGLEDER] @ OLCHING, GERMANY"`
- Foreign currency: Parsed from "Weitere Details" field if present

### Where AI is Used vs NOT Used

**AI is NEVER used for**:
- CSV parsing (deterministic, rule-based)
- Format detection (header pattern matching)
- Account attribution (data extraction)
- Amount normalization (math)
- Date parsing (format rules)
- Duplicate detection (key comparison)

**AI is ONLY used for**:
- Keyword suggestions for uncategorized transactions (user-triggered)
- Batch analysis of similar transactions (user-triggered)
- Helping users create better categorization rules

**Why**:
- CSV parsing must be 100% reliable (no probabilistic failures)
- Users need predictable, repeatable imports
- AI costs money (user provides OpenAI key)
- AI is slow (network request)
- AI can fail (quota, network, parsing errors)

**AI Integration Point**: After upload completes, if transactions have `needsReview: true`, user can click "Analyze with AI" on confirm page. AI never runs automatically.

### Rules-Based Logic and AI Interaction

**Timeline**:
```
1. Upload CSV
   ↓
2. Parse to ParsedTransaction[]
   ↓
3. For each transaction:
   - Match against user's rules (keywords)
   - Calculate confidence (0-100)
   - If confidence >= 80% → auto-categorize
   - If confidence < 80% → needsReview = true
   ↓
4. Store in database
   ↓
5. User sees "X transactions need review"
   ↓
6. [OPTIONAL] User clicks "Analyze with AI"
   ↓
7. AI suggests keywords for each uncategorized transaction
   ↓
8. User confirms categories → updates database
   ↓
9. [OPTIONAL] User creates rule from keyword → future auto-categorization
```

**Rules engine is PRIMARY**:
- Runs on every transaction upload
- No cost, instant
- Deterministic, predictable
- User-controllable (edit rules anytime)

**AI is SECONDARY**:
- Runs only when user requests
- Costs money (OpenAI API)
- Probabilistic, may suggest wrong keywords
- Requires user confirmation before applying

### Design Principles (Lazy Mode)

**Core Philosophy**: Minimize manual work through learning

**How it applies to CSV upload**:
1. **First upload**: Most transactions need review (no rules yet)
2. **User confirms**: Creates rules as they categorize
3. **Second upload**: 80% auto-categorize (rules learned merchant names)
4. **Third upload**: 95% auto-categorize (comprehensive rule coverage)

**Key Mechanisms**:
- Keyword-based rules (simple, fast, reliable)
- Priority system (handle conflicting rules)
- Strict flag (bypass review for high-confidence rules)
- Bulk operations (confirm 10 similar transactions at once)
- Optional AI assist for edge cases

**What Lazy Mode is NOT**:
- Not automatic AI categorization (too expensive, too error-prone)
- Not pre-built categories (everyone's spending is different)
- Not "set and forget" (requires initial training period)

### Current Limitations

**Multi-account support**:
- ⚠️ Amex account attribution broken (see above)
- Cannot currently filter dashboard by account
- No account-specific budgets

**Error handling**:
- Generic error messages (no row-level failure details)
- Invalid date/amount → transaction silently skipped
- No validation warnings before import

**Performance**:
- N+1 query pattern (duplicate check per transaction)
- No bulk insert optimization
- Large CSVs (>1000 rows) may be slow

**Format flexibility**:
- Only supports exact column names (no fuzzy matching)
- Cannot handle CSV variations within same provider
- No support for custom column mapping

### Trade-offs Accepted

**Simplicity over flexibility**:
- Three providers only (not a generic CSV importer)
- Fixed column names (easier to maintain)
- No user configuration of CSV format

**Determinism over intelligence**:
- Rules engine over AI (predictable, free, fast)
- Manual review over auto-categorization (prevents costly mistakes)

**Debuggability over abstraction**:
- Provider-specific parsers (not a unified parser with config)
- Easier to debug format-specific issues
- Each parser is self-contained

---

## Data Flow: CSV Import to Categorization (5 minutes)

### Step 1: CSV Parsing

**File**: `server/csv-parser.ts`

**Input**: Raw CSV text (Miles & More format)
```csv
Authorised on,Processed on,Amount,Currency,Description,Payment type,Status
15.12.2024,16.12.2024,-45.50,EUR,Netflix Monthly,Debit,Completed
```

**Processing**:
- Validates required columns exist
- Parses dates (DD.MM.YYYY → Date object)
- Normalizes description (lowercase, no accents, trim)
- Generates unique key: `${userId}|${date}|${descNorm}|${amount}`

**Output**: `ParsedTransaction[]`
```typescript
{
  paymentDate: Date,
  descRaw: "Netflix Monthly",
  descNorm: "netflix monthly",
  amount: -45.50,
  currency: "EUR",
  key: "user123|2024-12-15|netflix monthly|-45.50"
}
```

### Step 2: Rules Engine (Keyword Matching)

**File**: `server/rules-engine.ts`

**Function**: `matchRules(descNorm, rules[])`

**Logic**:
1. Sort rules by priority (highest first)
2. Normalize keywords (UPPERCASE, no accents)
3. For each rule, check if ANY keyword appears in description
4. If `strict: true` rule matches → return immediately (confidence 100%)
5. Otherwise, collect all matches
6. If multiple matches → return highest priority (confidence 80%)
7. If no matches → return `needsReview: true` (confidence 0%)

**Example**:
```
descNorm: "netflix monthly"
rules: [
  {keywords: "NETFLIX;HBO", category1: "Lazer", priority: 600, strict: false}
  {keywords: "MONTHLY", category1: "Fixo", priority: 400, strict: false}
]

Result:
- Both rules match "NETFLIX" and "MONTHLY"
- Priority 600 wins
- appliedRule: {category1: "Lazer", ...}
- confidence: 80
- needsReview: false (if confidence >= threshold)
```

### Step 3: AI-Assisted Keyword Suggestion

**File**: `server/routes.ts` (lines 555-651)

**When**: User clicks "Analyze with AI" on confirm queue page

**How**:
1. Fetch all transactions with `needsReview: true`
2. Group by normalized description
3. Send batch to OpenAI GPT-4o-mini:
   ```
   "You are analyzing Portuguese transaction descriptions.
    For each transaction, suggest a short keyword (2-4 words)
    that could be used for categorization..."
   ```
4. Parse JSON response
5. Store `suggestedKeyword` in transaction record

**AI is NOT used for**:
- Automatic categorization (rules-only)
- Setting category directly
- Bulk approval without user confirmation

**AI is ONLY used for**:
- Keyword suggestions (user still confirms)
- Batch analysis of similar transactions

### Step 4: User Confirmation

**Page**: `client/src/pages/confirm.tsx`

**Flow**:
1. Fetch transactions with `needsReview: true`
2. Display in table with suggested categories
3. User can:
   - Accept suggestion → set categories, `needsReview = false`
   - Edit categories → set categories, `manualOverride = true`
   - Create rule from keyword → saves to rules table
   - Bulk confirm high-confidence items

**POST /api/transactions/bulk-confirm**:
```json
{
  "updates": [
    {
      "id": "txn123",
      "type": "Despesa",
      "fixVar": "Variável",
      "category1": "Lazer",
      "category2": "Streaming"
    }
  ]
}
```

---

## Rules vs AI: When Each is Used (3 minutes)

### Rules Engine (Deterministic, Fast, Primary)

**Used for**:
- Initial transaction categorization on import
- Re-categorization when rules change
- Bulk auto-categorization of known patterns

**Characteristics**:
- Keyword matching (simple string contains check)
- Priority-based (higher priority wins)
- No cost, instant
- Predictable, user-controllable

**Limitations**:
- Requires manual rule creation
- Cannot handle novel patterns
- No semantic understanding

### AI (Probabilistic, Slow, Secondary)

**Used for**:
- Suggesting keywords for uncategorized transactions
- Batch analysis of similar transactions
- Helping user create better rules

**Characteristics**:
- Costs money (OpenAI API)
- Slower (network request)
- Better at novel/ambiguous cases
- Requires user confirmation

**Limitations**:
- Users must provide own API key
- Can fail (network, quota, parsing)
- Not trustworthy enough for auto-categorization
- No batch processing optimization (yet)

### Decision Tree

```
New transaction arrives
    ↓
Does it match a STRICT rule?
    YES → Auto-categorize (no review needed)
    NO  ↓
Does it match any rule?
    YES → Auto-categorize if confidence >= 80%
    NO  ↓
Mark needsReview = true
    ↓
User can trigger AI analysis
    ↓
AI suggests keyword
    ↓
User confirms → optionally creates rule
```

---

## "Lazy Mode" Design Philosophy (2 minutes)

### Core Principle

**Minimize manual work by learning from user behavior**

### How It Works

1. **First month**: User categorizes ~50-100 transactions manually
2. **As they categorize**: App learns keywords → creates rules automatically
3. **Next month**: 80% of transactions auto-categorize
4. **Third month**: 95% auto-categorize

### Key Features

**Auto-rule creation**:
- When user confirms a transaction, app offers to create a rule
- "Netflix Monthly" → create rule: `keywords: "netflix", category: "Lazer"`

**Bulk operations**:
- "Mark all Netflix transactions as Lazer"
- Creates 1 rule, confirms 10 transactions

**AI assist for edge cases**:
- Only uncategorized items get AI analysis
- AI doesn't run automatically (costs money)

**High-confidence auto-confirm** (planned):
- If rule has `strict: true` and matches → skip review queue
- Currently requires manual "confirm all" button

### What "Lazy Mode" is NOT

- Not automatic AI categorization (too expensive, too error-prone)
- Not pre-built categorization (every user's spending is different)
- Not "set and forget" (still requires monthly review ritual)

---

## Key Assumptions & Limitations (2 minutes)

### Assumptions

1. **Monthly cycle**: All features assume calendar month boundaries
2. **Single currency**: EUR only (foreignAmount tracked but not primary)
3. **Single bank format**: Miles & More CSV only
4. **Single user**: Currently hardcoded "demo" user (multi-user planned)
5. **Portuguese locale**: Categories, UI language are pt-BR

### Current Limitations

**Data integrity**:
- No database indexes on critical query paths (performance at scale)
- No foreign key constraints enforced in some relationships
- Duplicate detection is key-based (can miss near-duplicates)

**Error handling**:
- Generic 500 errors (no distinction between validation vs server errors)
- No retry logic for OpenAI API failures
- CSV parse errors don't show which row failed

**Performance**:
- N+1 query pattern on CSV import (1 query per transaction to check duplicates)
- Dashboard aggregations load full month into memory
- No caching layer

**AI integration**:
- No cost tracking or quota management
- No batch optimization (sends 100 transactions → 1 API call → parse response)
- No fallback if API key is invalid/expired

**Authentication**:
- All users share "demo" account
- No real session management
- No row-level security in database

### Trade-offs Accepted

**Simplicity over flexibility**:
- One bank format supported (easier onboarding)
- Monthly-only goals (matches user mental model)
- Rules over AI (predictable, free, fast)

**Manual review over auto-categorization**:
- Even high-confidence matches require review first time
- Prevents costly mistakes (miscategorized rent payment)
- Builds user trust in the system

**Eventual consistency over real-time**:
- Dashboard shows day-old data (acceptable)
- Budget vs actual can be slightly stale
- Progress calculations are on-demand

---

## Goals & Category Goals Feature (Current Implementation)

### Purpose

Allow users to set monthly financial targets:
- Total estimated income
- Spending budget per category (Moradia, Mercado, etc.)
- Track actual vs planned throughout month

### Data Model

```
goals
  id, userId, month, estimatedIncome, totalPlanned

categoryGoals
  id, goalId, category1, targetAmount,
  previousMonthSpent, averageSpent
```

### Design Decisions

**One goal per month**:
- Matches existing budgets/dashboard monthly cycle
- Simpler queries: `WHERE month = '2025-12'`

**Historical data stored as snapshot**:
- `previousMonthSpent` calculated at goal creation
- Does not update if past transactions change
- Used for reference when setting targets

**Progress computed on-demand**:
- Join goals + categoryGoals + transactions
- Aggregate actual spending for month
- Fresh data, no sync issues

### Integration Points

**Dashboard** (`/dashboard` page):
- Shows current month goal vs actual
- Progress bars per category

**Goals page** (`/goals`):
- Set estimated income
- Add/edit category targets
- View historical averages

**Transactions**:
- Affects progress calculation
- Internal transfers excluded (`internalTransfer: true`)
- Budget exclusions honored (`excludeFromBudget: true`)

---

## Future Improvements

**Planned** (high priority):
- Multi-user support (remove "demo" hardcoding)
- Database indexes for performance
- Structured error handling with proper HTTP codes

**Completed**:
- ✅ Auto-confirm high-confidence transactions (Phase 5)
- ✅ Multiple bank format support (Phase 6C: M&M + Amex + Sparkasse)

**Considered** (lower priority):
- Additional bank format support (N26, DKB, etc.)
- Multi-currency support
- Weekly/quarterly goals
- AI cost tracking dashboard
- Background job for rule reapplication

**Not Planned** (out of scope):
- Automatic investment tracking
- Bill payment integration
- Real-time bank sync (OAuth)
- Mobile app

---

## For New Developers

### Where to Start

1. **Read**: `shared/schema.ts` - understand data model
2. **Read**: `server/csv-parser.ts` - see how data enters system
3. **Read**: `server/rules-engine.ts` - understand categorization logic
4. **Run**: `npm run dev` - see app in action
5. **Import**: Sample CSV - watch the flow

### Common Tasks

**Add a new API endpoint**:
1. Add storage method in `server/storage.ts`
2. Add route in `server/routes.ts`
3. Add validation schema if needed
4. Update `client/src/lib/api.ts`

**Add a new category**:
1. Update `category1Enum` in `shared/schema.ts`
2. Run `npm run db:push` to update database
3. Add to frontend dropdowns

**Debug categorization**:
1. Check `transactions` table for `ruleIdApplied`
2. Look up rule in `rules` table
3. Check `confidence` and `needsReview` flags
4. Test with `matchRules()` function directly

### Key Files Reference

| File | Purpose |
|------|---------|
| `server/routes.ts` | All API endpoints |
| `server/storage.ts` | Database queries |
| `server/rules-engine.ts` | Categorization logic |
| `server/csv-parser.ts` | Import processing |
| `shared/schema.ts` | Database schema |
| `client/src/lib/api.ts` | Frontend API client |
| `client/src/pages/*.tsx` | UI pages |

---

**End of Architecture Overview**
