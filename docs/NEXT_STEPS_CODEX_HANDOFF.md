# Next Steps: Codex 5.2 Handoff Guide

**Purpose**: Autonomous work guide for Codex 5.2 to continue development without supervision.

**Last Updated**: 2025-12-28

---

## 1. HOW TO ORIENT (MANDATORY READING ORDER)

### First Session Setup
1. Read this file completely (you are here)
2. Read `CLAUDE.md` (working rules, response style, model usage)
3. Read `docs/ARCHITECTURE_AND_AI_LOGIC.md` (system design, data model)
4. Read `docs/IMPLEMENTATION_LOG.md` (completed work, Phase 0-6C status)
5. Read `docs/QUALITY_ASSURANCE_AND_DEBUG.md` (how to test, debug patterns)

### Before Each Task
1. Run `npm run dev` to verify app starts
2. Visit http://localhost:5000 to check UI state
3. Run through relevant QA checklist from `QUALITY_ASSURANCE_AND_DEBUG.md`
4. Read related page components in `client/src/pages/`

### Key Reference Points
- **Data model**: `shared/schema.ts` (all tables, enums, validators)
- **API endpoints**: `server/routes.ts` (all backend routes)
- **CSV parsing**: `server/csv-parser.ts` (M&M, Amex, Sparkasse parsers)
- **Rules logic**: `server/rules-engine.ts` (keyword matching, confidence)
- **Frontend API**: `client/src/lib/api.ts` (TanStack Query hooks)

---

## 2. UI AS PRIMARY CONTRACT

**Principle**: UI pages define what exists. If feature is not visible/accessible in UI, it does not exist for users.

### Page Inventory (All Screens)

#### `/` (Dashboard)
**Purpose**: Monthly spending overview with budget vs actual
**Actions**:
- View current month spending by category
- See progress bars (actual vs budget)
- Navigate to other pages via sidebar

**Dependencies**:
- `GET /api/dashboard?month=YYYY-MM`
- Transactions table (aggregates by category1)
- Budgets table (target amounts)
- Goals table (monthly planning)

**State**:
- Month selector (current month default)
- Category breakdown list
- Total spending summary

---

#### `/uploads` (CSV Upload)
**Purpose**: Upload and process bank/card CSV files
**Actions**:
- Choose CSV file (M&M, Amex, Sparkasse)
- Upload file
- View upload history (status, rows imported, errors)

**Dependencies**:
- `POST /api/uploads/process` (body: {filename, csvContent})
- `GET /api/uploads` (list all uploads)
- Uploads table
- Transactions table (insertions happen here)
- Accounts table (auto-created from CSV)

**State**:
- File input
- Upload progress (processing → ready → error)
- History table (date, filename, status, rows)

---

#### `/confirm` (Transaction Confirmation Queue)
**Purpose**: Review and categorize transactions that need manual confirmation
**Actions**:
- View transactions with `needsReview = true`
- Select transaction(s)
- Set categories (type, fixVar, category1, category2)
- Bulk confirm selected items
- Trigger AI keyword suggestions (optional)
- Create rule from confirmed transaction

**Dependencies**:
- `GET /api/transactions/confirm-queue`
- `POST /api/transactions/bulk-confirm` (body: {updates: [{id, type, fixVar, category1, category2}]})
- `POST /api/ai/suggest-keyword` (optional, requires OpenAI key)
- `POST /api/rules` (create rule from keyword)
- Transactions table (update needsReview, categories, manualOverride)
- Rules table (insert new rules)

**State**:
- Pending transactions list
- Selection checkboxes
- Category dropdowns
- AI suggestion results (if triggered)

---

#### `/transactions` (Transaction List)
**Purpose**: Browse all transactions with filters
**Actions**:
- View all transactions (paginated or scrollable)
- Filter by account, category, date range
- Search by description
- Edit individual transaction

**Dependencies**:
- `GET /api/transactions?filters=...`
- `PATCH /api/transactions/:id` (edit transaction)
- Transactions table

