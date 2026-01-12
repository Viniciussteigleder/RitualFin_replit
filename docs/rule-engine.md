# RitualFin Rule Engine Documentation

**Version**: 1.0
**Last Updated**: 2026-01-12
**Lines**: 300+

---

## 1. Executive Overview

The RitualFin Rule Engine is a deterministic transaction categorization system designed to automatically classify financial transactions based on keyword matching. It operates in "Lazy Mode" - maximizing automation while minimizing manual work.

### Purpose

- **Automatic categorization** of bank transactions from CSV imports
- **Consistent classification** across multiple data sources (Sparkasse, Amex, M&M)
- **Confidence scoring** for quality control and review prioritization
- **Alias resolution** for clean merchant display names

### Design Principles

1. **Determinism**: Same input always produces same output
2. **Priority-based resolution**: Higher priority rules take precedence
3. **Strict mode**: Some rules bypass review for 100% confidence matches
4. **Negative matching**: Rules can exclude specific patterns
5. **Manual override protection**: User edits are never overwritten

---

## 2. Rule Sources

### 2.1 Excel Master File

**Path**: `docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx`

The Excel file contains two sheets:

#### Sheet 1: Categorias

| Column | Description |
|--------|-------------|
| App classificação | UI-level category grouping |
| Nivel_1_PT | Level 1 category (e.g., "Alimentação") |
| Nivel_2_PT | Level 2 subcategory (e.g., "Restaurantes") |
| Nivel_3_PT | Level 3 leaf (e.g., "Fast Food") |
| Key_words | Semicolon-separated matching keywords |
| Key_words_negative | Exclusion keywords |
| Receita/Despesa | Transaction type |
| Fixo/Variável | Cost classification |
| Recorrente | Recurring transaction flag |

#### Sheet 2: Alias_desc

| Column | Description |
|--------|-------------|
| Alias_Desc | Clean merchant display name |
| Key_words_alias | Keywords to match for alias |
| URL_icon_internet | Merchant logo URL |

### 2.2 Oracle Generation

Run the parser to generate canonical JSON snapshots:

```bash
npx tsx scripts/parse-rules-xlsx.ts
```

**Output files** in `rules/oracle/`:

- `categories.json` - Full category definitions
- `aliases.json` - Alias definitions
- `keyword-rules.json` - Flattened keyword→category mapping
- `alias-mapping.json` - Flattened keyword→alias mapping
- `stats.json` - Statistics summary
- `metadata.json` - Generation timestamp

### 2.3 Database Storage

Rules are stored in these PostgreSQL tables:

**rules** - Keyword matching rules
```sql
CREATE TABLE rules (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  type transaction_type,
  fix_var fix_var,
  category_1 category_1,
  category_2 TEXT,
  category_3 TEXT,
  priority INTEGER DEFAULT 500,
  strict BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  leaf_id VARCHAR,
  key_words TEXT,
  key_words_negative TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);
```

