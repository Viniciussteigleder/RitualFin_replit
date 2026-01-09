# RitualFin NEON DB Redesign

## Feature Requirements and Data Model Overview (V1) + V2 Scope

## 1) Scope and release boundaries

### V1 (in scope)

V1 delivers a complete import + ledger + reconciliation system based on:

* **Print uploads** (screenshots) with OCR and structured extraction
* **CSV uploads** (Sparkasse / M&M / Amex) with format + account auto-detection
* A unified **canonical transaction ledger**
* **Pending (“Vorgemerkt”)** supported as canonical transactions immediately
* **Reconciliation** (prints ↔ CSV) with explainable scoring and review queue
* **Balances** as true snapshots + simulated balance
* **Rules and Alias assets** managed via Excel import/export with re-apply

### V2 (only one item)

* **Perfect OCR extraction under all screenshot variations**
  (i.e., materially higher robustness across device UI changes, cropping, blur, dark mode, languages, accessibility settings, bank app redesigns)

### Out of scope (not planned)

* **Automatic bank sync / PSD2 connectivity** (no direct bank API integration)

---

# 2) Key user outcomes

1. User drops **random screenshots** (not sequential) → app detects account, extracts line items + balances, shows them immediately.
2. User uploads **CSV** → app detects format + account, creates enriched ledger transactions.
3. App **reconciles** screenshot-based provisional transactions with CSV-based enriched transactions, safely and explainably.
4. User manages **categorization rules** and **merchant aliases/logos** via Excel roundtrip and can re-apply at any time.
5. App displays:

   * **True balance** (from snapshots)
   * **Simulated balance** (computed from transactions) with explanation

---

# 3) Core concepts (shared vocabulary)

* **Evidence**: uploaded raw data (CSV row, screenshot file, OCR text).
* **Print line item**: an extracted transaction candidate from screenshots.
* **Staging row**: typed representation of a CSV row (Sparkasse/MM/Amex specific).
* **Canonical transaction**: unified ledger record used by dashboard, classification, balances.
* **Posting status (bank)**: `pending | posted`
* **Processing status (system)**: `provisional | enriched | reconciled | void`
* **True balance snapshot**: balance visible in the app at a given date (e.g., “Kontostand am…”).
* **Simulated balance**: computed balance based on transactions + user filters, anchored to a snapshot if available.

---

# 4) Concrete auto-detection logic (prints and CSV) — V1

This section is expanded to include: detection steps, scoring, fallback logic, UI interaction, and data impact.

## 4.1 Prints: detect source and account (V1)

### 4.1.1 Feature behavior (user-facing)

* User uploads 1..N screenshots, any order.
* System attempts to assign each screenshot to:

  1. a **source system** (Sparkasse/MM/Amex)
  2. an **account** within that source system
* If confidence is high, user sees “Detected: Sparkasse (Account A)”.
* If confidence is low or ambiguous:

  * user is prompted to select account
  * the system remembers the user’s correction as a future hint (optional, still v1)

### 4.1.2 Technical pipeline (system steps)

1. **OCR extraction**

   * Run OCR on each image.
   * Normalize OCR text:

     * uppercase
     * remove repeated spaces
     * standardize umlauts if needed (optional)
2. **Source classification** (rule signatures)
3. **Account resolution** (within source)
4. **Confidence scoring + reasons**
5. **Fallback UI** if confidence below threshold
6. **Persist detection result** on the batch and/or session for audit

### 4.1.3 Source detection (rule signatures; explainable)

A screenshot is classified by signature hits. The system stores the matched signature strings in `detectionReasons`.

**Sparkasse if OCR contains any of:**

* `KONTOSTAND AM`
* `VORGEMERKT`
* `UMSÄTZE`
* `GELD SENDEN`
* `KONTODETAILS`

**Miles & More (M&M) if:**

* `MILES & MORE`
* `AKTUELL VERFÜGBAR`
* `SALDO VOM`

**Amex if:**

* `AMERICAN EXPRESS`
* `GESAMT-SALDO`
* `OFFENER SALDO`
* `ABRECHNUNGEN UND AKTIVITÄTEN`

**Enhancements still within V1 (not “perfect OCR”, but better detection):**

* Add synonyms / language variants if screenshots are not German/English.
* Add “negative signatures” to avoid confusion:

  * e.g., Sparkasse detection should be penalized if “AMERICAN EXPRESS” appears.

