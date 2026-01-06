# RitualFin - Requirements Tracking Document

**Last Updated**: 2026-01-04
**Purpose**: Track all user requirements, implementation status, and feature completeness

---

## Table of Contents

1. [General Requirements](#general-requirements)
2. [Database & Schema Requirements](#database--schema-requirements)
3. [Data Processing Requirements](#data-processing-requirements)
4. [Screen-by-Screen Requirements](#screen-by-screen-requirements)
5. [AI Integration Requirements](#ai-integration-requirements)
6. [Implementation Status Summary](#implementation-status-summary)

---

## General Requirements

### Core Philosophy: "Lazy Mode"
**Requirement**: Minimize manual categorization through automated rules and AI assistance

**Status**: ✅ Implemented
- Rules engine with keyword matching
- Priority-based rule selection
- Strict mode for auto-categorization
- Optional AI keyword suggestions
- Bulk confirmation workflows

**Files**:
- `server/rules-engine.ts` - Core matching logic
- `server/routes.ts:555-651` - AI suggestions endpoint

---

### Locale & Currency
**Requirements**:
- Portuguese (Brazil) pt-BR locale
- EUR as primary currency
- Support for foreign currency tracking

**Status**: ✅ Implemented
- All UI text in Portuguese
- Date format DD.MM.YYYY for display
- Amount formatting: R$ 1.234,56 style
- Foreign amounts stored separately

**Files**:
- `client/src/lib/utils.ts` - Formatting helpers
- `shared/schema.ts` - Currency fields

---

### Multi-Bank CSV Support
**Requirements**:
- Miles & More bank CSV format
- American Express CSV format
- Sparkasse CSV format
- Auto-detect format from headers

**Status**: ✅ Implemented (All 3 formats)
- Format detection in csv-parser.ts
- Provider-specific parsers
- Account attribution per provider
- 100% parse success rate verified

**Files**:
- `server/csv-parser.ts:detectCsvFormat()`
- `server/csv-parser.ts:parseMilesAndMore()`
- `server/csv-parser.ts:parseAmex()`
- `server/csv-parser.ts:parseSparkasse()`

**Test Results**:
- Sparkasse: 254/254 rows ✅
- M&M: 374/374 rows ✅
- Amex: 296/296 rows ✅

---

### Authentication & Multi-User
**Requirements**:
- User authentication system
- Row-level data isolation per user
- Session management

**Status**: ⚠️ Partial - Demo mode only
- Currently hardcoded "demo" user
- All data scoped to userId in queries
- Local session strategy (development)
- **TODO**: Real authentication system
- **TODO**: User registration/login

**Files**:
- `server/routes.ts` - Auth endpoints (basic)
- `server/index.ts` - Session config

---

## Database & Schema Requirements

### Hierarchical Category System (N1 → N2 → N3)
**Requirements**:
- 3-level taxonomy from Excel input
- 109 leaf categories total
- User-specific taxonomies
- Recorrente/Fixo/Variável metadata

**Status**: ✅ Implemented
- Tables: `taxonomy_level_1`, `taxonomy_level_2`, `taxonomy_leaf`
- Seeded from 002_seed_taxonomy.sql
- Helper function: `get_category_hierarchy(leaf_id)`

**Database**:
- Migration 001: Schema creation
- Migration 002: Taxonomy seed (5,363 lines)
- Migration 006: leaf_id references

---

### Rules Engine Schema
**Requirements**:
- Keywords OPTIONAL (nullable)
- Semicolon-delimited expressions
- Negative keywords support
- Match against key_desc (not desc_norm)
- Priority-based selection
- Strict mode for auto-confirm

**Status**: ✅ Implemented
- `rules.key_words` nullable
- `rules.key_words_negative` nullable
- `rules.priority` for conflict resolution
- `rules.strict` for bypassing review
- `rules.leaf_id` references taxonomy

**Database**:
- Migration 001: Rules table schema
- Migration 004: key_desc documentation

---

### key_desc Derivation Logic
**Requirements**:
- Canonical matching field per CSV type
- Sparkasse: Beguenstigter -- Verwendungszweck -- Buchungstext -- IBAN -- derived
- Amex: Beschreibung -- Konto -- Karteninhaber -- derived
- M&M: Description -- Payment type -- Status -- derived
- Special rules for payment detection and refunds

**Status**: ✅ Documented
- Comprehensive documentation in migration 004
- Real examples provided
- Keyword matching rules specified (NO space tokenization)

**Database**:
- Migration 004: Complete key_desc documentation

---

### Internal Transactions Handling
**Requirements**:
- First-class flag `internal_transfer`
- Stored in database
- EXCLUDED from all reporting queries
- EXCLUDED from budget calculations
- EXCLUDED from dashboard aggregations

**Status**: ✅ Implemented
- `transactions.internal_transfer` boolean field
- `v_reportable_transactions` view excludes internals
- `v_monthly_dashboard` view excludes internals
- Indexes optimize exclusion queries

**Database**:
- Migration 001: internal_transfer field
- Migration 007: Reporting views with exclusion

---

### Merchant Alias & Logo System
**Requirements**:
- 1000 merchant aliases
- Normalized merchant names
- Logo URLs from Wikipedia/official sources
- Local logo storage support
- key_words_alias for matching

**Status**: ✅ Implemented
- `alias_assets` table
- Seeded with 1000 entries
- url_icon_internet field for logos
- logo_local_path for downloaded logos

**Database**:
- Migration 001: alias_assets table
- Migration 003: Alias seed (866 lines)

---

### Recurrence Tracking
**Requirements**:
- Detect monthly/weekly/annual patterns
- Track recurrence metadata on transactions
- Support calendar event recurrence
- Enable projections for commitments

**Status**: ✅ Implemented
- `transactions.is_recurrent`, `recurrence_pattern`, `recurrence_day_of_month`
- `calendar_events.recurrence_type`, `recurrence_day_of_week`
- Indexes for recurrence queries

**Database**:
- Migration 005: Recurrence fields

---

### Budget & Goals System
**Requirements**:
- Monthly budget targets per category
- Budget vs actual tracking
- Historical averages
- Category goals with leaf_id references

**Status**: ✅ Schema implemented, ⚠️ UI partial
- `budgets` table with leaf_id
- `goals`, `category_goals` tables
- Helper functions: `get_budget_vs_actual()`

**Database**:
- Migration 001: Budget/goals tables
- Migration 006: leaf_id references
- Migration 007: Budget tracking functions

---

## Data Processing Requirements

### CSV Upload Pipeline
**Requirements**:
1. Upload CSV file (any of 3 formats)
2. Auto-detect format from headers
3. Parse all rows (100% success rate)
4. Extract account source (unique per card)
5. Generate key_desc per format rules
6. Normalize descriptions
7. Detect duplicates by key
8. Match against rules
9. Set status (OPEN vs FINAL)
10. Store with metadata

**Status**: ✅ Implemented
- Format detection: ✅
- All 3 parsers: ✅
- Deduplication: ✅
- Rules matching: ✅
- Account attribution: ✅ (fixed Amex in Phase 6C)

**Files**:
- `server/csv-parser.ts` - Parsing logic
- `server/routes.ts:/api/uploads/process` - Upload endpoint
- `client/src/pages/uploads.tsx` - Upload UI

---

### Rules Matching Logic
**Requirements**:
- Split key_words by ";" to get expressions
- For EACH expression, check if key_desc CONTAINS it (case-insensitive)
- If ANY expression matches → rule matches
- Check key_words_negative same way
- If ANY negative matches → rule BLOCKED
- **CRITICAL**: Do NOT tokenize expressions by spaces
- Example: "SV Fuerstenfeldbrucker Wasserratten e.V." must match as whole phrase

**Status**: ⚠️ Needs verification
- **TODO**: Verify current implementation doesn't split on spaces
- **TODO**: Add test cases for multi-word expressions

**Files**:
- `server/rules-engine.ts:matchRules()` - CRITICAL: Review this

---

### Transaction Status Workflow
**Requirements**:
- `status` field: OPEN | PROCESSING | FINAL
- OPEN = needs review
- PROCESSING = AI analysis in progress
- FINAL = categorized and confirmed
- `classified_by` field: AUTO_KEYWORDS | MANUAL | AI_ASSISTED

**Status**: ⚠️ Partial - uses needsReview boolean
- Currently: `needs_review` boolean instead of status enum
- **TODO**: Migrate to status enum system
- **TODO**: Add classified_by tracking

**Files**:
- `shared/schema.ts` - Schema definition
- **TODO**: Add migration for status enum

---

## Screen-by-Screen Requirements

### 1. Dashboard (`/dashboard`)

**Requirements**:

**Month Overview KPIs**:
- Total expenses (excludes Internal)
- Total income
- Net savings
- Expenses: Fixed vs Variable breakdown
- **Status**: ✅ Implemented (v_monthly_dashboard view)

**Budget Tracking**:
- Budget vs actual per category
- Progress bars
- Overspending alerts
- **Status**: ⚠️ Schema ready, UI needs update

**Upcoming Commitments**:
- Next 7/14 days projected expenses
- Recurrence-based predictions
- **Status**: ✅ Schema ready (get_upcoming_commitments function)
- **TODO**: UI implementation

**Week-by-Week Calendar**:
- Visual week grid
- Spending per day
- Color coding by category
- **Status**: ⚠️ Function ready (get_week_spending)
- **TODO**: UI implementation

**Files**:
- `client/src/pages/dashboard.tsx` - Main dashboard UI
- Database: Migration 007 (views + functions)
- **TODO**: Update dashboard.tsx to use new views/functions

---

### 2. Calendar (`/calendar`)

**Requirements**:

**Month View**:
- Calendar grid with days
- Transactions grouped by day
- Recurring transactions highlighted
- **Status**: ⚠️ Partial implementation

**Week View**:
- Weekly spending breakdown
- Category distribution
- **Status**: ⚠️ Backend ready, UI needs work

**Recurring Transactions**:
- Detect monthly patterns (same day each month)
- Detect weekly patterns
- Visual indicators for recurrence
- **Status**: ✅ Schema ready (is_recurrent, recurrence_pattern)
- **TODO**: Detection algorithm
- **TODO**: UI visualization

**Projections**:
- Show future expected expenses based on recurrence
- "Next 7 days: Expected €450"
- **Status**: ✅ Backend function ready
- **TODO**: UI display

**Files**:
- `client/src/pages/calendar.tsx` - Calendar UI
- Database: Migration 005 (recurrence fields)
- **TODO**: Implement recurrence detection logic
- **TODO**: Add projection display

---

### 3. Upload (`/uploads`)

**Requirements**:

**Multi-Format Upload**:
- Drag & drop CSV file
- Auto-detect format (M&M, Amex, Sparkasse)
- Show format detected
- **Status**: ✅ Implemented

**Upload Progress**:
- Show parsing progress
- Row count (imported / total)
- Error reporting per row (if any)
- **Status**: ⚠️ Basic - no row-level errors

**Upload History**:
- List past uploads
- Status (processing | ready | error | duplicate)
- Rows imported
- Month affected
- Re-upload same file detection
- **Status**: ✅ Implemented

**Screenshot Attachment** (FUTURE):
- Attach receipt screenshots to upload
- Link screenshots to specific transactions
- **Status**: ❌ Not implemented
- **TODO**: Add screenshot upload
- **TODO**: Link to transactions

**Deduplication**:
- Prevent duplicate imports (same file)
- Prevent duplicate transactions (same key)
- Show "X duplicates skipped"
- **Status**: ✅ Implemented (key-based)

**Files**:
- `client/src/pages/uploads.tsx` - Upload UI
- `server/routes.ts:/api/uploads/process` - Upload processing
- **TODO**: Add screenshot support
- **TODO**: Improve error reporting

---

### 4. Transactions (`/transactions`)

**Requirements**:

**Ledger View**:
- List all transactions
- Filter by date range
- Filter by category
- Filter by account source
- Filter by status (OPEN | FINAL)
- **Status**: ✅ Basic implementation

**Columns**:
- Date
- Description (simple_desc or desc_raw)
- Amount (formatted)
- Category (N1 → N2 → N3)
- Account source
- Status
- Actions (edit, delete)
- **Status**: ⚠️ Needs update for N3 categories

**Transaction Details Drawer/Modal**:
- Full desc_raw
- Full key_desc
- Account source
- Foreign amount (if any)
- Applied rule (if any)
- Classification method
- Edit categories
- Set as internal transfer
- Exclude from budget
- **Status**: ⚠️ Basic modal
- **TODO**: Show key_desc
- **TODO**: Show applied rule details
- **TODO**: Show classification method

**Inline Editing**:
- Click to edit category
- Change type (Despesa ↔ Receita)
- Change fix/var
- Mark as internal
- **Status**: ⚠️ Partial

**Bulk Actions**:
- Select multiple transactions
- Bulk categorize
- Bulk mark as internal
- Bulk delete
- **Status**: ❌ Not implemented
- **TODO**: Add selection checkboxes
- **TODO**: Add bulk action toolbar

**Files**:
- `client/src/pages/transactions.tsx` - Transactions UI
- **TODO**: Add details drawer with full info
- **TODO**: Add bulk selection
- **TODO**: Update for leaf_id categories

---

### 5. Confirm Queue (`/confirm`)

**Requirements**:

**Review Queue**:
- Show transactions with needs_review = true
- Group by similar descriptions
- Show count per group
- **Status**: ✅ Implemented

**AI Analysis**:
- "Analyze with AI" button
- Bulk keyword suggestions
- Show suggested keywords
- Cost estimation (tokens)
- **Status**: ✅ Implemented

**Bulk Confirmation**:
- Select all similar transactions
- Apply category to all
- Option to create rule
- **Status**: ✅ Implemented

**Rule Creation**:
- "Create rule from this" button
- Pre-fill keywords from description
- Set priority
- Set strict mode
- **Status**: ⚠️ Basic implementation
- **TODO**: Suggest better keywords
- **TODO**: Validate keyword quality

**Skip/Defer**:
- "I'll categorize this later"
- Keeps in queue but marked as deferred
- **Status**: ❌ Not implemented
- **TODO**: Add deferred status

**Files**:
- `client/src/pages/confirm.tsx` - Confirm queue UI
- `server/routes.ts:/api/ai/bulk-categorize` - AI analysis
- **TODO**: Add deferred status
- **TODO**: Improve rule creation UX

---

### 6. Rules (`/rules`)

**Requirements**:

**Rules List**:
- Show all rules
- Sort by priority
- Filter by category
- Search by keywords
- **Status**: ✅ Implemented

**Rule Details**:
- Keywords (semicolon-separated)
- Negative keywords
- Category (N1 → N2 → N3)
- Priority
- Strict mode
- Active/inactive
- **Status**: ⚠️ Needs update for N3 categories

**Rule Creation**:
- Add keywords (optional!)
- Add negative keywords (optional)
- Select category from hierarchy
- Set priority (default 500)
- Set strict mode
- **Status**: ⚠️ Keywords shown as required
- **TODO**: Make keywords truly optional in UI

**Rule Testing**:
- "Test this rule" feature
- Show matching transactions
- Preview what would change
- **Status**: ❌ Not implemented
- **TODO**: Add rule testing UI

**Rule Analytics**:
- "This rule matched X transactions"
- Last matched date
- Success rate
- **Status**: ❌ Not implemented
- **TODO**: Add usage tracking

**Files**:
- `client/src/pages/rules.tsx` - Rules UI
- **TODO**: Make keywords optional in form
- **TODO**: Update for leaf_id categories
- **TODO**: Add rule testing
- **TODO**: Add usage analytics

---

### 7. Budget (`/budgets`) - NEW SCREEN NEEDED

**Requirements**:

**Category Budgets**:
- Set monthly budget per category (N3 level)
- Visual progress bars
- Overspending alerts
- **Status**: ⚠️ Schema ready, UI missing
- **TODO**: Create budgets.tsx page

**Budget vs Actual**:
- Side-by-side comparison
- Percentage used
- Days remaining in month
- Projected spending
- **Status**: ✅ Backend function ready
- **TODO**: UI implementation

**Historical Comparison**:
- "Last month: €X, This month: €Y"
- 3-month average
- Trend indicators
- **Status**: ❌ Not implemented
- **TODO**: Add historical queries

**Budget Templates**:
- Save budget as template
- "Apply last month's budget"
- Seasonal adjustments
- **Status**: ❌ Not implemented
- **TODO**: Add template system

**Files**:
- **TODO**: Create `client/src/pages/budgets.tsx`
- Database: budgets table ready
- **TODO**: Add historical aggregation functions

---

### 8. Goals (`/goals`)

**Requirements**:

**Monthly Goals**:
- Set estimated income for month
- Set total planned spending
- **Status**: ✅ Implemented

**Category Breakdown**:
- Allocate budget per category
- Use taxonomy hierarchy (N3)
- Show historical averages
- Show previous month actual
- **Status**: ⚠️ Schema ready
- **TODO**: Update UI for leaf_id

**Strategic vs Tactical Goals**:
- Strategic: Long-term savings targets
- Tactical: Monthly category budgets
- **Status**: ❌ Not implemented
- **TODO**: Add goal types

**Progress Tracking**:
- Visual progress indicators
- Days remaining
- On track / off track status
- **Status**: ⚠️ Basic implementation

**Files**:
- `client/src/pages/goals.tsx` - Goals UI
- **TODO**: Update for leaf_id categories
- **TODO**: Add strategic goals

---

### 9. Rituals (`/rituals`) - NEW SCREEN NEEDED

**Requirements**:

**Weekly Ritual**:
- Review spending for past week
- Confirm pending transactions
- Check budget status
- **Status**: ❌ Not implemented
- **TODO**: Create rituals.tsx page

**Monthly Ritual**:
- Month-end review
- Set next month's budget
- Review recurring transactions
- Archive/export data
- **Status**: ❌ Not implemented

**Ritual Checklist**:
- [ ] Confirm all pending transactions
- [ ] Review budget overspending
- [ ] Check for duplicate transactions
- [ ] Update recurring patterns
- **Status**: ❌ Not implemented

**Files**:
- **TODO**: Create `client/src/pages/rituals.tsx`
- **TODO**: Define ritual workflows

---

### 10. Settings (`/settings`)

**Requirements**:

**User Profile**:
- Name, email
- Timezone
- Currency preference
- **Status**: ⚠️ Minimal - no real users yet

**OpenAI API Key**:
- Input field for API key
- Validation
- Test connection
- Usage tracking
- **Status**: ⚠️ Basic - stored in client only
- **TODO**: Secure server-side storage

**Category Management**:
- View taxonomy
- Add custom categories (N3 level)
- Disable categories
- **Status**: ❌ Not implemented
- **TODO**: Add category management UI

**Data Export**:
- Export all transactions (CSV)
- Export rules (JSON)
- Export budget history
- **Status**: ❌ Not implemented
- **TODO**: Add export endpoints

**Data Import**:
- Import rules from JSON
- Import transactions from CSV
- **Status**: ✅ CSV import working

**Files**:
- Settings page exists but minimal
- **TODO**: Expand settings functionality
- **TODO**: Add data export features

---

## AI Integration Requirements

### AI Usage Policy
**Requirements**:
- AI is OPTIONAL (user must provide API key)
- AI is NEVER automatic (user must trigger)
- AI is for SUGGESTIONS only (user must confirm)
- AI usage is TRACKED (model, tokens, cost)

**Status**: ✅ Followed
- User provides API key
- Explicit "Analyze with AI" button
- All suggestions require confirmation
- Usage logged to ai_usage_logs table

---

### AI Features

**Keyword Suggestions**:
- Analyze transaction description
- Suggest 2-4 word keyword
- Portuguese-aware
- **Status**: ✅ Implemented

**Bulk Categorization**:
- Analyze multiple similar transactions
- Suggest category for each
- Batch API call (1 call for N transactions)
- **Status**: ✅ Implemented

**Rule Quality Analysis** (FUTURE):
- "This rule is too broad"
- "This keyword matches 500 transactions"
- Suggest split/refinement
- **Status**: ❌ Not implemented
- **TODO**: Add rule quality AI

**Budget Insights** (FUTURE):
- "You're spending 30% more on groceries this month"
- "Consider increasing your transport budget"
- **Status**: ❌ Not implemented
- **TODO**: Add budget AI insights

**Files**:
- `server/routes.ts:/api/ai/suggest-keyword`
- `server/routes.ts:/api/ai/bulk-categorize`
- **TODO**: Add rule quality endpoint
- **TODO**: Add budget insights endpoint

---

## Implementation Status Summary

### ✅ Fully Implemented (95-100%)

1. **CSV Upload & Parsing**
   - All 3 formats (M&M, Amex, Sparkasse)
   - Format detection
   - Account attribution
   - 100% parse success rate

2. **Database Schema**
   - All 7 migrations complete
   - Hierarchical taxonomy (N1→N2→N3)
   - Rules with optional keywords
   - Internal transaction exclusion
   - Recurrence tracking fields
   - Budget/goals tables

3. **Rules Engine**
   - Keyword matching
   - Priority system
   - Strict mode
   - Optional keywords

4. **AI Integration**
   - Keyword suggestions
   - Bulk categorization
   - Usage tracking

5. **Basic CRUD**
   - Transactions list
   - Rules list
   - Uploads history
   - Goals setting

---

### ⚠️ Partially Implemented (50-95%)

1. **Dashboard** (70%)
   - ✅ Basic KPIs working
   - ✅ Month selection
   - ⚠️ Budget tracking UI needs update
   - ❌ Upcoming commitments UI missing
   - ❌ Week calendar UI missing

2. **Confirm Queue** (80%)
   - ✅ Review queue working
   - ✅ AI analysis working
   - ✅ Bulk confirmation
   - ⚠️ Rule creation basic
   - ❌ Deferred status missing

3. **Rules Page** (75%)
   - ✅ List view working
   - ✅ CRUD operations
   - ⚠️ Keywords still shown as required
   - ❌ Rule testing missing
   - ❌ Usage analytics missing

4. **Transactions Page** (60%)
   - ✅ List view working
   - ✅ Basic filtering
   - ⚠️ Details drawer basic
   - ❌ Bulk actions missing
   - ❌ Advanced filtering missing

5. **Goals Page** (65%)
   - ✅ Monthly goals working
   - ✅ Category breakdown
   - ⚠️ Needs leaf_id update
   - ❌ Strategic goals missing

---

### ❌ Not Implemented (0-50%)

1. **Budget Page** (10%)
   - Schema ready
   - No dedicated UI page
   - **TODO**: Create budgets.tsx

2. **Rituals Page** (0%)
   - No implementation
   - **TODO**: Create rituals.tsx
   - **TODO**: Define workflows

3. **Calendar Page** (40%)
   - Basic calendar exists
   - Recurrence detection missing
   - Projections UI missing

4. **Settings** (30%)
   - Basic settings exist
   - Category management missing
   - Data export missing

5. **Transaction Details** (40%)
   - Basic modal exists
   - key_desc not shown
   - Applied rule details missing
   - Classification method missing

---

## Priority Action Items

### P0 - Critical (Blocks core functionality)

1. **Verify Rules Matching Logic**
   - File: `server/rules-engine.ts`
   - Issue: Must NOT split expressions by spaces
   - Test: "SV Fuerstenfeldbrucker Wasserratten e.V." as single phrase
   - **Owner**: Backend team

2. **Make Keywords Optional in UI**
   - File: `client/src/pages/rules.tsx`
   - Issue: Form shows keywords as required
   - Fix: Update validation, show as optional
   - **Owner**: Frontend team

---

### P1 - High (User-facing issues)

1. **Update All UIs for leaf_id Categories**
   - Files: dashboard.tsx, transactions.tsx, rules.tsx, goals.tsx
   - Issue: Still using old category1/category2/category3 text fields
   - Fix: Use taxonomy hierarchy dropdowns
   - **Owner**: Frontend team

2. **Transaction Details Drawer**
   - File: `client/src/pages/transactions.tsx`
   - Add: key_desc, applied rule, classification method
   - **Owner**: Frontend team

3. **Dashboard Upcoming Commitments**
   - File: `client/src/pages/dashboard.tsx`
   - Add: Use get_upcoming_commitments() function
   - **Owner**: Frontend team

---

### P2 - Medium (Nice to have)

1. **Create Budget Page**
   - File: Create `client/src/pages/budgets.tsx`
   - Features: Budget setting, progress tracking
   - **Owner**: Frontend team

2. **Rule Testing Feature**
   - File: `client/src/pages/rules.tsx`
   - Add: Test rule against transactions
   - **Owner**: Full-stack

3. **Bulk Transaction Actions**
   - File: `client/src/pages/transactions.tsx`
   - Add: Selection, bulk categorize, bulk delete
   - **Owner**: Frontend team

---

### P3 - Low (Future enhancements)

1. **Rituals Page**
   - File: Create `client/src/pages/rituals.tsx`
   - Features: Weekly/monthly review workflows
   - **Owner**: Product + Frontend

2. **Rule Quality AI**
   - File: New endpoint in routes.ts
   - Features: Analyze rule effectiveness
   - **Owner**: AI team

3. **Data Export**
   - File: `server/routes.ts`
   - Features: CSV/JSON export endpoints
   - **Owner**: Backend team

---

## File Implementation Checklist

### Backend Files Status

| File | Status | Notes |
|------|--------|-------|
| `server/csv-parser.ts` | ✅ Complete | All 3 formats working |
| `server/rules-engine.ts` | ⚠️ Verify | Check space tokenization |
| `server/routes.ts` | ✅ Core done | Missing: export, rule testing |
| `server/storage.ts` | ✅ Core done | Missing: analytics queries |
| `shared/schema.ts` | ✅ Complete | All tables defined |

### Frontend Files Status

| File | Status | Notes |
|------|--------|-------|
| `client/src/pages/dashboard.tsx` | ⚠️ 70% | Update for commitments, calendar |
| `client/src/pages/uploads.tsx` | ✅ Complete | Working well |
| `client/src/pages/confirm.tsx` | ⚠️ 80% | Improve rule creation |
| `client/src/pages/transactions.tsx` | ⚠️ 60% | Add details drawer, bulk actions |
| `client/src/pages/rules.tsx` | ⚠️ 75% | Make keywords optional, add testing |
| `client/src/pages/goals.tsx` | ⚠️ 65% | Update for leaf_id |
| `client/src/pages/calendar.tsx` | ⚠️ 40% | Add recurrence, projections |
| `client/src/pages/budgets.tsx` | ❌ Missing | **TODO**: Create page |
| `client/src/pages/rituals.tsx` | ❌ Missing | **TODO**: Create page |

### Database Files Status

| Migration | Status | Notes |
|-----------|--------|-------|
| 001_complete_reset_and_schema.sql | ✅ Complete | All tables created |
| 002_seed_taxonomy.sql | ✅ Complete | 109 categories seeded |
| 003_seed_aliases.sql | ✅ Complete | 1000 merchants seeded |
| 004_key_desc_documentation.sql | ✅ Complete | Documentation added |
| 005_add_recurrence_tracking.sql | ✅ Complete | Recurrence fields added |
| 006_fix_category_references.sql | ✅ Complete | leaf_id references added |
| 007_reporting_views_and_indexes.sql | ✅ Complete | Views and functions ready |

---

## Next Steps

1. **Code Review**: Verify rules-engine.ts doesn't split on spaces
2. **UI Updates**: Update all pages for leaf_id taxonomy
3. **Create Missing Pages**: budgets.tsx, rituals.tsx
4. **Add Details Drawer**: Show full transaction info
5. **Test End-to-End**: Upload → Categorize → Dashboard flow

---

**End of Requirements Tracking Document**
