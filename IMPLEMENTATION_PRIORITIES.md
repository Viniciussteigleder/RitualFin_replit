# Implementation Priority Queue
**Updated:** 2026-01-10 19:15

## ✅ COMPLETED IN THIS SESSION

- [x] Comprehensive assessment document created
- [ ] Security hardening
- [ ] Fix broken buttons
- [ ] Error handling improvements
- [ ] Feature completion

## 🔴 IN PROGRESS - Critical Fixes

### 1. Button Action Implementations

#### Calendar - "Novo Evento" Button
**Status:** Starting implementation
**Files to modify:**
- `src/app/(dashboard)/calendar/page.tsx` - Add modal/dialog
- Create `src/components/calendar/new-event-dialog.tsx`
- Create `src/lib/actions/calendar.ts` - Server action for event creation

#### AI Analyst Chat - Real Integration
**Decision Required:** 
- Option A: Integrate with OpenAI API
- Option B: Disconnect button and mark as V2 feature
- **Recommendation:** Option B for now (faster to production)

#### Transaction Details Drawer
**Status:** Next in queue
**Files to create:**
- `src/components/transactions/transaction-drawer.tsx`
- Update `src/components/transactions/transaction-list.tsx`

### 2. Error Handling Standardization

**Pattern to implement:**
```typescript
import { z } from 'zod';

type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function serverAction(): Promise<Result<ReturnType>> {
  try {
    // Validate input
    // Process
    return { success: true, data: result };
  } catch (error) {
    console.error('[serverAction]', error);
    return { success: false, error: "User-friendly message" };
  }
}
```

**Files to update:**
- All files in `src/lib/actions/*`
- Priority: `ingest.ts`, `transactions.ts`, `rules.ts`

### 3. Security - Input Validation

**Files to create:**
- `src/lib/validators/index.ts` - Central validation schemas

**Files to update:**
- `src/lib/actions/ingest.ts` - File upload validation
- `src/lib/actions/transactions.ts` - Transaction update validation
- `src/lib/actions/rules.ts` - Rule creation validation

## 🟡 NEXT UP - Feature Completion

### 4. Transaction Bulk Actions
- [ ] Add selection checkboxes to transaction list
- [ ] Add floating action bar
- [ ] Implement bulk categorize
- [ ] Implement bulk delete (with confirmation)
- [ ] Implement bulk export

### 5. Rituals Page Completion
- [ ] Add "Start Ritual" functionality
- [ ] Implement completion flow
- [ ] Add streak tracking
- [ ] Persist completion state

## 🟢 IMPROVEMENTS - UX Polish

### 6. Loading States
- [ ] Add Suspense boundaries
- [ ] Skeleton loaders for all pages
- [ ] Button loading states (with spinner)

### 7. Toast Notifications
- [ ] Standardize success messages
- [ ] Standardize error messages
- [ ] Add retry actions where applicable

## 📊 Progress Tracker

| Category | Items | Completed | Remaining |
|----------|-------|-----------|-----------|
| Critical Buttons | 5 | 0 | 5 |
| Error Handling | 13 files | 0 | 13 |
| Security | 4 items | 0 | 4 |
| Feature Complete | 6 | 0 | 6 |
| UX Polish | 8 | 0 | 8 |

**Overall Progress: 0% → Target: 80% by end of session**

## 🎯 Session Goal

Complete critical buttons and standardize error handling in top 3 action files.
