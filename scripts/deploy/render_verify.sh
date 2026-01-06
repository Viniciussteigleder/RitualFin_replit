#!/bin/sh
set -euo pipefail

backend_url="${RENDER_SERVICE_URL-}"
if [ -z "$backend_url" ]; then
  backend_url="${VITE_API_URL-}"
fi

if [ -z "$backend_url" ]; then
  echo "Set RENDER_SERVICE_URL or VITE_API_URL to verify Render."
  exit 1
fi

base_url=${backend_url%/}
health_url="$base_url/api/health"
version_url="$base_url/api/version"

echo "Checking Render health: $health_url"
health_json=$(curl -fsS "$health_url")


echo "Checking Render version: $version_url"
version_json=$(curl -fsS "$version_url")

echo "Render health response: $health_json"
echo "Render version response: $version_json"
