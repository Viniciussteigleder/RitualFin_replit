# Feature Implementation Plan — Codex Autonomous Execution

**Project**: RitualFin Backend Features & Production Readiness
**Created**: 2025-12-29
**Owner**: Claude (Lead Architect)
**Executor**: Codex (Autonomous Implementation)
**Status**: Ready for Execution

---

## OVERVIEW

**Current State**:
- Phase B (UX Overhaul): ✅ COMPLETE
- Phase C (Backend Services): ✅ 3/6 complete (C.1-C.3 done)
- Security Audit: ✅ COMPLETE (critical issues documented)
- Deployment Docs: ✅ COMPLETE (ready for execution after security fixes)

**Remaining Work**:
- Phase C.4-C.6: Backend services (AI tracking, notifications, streaming chat)
- Phase C.7: CSV async refactor (performance/reliability)
- Security: Credential rotation completion
- Phase D Planning: Auth & RLS (future batch, not this iteration)

---

## FEATURE PACKAGES (Execution-Ready)

### BATCH 1: Core Infrastructure & Observability

**Timeline**: 2-4 hours
**Model**: Haiku (simple CRUD + structured logging)
**Branch**: `feat/batch-1-observability`

---

#### Package C.4: AI Usage Tracking

**Status**: Specified, ready to implement
**Priority**: HIGH (cost monitoring critical before C.6)
**Dependencies**: None

**Scope IN**:
- Table: `ai_usage_logs` with fields:
  - `id` (serial primary key)
  - `userId` (text, references users.id)
  - `operation` (text: "categorize" | "chat" | "bulk")
  - `tokensUsed` (integer)
  - `cost` (decimal)
  - `modelUsed` (text: "gpt-4" | "gpt-4o-mini")
  - `createdAt` (timestamp)
- Logging wrapper: `server/ai-logger.ts`
  - Function: `logAIUsage(userId, operation, tokensUsed, modelUsed)`
  - Auto-calculate cost from tokens
