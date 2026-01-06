# Phase A — E2E UX Upgrade & Execution Plan

**Status**: Histórico. As diretrizes atuais de IA, contratos de tela e roadmap estão em `docs/UX_UI_MASTER_PLAN.md` e `docs/IMPLEMENTATION_ROADMAP.md`.

**Project**: RitualFin UI/UX Overhaul
**Date**: 2025-12-28
**Designer**: Claude (Senior UX Engineer + Product Designer)
**Objective**: Elevate RitualFin to production-ready, adult, calm interface inspired by design mockups

---

## EXECUTIVE SUMMARY

### Current State Assessment

**FINDING**: RitualFin already has a **highly polished, modern UI** (85% complete).

The application has:
- ✅ Modern teal/green color scheme
- ✅ shadcn/ui component library throughout
- ✅ Card-based layouts
- ✅ Sophisticated dashboard with insights & projections
- ✅ Drag-and-drop CSV upload
- ✅ Confidence-based confirmation flow
- ✅ Comprehensive account & goal management
- ✅ Settings with tabbed navigation

**What's missing**:
- Bank logo integration & smart detection feedback
- Rich transaction detail modal
- Account balance display
- Merchant icons in transaction lists
- AI assistant chat interface (UI only)
- Onboarding wizard
- Enhanced empty states & loading skeletons
- Notifications page
- Rituals page clarity
- Mobile refinements

---

## E2E USER JOURNEY ANALYSIS

### 1. First-Time User (Onboarding)

**Current Flow**:
1. Login page → Auto-creates "demo" user → Dashboard
2. **FRICTION**: No guided tour, user sees empty dashboard
3. **FRICTION**: No clear "what should I do next?"

**Target Flow**:
1. Login → Welcome modal → "Let's set up your first upload"
2. Bank selection → Upload CSV → Real-time categorization
3. Confirmation → "Great! You're all set" → Dashboard with data

**UX Improvements** (UI-only):
- Add welcome modal on first login
- Add empty state with CTA "Upload your first CSV"
- Add progress indicator (Step 1 of 3)
- Add tooltips on first interaction

**Requires Backend** (Codex):
- Track onboarding progress (users.onboardingCompleted)
- Welcome email trigger

---

### 2. CSV Upload Flow

**Current State**: ✅ Modern drag-drop, progress bars, upload history

**Gaps**:
- No bank logo display
- No smart detection feedback ("We detected American Express")
- No pre-upload validation hints
- No row-level error reporting

**UX Improvements** (UI-only):
- Add bank logo library (M&M, Amex, Sparkasse, Nubank, etc.)
- Add detection feedback card: "✓ Detected American Express — 426 transactions"
- Add file validation hints before upload
- Improve upload history with bank logos

**Requires Backend** (Codex):
- Row-level error tracking (line 15: invalid date)
- Bank logo CDN/static assets

---

### 3. Transaction Confirmation

**Current State**: ✅ Excellent confidence-based UI with tabs, bulk actions

**Gaps**:
- No merchant icons (Netflix, Amazon, Uber Eats)
- No "create rule from this" quick action
- No keyboard shortcuts (Enter to confirm, Esc to cancel)

**UX Improvements** (UI-only):
- Add merchant icon mapping (top 50 merchants)
- Add keyboard shortcuts overlay (press ?)
- Add "Save as rule" button in row actions
- Improve mobile swipe gestures

**Requires Backend** (Codex):
- Merchant icon API/database
- Keyboard shortcut event handlers

---

### 4. Transaction Detail View

**Current State**: ⚠️ Only has edit modal (category dropdowns)

**Design Target**: Rich detail modal with:
- Merchant logo/icon
- Full description + metadata (location, payment type)
- Category hierarchy visualization
- Related transactions ("You spent €45 at Uber Eats 3 times this month")
- Quick actions (duplicate, split, mark as refund)

**UX Improvements** (UI-only):
- Create new TransactionDetailModal component
- Add merchant icon at top
- Add category breadcrumb (Lazer → Alimentação → Uber Eats)
- Add related transactions sidebar
- Add quick action buttons

