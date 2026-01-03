#!/usr/bin/env bash
set -euo pipefail

export E2E_BASE_URL=${E2E_BASE_URL:-"http://127.0.0.1:5173"}
npx playwright test