**State**:
- Transaction list (date, desc, amount, category, account)
- Filter controls (account dropdown, date picker, search input)
- Pagination state

---

#### `/rules` (Rules Management)
**Purpose**: Create and manage keyword-based categorization rules
**Actions**:
- View all rules (sorted by priority)
- Add new rule (keywords, categories, priority, strict flag)
- Edit existing rule
- Delete rule
- Reorder priority

**Dependencies**:
- `GET /api/rules`
- `POST /api/rules` (body: {keywords, type, fixVar, category1, category2, priority, strict})
- `PATCH /api/rules/:id` (update rule)
- `DELETE /api/rules/:id`
- Rules table

**State**:
- Rules list table
- Add/edit form modal
- Priority drag-and-drop (if implemented)

---

#### `/accounts` (Accounts List)
**Purpose**: View all bank/card accounts with balances
**Actions**:
- View accounts (name, type, last 4 digits, balance)
- Filter transactions by account (links to /transactions)
- Edit account details (name, icon, color)

**Dependencies**:
- `GET /api/accounts`
- `PATCH /api/accounts/:id` (update account)
- Accounts table
- Transactions table (balance calculation)

**State**:
- Accounts list (name, type, icon, color, balance)
- Edit modal

---

#### `/goals` (Monthly Budget Planning)
**Purpose**: Set monthly income estimate and category spending targets
**Actions**:
- Select month
- Set estimated income
- Add category goals (category1, target amount)
- View previous month spent vs target
- Save goal

**Dependencies**:
- `GET /api/goals?month=YYYY-MM`
- `POST /api/goals` (body: {month, estimatedIncome, categoryGoals: [{category1, targetAmount}]})
- `PATCH /api/goals/:id`
- Goals table
- CategoryGoals table (breakdown per category)
- Transactions table (historical averages)

**State**:
- Month selector
- Income input
- Category goals list (category, target, previous spent, average)
- Save button

---

#### `/calendar` (Recurring Payments)
**Purpose**: Track recurring bills and payments
**Actions**:
- View upcoming recurring payments
- Add new recurring event (name, amount, frequency, start date)
- Edit/delete event
- Mark as paid (creates transaction)

**Dependencies**:
- `GET /api/calendar-events`
- `POST /api/calendar-events` (body: {name, amount, frequency, startDate})
- `PATCH /api/calendar-events/:id`
- `DELETE /api/calendar-events/:id`
- CalendarEvents table

**State**:
- Calendar view (month/list)
- Event list (name, amount, next due date)
- Add/edit modal

---

#### `/settings` (User Settings)
**Purpose**: Configure app preferences
**Actions**:
- Set OpenAI API key (for AI features)
- Set auto-confirm threshold (50-100%)
- Set default currency
- Set locale/language
- Manage user profile

**Dependencies**:
- `GET /api/auth/me`
- `PATCH /api/auth/me` (body: {openaiApiKey, autoConfirmThreshold, ...})
- Users table

**State**:
- Settings form (API key input, threshold slider, currency dropdown)
- Save button

---

#### `/ai-keywords` (AI Bulk Analysis)
**Purpose**: Analyze multiple uncategorized transactions with AI
**Actions**:
- View all uncategorized transactions
- Select transactions to analyze
- Trigger AI batch analysis
- Review AI suggestions
- Bulk apply categories

**Dependencies**:
- `GET /api/transactions?needsReview=true`
- `POST /api/ai/bulk-categorize` (body: {transactionIds: [...]})
- `POST /api/transactions/bulk-confirm`
- Transactions table
- OpenAI API (requires key)

**State**:
- Uncategorized transactions list
- AI analysis results (keyword suggestions per transaction)
- Bulk apply controls

---

#### `/budgets` (Budget Management)
**Purpose**: Set and track monthly budgets by category (legacy/alternate to /goals)
**Actions**:
- View budgets for selected month
- Set budget amount per category1
- Compare budget vs actual spending

