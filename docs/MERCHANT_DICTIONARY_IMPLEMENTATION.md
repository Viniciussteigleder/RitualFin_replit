# Merchant Dictionary Feature - Implementation Guide

## Status: Schema Complete, Implementation Ready

### Completed ✅
- ✅ Database schema created (`merchant_descriptions`, `merchant_icons` tables)
- ✅ TypeScript types generated
- ✅ Comprehensive specification document created

### Implementation Phases

---

## Phase 1: Database Schema (✅ COMPLETE)

The following tables have been added to `shared/schema.ts`:

### 1.1 `merchant_descriptions` Table
Maps (source, key_desc) → alias_desc

**Columns:**
- `id` - UUID primary key
- `userId` - References users.id (cascade delete)
- `source` - Enum: "Sparkasse" | "Amex" | "M&M"
- `keyDesc` - Full normalized transaction description
- `aliasDesc` - Standardized merchant name
- `isManual` - Boolean (false for auto-generated, true for user-edited)
- `createdAt`, `updatedAt` - Timestamps

**Constraints:**
- Unique: (user_id, source, key_desc)

### 1.2 `merchant_icons` Table
Manages icon state per alias_desc

**Columns:**
- `id` - UUID primary key
- `userId` - References users.id (cascade delete)
- `aliasDesc` - Merchant name (matches alias_desc from descriptions)
- `shouldFetchIcon` - Boolean (default true)
- `iconSourceUrl` - URL of original icon
- `iconLocalPath` - Path in storage (e.g., "merchant-icons/{userId}/{slug}.png")
- `iconLastCheckedAt` - Timestamp of last fetch attempt
- `createdAt`, `updatedAt` - Timestamps

**Constraints:**
- Unique: (user_id, alias_desc)

### 1.3 Database Push Command

```bash
npm run db:push
```

**Note:** Database must be running for schema push.

---

## Phase 2: Backend API Implementation (TODO)

### 2.1 Storage Layer (`server/storage.ts`)

Add methods:

```typescript
// Merchant Descriptions
async getMerchantDescriptions(userId: string, filters?: {
  source?: string;
  search?: string;
  isManual?: boolean;
  limit?: number;
  offset?: number;
})

async getMerchantDescription(userId: string, source: string, keyDesc: string)

async createMerchantDescription(data: InsertMerchantDescription)

async updateMerchantDescription(id: string, data: Partial<InsertMerchantDescription>)

async deleteMerchantDescription(id: string)

async upsertMerchantDescription(
  userId: string,
  source: string,
  keyDesc: string,
  aliasDesc: string,
  isManual: boolean
)

// Merchant Icons
async getMerchantIcons(userId: string, filters?: {
  needsFetch?: boolean;
  search?: string;
})

async getMerchantIcon(userId: string, aliasDesc: string)

async createMerchantIcon(data: InsertMerchantIcon)

async updateMerchantIcon(userId: string, aliasDesc: string, data: Partial<InsertMerchantIcon>)

async deleteMerchantIcon(id: string)

async upsertMerchantIcon(userId: string, aliasDesc: string, data: Partial<InsertMerchantIcon>)
```

### 2.2 API Routes (`server/routes.ts`)

Add endpoints:

