# Upload Screen Fixes - Implementation Plan

**Date**: 2026-01-04
**Issue**: Multiple UX and error handling problems in upload screen

---

## Issues Reported

### 1. Error Handling (CRITICAL)
**Current**: "Request failed" with no details
**Problem**: Generic error message, user can't debug
**Root Cause**:
- `client/src/lib/api.ts:145-147` - Catches error but loses backend details
- `client/src/lib/api.ts:164-168` - Same issue
- Backend error messages not propagated to UI

**Fix Required**:
- Show backend error message + stack trace (in dev mode)
- Show HTTP status code
- Show which step failed (preview vs process)
- Add error boundary for better debugging

---

### 2. Confirmation Checkbox Position
**Current**: Checkbox at bottom of preview
**Problem**: User has to scroll down to see it
**Fix**: Move checkbox to TOP of preview section

---

### 3. Preview Row Count
**Current**: Shows "Lin has 20" hardcoded
**Problem**: Should be 10 by default, customizable
**Fix**:
- Default: 10 rows
- Add dropdown/input to change: 10, 20, 50, 100, All
- Remember user preference

---

### 4. Column Selection (NEW FEATURE)
**Current**: Shows ALL detected columns + automatic columns (Key Desc, Conta, Key)
**Problem**: Too many columns, hard to read
**Requested**:
- Checkboxes to select which columns to display
- Default pre-selected:
  - Data (Authorised on / Datum / etc)
  - Amount (with color: RED for negative, GREEN for positive)
  - Currency
  - Description
  - Key_desc
- User can toggle other columns on/off

---

### 5. Amount Color Coding
**Current**: All amounts in black
**Problem**: Hard to distinguish income vs expenses
**Fix**:
- Negative amounts: RED
- Positive amounts: GREEN
- Format: -€45.50 vs +€1,200.00

---

### 6. Date Display in Header
**Current**: Shows import date (input field)
**Problem**: Not clear what date means
**Fix**: Show last transaction date from file: "Última transação: 04.01.2026"

---

### 7. Sparkasse Preview Error
**Current**: "Formato inválido" shown immediately without preview
**Problem**: Should show preview even if format detection uncertain
**Fix**:
- Always try to show preview
- If format unknown, show warning but still display rows
- Let user decide if data looks correct

---

## Implementation Plan

### Phase 1: Error Handling (P0)
1. Update `api.ts` error handling to preserve backend details
2. Show detailed error in toast + modal
3. Add error boundary component
4. Test with intentional errors

**Files**:
- `client/src/lib/api.ts`
- `client/src/pages/uploads.tsx`

---

### Phase 2: Preview UI Reorganization (P1)
1. Move confirmation checkbox to top
2. Add row count selector (10, 20, 50, 100, All)
3. Add column selection checkboxes
4. Implement default columns logic
5. Add amount color coding (red/green)

**Files**:
- `client/src/pages/uploads.tsx`

**UI Structure** (new):
```
┌─────────────────────────────────────────┐
│ Pré-visualização & Importação           │
├─────────────────────────────────────────┤
│ activity (9) (1).csv                    │
│ Codificação detectada: utf-8            │
│ Formato: amex                            │
│ Delimiter: ,                             │
│ Data: dd/mm/yyyy                         │
│ Última transação: 21.12.2025             │
│ Linhas: [Dropdown: 10▼] de 20           │
├─────────────────────────────────────────┤
│ ☑ Confirmo que revisei a pré-           │
│   visualização e desejo importar         │
├─────────────────────────────────────────┤
│ Colunas Detectadas:                      │
│ ☑ Data (Datum)                           │
│ ☑ Valor (Betrag)                         │
│ ☑ Moeda (Währung)                        │
│ ☑ Descrição (Beschreibung)               │
│ ☑ Key_desc                               │
│ ☐ Processed on                           │
│ ☐ Payment type                           │
│ ☐ Status                                 │
│ ... [collapse/expand]                    │
├─────────────────────────────────────────┤
│ [Avisos encontrados]                     │
│ • Campos com múltiplas linhas detectados │
├─────────────────────────────────────────┤
│ Fonte   Data        Valor     Moeda  ... │
│ Amex    2025-01-01  -10.61€   EUR    ... │
│ Amex    2025-01-01  -10.61€   EUR    ... │
│         (10 rows shown)                  │
├─────────────────────────────────────────┤
│ [Pré-visualizar]  [✓ Importar]          │
└─────────────────────────────────────────┘
```

---

