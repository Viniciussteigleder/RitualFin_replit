# Performance Root Causes - RitualFin

**Date:** 2026-01-17
**Analysis Branch:** perf/root-causes-v2

---

## Root Cause Summary Table

| ID | Journey | Layer | Symptom | Evidence | Root Cause | Fix | Impact | Risk | Verification |
|----|---------|-------|---------|----------|------------|-----|--------|------|--------------|
| RC-01 | Dashboard | DB | ~20 DB queries per load | src/lib/actions/transactions.ts:23-156 | Sequential DB calls in getDashboardData() + 3x getSpendAveragesLastMonths() | Batch queries, reduce redundant calls | HIGH | LOW | Query count before/after |
| RC-02 | Transactions | DB | 2000 rows fetched | src/lib/actions/transactions.ts:244-325 | No pagination, full dataset transfer | Implement cursor pagination | HIGH | MED | Payload size, TTFB |
| RC-03 | Transactions | DB | Missing indexes | src/lib/db/schema.ts:392-395 | No index on (userId, paymentDate), (userId, needsReview), (userId, appCategoryName) | Add composite indexes | HIGH | LOW | Query EXPLAIN plans |
| RC-04 | All | Client | 426KB chart chunk | .next/static/chunks/cc10eca3554f046c.js | Recharts bundled eagerly, not tree-shaken | Dynamic import Recharts, consider lighter lib | MED | LOW | Chunk size |
| RC-05 | Confirm | Client | 52KB confirm-tabs component | src/components/confirm/confirm-tabs.tsx | Not dynamically imported, loads all tabs eagerly | Dynamic import tabs, split per tab | MED | LOW | Initial JS |
| RC-06 | Dashboard | Server | 6 parallel server calls | src/app/page.tsx:74-99 | getSpendAveragesLastMonths called 3x with different params | Consolidate into single action with all periods | MED | LOW | Server action count |
| RC-07 | All | Client | Large Radix UI chunks | .next/static/chunks/a74f48f62f73d8be.js (362KB x2) | Many Radix primitives imported globally | Import only used components | MED | MED | Client JS size |
| RC-08 | Analytics | Server | No caching | src/app/(dashboard)/analytics/page.tsx | force-dynamic, always refetches | Consider ISR with revalidate for analytics | MED | MED | Cache hit rate |
| RC-09 | Transactions | Server | Raw SQL with multiple JOINs | src/lib/actions/transactions.ts:258-280 | 4 LEFT JOINs for taxonomy resolution | Denormalize or batch taxonomy lookup | MED | MED | Query time |
| RC-10 | Dashboard | Client | Framer Motion 110KB | .next/static/chunks/a6dad97d9634a72d.js | Heavy animation library loaded globally | Use CSS animations, lazy load FM | MED | LOW | Initial JS |
| RC-11 | Rules | Server | 404KB rules-manager chunk | .next/server/chunks/ssr/src_components_rules_rules-manager_tsx.js | Heavy SSR for rules component | Split component, lazy load | LOW | LOW | SSR payload |
| RC-12 | Transactions | Client | Full transaction objects transferred | getTransactions returns all 30+ fields | Over-fetching, large JSON payload | Select only needed fields per context | MED | LOW | Payload size |
| RC-13 | Confirm | Client | 3 data fetches on mount | src/components/confirm/confirm-tabs.tsx:162-190 | useEffect triggers 3 server actions on mount | Prefetch on server, pass as props | MED | LOW | Client waterfall |
| RC-14 | All | Infra | All routes force-dynamic | src/app/page.tsx:54 | No static generation, no ISR | Evaluate per-route caching strategy | LOW | MED | Build output |
| RC-15 | Dashboard | DB | Repeated auth() calls | Multiple server actions call auth() | Session lookup on every action | Pass userId as parameter where safe | LOW | LOW | Auth overhead |
| RC-16 | Transactions | Client | No virtualization for 2000 rows | TransactionList renders all rows | DOM size, memory usage | Implement virtual list | MED | MED | Render time, memory |
| RC-17 | All | Client | Google Fonts network requests | src/app/layout.tsx (before fix) | FOUT, additional network latency | Use system fonts | HIGH | LOW | LCP, font load time |

---

## Detailed Root Cause Analysis

### RC-01: Dashboard DB Query Cascade
**Layer:** Database/Server
**Journey:** Dashboard (/)
**Severity:** HIGH

