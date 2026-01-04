-- =====================================================
-- Migration 004: Key_Desc Derivation Logic Documentation
-- =====================================================
-- This migration adds comprehensive documentation about
-- key_desc field construction per CSV source type
-- =====================================================

-- =====================================================
-- KEY_DESC DERIVATION RULES (CRITICAL FOR MATCHING)
-- =====================================================

/*
key_desc is the canonical matching field used by the Rules Engine.
It is constructed differently per CSV source to capture merchant identity.

SPARKASSE (Bank Account CSV)
─────────────────────────────
Columns used (in order):
  1. Beguenstigter (Beneficiary/Merchant)
  2. Verwendungszweck (Purpose/Description)
  3. Buchungstext (Booking text)
  4. Kontonummer/IBAN (Account number)
  5. Derived: "Sparkasse - " + Beguenstigter

Concatenation format:
  Beguenstigter -- Verwendungszweck -- Buchungstext -- KontonummerIBAN -- Sparkasse - Beguenstigter

Special rules:
  - If Beguenstigter contains "american express" (case-insensitive):
    → Append: " -- pagamento Amex"

  - If Beguenstigter contains "deutsche kreditbank" (case-insensitive):
    → Append: " -- pagamento M&M"

Examples from real data:
  1. WEG  loswohnen II , Karlsruhe -- XC21300815, 1, 01/26 Hausgeld 197,01 Euro / Rucklagen 62,99 Euro, Vinicius Steigleder  -- FOLGELASTSCHRIFT -- DE77660501010108339441 -- Sparkasse - WEG  loswohnen II , Karlsruhe

  2. AMERICAN EXPRESS EUROPE S.A. (Germany branch) -- 01KDM6P43FPG6XWCSTDXYTYW82  -- FOLGELASTSCHRIFT -- DE05500700100095599700 -- Sparkasse - AMERICAN EXPRESS EUROPE S.A. (Germany branch) -- pagamento Amex

AMEX (Credit Card CSV)
──────────────────────
Columns used (in order):
  1. Beschreibung (Description)
  2. Konto # (Account number, last 4 digits)
  3. Karteninhaber (Cardholder)
  4. Derived: "Amex - " + Beschreibung

Concatenation format:
  Beschreibung -- Konto -- Karteninhaber -- Amex - Beschreibung

Special rules:
  - If Beschreibung contains "erhalten besten dank" (case-insensitive):
    → Append: " -- pagamento Amex"

  - If amount is NEGATIVE (refund):
    → Append: " -- reembolso"

Examples from real data:
  1. PAYPAL *BRUEDERLICH     4029357733 -- -11009 -- VINICIUS STEIGLEDER -- Amex - PAYPAL *BRUEDERLICH     4029357733

  2. AMAZON MEDIA EU S.A.R.L. -- -11009 -- VINICIUS STEIGLEDER -- Amex - AMAZON MEDIA EU S.A.R.L.

MILES & MORE (Credit Card CSV)
──────────────────────────────
Columns used (in order):
  1. Description
  2. Payment type (e.g., "contactless", "e-commerce")
  3. Status (e.g., "Authorised")
  4. Derived: "M&M - " + Description
  5. Foreign info (if exists): "compra internacional em " + foreign_currency

Concatenation format:
  Description -- PaymentType -- Status -- M&M - Description [-- foreignInfo if exists]

Special rules:
  - If Description contains "lastschrift" (case-insensitive):
    → Append: " -- pagamento M&M"

  - If amount is POSITIVE (refund):
    → Append: " -- reembolso"

  - If foreign_amount and foreign_currency exist:
    → Append: " -- compra internacional em " + foreign_currency

Examples from real data:
  1. Apollo-Optik Holding G -- e-commerce -- Authorised -- M&M - Apollo-Optik Holding G

  2. Lidl sagt Danke -- contactless -- Authorised -- M&M - Lidl sagt Danke

  3. TEMU.COM DUBLIN 2 -- e-commerce -- Authorised -- M&M - TEMU.COM DUBLIN 2

KEYWORD MATCHING AGAINST KEY_DESC
─────────────────────────────────
Rules Engine matches keywords against the FULL key_desc field.

Process:
  1. Split key_words by ";" to get expressions
  2. For EACH expression, check if key_desc CONTAINS it (case-insensitive)
  3. If ANY expression matches → rule matches

  4. Split key_words_negative by ";" to get negative expressions
  5. For EACH negative expression, check if key_desc CONTAINS it
  6. If ANY negative expression matches → rule is BLOCKED

IMPORTANT: Do NOT tokenize expressions by spaces.
  ✅ Correct: "SV Fuerstenfeldbrucker Wasserratten e.V."
  ❌ Wrong: splitting into ["SV", "Fuerstenfeldbrucker", "Wasserratten", "e.V."]

This ensures partial matches work correctly:
  - keyword "LIDL" matches "Lidl sagt Danke -- contactless -- ..."
  - keyword "Apollo" matches "Apollo-Optik Holding G -- ..."
*/

-- No schema changes in this migration
-- This is documentation only

SELECT 'key_desc derivation logic documented' as status;
