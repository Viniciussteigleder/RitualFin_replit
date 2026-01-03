# Rules Engine Specification

**Version**: 1.0
**Date**: 2026-01-02
**Implementation**: `server/rules-engine.ts`

---

## Overview

The Rules Engine provides AI-assisted automatic categorization of financial transactions using keyword-based matching. Rules are user-defined patterns that assign categories, types, and flags to transactions based on merchant descriptions.

**Key Features**:
- Keyword-based matching with confidence scoring
- Priority-based rule resolution
- Manual override protection (immutability)
- "Interno" category auto-flagging
- AI-powered keyword suggestions

---

## Rule Data Model

### Rule Structure

```typescript
interface Rule {
  id: string;
  userId: string;
  name: string;              // Human-readable rule name
  keywords: string;          // Semicolon-separated expressions
  keywordsNegative?: string; // Optional negative keywords (block match)
  type: "Despesa" | "Receita";
  fixVar: "Fixo" | "Variável";
  category1: string;         // Primary category (enum)
  category2?: string;        // Optional subcategory
  category3?: string;        // Optional specification
  priority: number;          // Higher = applied first (default: 500)
  strict: boolean;           // If true, confidence = 100, no review
  isSystem: boolean;         // True for AI-seeded rules
}
```

### Categorization Hierarchy

**Level 1** (Required): Primary category from enum
- `Mercado`, `Moradia`, `Transporte`, `Saúde`, `Lazer`, `Compras Online`, `Receitas`, `Interno`, `Outros`

**Level 2** (Optional): Subcategory (free text)
- Example: `Supermercado`, `Restaurante`, `Streaming`

**Level 3** (Optional): Specification (free text)
- Example: `LIDL`, `REWE`, `Netflix`

---

## Keyword Matching

### Expression Syntax

**CRITICAL**: Keywords use **semicolon (`;`) as separator ONLY**. Spaces within expressions are PRESERVED.

**Format**: `expression1;expression2;expression3`

**Examples**:

| Input | Split Result | Match Behavior |
|-------|--------------|----------------|
| `LIDL` | `["LIDL"]` | Matches if description contains "LIDL" |
| `LIDL;REWE;EDEKA` | `["LIDL", "REWE", "EDEKA"]` | Matches if description contains ANY |
| `SV Fuerstenfeldbrucker Wasserratten e.V.` | `["SV Fuerstenfeldbrucker Wasserratten e.V."]` | Matches FULL expression (spaces preserved) |
| `REWE MARKT;EDEKA CENTER` | `["REWE MARKT", "EDEKA CENTER"]` | Matches either full phrase |

**Parsing Logic**:
```typescript
const keywords = rule.keywords
  .split(";")                    // ONLY split on semicolon
  .map(k => normalizeForMatch(k)) // Normalize each expression
  .filter(k => k.length > 0);     // Remove empty
```

**Normalization**:
```typescript
function normalizeForMatch(text: string): string {
  return text
    .toUpperCase()              // Case insensitive
    .normalize("NFD")           // Decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, " ")       // Normalize whitespace
    .trim();
}
```

### Negative Keywords (Optional)

**Purpose**: Block matches even if positive keywords match

**Example**:
```typescript
keywords: "STADTWERK"
keywordsNegative: "RÜCKERSTATTUNG;GUTSCHRIFT"
```

**Behavior**:
- Description: `"STADTWERK MÜNCHEN STROM"` → ✅ Match (positive keyword, no negative)
- Description: `"STADTWERK RÜCKERSTATTUNG"` → ❌ No match (negative keyword blocks)

**Use Cases**:
- Exclude refunds from expense rules
- Exclude specific subtypes from broad rules

---

## Matching Algorithm

### Priority-Based Resolution

1. **Sort Rules**: By priority (descending)
   - Default priority: 500
   - Higher priority rules evaluated first
   - System rules typically priority 700-1000

2. **Match Process** (for each rule in priority order):
   ```typescript
   // Check positive keywords
   const matchedKeyword = keywords.find(kw => descNorm.includes(kw));
   if (!matchedKeyword) continue;

   // Check negative keywords (if any)
   if (keywordsNegative) {
     const negativeMatch = negativeKeywords.find(kw => descNorm.includes(kw));
     if (negativeMatch) continue; // Block this rule
   }

   // Rule matches!
   matches.push(rule);
   ```