**Evidence:**
- `src/lib/actions/transactions.ts:23-156` - getDashboardData has 8 separate db calls
- `src/app/page.tsx:74-99` - Calls getSpendAveragesLastMonths 3 times (3, 6, 12 months)
- Each getSpendAveragesLastMonths makes 4 queries (appCategory, category1, category2, category3)

**Current Query Count:** ~20 DB roundtrips per dashboard load

**Root Cause:** Sequential individual queries instead of batch/aggregated queries.

**Fix:**
1. Combine getDashboardData queries using CTEs or subqueries
2. Create getSpendAveragesAllPeriods(date, [3,6,12]) that batches all periods
3. Use Promise.all for independent queries (already done partially)

**Impact:** HIGH - Reduce TTFB by 40-60%, reduce DB load
**Risk:** LOW - Pure optimization, no logic change
**Verification:** Count DB queries before/after using query logging

---

### RC-02: Transactions No Pagination
**Layer:** Database/Server/Client
**Journey:** Transactions (/transactions)
**Severity:** HIGH

**Evidence:**
- `src/lib/actions/transactions.ts:244-325` - getTransactions has LIMIT 2000
- `src/app/(dashboard)/transactions/page.tsx:25` - limit: sources?.length ? 1200 : 2000
- Network payload estimated at ~800KB-2MB for full dataset

**Root Cause:** Design assumes all transactions fit in memory/transfer. No server-side pagination.

**Fix:**
1. Implement cursor-based pagination (paymentDate + id cursor)
2. Default page size of 50, load more on scroll
3. Keep filter state server-side or in URL params

**Impact:** HIGH - Reduce payload from ~1MB to ~50KB initial, faster TTFB
**Risk:** MEDIUM - Changes data loading pattern, needs UI update
**Verification:** Measure payload size, TTFB before/after

---

### RC-03: Missing Database Indexes
**Layer:** Database
**Journey:** All
**Severity:** HIGH

**Evidence:**
- `src/lib/db/schema.ts:392-395` - transactions table has only `uniqueKeyPerUser` index
- Common queries filter by: userId, paymentDate, needsReview, appCategoryName, type, display

**Current Indexes:**
- `transactions_unique_key_per_user` (userId, key)
- `accounts_user_institution_idx`, `accounts_user_iban_idx`, `accounts_user_last4_idx`
- `ingestion_items_fingerprint_idx`

**Missing Indexes:**
```sql
CREATE INDEX idx_transactions_user_date ON transactions(user_id, payment_date DESC);
CREATE INDEX idx_transactions_user_review ON transactions(user_id, needs_review) WHERE needs_review = true;
CREATE INDEX idx_transactions_user_app_cat ON transactions(user_id, app_category_name);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_display ON transactions(user_id, display);
CREATE INDEX idx_rules_user_active_leaf ON rules(user_id, active, leaf_id) WHERE active = true;
```

**Root Cause:** Schema evolved without performance-focused index design.

**Fix:** Add composite indexes for common query patterns.
**Impact:** HIGH - Query time reduction 10x+ for filtered queries
**Risk:** LOW - Additive change, no schema modification
**Verification:** EXPLAIN ANALYZE before/after

---

### RC-04: Large Recharts Bundle
**Layer:** Client
**Journey:** Dashboard, Analytics
**Severity:** MEDIUM

**Evidence:**
- `.next/static/chunks/cc10eca3554f046c.js` = 426KB
- Recharts imported in CategoryChart, SpendAveragesChart, analytics components

**Root Cause:** Recharts is a heavy charting library (~200KB min) bundled into main chunks.

**Fix:**
1. Already using dynamic imports for chart components - verify effectiveness
2. Consider lighter alternatives (Chart.js, uPlot) for simple charts
3. Import only specific Recharts components (PieChart, BarChart)

**Impact:** MEDIUM - Could reduce initial JS by ~200KB
**Risk:** LOW - Internal change, no API change
**Verification:** Chunk size measurement

---

### RC-05: Heavy Confirm Tabs Component
**Layer:** Client
**Journey:** Confirm (/confirm)
**Severity:** MEDIUM

**Evidence:**
- `src/components/confirm/confirm-tabs.tsx` = 52KB source
- Contains 3 tabs: Rules Discovery, Recurring, Conflicts
- All tab content loads eagerly

**Root Cause:** Single large component with all tab logic, not code-split.

**Fix:**
1. Split into separate components per tab
2. Use dynamic imports for each tab content
3. Only load active tab content

**Impact:** MEDIUM - Reduce initial JS for /confirm by ~30KB
**Risk:** LOW - Internal restructuring
**Verification:** Initial bundle size for /confirm route

---

