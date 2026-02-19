# CSV Import Contract

**Version**: 1.0
**Date**: 2026-01-02
**Supported Formats**: Miles & More, Amex (Germany), Sparkasse (Germany)

---

## Overview

RitualFin supports importing bank transaction data from three CSV formats. This document defines the expected format, column mappings, and parsing rules for each source.

---

## Format Detection

The CSV parser automatically detects the format based on column headers and content patterns:

1. **Sparkasse**: German semicolon-delimited with specific column names
2. **Amex**: German date format (DD.MM.YYYY) with "Datum" column
3. **Miles & More**: English headers with ISO dates, fallback default

**Detection Priority**: Sparkasse → Amex → Miles & More (default)

---

## 1. Miles & More Format

### File Characteristics

- **Delimiter**: Comma (`,`)
- **Encoding**: UTF-8
- **Date Format**: ISO 8601 or `DD/MM/YYYY`
- **Currency**: Multiple (specified per transaction)
- **Decimal Separator**: Dot (`.`)

### Required Columns

| Column Name | Type | Description | Example |
|-------------|------|-------------|---------|
| `Authorised on` | Date | Transaction authorization date | `2024-12-15` or `15/12/2024` |
| `Amount` | Decimal | Transaction amount (signed) | `-45.67` or `1200.00` |
| `Currency` | String | ISO 4217 currency code | `EUR`, `USD`, `GBP` |
| `Description` | String | Transaction description | `LIDL FILIALE 1234 MUENCHEN` |
| `Payment type` | String | Payment method | `Purchase`, `Refund`, `Fee` |
| `Status` | String | Transaction status | `Completed`, `Pending`, `Cancelled` |

### Optional Columns

- `Card number` - Last 4 digits of card
- `Merchant` - Merchant name (if separate from description)
- `Category` - Pre-assigned category (ignored by import)

### Parsing Rules

1. **Date Parsing**:
   - Tries ISO format first (`YYYY-MM-DD`)
   - Falls back to `DD/MM/YYYY`
   - Rejects invalid dates

2. **Amount Parsing**:
   - Negative values = expenses
   - Positive values = income/refunds
   - Decimal point (`.`) separator

3. **Status Filtering**:
   - Only `Completed` or `Billed` transactions imported
   - `Pending`, `Cancelled` status ignored

4. **Description Processing**:
   - Stored as `descNorm` (normalized for matching)
   - `keyDesc` generated from first part before `--`
   - `aliasDesc` auto-suggested from merchant name

### Example CSV

```csv
Authorised on,Amount,Currency,Description,Payment type,Status
2024-12-15,-45.67,EUR,LIDL FILIALE 1234 MUENCHEN,Purchase,Completed
2024-12-16,-12.50,EUR,NETFLIX SUBSCRIPTION,Purchase,Completed
2024-12-17,100.00,EUR,SALARY PAYMENT -- COMPANY GMBH,Credit,Completed
```

---

## 2. Amex Format (Germany)

### File Characteristics

- **Delimiter**: Comma (`,`)
- **Encoding**: UTF-8 or Windows-1252
- **Date Format**: `DD.MM.YYYY`
- **Currency**: Implicit (EUR assumed)
- **Decimal Separator**: Comma (`,`) or dot (`.`)

### Required Columns (German)

| Column Name (German) | Type | Description | Example |
|----------------------|------|-------------|---------|
| `Datum` | Date | Transaction date | `15.12.2024` |
| `Betrag` | Decimal | Amount (German format) | `-45,67` or `1.200,00` |
| `Beschreibung` | String | Transaction description | `REWE MARKT MUENCHEN` |

### Optional Columns

- `Referenz` - Transaction reference number
- `Typ` - Transaction type (Kauf, Rückerstattung)
- `Händler` - Merchant name

### Parsing Rules

1. **Date Parsing**:
   - Format: `DD.MM.YYYY`
   - Example: `31.12.2024`
   - Rejects invalid dates (e.g., `32.13.2024`)

2. **Amount Parsing** (German Format):
   - Comma (`,`) as decimal separator
   - Optional thousand separator (`.`)
   - Example: `1.234,56` = 1234.56
   - Negative values = expenses

3. **Description Processing**:
   - German merchant names preserved
   - Special characters handled (ä, ö, ü, ß)
   - Umlauts normalized for matching

### Example CSV

```csv
Datum,Betrag,Beschreibung,Referenz
15.12.2024,"-45,67","REWE MARKT MÜNCHEN",REF123456
16.12.2024,"-12,50","NETFLIX ABONNEMENT",REF123457
17.12.2024,"1.200,00","GEHALT FIRMA GMBH",REF123458
```

