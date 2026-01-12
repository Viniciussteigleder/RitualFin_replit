# Rules Source Contract

**Source File**: `docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx`
**Oracle Output**: `rules/oracle/`

---

## Overview

The RitualFin categorization system uses a two-table Excel file as the single source of truth for:

1. **Category taxonomy** (Level 1 → Level 2 → Level 3) with associated keywords
2. **Alias mappings** for merchant display names

---

## Sheet 1: Categorias

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `App classificação` | string | App-level category name (UI grouping) |
| `Nivel_1_PT` | string | Level 1 category (Portuguese) |
| `Nivel_2_PT` | string | Level 2 subcategory (Portuguese) |
| `Nivel_3_PT` | string | Level 3 leaf category (Portuguese) |
| `Key_words` | string | Semicolon-separated keywords for matching |
| `Key_words_negative` | string | Semicolon-separated negative keywords (exclusions) |
| `Receita/Despesa` | enum | Transaction type: "Receita" or "Despesa" |
| `Fixo/Variável` | enum | Cost type: "Fixo" or "Variável" |
| `Recorrente` | enum | Recurring flag: "Sim" or "Não" |

### Statistics

- **Total rows**: 108
- **Unique Level 1**: 18
- **Unique Level 2**: 56
- **Unique Level 3**: 107
- **Rows with keywords**: 95
- **Total keywords**: 224

### Level 1 Categories (from Excel)

```
ALIMENTACAO
ASSINATURAS
COMPRAS
DOACOES
EDUCACAO
ESPORTES
FERIAS
FINANCAS
INTERNO
LAZER
MOBILIDADE
MORADIA
PETS
SAUDE
TELEFONE
TRABALHO
TRANSFERENCIAS
VENDAS
```

### Type Distribution

- Despesa: 102
- Receita: 6

### Fixo/Variável Distribution

- Fixo: 25
- Variável: 83

---

## Sheet 2: Alias_desc

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `Alias_Desc` | string | Display name for merchant |
| `Key_words_alias` | string | Semicolon-separated keywords to match |
| `URL_icon_internet` | string | Icon URL for merchant logo |

### Statistics

- **Total rows**: 64 unique aliases
- **Total alias keywords**: 112

---

## Normalization Rules

All comparisons use these normalization steps:

1. **Trim** leading/trailing whitespace
2. **NFD normalization** (decompose Unicode characters)
3. **Remove diacritical marks** (regex: `/[\u0300-\u036f]/g`)
4. **Convert to UPPERCASE**
5. **Collapse multiple spaces** to single space

### Example

```
Input:  "Café & Padaria"
Output: "CAFE & PADARIA"
```

---

## Keyword Parsing

Keywords are **semicolon-separated** within a single cell:

```
Input:  "LIDL;REWE;EDEKA"
Output: ["LIDL", "REWE", "EDEKA"]
```

Each keyword is individually normalized before storage/comparison.

---

## Matching Semantics

### Positive Match

A transaction description **matches** a rule if:
```
normalize(description).includes(normalize(keyword))
```

for ANY keyword in the rule's `Key_words` list.

### Negative Match (Exclusion)

If `Key_words_negative` contains any keyword that matches:
```
normalize(description).includes(normalize(negative_keyword))
```

Then the rule is **skipped** (negative overrides positive).

### Priority Order

Rules are evaluated in priority order (highest first). Default priority: 500.

---

## Oracle Generation

Run the parser to generate Oracle snapshots:

```bash
npx tsx scripts/parse-rules-xlsx.ts
```

### Output Files

| File | Contents |
|------|----------|
| `rules/oracle/categories.json` | Full category rows |
| `rules/oracle/aliases.json` | Alias rows |
| `rules/oracle/keyword-rules.json` | Flattened keyword→category mapping |
| `rules/oracle/alias-mapping.json` | Flattened keyword→alias mapping |
| `rules/oracle/stats.json` | Statistics summary |
| `rules/oracle/metadata.json` | Generation timestamp |

---

## Invariants

1. **Every keyword must be unique within its table** (no duplicate keywords mapping to different categories)
2. **Level hierarchy must be consistent**: Level 3 belongs to exactly one Level 2, which belongs to exactly one Level 1
3. **Normalization must be applied identically** in parser, DB storage, and runtime matching
4. **Oracle is regenerated on Excel changes** before any parity check

---

## Known Discrepancies

### DB Enum vs Excel Categories

The `category1` enum in the DB schema has different values than Excel Level 1:

**DB Enum** (12 values):
- Alimentação, Mercados, Renda Extra, Outros, Lazer / Esporte, Compras, Financiamento, Interno, Transporte, Moradia, Saúde, Trabalho

**Excel Level 1** (18 values):
- ALIMENTACAO, ASSINATURAS, COMPRAS, DOACOES, EDUCACAO, ESPORTES, FERIAS, FINANCAS, INTERNO, LAZER, MOBILIDADE, MORADIA, PETS, SAUDE, TELEFONE, TRABALHO, TRANSFERENCIAS, VENDAS

**Resolution**: The taxonomy tables (`taxonomy_level_1`, etc.) store the Excel values. The `category1` enum field on transactions is a legacy constraint that should be expanded or deprecated.

---

## Update Process

1. Edit the Excel file
2. Run `npx tsx scripts/parse-rules-xlsx.ts`
3. Run `npx tsx scripts/verify-db-parity.ts`
4. If FAIL: run seed/migration to sync DB
5. Re-verify until PASS
6. Commit changes

---

## Document Version

Created: 2026-01-12
Last Updated: 2026-01-12