```typescript
// List merchant descriptions (with filters)
app.get("/api/merchant-descriptions", async (req, res) => {
  // Query params: source, search, isManual, page, limit
  // Return: { descriptions: [...], total: number }
});

// Create merchant description
app.post("/api/merchant-descriptions", async (req, res) => {
  // Body: { source, keyDesc, aliasDesc }
  // Auto-create icon record if doesn't exist
});

// Update merchant description
app.patch("/api/merchant-descriptions/:id", async (req, res) => {
  // Body: { aliasDesc }
  // Set isManual = true
});

// Delete merchant description
app.delete("/api/merchant-descriptions/:id", async (req, res) => {
  // Note: Don't cascade delete icon (orphans allowed)
});

// List merchant icons
app.get("/api/merchant-icons", async (req, res) => {
  // Query params: needsFetch, search
  // Return: { icons: [...], total: number }
});

// Update merchant icon
app.patch("/api/merchant-icons/:id", async (req, res) => {
  // Body: { shouldFetchIcon, iconSourceUrl }
});

// Fetch icon (trigger background fetch)
app.post("/api/merchant-icons/:id/fetch", async (req, res) => {
  // Run icon fetch logic
  // Update iconSourceUrl, iconLocalPath, iconLastCheckedAt
});

// Upload custom icon
app.post("/api/merchant-icons/:id/upload", upload.single('icon'), async (req, res) => {
  // Save file to public/merchant-icons/{userId}/{aliasDesc-slug}.png
  // Update iconLocalPath
  // Set shouldFetchIcon = false
});

// Remove icon
app.delete("/api/merchant-icons/:id/remove-icon", async (req, res) => {
  // Delete file from storage
  // Clear iconLocalPath, iconSourceUrl
});

// Export to CSV
app.get("/api/merchant-dictionary/export", async (req, res) => {
  // Query params: type (aliases|icons|both), format (csv)
  // Generate file, return download
});

// Import validation
app.post("/api/merchant-dictionary/import/validate", upload.single('file'), async (req, res) => {
  // Parse file, validate, return preview
});

// Import execution
app.post("/api/merchant-dictionary/import/execute", async (req, res) => {
  // Upsert records, return stats
});
```

---

## Phase 3: Key Description Generation (TODO)

### 3.1 Create `server/key-desc-generator.ts`

```typescript
type TransactionSource = "Sparkasse" | "Amex" | "M&M";

interface SparkasseFields {
  beguenstigter: string;
  verwendungszweck: string;
  buchungstext: string;
  kontonummerIBAN: string;
}

interface AmexFields {
  beschreibung: string;
  konto: string;
  karteninhaber: string;
  isRefund?: boolean;
}

interface MMFields {
  description: string;
  paymentType: string;
  status: string;
  amountForeign?: number;
  currencyForeign?: string;
  amount: number;
}

function generateKeyDesc(
  source: TransactionSource,
  fields: SparkasseFields | AmexFields | MMFields
): string {
  const separator = " -- ";
  const parts: string[] = [];

  if (source === "Sparkasse") {
    const f = fields as SparkasseFields;
    parts.push(f.beguenstigter, f.verwendungszweck, f.buchungstext, f.kontonummerIBAN);
    parts.push(`Sparkasse - ${f.beguenstigter}`);

    const keyDesc = parts.filter(Boolean).join(separator);

    // Conditional suffixes
    if (f.beguenstigter?.toLowerCase().includes("american express")) {
      return keyDesc + separator + "pagamento Amex";
    }
    if (f.beguenstigter?.toLowerCase().includes("deutsche kreditbank")) {
      return keyDesc + separator + "pagamento M&M";
    }

    return keyDesc;
  }

  if (source === "Amex") {
    const f = fields as AmexFields;
    parts.push(f.beschreibung, f.konto, f.karteninhaber);
    parts.push(`Amex - ${f.beschreibung}`);

    const keyDesc = parts.filter(Boolean).join(separator);

    if (f.beschreibung?.toLowerCase().includes("erhalten besten dank")) {
      return keyDesc + separator + "pagamento Amex";
    }
    if (f.isRefund) {
      return keyDesc + separator + "reembolso";
    }

    return keyDesc;
  }

  if (source === "M&M") {
    const f = fields as MMFields;
    parts.push(f.description, f.paymentType, f.status);
    parts.push(`M&M - ${f.description}`);

    let keyDesc = parts.filter(Boolean).join(separator);

    if (f.amountForeign && f.currencyForeign) {
      keyDesc += separator + `compra internacional em ${f.currencyForeign}`;
    }

    if (f.description?.toLowerCase().includes("lastschrift")) {
      return keyDesc + separator + "pagamento M&M";
    }
    if (f.amount > 0) {
      return keyDesc + separator + "reembolso";
    }

    return keyDesc;
  }

  return "";
}

function generateAliasDescHeuristic(keyDesc: string): string {
  // Tokenize by separator
  const parts = keyDesc.split(" -- ");

  // Take first meaningful token (skip source suffix like "M&M - X")
  let merchant = parts[0]?.trim() || "";

  // Clean merchant name
  // Remove store numbers: "REWE 0887" → "REWE"
  merchant = merchant.replace(/\s+\d{2,5}$/, "");

  // Remove long IDs (>10 digits)
  merchant = merchant.replace(/\s+\d{11,}/, "");

  // Remove city names (maintain list of common German cities)
  const cities = ["OLCHING", "MUNICH", "MUENCHEN", "BERLIN", "HAMBURG", "FRANKFURT"];
  cities.forEach(city => {
    merchant = merchant.replace(new RegExp(`\\s+${city}`, "gi"), "");
  });

  // Handle payment processors
  if (merchant.includes("PAYPAL *")) {
    merchant = merchant.split("PAYPAL *")[1] || merchant;
  }
  if (merchant.includes("GOOGLE *")) {
    merchant = merchant.split("GOOGLE *")[1] || merchant;
  }

  return merchant.trim() || "Miscellaneous";
}

export { generateKeyDesc, generateAliasDescHeuristic };
```

