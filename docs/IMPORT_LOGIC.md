# RitualFin Import Logic (Sparkasse, Amex, Miles & More)

RitualFin ingests three CSV sources and standardizes each transaction into:

* **`Fonte`** (data source / account)
* **`Key_desc`** (human-readable, descriptive identifier)
* **`Key`** (unique transaction key used for de-duplication and incremental append)

**Global rule:** `Key_desc` is built by concatenating selected CSV fields with the fixed separator:

* **Separator:** `--`
* **Join behavior:** trim each value, **drop empty values**, then join with `--`

---

# 1) Sparkasse (Girokonto)

## Imported CSV fields (used by RitualFin)

RitualFin reads (at least) the following Sparkasse columns:

* `Auftragskonto`
* `Buchungstag`
* `Valutadatum`
* `Buchungstext`
* `Verwendungszweck`
* `GlaeubigerID`
* `Mandatsreferenz`
* `Kundenreferenz`
* `Sammlerreferenz`
* `LastschriftUrsprungsbetrag`
* `AuslagenersatzRuecklastschrift`
* `Beguenstigter/Zahlungspflichtiger` (referred to as **Beguenstigter**)
* `Kontonummer/IBAN`
* `BIC`
* `Betrag`
* `Waehrung` (defaulted to `EUR` if empty)
* `Info` (default empty)

## `Fonte`

* `Fonte = "Sparkasse"`

## `Key_desc` creation (Sparkasse)

`Key_desc` is the joined list below (in this order):

1. `Beguenstigter`
2. `Verwendungszweck`
3. `Buchungstext`
4. `Kontonummer/IBAN`
5. `"Sparkasse - " + Beguenstigter`

### Sparkasse tagging rules (appends to `Key_desc`)

After building the base `Key_desc`, RitualFin appends additional descriptors when the counterparty indicates a credit-card payment:

* If `Beguenstigter` contains **"american express"** (case-insensitive):
  append ` -- pagamento Amex`

* If `Beguenstigter` contains **"deutsche kreditbank"** (case-insensitive):
  append ` -- pagamento M&M`

## `Key` creation (Sparkasse)

`Key` is built as:

* `Key = join( Key_desc, Betrag, Buchungstag(ISO yyyy-mm-dd), GlaeubigerID )`

**Why these fields:**

* `Betrag + Buchungstag` anchors the posting
* `GlaeubigerID` increases uniqueness for recurring direct debits
* `Key_desc` keeps the key stable and readable

---

# 2) American Express (Amex)

## Imported CSV fields (used by RitualFin)

RitualFin reads the Amex export columns:

* `Datum`
* `Beschreibung`
* `Karteninhaber`
* `Konto`
* `Betrag`
* `WeitereDetails`
* `AufAbrechnung`
* `Adresse`
* `Stadt`
* `PLZ`
* `Land`
* `Betreff`

## `Fonte`

* `Fonte = "Amex"`

## `Key_desc` creation (Amex)

`Key_desc` is the joined list below:

1. `Beschreibung`
2. `Konto`
3. `Karteninhaber`
4. `"Amex - " + Beschreibung`

### Amex tagging rules (appends to `Key_desc`)

* If `Beschreibung` contains **"erhalten besten dank"** (case-insensitive):
  append ` -- pagamento Amex`
  (used to label Amex payment/thank-you text lines)

* Else, if `Betrag < 0`:
  append ` -- reembolso`
  (refund detection)

## `Key` creation (Amex)

Amex `Key` uses the **inverted amount** (amount × -1) plus the subject/reference:

* `Key = join( Key_desc, invert(Betrag), Betreff )`

**Why invert the amount:**
Amex exports often represent charges/credits in a sign convention that RitualFin normalizes for consistent consolidated reporting. Using the inverted value inside the Amex `Key` keeps `Key` aligned with the normalized amount logic.

---

# 3) Miles & More (M&M)

## Imported CSV fields (used by RitualFin)

RitualFin reads the M&M export columns:

* `Authorised on`
* `Processed on`
* `Amount`
* `Currency`
* `Description`
* `Payment type`
* `Status`
* `Amount foreign`
* `Currency foreign`
* `Exchange rate`

## `Fonte`

* `Fonte = "M&M"`

## `Key_desc` creation (M&M)

`Key_desc` is the joined list below:

1. `Description`
2. `Payment type`
3. `Status`
4. `"M&M - " + Description`
5. Optional foreign purchase note:

   * If `Amount foreign` is present, add: `compra internacional em <Currency foreign>`

### M&M tagging rules (appends to `Key_desc`)

* If `Description` contains **"lastschrift"** (case-insensitive):
  append ` -- pagamento M&M`

* If `Amount > 0`:
  append ` -- reembolso`
  (refund detection)

## `Key` creation (M&M)

* `Key = join( Key_desc, Amount, Authorised on(ISO yyyy-mm-dd) )`

---

# Shared formatting and stability rules

## 1) Joining logic

When building `Key_desc` and `Key`:

* Trim every component
* Skip empty components
* Join with `--`

## 2) Number parsing

Amounts are normalized from German/European formatting:

* Accepts thousand separators and decimal comma
* Produces a numeric value (e.g., `1.234,56` → `1234.56`)

## 3) Date normalization

Dates are normalized to:

* ISO format: `YYYY-MM-DD` (used inside the `Key` to avoid locale ambiguity)

---

# How to explain the intent (Gemini-ready wording)

* **`Key_desc`** is a readable description built from the most informative CSV fields (merchant, purpose, account context), plus standardized tags like **“pagamento Amex”**, **“pagamento M&M”**, or **“reembolso”** when detected.
* **`Key`** is the unique identifier used to prevent duplicates and append only new transactions. It combines `Key_desc` with *high-stability discriminators* (amount, normalized date, and where applicable a creditor/reference field).