**Requires Backend** (Codex):
- Related transactions query
- Merchant metadata

---

### 5. Accounts Page

**Current State**: ✅ Clean card-based layout

**Gaps**:
- No balance display on cards
- No transaction count
- No "last activity" timestamp
- No spending trend (↑ 12% vs last month)

**UX Improvements** (UI-only):
- Add balance display (requires backend data)
- Add placeholder skeleton for balance loading
- Add visual spending indicator
- Improve account card hover states

**Requires Backend** (Codex):
- Account balance calculation
- Transaction count aggregation
- Spending trend analysis

---

### 6. Dashboard Insights

**Current State**: ✅ Sophisticated with projections, category breakdowns

**Gaps**:
- No merchant icons in recent activity
- No actionable insights ("You saved €50 in Lazer this month!")
- No quick filters (This week, This month, Custom)
- No export dashboard as PDF

**UX Improvements** (UI-only):
- Add merchant icons to recent transactions
- Add date range selector
- Add "Export as PDF" button (UI placeholder)
- Improve mobile chart rendering

**Requires Backend** (Codex):
- PDF export generation
- Custom date range queries

---

### 7. Goals & Budgets

**Current State**: ✅ Comprehensive with AI suggestions, progress bars

**Gaps**:
- AI suggestion is hardcoded ("15% increase in Alimentação")
- No historical goal performance chart
- No goal templates ("Typical family of 4")

**UX Improvements** (UI-only):
- Add goal template selector
- Add historical performance chart (client-side)
- Improve mobile layout for category inputs
- Add visual "on track" / "at risk" indicators

**Requires Backend** (Codex):
- Real AI analysis for suggestions
- Goal template data
- Historical goal tracking

---

### 8. Settings Page

**Current State**: ✅ Tabbed interface with good coverage

**Gaps**:
- Integrations tab shows Amex/Sparkasse as "Em breve" (already implemented!)
- No AI usage stats (API calls, tokens, estimated cost)
- No notification preferences (email, push)

**UX Improvements** (UI-only):
- Update integrations tab to show Amex/Sparkasse as "Ativo"
- Add AI usage dashboard (placeholder data)
- Add notification preference toggles (UI only)
- Add theme preview before applying

**Requires Backend** (Codex):
- AI usage tracking table
- Notification preference storage
- Theme persistence

---

### 9. AI Assistant (NEW FEATURE)

**Current State**: ❌ Not implemented

**Design Target**: Floating chat button → Modal with AI conversation

**UX Improvements** (UI-only):
- Add floating chat button (bottom-right)
- Create ChatModal component
- Add conversation UI (messages, input, typing indicator)
- Add quick actions ("Analyze this month", "Suggest savings")
- Add conversation history sidebar

**Requires Backend** (Codex):
- OpenAI streaming integration
- Conversation storage
- Context-aware prompts

---

### 10. Notifications Page (NEW FEATURE)

**Current State**: ❌ Not implemented (design mockup exists)

**Design Target**: Timeline of system notifications

**UX Improvements** (UI-only):
- Create notifications page layout
- Add notification cards (unread indicator, timestamp, action buttons)
- Add filter tabs (All, Unread, Important)
- Add mark-all-as-read button

**Requires Backend** (Codex):
- Notifications table
- Notification creation triggers
- Mark as read API

---

### 11. Rituals Page

**Current State**: ⚠️ Page exists but unclear purpose

**Action Required**: Investigate and document OR remove if unused

**UX Improvements** (UI-only):
- TBD after investigation

**Requires Backend** (Codex):
- TBD

---

## FRICTION POINTS IDENTIFIED

### High Priority (User Blockers)

1. **No onboarding guidance** → Users don't know where to start
2. **No transaction detail view** → Can't see full transaction context
3. **No balance on accounts** → Can't track account balances
4. **No merchant icons** → Transactions look generic
5. **Integrations tab misleading** → Says Amex/Sparkasse "coming soon" but already work

### Medium Priority (UX Polish)

