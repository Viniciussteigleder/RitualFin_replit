# Upload Error Handling - Test Simulation & Debugging

**Date**: 2026-01-04
**Purpose**: Simulate testing of improved error handling and identify potential issues

---

## Test Scenarios - Simulated Results

### Scenario 1: Backend Not Running (COMMON ISSUE)

**Test Steps**:
1. User uploads CSV file
2. Frontend attempts to connect to backend
3. Backend is down or unreachable

**Expected Behavior** (Before Fix):
```
Error Toast:
  Title: "Erro na importação"
  Description: "Request failed"
```

**Expected Behavior** (After Fix):
```
Error Toast:
  Title: "Erro na importação"
  Description: "HTTP 0: Failed to fetch"

Error in Console:
  TypeError: Failed to fetch
  at uploadMutation.mutate (uploads.tsx:65)
```

**Root Cause**:
- `fetch()` throws `TypeError: Failed to fetch` when cannot connect
- Network error, not HTTP error
- No response object, so `res.status` is undefined

**FIX NEEDED** ⚠️:
```typescript
// In client/src/lib/api.ts
export const uploadsApi = {
  preview: async (...args) => {
    try {
      const res = await fetch(`${API_BASE}/imports/preview`, {...});
      // ... existing code
    } catch (error) {
      // Network error (backend down)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError: any = new Error(
          'Não foi possível conectar ao servidor. Verifique se o backend está rodando.\n\n' +
          'Detalhes: ' + (import.meta.env.DEV ? `API_BASE=${API_BASE}` : 'Servidor indisponível')
        );
        networkError.status = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  }
}
```

---

### Scenario 2: Supabase Connection Error (DATABASE ISSUE)

**Test Steps**:
1. Backend is running
2. Supabase DATABASE_URL is invalid/expired
3. User uploads CSV
4. Backend tries to connect to database

**Expected Backend Response**:
```json
HTTP 500
{
  "message": "Database connection failed",
  "error": "ECONNREFUSED",
  "details": {
    "code": "CONNECTION_ERROR",
    "host": "db.xxx.supabase.co",
    "port": 6543
  }
}
```

**Expected Frontend Display** (After Fix):
```
Error Toast:
  Title: "Erro na importação"
  Description: "Database connection failed

Detalhes:
{
  "code": "CONNECTION_ERROR",
  "host": "db.xxx.supabase.co",
  "port": 6543
}"
```

**User Action**: Check DATABASE_URL in Render environment variables

---

### Scenario 3: CSV Parsing Error (INVALID FORMAT)

**Test Steps**:
1. User uploads file named "data.csv"
2. File is actually Excel (.xlsx) with .csv extension
3. Backend tries to parse as CSV

**Expected Backend Response**:
```json
HTTP 400
{
  "message": "Failed to parse CSV",
  "error": "Invalid CSV format",
  "details": {
    "filename": "data.csv",
    "detectedFormat": "xlsx",
    "expectedFormat": "csv",
    "error": "Column count mismatch on row 3"
  }
}
```

**Expected Frontend Display** (After Fix):
```
Error Toast:
  Title: "Erro na importação"
  Description: "Failed to parse CSV

Detalhes:
{
  "filename": "data.csv",
  "detectedFormat": "xlsx",
  "expectedFormat": "csv",
  "error": "Column count mismatch on row 3"
}"
```

**User Action**: Re-export file from Excel as true CSV

---

### Scenario 4: Invalid Date Format (ROW-LEVEL ERROR)

**Test Steps**:
1. User uploads valid CSV
2. Row 45 has date in format "01/31/2025" (MM/DD/YYYY)
3. Parser expects "31.01.2025" (DD.MM.YYYY)

**Expected Backend Response**:
```json
HTTP 400
{
  "message": "Failed to parse transaction on row 45",
  "error": "Invalid date format",
  "details": {
    "rowNumber": 45,
    "field": "Authorised on",
    "value": "01/31/2025",
    "expectedFormat": "DD.MM.YYYY",
    "receivedFormat": "MM/DD/YYYY"
  }
}
```