### 4.1.4 Account resolution within source (concrete)

Once source is known, assign a specific account.

**Primary identifiers**

* If OCR finds **last4 pattern** (examples: `•••• 7340`, `....11009`)
  → match to `accounts.externalRefLast4`
* If OCR finds **IBAN pattern** or `DE..` fragment
  → match to `accounts.externalRefIban`

**Secondary heuristics**

* Match by:

  * `(institution + accountType + currencyDefault + account name similarity)`
* Example:

  * If source=Sparkasse and only one Sparkasse account exists → auto-assign.

**Tertiary heuristics (lowest confidence)**

* Use file-level context:

  * If user previously corrected similar screenshot mappings, reuse that mapping hint.

### 4.1.5 Confidence scoring (example model, explainable)

Compute `confidence` 0..100 and store reasons.

* +50 if source signature strongly matches (>=2 signature hits)
* +30 if last4 matches exactly one account
* +30 if IBAN matches exactly one account
* -40 if conflicting signatures found (e.g., Sparkasse + Amex hits)
* -25 if multiple accounts match last4/IBAN (should be rare)

**Decision**

* If confidence ≥ 75 → auto-assign
* If 50..74 → auto-assign but show banner “please verify”
* If < 50 → require user selection

### 4.1.6 Fallback and user interaction (mandatory in V1)

If low confidence:

* UI prompts: “Which account is this?”
* User selects account.
* System writes:

  * `accountId` (confirmed)
  * `detectionConfidence` stays low but `decision = user_confirmed`
  * store mapping hint for future (optional but recommended)

### 4.1.7 Data impact (what gets stored)

* Detection fields stored on the batch/session:

  * `detectedAccountId`, `confidence`, `reasons`
* Evidence is preserved:

  * screenshot attachment
  * OCR extraction output
* If account is unknown at first:

  * store unassigned session; prevent posting of canonical transactions until resolved, or create them with `accountId=null` but keep hidden until resolved (design choice—recommended: require account before ledger insertion)

---

## 4.2 CSV: detect source format and account (V1)

### 4.2.1 Feature behavior (user-facing)

* User drops a CSV.
* App auto-detects:

  * Sparkasse vs M&M vs Amex
  * the specific account (Sparkasse: IBAN in file; Amex/M&M: account number/last4 if present)
* If confident, import runs without user input.
* If ambiguous, user selects account from a list.

### 4.2.2 File parsing logic (concrete and robust)

1. Detect delimiter:

   * Try `;`, then `,`, then tab
   * Choose the delimiter producing the most consistent column count across lines
2. Detect encoding:

   * Try UTF-8
   * Fallback to Windows-1252 / ISO-8859-1
3. Normalize headers:

   * trim
   * uppercase
   * remove BOM
   * collapse spaces

### 4.2.3 Source format identification by header signature

**Sparkasse CSV if includes (minimum set):**

* `AUFTRAGSKONTO`
* `BUCHUNGSTAG`
* `VALUTADATUM`
* `BUCHUNGSTEXT`
* `BETRAG`

**M&M CSV if includes:**

* `AUTHORISED ON`
* `PROCESSED ON`
* `PAYMENT TYPE`
* `STATUS`
* `AMOUNT`

**Amex CSV if includes:**

* `DATUM`
* `BESCHREIBUNG`
* `BETRAG`
* `KARTENINHABER`

### 4.2.4 Account mapping logic (concrete)

**Sparkasse**

* Use `Auftragskonto` (IBAN) to match:

  * `accounts.externalRefIban`
* If multiple accounts share same IBAN (should not happen) → ask user.

**Amex**

* Use `Konto #` or extract last digits if present.
* Match to `accounts.externalRefLast4`.
* If missing, fallback to:

  * institution=amex and if only one amex account exists → assign; else ask user.

**M&M**

* If file contains account identifier: use it.
* Else fallback:

  * institution=mm and if only one mm account exists → assign; else ask user.
* Optional mapping hint:

  * remember which account user selected last time for that format.

### 4.2.5 Confidence + fallback (mandatory)

* Store `detectedAccountId`, `confidence`, `reasons`.
* If confidence < threshold:

  * show selection UI
  * persist selection as confirmed.

---

# 5) Reconciliation logic (prints ↔ CSV) — V1 (concrete, explainable)

This section is expanded with: candidate generation, scoring, decision, safeguards, user review, and effects on canonical ledger.