3. **Strict Rules**: Immediate application
   - If `rule.strict === true`:
     - Confidence = 100
     - `needsReview = false`
     - Transaction auto-categorized
     - Stop processing (first strict match wins)

4. **Regular Rules**: Confidence scoring
   - Base confidence: 70
   - +10 if system rule
   - +5 to +15 based on priority
   - If multiple matches: highest priority selected
   - If confidence < threshold: `needsReview = true`

### Confidence Calculation

```typescript
function calculateConfidence(match: RuleMatch): number {
  let confidence = 70;

  if (match.isSystem) confidence += 10;

  if (match.priority >= 800) confidence += 15;
  else if (match.priority >= 600) confidence += 10;
  else if (match.priority >= 500) confidence += 5;

  if (match.strict) confidence = 100;

  return Math.min(confidence, 100);
}
```

**Thresholds**:
- **80+**: High confidence (auto-apply if setting enabled)
- **50-79**: Medium confidence (requires review)
- **0-49**: Low confidence (requires review)

---

## Manual Override Protection

**Principle**: Once a user manually categorizes a transaction, it becomes immutable to automated recategorization.

### Implementation

1. **Flag Setting**:
   ```typescript
   transaction.manualOverride = true  // Set on manual edit or confirmation
   ```

2. **Rule Reapplication**:
   ```typescript
   for (const tx of transactions) {
     if (tx.manualOverride) {
       continue; // SKIP - never recategorize
     }
     // Apply rules...
   }
   ```

3. **Bulk Operations**:
   - Bulk rule reapply skips `manualOverride=true` transactions
   - New rule creation does not affect manual transactions
   - Rule priority changes do not affect manual transactions

**Use Cases**:
- User corrects incorrect auto-categorization
- User adds custom categories not in rules
- User handles one-off transactions differently

---

## Interno Category Auto-Flagging

**Special Behavior**: When a transaction is categorized as `Interno` (internal transfer):

**Auto-Applied Flags**:
```typescript
if (category1 === "Interno") {
  transaction.internalTransfer = true;
  transaction.excludeFromBudget = true;
}
```

**Purpose**:
- `internalTransfer`: Identifies account-to-account movements
- `excludeFromBudget`: Excludes from expense/income calculations

**Examples**:
- Credit card payment from checking account
- Transfer between savings and checking
- AMEX payment from bank account

**Keywords** (common patterns):
```
AMEX - ZAHLUNG
ZAHLUNG ERHALTEN
PAGAMENTO AMEX
LASTSCHRIFT
DEUTSCHE KREDITBANK
TRANSFERENCIA INTERNA
```

---

## AI Integration

### Keyword Suggestion

**Endpoint**: `POST /api/ai/suggest-keyword`

**Input**:
```json
{
  "description": "REWE MARKT MÜNCHEN -- EINKAUF 15.12.2024"
}
```

**Process**:
1. Send transaction description to OpenAI
2. AI suggests optimal keyword for matching
3. Returns: `{ keyword: "REWE MARKT" }`
4. User can accept, edit, or reject

**OpenAI Prompt** (simplified):
```
Extract the most useful keyword from this transaction description for categorization.
Focus on merchant name, remove dates/transaction IDs.
Return only the keyword, no explanation.

Description: "REWE MARKT MÜNCHEN -- EINKAUF 15.12.2024"
```

### Bulk Categorization

**Endpoint**: `POST /api/ai/bulk-categorize`

**Input**:
```json
{
  "descriptions": [
    "REWE MARKT MÜNCHEN",
    "REWE MARKT FRANKFURT",
    "REWE MARKT BERLIN"
  ]
}
```

**Process**:
1. Group similar transactions
2. Send batch to AI for pattern detection
3. AI suggests category + keywords
4. User reviews and confirms
5. Creates rule + categorizes all matching transactions

**Use Case**: After CSV import, categorize 100+ uncategorized transactions in one operation

---

## Rule Seeding

**System Rules**: AI-generated default rules for common German merchants

**Seed Data** (`AI_SEED_RULES` in `server/rules-engine.ts`):
- **Interno**: Bank transfers, credit card payments (priority 1000, strict)
- **Mercado**: REWE, EDEKA, LIDL, etc. (priority 900, strict)
- **Receitas**: Salary, government payments (priority 800)
- **Moradia**: Rent, utilities (priority 700)
- **Compras Online**: Amazon, Zalando (priority 650)
- **Saúde**: Pharmacy, doctors (priority 620)
- **Transporte**: Gas stations, parking, public transport (priority 600)
- **Lazer**: Restaurants, streaming, entertainment (priority 580)
- **Assinaturas**: Netflix, Spotify (priority 570)
- **Outros**: Insurance, fees (priority 500)

