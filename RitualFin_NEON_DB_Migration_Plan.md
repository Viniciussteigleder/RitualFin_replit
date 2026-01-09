# 11) Exact DB change instructions for AI (V1)

Below is the concise “do this” list for schema/migrations.

## 11.1 Modify existing tables

### accounts

Add:

* `institution`
* `accountType`
* `currencyDefault`
* `externalRefIban`
* `externalRefLast4`

Indexes:

* `(userId, institution)`
* `(userId, externalRefIban)`
* `(userId, externalRefLast4)`

### ingestion_batches

Add:

* `accountId` (nullable until confirmed)
* `importedAt` (required)
* `sourceSystem`, `sourceFormat`
* `detectedAccountId`, `detectionConfidence`, `detectionReasons` (json)

### transactions

Add:

* `eventDate`
* `postingDate` (**Sparkasse = Buchungstag**)
* `valueDate` (Sparkasse = Valutadatum)
* `eventTimeText` (prints)
* `postingStatus` (`pending|posted`)
* `processingStatus` (`provisional|enriched|reconciled|void`)
* `externalRef` (end-to-end, Betreff, etc.)
* `enrichedAt`

Indexes:

* `(accountId, amount, postingDate)`
* `(accountId, amount, eventDate)`
* `(accountId, postingStatus)`
* `(accountId, processingStatus)`

### rules

Add:

* `ruleKey` (unique per user)

### alias_assets

Add:

* `aliasKey` (unique per user)

---

## 11.2 Add new tables

### print_sessions

Fields:

* `id`, `userId`, `accountId`, `batchId`
* `sourceApp`, `capturedAt`, `asOfDate`, `createdAt`

### print_line_items

Fields:

* `id`, `userId`, `accountId`, `printSessionId`, `ingestionItemId`
* `section` (`posted|pending`)
* `eventDate`, `eventTimeText`
* `merchantLine1`, `subText`
* `amount`, `currency`
* `fingerprint` (unique per account)
* `transactionId` (nullable)
* `confidence`, `createdAt`

### account_balance_snapshots

Fields:

* `id`, `userId`, `accountId`
* `asOfDate`, `balanceType`
* `amount`, `unit`
* `sourceType` (`print|csv|manual`)
* `ingestionItemId` nullable, `attachmentId` nullable
* `createdAt`

### source_csv_sparkasse / source_csv_mm / source_csv_amex

Each:

* `id`, `userId`, `accountId`, `batchId`, `ingestionItemId`
* mirror all CSV columns typed
* `importedAt`, `Fonte`, `Key_*`, `Key_*_Desc`
* `rowFingerprint` unique per account
  Indexes on `(accountId, postingDate)` and `(accountId, amount)`.

### reconciliation_runs

* `id`, `userId`, `accountId`
* `leftType`, `rightType`
* `leftRef`, `rightBatchId`
* `paramsJson` (dateWindow=4 days, thresholds)
* status and timestamps

### reconciliation_candidates

* link to run
* left/right ids
* score breakdown + decision fields

### bulk_apply_runs

* `type` (`rules_import|aliases_import|reapply_rules|reapply_alias`)
* params + summary + timestamps