## 5.1 Goal

Match:

* **print-derived canonical transactions** (`processingStatus=provisional`)
  with
* **CSV-derived canonical transactions** (`processingStatus=enriched`)
  or directly match print line items to CSV staging rows (implementation choice).

You will implement canonical-to-canonical matching to simplify downstream usage.

## 5.2 Preconditions (based on your decisions)

* Sparkasse canonical posting date = **Buchungstag**
* Pending items become canonical immediately (`postingStatus=pending`)
* Date tolerance window = **±4 days**
* Amount tolerance = **0.01**

## 5.3 Candidate generation (fast filter)

Generate a candidate pair only if:

1. same `accountId`
2. same currency (or explicitly supported FX case)
3. amount match within 0.01
4. date difference within ±4 days:

   * for Sparkasse CSV: use `postingDate = Buchungstag`
   * for print items: use `eventDate` (from grouping header or “vom …”)

**Fallback if print date missing**

* Candidate generation can use:

  * `eventDate=null` → no auto-match; require review
  * or use batch import date as weak proxy (not recommended for auto-accept)

## 5.4 Scoring (updated with your required curve)

Each candidate gets:

### Amount score

* `1.00` if `abs(amountDiff) <= 0.01`, else `0`

### Date score (±4 days) — revised

* 0 days: **1.00**
* 1 day: **0.85**
* 2 days: **0.75**
* 3 days: **0.70**
* 4 days: **0.65**

### Text score (robust to noise; main words + phrase)

Because prints and CSV differ in formatting, we compute two signals:

#### A) CoreTokenScore (main words)

Normalization:

* uppercase
* remove punctuation → spaces
* collapse spaces
* remove stopwords/noise:

  * DE: `UND, VOM, AM, UHR, DATUM, ONLINE, ZAHLUNG, KARTENZAHLUNG, ENTLG, ENTGELT, GMBH, CO, KG, STR, STR.`
  * EN: `AND, ON, OF, PAYMENT, CARD, ONLINE`
* remove tokens matching:

  * IBAN patterns, long numeric references, timestamps

Similarity:

* token overlap ratio: `|intersection| / |union|`

#### B) PhraseHitScore (complete expression containment)

* After normalization (but before stopword removal), check:

  * does CSV text contain print merchant phrase?
  * do the top 2–3 print tokens appear in order within CSV text?

This helps in cases like:

* Print: `OPENAI *CHATGPT SUBSCR`
* CSV: `OPENAI *CHATGPT SUBSCR -- e-commerce -- Processed ...`

#### Combined TextScore

* `TextScore = 0.6 * CoreTokenScore + 0.4 * PhraseHitScore`

### Total score

A simple, explainable weighted sum:

* `scoreTotal = 0.45*AmountScore + 0.25*DateScore + 0.30*TextScore`

(Amount is dominant; date and text provide disambiguation.)

## 5.5 Safeguards (to avoid wrong merges)

Because you will allow ±4 days and repeated merchants exist:

1. **Competition safeguard**

* Auto-accept only if best candidate is clearly better:

  * no other candidate within `scoreTotal - 0.05`

2. **Pending → posted safeguard**

* Matching pending print tx to posted CSV tx requires:

  * `TextScore >= 0.60` AND
  * `DateScore >= 0.70` (≤3 days strongly preferred)
  * if 4 days difference, require higher text score (e.g., ≥0.75)

3. **High-frequency merchants**

* For merchants like `REWE`, `LIDL`, `EDEKA`:

  * require either:

    * stronger text score, or
    * additional disambiguation from subtext (location/time) if present

## 5.6 Auto-accept vs review

**Auto-accept** if:

* AmountScore = 1.0
* DateScore ≥ 0.70 OR (DateScore ≥ 0.65 and TextScore ≥ 0.75)
* TextScore ≥ 0.60
* competition safeguard passes

Otherwise:

* mark as `needsReview=true`
* create reconciliation candidates list for UI review

## 5.7 Merge behavior (how canonical ledger changes)

When a match is accepted:

* Keep **one** canonical transaction:

  * carry richer CSV attributes into the transaction (external refs, structured fields)
  * keep print linkage as evidence
* Update statuses:

  * `processingStatus = reconciled`
  * `enrichedAt = now()`
  * `postingStatus` becomes `posted` if CSV indicates posting

If reconciliation not done yet:

* Both may exist:

  * print-derived provisional tx
  * CSV-derived enriched tx
