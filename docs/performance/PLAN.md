# Performance Optimization Plan - RitualFin

**Date:** 2026-01-17
**Branch:** perf/root-causes-v2

---

## Performance Contract (Target Budgets)

### Route JS Budgets
| Route | Current | Target | Max |
|-------|---------|--------|-----|
| / (dashboard) | ~500KB | 300KB | 400KB |
| /transactions | ~600KB | 350KB | 450KB |
| /analytics | ~450KB | 300KB | 400KB |
| /confirm | ~550KB | 300KB | 400KB |
| /rules | ~400KB | 250KB | 350KB |

### Server Response Time Budgets
| Endpoint | Current Est. | Target | Max |
|----------|--------------|--------|-----|
| Dashboard data | ~500ms | 200ms | 300ms |
| Transactions (page 1) | ~800ms | 200ms | 400ms |
| Analytics drill-down | ~400ms | 150ms | 250ms |
| Confirm queue | ~600ms | 200ms | 300ms |

### DB Query Budgets
| Journey | Current | Target | Max |
|---------|---------|--------|-----|
| Dashboard load | ~20 | 6 | 8 |
| Transactions load | 3 | 2 | 3 |
| Analytics load | 5 | 4 | 5 |

### Payload Size Budgets
| Route | Current | Target | Max |
|-------|---------|--------|-----|
| /transactions initial | ~1MB | 50KB | 100KB |
| Dashboard data | ~15KB | 10KB | 15KB |
| Analytics data | ~20KB | 15KB | 20KB |

---

## Ranked Implementation Backlog

### Scoring: Impact × Confidence ÷ Effort
- Impact: 1-5 (5 = highest)
- Confidence: 1-5 (5 = most certain)
- Effort: 1-5 (5 = most effort)
- Score = (Impact × Confidence) / Effort

| Rank | ID | Description | Impact | Conf | Effort | Score | Files |
|------|----|----|--------|------|--------|-------|-------|
| 1 | RC-17 | System fonts (DONE) | 5 | 5 | 1 | 25.0 | layout.tsx, globals.css |
| 2 | RC-03 | Add DB indexes | 5 | 5 | 2 | 12.5 | schema.ts, migration |
| 3 | RC-12 | Select only needed fields | 4 | 5 | 2 | 10.0 | transactions.ts |
| 4 | RC-06 | Consolidate spend averages | 4 | 5 | 2 | 10.0 | transactions.ts, page.tsx |
| 5 | RC-01 | Batch dashboard queries | 4 | 4 | 2 | 8.0 | transactions.ts |
| 6 | RC-02 | Transactions pagination | 5 | 4 | 3 | 6.7 | transactions.ts, TransactionList |
| 7 | RC-13 | Server prefetch for confirm | 4 | 4 | 2 | 8.0 | confirm/page.tsx, confirm-tabs.tsx |
| 8 | RC-05 | Dynamic import confirm tabs | 3 | 5 | 2 | 7.5 | confirm-tabs.tsx |
| 9 | RC-10 | Lazy load Framer Motion | 3 | 4 | 2 | 6.0 | Various components |
| 10 | RC-04 | Optimize Recharts imports | 3 | 4 | 3 | 4.0 | Chart components |

---

## Implementation Batches

### Batch 1: Quick Wins (Low Risk, High Impact)

#### 1.1 System Fonts (COMPLETED)
- **Status:** DONE
- **Files:** `src/app/layout.tsx`, `src/app/globals.css`
- **Change:** Replaced Google Fonts with system font stack
- **Verification:** Zero font network requests

#### 1.2 Select Only Needed Fields
- **Files:** `src/lib/actions/transactions.ts`
- **Change:** Create `getTransactionsForList()` with minimal fields
- **Current:** Returns 30+ fields including classification_candidates
- **Target:** Return 12 essential fields for list view
- **Acceptance:** Payload < 100KB for 50 transactions
- **Rollback:** Keep old function, use new one incrementally

#### 1.3 Consolidate Spend Averages
- **Files:** `src/lib/actions/transactions.ts`, `src/app/page.tsx`
- **Change:** Create `getSpendAveragesAllPeriods(date, [3,6,12])`
- **Current:** 3 separate calls × 4 queries each = 12 queries
- **Target:** Single call with 4 queries + client aggregation
- **Acceptance:** Reduce from 12 to 4 queries
- **Rollback:** Keep old function as fallback

#### 1.4 Batch Dashboard Queries
- **Files:** `src/lib/actions/transactions.ts`
- **Change:** Combine multiple SUM/COUNT into single query with CTEs
- **Current:** 8 sequential queries in getDashboardData
- **Target:** 2-3 queries using CTEs
- **Acceptance:** Reduce query count to 3
- **Rollback:** Feature flag to use old vs new

---

### Batch 2: Database Optimizations

#### 2.1 Add Missing Indexes
- **Files:** `src/lib/db/schema.ts`
- **Change:** Add composite indexes for common query patterns
- **Indexes to Add:**
  ```typescript
  // In transactions table definition
  userPaymentDateIdx: index("idx_transactions_user_date")
    .on(table.userId, table.paymentDate),
  userNeedsReviewIdx: index("idx_transactions_user_review")
    .on(table.userId, table.needsReview),
  userAppCategoryIdx: index("idx_transactions_user_app_cat")
    .on(table.userId, table.appCategoryName),
  userTypeIdx: index("idx_transactions_user_type")
    .on(table.userId, table.type),
  userDisplayIdx: index("idx_transactions_user_display")
    .on(table.userId, table.display),
  ```
