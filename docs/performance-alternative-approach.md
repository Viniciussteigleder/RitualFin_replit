/**
 * Alternative Performance Optimization Approach
 * 
 * This approach focuses on server-side optimizations and smarter data fetching
 * rather than client-side memoization which can cause hydration issues.
 */

## Alternative Strategy: Server-Side First

### 1. **React Server Components (RSC) Optimization**

Instead of client-side memoization, leverage RSC to do heavy lifting on the server:

```tsx
// src/app/(dashboard)/transactions/page.tsx
export default async function TransactionsPage() {
  // All data fetching happens on server
  // No client-side re-fetching needed
  const [transactions, filterOptions] = await Promise.all([
    getTransactionsForList({ limit: 100 }), // Fetch more upfront
    getFilterOptions(),
  ]);

  return (
    <PageContainer>
      <PageHeader ... />
      {/* Pass all data as props - no client fetching */}
      <TransactionListClient 
        initialTransactions={transactions}
        filterOptions={filterOptions}
      />
    </PageContainer>
  );
}
```

### 2. **Streaming with Suspense**

Use React 18 Suspense to stream content progressively:

```tsx
<Suspense fallback={<TransactionsSkeleton />}>
  <TransactionList />
</Suspense>
```

Benefits:
- No "blinking" - skeleton shows immediately
- Content streams in as ready
- Better perceived performance

### 3. **URL-Based Filtering (No Client State)**

Move filter state to URL searchParams:

```tsx
// Filters update URL
const handleFilterChange = (newFilters) => {
  const params = new URLSearchParams(searchParams);
  params.set('category', newFilters.category);
  router.push(`/transactions?${params.toString()}`);
};
```

Benefits:
- No client state management
- Shareable URLs
- Browser back/forward works
- Server renders filtered data

### 4. **Partial Prerendering (PPR)**

Enable Next.js 15's Partial Prerendering:

```tsx
// next.config.ts
experimental: {
  ppr: true,
}

// page.tsx
export const experimental_ppr = true;
```

This renders static shell instantly, streams dynamic content.

### 5. **Database Query Optimization**

Instead of client-side filtering, optimize SQL:

```sql
-- Use materialized views for common aggregations
CREATE MATERIALIZED VIEW transaction_summary AS
SELECT 
  user_id,
  DATE_TRUNC('day', payment_date) as date,
  category_1,
  COUNT(*) as count,
  SUM(amount) as total
FROM transactions
GROUP BY user_id, date, category_1;

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY transaction_summary;
```

### 6. **Edge Caching with Vercel**

Use Vercel's edge caching for filtered results:

```tsx
export const revalidate = 60; // Cache for 1 minute

// Add cache tags for granular invalidation
export async function generateStaticParams() {
  return [
    { category: 'food' },
    { category: 'transport' },
    // ... common filters
  ];
}
```

### 7. **Optimistic UI Without Re-fetching**

Update local state optimistically, revalidate in background:

```tsx
const handleConfirm = async (id) => {
  // Update UI immediately
  setTransactions(prev => 
    prev.map(tx => tx.id === id ? {...tx, needsReview: false} : tx)
  );
  
  // Update server in background
  await confirmTransaction(id);
  
  // Revalidate path (soft refresh, no full reload)
  revalidatePath('/transactions');
};
```

## Implementation Priority

1. **Remove slide-in animation** (immediate fix for blinking)
2. **Add explicit positioning** to PageHeader/PageContainer
3. **Move to URL-based filtering** (eliminates client state issues)
4. **Enable Suspense boundaries** (better loading states)
5. **Implement PPR** (best of static + dynamic)

## Expected Results

- **No more blinking**: Static shell renders instantly
- **Faster perceived load**: Suspense shows content progressively  
- **Better SEO**: Server-rendered filtered pages
- **Simpler code**: Less client state management
- **Shareable URLs**: Filters in URL params

## Migration Path

Week 1:
- Fix animation issue ✅
- Add Suspense boundaries
- Move filters to URL

Week 2:
- Enable PPR
- Optimize database queries
- Add edge caching

Week 3:
- Implement optimistic UI
- Add loading skeletons
- Performance testing
