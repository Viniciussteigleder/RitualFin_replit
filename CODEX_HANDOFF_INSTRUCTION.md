# 🚀 CODEX AUTONOMOUS EXECUTION — START HERE

**Date**: 2025-12-29
**Authority**: Claude (Lead Architect, Product Owner, Final Review)
**Executor**: Codex (Autonomous Implementation)
**Status**: ✅ APPROVED FOR EXECUTION

---

## MISSION BRIEFING

You are authorized to implement **Batch 1-3** autonomously. All decisions have been locked, specs are complete, and you have full authority to execute within defined scope.

**Your Role**: Autonomous Implementation Engineer
**Claude's Role**: Review & merge PRs, handle deployment, resolve escalations

**Speed is Priority**: Implement fast, test thoroughly, document concisely. No back-and-forth on locked decisions.

---

## 📋 REQUIRED READING (In Order)

Before starting, read these files:

1. ✅ `docs/_codex/FEATURE_IMPLEMENTATION_PLAN.md` — Complete package specs
2. ✅ `docs/_codex/RESOLVED_DECISIONS.md` — All decisions locked
3. ✅ `docs/ARCHITECTURE_AND_AI_LOGIC.md` — System architecture
4. ✅ `CLAUDE.md` — Development guidelines

**Do NOT read**:
- ❌ User feedback docs (don't exist yet)
- ❌ Category classification proposals (deferred to Phase D)
- ❌ Any external documentation

---

## 📦 FINAL PACKAGE LIST & ORDER

### BATCH 1: Core Infrastructure & Observability
**Branch**: `feat/batch-1-observability`
**Model**: Haiku
**Timeline**: 2-4 hours
**Status**: ✅ APPROVED, START IMMEDIATELY

**Packages**:
1. **C.4: AI Usage Tracking**
   - Table: `ai_usage_logs`
   - Logging wrapper: `server/ai-logger.ts`
   - Endpoint: `GET /api/ai/usage`
   - Integration: Add logging to existing AI endpoints

2. **C.5: Notification System Backend**
   - Table: `notifications`
   - CRUD endpoints: GET, POST, PATCH, DELETE
   - Scope: In-app notifications only (no email/push)

**Dependencies**: None
**Acceptance Criteria**: See FEATURE_IMPLEMENTATION_PLAN.md (each package)

---

### BATCH 2: Performance & Reliability
**Branch**: `feat/batch-2-async-csv`
**Model**: Sonnet
**Timeline**: 4-6 hours
**Status**: ⏸️ START AFTER BATCH 1 PR MERGED

**Packages**:
1. **C.7: CSV Async Refactoring**
   - Refactor `parseCSV()` to streaming
   - Use `csv-parse` or `papaparse` with chunks
   - Progress reporting (poll or SSE)
   - Error handling per chunk

**Dependencies**: None
**Acceptance Criteria**: 1000-row CSV completes in <60s, progress updates work

---

### BATCH 3: AI Assistant (Complex)
**Branch**: `feat/batch-3-ai-chat`
**Model**: Sonnet
**Timeline**: 6-8 hours
**Status**: ⏸️ START AFTER BATCH 2 PR MERGED

**Packages**:
1. **C.6: AI Assistant Streaming Backend**
   - SSE endpoint: `POST /api/ai/chat`
   - OpenAI GPT-4 integration with streaming
   - Context assembly (last 30 days transactions)
   - Conversation history (tables: conversations, messages)

**Dependencies**: C.4 (AI usage logging)
**Acceptance Criteria**: Streams responses, includes transaction context, usage logged

---

## 🎯 BATCH-BY-BATCH EXECUTION GUIDE

### BATCH 1 SCOPE

**IN**:
- ✅ Create `ai_usage_logs` table with fields: userId, operation, tokensUsed, cost, modelUsed, createdAt
- ✅ Create `server/ai-logger.ts` wrapper: `logAIUsage(userId, operation, tokensUsed, modelUsed)`
- ✅ Integrate into `/api/ai/suggest-keyword` (routes.ts:555-651)
- ✅ Integrate into `/api/ai/bulk-categorize` (routes.ts:653-790)
- ✅ Create endpoint: `GET /api/ai/usage?startDate=X&endDate=Y` → returns logs + totals
- ✅ Create `notifications` table with fields: id, userId, type, title, message, isRead, createdAt
- ✅ Create endpoints: GET /api/notifications, POST, PATCH /:id/read, DELETE /:id
- ✅ Add storage methods in `server/storage.ts`
- ✅ Test all QA steps (see FEATURE_IMPLEMENTATION_PLAN.md)

**OUT**:
- ❌ Real-time usage alerts
- ❌ Per-user billing/quotas
- ❌ Email/SMS notifications
- ❌ Websockets for notifications (use polling)

**Dependencies**: None (can start immediately)

**Acceptance Criteria**:
- [ ] `npm run db:push` creates tables successfully
- [ ] AI calls logged automatically in `ai_usage_logs`
- [ ] GET /api/ai/usage returns accurate data with date filtering
- [ ] Notifications CRUD works, scoped to userId
- [ ] Frontend can poll GET /api/notifications and display them
- [ ] All QA steps pass (see package specs)

**QA Steps** (Run before PR):
1. Call `/api/ai/suggest-keyword` with test transaction
2. psql query: `SELECT * FROM ai_usage_logs;` → verify log created
3. GET `/api/ai/usage` → verify response includes tokenUsed, cost
4. GET `/api/ai/usage?startDate=2025-12-29` → verify filtering
5. POST test notification → GET /api/notifications → verify it appears
6. PATCH /api/notifications/:id/read → verify isRead=true
7. DELETE /api/notifications/:id → verify 404 on next GET

---

### BATCH 2 SCOPE

**IN**:
- ✅ Refactor `parseCSV()` in `server/csv-parser.ts` to streaming/chunked
- ✅ Use `csv-parse` or `papaparse` library (npm install if needed)
- ✅ Process CSV in chunks of 50-100 rows
- ✅ Add `progress` field to `uploads` table (integer 0-100)
- ✅ Update progress every 10% (don't spam database)
- ✅ Error handling: Log row-level errors, don't fail entire upload
- ✅ Frontend polls progress OR receives SSE updates (choose based on complexity)

**OUT**:
- ❌ Background job queue (Redis/BullMQ)
- ❌ Multi-file parallel processing
- ❌ Resume capability

**Dependencies**: None

**Acceptance Criteria**:
- [ ] 1000-row CSV completes in <60 seconds
- [ ] Progress updates visible (10%, 20%, ..., 100%)
- [ ] Memory usage stays <500MB for large CSV
- [ ] Row errors logged but don't stop upload
- [ ] 5000-row CSV completes successfully

**QA Steps**:
1. Upload 1000-row test CSV
2. Monitor progress (should see incremental updates)
3. Check memory usage during processing (htop/Activity Monitor)
4. Introduce bad row (invalid date) → verify upload continues
5. Upload 5000-row CSV → should complete in <3 minutes

---

### BATCH 3 SCOPE

**IN**:
- ✅ SSE endpoint: `POST /api/ai/chat` with body: `{message, conversationId?}`
- ✅ OpenAI GPT-4 streaming integration
- ✅ Context assembly:
  - Query last 30 days transactions
  - Query current month goals/budgets
  - Inject into system prompt
- ✅ Tables: `conversations`, `messages` (optional but recommended)
- ✅ Usage logging via C.4 wrapper
- ✅ SSE format: `data: ${JSON.stringify(event)}\n\n`
- ✅ Timeout: 30 seconds max

**OUT**:
- ❌ RAG/vector search
- ❌ Multi-turn complex memory (each request is independent)
- ❌ Proactive suggestions

**Dependencies**: C.4 (AI usage logging) must be complete

**Acceptance Criteria**:
- [ ] POST /api/ai/chat returns SSE stream
- [ ] Frontend receives events: `{type: "data", content: "..."}`, `{type: "done"}`
- [ ] Response mentions actual transaction data (proves context works)
- [ ] Usage logged in `ai_usage_logs` table
- [ ] Conversation saved in `conversations` + `messages` tables
- [ ] Error handling: Invalid API key returns `{type: "error", error: "..."}`

**QA Steps**:
1. POST /api/ai/chat: `{"message": "Analise meus gastos este mês"}`
2. Verify SSE stream received (use curl with `-N` flag or frontend EventSource)
3. Check response includes real transaction data (not generic)
4. Query `ai_usage_logs` → verify log created
5. Test error: Set invalid OpenAI key → should return error event
6. Test timeout: Simulate slow network → should timeout gracefully

---

## 🤖 EXECUTION AUTONOMY RULES

### You Can Do (No Approval Needed)

1. **Implement packages exactly as specified**
2. **Add npm dependencies** (csv-parse, papaparse, etc.)
3. **Create/modify database tables** via Drizzle schema + `npm run db:push`
4. **Add/modify API endpoints** as specified
5. **Wire up frontend to new APIs** (update `client/src/lib/api.ts`, use TanStack Query)
6. **Fix bugs found during QA**
7. **Adjust UI** to support features (preserve shadcn/ui design system)
8. **Document** in Codex logs (activity, diff summary, decisions)

### You MUST Escalate (Stop and Ask Claude)

1. **Security risk detected** (SQL injection, XSS, secrets exposed)
2. **Scope conflict** (spec contradicts architecture)
3. **Breaking API changes** (existing endpoints change response format)
4. **Architectural refactor needed** (restructure directories, change build)
5. **Ambiguous spec** (unclear or contradictory requirements)
6. **Technical decision** with multiple valid options (no clear winner)

**How to Escalate**:
```
STOP: [Brief description of issue]

Context: [What you were trying to do]

Options:
A) [Option 1 with pros/cons]
B) [Option 2 with pros/cons]

Recommendation: [Your preferred option if you have one]

Awaiting Claude's decision before proceeding.
```

---

## 📝 WORKFLOW: Branch → Implement → Test → PR

### Step 1: Create Branch

```bash
git checkout main
git pull origin main
git checkout -b feat/batch-1-observability
```

### Step 2: Implement Package-by-Package

For each package:
1. Read spec in FEATURE_IMPLEMENTATION_PLAN.md
2. Implement "Scope IN" items
3. Test using "QA Steps"
4. Commit:

```bash
git add .
git commit -m "feat(c4-ai-usage): Add AI usage tracking

- Created ai_usage_logs table
- Integrated logging into AI endpoints
- Added GET /api/ai/usage endpoint

Acceptance criteria:
- [x] Logs created for each AI call
- [x] GET endpoint returns usage data
- [x] Date filtering works

🤖 Generated with Claude Code
Co-Authored-By: Codex <noreply@anthropic.com>"
```

### Step 3: Update Codex Logs

After each package:

```bash
# Activity Log
echo "## Batch 1: Observability - $(date)" >> docs/_codex/CODEX_ACTIVITY_LOG.md
echo "- Implemented C.4: AI Usage Tracking" >> docs/_codex/CODEX_ACTIVITY_LOG.md
echo "- Files: shared/schema.ts, server/ai-logger.ts, server/routes.ts" >> docs/_codex/CODEX_ACTIVITY_LOG.md

# Diff Summary
echo "## Batch 1: C.4 - AI Usage Tracking" >> docs/_codex/DIFF_SUMMARY.md
echo "- New table: ai_usage_logs" >> docs/_codex/DIFF_SUMMARY.md
echo "- New file: server/ai-logger.ts (logging wrapper)" >> docs/_codex/DIFF_SUMMARY.md

# Decision Log (only if you made judgment calls)
echo "## Batch 1: C.4 - Cost Calculation" >> docs/_codex/DECISION_LOG.md
echo "- Decision: Store both tokens and cost" >> docs/_codex/DECISION_LOG.md
echo "- Rationale: Allows recalculation if pricing changes" >> docs/_codex/DECISION_LOG.md
```

### Step 4: Open PR

```bash
git push origin feat/batch-1-observability

gh pr create --title "Batch 1: Core Infrastructure & Observability" --body "## Summary
- ✅ C.4: AI Usage Tracking
- ✅ C.5: Notification System Backend

## Testing
All QA steps passed:
- [x] AI calls logged correctly
- [x] GET /api/ai/usage returns accurate data
- [x] Notifications CRUD functional
- [x] Date filtering works
- [x] User isolation verified

## Files Changed
- shared/schema.ts: +50 lines (new tables)
- server/ai-logger.ts: +42 lines (new file)
- server/storage.ts: +80 lines (new methods)
- server/routes.ts: +120 lines (new endpoints + integration)

## Documentation
- docs/_codex/CODEX_ACTIVITY_LOG.md: Updated
- docs/_codex/DIFF_SUMMARY.md: Updated
- docs/_codex/DECISION_LOG.md: Updated (if applicable)

## Ready for Review
Batch 1 complete and tested. Ready for Claude's review and merge.

🤖 Generated with Claude Code"
```

### Step 5: Wait for Claude Review

Claude will:
- ✅ Review code quality, security, correctness
- ✅ Test functionality manually
- ✅ Approve + merge to main OR request changes OR split batch

After merge, proceed to Batch 2.

---

## ⚡ SPEED OPTIMIZATION (Locked Decisions)

### What is "Good Enough" for V1

1. **Simple logging** (no complex analytics)
2. **Manual cost calculation** (not real-time API pricing)
3. **Polling for notifications** (not websockets)
4. **Chunked CSV processing** (not background jobs)
5. **Basic AI context** (last 30 days, not full history)

### What is Deferred

1. **Phase D: Production Security** (auth, RLS, multi-user)
2. **Background job queue** (for very large CSVs)
3. **RAG/vector search** (for AI chat)
4. **Email notifications** (in-app only for now)

**Do NOT implement deferred items.** Stick to specs exactly.

---

## 🚨 STOP CONDITIONS (Immediate Escalation)

If you encounter ANY of these, **STOP and escalate to Claude**:

1. Security vulnerability (SQL injection, XSS, secrets exposed)
2. Spec contradicts existing architecture
3. Breaking change to API contract
4. Need to restructure directories or change build
5. Spec is unclear or self-contradictory
6. Technical decision with multiple valid options

**Example**: "Spec says notifications auto-expire but doesn't say when" → STOP, ask Claude.

---

## ✅ FINAL CHECKLIST

Before starting Batch 1:

- [ ] Read FEATURE_IMPLEMENTATION_PLAN.md (complete package specs)
- [ ] Read RESOLVED_DECISIONS.md (all decisions locked)
- [ ] Read ARCHITECTURE_AND_AI_LOGIC.md (system architecture)
- [ ] Read CLAUDE.md (development guidelines)
- [ ] Understand workflow: Branch → Implement → Test → PR
- [ ] Understand escalation triggers
- [ ] Ready to execute autonomously

---

## 🎯 SUCCESS CRITERIA

### Batch 1 Success:
- ✅ AI usage tracked for all OpenAI calls
- ✅ GET /api/ai/usage returns accurate data
- ✅ Notifications CRUD functional
- ✅ All QA steps pass
- ✅ PR opened and ready for review

### Batch 2 Success:
- ✅ CSV processing refactored to async
- ✅ Progress updates work
- ✅ 5000-row CSV completes successfully
- ✅ Errors don't crash upload

### Batch 3 Success:
- ✅ AI chat streams responses via SSE
- ✅ Context includes transaction data
- ✅ Usage logged correctly
- ✅ Frontend displays chat properly

---

## 🚀 START COMMAND

You are now authorized to begin **Batch 1** immediately.

**First Step**:
```bash
git checkout main
git pull origin main
git checkout -b feat/batch-1-observability
echo "Starting Batch 1: Core Infrastructure & Observability" >> docs/_codex/CODEX_ACTIVITY_LOG.md
echo "Date: $(date)" >> docs/_codex/CODEX_ACTIVITY_LOG.md
```

**Then**: Implement C.4 (AI Usage Tracking) following FEATURE_IMPLEMENTATION_PLAN.md.

---

**Good luck! Execute fast, test thoroughly, document concisely. Claude is standing by for PR review and escalations.**

🤖 End of Handoff Instruction