### RC-06: Redundant Spend Averages Calls
**Layer:** Server
**Journey:** Dashboard
**Severity:** MEDIUM

**Evidence:**
- `src/app/page.tsx:87-97` - Three separate calls:
  - `getSpendAveragesLastMonths(targetDate, 3)`
  - `getSpendAveragesLastMonths(targetDate, 6)`
  - `getSpendAveragesLastMonths(targetDate, 12)`
- Each makes 4 DB queries internally

**Root Cause:** API designed for single period, called multiple times.

**Fix:**
Create `getSpendAveragesMultiplePeriods(date, [3, 6, 12])` that:
1. Uses single date range query (covers 12 months)
2. Aggregates client-side for each period
3. Reduces from 12 queries to 4

**Impact:** MEDIUM - Reduce DB queries by ~8
**Risk:** LOW - New function, can run alongside old
**Verification:** Query count, server action timing

---

### RC-07: Radix UI Bundle Size
**Layer:** Client
**Journey:** All
**Severity:** MEDIUM

**Evidence:**
- Multiple 362KB chunks containing Radix primitives
- Global imports in ui/ components
- 30+ Radix packages in dependencies

**Root Cause:** Radix primitives tree-shake well, but many components used globally.

**Fix:**
1. Audit Radix component usage
2. Use barrel imports sparingly
3. Consider removing unused components
4. Dynamic import complex dialogs/modals

**Impact:** MEDIUM - Potential 100-200KB reduction
**Risk:** MEDIUM - Requires careful import management
**Verification:** Client bundle size

---

### RC-08: No Caching for Analytics
**Layer:** Server
**Journey:** Analytics
**Severity:** MEDIUM

**Evidence:**
- All routes use `force-dynamic` or are dynamic by default
- Analytics data doesn't need real-time freshness

**Root Cause:** Blanket dynamic rendering strategy.

**Fix:**
1. Implement ISR for analytics with revalidate: 300 (5 min)
2. Use Next.js cache() for repeated queries
3. Consider edge caching for read-heavy routes

**Impact:** MEDIUM - Reduce server load, faster repeat visits
**Risk:** MEDIUM - Need to ensure cache invalidation on data changes
**Verification:** Cache hit rate, repeat visit TTFB

---

### RC-09: Complex Transaction Query JOINs
**Layer:** Database
**Journey:** Transactions
**Severity:** MEDIUM

**Evidence:**
```sql
-- src/lib/actions/transactions.ts:258-280
SELECT t.*, t1.nivel_1_pt, t2.nivel_2_pt, tl.nivel_3_pt, r.key_words...
FROM transactions t
LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
LEFT JOIN rules r ON t.rule_id_applied = r.id
```

**Root Cause:** Taxonomy resolution requires 3 JOINs per query.

**Fix:**
1. Denormalize: Store category1/2/3 names directly on transaction (already partially done)
2. Batch taxonomy lookup: Fetch all used leafIds, then bulk resolve
3. Add index on taxonomy foreign keys

**Impact:** MEDIUM - Simpler query, potentially faster
**Risk:** MEDIUM - Denormalization requires data sync
**Verification:** Query EXPLAIN, timing

---

### RC-10: Framer Motion Global Load
**Layer:** Client
**Journey:** All
**Severity:** MEDIUM

**Evidence:**
- `.next/static/chunks/a6dad97d9634a72d.js` = 110KB
- Framer Motion used for page transitions, animations

**Root Cause:** Heavy animation library loaded on initial page load.

**Fix:**
1. Replace simple animations with CSS (already have utilities in globals.css)
2. Dynamic import Framer Motion only where needed
3. Use `LazyMotion` with `domAnimation` features only

**Impact:** MEDIUM - Reduce initial JS by ~80KB
**Risk:** LOW - Progressive enhancement
**Verification:** Initial bundle size

---

### RC-11: Large Rules Manager SSR
**Layer:** Server
**Journey:** Rules
**Severity:** LOW

**Evidence:**
- `.next/server/chunks/ssr/src_components_rules_rules-manager_tsx.js` = 404KB
- Rules management is a complex component

**Root Cause:** Heavy component server-rendered entirely.

**Fix:**
1. Client component boundary - render skeleton on server
2. Load rules management client-side
3. Split into smaller components

**Impact:** LOW - Only affects /rules page
**Risk:** LOW - Internal change
**Verification:** SSR payload size

---

### RC-12: Over-fetching Transaction Fields
**Layer:** Server/Client
**Journey:** Transactions
**Severity:** MEDIUM

