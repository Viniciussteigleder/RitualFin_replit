#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL=${API_BASE_URL:-"http://localhost:5000/api"}
CSV_PATH=${CSV_PATH:-"attached_assets/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv"}
COOKIE_JAR=$(mktemp)

cleanup() {
  rm -f "$COOKIE_JAR" /tmp/ritualfin-upload.json
}
trap cleanup EXIT

echo "API base: $API_BASE_URL"

curl -fsS "$API_BASE_URL/health" | sed -e 's/\r$//' 
curl -fsS "$API_BASE_URL/version" | sed -e 's/\r$//' 

curl -fsS -c "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo"}' \
  "$API_BASE_URL/auth/login" | sed -e 's/\r$//'

curl -fsS -b "$COOKIE_JAR" "$API_BASE_URL/settings" | sed -e 's/\r$//'

curl -fsS -b "$COOKIE_JAR" -X PATCH \
  -H 'Content-Type: application/json' \
  -d '{"autoConfirmHighConfidence":true,"confidenceThreshold":80}' \
  "$API_BASE_URL/settings" | sed -e 's/\r$//'

CSV_PATH="$CSV_PATH" python3 - <<'PY' > /tmp/ritualfin-upload.json
import json
import os
from pathlib import Path
path = Path(os.environ["CSV_PATH"])
content = path.read_text(encoding="utf-8", errors="ignore")
print(json.dumps({"filename": path.name, "csvContent": content, "encoding": "utf-8"}))
PY

curl -fsS -b "$COOKIE_JAR" -X POST \
  -H 'Content-Type: application/json' \
  -d @/tmp/ritualfin-upload.json \
  "$API_BASE_URL/uploads/process" | sed -e 's/\r$//'

curl -fsS -b "$COOKIE_JAR" "$API_BASE_URL/transactions" | sed -e 's/\r$//'
curl -fsS -b "$COOKIE_JAR" "$API_BASE_URL/classification/review-queue" | sed -e 's/\r$//'
