#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Export it or source .env.local before running."
  exit 1
fi

npx --no-install tsx scripts/qa/run_db_invariants.ts