**Activation**:
- User clicks "Criar Regras Padrão" button
- System inserts all seed rules with `isSystem=true`
- Immediate application to existing transactions

---

## Rules Management

### Create Rule

```typescript
POST /api/rules
{
  "name": "Supermercado REWE",
  "keywords": "REWE;REWE MARKT",
  "type": "Despesa",
  "fixVar": "Variável",
  "category1": "Mercado",
  "category2": "Supermercado",
  "priority": 500,
  "strict": false
}
```

### Update Rule

```typescript
PATCH /api/rules/:id
{
  "keywords": "REWE;REWE MARKT;REWE CENTER",  // Add keyword
  "priority": 600  // Increase priority
}
```

**Note**: Updating a rule does NOT automatically recategorize existing transactions. User must trigger "Reaplicar Regras" explicitly.

### Delete Rule

```typescript
DELETE /api/rules/:id
```

**Behavior**:
- System rules (`isSystem=true`) cannot be deleted via UI
- Deleting rule does NOT affect already-categorized transactions
- Use "Reaplicar Regras" to recategorize without deleted rule

### Reapply All Rules

```typescript
POST /api/rules/reapply-all
```

**Process**:
1. Fetch all uncategorized transactions (`needsReview=true`)
2. Skip transactions with `manualOverride=true`
3. Re-run categorization engine
4. Update transactions with new matches
5. Return count: `{ categorized: 45, stillPending: 12 }`

---

## Best Practices

### Keyword Design

✅ **Good Examples**:
- `LIDL` (simple, exact)
- `REWE;REWE MARKT;REWE CENTER` (variations of same merchant)
- `SV Fuerstenfeldbrucker Wasserratten e.V.` (full organization name with spaces)

❌ **Anti-Patterns**:
- `LID` (too short, false positives)
- `MARKET` (too generic)
- `REWE MARKT,LIDL` (comma instead of semicolon - treated as one expression)

### Priority Strategy

**Recommended Ranges**:
- **1000+**: Strict internal transfers (prevent miscat)
- **800-999**: High-confidence system rules (grocery stores, utilities)
- **500-799**: User-defined rules
- **Below 500**: Low-priority catch-all rules

**Conflict Resolution**:
- If two rules match with same priority → first in sorted order wins
- Use priority to override: Set specific rule higher than generic

### Strict Mode

Use `strict=true` when:
- ✅ 100% confident keyword is unique (e.g., `NETFLIX SUBSCRIPTION`)
- ✅ High-priority critical categorization (e.g., `Interno` transfers)
- ✅ System-seeded rules with proven patterns

Avoid `strict=true` when:
- ❌ Keyword might match multiple merchants
- ❌ Category could vary (e.g., `AMAZON` could be electronics, books, or groceries)

---

## E2E Testing

**Test File**: `tests/e2e/rules-engine.spec.ts`

**Test Coverage**:
- Keyword matching (simple, multi-word, multiple expressions)
- Negative keyword blocking
- Manual override protection
- Interno auto-flagging
- Rule reapplication
- Priority-based resolution

**Test IDs**:
- RULE-001 through RULE-006 (keyword matching)
- MAN-001 through MAN-004 (manual override)
- INT-001 through INT-004 (Interno flagging)

---

## Troubleshooting

### Issue: Rule not matching

**Check**:
1. Keyword includes correct normalized form (no accents, uppercase)
2. Description actually contains keyword (check `descNorm` field)
3. No negative keyword blocking the match
4. Rule priority is higher than conflicting rules
5. Transaction doesn't have `manualOverride=true`

### Issue: Wrong rule applied

**Check**:
1. Multiple rules matching → highest priority wins
2. Strict rule applied first → check if strict rule exists
3. Check rule order in UI (sorted by priority descending)

### Issue: AI suggestion not helpful

**Causes**:
- OpenAI API key missing
- Description too generic or short
- Non-English/German descriptions confuse AI

**Solution**:
- Manually enter keyword
- Use semicolon to add multiple variations

---

**Last Updated**: 2026-01-02
**Implementation**: `server/rules-engine.ts`, `server/routes.ts` (rules endpoints)