---

## 3. Sparkasse Format (Germany)

### File Characteristics

- **Delimiter**: Semicolon (`;`)
- **Encoding**: UTF-8 or ISO-8859-1
- **Date Format**: `DD.MM.YY` (two-digit year)
- **Currency**: Implicit (EUR assumed)
- **Decimal Separator**: Comma (`,`)
- **Header Variants**: Handles alternative column names (e.g., `Empfänger/Zahlungspflichtiger` or `Beguenstigter/Zahlungspflichtiger`)

### Required Columns (German)

| Column Name (Primary) | Alternatives | Type | Description | Example |
|-----------------------|--------------|------|-------------|---------|
| `Auftragskonto` | - | String | Account number | `DE12345678901234567890` |
| `Buchungstag` | - | Date | Booking date | `15.12.24` |
| `Valutadatum` | - | Date | Value date | `15.12.24` |
| `Buchungstext` | - | String | Booking type | `Lastschrift`, `Überweisung` |
| `Empfänger/Zahlungspflichtiger` | `Beguenstigter/Zahlungspflichtiger`, `Begünstigter/Zahlungspflichtiger` | String | Payee/payer name | `REWE MARKT GMBH` |
| `Verwendungszweck` | - | String | Payment purpose | `Einkauf vom 15.12.2024` |
| `Betrag` | - | Decimal | Amount (German format) | `-45,67` |
| `Währung` | `Waehrung` | String | Currency code | `EUR` |

### Optional Columns

- `Kontonummer` - Account number (deprecated)
- `BLZ` - Bank code (deprecated)
- `Mandatsreferenz` - SEPA mandate reference
- `Kundenreferenz` - Customer reference
- `Sammlerreferenz` - Collector reference
- `Info` - Additional information

### Parsing Rules

1. **Date Parsing**:
   - Format: `DD.MM.YY` (two-digit year)
   - Year conversion: `00-49` → `2000-2049`, `50-99` → `1950-1999`
   - Example: `31.12.24` → `2024-12-31`
   - Rejects invalid dates

2. **Amount Parsing** (German Format):
   - Comma (`,`) as decimal separator
   - Optional thousand separator (`.`)
   - Negative values = debits/expenses
   - Positive values = credits/income

3. **Beneficiary Column Handling**:
   - Tries `Empfänger/Zahlungspflichtiger` first
   - Falls back to `Beguenstigter/Zahlungspflichtiger`
   - Falls back to `Begünstigter/Zahlungspflichtiger` (with umlaut)
   - Case-insensitive matching

4. **Description Assembly**:
   - Primary: `Verwendungszweck` (payment purpose)
   - Fallback: `Buchungstext` (booking type)
   - Includes beneficiary name when available

5. **Encoding Detection**:
   - Auto-detects UTF-8 or ISO-8859-1
   - Handles German umlauts (ä, ö, ü, ß)

### Diagnostic Reporting

Sparkasse import provides detailed diagnostics on failure:

```json
{
  "success": false,
  "diagnostics": {
    "encodingDetected": "UTF-8",
    "delimiterDetected": ";",
    "headerMatch": {
      "found": ["Auftragskonto", "Buchungstag", ...],
      "missing": ["Betrag"],
      "extra": ["CustomColumn"]
    },
    "rowParseErrors": {
      "count": 5,
      "examples": [
        {"row": 12, "reason": "INVALID_DATE", "data": "32.13.24"},
        {"row": 15, "reason": "INVALID_AMOUNT", "data": "abc"}
      ]
    },
    "rejectionReasons": {
      "INVALID_DATE": 3,
      "INVALID_AMOUNT": 2
    }
  }
}
```

### Example CSV

```csv
Auftragskonto;Buchungstag;Valutadatum;Buchungstext;Empfänger/Zahlungspflichtiger;Verwendungszweck;Betrag;Währung
DE12345678901234567890;15.12.24;15.12.24;Lastschrift;REWE MARKT GMBH;Einkauf vom 15.12.2024;"-45,67";EUR
DE12345678901234567890;16.12.24;16.12.24;Dauerauftrag;NETFLIX SERVICES;Abonnement Dezember;"-12,50";EUR
DE12345678901234567890;17.12.24;17.12.24;Gehalt;FIRMA GMBH;Gehalt Dezember 2024;"1.200,00";EUR
```

---

## Common Processing

### Deduplication

All formats use a unique key for duplicate detection:

```
key = userId + paymentDate + descNorm + amount
```

- Re-importing the same CSV skips duplicate transactions
- Upload history stored in `uploads` table
- Duplicate count reported in import result

### Merchant Description Generation