* They are flagged and shown in review queue with candidates.

---

# 6) Rules and Alias management via Excel import/export (with re-apply) — V1 (3× detail)

You asked for this section at much higher depth. This includes: data contract, workflow, diffs, validation, scope rules, logging, and impact.

## 6.1 Rules (classification expressions)

### 6.1.1 Purpose

Rules drive **automatic classification** of transactions into taxonomy categories and attributes (expense/income, fix/var, recurring). Rules are **not** for logos or display names.

### 6.1.2 What a rule is (definition)

A rule consists of:

* a stable identifier (`ruleKey`) for Excel roundtrip
* an expression definition:

  * keywords and/or patterns (can be implemented as:

    * contains-all tokens
    * contains-any tokens
    * excludes tokens
    * optionally regex in later step)
* outputs:

  * taxonomy leaf (or L1/L2/L3 mapping)
  * attributes (income/expense, fix/var, recurring)
* metadata:

  * priority
  * active/inactive
  * confidence contribution
  * created/updated timestamps

### 6.1.3 Export rules to Excel (feature behavior)

**User interaction**

* User clicks “Export Rules”.
* System downloads an Excel file.

**Excel file contract (columns)**
Minimum:

* `ruleKey` (stable key; required)
* `ruleName`
* `active` (TRUE/FALSE)
* `priority` (integer; higher wins)
* `match_include` (expression string; supports `;` separated tokens)
* `match_exclude` (expression string)
* `applies_to_accounts` (optional: ALL or list)
* Outputs:

  * `taxonomy_level_1`, `taxonomy_level_2`, `taxonomy_leaf` (or leafId)
  * `income_expense`, `fix_var`, `recurring`

**Impact**

* User can maintain the logic externally in Excel with controlled schema.

### 6.1.4 Import rules from Excel (feature behavior)

**User interaction**

1. Upload Excel.
2. System validates and shows **Preview Diff**.
3. User confirms import.

**Validation (mandatory)**

* required columns present (`ruleKey`, matching fields, output fields)
* `ruleKey` uniqueness within the file
* priority numeric
* taxonomy targets exist (or are created if you allow that; recommended: validate against existing taxonomy)

**Preview Diff (mandatory)**
System shows:

* New rules (will be inserted)
* Changed rules (will be updated)
* Unchanged rules
* Missing rules (optional: deactivate)

**Upsert logic**

* Keyed by `(userId, ruleKey)`:

  * if exists → update
  * else → insert
* Option toggle:

  * “Deactivate rules not in this upload”:

    * set `active=false` for rules that existed but are absent in file

**Logging**

* create a `bulk_apply_run` record (type=`rules_import`)
* store summary:

  * counts inserted/updated/deactivated
  * validation warnings/errors
  * file name and importedAt

### 6.1.5 Re-apply rules (feature behavior)

**User interaction**

* User clicks “Re-apply Rules”.
* User selects scope options:

Scope options (mandatory)

1. `uncategorized_only`
2. `exclude_manual_overrides`
3. `force_all` (warning: overwrites previous auto results but should still respect manual unless explicitly forced)

Optional filters

* by account
* by date range
* by amount range

**Application logic (deterministic)**
For each candidate transaction:

1. If manualOverride and exclude_manual_overrides → skip
2. Evaluate rules in priority order:

   * first match wins OR highest priority wins (choose one; recommended: priority wins, tie-breaker by specificity)
3. Write results into transaction fields:

   * taxonomy leaf id
   * ruleIdApplied
   * confidence
   * attributes (expense/income, fix/var, recurring)
4. Mark `needsReview=false` if confidence high enough

**Logging**

* Create `bulk_apply_run` (type=`reapply_rules`):

  * scope params stored (json)
  * number of transactions processed
  * number changed
  * execution duration

### 6.1.6 Impact (why this matters)

* **Deterministic repeatability**: same rules → same classification.
* **External editing**: Excel becomes a “source of configuration truth”.
* **Scale**: bulk apply avoids manual tagging.
* **Auditability**: logs explain when and why a transaction changed classification.

---

## 6.2 Alias / Alias Assets (merchant display + logo) — separate from rules

### 6.2.1 Purpose

Alias Assets are for **merchant normalization and UI display**, not categorization:

* display name standardization (e.g., “C & A Mode GmbH” → “C&A”)
* logo association
* optional merchant grouping