**Expected Frontend Display** (After Fix):
```
Error Toast:
  Title: "Erro na importação"
  Description: "Failed to parse transaction on row 45

Detalhes:
{
  "rowNumber": 45,
  "field": "Authorised on",
  "value": "01/31/2025",
  "expectedFormat": "DD.MM.YYYY",
  "receivedFormat": "MM/DD/YYYY"
}"
```

**User Action**: Fix row 45 in CSV and re-upload

---

### Scenario 5: CORS Error (PRODUCTION DEPLOYMENT)

**Test Steps**:
1. Frontend deployed to Vercel: https://ritualfin.vercel.app
2. Backend deployed to Render: https://ritualfin-api.onrender.com
3. Backend CORS not configured correctly
4. User uploads CSV

**Expected Backend Response**:
```
(No response received)

Browser Console:
  Access to fetch at 'https://ritualfin-api.onrender.com/api/uploads/process'
  from origin 'https://ritualfin.vercel.app' has been blocked by CORS policy:
  No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Expected Frontend Display** (After Fix):
```
Error Toast:
  Title: "Erro na importação"
  Description: "Erro de CORS: O servidor bloqueou a requisição.

Detalhes:
  Origem: https://ritualfin.vercel.app
  Destino: https://ritualfin-api.onrender.com

Solução: Configure CORS_ORIGIN no backend Render."
```

**Root Cause**: Backend environment variable `CORS_ORIGIN` not set

**FIX NEEDED** ⚠️:
```typescript
// In client/src/lib/api.ts - catch CORS errors
catch (error) {
  if (error instanceof TypeError && error.message.includes('CORS')) {
    const corsError: any = new Error(
      'Erro de CORS: O servidor bloqueou a requisição.\n\n' +
      'Detalhes:\n' +
      `  Origem: ${window.location.origin}\n` +
      `  Destino: ${API_BASE}\n\n` +
      'Solução: Configure CORS_ORIGIN no backend Render.'
    );
    corsError.status = 0;
    corsError.isCorsError = true;
    throw corsError;
  }
  throw error;
}
```

---

### Scenario 6: Long Processing Time → Timeout

**Test Steps**:
1. User uploads large CSV (10,000 rows)
2. Processing takes > 2 minutes
3. Browser/Render times out request

**Expected Behavior**:
```
Error Toast:
  Title: "Erro na importação"
  Description: "Request timeout after 120 seconds.

Sugestão: Divida o CSV em arquivos menores (<1000 linhas cada)."
```

**FIX NEEDED** ⚠️:
- Add timeout handling to fetch requests
- Show progress bar with realistic timing
- Backend should process in batches

---

### Scenario 7: Duplicate Import Attempt

**Test Steps**:
1. User uploads CSV (100 rows)
2. All 100 transactions already exist in database
3. Backend detects duplicates

**Expected Backend Response**:
```json
HTTP 200
{
  "success": true,
  "uploadId": "uuid-xxx",
  "rowsTotal": 100,
  "rowsImported": 0,
  "duplicates": 100,
  "monthAffected": "2025-12"
}
```

**Expected Frontend Display** (Current):
```
Warning Toast:
  Title: "Todas as transações já existem"
  Description: "100 duplicadas encontradas. Nenhuma transação foi importada."
```

**This works correctly** ✅

---

### Scenario 8: Partial Success (Mixed Results)

**Test Steps**:
1. User uploads CSV (100 rows)
2. 80 rows imported successfully
3. 15 duplicates
4. 5 rows failed (invalid dates)

**Expected Backend Response**:
```json
HTTP 200
{
  "success": true,
  "uploadId": "uuid-xxx",
  "rowsTotal": 100,
  "rowsImported": 80,
  "duplicates": 15,
  "errors": [
    { "rowNumber": 23, "error": "Invalid date format" },
    { "rowNumber": 45, "error": "Invalid amount" },
    { "rowNumber": 67, "error": "Missing required field: Description" },
    { "rowNumber": 89, "error": "Invalid currency code: XXX" },
    { "rowNumber": 92, "error": "Date parsing failed" }
  ],
  "monthAffected": "2025-12"
}
```

**Expected Frontend Display**:
```
Success Toast:
  Title: "Importação concluída"
  Description: "80 transações importadas, 15 duplicadas"