**Evidence:**
- getTransactions returns 30+ fields per transaction
- Many fields unused in list view (classification_candidates, foreign_currency, etc.)

**Root Cause:** Single "get all" function for all contexts.

**Fix:**
1. Create getTransactionsForList() with essential fields only
2. Fetch full details only on demand (drawer open)
3. Use GraphQL-style field selection or separate endpoints

**Impact:** MEDIUM - Reduce payload 50%+
**Risk:** LOW - Additive, doesn't change existing
**Verification:** Payload size comparison

---

### RC-13: Confirm Page Client Waterfall
**Layer:** Client
**Journey:** Confirm
**Severity:** MEDIUM

**Evidence:**
- `src/components/confirm/confirm-tabs.tsx:192-197` - useEffect loads 3 data sets on mount
- Data could be loaded on server and passed as props

**Root Cause:** Design as client component with client-side data fetching.

**Fix:**
1. Load initial data in server component
2. Pass as props to client component
3. Only use client fetching for updates/filters

**Impact:** MEDIUM - Eliminate client waterfall
**Risk:** LOW - Data flow change, not logic
**Verification:** Network waterfall, TTFB

---

### RC-14: Force-Dynamic Everywhere
**Layer:** Infra
**Journey:** All
**Severity:** LOW

**Evidence:**
- `src/app/page.tsx:54` - `export const dynamic = 'force-dynamic'`
- All dashboard routes default to dynamic

**Root Cause:** Blanket approach to ensure fresh data.

**Fix:**
1. Analyze per-route freshness requirements
2. Use ISR where 5-15 minute staleness acceptable
3. Use unstable_cache for expensive queries

**Impact:** LOW - More nuanced than blanket fix
**Risk:** MEDIUM - Needs careful analysis per route
**Verification:** Build output, cache behavior

---

### RC-15: Repeated Auth Calls
**Layer:** Server
**Journey:** All
**Severity:** LOW

**Evidence:**
- Every server action calls `await auth()` independently
- Multiple actions per page = multiple auth calls

**Root Cause:** Defensive programming, each action validates independently.

**Fix:**
1. In page components, call auth() once and pass userId to actions
2. Actions can have "trusted" variants that skip auth
3. Use Next.js request memoization

**Impact:** LOW - Minor overhead per request
**Risk:** LOW - Security pattern change needs care
**Verification:** Auth call count per page

---

### RC-16: No Virtualization for Long Lists
**Layer:** Client
**Journey:** Transactions
**Severity:** MEDIUM

**Evidence:**
- TransactionList renders up to 2000 rows
- No virtual scrolling implementation
- Potential DOM size and memory issues

**Root Cause:** Initial design didn't anticipate large datasets.

**Fix:**
1. Implement react-window or tanstack-virtual
2. Virtualize transaction list with fixed row heights
3. Only render visible items + buffer

**Impact:** MEDIUM - Better scroll performance, lower memory
**Risk:** MEDIUM - Changes list behavior, needs testing
**Verification:** DOM node count, scroll performance

---

### RC-17: Google Fonts Network Requests (FIXED)
**Layer:** Client/Infra
**Journey:** All
**Severity:** HIGH

**Evidence:**
- Original: `import { Manrope, Noto_Sans } from "next/font/google"`
- 2 network requests to fonts.googleapis.com
- FOUT risk, LCP impact

**Root Cause:** External font loading adds network dependency.

**Fix Applied:**
- Switched to system font stack in globals.css
- Zero network requests for fonts
- Instant font availability

**Impact:** HIGH - ~50-100ms LCP improvement
**Risk:** LOW - Minor visual change (system fonts vs Google fonts)
**Verification:** Network tab, LCP measurement

---

## Priority Matrix

### P1 - Critical (Fix Immediately)
- RC-02: Transactions pagination
- RC-03: Missing indexes
- RC-17: Google Fonts (FIXED)

### P2 - High (Fix Soon)
- RC-01: Dashboard query cascade
- RC-06: Redundant spend averages
- RC-12: Over-fetching fields

### P3 - Medium (Fix When Possible)
- RC-04: Recharts bundle
- RC-05: Confirm tabs splitting
- RC-09: Complex JOINs
- RC-10: Framer Motion
- RC-13: Confirm waterfall
- RC-16: List virtualization

### P4 - Low (Backlog)
- RC-07: Radix bundle
- RC-08: Analytics caching
- RC-11: Rules manager
- RC-14: Force-dynamic
- RC-15: Auth calls

---

*Root cause analysis completed 2026-01-17*