### 6.2.2 Export alias assets to Excel

**Columns (contract)**

* `aliasKey` (stable)
* `aliasDisplayName`
* `match_include` (keywords for merchant identification)
* `match_exclude`
* `logoUrl`
* `active`
* `priority`

### 6.2.3 Import alias assets from Excel

Same mechanism as rules:

* validate
* preview diff
* upsert by `(userId, aliasKey)`
* optional deactivate missing
* log run

### 6.2.4 Re-apply alias assets

**Logic**

* For each transaction:

  * compute merchant candidate text (descNorm + counterparty fields)
  * apply alias expressions by priority
  * set:

    * alias id
    * display name
    * logo url (or join dynamically)

**Impact**

* Consistent merchant naming and branding in UI
* Improves reconciliation text scoring (alias boosts confidence)

---

# 7) Screenshot retention and storage transparency — V1 (updated)

### Mandatory (V1)

* **Screenshots must be kept** by default.
* Screenshots must remain retrievable for audit (evidence-first principle).

### Nice-to-have (V1)

* Storage meter + manual deletion controls:

  * show storage used and count
  * user chooses when to delete
  * deletion warning: impacts ability to audit evidence later
  * recommended: soft delete first

---

# 8) Canonical transaction ledger — how it supports mapping, classification, and alias

This section addresses your earlier “Block E” clarity request.

## 8.1 What the canonical ledger is

`transactions` is the single list of all movements across all accounts, with:

* consistent dates
* consistent amount/currency
* consistent statuses
* links to evidence
* outputs of classification and alias mapping

## 8.2 How other blocks feed into it

* Prints → create transactions immediately:

  * `processingStatus=provisional`
  * `postingStatus=pending|posted`
* CSV staging → creates enriched transactions:

  * `processingStatus=enriched`
* Reconciliation → upgrades to:

  * `processingStatus=reconciled`

## 8.3 How classification and alias map to it

* Rules apply onto `transactions`:

  * taxonomy leaf + attributes + ruleIdApplied
* Alias assets apply onto `transactions`:

  * alias id or display fields
* Both can be re-applied at any time with logs.

---

# 9) Full DB overview (all tables including login/auth) — V1 target

## 9.1 Auth & Users

* `users`
* `settings`
* `oauth_accounts`
* `sessions`
* `verification_tokens`
* `authenticators`

## 9.2 Accounts

* `accounts` (extended)

## 9.3 Evidence ingestion

* `ingestion_batches` (extended with detection fields)
* `ingestion_items` (optional extensions: rowNo, itemType)
* `attachments` (screenshots stored)
* `ocr_extractions`

## 9.4 Prints extraction

* `print_sessions`
* `print_line_items`

## 9.5 CSV staging (typed per source)

* `source_csv_sparkasse`
* `source_csv_mm`
* `source_csv_amex`

## 9.6 Canonical ledger

* `transactions` (extended)
* `transaction_evidence_link`

## 9.7 Taxonomy & automation

* `taxonomy_level_1`
* `taxonomy_level_2`
* `taxonomy_leaf` (recommended: store income/expense, fix/var, recurring at leaf)
* `rules` (add `ruleKey`)
* `alias_assets` (add `aliasKey`)
* `app_category`, `app_category_leaf` (if needed)

## 9.8 Reconciliation

* `reconciliation_runs`
* `reconciliation_candidates`

## 9.9 Balances

* `account_balance_snapshots`

## 9.10 Planning

* `budgets`
* `calendar_events`
* `goals`
* `category_goals`

## 9.11 Rituals and legacy

* `rituals`
* `uploads` (legacy)

## 9.12 Operational logs (recommended, still v1)

* `bulk_apply_runs`

---

# 10) Tables vs views (final)

## Tables (persist)

All tables listed in Section 9.

## Views (derived)

* `v_transaction_summary`
* `v_review_queue`
* `v_latest_balances_per_type`
* `v_simulated_balance`

---

# 12) V2 item (only) — Perfect OCR extraction under all screenshot variations

**Definition**

* Extraction accuracy remains high even when:

  * UI layout changes
  * cropping/blur occurs
  * dark mode / accessibility changes fonts
  * different languages
  * partial captures / overlapping UI overlays

**Deliverables**

* stronger layout detection
* improved OCR preprocessing (deskew, denoise, contrast)
* model-driven extraction (template-less)
* continuous regression testing against screenshot sets

No other items move to V2.