6. **Generic loading states** → Should use skeleton screens
7. **No keyboard shortcuts** → Power users can't navigate quickly
8. **Mobile responsiveness gaps** → Some tables overflow on mobile
9. **Empty states minimal** → Could be more encouraging
10. **No AI assistant** → "Lazy Mode" promise not fully delivered

### Low Priority (Nice-to-Have)

11. **No weekly review** → Design exists but not built
12. **No notification center** → No way to see system messages
13. **Export features incomplete** → PDF export not implemented
14. **No goal templates** → Users start from scratch

---

## PRIORITIZATION RATIONALE

### P0 — Critical UX Improvements (Implement Now)

**Why**: These fix user blockers and misleading UI

1. **Bank logos & detection feedback** (uploads page)
   - Impact: HIGH — Users see what bank was detected
   - Effort: LOW — Static assets + UI update
   - Dependencies: None

2. **Transaction detail modal** (transactions page)
   - Impact: HIGH — Users need rich transaction context
   - Effort: MEDIUM — New component, no backend changes
   - Dependencies: Merchant icon library

3. **Update integrations tab** (settings)
   - Impact: HIGH — Currently misleading (says "coming soon" for working features)
   - Effort: LOW — Text and badge updates
   - Dependencies: None

4. **Merchant icon library** (global)
   - Impact: HIGH — Makes transactions recognizable
   - Effort: MEDIUM — Icon mapping + fallback logic
   - Dependencies: None (use Lucide icons + custom)

5. **Onboarding welcome modal** (login/dashboard)
   - Impact: HIGH — First impression, guides new users
   - Effort: LOW — Modal component with steps
   - Dependencies: None (client-side only)

### P1 — Important Polish (Implement Soon)

**Why**: These improve daily usage significantly

6. **Account balance display** (accounts page)
   - Impact: MEDIUM — Users expect to see balances
   - Effort: LOW (UI) + MEDIUM (Backend) → UI placeholder now, Codex backend later
   - Dependencies: **Backend required**

7. **Skeleton loading states** (all pages)
   - Impact: MEDIUM — Reduces perceived latency
   - Effort: LOW — Replace spinners with skeletons
   - Dependencies: None

8. **Improved empty states** (all pages)
   - Impact: MEDIUM — Encourages action
   - Effort: LOW — Better copy + illustrations
   - Dependencies: None

9. **Keyboard shortcuts** (confirm, transactions)
   - Impact: MEDIUM — Power user efficiency
   - Effort: MEDIUM — Event handlers + help overlay
   - Dependencies: None (client-side only)

10. **Mobile refinements** (all pages)
    - Impact: MEDIUM — Mobile usage is common
    - Effort: MEDIUM — Responsive table fixes, touch gestures
    - Dependencies: None

### P2 — Delegated Features (Codex Implementation)

**Why**: These require backend work, will be fully spec'd for Codex

11. **AI Assistant Chat** (global)
    - Impact: HIGH — Fulfills "Lazy Mode" promise
    - Effort: HIGH — UI (me) + Backend (Codex)
    - Dependencies: OpenAI streaming API

12. **Notifications Page** (new page)
    - Impact: MEDIUM — Centralized system messages
    - Effort: MEDIUM — UI (me) + Backend (Codex)
    - Dependencies: Notification system

13. **Account balance backend** (API)
    - Impact: HIGH — Required for account cards
    - Effort: MEDIUM — Aggregation query
    - Dependencies: None

14. **Row-level CSV errors** (uploads)
    - Impact: MEDIUM — Better debugging
    - Effort: MEDIUM — Parser error tracking
    - Dependencies: CSV parser changes

15. **AI usage dashboard** (settings)
    - Impact: LOW — Transparency for API usage
    - Effort: MEDIUM — Tracking + display
    - Dependencies: AI usage tracking table

---

## WHAT I WILL IMPLEMENT (UI-ONLY)

### Session 1: Critical Fixes

**Duration**: 2-3 hours
**Goal**: Fix misleading UI and add core missing pieces

1. ✅ **Bank Logo Library**
   - Files: `client/src/lib/bank-logos.ts`, `client/src/components/bank-badge.tsx`
   - Add logos for: M&M, Amex, Sparkasse, Nubank, Revolut, N26
   - Use Lucide icons as fallback

