# ADR 003: Evidence-First Ingestion

## Status
Accepted

## Context
Current ingestion creates `transactions` directly from CSVs. This makes it impossible to:
1. Support "Screenshot Ingestion" where data is partial/untrusted.
2. Enrich transactions later (e.g., CSV arrives 3 days after the screenshot).
3. Audit exactly *what source* provided *what field*.

## Decision
We will adopt an **Evidence-First** data model.
1. All imports (CSV, Screenshot) create `ingestion_items` records first.
2. A deterministic "Matching Engine" links `ingestion_items` to canonical `transactions`.

## Consequences
- **Positive**:
    - **Idempotency**: Importing the same file twice does nothing (fingerprint match).
    - **Enrichment**: A generic "Amazon 50.00" screenshot transaction can be "upgraded" to "Amazon Marketplace desc..." when the CSV imports.
    - **Auditability**: We can show the user "This transaction exists because you uploaded Image X and CSV Y".
- **Negative**:
    - Increased storage (keeping raw payloads).
    - Higher complexity in the "Write" path (must check for matches).
