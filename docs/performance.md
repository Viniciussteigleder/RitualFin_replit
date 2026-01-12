# Performance Assessment & Optimization Report

**Date**: 2026-01-12  
**Scope**: RitualFin Next.js Application  
**Baseline**: Pre-optimization measurements

---

## Executive Summary

**Build Performance**:
- ✅ Build Time: ~5.1s (TypeScript compilation)
- ✅ Static Generation: 372.8ms (22 pages, 7 workers)
- ⚠️ Build Size: 477MB (.next directory)
- ⚠️ JS Files: 445 files generated

**Runtime Performance** (to be measured):
- Dashboard load time: TBD
- Transaction list (50 items): TBD
- Rules engine execution: TBD
- Database query times: TBD

---

## Top 10 Performance Issues

### 1. **Large Build Output (477MB)**
**Impact**: High | **Effort**: Medium

**Evidence**:
```bash
$ du -sh .next
477M    .next
```

**Analysis**:
- Next.js 16 with Turbopack generates larger builds
- Likely includes source maps, cache, and build artifacts
- Production deployment only needs subset

**Optimization Plan**:
1. Run bundle analyzer to identify large dependencies
2. Check for duplicate dependencies
3. Verify tree-shaking is working
4. Consider code splitting for large routes

**Expected Improvement**: 30-50% reduction in deployed size

---

### 2. **No Bundle Analysis**
**Impact**: High | **Effort**: Low

**Current State**: No visibility into bundle composition

**Action**:
```bash
npm install --save-dev @next/bundle-analyzer
```

Add to `next.config.ts`:
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Run: `ANALYZE=true npm run build`

---

### 3. **CSS Import Order Warning**
**Impact**: Low | **Effort**: Low

**Evidence**:
```
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Noto+Sans:wght@100..900&display=swap');
^-- @import rules must precede all rules aside from @charset and @layer statements
```

**Fix**:
Move Google Fonts to `<link>` in `app/layout.tsx`:
```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Noto+Sans:wght@100..900&display=swap" rel="stylesheet" />
```

**Expected Improvement**: Eliminate build warning, potential font loading optimization

---

### 4. **No Database Query Optimization**
**Impact**: High | **Effort**: Medium

**Current State**:
- No query timing logs
- No index analysis
- Potential N+1 queries in transaction list

**Suspected Issues**:
```typescript
// src/lib/actions/transactions.ts:173-246
// getTransactions() - may have N+1 for accounts/rules joins
```

**Optimization Plan**:
1. Add query timing instrumentation
2. Review all Drizzle queries for N+1 patterns
3. Add database indexes for common filters
4. Implement query result caching for static data (rules, taxonomy)

**Measurement Needed**:
- Dashboard aggregation query time
- Transaction list query time (50, 100, 500 items)
- Rules matching time per transaction

---

### 5. **No Client-Side Caching Strategy**
**Impact**: Medium | **Effort**: Medium

**Current State**:
- Server actions called on every interaction
- No SWR or React Query
- Potential redundant fetches

**Optimization Plan**:
1. Implement SWR for read-heavy data (accounts, rules)
2. Add optimistic updates for mutations
3. Cache taxonomy/category data (rarely changes)

**Example**:
```typescript
// Before
const accounts = await getAccounts();

// After (with SWR)
const { data: accounts, mutate } = useSWR('/api/accounts', fetcher);
```

---

### 6. **Large Dependency: Recharts**
**Impact**: Medium | **Effort**: Low

**Evidence**:
```json
"recharts": "^2.15.4"
```

**Analysis**:
- Recharts is heavy (~100KB+)
- Only used for CategoryChart component
- Consider lighter alternatives (Chart.js, Victory, or custom SVG)

**Optimization**:
- Dynamic import for chart component
- Lazy load only when dashboard visible