**Dependencies**:
- `GET /api/budgets?month=YYYY-MM`
- `POST /api/budgets` (body: {month, category1, amount})
- `PATCH /api/budgets/:id`
- Budgets table
- Transactions table (actual spending)

**State**:
- Month selector
- Budget list (category, budgeted, actual, variance)
- Add/edit controls

**NOTE**: Overlap with `/goals` - consider consolidating in future.

---

#### `/rituals` (Rituals Feature)
**Purpose**: [UNKNOWN - needs investigation]
**Actions**: [TO BE DETERMINED]
**Dependencies**: [TO BE DETERMINED]

**TODO**: Investigate rituals.tsx to document purpose.

---

#### `/login` (Authentication)
**Purpose**: User login (currently auto-creates "demo" user)
**Actions**:
- Enter credentials (auto-creates if not exists)
- Submit login

**Dependencies**:
- `POST /api/auth/login` (body: {username, password})
- Users table

**State**:
- Username/password inputs
- Login button
- Auth error messages

---

### UI Validation Checklist

Before marking a feature "complete":
- [ ] Page is accessible via navigation (sidebar link exists)
- [ ] All actions listed above work without errors
- [ ] Form validation shows user-friendly errors
- [ ] Loading states display during API calls
- [ ] Success/error notifications appear
- [ ] Page is responsive (mobile-friendly)
- [ ] No console errors on page load or interaction

---

## 3. EXECUTION LOOP (MANDATORY STEPS)

### For Every Task

**STEP 1: PLAN**
1. Read task description completely
2. Identify which UI pages are affected
3. List files to modify (frontend + backend + schema if needed)
4. Check if schema changes required → add to plan
5. Estimate complexity (simple, medium, complex)
6. If complex: ask for permission to switch to Opus model (see CLAUDE.md)

**STEP 2: DOCUMENT PLAN**
1. Open `docs/IMPLEMENTATION_LOG.md`
2. Add new section with date: `## Phase X: [Feature Name] (PLAN) - YYYY-MM-DD`
3. Write:
   - What will be implemented
   - Why (user benefit)
   - Files to modify
   - Key decisions (A vs B, why A chosen)
   - Acceptance criteria (how to test)
4. Save before writing any code

**STEP 3: IMPLEMENT**
1. Start with schema changes if needed (`shared/schema.ts`)
2. Run `npm run db:push` to apply schema
3. Add backend API endpoint in `server/routes.ts`
4. Add storage method in `server/storage.ts` if needed
5. Update frontend API client `client/src/lib/api.ts`
6. Modify/create UI component in `client/src/pages/`
7. Test incrementally (run dev server, check browser)

**STEP 4: TEST**
1. Run `npm run check` (TypeScript validation)
2. Start dev server: `npm run dev`
3. Manually test all actions in affected UI pages
4. Run through relevant QA checklist in `QUALITY_ASSURANCE_AND_DEBUG.md`
5. Check browser console for errors
6. Check server logs for warnings/errors

**STEP 5: DOCUMENT RESULTS**
1. Open `docs/IMPLEMENTATION_LOG.md`
2. Update plan section with results:
   - What was implemented
   - Any deviations from plan (why)
   - Test results (pass/fail)
   - Known issues or limitations
3. Update `docs/ARCHITECTURE_AND_AI_LOGIC.md` if architecture changed
4. Save documentation

**STEP 6: COMMIT**
1. Only commit if ALL tests pass
2. Git commit message format:
   ```
   [Phase X] Brief description of change

   - What changed
   - Why
   - Files modified

   Generated with Claude Code
   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   ```
3. Push to repository

---

## 4. PRIORITIZED NEXT STEPS (UI-FIRST ROADMAP)

### Phase 7: Transaction Editing & Manual Overrides (HIGH PRIORITY)

**User Problem**: Cannot edit already-categorized transactions
**UI Impact**: `/transactions` page needs edit functionality

**Tasks**:
1. Add "Edit" button to each transaction row in `/transactions`
2. Create edit modal with category dropdowns
3. Add `PATCH /api/transactions/:id` endpoint
4. Set `manualOverride = true` when user edits
5. Prevent rules from re-categorizing manual overrides

