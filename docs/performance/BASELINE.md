# Performance Baseline - RitualFin

**Date:** 2026-01-17
**Branch:** perf/root-causes-v2
**Next.js Version:** 16.1.1 (Turbopack)
**Node Version:** See environment

---

## 1. Critical User Journeys

### Journey 1: Dashboard (/)
- **Entry Route:** `/`
- **Key Interactions:** Month selector, view accounts, view category chart
- **Success Criteria:** TTFB < 500ms, LCP < 2.5s
- **Current Behavior:**
  - Fetches 6 parallel server actions
  - `getDashboardData()` makes 8 DB queries internally
  - `getSpendAveragesLastMonths()` called 3x (3, 6, 12 months)
  - `getTransactions(5)` for recent transactions
  - `getAccounts()` for account cards

### Journey 2: Transactions/Extrato (/transactions)
- **Entry Route:** `/transactions`
- **Key Interactions:** Filter, search, pagination, view transaction drawer
- **Success Criteria:** TTFB < 800ms, LCP < 3s
- **Current Behavior:**
  - Fetches up to 2000 transactions in single query
  - Complex raw SQL JOIN with taxonomy tables
  - No server-side pagination
  - Client-side filtering on 2000 records

### Journey 3: Analytics/Análise Total (/analytics)
- **Entry Route:** `/analytics`
- **Key Interactions:** Drill-down by category, date filters, view charts
- **Success Criteria:** TTFB < 600ms, LCP < 2.5s
- **Current Behavior:**
  - 4 parallel queries (drill-down, month-by-month, top merchants, recurring)
  - Uses Suspense boundary

### Journey 4: Confirm Queue (/confirm)
- **Entry Route:** `/confirm`
- **Key Interactions:** Rule discovery, recurring suggestions, conflict resolution
- **Success Criteria:** TTFB < 600ms, LCP < 2.5s
- **Current Behavior:**
  - Client component with 3 parallel data fetches on mount
  - 52KB confirm-tabs.tsx component

### Journey 5: Rules Management (/rules)
- **Entry Route:** `/rules`
- **Key Interactions:** Create/edit rules, bulk operations
- **Success Criteria:** TTFB < 400ms, LCP < 2s
- **Current Behavior:**
  - Fetches all rules for user
  - 404KB server chunk for rules-manager

---

## 2. Build Output Metrics

### Bundle Sizes (Turbopack Build)
```
Total Build Size: 41MB (.next folder)
Total Client JS: 2.9MB (uncompressed)
Total Server JS: 7.3MB (uncompressed)
Build Time: ~9.3s (Turbopack)
```

### Largest Client Chunks
| Chunk | Size | Likely Content |
|-------|------|----------------|
| cc10eca3554f046c.js | 426KB | Recharts + dependencies |
| a74f48f62f73d8be.js | 362KB | Radix UI components |
| 693d2f3dac29c39a.js | 362KB | Radix UI components |
| 7b52218c954dfa8e.js | 220KB | OpenAI/AI chat |
| a6dad97d9634a72d.js | 110KB | Framer Motion |
| 8cd9f5b86f957521.js | 107KB | UI primitives |
| 214aa2091c50fde6.js | 106KB | Form/validation |
| 9ef69418cb00c27b.js | 100KB | Date utilities |
| 393752ef7748ec37.js | 83KB | Transaction components |
| 61ce8a03218eb935.js | 67KB | Analytics components |

### Largest Server Chunks
| Chunk | Size | Content |
|-------|------|---------|
| _2500f2ad._.js | 687KB | Root server bundle |
| _15b86a0f._.js | 483KB | Server actions bundle |
| src_components_rules_rules-manager_tsx.js | 404KB | Rules manager SSR |
| node_modules_36c686ad._.js | 361KB | Node modules (Drizzle) |
| [root-of-the-server]__573bfef9._.js | 332KB | Server components |

### Route Types
```
Static Routes (○): 4
  /_not-found, /icon.png, /login, /signup

Dynamic Routes (ƒ): 23
  All dashboard routes force-dynamic
  /api/* routes dynamic
```

---

## 3. Database Query Analysis

### Dashboard (/) - 8+ DB Queries
1. `SUM(amount)` - Total balance
2. `count(*)` - Pending transactions count
3. `SELECT importedAt` - Last sync (with ORDER BY, LIMIT 1)
4. `SUM(amount)` - Last 30 days spend
5. `SUM(amount)` - Month-to-date spend
6. `SUM(budgets.amount)` - Monthly goal
7. `GROUP BY category` - Category breakdown (LIMIT 20)
8. `getTransactions(5)` - Recent transactions with JOINs
9. `getAccounts()` - Account list
10-12. `getSpendAveragesLastMonths(3/6/12)` - 4 queries each = 12 more queries