- **Acceptance:** EXPLAIN ANALYZE shows index scans
- **Rollback:** DROP INDEX commands

#### 2.2 Implement Pagination
- **Files:**
  - `src/lib/actions/transactions.ts`
  - `src/app/(dashboard)/transactions/page.tsx`
  - `src/app/(dashboard)/transactions/transaction-list.tsx`
- **Change:** Cursor-based pagination with 50 items per page
- **API:**
  ```typescript
  type PaginatedResult<T> = {
    items: T[];
    nextCursor: string | null;
    hasMore: boolean;
    total?: number;
  };

  getTransactionsPaginated(opts: {
    cursor?: string;
    limit?: number;
    filters?: TransactionFilters;
  }): Promise<PaginatedResult<Transaction>>
  ```
- **Acceptance:** Initial payload < 100KB, infinite scroll works
- **Rollback:** Keep old getTransactions, add pagination as opt-in

---

### Batch 3: Client-Side Optimizations

#### 3.1 Dynamic Import Confirm Tabs
- **Files:** `src/components/confirm/confirm-tabs.tsx`
- **Change:** Split tab content into separate components, dynamic import
- **Structure:**
  ```
  confirm-tabs.tsx (shell, ~5KB)
  ├── rules-discovery-tab.tsx (dynamic)
  ├── recurring-tab.tsx (dynamic)
  └── conflicts-tab.tsx (dynamic)
  ```
- **Acceptance:** Initial confirm page JS reduced by 30KB
- **Rollback:** Revert to single component

#### 3.2 Server Prefetch for Confirm
- **Files:**
  - `src/app/(dashboard)/confirm/page.tsx`
  - `src/components/confirm/confirm-tabs.tsx`
- **Change:** Fetch initial data in server component, pass to client
- **Current:** Client fetches on mount (waterfall)
- **Target:** Server prefetch, client updates on interaction
- **Acceptance:** No client data waterfall on initial load
- **Rollback:** Keep client fetching as fallback

#### 3.3 Lazy Load Framer Motion
- **Files:** Components using motion/* imports
- **Change:** Use `LazyMotion` with `domAnimation` features
- **Current:** Full Framer Motion bundle (~110KB)
- **Target:** Lazy loaded, feature-minimized (~30KB)
- **Acceptance:** Framer chunk reduced by 70%
- **Rollback:** Restore full imports

---

### Batch 4: Future Optimizations (Backlog)

#### 4.1 List Virtualization
- Implement react-window for transaction list
- Only render visible rows
- Dependencies: Pagination first

#### 4.2 Analytics Caching
- Implement ISR for /analytics with revalidate: 300
- Cache drill-down data
- Risk: Cache invalidation complexity

#### 4.3 Recharts Optimization
- Consider lighter charting library
- Import only used chart types
- Tree-shake unused features

#### 4.4 Radix UI Optimization
- Audit component usage
- Remove unused primitives
- Consider alternative for simple use cases

---

## Correctness Constraints

### Data Freshness Requirements
| Data Type | Max Staleness | Caching Allowed |
|-----------|---------------|-----------------|
| Transaction list | Real-time | No |
| Dashboard metrics | 1 minute | Server memoization |
| Analytics aggregates | 5 minutes | ISR possible |
| Taxonomy options | 1 hour | Client cache OK |
| Rules list | Real-time | No |

### Invariants (Must Not Change)
1. Transaction amounts must be precise (no rounding during optimization)
2. Category mappings must resolve identically
3. User data isolation (userId filtering) must remain
4. Audit trail for changes must be preserved
5. Auth checks must not be bypassed

### Caching Rules
1. Never cache user-specific data without userId key
2. Always invalidate on write operations
3. Use revalidatePath after mutations
4. Set appropriate Cache-Control headers

---

## Verification Plan

### Per-Fix Verification
1. Run `npm run build` - must pass
2. Run `npm run check` - TypeScript must pass
3. Manual smoke test of affected route
4. Measure before/after metric
5. Document in AFTER.md

### Regression Tests
1. Dashboard loads with correct data
2. Transactions filter correctly
3. Category drill-down works
4. Pagination (if implemented) maintains order
5. No console errors

### Performance Regression Gates
- Max client JS per route: defined in contract
- Max server response time: defined in contract
- Max DB queries per journey: defined in contract
- Automated check via `scripts/perf-check.ts`

---

## Rollback Plan

### Per-Change Rollback
Each change should be independently revertible:
1. **Schema changes:** Keep old indexes, add new ones
2. **API changes:** Keep old functions, add new ones
3. **Component changes:** Feature flag or dynamic import fallback

### Global Rollback
If major issues:
1. `git revert` the perf branch commits
2. Redeploy previous version
3. Document issue for post-mortem

---

## Timeline (Effort, Not Calendar)

| Batch | Est. Effort | Dependencies |
|-------|-------------|--------------|
| Batch 1 (Quick Wins) | 2-4 hours | None |
| Batch 2 (DB) | 3-5 hours | Batch 1 |
| Batch 3 (Client) | 4-6 hours | Batch 1, 2 |
| Batch 4 (Future) | TBD | Batch 1-3 |
| Documentation | 1-2 hours | All |
| Testing | 2-3 hours | All |

---

*Plan created 2026-01-17*