**Files to Modify**:
- `client/src/pages/transactions.tsx` (add edit UI)
- `server/routes.ts` (add PATCH endpoint)
- `server/storage.ts` (add updateTransaction method)

**Acceptance Criteria**:
- [ ] Click edit on transaction → modal opens
- [ ] Change category → save → transaction updated
- [ ] `manualOverride = true` in database
- [ ] Re-uploading same transaction does not overwrite manual changes

---

### Phase 8: Account Filtering & Multi-Account Dashboard (MEDIUM PRIORITY)

**User Problem**: Cannot filter spending by specific account/card
**UI Impact**: `/dashboard` needs account filter dropdown

**Tasks**:
1. Add account filter dropdown to `/dashboard`
2. Update `GET /api/dashboard` to accept `accountId` parameter
3. Filter transactions by accountId in SQL query
4. Show "All Accounts" vs "Amex - Vinicius (1009)" in UI
5. Add same filter to `/transactions` page

**Files to Modify**:
- `client/src/pages/dashboard.tsx` (add filter UI)
- `client/src/pages/transactions.tsx` (add filter UI)
- `server/routes.ts` (add accountId to query)
- `server/storage.ts` (update getDashboard query)

**Acceptance Criteria**:
- [ ] Dashboard shows dropdown with all accounts
- [ ] Selecting account filters spending totals
- [ ] Progress bars reflect selected account only
- [ ] "All Accounts" shows combined view

---

### Phase 9: Internal Transfer Detection & Exclusion (MEDIUM PRIORITY)

**User Problem**: Transfers between own accounts inflate spending totals
**UI Impact**: `/confirm` page needs "Mark as Internal Transfer" option

**Tasks**:
1. Add checkbox "Internal Transfer" to confirmation modal
2. Set `internalTransfer = true` when checked
3. Exclude internal transfers from dashboard totals
4. Add visual indicator (icon/badge) for internal transfers in transaction list
5. Create auto-detection rule (e.g., "Transfer to account XXXX")

**Files to Modify**:
- `client/src/pages/confirm.tsx` (add checkbox)
- `client/src/pages/transactions.tsx` (add badge)
- `server/routes.ts` (update bulk-confirm logic)
- `server/storage.ts` (update getDashboard to exclude internalTransfer)

**Acceptance Criteria**:
- [ ] Check "Internal Transfer" → transaction excluded from budgets
- [ ] Dashboard totals exclude internal transfers
- [ ] Transaction list shows transfer icon
- [ ] Rule can auto-detect transfers (optional)

---

### Phase 10: Enhanced Error Handling & User Feedback (HIGH PRIORITY)

**User Problem**: Generic "Upload failed" messages are not actionable
**UI Impact**: All pages need better error messages

**Tasks**:
1. Add row-level error reporting in CSV upload
2. Show which rows failed and why (invalid date, missing columns)
3. Add toast notifications for success/error
4. Distinguish validation errors (400) from server errors (500)
5. Add retry button for network failures

**Files to Modify**:
- `server/csv-parser.ts` (track per-row errors)
- `server/routes.ts` (return detailed error responses)
- `client/src/lib/api.ts` (parse error codes)
- `client/src/components/ui/toast.tsx` (add toast component)
- All pages (add toast notifications)

**Acceptance Criteria**:
- [ ] Upload shows "Row 15: Invalid date format (23/99/2025)"
- [ ] API errors show user-friendly messages
- [ ] Network failures show retry button
- [ ] Success actions show green toast

---

### Phase 11: Rule Priority Management UI (LOW PRIORITY)

**User Problem**: Cannot reorder rule priority in UI
**UI Impact**: `/rules` page needs drag-and-drop or priority editing

**Tasks**:
1. Add "Move Up" / "Move Down" buttons to each rule row
2. Implement drag-and-drop reordering (optional, use react-dnd)
3. Update priority values in database when reordered
4. Show visual indicator of priority (higher = applied first)

