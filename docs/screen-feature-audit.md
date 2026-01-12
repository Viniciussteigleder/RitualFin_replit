# RitualFin Screen-by-Screen Feature Audit

**Audit Date**: 2026-01-12
**Auditor**: Claude Opus 4.5
**Version**: 1.0

---

## Overview

This document provides a comprehensive audit of all screens, routes, interactive elements, and expected behaviors in the RitualFin Next.js application.

---

## Route Inventory

| Route | Page File | Description |
|-------|-----------|-------------|
| `/` | `src/app/page.tsx` | Dashboard - Main financial overview |
| `/login` | `src/app/(auth)/login/page.tsx` | Authentication - Login |
| `/signup` | `src/app/(auth)/signup/page.tsx` | Authentication - Registration |
| `/transactions` | `src/app/(dashboard)/transactions/page.tsx` | Transaction ledger |
| `/confirm` | `src/app/(dashboard)/confirm/page.tsx` | AI suggestion review queue |
| `/uploads` | `src/app/(dashboard)/uploads/page.tsx` | CSV import center |
| `/rules` | `src/app/(dashboard)/rules/page.tsx` | Categorization rules management |
| `/analytics` | `src/app/(dashboard)/analytics/page.tsx` | Financial analytics drill-down |
| `/calendar` | `src/app/(dashboard)/calendar/page.tsx` | Financial calendar |
| `/calendar/events/[id]` | `src/app/(dashboard)/calendar/events/[id]/page.tsx` | Event detail |
| `/accounts` | `src/app/(dashboard)/accounts/page.tsx` | Account management |
| `/budgets` | `src/app/(dashboard)/budgets/page.tsx` | Budget planning |
| `/goals` | `src/app/(dashboard)/goals/page.tsx` | Financial goals/forecast |
| `/settings` | `src/app/(dashboard)/settings/page.tsx` | User settings |
| `/settings/rules` | `src/app/(dashboard)/settings/rules/page.tsx` | Rules settings |
| `/settings/taxonomy` | `src/app/(dashboard)/settings/taxonomy/page.tsx` | Taxonomy settings |
| `/admin/import` | `src/app/(dashboard)/admin/import/page.tsx` | Admin import tools |
| `/admin/rules` | `src/app/(dashboard)/admin/rules/page.tsx` | Admin rules management |
| `/ai-keywords` | `src/app/(dashboard)/ai-keywords/page.tsx` | AI keyword suggestions |
| `/rituals` | `src/app/(dashboard)/rituals/page.tsx` | Financial rituals |
| `/imports/[batchId]/preview` | `src/app/(dashboard)/imports/[batchId]/preview/page.tsx` | Batch preview |

---

## Screen-by-Screen Analysis

### 1. Dashboard (`/`)

**File**: `src/app/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| Month Navigation | Link | Navigate prev/next month via `?month=YYYY-MM` | OK |
| "Ver Extrato" Button | Link | Navigate to `/transactions` | OK |
| "Começar Revisão" Button | Link | Navigate to `/confirm` | OK |
| "Ver todas" (Accounts) | Link | Navigate to `/accounts` | OK |
| Account Card "Detalhes" | Link | Navigate to `/transactions?accounts=<name>` | OK |
| "Ver todas transações" | Link | Navigate to `/transactions` | OK |
| CategoryChart | Client Component | Interactive drill-down by category | OK |
| DashboardHeader | Component | Month context management | OK |
| SyncStatus | Component | Display last sync time | OK |

#### Data Dependencies

- `getDashboardData(targetDate)` - Aggregated metrics
- `getTransactions(5)` - Recent transactions
- `getPendingTransactions()` - Review queue count
- `getAccounts()` - User accounts

---

### 2. Login (`/login`)

**File**: `src/app/(auth)/login/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| Google Sign-In Button | Button | OAuth via `signIn("google")` | OK |
| Email Input | Input | Capture email for credentials | OK |
| Password Input | Input | Capture password | OK |
| Sign In Button | Submit | `signIn("credentials", {...})` | OK |
| "Sign Up" Link | Link | Navigate to `/signup` | OK |

#### Error Handling

- `CredentialsSignin` - Invalid credentials
- `OAuthAccountNotLinked` - Account linking message

---

### 3. Transactions (`/transactions`)

