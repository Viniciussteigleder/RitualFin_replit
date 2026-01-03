# User Feedback Implementation - January 3, 2026

## Overview

This document tracks the implementation of user feedback from `docs/Feedback_user/` directory, including:
- Screen fixes from `fix_02.pdf`
- Category/alias data from `RitualFin-categorias-alias.xlsx`
- Design inspiration screens
- Updated RitualFin logo

## ✅ Completed (Immediate Fixes)

### 1. Removed "Modo Lazy" Badge
- **File**: `client/src/components/onboarding-modal.tsx`
- **Change**: Removed entire "Modo Lazy Ativado" section from onboarding
- **Impact**: Cleaner onboarding UX, removed unnecessary information

### 2. Updated Logo
- **File**: `public/ritualfin-logo.png`
- **Change**: Replaced with new logo from `docs/Feedback_user/RitualFin Logo_small.png` (627KB)
- **Impact**: Updated branding across entire app

### 3. Reorganized Navigation Menu
- **File**: `client/src/components/layout/sidebar.tsx`
- **Change**: Restructured menu clusters per PRD:
  - **Overview**: Dashboard, Calendar
  - **Action**: Confirm Queue, Transactions
  - **Planning**: Budgets, Goals
  - **Automation**: Rules, AI Keywords
  - **Operations**: Upload, Accounts
  - **Collaboration**: Rituals
- **Impact**: Improved information architecture and user flow

### 4. Fixed Duplicate Settings
- **File**: Same as above
- **Change**: Removed duplicate Configurações from navigation clusters, kept only at bottom
- **Impact**: Cleaner sidebar UI

## 📊 Data Import Prepared

### Categories Import Script
- **File**: `server/import-categories-aliases.ts`
- **Data Source**: 109 category rows from Excel
- **Structure**:
  - Level 1 (Nivel_1_PT): 12 categories
  - Level 2 (Nivel_2_PT): ~30 subcategories
  - Level 3 (Nivel_3_PT/Leaf): ~109 specific categories
  - Auto-generated rules with keywords
- **Status**: Script created, ready to run

### Merchant Aliases Import
- **Data Source**: 1000 merchant alias rows from Excel
- **Fields**: Alias_Desc, Key_words_alias, URL_logo_internet
- **Major Merchants**: Amazon, Lidl, Rewe, Aldi, Edeka, Netto, Temu, PayPal, DM, Rossmann, Netflix, Disney+, etc.
- **Status**: Script created, ready to run

## 🔧 Critical Issues to Address

### Upload Failures (High Priority)
**Issue**: CSV uploads failing for all 3 sources
- ❌ Amex upload failing
- ❌ Miles & More (M&M) upload failing
- ❌ Sparkasse upload failing

**Next Steps**:
1. Test with real CSV files from `docs/Feedback_user/CSV_original/`
2. Debug CSV parser for each format
3. Enhance error reporting
4. Add detailed logs per PRD requirements

### Empty Screens (High Priority)
**Issue**: Key pages showing empty
- ❌ Confirm Queue (`/confirm`) - no content showing
- ❌ Rules page (`/rules`) - same issue

**Next Steps**:
1. Debug query logic
2. Check data availability
3. Add proper empty states
4. Verify API endpoints

## 🎯 Next Phase Implementation (Per PRD)

### Accounts Page Enhancements
**Requirements from fix_02.pdf page 5:**

1. **Balance History (Last 7 Days)**
   - Visual chart (Balken/bars + values)
   - Indicate which day balance was provided (different color/icon)
   - Show per account: Amex, M&M, Sparkasse

2. **Manual Balance Input**
   - Allow manual entry per account
   - Auto-timestamp when balance added manually
   - Store in database with metadata

3. **Mobile Screenshot Upload**
   - Upload mobile bank screenshots
   - Auto-recognize account (Amex, M&M, Sparkasse)
   - Extract balance and transactions
   - Future: OCR integration

4. **Net Position Calculation**
   - Formula: Sparkasse balance - (Amex used + M&M used)
   - Show consolidated view below individual accounts

### Rules Page Enhancements
**Requirements from fix_02.pdf page 3-4:**

1. **Excel/CSV Import**
   - Support bulk import of rules
   - Auto-recognize file format
   - Map columns to rule fields

2. **Optional Keywords Field**
   - Remove "required" validation from keywords field in Nova Regra modal
   - Allow rules without keywords (category-only rules)

### Financial Rituals Redesign
**Requirements from fix_02.pdf page 6:**

1. **Split Weekly vs Monthly**
   - Separate pages/flows for each ritual type
   - Different requirements for each

2. **Scheduling System**
   - Define day and time for each ritual
   - In-app pop-up reminders
   - Notification system integration

3. **Guided Ritual Flow**
   - Weekly ritual:
     - Review last week vs budget
     - AI insights on spending patterns
     - Reflection prompts
     - Set objectives for next week (e.g., "max €X on groceries")
   - Monthly ritual:
     - Full month review
     - Review weekly agreements
     - Adjust next month budget
     - Update goals

## 🎨 Design Inspiration Review

