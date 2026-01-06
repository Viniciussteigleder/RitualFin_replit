#!/bin/sh
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is required for full deploy."
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

scripts/deploy/full_deploy_preflight.sh

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required for verification."
  exit 1
fi

local_sha=$(git rev-parse --short=12 HEAD)
branch=$(git rev-parse --abbrev-ref HEAD)

echo "Fetching origin/main to verify intended deploy commit..."
git fetch origin main
origin_sha=$(git rev-parse --short=12 origin/main)

if [ "$local_sha" != "$origin_sha" ]; then
  echo "Local HEAD ($local_sha) does not match origin/main ($origin_sha)."
  echo "Push/merge before full deploy verification."
  exit 1
fi

if [ "${FULL_DEPLOY_AUTO-}" = "1" ]; then
  scripts/deploy/vercel_prod_deploy.sh
else
  echo "Auto deploy disabled. Ensure Render and Vercel are deploying from GitHub main."
fi

report_ts=$(date -u +%Y-%m-%d_%H%M)
report_path="docs/DEPLOYMENT_REPORTS/${report_ts}_full_deploy.md"

{
  echo "# Full Deploy Report"
  echo ""
  echo "Timestamp (UTC): $report_ts"
  echo ""
  echo "## GitHub"
  echo "- Branch: $branch"
  echo "- Commit SHA: $local_sha"
  echo ""
  echo "## Deployment Checks"
  echo "- Preflight: PASS"
  echo ""
} > "$report_path"

scripts/deploy/verify_live_versions.sh >> "$report_path"

echo ""
echo "## Final Result" >> "$report_path"
echo "- PASS (verification script completed)" >> "$report_path"

echo ""
cat "$report_path"
