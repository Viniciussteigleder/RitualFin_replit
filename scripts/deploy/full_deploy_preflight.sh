#!/bin/sh
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is required for preflight."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required for preflight."
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

branch=$(git rev-parse --abbrev-ref HEAD)
if [ "${ALLOW_NON_MAIN-}" != "1" ] && [ "$branch" != "main" ]; then
  echo "Preflight failed: must be on main branch (current: $branch)."
  exit 1
fi

if [ "${ALLOW_DIRTY-}" != "1" ] && [ -n "$(git status --porcelain)" ]; then
  echo "Preflight failed: working tree is not clean."
  exit 1
fi

if [ -n "${VITE_API_URL-}" ]; then
  case "$VITE_API_URL" in
    */)
      echo "Preflight failed: VITE_API_URL must not end with a trailing slash."
      exit 1
      ;;
  esac
  case "$VITE_API_URL" in
    */api|*/api/*)
      echo "Preflight failed: VITE_API_URL must not include /api."
      exit 1
      ;;
  esac
fi

echo "Running TypeScript check..."
npm run check

echo "Running production build..."
npm run build

echo "Preflight complete."
