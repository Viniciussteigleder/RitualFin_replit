# Data Pipeline Notes (Codex)

## 2025-12-29T11:40:14Z (UTC)
- CSV ingestion: Parses M&M, Amex, Sparkasse with format detection in server/csv-parser.ts.
- Rules engine: Keyword-based matching in server/rules-engine.ts; AI is optional and user-triggered.
- Known risks: Large CSVs may be slow; duplicate detection is key-based; account attribution must stay consistent.
- Review queue: Transactions with needsReview=true require user confirmation; avoid auto-apply without clear rule confidence.
