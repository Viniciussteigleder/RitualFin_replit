#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:5050/api}"
export API_BASE_URL

npx --no-install tsx scripts/qa/run_api_contracts.ts