### 3.2 Integration with CSV Import

Modify `server/csv-parser.ts` to:
1. Detect source type from CSV headers
2. Call `generateKeyDesc()` for each transaction
3. Store keyDesc in transaction record

---

## Phase 4: Icon Fetch Service (TODO)

### 4.1 Create `server/icon-fetcher.ts`

```typescript
import fetch from "node-fetch";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

async function fetchMerchantIcon(aliasDesc: string): Promise<{
  sourceUrl: string;
  localPath: string;
} | null> {
  try {
    // Option 1: Clearbit Logo API
    const domain = guessDomain(aliasDesc); // e.g., "rewe" → "rewe.de"
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;

    const response = await fetch(clearbitUrl, { timeout: 5000 });
    if (response.ok) {
      const buffer = await response.buffer();

      // Process image
      const processed = await sharp(buffer)
        .resize(256, 256, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer();

      // Save to public/merchant-icons/
      const slug = aliasDesc.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const filename = `${slug}.png`;
      const localPath = path.join("public", "merchant-icons", filename);

      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, processed);

      return {
        sourceUrl: clearbitUrl,
        localPath: `merchant-icons/${filename}`
      };
    }

    // Option 2: Google Custom Search API (fallback)
    // Option 3: Brandfetch API

    return null;
  } catch (error) {
    console.error(`Failed to fetch icon for ${aliasDesc}:`, error);
    return null;
  }
}

function guessDomain(aliasDesc: string): string {
  const mapping: Record<string, string> = {
    "REWE": "rewe.de",
    "LIDL": "lidl.de",
    "EDEKA": "edeka.de",
    "ALDI": "aldi.de",
    "AMAZON": "amazon.de",
    "NETFLIX": "netflix.com",
    // ... expand as needed
  };

  return mapping[aliasDesc.toUpperCase()] || `${aliasDesc.toLowerCase()}.com`;
}

export { fetchMerchantIcon };
```

### 4.2 Background Job

Create `server/jobs/fetch-icons.ts`:

```typescript
import { storage } from "../storage";
import { fetchMerchantIcon } from "../icon-fetcher";

async function fetchPendingIcons() {
  const users = await storage.getUsers(); // Implement if multi-user

  for (const user of users) {
    const icons = await storage.getMerchantIcons(user.id, { needsFetch: true });

    for (const icon of icons.slice(0, 10)) { // Rate limit: 10 per run
      const result = await fetchMerchantIcon(icon.aliasDesc);

      if (result) {
        await storage.updateMerchantIcon(user.id, icon.aliasDesc, {
          iconSourceUrl: result.sourceUrl,
          iconLocalPath: result.localPath,
          iconLastCheckedAt: new Date()
        });
      } else {
        // Mark as checked to avoid retry spam
        await storage.updateMerchantIcon(user.id, icon.aliasDesc, {
          iconLastCheckedAt: new Date()
        });
      }

      // Rate limit delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export { fetchPendingIcons };
```