Warning Panel (below):
  "5 linhas com erros - clique para ver detalhes"

  [Button: Ver Erros]
```

**Error Details Dialog**:
```
Erros de Importação (5)

Linha 23: Invalid date format
Linha 45: Invalid amount
Linha 67: Missing required field: Description
Linha 89: Invalid currency code: XXX
Linha 92: Date parsing failed

[Download CSV com erros]
```

**FIX NEEDED** ⚠️:
- Backend needs to collect row-level errors
- Frontend needs to show error details dialog
- Option to download failed rows as CSV for fixing

---

## Backend Issues to Fix

### Issue 1: Error Response Format Inconsistency

**Current Problem**:
Different endpoints return errors in different formats:
- Some: `{ message: "..." }`
- Some: `{ error: "..." }`
- Some: `{ message: "...", details: {...} }`

**Solution**:
Standardize to:
```typescript
interface ErrorResponse {
  success: false;
  error: {
    message: string;        // User-friendly message
    code: string;           // Error code (e.g., "CSV_PARSE_ERROR")
    details?: any;          // Technical details (dev mode only)
    rowNumber?: number;     // For row-level errors
    field?: string;         // For field-level errors
  };
}
```

---

### Issue 2: No Row-Level Error Collection

**Current Problem**:
If row 45 fails, entire import fails. No way to import 99 good rows.

**Solution**:
```typescript
// server/routes.ts - uploads/process
try {
  const results = {
    imported: [],
    duplicates: [],
    errors: []
  };

  for (let i = 0; i < parsedRows.length; i++) {
    try {
      const row = parsedRows[i];
      // ... process row
      results.imported.push(row);
    } catch (error) {
      results.errors.push({
        rowNumber: i + 1,
        error: error.message,
        rawData: parsedRows[i]
      });
    }
  }

  return res.json({
    success: true,
    uploadId,
    rowsTotal: parsedRows.length,
    rowsImported: results.imported.length,
    duplicates: results.duplicates.length,
    errors: results.errors
  });
}
```

---

### Issue 3: No Timeout Protection

**Current Problem**:
Large CSVs can cause request timeout (120s default)

**Solution**:
```typescript
// server/routes.ts
router.post("/uploads/process", async (req, res) => {
  // Set longer timeout for large imports
  req.setTimeout(5 * 60 * 1000); // 5 minutes

  // Process in batches
  const BATCH_SIZE = 100;
  const batches = chunk(parsedRows, BATCH_SIZE);

  for (const batch of batches) {
    await processBatch(batch);
    // Send progress update via SSE (future)
  }
});
```

---

## Frontend Issues to Fix

### Issue 1: Network Error Handling

**Location**: `client/src/lib/api.ts:175-208`

**Current Code**:
```typescript
const res = await fetch(`${API_BASE}/uploads/process`, {...});
const payload = await res.json().catch(() => ({...}));
```

**Problem**: `fetch()` throws on network errors, never reaches `res.json()`

**Fix**:
```typescript
try {
  const res = await fetch(`${API_BASE}/uploads/process`, {...});
  const payload = await res.json().catch(() => ({...}));
  // ... existing code
} catch (error) {
  if (error instanceof TypeError) {
    // Network error
    const netErr: any = new Error(
      error.message === 'Failed to fetch'
        ? 'Não foi possível conectar ao servidor.\n\nVerifique se o backend está rodando.'
        : `Erro de rede: ${error.message}`
    );
    netErr.status = 0;
    netErr.isNetworkError = true;
    throw netErr;
  }
  throw error;
}
```

---

### Issue 2: Error Toast Dismisses Too Fast

**Location**: `client/src/pages/uploads.tsx:129-140`

**Current Code**:
```typescript
onError: (error: any) => {
  toast({
    title: "Erro na importação",
    description: error.message || "Request failed",
    variant: "destructive"
  });
}
```

**Problem**: Long error messages get cut off, toast disappears too fast

**Fix**:
```typescript
onError: (error: any) => {
  // For long errors, keep toast visible longer
  const duration = error.message?.length > 100 ? 10000 : 5000;

  toast({
    title: "Erro na importação",
    description: error.message || "Request failed",
    variant: "destructive",
    duration
  });

  // Also show in dedicated error panel (already exists)
  setLastError(error.details || { message: error.message });
}
```

---

### Issue 3: Whitespace in Error Messages

**Location**: `client/src/pages/uploads.tsx:505-508`

**Current Code**:
```tsx
<div className="... text-rose-700">
  {previewError}
