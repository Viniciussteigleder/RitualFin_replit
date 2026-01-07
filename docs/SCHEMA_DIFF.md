# Schema Diff: RitualFin Rebuild

## Overview
We are maintaining the core `transactions` logic but strictly expanding the schema to support "Evidence-Based Ingestion".

## 1. New Tables (Ingestion & Evidence)

### `ingestion_batches`
Tracks a single upload event (CSV file or Screenshot set).
```sql
id uuid PK
user_id uuid FK
source_type text (csv, screenshot)
status text (preview, committed, rolled_back)
diagnostics_json jsonb
```

### `ingestion_items`
Tracks individual raw records extracted from a batch.
```sql
id uuid PK
batch_id uuid FK
raw_payload jsonb       -- The raw CSV row or OCR text
parsed_payload jsonb    -- The normalized candidate data
item_fingerprint text   -- Hash for deduplication
```

### `attachments`
Stores references to uploaded files (screenshots).
```sql
id uuid PK
storage_key text        -- S3/R2 path
ocr_status text
```

### `ocr_extractions`
Stores the raw text blocks from Vision API.
```sql
id uuid PK
attachment_id uuid FK
text_raw text
blocks_json jsonb
```

### `transaction_evidence_link`
**CRITICAL**: Links a canonical Transaction to its source Evidence(s).
```sql
transaction_id uuid FK
ingestion_item_id uuid FK
match_confidence int
is_primary bool         -- Which source is the "truth" for this transaction
```

## 2. Deprecations

| Table / Field | Status | Replacement |
|---------------|--------|-------------|
| `users.passwordHash` | **Migrate** | Auth.js maintains its own `accounts` / `users` schema, but we map to our `users` table. |
| `transactions.descRaw` | **Keep** | But populated via `ingestion_items` logic. |
| `transactions.uploadId` | **Deprecated** | Use `transaction_evidence_link` -> `ingestion_items` -> `ingestion_batches` instead. |

## 3. Constraints & Indicies
- **fingerprint_idx**: Unique index on `ingestion_items(item_fingerprint)` to prevent duplicate import processing.
- **evidence_idx**: Index on `transaction_evidence_link(transaction_id)` for quick audit trail lookup.
