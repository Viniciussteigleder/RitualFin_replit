# Resolved Decisions — No Ambiguity, Ready to Execute

**Date**: 2025-12-29
**Authority**: Claude (Lead Architect)
**Status**: LOCKED for Batch 1-3 execution

---

## CRITICAL DECISIONS (No Re-Discussion)

### 1. AI Policy: Opt-In, User-Controlled

**Decision**: AI features are **opt-in** and **never run automatically**.

**Rules**:
- AI requires user's OpenAI API key (stored in settings)
- AI analysis triggered only by explicit user action ("Analyze with AI" button)
- No automatic categorization via AI (rules engine is primary)
- No background AI processing

**Cost Guardrails**:
- Log ALL OpenAI API calls (Package C.4)
- Display usage/cost in settings page
- No hard limits (trust user to manage their own API key)

**Privacy**:
- Transaction data sent to OpenAI only when user clicks "Analyze"
- No data retention by OpenAI (zero-day retention policy)
- User can disable AI features anytime (delete API key)

**Safety**:
- Validate API key before first use
- Handle errors gracefully (network, quota, invalid key)
- Never expose API key in logs or client-side code

**Where AI is Allowed**:
- ✅ `/api/ai/suggest-keyword` - Keyword suggestions for uncategorized transactions
- ✅ `/api/ai/bulk-categorize` - Batch analysis of similar transactions
- ✅ `/api/ai/chat` - AI assistant (Package C.6)

**Where AI is NEVER Used**:
- ❌ CSV parsing (deterministic rules only)
- ❌ Format detection (pattern matching)
- ❌ Automatic categorization (rules engine only)
- ❌ Account attribution (data extraction)

---

### 2. Notification System: Polling, Not Websockets

**Decision**: Use **polling** for notifications in MVP, not websockets/SSE.

**Why**:
- Simpler to implement (no connection management)
- Lower server resource usage
- Sufficient for MVP (notifications are not time-critical)
- Can upgrade to websockets later if needed

**Polling Strategy**:
- Frontend polls `GET /api/notifications` every 30 seconds (when user is active)
- Only when notifications page is open or badge is visible
- Stop polling when user is idle (no activity for 5 minutes)

**Future Enhancement** (deferred):
- Websockets for real-time updates
- Push notifications (browser API)

---

### 3. CSV Processing: Chunked Streaming, Not Background Jobs

**Decision**: Use **chunked streaming** for CSV processing, not background job queue.

**Why**:
- Simpler architecture (no Redis/BullMQ dependency)
- Faster user feedback (see progress in real-time)
- Sufficient for current scale (<10K rows per file)
- Can upgrade to background jobs later if needed

**Implementation**:
- Process CSV in chunks of 50-100 rows
- Update progress in database every 10%
- Frontend polls progress or receives SSE updates
- Total processing time <60s for 1000 rows

**Future Enhancement** (deferred):
- Background job queue for very large files (>10K rows)
- Multi-file parallel processing

---

### 4. AI Chat Context: Recent Transactions Only, No RAG

**Decision**: Include **last 30 days of transactions** in AI chat context, not full history.

**Why**:
- Limits token usage (cost control)
- Most relevant data for user's question
- Faster query (indexed on paymentDate)
- Simple to implement (no vector database)

**Context Strategy**:
```
System Prompt:
- Current month summary (total spent, budget, remaining)
- Top 3 spending categories
- Last 10 transactions

User Transactions:
- Query: WHERE paymentDate >= (today - 30 days)
- Limit: 50 transactions max
- Sort: DESC by paymentDate
- Format: "DD/MM: [Merchant] - €X.XX (Category)"
```

**Token Budget**:
- System prompt: ~500 tokens
- Transaction context: ~1500 tokens
- User message: ~500 tokens
- Max total input: ~2500 tokens
- Max output: 500 tokens

**Future Enhancement** (deferred):
- RAG with vector search over full transaction history
- Semantic search for "find all Uber Eats transactions"

---

### 5. Conversation History: Saved, But Not Multi-Turn Memory

**Decision**: Save conversation history in database, but **no complex multi-turn memory management**.

