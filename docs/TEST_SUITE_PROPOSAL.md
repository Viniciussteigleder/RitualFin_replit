# Proposal: Personal Finance Rules Engine Test Suite

## Overview
To ensure the long-term reliability of the RitualFin categorization engine, we propose expanding the existing unit tests to cover complex taxonomical edge cases and performance metrics.

## 1. Concrete Test Categories

### A. Taxonomical Resolution Edge Cases
**Target:** `src/lib/rules/leaf-resolution.ts`
- **Ambiguity Tests:** When two rules match with equal priority but different categories.
- **Specific vs. General:** Ensure that more specific keywords (if priority is equal) or higher priority rules correctly override general ones.
- **Hierarchy Mapping:** Verify that `resolveLeafFromMatches` correctly populates `category1`, `category2`, and `category3` from the database-linked leaf.

### B. Ingestion Pipeline Integrity
**Target:** `src/lib/actions/ingest.ts`
- **Deduplication Logic:** Mock the database to verify that identical transactions within the same batch (or across different batches) are correctly flagged as `duplicate`.
- **Payload Stability:** Verify that `txForDb` correctly serializes dates and complex objects for JSONB columns without losing precision.

### C. Rule Engine Performance
**Target:** `src/lib/rules/engine.ts`
- **High-Volume Matching:** Test the engine against 10,000 transactions and 500 rules to measure execution time.
- **Regex Efficiency:** If regex support is added, test for "Catastrophic Backtracking" scenarios.

## 2. Implementation Plan

### Phase 1: Tooling Setup (Done)
We already use `tsx` for running tests. We recommend adding `Vitest` for better assertion libraries and mocking capabilities.

### Phase 2: Mock Factory Pattern
Create a `tests/factories` directory to generate dummy data consistently:
```typescript
// Example Factory
export const createMockTransaction = (overrides = {}) => ({
  id: crypto.randomUUID(),
  description: "Test Transaction",
  amount: -10.00,
  date: new Date(),
  ...overrides
});
```

### Phase 3: Regression Suite
Automate the running of `tests/unit/rules-engine.test.ts` in the CI/CD pipeline (GitHub Actions) to prevent regressions whenever category levels or seed rules are updated.

## 3. Why This Matters
As the number of users and ingested files grows, the cost of a "misclassification bug" increases. Reliable unit tests allow us to refactor the rules engine (e.g., moving to a more sophisticated AI model or adding regex) with total confidence that the core Portuguese/EUR business logic remains intact.