**Total: ~20 DB roundtrips per dashboard load**

### Transactions (/transactions) - Complex Query
```sql
SELECT t.*, t1.nivel_1_pt, t2.nivel_2_pt, tl.nivel_3_pt, r.key_words...
FROM transactions t
LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
LEFT JOIN rules r ON t.rule_id_applied = r.id
WHERE t.user_id = $userId AND t.display != 'no'
ORDER BY t.payment_date DESC
LIMIT 2000
```

**Issues:**
- No pagination (returns 2000 rows)
- Multiple JOINs without covering indexes
- Large payload transfer

### Missing Indexes Identified
1. `transactions(userId, paymentDate)` - For date-range queries
2. `transactions(userId, needsReview)` - For confirm queue
3. `transactions(userId, appCategoryName)` - For analytics grouping
4. `transactions(userId, type)` - For expense/income filtering
5. `rules(userId, active, leafId)` - For rule lookup
6. `transactions(userId, display)` - For filtering display='no'

---

## 4. Component Analysis

### Heavy Components (by source size)
| Component | Size | Location |
|-----------|------|----------|
| confirm-tabs.tsx | 52KB | src/components/confirm/ |
| rule-discovery-card.tsx | 28KB | src/components/confirm/ |
| transaction-drawer.tsx | 20KB | src/components/transactions/ |
| transaction-detail-content.tsx | 20KB | src/components/transactions/ |
| analytics-drill-down.tsx | 16KB | src/components/analytics/ |
| analytics-filters.tsx | 13KB | src/components/analytics/ |
| AIAnalystChat.tsx | 12KB | src/components/transactions/ |
| filter-panel.tsx | 12KB | src/components/transactions/ |
| SpendAveragesChart.tsx | 11KB | src/components/dashboard/ |

### Dynamic Imports (Already Implemented)
- `CategoryChart` - Dashboard chart
- `SpendAveragesChart` - Dashboard averages

### Missing Dynamic Imports
- `confirm-tabs.tsx` - Heavy, only needed on /confirm
- `rule-discovery-card.tsx` - Heavy, only needed on /confirm
- `AIAnalystChat.tsx` - Heavy, feature component
- Analytics chart components

---

## 5. Data Freshness Analysis

### Routes Requiring Real-time Data
| Route | Freshness Need | Current | Recommendation |
|-------|---------------|---------|----------------|
| / (dashboard) | Near real-time | force-dynamic | Keep dynamic |
| /transactions | Near real-time | force-dynamic | Keep dynamic |
| /analytics | Can be stale (5-15 min) | force-dynamic | Consider ISR |
| /confirm | Near real-time | force-dynamic | Keep dynamic |
| /rules | Can be stale | force-dynamic | Consider ISR |
| /settings/* | Can be stale | dynamic | Consider static |
| /accounts | Near real-time | force-dynamic | Keep dynamic |

---

## 6. Network/Payload Analysis

### Estimated Payload Sizes
| Route | Data Payload | Notes |
|-------|--------------|-------|
| / | ~15KB | Dashboard metrics + 5 transactions |
| /transactions | ~800KB-2MB | 2000 transactions with all fields |
| /analytics | ~20KB | Aggregated data |
| /confirm | ~50KB | Discovery candidates + taxonomy |

### Font Loading (Before Fix)
- Google Fonts: 2 network requests to fonts.googleapis.com
- Potential FOUT (Flash of Unstyled Text)
- Additional ~50-100ms on LCP

### Font Loading (After Fix - System Fonts)
- Zero network requests
- No FOUT
- Instant font availability

---

## 7. Summary Metrics

| Metric | Baseline Value | Target | Status |
|--------|---------------|--------|--------|
| Build Time | 9.3s | <15s | OK |
| Client JS Total | 2.9MB | <2MB | NEEDS WORK |
| Largest Client Chunk | 426KB | <250KB | NEEDS WORK |
| Largest Server Chunk | 687KB | <500KB | NEEDS WORK |
| Dashboard DB Queries | ~20 | <8 | NEEDS WORK |
| Transactions Payload | ~1MB | <200KB | NEEDS WORK |
| Font Network Requests | 0 (fixed) | 0 | OK |
| Dynamic Routes | 23 | - | OK |
| Static Routes | 4 | - | Consider more |

---

## 8. Evidence Commands

```bash
# Build output
npm run build 2>&1

# Bundle sizes
find .next/static/chunks -name "*.js" | xargs du -ch | tail -1
find .next/server -name "*.js" | xargs du -ch | tail -1

# Largest chunks
find .next/static/chunks -name "*.js" -exec du -h {} \; | sort -h | tail -20

# Total build size
du -sh .next/
```

---

*Baseline captured on 2026-01-17 during performance audit*