**Why**:
- Users may want to refer back to previous questions
- Simple to implement (two tables: conversations, messages)
- No need for complex state management (each message is stateless)
- Cost control (no growing context window)

**Implementation**:
- Table: `conversations` (id, userId, title, createdAt)
- Table: `messages` (id, conversationId, role, content, createdAt)
- Each request is independent (no context carryover between messages)
- Title auto-generated from first message

**What This is NOT**:
- Not ChatGPT-style multi-turn conversations
- Not remembering previous context in current chat
- Not "follow-up" questions with implicit context

**Example**:
- User: "Analise meus gastos este mês"
- AI: "Você gastou €1,234..." (includes fresh transaction context)
- User: "E no mês passado?" (NEW request, not continuation)
- AI: "Você gastou €987..." (queries last month, NO memory of first question)

---

### 6. Commitments/Projection Source of Truth: Goals Table

**Decision**: `goals` table is the **single source of truth** for monthly financial plans.

**Why**:
- Already exists and working
- Clear monthly boundary (matches user mental model)
- Integrates with dashboard projections
- Separation from legacy `budgets` table (which is category-specific)

**Data Flow**:
```
User creates goal for month → goals.estimatedIncome, goals.totalPlanned
User adds category targets → categoryGoals.targetAmount
Dashboard queries goals + actual transactions → progress %
Projections based on: (days remaining / days in month) × average daily spend
```

**Budgets vs Goals**:
- `budgets` table: Category-specific spending limits (legacy)
- `goals` table: Holistic monthly plan with income + spending targets
- Dashboard uses `goals` for projections (not `budgets`)

---

### 7. Keyword Analysis Reference Text: Transaction Description Only

**Decision**: AI keyword analysis uses **transaction description (descNorm)** only, not full context.

**Why**:
- Description contains merchant name (most relevant for categorization)
- Simple, predictable, fast
- Avoids over-fitting to specific amounts/dates
- Consistent with rules engine (which matches on description)

**What is Included**:
- ✅ `descNorm` - Normalized description (lowercase, no accents)
- ✅ `amount` - For context (positive/negative)

**What is NOT Included**:
- ❌ `paymentDate` - Not relevant for categorization
- ❌ `accountSource` - Not relevant for merchant identification
- ❌ `foreignAmount`, `exchangeRate` - Not relevant

**Example**:
```
AI Input:
- Description: "netflix monthly subscription"
- Amount: -12.99

AI Output:
- Suggested keyword: "netflix"
- Suggested category: "Lazer → Streaming"
```

---

### 8. N4 Category Timing: Not Now, Deferred to Phase D

**Decision**: **Do NOT implement N4 category level** in this iteration.

**Why**:
- Current system (type → fixVar → category1 → category2) is sufficient
- No user feedback requesting deeper hierarchy
- Adds complexity to UI (dropdowns, filters, reports)
- Phase D (production security) is higher priority

**Current Hierarchy**:
```
type: "Despesa" | "Receita"
  └─ fixVar: "Fixo" | "Variável"
      └─ category1: "Moradia", "Mercado", "Lazer", ...
          └─ category2: Free text (optional subcategory)
```

**Future Consideration** (Phase E+):
- If users request "tags" or "labels" for cross-cutting concerns
- Example: "Business expenses" tag across multiple categories
- Would require schema change + migration + UI redesign

---

## TECHNICAL CONSTRAINTS (Locked)

### Database

**Schema Changes**:
- Use Drizzle ORM + `npm run db:push` (no migrations)
- All new tables must have `userId` field (data isolation)
- All timestamps use `timestamp` type (not `timestamptz`)
- All IDs use `text` (UUID) or `serial` (auto-increment)

**Indexes** (add if querying frequently):
- `transactions` → `(userId, paymentDate DESC)`
- `ai_usage_logs` → `(userId, createdAt DESC)`
- `notifications` → `(userId, isRead, createdAt DESC)`

### API Contracts