Design screens available in `docs/Feedback_user/Design_inspiration/Design_inspiration_stitch_ritualfin_v1 6/`:

**Key Screens to Review**:
1. `09)_painel_mensal_-_dashboard_1` & `dashboard_2` - Dashboard layouts
2. `10)_confirmar_-_fila_de_pendências` - Confirm queue bundling
3. `12)_detalhe_transação` - Transaction detail view with icons
4. `13)_calendário` - Calendar with projections
5. `16)_contas_1` through `contas_3` - Accounts balance views
6. `19)_ritual_mensal` - Monthly ritual flow
7. `20)_ritual_semanal_1` & `semanal_2` - Weekly ritual flows

## 📝 Dashboard Enhancements (Per PRD)

### Projection-Aware Budget
**Requirements:**
1. Calculate "Committed Obligations":
   - Recurring payments (Netflix, etc.)
   - Expected card bill payments
   - Scheduled future items

2. Show KPIs:
   - **Spent MTD** (month-to-date, excluding Internal)
   - **Committed** (future obligations)
   - **Available to Spend**:
     - This week
     - Until end of week
     - Until end of month

3. **Commitments Panel**:
   - List top upcoming obligations
   - Next 7 days committed value
   - Card bill expectations (due date + amount)
   - Critical alerts

### Weekly Capacity View
- Show spending capacity by week
- Consider budget - spent - committed
- Visual indicators for over/under budget

## 🔒 Internal Category Verification

**Requirement**: Ensure "Interna" category is excluded from:
- ✅ Spend totals
- ✅ Income totals
- ✅ Category spend analytics
- ✅ Budget consumption
- ✅ Dashboard KPIs
- ✅ Calendar daily totals

**Files to Verify**:
- `server/routes.ts` - Dashboard calculations
- Calendar aggregations
- Budget vs actual queries
- Transaction filtering

## 📋 Transaction Icons

**Requirement from PRD**:
Add icons to transaction list for:
- **Fixo/Variável** (Fixed/Variable)
- **Receita/Despesa** (Income/Expense) - already exists in some places
- **Recorrente** (Recurring)
- **Origem** (Origin/Account) - card/bank icon
- **Reembolso** (Refund)
- **Internal Transfer** flag

**Purpose**: Quick visual identification without reading text

## 🗂️ Confirm Queue Bundling

**Requirement from PRD Section 3.4**:
- Bundle by **merchant-normalized ONLY** (not by account, not by amount)
- Show bundle card with:
  - Merchant key
  - Count of transactions
  - 2-3 example descriptions
  - Total amount (optional)
- Apply category to entire bundle at once
- Add keywords and create/update rule

## 🚀 Deployment Notes

### Files Modified
1. `client/src/components/layout/sidebar.tsx` - Navigation restructure
2. `client/src/components/onboarding-modal.tsx` - Removed lazy mode
3. `public/ritualfin-logo.png` - New logo
4. `server/import-categories-aliases.ts` - NEW import script

### Database Changes Required
- Run import script to populate:
  - `taxonomy_level_1`
  - `taxonomy_level_2`
  - `taxonomy_leaf`
  - `rules` (auto-generated from keywords)
  - `alias_assets` (merchant data with logo URLs)

### Environment
- Branch: `claude/implement-user-feedback-OkKW8`
- No schema changes required (tables already exist)

## 📌 Priority Order

### Immediate (This Session)
- [x] Remove "Modo Lazy" badge
- [x] Update logo
- [x] Fix navigation clusters
- [x] Create import script for categories/aliases
- [ ] Commit and push changes

### High Priority (Next)
1. Debug Upload failures (critical blocker)
2. Fix Confirm Queue empty screen
3. Fix Rules page empty screen
4. Run category/alias import script
5. Make keywords field optional in rules

### Medium Priority
1. Accounts enhancements (balance history, manual input, screenshot upload)
2. Dashboard projection-aware calculations
3. Transaction icons
4. Confirm queue merchant bundling

### Lower Priority
1. Rituals redesign (weekly/monthly split)
2. Ritual scheduling and reminders
3. Calendar 4-week view
4. Rules Excel/CSV import

## 📎 Reference Links

- User Feedback PRD: `docs/_codex/PRD_FROM_USER_FEEDBACK.md`
- Detailed Feedback: `docs/_codex/USER_FEEDBACK_VERBATIM.md`
- Screen Fixes: `docs/Feedback_user/Screen_app_fixes/fix_02.pdf`
- Categories Data: `docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx`
- Design Inspiration: `docs/Feedback_user/Design_inspiration/`

## 🎯 Success Criteria

Per PRD Section 1.2:
- **Import success rate**: >95% jobs succeed
- **Dedup outcome**: 0 duplicates visible after overlapping re-uploads
- **Categorization coverage**: >90% auto-categorized after initial setup, >98% after Confirm Queue
- **Review efficiency**: Clear month's unclassified backlog in <15 minutes using bundling
- **Ritual adoption**: Weekly ritual completed ≥3 times/month

---

**Last Updated**: January 3, 2026
**Session**: claude/implement-user-feedback-OkKW8
**Model**: Sonnet 4.5