**Files to Modify**:
- `client/src/pages/rules.tsx` (add reordering UI)
- `server/routes.ts` (add PATCH /api/rules/reorder endpoint)
- `server/storage.ts` (add reorderRules method)

**Acceptance Criteria**:
- [ ] Drag rule up → priority increases
- [ ] Click "Move Down" → priority decreases
- [ ] Changes saved to database
- [ ] Rules engine respects new priority order

---

### Phase 12: AI Cost Tracking & Quota Management (MEDIUM PRIORITY)

**User Problem**: No visibility into AI usage costs
**UI Impact**: `/settings` page needs AI usage dashboard

**Tasks**:
1. Track AI API calls (count, tokens used, estimated cost)
2. Add `aiUsage` table (userId, month, apiCalls, tokensUsed, estimatedCost)
3. Show monthly AI usage in `/settings`
4. Add quota limit (e.g., "50 requests/month")
5. Disable AI features when quota exceeded

**Files to Modify**:
- `shared/schema.ts` (add aiUsage table)
- `server/routes.ts` (track AI calls in POST /api/ai/*)
- `server/storage.ts` (add getAiUsage, updateAiUsage)
- `client/src/pages/settings.tsx` (display usage stats)

**Acceptance Criteria**:
- [ ] AI call increments counter in database
- [ ] Settings page shows "25 requests used this month"
- [ ] Quota exceeded → AI button disabled
- [ ] User can see estimated cost

---

### Phase 13: Consolidate Budgets & Goals Pages (LOW PRIORITY)

**User Problem**: `/budgets` and `/goals` overlap in functionality
**UI Impact**: Merge into single `/goals` page

**Tasks**:
1. Audit both pages to identify unique features
2. Migrate unique features to `/goals`
3. Deprecate `/budgets` page (redirect to `/goals`)
4. Update navigation sidebar
5. Migrate existing budgets data to goals format (if needed)

**Files to Modify**:
- `client/src/pages/goals.tsx` (merge features)
- `client/src/pages/budgets.tsx` (delete or redirect)
- `client/src/App.tsx` (update routing)
- `shared/schema.ts` (migrate budgets → categoryGoals if needed)

**Acceptance Criteria**:
- [ ] All budget features available in /goals
- [ ] /budgets redirects to /goals
- [ ] No functionality lost
- [ ] Existing data migrated

---

### Phase 14: Investigate & Document Rituals Feature (MEDIUM PRIORITY)

**User Problem**: Unknown what `/rituals` page does
**UI Impact**: Document or remove if unused

**Tasks**:
1. Read `client/src/pages/rituals.tsx` to understand purpose
2. Test rituals page in browser
3. Document in `ARCHITECTURE_AND_AI_LOGIC.md`
4. If unused/incomplete: remove from navigation or mark as "TODO"

**Files to Modify**:
- `docs/ARCHITECTURE_AND_AI_LOGIC.md` (add rituals section)
- This file (update rituals description in Section 2)

**Acceptance Criteria**:
- [ ] Rituals feature documented
- [ ] Purpose clear
- [ ] Dependencies listed
- [ ] Or: Feature removed if unused

---

### Phase 15: Multi-User Support & Authentication (LONG-TERM)

**User Problem**: All users share "demo" account data
**UI Impact**: Add proper login, user isolation

**Tasks**:
1. Remove "demo" user auto-creation
2. Add user registration flow
3. Add row-level security in database (all queries filter by userId)
4. Add session management with PostgreSQL store
5. Add logout functionality

**Files to Modify**:
- `server/routes.ts` (remove demo user logic)
- `server/storage.ts` (enforce userId in all queries)
- `client/src/pages/login.tsx` (add registration)
- Database schema (add userId indexes)

**Acceptance Criteria**:
- [ ] New user can register
- [ ] User data isolated (cannot see other users' transactions)
- [ ] Session persists across page reloads
- [ ] Logout clears session

---

## 5. DECISION & SAFETY RULES

### When to Ask for Permission

**ALWAYS ASK** before:
1. Deleting database tables or columns
2. Changing schema in breaking ways (rename columns, change types)
3. Switching to Opus model (cost increase)
4. Implementing features NOT in this roadmap (scope creep)
5. Modifying authentication/security logic
6. Changing API response formats (breaks frontend)

**NEVER DO** without explicit request:
1. Force push to main branch
2. Delete production data
3. Disable error handling
4. Remove validation logic
5. Commit commented-out code or TODOs
6. Add dependencies without justification

### How to Handle Ambiguity

**If task is unclear**:
1. State assumptions explicitly
2. Propose 2-3 options with pros/cons
3. Ask user to choose
4. Document chosen option in IMPLEMENTATION_LOG.md

**If implementation has trade-offs**:
1. Document trade-off in Decision Log (IMPLEMENTATION_LOG.md)
2. Explain why Option A chosen over Option B
3. Note when to revisit decision (e.g., "if user count > 1000")

### Code Quality Standards

**Before committing code**:
- [ ] `npm run check` passes (no TypeScript errors)
- [ ] No console.log() statements (use proper logging)
- [ ] No commented-out code blocks
- [ ] Zod validators added for new API endpoints
- [ ] Error handling added for all async operations
- [ ] SQL queries use parameterized inputs (prevent injection)

**Prefer**:
- Small, focused commits over large batches
- Explicit over clever (readability over brevity)
- Existing patterns over new abstractions
- User-facing error messages over technical jargon

---

## 6. DEFINITION OF DONE

### For Each Phase/Feature

A task is "done" when ALL of the following are true:

**Code**:
- [ ] All files modified and saved
- [ ] TypeScript compiles without errors (`npm run check`)
- [ ] No linter warnings
- [ ] Code follows existing patterns (no new abstractions)

**Testing**:
- [ ] Manual testing performed (all UI actions work)
- [ ] Relevant QA checklist items from `QUALITY_ASSURANCE_AND_DEBUG.md` passed
- [ ] Edge cases tested (empty state, errors, invalid input)
- [ ] No console errors in browser or server logs

**Documentation**:
- [ ] `docs/IMPLEMENTATION_LOG.md` updated with plan + results
- [ ] `docs/ARCHITECTURE_AND_AI_LOGIC.md` updated if architecture changed
- [ ] This file updated if new pages/features added
- [ ] Code comments added for complex logic

**Git**:
- [ ] Changes committed with descriptive message
- [ ] Commit includes Co-Authored-By line
- [ ] Pushed to repository
- [ ] No uncommitted changes remain

**User Impact**:
- [ ] Feature is accessible via UI (page exists in navigation)
- [ ] Feature solves stated user problem
- [ ] No regression (existing features still work)
- [ ] Performance acceptable (page loads < 2s)

### For Entire Session

At end of work session:
- [ ] All phases completed have "done" criteria met
- [ ] `IMPLEMENTATION_LOG.md` has complete record of work
- [ ] All code committed and pushed
- [ ] Any blockers or TODOs documented in log
- [ ] Clear summary of what was done + what's next

---

## GETTING STARTED (FIRST TASK)

**Recommended First Task**: Phase 7 (Transaction Editing)

**Why**:
- High user value (cannot edit transactions currently)
- Touches all layers (UI, API, database)
- Low risk (does not change existing data)
- Good complexity for learning codebase

**Steps**:
1. Read Phase 7 description in Section 4
2. Follow Execution Loop in Section 3
3. Start with STEP 1: PLAN
4. Document plan in `IMPLEMENTATION_LOG.md`
5. Implement, test, document, commit

**Expected Time**: 2-3 hours for complete implementation

---

**END OF HANDOFF GUIDE**

**Questions?** Refer to `CLAUDE.md` for response style and `QUALITY_ASSURANCE_AND_DEBUG.md` for debugging.

**Remember**: UI is the contract. If it's not in the UI, it doesn't exist for users.