Run as cron job or on-demand via API endpoint.

---

## Phase 5: Frontend UI (TODO)

### 5.1 Create Settings Page

Location: `client/src/pages/merchant-dictionary.tsx`

Structure:
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AliasesTab from "@/components/merchant-dictionary/aliases-tab";
import IconsTab from "@/components/merchant-dictionary/icons-tab";
import ImportExportTab from "@/components/merchant-dictionary/import-export-tab";

export default function MerchantDictionaryPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Merchant Dictionary</h1>
          <p className="text-muted-foreground">
            Manage merchant aliases and icons for transaction display
          </p>
        </div>

        <Tabs defaultValue="aliases">
          <TabsList>
            <TabsTrigger value="aliases">Aliases</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
            <TabsTrigger value="import-export">Import / Export</TabsTrigger>
          </TabsList>

          <TabsContent value="aliases">
            <AliasesTab />
          </TabsContent>

          <TabsContent value="icons">
            <IconsTab />
          </TabsContent>

          <TabsContent value="import-export">
            <ImportExportTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
```

### 5.2 Aliases Tab Component

Create: `client/src/components/merchant-dictionary/aliases-tab.tsx`

**Features:**
- Data table with columns: Source, key_desc, alias_desc, Type, Actions
- Search input (searches key_desc and alias_desc)
- Filters: Source dropdown, Manual/Auto dropdown
- Inline editing of alias_desc
- Delete action with confirmation
- Server-side pagination (50 per page)

**API Integration:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["merchant-descriptions", filters],
  queryFn: () => fetchApi("/merchant-descriptions", { params: filters })
});

const updateMutation = useMutation({
  mutationFn: ({ id, aliasDesc }: { id: string; aliasDesc: string }) =>
    fetchApi(`/merchant-descriptions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ aliasDesc })
    }),
  onSuccess: () => queryClient.invalidateQueries(["merchant-descriptions"])
});
```

### 5.3 Icons Tab Component

Create: `client/src/components/merchant-dictionary/icons-tab.tsx`

**Features:**
- Grid view (4 columns) or List view toggle
- Icon preview (128x128px)
- Toggle shouldFetchIcon switch
- Upload custom icon button
- Fetch icon now button
- Remove icon button
- Search by alias

**Upload Logic:**
```typescript
const handleUpload = async (aliasDesc: string, file: File) => {
  const formData = new FormData();
  formData.append("icon", file);

  const response = await fetch(`/api/merchant-icons/${id}/upload`, {
    method: "POST",
    body: formData
  });

  if (response.ok) {
    toast({ title: "Icon uploaded successfully" });
    queryClient.invalidateQueries(["merchant-icons"]);
  }
};
```

### 5.4 Import/Export Tab Component

Create: `client/src/components/merchant-dictionary/import-export-tab.tsx`

**Features:**
- Export section:
  - Radio: Aliases / Icons / Both
  - Download CSV button
  - Download Excel button
- Import section:
  - File upload (drag & drop or picker)
  - Radio: Aliases / Icons / Auto-detect
  - Validate & Preview button
  - Preview dialog with changes table and errors table
  - Import button (executes upsert)
  - Download error report CSV

**Export Logic:**
```typescript
const handleExport = async (type: string, format: string) => {
  const response = await fetch(
    `/api/merchant-dictionary/export?type=${type}&format=${format}`
  );
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ritualfin_merchant_dictionary_${new Date().toISOString().split('T')[0]}.${format}`;
  a.click();
};
```

**Import Logic:**
```typescript
const handleImport = async (file: File) => {
  // Step 1: Validate
  const formData = new FormData();
  formData.append("file", file);

  const validation = await fetch("/api/merchant-dictionary/import/validate", {
    method: "POST",
    body: formData
  }).then(r => r.json());

  // Step 2: Show preview
  setPreviewData(validation);
  setShowPreview(true);
};

const handleConfirmImport = async () => {
  // Step 3: Execute
  const result = await fetch("/api/merchant-dictionary/import/execute", {
    method: "POST",
    body: JSON.stringify({ fileId: previewData.fileId })
  }).then(r => r.json());

  toast({
    title: "Import Complete",
    description: `${result.stats.inserted} inserted, ${result.stats.updated} updated`
  });
};
```

### 5.5 Add Navigation

Edit: `client/src/components/layout/app-layout.tsx`

Add to settings menu:
```tsx
<Link href="/settings/merchant-dictionary">
  <Settings2 className="h-4 w-4 mr-2" />
  Merchant Dictionary
</Link>
```

### 5.6 Add Route

Edit: `client/src/App.tsx`

Add route:
```tsx
<Route path="/settings/merchant-dictionary" component={MerchantDictionaryPage} />
```

---

## Phase 6: Transaction Integration (TODO)

### 6.1 Modify CSV Import Pipeline

Edit: `server/csv-parser.ts`

After parsing each transaction:

```typescript
import { generateKeyDesc, generateAliasDescHeuristic } from "./key-desc-generator";

// ... in parseCSV function ...

for (const row of rows) {
  // Existing parsing logic ...

  // Generate key_desc
  const keyDesc = generateKeyDesc(source, {
    // Map CSV fields based on source type
  });

  // Lookup or create merchant description
  let merchantDesc = await storage.getMerchantDescription(userId, source, keyDesc);

  if (!merchantDesc) {
    // Auto-create with heuristic
    const aliasDesc = generateAliasDescHeuristic(keyDesc);
    merchantDesc = await storage.upsertMerchantDescription(
      userId,
      source,
      keyDesc,
      aliasDesc,
      false // isManual = false for auto-created
    );

    // Ensure icon record exists
    await storage.upsertMerchantIcon(userId, aliasDesc, {
      shouldFetchIcon: true
    });
  }

  // Store transaction with keyDesc reference
  // (Could add new column `keyDesc` to transactions table if needed for display)
}
```

### 6.2 Display Alias in Transactions UI

Edit: `client/src/pages/transactions.tsx` (or transaction components)

Fetch merchant description for each transaction:

```typescript
// Option 1: Add alias_desc to transaction API response
// Option 2: Separate query to fetch aliases for displayed transactions

const { data: aliases } = useQuery({
  queryKey: ["merchant-aliases", transactionIds],
  queryFn: () => fetchApi("/merchant-descriptions/batch", {
    body: JSON.stringify({ transactionIds })
  })
});

// Display alias instead of raw description
<span>{aliases[transaction.id]?.aliasDesc || transaction.descNorm}</span>
```

---

## Phase 7: Dependencies (TODO)

Install required packages:

```bash
npm install sharp  # Image processing
npm install node-fetch@2  # Icon fetching (v2 for CommonJS compatibility)
```

Add to `package.json`:

```json
{
  "dependencies": {
    "sharp": "^0.33.0",
    "node-fetch": "^2.7.0"
  }
}
```

---

## Phase 8: Testing (TODO)

### 8.1 Unit Tests

Test files to create:
- `server/__tests__/key-desc-generator.test.ts`
- `server/__tests__/icon-fetcher.test.ts`
- `client/src/components/merchant-dictionary/__tests__/aliases-tab.test.tsx`

### 8.2 Integration Tests

Test scenarios:
1. Create merchant description → auto-creates icon record
2. Update alias_desc → sets isManual = true
3. Import Excel → upserts correctly, no duplicates
4. Export Excel → generates valid file
5. Fetch icon → saves to storage, updates record
6. Upload custom icon → overrides fetched icon

### 8.3 E2E Tests

User workflows:
1. Upload CSV → aliases auto-created → edit alias → icon fetched
2. Export aliases → edit in Excel → import → changes applied
3. Upload custom icon → replaces default → remove icon → fetch new

---

## Phase 9: Deployment (TODO)

### 9.1 Database Migration

On production server:

```bash
# 1. Backup database
pg_dump -U postgres ritualfin > backup_before_merchant_dict.sql

# 2. Push schema changes
npm run db:push

# 3. Verify tables created
psql -U postgres -d ritualfin -c "\dt merchant_*"
```

### 9.2 Create Storage Directory

```bash
mkdir -p public/merchant-icons
chmod 755 public/merchant-icons
```

### 9.3 Environment Variables

Add to `.env`:

```
# Optional: Clearbit API key (free tier)
CLEARBIT_API_KEY=your_key_here

# Optional: Google Custom Search API
GOOGLE_API_KEY=your_key_here
GOOGLE_CSE_ID=your_cse_id_here
```

### 9.4 Background Job Setup

Add to `server/index.ts`:

```typescript
import { fetchPendingIcons } from "./jobs/fetch-icons";

// Run icon fetch job daily at 2 AM
setInterval(async () => {
  const now = new Date();
  if (now.getHours() === 2) {
    await fetchPendingIcons();
  }
}, 60 * 60 * 1000); // Check every hour
```

Or use a proper job scheduler like `node-cron`:

```typescript
import cron from "node-cron";

cron.schedule("0 2 * * *", async () => {
  await fetchPendingIcons();
});
```

---

## Summary

### Completed ✅
- Database schema with two new tables
- TypeScript types for merchant_descriptions and merchant_icons
- Comprehensive implementation guide

### Remaining Work 📝

**Backend (~6-8 hours):**
- Storage layer methods (CRUD)
- API routes (10 endpoints)
- Key description generator
- Icon fetcher service
- Import/export logic

**Frontend (~8-10 hours):**
- Merchant Dictionary page
- Aliases tab component
- Icons tab component
- Import/Export tab component
- Navigation integration

**Integration (~4-6 hours):**
- CSV import pipeline integration
- Transaction display updates
- Background job setup

**Testing & Deployment (~4-6 hours):**
- Unit tests
- Integration tests
- E2E tests
- Production deployment

**Total Estimated Time: 22-30 hours (3-4 days)**

---

## Quick Start for Development

1. **Database Setup:**
   ```bash
   # Start PostgreSQL (if not running)
   # Push schema changes
   npm run db:push
   ```

2. **Install Dependencies:**
   ```bash
   npm install sharp node-fetch@2
   ```

3. **Create Directory Structure:**
   ```bash
   mkdir -p public/merchant-icons
   mkdir -p client/src/components/merchant-dictionary
   mkdir -p server/jobs
   ```

4. **Start with Backend:**
   - Implement storage layer methods
   - Add API routes
   - Test with Postman/cURL

5. **Then Frontend:**
   - Create page and components
   - Wire up API calls
   - Style with existing UI components

6. **Finally Integration:**
   - Update CSV import to use key_desc
   - Add background job
   - Deploy

---

## Notes

- This feature is **additive only** - no breaking changes to existing functionality
- Schema changes are **backwards compatible** - existing transactions unaffected
- Icon fetching is **optional** - app works fine without icons
- Import/Export follows same pattern as Rules page (already implemented)
- UI components can reuse patterns from existing pages (Rules, Goals, Calendar)

The most time-consuming parts are:
1. Backend API endpoints (boilerplate CRUD)
2. Frontend table components (reuse existing patterns)
3. Import validation logic (similar to Rules import)

Consider implementing in phases:
- **MVP:** Aliases tab only (no icons, no import/export)
- **Phase 2:** Import/Export
- **Phase 3:** Icons
