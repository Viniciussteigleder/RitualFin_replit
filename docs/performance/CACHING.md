# Caching Strategy - RitualFin

**Date:** 2026-01-17

---

## Overview

RitualFin prioritizes data freshness for financial data. Caching must be applied carefully to avoid showing stale data that could lead to incorrect financial decisions.

---

## Current Strategy

### Routes NOT Cached (force-dynamic)

| Route | Reason |
|-------|--------|
| `/` (Dashboard) | Real-time balance, spending metrics |
| `/transactions` | Must show latest transactions |
| `/confirm` | Review queue must be current |
| `/accounts` | Balance accuracy critical |
| `/budgets` | Must reflect current spending |

### Potential Caching Candidates

| Route | Data Type | Max Staleness | Recommendation |
|-------|-----------|---------------|----------------|
| `/analytics` | Aggregated history | 5-15 minutes | ISR with revalidate: 300 |
| `/rules` | User config | 1-5 minutes | ISR with on-demand revalidation |
| `/settings/*` | User config | 5 minutes | Static with on-demand revalidation |
| Taxonomy options | Reference data | 1 hour | Server cache + client SWR |

---

## Server-Side Caching

### Request Memoization (Automatic in Next.js)

Next.js automatically deduplicates fetch requests within a single render. This means:
- Multiple components fetching the same data = 1 request
- Works for native `fetch()` calls

For our server actions using Drizzle ORM, we rely on:
- Connection pooling via Neon
- Query result caching at database level

### Recommended: unstable_cache for Expensive Queries

```typescript
import { unstable_cache } from 'next/cache';

const getCachedSpendAverages = unstable_cache(
  async (userId: string, date: Date, periods: number[]) => {
    // ... expensive aggregation query
  },
  ['spend-averages'],
  {
    revalidate: 300, // 5 minutes
    tags: [`user-${userId}-spend`],
  }
);
```

---

## Client-Side Caching

### Currently Not Implemented

The app does not use client-side caching libraries (SWR, React Query). All data is fetched fresh on navigation.

### Recommended for Future

For non-critical data like:
- Taxonomy options (rarely change)
- User aliases
- Rules list

Consider:
```typescript
// Using SWR
const { data: aliases } = useSWR(
  '/api/aliases',
  fetcher,
  { revalidateOnFocus: false, dedupingInterval: 60000 }
);
```

---

## Cache Invalidation

### Critical Principle

**Always invalidate after writes.** The app uses `revalidatePath()` consistently:

```typescript
// After creating/updating transaction
revalidatePath("/transactions");
revalidatePath("/");

// After rule changes
revalidatePath("/rules");
revalidatePath("/transactions");
```

### Tag-Based Invalidation (Future)

For more granular invalidation:

```typescript
// When caching
unstable_cache(fn, ['transactions'], { tags: [`user-${userId}`] });

// When invalidating
import { revalidateTag } from 'next/cache';
revalidateTag(`user-${userId}`);
```

---

## Data Freshness Requirements

| Data | Max Acceptable Staleness | Cache Strategy |
|------|-------------------------|----------------|
| Account balance | Real-time | No cache |
| Transaction list | Real-time | No cache |
| Month-to-date spending | 1 minute | Request memoization only |
| Historical analytics | 5-15 minutes | ISR possible |
| Category breakdown | 5 minutes | ISR possible |
| Rules list | 1 minute | On-demand revalidation |
| Taxonomy | 1 hour | Long-term cache OK |

---

## Font Caching

### Before: Google Fonts
- Browser cached after first load
- But: 2 network requests on first visit
- FOUT risk

### After: System Fonts
- Zero network requests
- Instant availability
- No caching needed (fonts are local)

---

## Best Practices

1. **Prefer fresh data for financial metrics**
   - User trust depends on accuracy
   - Cache only historical/aggregated data

2. **Use revalidatePath after mutations**
   - Already implemented throughout the codebase
   - Ensures consistency after writes

3. **Consider ISR for analytics**
   - Historical data doesn't change
   - 5-minute staleness acceptable for aggregates

4. **Avoid client caching for transactions**
   - Bank imports can happen anytime
   - User expects to see latest data

5. **Document any caching decisions**
   - Add comments explaining cache duration
   - Note data freshness requirements

---

## Implementation Notes

Currently, no ISR or aggressive caching is implemented because:
1. The app is user-specific (no shared data)
2. Financial data accuracy is paramount
3. Query optimizations (indexes, batching) provide sufficient performance

If caching becomes necessary:
1. Start with `unstable_cache` for expensive aggregations
2. Use tag-based invalidation
3. Test thoroughly with real data patterns

---

*Caching strategy documented on 2026-01-17*
