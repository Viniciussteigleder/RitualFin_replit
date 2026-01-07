
# RitualFin AI Design Specification

This document describes the AI architecture and features integrated into RitualFin.

## 1. Governance & Constraints
- **Model**: `gpt-4o-mini`
- **Temperature**: `0` (for deterministic categorization and extraction)
- **Safety**: Server-side execution only.
- **Explainability**: Every AI action must provide a `rationale` and `confidence` score.
- **Priority**: Manual overrides and deterministic rules ALWAYS take precedence over AI suggestions.

## 2. Environment Variables
- `OPENAI_API_KEY`: Required for all AI features. If missing, features are gracefully disabled.

## 3. Core Features

### 3.1 AI Categorization Fallback
- **Trigger**: When a transaction is imported and matches NO deterministic rules.
- **Workflow**:
  1. Transaction `desc_raw` is sent to OpenAI.
  2. System prompt includes the available taxonomy (Leaf IDs and names).
  3. AI returns a suggested `leafId`, `confidence`, and `rationale`.
- **Storage**: Updates `transactions.leaf_id` (if confidence > threshold) or `transactions.suggested_keyword`.
- **UI**: Displayed as a "AI Suggestion" badge in the transaction details with the rationale.

### 3.2 Merchant & Keyword Extraction
- **Trigger**: During OCR parsing or transaction enrichment.
- **Goal**: Clean up cryptic bank descriptors (e.g., "REWE-1234 Frankfurt" -> "REWE").
- **Workflow**: AI identifies entities and keywords from raw text.
- **Output Schema**:
  ```json
  {
    "extracted_merchants": ["REWE"],
    "extracted_keywords": ["Frankfurt", "Einkauf"]
  }
  ```

### 3.3 AI Rules Suggestions (Dashboard & Settings)
- **Trigger**: User opens the "AI Keywords" screen.
- **Workflow**: AI scans unclassified transactions to find common patterns and suggests rules.
- **UI**: Cards with "Create Rule" buttons based on AI findings.

### 3.4 AI Assistant
- **Trigger**: User interacts with the "Assistente IA" floating button or drawer.
- **Context**: Screen-aware context (Page title, current visible data summary).
- **Goal**: Answer natural language questions about the user's finances.

## 4. Prompt Template (Categorization)
```text
System: You are a financial expert assistant. Use the taxonomy below to categorize the transaction accurately.
Taxonomy: {taxonomy_json}

User: Categorize this transaction: "{description}"
```

## 5. Output Schema (JSON)
All AI responses MUST conform to this schema:
```json
{
  "suggested_leaf_id": "uuid-or-string",
  "confidence": 0.85,
  "rationale": "High match with Grocery patterns found in REWE descriptors.",
  "extracted_merchants": ["REWE"],
  "extracted_keywords": ["food", "retail"]
}
```

## 6. Auditability
The transaction record stores:
- `classified_by`: `AI_SUGGESTION`
- `confidence`: The numerical score
- `suggested_keyword`: The rationale or extracted merchant