```typescript
const CategoryChart = dynamic(() => import('./CategoryChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

**Expected Improvement**: 100KB+ reduction in initial bundle

---

### 7. **No Image Optimization**
**Impact**: Medium | **Effort**: Low

**Current State**:
- Logo/icon URLs from external sources (aliasAssets table)
- No Next.js Image component usage for external images
- Potential slow loading for merchant logos

**Optimization Plan**:
1. Use Next.js `<Image>` component with proper sizing
2. Add image caching headers
3. Consider CDN for static assets

---

### 8. **Synchronous Rules Engine**
**Impact**: Medium | **Effort**: Medium

**Current State**:
- Rules matching is synchronous
- Blocks during bulk recategorization
- No parallelization

**Evidence**:
```typescript
// src/lib/actions/bulk-operations.ts:99-138
// recategorizeAllTransactions() - processes sequentially
```

**Optimization Plan**:
1. Batch processing with p-limit
2. Parallel rule matching for independent transactions
3. Progress reporting for long operations

**Expected Improvement**: 3-5x faster bulk operations

---

### 9. **No Route-Level Performance Monitoring**
**Impact**: High | **Effort**: Medium

**Current State**:
- No timing metrics
- No slow query detection
- No performance budgets

**Optimization Plan**:
1. Add Server Timing API headers
2. Implement performance.mark/measure
3. Set up monitoring (Vercel Analytics or custom)

**Example**:
```typescript
export async function getDashboardData(date?: Date) {
  const start = performance.now();
  // ... query logic
  const duration = performance.now() - start;
  console.log(`getDashboardData took ${duration}ms`);
  return data;
}
```

---

### 10. **Potential Memory Leaks in Bulk Operations**
**Impact**: High | **Effort**: Medium

**Evidence**:
```typescript
// src/lib/actions/bulk-operations.ts:99-138
const allTransactions = await db.select()...  // Loads ALL into memory
```

**Risk**:
- Large datasets (1000+ transactions) may exhaust memory
- No streaming or pagination

**Optimization Plan**:
1. Implement cursor-based pagination
2. Process in batches of 100-500
3. Stream results instead of loading all

---

## Baseline Metrics (Pre-Optimization)

### Build Metrics
| Metric | Value | Target |
|--------|-------|--------|
| Build Time | 5.1s | < 10s ✅ |
| Static Generation | 372.8ms | < 1s ✅ |
| Build Size | 477MB | < 200MB ⚠️ |
| JS Files | 445 | < 300 ⚠️ |

### Route Metrics (To Be Measured)
| Route | Type | Target |
|-------|------|--------|
| `/` (Dashboard) | Dynamic | < 500ms |
| `/transactions` | Dynamic | < 1s |
| `/confirm` | Dynamic | < 500ms |
| `/rules` | Dynamic | < 500ms |
| `/analytics` | Dynamic | < 1s |

### Database Metrics (To Be Measured)
| Query | Target |
|-------|--------|
| getDashboardData | < 200ms |
| getTransactions(50) | < 100ms |
| matchRules (single) | < 10ms |
| recategorizeAll (100 txns) | < 5s |

---

## Optimization Roadmap

### Phase 1: Measurement (P0)
- [ ] Add bundle analyzer
- [ ] Add query timing logs
- [ ] Add route timing middleware
- [ ] Establish baselines

### Phase 2: Quick Wins (P0)
- [ ] Fix CSS import order
- [ ] Dynamic import for Recharts
- [ ] Add database indexes
- [ ] Implement query caching

### Phase 3: Structural (P1)
- [ ] Implement SWR/React Query
- [ ] Batch bulk operations
- [ ] Add streaming for large datasets
- [ ] Optimize images

### Phase 4: Advanced (P2)
- [ ] Code splitting optimization
- [ ] Service worker for offline
- [ ] Edge runtime for static routes
- [ ] CDN for assets

---

## Performance Budget

### Bundle Size Targets
- **Main bundle**: < 150KB (gzip)
- **Route chunks**: < 50KB each
- **Total initial load**: < 300KB

### Runtime Targets
- **Time to Interactive (TTI)**: < 3s
- **First Contentful Paint (FCP)**: < 1s
- **Largest Contentful Paint (LCP)**: < 2.5s

### Database Targets
- **Single query**: < 100ms (p95)
- **Aggregation query**: < 500ms (p95)
- **Bulk operation**: < 10s for 1000 items

---

## Monitoring Plan

### Metrics to Track
1. Build size (per deployment)
2. Route response times (p50, p95, p99)
3. Database query times
4. Error rates
5. User-perceived performance (Core Web Vitals)

### Tools
- Vercel Analytics (built-in)
- Custom timing logs
- Database query logging
- Bundle analyzer (CI)

---

## Before/After Summary

**Will be updated after Phase 4 implementation**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Build Size | 477MB | TBD | TBD |
| Dashboard Load | TBD | TBD | TBD |
| Bulk Recategorize (100) | TBD | TBD | TBD |
| Main Bundle | TBD | TBD | TBD |

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-12  
**Status**: Baseline established, optimizations pending