2. ✅ **Upload Page: Detection Feedback**
   - File: `client/src/pages/uploads.tsx`
   - Add bank logo to upload history cards
   - Add detection result card after processing

3. ✅ **Settings: Update Integrations Tab**
   - File: `client/src/pages/settings.tsx`
   - Change Amex/Sparkasse from "Em breve" to "Ativo"
   - Add badge with transaction count

4. ✅ **Merchant Icon Library**
   - File: `client/src/lib/merchant-icons.ts`
   - Map top 50 merchants to Lucide icons
   - Examples: Netflix → Film, Amazon → Package, Uber Eats → Utensils

5. ✅ **Transaction Detail Modal**
   - File: `client/src/components/transaction-detail-modal.tsx`
   - Create rich detail view
   - Add merchant icon, category breadcrumb, metadata
   - Wire to transactions page and confirm page

### Session 2: UX Polish

**Duration**: 2-3 hours
**Goal**: Improve loading states, empty states, onboarding

6. ✅ **Onboarding Welcome Modal**
   - File: `client/src/components/onboarding-modal.tsx`
   - 3-step wizard: Welcome → Upload → Confirm
   - Show on first login (check localStorage)

7. ✅ **Skeleton Loading States**
   - Files: All pages with `isLoading` spinners
   - Replace with shadcn/ui Skeleton components
   - Match card/table layouts

8. ✅ **Improved Empty States**
   - Files: All pages with empty data checks
   - Add illustrations (Lucide icons)
   - Better CTAs ("Upload your first CSV" vs "No data")

9. ✅ **Keyboard Shortcuts**
   - File: `client/src/hooks/use-keyboard-shortcuts.ts`
   - Add shortcuts: Enter (confirm), Esc (close), ? (help)
   - Add help overlay component

10. ✅ **Mobile Refinements**
    - Files: All table-heavy pages
    - Add horizontal scroll shadows
    - Improve touch targets
    - Stack cards on mobile

### Session 3: Nice-to-Have Features

**Duration**: 1-2 hours
**Goal**: Add polish and delight

11. ✅ **Account Balance Placeholder**
    - File: `client/src/pages/accounts.tsx`
    - Add balance display with "Calculating..." state
    - Prepare for Codex backend integration

12. ✅ **AI Assistant UI (Shell)**
    - Files: `client/src/components/ai-assistant-button.tsx`, `client/src/components/ai-chat-modal.tsx`
    - Floating button (bottom-right)
    - Chat modal with message list
    - Input with send button
    - Placeholder responses (no backend)

13. ✅ **Notifications Page (Shell)**
    - File: `client/src/pages/notifications.tsx`
    - Basic layout with mock notifications
    - Filter tabs (All, Unread)
    - Mark as read button (UI only)

14. ✅ **Rituals Page Investigation**
    - File: `client/src/pages/rituals.tsx`
    - Read code, document purpose
    - Update UI or mark for removal

---

## WHAT CODEX WILL IMPLEMENT (BACKEND)

### Delegation Package 1: Account Balances

**Task**: Calculate and expose account balances
**Goal**: Power account card balance display
**UX Intent**: Users expect to see current balance on each account

**Screens Involved**:
- `/accounts` — Account cards with balance

**Interaction Rules**:
- Balance updates in real-time when transactions change
- Balance = SUM(transactions.amount) WHERE accountId = X
- Exclude internal transfers from balance calculation

**Required Data**:
- `GET /api/accounts/:id/balance` → `{ balance: number, lastTransactionDate: string }`
- `GET /api/accounts` (add `balance` field to response)

**Acceptance Criteria**:
- ✅ Account cards show balance
- ✅ Balance recalculates on new upload
- ✅ Internal transfers excluded

**What Must NOT Change**:
- Account card layout (just add balance text)
- Account creation/edit flow

**Dependencies**:
- Transactions table
- Accounts table

---

### Delegation Package 2: AI Assistant Backend

**Task**: OpenAI streaming chat integration
**Goal**: Power AI chat modal
**UX Intent**: Users ask questions, get instant AI analysis

