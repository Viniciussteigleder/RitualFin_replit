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
- Auto-confirm high-confidence transactions

**Considered** (lower priority):
- Multiple bank format support
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
