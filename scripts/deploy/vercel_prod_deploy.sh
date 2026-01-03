#!/bin/sh
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Install with: npm install -g vercel"
  exit 1
fi

if ! vercel whoami >/dev/null 2>&1; then
  echo "Logging in to Vercel..."
  vercel login
fi

if [ ! -d .vercel ]; then
  echo "Linking this directory to your Vercel project..."
  vercel link
fi

echo "Deploying to Vercel production..."
vercel --prod --yes