1. **keyDesc** (for matching):
   - Extracted from transaction description
   - Normalized (lowercase, no accents)
   - Used for keyword matching in rules engine

2. **aliasDesc** (for display):
   - Auto-suggested friendly name
   - Capitalized, cleaned format
   - User can edit via Merchant Dictionary

3. **Source Tracking**:
   - Each transaction tagged with source (`Sparkasse`, `Amex`, `M&M`)
   - Used for format-specific logic

### Categorization

After import, transactions are:
1. Matched against active rules (keyword-based)
2. Assigned confidence score (0-100)
3. Flagged for review if confidence < threshold
4. Added to confirmation queue (`needsReview=true`)

---

## Error Handling

### Common Errors

| Error Code | Cause | User Message |
|------------|-------|--------------|
| `INVALID_FORMAT` | No recognizable columns | "Formato CSV não reconhecido. Verifique se é M&M, Amex ou Sparkasse." |
| `MISSING_REQUIRED_COLUMNS` | Missing required columns | "Colunas obrigatórias ausentes: [list]" |
| `INVALID_DATE` | Date parsing failed | "Data inválida na linha X: [value]" |
| `INVALID_AMOUNT` | Amount parsing failed | "Valor inválido na linha X: [value]" |
| `EMPTY_FILE` | No data rows | "Arquivo vazio ou sem dados válidos" |
| `ENCODING_ERROR` | Character encoding issue | "Erro de codificação. Tente salvar como UTF-8." |

### Partial Import

- If some rows fail validation, valid rows are still imported
- Error summary shows count of failed rows
- Failed rows logged with reason codes

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "uploadId": "uuid",
  "format": "sparkasse",
  "rowsImported": 145,
  "duplicates": 3,
  "monthAffected": "2024-12"
}
```

### Error Response (with Diagnostics)

```json
{
  "success": false,
  "error": "Missing required columns",
  "diagnostics": {
    "encodingDetected": "UTF-8",
    "delimiterDetected": ";",
    "headerMatch": {
      "found": [...],
      "missing": ["Betrag"],
      "extra": []
    },
    "rowParseErrors": {...},
    "rejectionReasons": {...}
  }
}
```

---

## Testing

### Sample Files

Sample CSV files for testing:
- `attached_assets/miles_more_sample.csv` (10 rows, M&M format)
- `attached_assets/amex_sample.csv` (10 rows, German Amex)
- `attached_assets/sparkasse_sample.csv` (10 rows, Sparkasse)

### E2E Tests

Playwright tests cover:
- Upload and parse each format
- Deduplication on re-upload
- Error handling for invalid files
- Diagnostic reporting (Sparkasse)

Test files: `tests/e2e/csv-import.spec.ts`

---

**Last Updated**: 2026-01-02
**Maintained by**: RitualFin Development Team

---

## 4. DKB / Miles & More (New Format)

**Added**: 2026-02-19

### File Characteristics

- **Delimiter**: Semicolon (`;`)
- **Encoding**: UTF-8
- **Date Format**: `M/D/YYYY` (e.g., `2/17/2026`)
- **Number Format**: English (`.` decimal, `,` thousands)
- **Preamble**: Variable number of metadata lines before the header row.
- **Filename**: Starts with `CreditCardTransactions_`

### Required Columns

Header tokens detected (case-insensitive): `Voucher date`, `Date of receipt`, `Reason for payment`.

| Position | Column Name | Type | Description | Example |
|---|---|---|---|---|
| 0 | `Voucher date` | Date | Transaction date | `2/17/2026` |
| 1 | `Date of receipt` | Date | Posting date | `2/18/2026` |
| 2 | `Reason for payment` | String | Description | `REWE MARKT...` |
| 6 | `Amount` | Decimal | Billing amount | `-83.92` |
| 7 | `Currency` | String | Billing currency | `EUR` |

### Parsing Rules

1. **Header Detection**: Scans for line with ≥6 columns containing required tokens.
2. **Metadata**: Extracts `Billing date`, `Card holder`, `Card number` from preamble.
3. **Amounts**: Normalizes English format (`-1,850.00` → `-1850.00`).
4. **Idempotency**: Uses SHA-256 fingerprint of `(billing_date, tx_date, post_date, amount, currency, description)`.
5. **Double Amount Columns**: Correctly maps the **second** Amount column (index 6) as the billing amount.

### Example CSV

```csv
Credit card transactions
...
Billing date: 3/3/2026
Voucher date;Date of receipt;Reason for payment;Foreign currency;Amount;Exchange rate;Amount;Currency
2/17/2026;2/18/2026;REWE Markt;-;-;-;-83.92;EUR
```