**Screens Involved**:
- Floating chat button (global)
- AI Chat Modal (overlay)

**Interaction Rules**:
- Click chat button → Open modal with conversation history
- Type message → Send → Streaming response (word-by-word)
- Quick actions: "Analyze this month", "Suggest savings", "Find duplicates"
- Context-aware: AI knows current month, user's data

**Required Data**:
- `POST /api/ai/chat` (body: { message: string, conversationId?: string })
- Response: Server-Sent Events (SSE) stream
- `GET /api/ai/conversations` → List of past conversations
- `DELETE /api/ai/conversations/:id` → Delete conversation

**Acceptance Criteria**:
- ✅ User sends message → AI responds with streaming
- ✅ Conversation history persists
- ✅ Quick actions work
- ✅ AI has access to user's transaction data

**What Must NOT Change**:
- Chat modal UI (already built)
- Floating button position

**Dependencies**:
- OpenAI API integration
- Conversations table (id, userId, messages JSON, createdAt)

---

### Delegation Package 3: CSV Row-Level Error Reporting

**Task**: Track and display per-row CSV parsing errors
**Goal**: Help users fix invalid CSV files
**UX Intent**: User sees "Row 15: Invalid date format (32/13/2025)"

**Screens Involved**:
- `/uploads` — Upload result card

**Interaction Rules**:
- After upload, show errors in expandable section
- "23 rows imported, 2 errors" → Click → See error list
- Each error shows: Row number, column name, error reason, raw value

**Required Data**:
- Modify `POST /api/uploads/process` response:
  ```json
  {
    "rowsImported": 23,
    "rowsTotal": 25,
    "errors": [
      { "row": 15, "column": "Datum", "error": "Invalid date format", "value": "32/13/2025" },
      { "row": 18, "column": "Betrag", "error": "Amount must be numeric", "value": "ABC" }
    ]
  }
  ```

**Acceptance Criteria**:
- ✅ Upload shows error count
- ✅ User can expand to see error details
- ✅ Errors include row number, column, reason
- ✅ Valid rows still import (partial success)

**What Must NOT Change**:
- Upload page layout
- Successful import flow

**Dependencies**:
- CSV parser error collection

---

### Delegation Package 4: Merchant Icon API

**Task**: Store and serve merchant metadata
**Goal**: Show correct logo for Netflix, Amazon, etc.
**UX Intent**: Transactions instantly recognizable by logo

**Screens Involved**:
- `/transactions` — Transaction list
- `/confirm` — Confirmation queue
- `/dashboard` — Recent activity
- Transaction detail modal

**Interaction Rules**:
- Merchant detected from descRaw (keyword matching)
- Fallback to generic category icon if no match
- Admin can add new merchants via settings (future)

**Required Data**:
- `GET /api/merchants` → `[{ name: "Netflix", icon: "film", color: "#e50914", keywords: ["netflix"] }]`
- Frontend matches descNorm against keywords
- Or: Backend adds `merchantId` during CSV processing

**Acceptance Criteria**:
- ✅ Top 50 merchants show correct icon
- ✅ Unknown merchants show category icon
- ✅ Icons display in all transaction views

**What Must NOT Change**:
- Transaction table schema (just add merchantId FK)
- CSV parsing flow (add merchant detection step)

**Dependencies**:
- Merchants table (id, name, icon, color, keywords[])
- Transaction.merchantId (optional FK)

---

### Delegation Package 5: AI Usage Tracking

**Task**: Track AI API calls and costs
**Goal**: Show usage stats in settings
**UX Intent**: Users understand AI cost/quota

**Screens Involved**:
- `/settings` — Integrations tab → AI Usage card

**Interaction Rules**:
- Display: "25 requests this month, ~€0.15 estimated cost"
- Monthly reset
- Warning at 80% of quota
- Option to disable AI if over budget

**Required Data**:
- `GET /api/ai/usage?month=2025-12` → `{ requests: 25, tokensUsed: 15000, estimatedCost: 0.15, quota: 100 }`
- Backend logs each AI call (timestamp, tokens, model)

