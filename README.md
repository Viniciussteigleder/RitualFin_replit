# RitualFin — Classification + Alias + Logos + Excel Roundtrip

This repository implements the end-to-end Classification + Alias + Logos + Excel roundtrip flow for RitualFin.

## CSV Imports

Supported sources:
- Sparkasse (`;`, latin1/ISO-8859-1)
- Amex (`,`, UTF-8, multiline fields)
- Miles & More (`;`, UTF-8, header after 2 lines)

Import flow:
1. Preview the first 20 parsed rows in **Settings → Classificação & Dados → Importações**
2. Validate detected delimiter/encoding/date/amount formats and warnings
3. Import is idempotent by `key`

Encoding:
- The UI attempts UTF-8 first and falls back to `iso-8859-1` for Sparkasse.

## Key Rules

### key_desc (strict concatenation)
Separator: ` -- `

**Sparkasse**
```
Beguenstigter -- Verwendungszweck -- Buchungstext -- KontonummerIBAN -- Sparkasse - Beguenstigter
```
Append tags:
- `-- pagamento Amex` if Beguenstigter contains `american express`
- `-- pagamento M&M` if Beguenstigter contains `deutsche kreditbank`

**Amex**
```
Descrição -- Conta -- Karteninhaber -- Amex - Descrição
```
Append tags:
- `-- pagamento Amex` if descrição contains `erhalten besten dank`
- `-- reembolso` if **raw** amount is negative and descrição does not contain the phrase above

**Miles & More**
```
Description -- Payment type -- Status -- M&M - Description -- (optional) compra internacional em <CurrencyForeign>
```
Append tags:
- `-- pagamento M&M` if Description contains `lastschrift`
- `-- reembolso` if amount is positive

### key (unique per user)
```
key = key_desc -- amount -- booking_date -- optional_reference
```
Reference priority:
- Sparkasse: Kundenreferenz (End-to-End) → Mandatsreferenz → Sammlerreferenz → Glaeubiger-ID
- Amex: Betreff
- M&M: Processed on (optional)

Amounts are normalized to dot-decimal with 2 digits. Dates use ISO `YYYY-MM-DD`.

## Classification Model

Tables:
- `taxonomy_level_1`, `taxonomy_level_2`, `taxonomy_leaf`
- `app_category` + `app_category_leaf` (UI layer)
- `rules` (key_words / key_words_negative)

Canonical Excel structure:
```
App classificação | Nivel_1_PT | Nivel_2_PT | Nivel_3_PT | Key_words | Key_words_negative | Receita/Despesa | Fixo/Variável | Recorrente
```

Rules matching:
- Split only by `;`
- Normalize to uppercase + remove accents + collapse spaces
- Positive match if `key_desc` contains any expression
- Negative match blocks only that rule

## Aliases & Logos

Tables:
- `key_desc_map`: key_desc → simple_desc + alias_desc
- `alias_assets`: alias_desc → key_words_alias + logo metadata

Resolution order:
1) `key_desc_map.alias_desc`
2) `alias_assets.key_words_alias` match → auto-upsert into `key_desc_map`
3) Fallback: `simple_desc`

Logo refresh:
Settings → **Aliases & Logos** → “Atualizar logos”.
Logos are stored under `public/logos/<user_id>/<slug>.ext` (PNG/JPG/SVG, max 2MB).

## Getting Started

1.  **Environment Setup**: Copy `.env.example` to `.env.local` and fill in your database and auth credentials.
2.  **Database**: Run migrations with `npm run db:push`.
3.  **Run Dev**: `npm run dev`.
4.  **Testing**: See [Testing Guide](docs/TESTING.md).

## Critical Paths & E2E Tests

The application features a robust E2E test suite using Playwright covering:
- Authentication (Signup/Login)
- Data Ingestion (CSV upload, preview, commit, rollback)
- Screenshot Evidence (OCR & Transaction Enrichment)

Run tests with `npx playwright test`.

## Excel Roundtrip

**Categories & Rules**
- Download: Settings → Categorias → “Baixar Excel”
- Upload: preview diff + apply (requires confirmation if UI categories changed)

**Aliases & Logos**
- Download: Settings → Aliases → “Baixar Excel”
- Upload: preview counts + apply

## Recurrence Detection

Heuristic:
- at least 3 transactions with ~30 days ± 4 days
- similar amount (±2% or ±2 EUR)

Stored fields:
- `recurring_group_id`
- `recurring_day_of_month` (median)
- `recurring_day_window` (max deviation)
- `recurring_confidence` (ratio of matching deltas)

## Tests (manual script)

```
tsx script/test-imports.ts
```

Validates parsing and key_desc tagging on the three sample files under `attached_assets/`.

## Supabase RLS & Storage

Apply `migrations/004_classification_alias_logos.sql` in Supabase to:
- Enable RLS on new tables
- Create `logos` bucket and per-user policies

## Assumptions

- The app uses Drizzle `db:push` to create tables. SQL migration is provided for RLS/bucket only.
- Amounts remain `real` in the existing schema to avoid breaking legacy reports. New keys still use normalized decimal strings.
- Logo storage is local (`public/logos`) in this repo; Supabase bucket paths match the same structure for deployment.
