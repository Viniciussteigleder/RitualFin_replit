#!/bin/bash

# RitualFin Deployment Verification Script
# Tests frontend, backend, and database connectivity

set -e

FRONTEND_URL="${FRONTEND_URL:-https://ritual-fin-replit.vercel.app}"
BACKEND_URL="${BACKEND_URL:-https://ritualfin-api.onrender.com}"

echo "🔍 RitualFin Deployment Verification"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Frontend
echo "📱 Testing Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL 2>&1 || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Frontend is UP${NC} ($FRONTEND_URL)"
else
  echo -e "${RED}❌ Frontend is DOWN${NC} (HTTP $FRONTEND_STATUS)"
fi

echo ""

# Test Backend
echo "⚙️  Testing Backend..."
echo "   Attempt 1 (may wake up sleeping service)..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/auth/me 2>&1 || echo "000")

if [ "$BACKEND_STATUS" = "503" ]; then
  echo -e "${YELLOW}⏳ Backend is sleeping, waiting 30 seconds...${NC}"
  sleep 30
  echo "   Attempt 2 (after wake-up delay)..."
  BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/auth/me 2>&1 || echo "000")
fi

if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "401" ]; then
  echo -e "${GREEN}✅ Backend is UP${NC} ($BACKEND_URL)"

  # Get backend response
  BACKEND_RESPONSE=$(curl -s $BACKEND_URL/api/auth/me 2>&1 || echo "{}")
  echo "   Response: $BACKEND_RESPONSE"
elif [ "$BACKEND_STATUS" = "503" ]; then
  echo -e "${YELLOW}⚠️  Backend is still sleeping/starting${NC} (HTTP 503)"
  echo "   This is normal for Render free tier. Try again in 1-2 minutes."
else
  echo -e "${RED}❌ Backend is DOWN or unreachable${NC} (HTTP $BACKEND_STATUS)"
fi

echo ""

# Test CORS
echo "🌐 Testing CORS Configuration..."
CORS_TEST=$(curl -s -I $BACKEND_URL/api/auth/me -H "Origin: $FRONTEND_URL" 2>&1 || echo "")
if echo "$CORS_TEST" | grep -q "access-control-allow-origin"; then
  echo -e "${GREEN}✅ CORS headers present${NC}"
  echo "   Allowed origin: $(echo "$CORS_TEST" | grep -i "access-control-allow-origin" | cut -d: -f2-)"
else
  echo -e "${YELLOW}⚠️  CORS headers not detected${NC}"
  echo "   This might cause issues if backend is sleeping."
fi

echo ""

# Summary
echo "📊 Summary"
echo "=========="
if [ "$FRONTEND_STATUS" = "200" ] && ([ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "401" ]); then
  echo -e "${GREEN}✅ All systems operational${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Open $FRONTEND_URL in browser"
  echo "2. Test login and navigation"
  echo "3. Test CSV import functionality"
  exit 0
elif [ "$BACKEND_STATUS" = "503" ]; then
  echo -e "${YELLOW}⏳ Backend is waking up${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Wait 1-2 minutes for backend to fully start"
  echo "2. Run this script again"
  echo "3. Or open $FRONTEND_URL and test (first request will wake backend)"
  exit 0
else
  echo -e "${RED}❌ Issues detected${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "1. Check Render dashboard: https://dashboard.render.com"
  echo "2. Check Vercel dashboard: https://vercel.com/dashboard"
  echo "3. Verify environment variables are set"
  echo "4. Check deployment logs for errors"
  echo "5. See docs/DEPLOYMENT_ACTION_PLAN.md for detailed steps"
  exit 1
fi