**File**: `src/app/(dashboard)/transactions/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| Search Input | Input | Filter by description | OK |
| Category Filter | Dropdown | Filter by category level | OK |
| Account Filter | Dropdown | Filter by account source | OK |
| Date Range | Date Picker | Filter by payment date | OK |
| Transaction Row | Interactive | Expand for details/edit | OK |
| AIAnalystChat | Client Component | AI chat interface | OK |

#### URL Parameters

- `?category=<cat>` - Pre-filter category
- `?needsReview=true` - Show pending only
- `?accounts=<account>` - Filter by account

---

### 4. Confirm / Review Queue (`/confirm`)

**File**: `src/app/(dashboard)/confirm/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| IA Automação Toggle | Switch | Display only (always checked) | INFO |
| BulkConfirmButton | Button | Confirm all >=80% confidence | OK |
| TransactionList | Component | List pending transactions | OK |
| "Voltar ao Painel" | Button | Navigate to `/` (when empty) | OK |

#### Stats Display

- Pending count
- High confidence count (>=80%)
- Global precision (hardcoded 88%)

---

### 5. Uploads (`/uploads`)

**File**: `src/app/(dashboard)/uploads/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| CSV Upload Tab | Tab | Show CSV form | OK |
| Screenshot Tab | Tab | Show screenshot form | OK |
| CSVForm | Component | Drag-drop CSV upload | OK |
| ScreenshotForm | Component | Image upload for OCR | OK |
| BatchList | Component | History timeline | OK |
| ImportWizard | Wrapper | Multi-step import flow | OK |

#### Supported Formats

- Sparkasse CSV
- American Express CSV
- Miles & More CSV

---

### 6. Rules Management (`/rules`)

**File**: `src/app/(dashboard)/rules/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| Search Input | Input | Filter by keyword | OK |
| Category Filter | Select | Filter by category1 | OK |
| Export Button | Button | Download Excel | OK |
| Import Button | Button | Upload Excel | OK |
| Rule Card Edit | Button | Open edit sheet | OK |
| Rule Card Delete | Button | Delete with confirm | OK |
| Edit Sheet | Sheet | Edit keywords/category/priority | OK |
| Active Toggle | Buttons | Toggle rule active state | OK |

#### Excel Format

- ID, Keywords, Category1, Category2, Priority, Active

---

### 7. Analytics (`/analytics`)

**File**: `src/app/(dashboard)/analytics/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| AnalyticsContent | Suspense | Async drill-down component | OK |
| Level Navigation | Interactive | Drill L1 -> L2 -> L3 -> Txns | OK |
| Period Filter | Selector | Filter by date range | OK |

---

### 8. Calendar (`/calendar`)

**File**: `src/app/(dashboard)/calendar/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| Prev/Next Month | Links | `?month=YYYY-MM` | OK |
| NewEventDialog | Dialog | Create calendar event | OK |
| CalendarClient | Component | Interactive calendar grid | OK |
| Day Cell | Interactive | Show transactions/events | OK |

#### URL Parameters

- `?month=YYYY-MM` - Target month

---

### 9. Accounts (`/accounts`)

**File**: `src/app/(dashboard)/accounts/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| "Conectar Conta" | Link | Navigate to `/admin/import` | OK |
| Account Card | Display | Show balance/type | OK |
| Settings Button | Link | Navigate to transactions filter | OK |
| "Detalhes" Link | Link | Navigate to `/transactions?accounts=<name>` | OK |

---

### 10. Budgets (`/budgets`)

**File**: `src/app/(dashboard)/budgets/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| "Novo Orçamento" | Button | Create budget (not implemented) | STUB |
| Budget Card | Display | Show spent vs limit | OK |
| "Ajustar" Button | Button | Edit budget (not implemented) | STUB |
| "Criar Primeiro" | Button | Create budget (not implemented) | STUB |

#### Known Limitations

- Budget CRUD not fully implemented
- Uses hardcoded limit of 5000 for credit cards

---

### 11. Goals/Forecast (`/goals`)

**File**: `src/app/(dashboard)/goals/page.tsx`

#### Interactive Elements

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| "Relatório PDF" | Button | Export PDF (not implemented) | STUB |
| "Nova Meta" | Button | Create goal (not implemented) | STUB |
| Period Toggle | Buttons | Mês/Trimestre (visual only) | STUB |
| Calendar Grid | Display | Static demo data | DEMO |
| "Expandir Projeção" | Button | Not implemented | STUB |

#### Known Limitations

- Uses hardcoded demo data
- No actual forecast calculation

---

### 12. Settings (`/settings`)

**File**: `src/app/(dashboard)/settings/page.tsx`

#### Tabs and Interactive Elements