### Phase 3: Column Selection Logic (P1)
1. Define default columns per CSV type
2. Store user preferences in localStorage
3. Filter table columns based on selection
4. Add "Show All" / "Reset to Default" buttons

**Data Structure**:
```typescript
interface ColumnConfig {
  key: string;           // Column field name
  label: string;         // Display name
  visible: boolean;      // Show/hide
  isDefault: boolean;    // Pre-selected
  type?: 'amount' | 'date' | 'text';  // For formatting
}

// Example for M&M:
const defaultColumns = [
  { key: 'authorisedOn', label: 'Data', visible: true, isDefault: true, type: 'date' },
  { key: 'amount', label: 'Valor', visible: true, isDefault: true, type: 'amount' },
  { key: 'currency', label: 'Moeda', visible: true, isDefault: true },
  { key: 'description', label: 'Descrição', visible: true, isDefault: true },
  { key: 'keyDesc', label: 'Key_desc', visible: true, isDefault: true },
  { key: 'processedOn', label: 'Processed on', visible: false, isDefault: false, type: 'date' },
  { key: 'paymentType', label: 'Payment type', visible: false, isDefault: false },
  { key: 'status', label: 'Status', visible: false, isDefault: false },
];
```

---

### Phase 4: Amount Formatting (P1)
Component:
```typescript
function AmountCell({ value }: { value: number }) {
  const isNegative = value < 0;
  const color = isNegative ? 'text-red-600' : 'text-green-600';
  const sign = isNegative ? '' : '+';
  return (
    <span className={cn('font-mono font-semibold', color)}>
      {sign}{value.toFixed(2)}€
    </span>
  );
}
```

---

### Phase 5: Last Transaction Date (P2)
1. Extract max date from preview data
2. Display in header: "Última transação: DD.MM.YYYY"
3. Validate date is recent (warn if > 6 months old)

---

### Phase 6: Format Detection Improvements (P2)
1. Change Sparkasse detection to show preview even on error
2. Add "Unknown format" warning but allow user to proceed
3. Show confidence level for format detection

---

## Testing Checklist

### Error Handling
- [ ] Upload with backend down → detailed error shown
- [ ] Upload invalid CSV → parsing error details shown
- [ ] Upload with DB error → SQL error shown (dev only)
- [ ] Network timeout → timeout error shown

### Preview UI
- [ ] Confirmation checkbox visible at top
- [ ] Row count selector works (10, 20, 50, 100, All)
- [ ] Selected row count persists on re-preview
- [ ] All columns displayed by default (before selection)

### Column Selection
- [ ] Default columns pre-checked correctly per CSV type
- [ ] Toggle column → table updates immediately
- [ ] "Show All" button → all columns checked
- [ ] "Reset to Default" → back to default selection
- [ ] Selection persisted in localStorage

### Amount Colors
- [ ] Negative amounts show RED
- [ ] Positive amounts show GREEN
- [ ] Zero amounts show neutral color
- [ ] Foreign amounts also colored

### Date Display
- [ ] Last transaction date shown correctly
- [ ] Date format matches locale (DD.MM.YYYY for pt-BR)
- [ ] Warning if date > 6 months old

### Format Detection
- [ ] M&M CSV → correct format + preview
- [ ] Amex CSV → correct format + preview
- [ ] Sparkasse CSV → correct format + preview
- [ ] Unknown CSV → warning + preview anyway

---

## Files to Modify

1. **client/src/lib/api.ts** (Error handling)
   - Lines 145-147: Improve preview error handling
   - Lines 164-168: Improve process error handling
   - Add detailed error extraction

2. **client/src/pages/uploads.tsx** (Main UI)
   - Move confirmation checkbox to top
   - Add row count selector
   - Add column selection UI
   - Add amount color formatting
   - Add last transaction date display
   - Update error display

3. **client/src/components/upload-preview-table.tsx** (NEW)
   - Extract preview table into component
   - Implement column filtering
   - Implement amount coloring
   - Implement row limiting

4. **client/src/lib/upload-utils.ts** (NEW)
   - Column configuration per CSV type
   - localStorage helpers
   - Date extraction from preview data

---

## Priority

**P0 - Immediate** (Blocks user testing):
1. Error handling improvements
2. Confirmation checkbox to top
3. Row count default to 10

**P1 - High** (Major UX issues):
1. Column selection
2. Amount color coding
3. Last transaction date

**P2 - Medium** (Nice to have):
1. Format detection improvements
2. LocalStorage persistence
3. Show All / Reset buttons

---

**Next Steps**: Implement P0 fixes first, test, then move to P1.
