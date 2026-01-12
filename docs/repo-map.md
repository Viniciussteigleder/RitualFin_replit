# RitualFin Repository Map

**Generated**: 2026-01-12

## Framework & Infrastructure

| Aspect | Value |
|--------|-------|
| Framework | Next.js 16.1.1 (App Router) |
| React | 19 |
| Package Manager | npm |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Neon) |
| Auth | Auth.js v5 (NextAuth) |
| Deployment | Vercel |
| Test Framework | Playwright (E2E) |

## Key File Paths

### Rules Engine Core
- **Engine**: `src/lib/rules/engine.ts`
- **Classification Utils**: `src/lib/rules/classification-utils.ts`
- **Types**: `src/lib/db/schema.ts` (Rule type at line 684)

### Excel Source & Oracle
- **Excel File**: `docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx`
- **Oracle Parser**: `scripts/parse-rules-xlsx.ts`
- **Oracle Output**: `rules/oracle/*.json`

### Database Schema
- **Schema Definition**: `src/lib/db/schema.ts`
- **Drizzle Config**: `drizzle.config.ts`
- **DB Connection**: `src/lib/db/index.ts`
- **Schema Push**: `npm run db:push`

### Server Actions (Backend Logic)
- **Transactions**: `src/lib/actions/transactions.ts`
- **Analytics**: `src/lib/actions/analytics.ts`
- **Ingest/Import**: `src/lib/actions/ingest.ts`
- **Bulk Operations**: `src/lib/actions/bulk-operations.ts`
- **Rules Actions**: `src/lib/actions/rules.ts`

### Routes & Pages

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/` | `src/app/page.tsx` | Dashboard |
| `/transactions` | `src/app/(dashboard)/transactions/page.tsx` | Extrato |
| `/analytics` | `src/app/(dashboard)/analytics/page.tsx` | Analise Total |
| `/confirm` | `src/app/(dashboard)/confirm/page.tsx` | Review Queue |
| `/rules` | `src/app/(dashboard)/rules/page.tsx` | Rules Management |
| `/uploads` | `src/app/(dashboard)/uploads/page.tsx` | File Import |
| `/accounts` | `src/app/(dashboard)/accounts/page.tsx` | Accounts |
| `/calendar` | `src/app/(dashboard)/calendar/page.tsx` | Calendar |
| `/settings` | `src/app/(dashboard)/settings/page.tsx` | Settings |

### Filter Utilities
- **Client Filters**: `src/components/transactions/transactions-content.tsx`
- **Server Filters**: `src/lib/actions/transactions.ts` (getTransactions)
- **Analytics Filters**: `src/lib/actions/analytics.ts` (getAnalyticsData)

### Key Components
- **Transaction List**: `src/app/(dashboard)/transactions/transaction-list.tsx`
- **Analytics DrillDown**: `src/components/analytics/analytics-drill-down.tsx`
- **Category Chart**: `src/components/dashboard/CategoryChart.tsx`

### Authentication
- **Auth Config**: `src/auth.config.ts`
- **Auth Setup**: `src/auth.ts`
- **Middleware**: `src/middleware.ts`

### Deployment
- **Vercel Config**: `vercel.json`
- **Environment**: `.env.local` (local), Vercel secrets (prod)

## Database Tables (Rules & Taxonomy)

| Table | Purpose |
|-------|---------|
| `rules` | Keyword matching rules |
| `taxonomy_level_1` | Level 1 categories |
| `taxonomy_level_2` | Level 2 subcategories |
| `taxonomy_leaf` | Level 3 leaf categories |
| `alias_assets` | Display aliases for merchants |
| `app_category` | UI app categories |
| `app_category_leaf` | App category to leaf mapping |
| `transactions` | Transaction ledger |

## Build & Test Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run check      # TypeScript check
npm run db:push    # Push schema to DB
npx tsx scripts/parse-rules-xlsx.ts  # Generate Oracle
```
