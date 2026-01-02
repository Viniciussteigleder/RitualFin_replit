#!/bin/sh
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is required for version verification."
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

local_sha=$(git rev-parse --short=12 HEAD)
branch=$(git rev-parse --abbrev-ref HEAD)
origin_sha=""
if git rev-parse --verify origin/main >/dev/null 2>&1; then
  origin_sha=$(git rev-parse --short=12 origin/main)
fi

backend_url="${RENDER_SERVICE_URL-}"
if [ -z "$backend_url" ]; then
  backend_url="${VITE_API_URL-}"
fi

frontend_url="${VERCEL_PROD_URL-}"

backend_health_json=""
backend_version_json=""
frontend_version_json=""

if [ -n "$backend_url" ]; then
  base_url=${backend_url%/}
  backend_health_json=$(curl -fsS "$base_url/api/health")
  backend_version_json=$(curl -fsS "$base_url/api/version")
fi

if [ -n "$frontend_url" ]; then
  frontend_base=${frontend_url%/}
  frontend_version_json=$(curl -fsS "$frontend_base/version.json")
fi

supabase_ref="${SUPABASE_PROJECT_REF-}"
if [ -z "$supabase_ref" ] && [ -n "${DATABASE_URL-}" ]; then
  supabase_ref=$(echo "$DATABASE_URL" | sed -n 's|.*postgres\.\([^:]*\):.*|\1|p')
fi
if [ -z "$supabase_ref" ] && [ -n "${DATABASE_URL-}" ]; then
  supabase_ref=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^./]*\)\.supabase\.co.*|\1|p')
fi

cat <<'EOM'
## Live Version Verification
EOM

echo "- GitHub branch: $branch"
echo "- GitHub SHA (local): $local_sha"
echo "- GitHub SHA (origin/main): ${origin_sha:-unknown}"
echo "- Render service URL: ${backend_url:-not_set}"
echo "- Vercel production URL: ${frontend_url:-not_set}"
echo "- Supabase project ref: ${supabase_ref:-unknown}"

echo ""
echo "### Render /api/health"
printf '%s\n' '```json'
echo "$backend_health_json"
printf '%s\n' '```'

echo "### Render /api/version"
printf '%s\n' '```json'
echo "$backend_version_json"
printf '%s\n' '```'

echo "### Vercel /version.json"
printf '%s\n' '```json'
echo "$frontend_version_json"
printf '%s\n' '```'