- Endpoint: `GET /api/ai/usage?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - Returns: `{ logs: [...], totalTokens: N, totalCost: N }`
- Integrate into existing OpenAI calls:
  - `/api/ai/suggest-keyword` (routes.ts:555-651)
  - `/api/ai/bulk-categorize` (routes.ts:653-790)

**Scope OUT**:
- Real-time usage alerts
- Per-user billing/quotas
- Third-party analytics integration
- Dashboard UI (already exists in frontend, just needs data)

**Data Structure**:
```typescript
interface AIUsageLog {
  id: number;
  userId: string;
  operation: "categorize" | "chat" | "bulk";
  tokensUsed: number;
  cost: number;  // USD, calculated from tokens × pricing
  modelUsed: string;
  createdAt: Date;
}
```

**Rules**:
1. Log AFTER successful OpenAI API call (not before)
2. Cost calculation:
   - GPT-4: $0.03/1K input tokens, $0.06/1K output tokens
   - GPT-4o-mini: $0.00015/1K input tokens, $0.0006/1K output tokens
3. Use response.usage.total_tokens from OpenAI API
4. Default to modelUsed = "gpt-4o-mini" if not specified

**Acceptance Criteria**:
- [x] Schema added to `shared/schema.ts`
- [x] Table created via `npm run db:push`
- [x] Logging wrapper created in `server/ai-logger.ts`
- [x] Integration in `/api/ai/suggest-keyword`
- [x] Integration in `/api/ai/bulk-categorize`
- [x] GET endpoint returns usage data
- [x] Date filtering works correctly
- [x] Cost calculated accurately

**QA Steps**:
1. Call `/api/ai/suggest-keyword` with test transaction
2. Verify log created in `ai_usage_logs` table (psql query)
3. GET `/api/ai/usage` returns log with correct token count
4. GET `/api/ai/usage?startDate=2025-12-29` filters correctly
5. Verify cost = tokens × pricing (manually calculate)

---

#### Package C.5: Notification System Backend

**Status**: Specified, ready to implement
**Priority**: MEDIUM (UI exists but non-functional)
**Dependencies**: None

**Scope IN**:
- Table: `notifications` with fields:
  - `id` (text, uuid primary key)
  - `userId` (text, references users.id)
  - `type` (enum: "info" | "warning" | "error" | "success")
  - `title` (text)
  - `message` (text)
  - `isRead` (boolean, default false)
  - `createdAt` (timestamp)
- CRUD endpoints:
  - `GET /api/notifications` - List user's notifications (DESC by createdAt)
  - `POST /api/notifications` - Create notification (admin/system use)
  - `PATCH /api/notifications/:id/read` - Mark as read
  - `DELETE /api/notifications/:id` - Delete notification
- Storage layer methods in `server/storage.ts`

**Scope OUT**:
- Email/SMS notifications
- Push notifications
- Real-time websocket updates (polling only for MVP)
- Auto-triggers (e.g., "upload complete" → notification)

**Data Structure**:
```typescript
interface Notification {
  id: string;
  userId: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
```

**Rules**:
1. Notifications scoped to userId (never cross-user)
2. Max 100 notifications per user (auto-delete oldest)
3. Mark as read = soft state (can be toggled)
4. Delete = hard delete (no audit trail for MVP)

**Acceptance Criteria**:
- [x] Schema added with enum type
- [x] Table created via `npm run db:push`
- [x] GET /api/notifications returns user's notifications
- [x] POST creates notification (scoped to userId)
- [x] PATCH /read marks as read
- [x] DELETE removes notification
- [x] Other users cannot see/modify each other's notifications

**QA Steps**:
1. POST test notification: `{"type": "info", "title": "Test", "message": "Hello"}`
2. GET /api/notifications → verify it appears
3. PATCH /api/notifications/:id/read → verify `isRead = true`
4. DELETE /api/notifications/:id → verify 404 on next GET
5. Test with different userId → verify isolation

---

### BATCH 2: Performance & Reliability

**Timeline**: 4-6 hours
**Model**: Sonnet (async refactoring + streaming)
**Branch**: `feat/batch-2-async-csv`

---

#### Package C.7: CSV Async Refactoring

**Status**: Critical (blocking serverless deployment)
**Priority**: HIGH
**Dependencies**: None

**Scope IN**:
- Refactor `parseCSV()` to streaming/chunked processing
- Library: Use `csv-parse` or `papaparse` with streaming mode
- Process CSV in chunks of 50-100 rows at a time
- Add progress reporting:
  - Emit progress events: `{rowsProcessed: N, rowsTotal: M, percent: X}`
  - Store progress in `uploads` table: `progress` field (0-100)
- Update endpoint to handle async processing:
  - Option A: Return immediately, poll for completion
  - Option B: SSE stream for progress updates
- Error handling per chunk (don't fail entire upload if 1 row is bad)

**Scope OUT**:
- Background job queue (Redis/BullMQ)
- Multi-file parallel processing
- Resume capability (if browser closes mid-upload)

**Rules**:
1. Max chunk size: 100 rows (balance memory vs API calls)
2. Transaction-level error handling (row 15 fails → log, continue)
3. Progress updates every 10% (don't spam database)
4. Total processing time should be < 60s for 1000 rows

**Acceptance Criteria**:
- [x] `parseCSV()` refactored to streaming
- [x] Chunks processed sequentially (not in parallel)
- [x] Progress field added to `uploads` table
- [x] Frontend polls progress (or receives SSE events)
- [x] Errors don't stop entire upload
- [x] Memory usage stays under 500MB for 10K row CSV

**QA Steps**:
1. Upload 1000-row CSV
2. Monitor progress updates (should see 10%, 20%, ..., 100%)
3. Check memory usage during processing
4. Introduce bad row (invalid date) → verify upload continues
5. Test with 5000-row CSV → should complete in <3 minutes

---

### BATCH 3: AI Assistant (Complex)

**Timeline**: 6-8 hours
**Model**: Sonnet (SSE streaming + context assembly)
**Branch**: `feat/batch-3-ai-chat`

---

#### Package C.6: AI Assistant Streaming Backend

**Status**: Specified, complex
**Priority**: MEDIUM (UI exists, user expectation set)
**Dependencies**: C.4 (AI usage logging)

**Scope IN**:
- SSE endpoint: `POST /api/ai/chat`
  - Request body: `{ message: string, conversationId?: string }`
  - Response: SSE stream with events: `data`, `done`, `error`
- OpenAI GPT-4 integration with streaming
- Context assembly:
  - Query recent transactions (last 30 days)
  - Query current month goals/budgets
  - Inject into system prompt
- Conversation history (optional):
  - Table: `conversations` (id, userId, title, createdAt)
  - Table: `messages` (id, conversationId, role, content, createdAt)
- Usage logging via C.4 wrapper

**Scope OUT**:
- RAG/vector search over historical data
- Multi-turn complex memory management
- Voice input/output
- Proactive suggestions ("You're over budget!")

**Data Structure**:
```typescript
interface ChatRequest {
  message: string;
  conversationId?: string;  // Resume existing chat
}

interface ChatSSEEvent {
  type: "data" | "done" | "error";
  content?: string;  // For type=data
  conversationId?: string;  // For type=done
  error?: string;  // For type=error
}
```

**Rules**:
1. SSE format: `data: ${JSON.stringify(event)}\n\n`
2. Context limited to 4000 tokens (prevent cost explosion)
3. Stream response token-by-token (not word-by-word)
4. Timeout: 30 seconds max (prevent hanging connections)
5. Log usage AFTER stream completes

**System Prompt Template**:
```
You are a personal finance assistant for RitualFin.

User context:
- Current month: {month}
- Total spending this month: €{totalSpent}
- Budget: €{totalBudget} (remaining: €{remaining})
- Top categories: {top3Categories}

Recent transactions:
{last10Transactions}

Answer in Portuguese (pt-BR). Be concise and actionable.
```

**Acceptance Criteria**:
- [x] POST /api/ai/chat returns SSE stream
- [x] Frontend receives events correctly
- [x] Response includes transaction context
- [x] Usage logged in `ai_usage_logs`
- [x] Conversation history saved (if conversationId provided)
- [x] Error handling for invalid API key, timeout, network failure

**QA Steps**:
1. POST /api/ai/chat: `{"message": "Analise meus gastos este mês"}`
2. Verify SSE stream received (use curl or frontend)
3. Check response mentions actual transaction data
4. Verify log created in `ai_usage_logs`
5. Test error: Invalid OpenAI key → should return error event
6. Test timeout: Slow network → should timeout gracefully

---

## EXECUTION AUTONOMY RULES

### What Codex Can Do (No Approval Needed)

1. **Implementation within approved packages**:
   - Write code following package specs exactly
   - Add necessary dependencies (`npm install`)
   - Create database migrations/schema changes
   - Update existing endpoints
   - Add new endpoints as specified

2. **UI adjustments to support features**:
   - Wire up new API endpoints to existing UI
   - Fix bugs found during implementation
   - Add loading states, error messages
   - Improve accessibility (aria labels, keyboard nav)
   - Preserve design system (shadcn/ui, Tailwind)

3. **Testing and QA**:
   - Run QA steps from package specs
   - Document results in `docs/_codex/QA_NOTES.md`
   - Fix bugs found during QA

4. **Documentation**:
   - Update `docs/_codex/CODEX_ACTIVITY_LOG.md` after each session
   - Update `docs/_codex/DIFF_SUMMARY.md` with high-level changes
   - Update `docs/_codex/DECISION_LOG.md` for any judgment calls

### What Requires Escalation (Stop and Ask Claude)

1. **Scope conflicts**:
   - Package spec contradicts existing architecture
   - Breaking changes to API contracts
   - Data model ambiguity affecting correctness

2. **Security risks**:
   - Secrets/credentials handling
   - Authentication/authorization changes
   - SQL injection or XSS vulnerabilities

3. **Architectural refactors**:
   - Need to restructure server/ or client/ directories
   - Need to change build process
   - Need to add major dependencies (>50MB)

4. **Blocked by missing information**:
   - Package spec is unclear or contradictory
   - User preferences needed (e.g., "Should we use polling or SSE?")
   - Technical decision with multiple valid options

---

## WORKFLOW: Branch → Implement → Test → PR

### Step 1: Start Batch

```bash
# Create feature branch
git checkout main
git pull origin main
git checkout -b feat/batch-N-name

# Update Codex logs
echo "## Batch N: Name" >> docs/_codex/CODEX_ACTIVITY_LOG.md
echo "Started: $(date)" >> docs/_codex/CODEX_ACTIVITY_LOG.md
```

### Step 2: Implement Package-by-Package

For each package in the batch:

1. **Read package spec** (this document)
2. **Implement** following "Scope IN" exactly
3. **Test** using "QA Steps"
4. **Document**:
   - Activity log: What was done
   - Diff summary: Files changed, high-level summary
   - Decision log: Any judgment calls made

5. **Commit**:
```bash
git add .
git commit -m "feat(packageName): Brief description

- Bullet point of what changed
- Acceptance criteria met

🤖 Generated with Claude Code
Co-Authored-By: Codex <noreply@anthropic.com>"
```

### Step 3: Open PR

```bash
# Push branch
git push origin feat/batch-N-name

# Open PR via gh CLI
gh pr create --title "Batch N: Name" --body "$(cat <<EOF
## Summary
- Package 1: Brief description
- Package 2: Brief description

## Testing
All QA steps passed:
- [x] Package 1 QA
- [x] Package 2 QA

## Documentation
- Activity log updated
- Diff summary updated
- Decision log updated

## Ready for Review
This batch is complete and ready for Claude's review.

🤖 Generated with Claude Code
EOF
)"
```

### Step 4: Wait for Claude Review

Claude will:
- Review code quality, security, correctness
- Test functionality manually
- Either:
  - ✅ Approve + merge to main
  - 🔄 Request changes
  - 🔀 Split batch if too large

---

## SPEED OPTIMIZATION DECISIONS (Locked)

### What is "Good Enough" for V1

1. **AI Usage Tracking**:
   - Simple logging, no complex analytics
   - Manual cost calculation (not real-time pricing API)
   - No usage limits/quotas (trust user)

2. **Notifications**:
   - Polling only (no websockets)
   - No email/SMS (in-app only)
   - No auto-triggers (manual creation only)

3. **CSV Async**:
   - Simple chunking (not background jobs)
   - No resume capability
   - No parallel processing

4. **AI Chat**:
   - Basic context (last 30 days, not full history)
   - No RAG/vector search
   - No proactive suggestions

### What is Deferred to Later Batches

1. **Phase D: Production Security** (future):
   - Supabase Auth integration
   - RLS enablement
   - Session management
   - Multi-user support

2. **Phase E: Advanced Features** (future):
   - Background job queue
   - Email notifications
   - Advanced AI analytics
   - Mobile app

---

## ACCEPTANCE CRITERIA SUMMARY

### Batch 1 (Observability) Complete When:
- [x] AI usage tracked for all OpenAI calls
- [x] GET /api/ai/usage returns accurate data
- [x] Notifications CRUD functional
- [x] Frontend can display notifications

### Batch 2 (Async CSV) Complete When:
- [x] CSV upload processes in chunks
- [x] Progress updates work
- [x] Large CSVs (5000+ rows) complete successfully
- [x] Errors don't crash entire upload

### Batch 3 (AI Chat) Complete When:
- [x] POST /api/ai/chat streams responses
- [x] Frontend displays chat correctly
- [x] Context includes transaction data
- [x] Usage logged correctly

---

## RISK MITIGATION

### Known Risks

1. **SSE Streaming (Batch 3)**:
   - Risk: Complex, many edge cases
   - Mitigation: Use tested SSE library (express-sse), extensive error handling

2. **CSV Performance (Batch 2)**:
   - Risk: Memory usage spikes with large files
   - Mitigation: Stream processing, chunk size limits, monitoring

3. **OpenAI API Failures (Batch 1, 3)**:
   - Risk: Network errors, rate limits, invalid keys
   - Mitigation: Graceful error handling, user feedback, retry logic

### Rollback Plan

If batch fails in production:
1. Revert PR in GitHub
2. Redeploy previous commit
3. Document failure in `docs/_codex/ISSUES_REGISTER.md`
4. Escalate to Claude for architectural review

---

**End of Feature Implementation Plan**

**Next Action**: Codex begins Batch 1 implementation autonomously.