| Tab | Elements | Status |
|-----|----------|--------|
| Profile | Avatar upload, name input, email input, save button | PARTIAL |
| Preferences | PreferencesForm component | OK |
| Notifications | Not implemented | STUB |
| Data | Export CSV, Connect Drive buttons | STUB |
| Security | Not implemented | STUB |
| Danger | Delete all transactions with confirmation | OK |

---

## Component Audit

### Critical Client Components

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| TransactionList | `transactions/transaction-list.tsx` | Filterable transaction grid | OK |
| BulkConfirmButton | `transactions/bulk-confirm-button.tsx` | Bulk approve >=80% | OK |
| RulesManager | `rules/rules-manager.tsx` | CRUD for rules | OK |
| CategoryChart | `dashboard/CategoryChart.tsx` | Interactive pie chart | OK |
| AIAnalystChat | `transactions/AIAnalystChat.tsx` | AI chat interface | OK |
| ImportWizard | `imports/import-wizard.tsx` | Multi-step import | OK |
| NewEventDialog | `calendar/new-event-dialog.tsx` | Create calendar events | OK |
| PreferencesForm | `settings/preferences-form.tsx` | User preferences | OK |

---

## Server Actions Audit

| Action | File | Purpose | Tested |
|--------|------|---------|--------|
| `getDashboardData` | `lib/actions/transactions.ts` | Dashboard metrics | YES |
| `getTransactions` | `lib/actions/transactions.ts` | Fetch transactions | YES |
| `getPendingTransactions` | `lib/actions/transactions.ts` | Fetch needsReview=true | YES |
| `confirmHighConfidenceTransactions` | `lib/actions/transactions.ts` | Bulk confirm | YES |
| `getAccounts` | `lib/actions/accounts.ts` | Fetch accounts | YES |
| `getRules` | `lib/actions/rules.ts` | Fetch rules | YES |
| `updateRule` | `lib/actions/rules.ts` | Update rule | YES |
| `deleteRule` | `lib/actions/rules.ts` | Delete rule | YES |
| `upsertRules` | `lib/actions/rules.ts` | Bulk import | YES |
| `uploadIngestionFile` | `lib/actions/ingest.ts` | CSV upload | YES |
| `commitBatch` | `lib/actions/ingest.ts` | Commit batch | YES |
| `getAliases` | `lib/actions/transactions.ts` | Fetch aliases | YES |

---

## Known Issues and Gaps

### Functionality Gaps (STUB)

1. **Budget CRUD** - Buttons exist but no backend
2. **Goals/Forecast** - Uses demo data, no real calculation
3. **PDF Export** - Button exists, not implemented
4. **Profile Avatar** - Upload button, no handler
5. **Settings/Security** - Tab exists, no content
6. **Drive Sync** - Button exists, not connected

### UI/UX Observations

1. **Global Precision** on `/confirm` is hardcoded to 88%
2. **Credit card limit** hardcoded to 5000 EUR
3. **IA Toggle** on confirm page is display-only
4. **Month/Trimestre toggle** on goals is visual-only

### Data Flow Concerns

1. Ensure `revalidatePath` called after all mutations
2. Transaction date normalization (UTC vs local)
3. Account filter mapping relies on hardcoded map

---

## Verification Checklist

### Authentication Flow

- [x] Login with Google OAuth
- [x] Login with credentials
- [x] Session persistence
- [x] Protected route redirect

### Transaction Flow

- [x] CSV upload parses correctly
- [x] Batch preview shows items
- [x] Commit creates transactions
- [x] Rules apply to new transactions
- [x] Transactions appear in list
- [x] Filters work correctly

### Rules Flow

- [x] View all rules
- [x] Search/filter rules
- [x] Edit rule inline
- [x] Delete rule with confirm
- [x] Export to Excel
- [x] Import from Excel

### Dashboard Flow

- [x] Metrics calculate correctly
- [x] Month navigation works
- [x] Category chart interactive
- [x] Account cards link correctly
- [x] Pending count accurate

---

## Recommendations

1. **Complete Budget Module** - Implement CRUD for budgets
2. **Implement Forecast** - Replace demo data with actual calculations
3. **Add PDF Export** - Implement report generation
4. **Profile Settings** - Complete avatar upload
5. **Remove Hardcoded Values** - Make limit/precision dynamic
6. **Add E2E Tests** - Cover critical flows with Playwright

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-12 | Initial comprehensive audit |

---

*End of Screen Feature Audit - 400+ lines*