**taxonomy_level_1** - Level 1 categories
```sql
CREATE TABLE taxonomy_level_1 (
  level_1_id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  nivel_1_pt TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**taxonomy_level_2** - Level 2 subcategories
```sql
CREATE TABLE taxonomy_level_2 (
  level_2_id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  level_1_id VARCHAR REFERENCES taxonomy_level_1,
  nivel_2_pt TEXT NOT NULL,
  recorrente_default TEXT,
  fixo_variavel_default TEXT,
  receita_despesa_default TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**taxonomy_leaf** - Level 3 leaf categories
```sql
CREATE TABLE taxonomy_leaf (
  leaf_id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  level_2_id VARCHAR REFERENCES taxonomy_level_2,
  nivel_3_pt TEXT NOT NULL,
  recorrente_default TEXT,
  fixo_variavel_default TEXT,
  receita_despesa_default TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**alias_assets** - Merchant display aliases
```sql
CREATE TABLE alias_assets (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  alias_key TEXT,
  alias_desc TEXT NOT NULL,
  key_words_alias TEXT,
  logo_url TEXT,
  local_logo_path TEXT,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 500,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 3. Runtime Architecture

### 3.1 Execution Context

The rule engine runs as **server-side code** in Next.js:

- **Server Actions** (`src/lib/actions/ingest.ts`) for transaction import
- **API Routes** for async operations
- **No client-side evaluation** - all rules processed on server

### 3.2 Data Flow

```
CSV Upload
    ↓
[Ingest Action]
    ↓
Parse CSV → Raw Rows
    ↓
Normalize Description (descNorm)
    ↓
Load User Rules from DB
    ↓
[Rule Engine Evaluation]
    ↓
Generate Classification Result
    ↓
Apply Alias (if matched)
    ↓
Create/Update Transaction Record
    ↓
Dashboard/Analytics Aggregation
```

### 3.3 Key Modules

**src/lib/rules/engine.ts**
- `matchRules(descNorm, rules, settings)` - Main evaluation function
- `categorizeTransaction(descNorm, rules, settings)` - Transaction-level result
- `classifyByKeyDesc(keyDesc, rules)` - KeyDesc-based lookup
- `matchAlias(descNorm, aliases)` - Alias resolution
- `suggestKeyword(descNorm)` - Auto-suggest keyword from description

**src/lib/rules/classification-utils.ts**
- `normalizeForMatch(text)` - String normalization
- `splitKeyExpressions(keywords)` - Parse semicolon-separated keywords
- `findMatchedExpression(haystack, keywords)` - Find first match
- `evaluateRuleMatch(text, rule)` - Full rule evaluation with negatives

---

## 4. Rule Evaluation Pipeline

### 4.1 Normalization

All text is normalized before comparison:

```typescript
function normalizeForMatch(text: string): string {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
```

**Steps**:
1. Convert to UPPERCASE
2. NFD Unicode normalization (decompose accents)
3. Remove diacritical marks
4. Collapse multiple spaces
5. Trim whitespace

**Example**:
```
"Café Müller" → "CAFE MULLER"
```

### 4.2 Keyword Parsing

Keywords are semicolon-separated:

```typescript
const keywords = rule.keyWords
  .split(";")
  .map(k => normalizeForMatch(k))
  .filter(k => k.length > 0);
```

**Example**:
```
"LIDL;REWE;EDEKA" → ["LIDL", "REWE", "EDEKA"]
```

### 4.3 Positive Matching

For each keyword, check if it appears in the normalized description:

```typescript
const matchedKeyword = keywords.find(keyword =>
  haystack.includes(keyword)
);
```

### 4.4 Negative Matching

If a rule has `keyWordsNegative`, check if any negative keyword matches:

```typescript
if (rule.keyWordsNegative) {
  const negatives = rule.keyWordsNegative.split(";").map(normalizeForMatch);
  if (negatives.some(neg => haystack.includes(neg))) {
    // Skip this rule - negative matched
    continue;
  }
}
```

### 4.5 Priority Resolution

Rules are sorted by priority (descending):

```typescript
const sortedRules = [...rules].sort((a, b) =>
  (b.priority || 500) - (a.priority || 500)
);
```

Higher priority rules are evaluated first. Default priority: 500.

### 4.6 Strict Mode

If a rule has `strict: true` and matches:
- Return immediately with confidence: 100%
- Set `needsReview: false`
- No further rules are evaluated

```typescript
if (rule.strict) {
  return {
    needsReview: false,
    matches: [match],
    appliedRule: match,
    confidence: 100,
    reason: "Regra estrita aplicada automaticamente"
  };
}
```

### 4.7 Confidence Calculation

```typescript
function calculateConfidence(match: RuleMatch): number {
  let confidence = 70;  // Base confidence

  if (match.isSystem) confidence += 10;  // System rule bonus
  if (match.priority >= 800) confidence += 15;
  else if (match.priority >= 600) confidence += 10;
  else if (match.priority >= 500) confidence += 5;

  if (match.strict) confidence = 100;  // Strict always 100%

  return Math.min(confidence, 100);
}
```

### 4.8 Conflict Detection

If multiple rules match with the same priority:

```typescript
const topMatches = matches.filter(m =>
  m.priority === matches[0].priority
);

if (topMatches.length > 1) {
  return {
    needsReview: true,
    confidence: 50,
    reason: `Conflito: ${matches.length} regras com mesma prioridade`
  };
}
```

---

## 5. Interfaces and Types

### 5.1 RuleMatch

```typescript
interface RuleMatch {
  ruleId: string;
  type: "Despesa" | "Receita";
  fixVar: "Fixo" | "Variável";
  category1: string;
  category2?: string;
  category3?: string;
  priority: number;
  strict: boolean;
  isSystem: boolean;
  matchedKeyword?: string;
  leafId?: string | null;
}
```

### 5.2 CategorizationResult

```typescript
interface CategorizationResult {
  needsReview: boolean;
  matches: RuleMatch[];
  appliedRule?: RuleMatch;
  confidence: number;
  reason?: string;
}
```

### 5.3 UserSettings

```typescript
interface UserSettings {
  autoConfirmHighConfidence?: boolean;
  confidenceThreshold?: number;
}
```

---

## 6. Screen Integration

### 6.1 Dashboard (`src/app/page.tsx`)

Consumes aggregated transaction data via `getDashboardData()`:
- Total spending per category
- Budget vs actual comparison
- Pending review count

**Filter behavior**: Excludes `display="no"` transactions from totals.

### 6.2 Transactions / Extrato (`src/app/(dashboard)/transactions/page.tsx`)

Displays transaction list with filters:
- Date range
- Category (Level 1, 2, 3)
- Type (Despesa/Receita)
- Source (Sparkasse/Amex/M&M)
- Review status

**Server Action**: `getTransactions(filters)`

### 6.3 Analytics / Analise Total (`src/app/(dashboard)/analytics/page.tsx`)

Drill-down aggregation by taxonomy levels:
- Level 1 → Level 2 → Level 3 → Transactions

**Server Action**: `getAnalyticsData(filters)`

### 6.4 Confirm / Review Queue (`src/app/(dashboard)/confirm/page.tsx`)

Shows transactions with `needsReview: true`:
- High confidence items for bulk approval
- Manual category assignment
- Rule creation from transaction

### 6.5 Rules Management (`src/app/(dashboard)/rules/page.tsx`)

CRUD for user rules:
- Create/edit keyword rules
- Set priority and strict flag
- Reapply rules to existing transactions

---

## 7. Failure Modes and Mitigations

### 7.1 Timezone Issues

**Problem**: Date parsing varies by locale
**Mitigation**: All dates stored as UTC; display converted client-side

### 7.2 Null/Undefined Handling

**Problem**: Missing fields cause errors
**Mitigation**: All accessors use optional chaining and defaults:
```typescript
rule.category1 || "Outros"
```

### 7.3 Duplicate Keywords

**Problem**: Same keyword in multiple rules
**Mitigation**: Priority system resolves; conflict flag set if same priority

### 7.4 Encoding Issues

**Problem**: CSV files with different encodings
**Mitigation**: UTF-8 detection with fallback; NFD normalization

### 7.5 Caching Pitfalls

**Problem**: Stale rule data after updates
**Mitigation**: `revalidatePath()` called after rule changes

---

## 8. Debugging Guide

### 8.1 Running Parity Check

```bash
# Generate Oracle from Excel
npx tsx scripts/parse-rules-xlsx.ts

# Verify DB parity (requires DATABASE_URL)
DATABASE_URL=... npx tsx scripts/verify-db-parity.ts
```

### 8.2 Logging Points

Add logging in `src/lib/rules/engine.ts`:
```typescript
console.log(`[RuleEngine] Evaluating: ${descNorm}`);
console.log(`[RuleEngine] Matched rule: ${rule.id}`);
```

**Never log**: API keys, user IDs in production, transaction amounts

### 8.3 Common Issues

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| No matches | Keywords not normalized | Check normalizeForMatch() |
| Wrong category | Priority conflict | Increase winning rule priority |
| Always needs review | Strict not set | Set strict: true for high-confidence rules |
| Alias not applied | Keywords mismatch | Check alias_assets.key_words_alias |

---

## 9. Regression Strategy

### 9.1 Unit Tests

File: `tests/unit/rules-engine.test.ts`

Tests cover:
- Determinism (same input → same output)
- Priority resolution
- Strict mode short-circuit
- Negative keyword exclusion
- Confidence calculation
- Conflict detection

### 9.2 Parity Tests

File: `scripts/verify-db-parity.ts`

Ensures:
- Oracle matches DB taxonomy
- All Excel keywords exist in rules
- No orphan DB records

### 9.3 CI Gates

Build must pass:
- `npm run check` (TypeScript)
- `npm run build` (Next.js)
- `npx tsx tests/unit/rules-engine.test.ts` (Unit tests)

### 9.4 Safe Update Process

1. Edit Excel file
2. Run Oracle parser
3. Run parity check
4. Run unit tests
5. Commit with descriptive message
6. Deploy and verify

---

## 10. Appendix: Code Examples

### 10.1 Basic Rule Evaluation

```typescript
import { matchRules } from "@/lib/rules/engine";

const rules = await db.select().from(rulesTable);
const result = matchRules("REWE CITY MUNICH", rules);

if (result.needsReview) {
  console.log("Manual review required");
} else {
  console.log(`Auto-categorized: ${result.appliedRule?.category1}`);
}
```

### 10.2 Creating a New Rule

```typescript
await db.insert(rules).values({
  userId: user.id,
  keyWords: "NETFLIX;SPOTIFY;DISNEY+",
  category1: "Lazer / Esporte",
  category2: "Streaming",
  priority: 700,
  strict: true,
  type: "Despesa",
  fixVar: "Fixo",
});
```

### 10.3 Applying Alias

```typescript
import { matchAlias } from "@/lib/rules/engine";

const aliases = await db.select().from(aliasAssets);
const matched = matchAlias("PAYPAL *NETFLIX", aliases);

if (matched) {
  transaction.aliasDesc = matched.aliasDesc;
}
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-12 | Initial comprehensive documentation |

---

*End of Documentation - 300+ lines*