**Request/Response Format**:
- Always JSON (no form-data except CSV upload)
- Dates in ISO 8601 format (`YYYY-MM-DD`)
- Amounts as numbers (not strings)
- Errors: `{ error: string }` (HTTP 4xx/5xx)

**Authentication**:
- All endpoints require `userId` (currently hardcoded "demo")
- No change to auth system in this iteration (Phase D)

**Rate Limiting**:
- None for MVP (trust single-user demo mode)
- Add in Phase D when multi-user

### Frontend Integration

**API Client** (`client/src/lib/api.ts`):
- Use `fetchAPI()` wrapper (handles base URL, credentials)
- Add new endpoints following existing pattern
- Use TanStack Query for data fetching (`useQuery`, `useMutation`)

**UI Adjustments**:
- Preserve shadcn/ui design system (Button, Card, Dialog, etc.)
- Use Tailwind CSS v4 (no custom CSS files)
- Mobile-first responsive design
- Accessibility: ARIA labels, keyboard navigation

---

## STOP CONDITIONS (Escalate to Claude)

### Immediate Stop Triggers

1. **Security Risk Detected**:
   - Potential SQL injection in query
   - XSS vulnerability in user input
   - Secrets/credentials exposed in logs or client code
   - Authentication bypass possible

2. **Scope Conflict**:
   - Package spec contradicts existing architecture
   - Breaking change to API contract (existing endpoints)
   - Data model ambiguity (e.g., "Should category2 be enum or free text?")

3. **Architectural Refactor Needed**:
   - Need to restructure directories (move server/ files)
   - Need to change build process (modify vite.config.ts, tsconfig.json)
   - Need to add major dependencies (>50MB, or changes build time significantly)

4. **Blocked by Missing Information**:
   - Package spec is unclear or self-contradictory
   - User preference needed (e.g., "Should notifications auto-mark as read after 7 days?")
   - Technical decision with multiple valid options (no clear winner)

### Examples of When to STOP

**Example 1**: SQL Injection Risk
```typescript
// ❌ STOP - This is vulnerable
const query = `SELECT * FROM transactions WHERE descNorm LIKE '%${userInput}%'`;

// Escalate to Claude: "Package C.X requires text search. Current Drizzle ORM doesn't support LIKE with parameterization. Options: (A) Use raw SQL with escaping, (B) Use full-text search, (C) Filter in application code. Which approach?"
```

**Example 2**: Breaking API Change
```typescript
// ❌ STOP - Existing endpoint changes response format
// Old: { balance: number }
// New: { balance: number, currency: string, breakdown: {...} }

// Escalate to Claude: "Package C.1 spec says to add 'breakdown' field to /api/accounts/:id/balance, but this breaks existing frontend. Should I: (A) Add new endpoint, (B) Use query param for extended response, (C) Version API?"
```

**Example 3**: Ambiguous Spec
```typescript
// ❌ STOP - Spec says "notifications auto-expire" but doesn't say when

// Escalate to Claude: "Package C.5 spec mentions auto-expiring notifications but doesn't specify duration. Should it be: (A) 30 days, (B) 90 days, (C) Never auto-expire, manual delete only?"
```

---

## DEPLOYMENT CONSTRAINTS (Aware of, Don't Block)

### Current Deployment Status

**Production**: Not deployed yet (security rotation in progress)
- Supabase credentials being rotated
- Render backend environment being updated
- Vercel frontend pending

**Local Development**: Fully functional
- PostgreSQL via Supabase Transaction Pooler
- Port 5000 (backend + frontend via Vite HMR)

### Serverless Considerations (Future)

When deploying to Vercel serverless (Phase D):
- Function timeout: 10s (Hobby), 60s (Pro)
- Memory limit: 1GB (Hobby), 3GB (Pro)
- Bundle size: 50MB max

**Impact on Packages**:
- C.7 (CSV async): May need background jobs if >10K rows
- C.6 (AI chat): SSE streaming works in serverless (tested)

**Not Blocking Current Work**: Implement for local development first, optimize for serverless later if needed.

---

**End of Resolved Decisions**

**Status**: All decisions LOCKED for Batch 1-3 execution. No re-discussion unless STOP condition triggered.