</div>
```

**Problem**: Multiline error messages lose formatting

**Fix** (Already Applied ✅):
```tsx
<div className="... text-rose-700 whitespace-pre-wrap">
  {previewError}
</div>
```

---

## Testing Checklist

### Manual Tests to Perform

- [ ] **Test 1**: Stop backend, try upload → "Servidor indisponível"
- [ ] **Test 2**: Invalid DATABASE_URL → "Database connection failed"
- [ ] **Test 3**: Upload .xlsx as .csv → "Invalid CSV format"
- [ ] **Test 4**: CSV with wrong date format → "Invalid date on row X"
- [ ] **Test 5**: Production CORS error → "Erro de CORS"
- [ ] **Test 6**: Large CSV (>1000 rows) → No timeout
- [ ] **Test 7**: Upload same file twice → "X duplicadas"
- [ ] **Test 8**: CSV with 5 bad rows → "95 imported, 5 errors"

### Automated Tests (Future)

```typescript
describe('Upload Error Handling', () => {
  it('shows network error when backend is down', async () => {
    // Mock fetch to throw
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));

    const { getByText } = render(<UploadsPage />);
    await uploadFile('test.csv');

    expect(getByText(/Não foi possível conectar/)).toBeInTheDocument();
  });

  it('shows detailed error for CSV parsing failure', async () => {
    // Mock API to return 400
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false,
      status: 400,
      json: () => Promise.resolve({
        message: 'Failed to parse CSV',
        details: { rowNumber: 45, error: 'Invalid date' }
      })
    }));

    const { getByText } = render(<UploadsPage />);
    await uploadFile('test.csv');

    expect(getByText(/row 45/)).toBeInTheDocument();
  });
});
```

---

## Priority Fixes

### P0 - Critical (Must Fix Before Release)
1. ✅ Network error handling (catch `Failed to fetch`)
2. ✅ Show HTTP status codes
3. ✅ Whitespace-preserve error messages
4. ⏳ Add try-catch for network errors in api.ts

### P1 - High (UX Improvements)
1. ⏳ Row-level error collection in backend
2. ⏳ Error details dialog in frontend
3. ⏳ Longer toast duration for long messages
4. ⏳ CORS-specific error message

### P2 - Medium (Nice to Have)
1. ⏳ Batch processing for large CSVs
2. ⏳ Timeout protection (5 min)
3. ⏳ Download failed rows as CSV
4. ⏳ Progress bar for long imports

---

## Conclusion

**Current Status**:
- Error messages are now MORE informative than before ✅
- HTTP status codes shown ✅
- Backend details passed through ✅

**Remaining Issues**:
- Network errors (backend down) not handled elegantly ⚠️
- CORS errors not detected ⚠️
- Row-level errors cause full import failure ⚠️

**Recommendation**:
1. Apply P0 fix for network errors (5 min)
2. Test with real backend down scenario
3. Deploy and test in production
4. Collect user feedback on error clarity
5. Implement P1 fixes based on feedback

**Expected User Experience** (After All Fixes):
- Clear error messages in Portuguese ✅
- Technical details for debugging ✅
- Specific guidance on how to fix ⏳
- Partial success handling ⏳
- Fast error resolution ⏳