**Acceptance Criteria**:
- ✅ Settings shows current month AI usage
- ✅ User can see historical usage (chart)
- ✅ Quota warning appears at 80%
- ✅ User can disable AI to avoid charges

**What Must NOT Change**:
- Settings page layout
- AI feature UI

**Dependencies**:
- aiUsage table (userId, month, requests, tokensUsed, cost)
- AI call interceptor (log before/after OpenAI request)

---

### Delegation Package 6: Notification System

**Task**: Backend notification creation and delivery
**Goal**: Power notifications page
**UX Intent**: Users see "New transactions uploaded", "Budget exceeded"

**Screens Involved**:
- `/notifications` — Notification feed
- Top navbar — Notification bell with count badge

**Interaction Rules**:
- System creates notifications on events:
  - CSV upload complete → "23 transactions imported"
  - Budget exceeded → "You've spent €250/€200 in Lazer"
  - Weekly review ready → "Your week in review is ready"
- User clicks notification → Mark as read → Navigate to related page

**Required Data**:
- `GET /api/notifications` → `[{ id, title, message, createdAt, isRead, actionUrl }]`
- `POST /api/notifications/:id/read` → Mark as read
- `POST /api/notifications/read-all` → Mark all as read

**Acceptance Criteria**:
- ✅ Notifications created on events
- ✅ User sees unread count in navbar
- ✅ Clicking notification marks as read
- ✅ actionUrl navigates to related page

**What Must NOT Change**:
- Notification page UI (already built as shell)
- Navbar layout

**Dependencies**:
- Notifications table (id, userId, title, message, actionUrl, isRead, createdAt)
- Event triggers (upload complete, budget check, etc.)

---

## DECISION & SAFETY RULES

### When I Will Ask for Permission

1. **Before switching to Opus** — If UX decisions become architecturally complex
2. **Before deleting existing code** — Even if unused, confirm first
3. **Before changing component APIs** — If breaking changes needed
4. **Before adding new dependencies** — Justify package additions

### Code Quality Standards

1. **Follow existing patterns** — Use shadcn/ui components
2. **Mobile-first** — Test all layouts on mobile breakpoints
3. **Accessibility** — Keyboard navigation, ARIA labels, focus states
4. **Performance** — Lazy load heavy components, memoize where needed
5. **TypeScript strict** — No `any` types unless absolutely necessary

### What I Will NOT Do

1. **Change database schema** — Codex handles that
2. **Modify API routes** — Only consume existing endpoints
3. **Add authentication logic** — Security is out of scope
4. **Create backend files** — Server code is Codex territory
5. **Commit without testing** — Manual test each change

---

## DEFINITION OF DONE

### For Each UI Component

- [ ] Component renders without errors
- [ ] Mobile responsive (tested at 375px, 768px, 1024px)
- [ ] Keyboard accessible (tab navigation works)
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Error states implemented
- [ ] TypeScript types correct (no `any`)
- [ ] Props documented with JSDoc
- [ ] Tested in Chrome, Safari, Firefox (if possible)

### For Each Page

- [ ] Page loads without console errors
- [ ] All interactions work (clicks, form submits, etc.)
- [ ] Data fetching has loading skeleton
- [ ] Empty state shows when no data
- [ ] Error boundaries catch failures
- [ ] Navigation works (back button, links)
- [ ] Page title correct
- [ ] Meta tags appropriate (if needed)

### For Phase Completion

- [ ] All P0 items implemented and tested
- [ ] Documentation updated (this file + IMPLEMENTATION_LOG.md)
- [ ] Screenshots taken for handoff
- [ ] Codex delegation packages written
- [ ] Code committed with descriptive messages
- [ ] IMPLEMENTATION_LOG.md updated with:
  - What was implemented
  - What was delegated
  - Known issues or limitations
  - Next recommended steps

---

## NEXT STEPS

1. **Wait for approval of this plan** (STOP HERE until user confirms)
2. **Phase B: UI Implementation** (Sessions 1-3 above)
3. **Phase C: Codex Delegation Packages** (Write detailed specs)
4. **Handoff**: Screenshots, documentation, Codex instructions

---

**END OF PHASE A PLAN**
