# Performance Optimization Plan - Transactions Page
**Target**: Reduzir Time to Interactive (TTI) de ~3s para <1s  
**Priority**: HIGH (User-facing bottleneck)

---

## 🎯 FASE 1: Quick Wins (1-2h implementation)

### 1.1 Server-Side Filtering & Sorting
**Current**: Client filters 1000+ rows on every keystroke  
**Target**: Server filters via SQL `WHERE` clauses

**Changes**:
- Move `search`, `filters`, `sortField` to URL search params
- Update `getTransactionsForList` to accept filter params
- Add SQL clauses for category, amount range, date range

**Impact**: 70% reduction in client-side compute

---

### 1.2 Reduce Initial Payload
**Current**: Fetches 50 transactions + ALL aliases (500+ rows)  
**Target**: Fetch only aliases used in visible transactions

**Changes**:
```tsx
// Instead of getAliases() → 500 rows
const visibleAliases = transactions
  .map(tx => tx.aliasDesc)
  .filter(Boolean);

const aliases = await db.query.aliasAssets.findMany({
  where: inArray(aliasAssets.aliasDesc, visibleAliases)
});
```

**Impact**: 80% smaller initial JSON payload

---

### 1.3 Debounce Search Input
**Current**: Fires on every keystroke  
**Target**: 300ms debounce

```tsx
const debouncedSearch = useDebouncedValue(search, 300);
```

**Impact**: 90% fewer re-renders during typing

---

## 🔥 FASE 2: Virtual Scrolling (3-4h implementation)

### 2.1 Implement `react-window` or `@tanstack/react-virtual`
**Current**: Renders all 500 rows in DOM  
**Target**: Render only visible 20 rows

**Library**: `@tanstack/react-virtual` (lighter, better TS support)

**Changes**:
- Wrap `TransactionGroup` in `useVirtualizer`
- Calculate row heights dynamically
- Maintain scroll position on filter change

**Impact**: 95% reduction in DOM nodes

---

## ⚡ FASE 3: Database Optimization (1h)

### 3.1 Add Composite Index for Cursor Pagination
```sql
CREATE INDEX idx_transactions_cursor 
ON transactions(user_id, payment_date DESC, id DESC)
WHERE display != 'no';
```

### 3.2 Optimize `getTransactionsForList` Query
- Use `EXPLAIN ANALYZE` to verify index usage
- Add `LIMIT` offset guard (max 10,000 rows)

**Impact**: 50% faster query execution (200ms → 100ms)

---

## 📦 FASE 4: Advanced (Optional, 4-6h)

### 4.1 Implement Infinite Query with React Query
- Replace manual cursor state with `useInfiniteQuery`
- Auto-fetch next page on scroll
- Cache previous pages

### 4.2 Add Search Index (PostgreSQL Full-Text Search)
```sql
ALTER TABLE transactions 
ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('portuguese', COALESCE(desc_norm, '') || ' ' || COALESCE(alias_desc, ''))
) STORED;

CREATE INDEX idx_tx_search ON transactions USING GIN(search_vector);
```

**Impact**: Instant search on 100k+ transactions

---

## 📊 Success Metrics

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| Initial Load (TTI) | ~3s | <1s | Lighthouse |
| Search Response | ~500ms | <100ms | Chrome DevTools |
| Scroll FPS | 30fps | 60fps | React DevTools Profiler |
| Bundle Size (TX page) | 180KB | <120KB | Next.js Build Analyzer |

---

## 🛠️ Implementation Order

1. ✅ **Server-Side Filtering** (Highest ROI)
2. ✅ **Debounce Search**
3. ✅ **Reduce Alias Payload**
4. ⏳ **Virtual Scrolling** (if >200 rows common)
5. ⏳ **Database Index**
6. ⏳ **React Query** (polish)

---

**Next Step**: Implement 1.1 (Server-Side Filtering) - Estimated 45min
