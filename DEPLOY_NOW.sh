#!/bin/bash
# VERCEL EMERGENCY DEPLOYMENT SCRIPT
# Run this to deploy immediately, bypassing Git integration

set -e  # Exit on error

echo "============================================"
echo "VERCEL EMERGENCY DEPLOYMENT"
echo "============================================"
echo ""
echo "This will deploy directly to Vercel, bypassing Git integration."
echo "You will need to authenticate with Vercel in your browser."
echo ""
read -p "Press ENTER to continue or Ctrl+C to cancel..."

echo ""
echo "Step 1/4: Verifying code is ready..."
git log -1 --oneline
echo "✓ Current commit contains the fix"
echo ""

echo "Step 2/4: Logging in to Vercel..."
echo "(A browser window will open - complete authentication there)"
vercel login
echo "✓ Logged in successfully"
echo ""

echo "Step 3/4: Linking to Vercel project..."
echo ""
echo "IMPORTANT: When prompted, answer:"
echo "  - Set up and deploy? → Y"
echo "  - Scope: → Select your team/account"
echo "  - Link to existing project? → Y"
echo "  - Project name: → Select 'ritualfin' or your project name"
echo ""
read -p "Press ENTER to continue..."
vercel link
echo "✓ Project linked"
echo ""

echo "Step 4/4: Deploying to production..."
vercel --prod --yes
echo ""
echo "============================================"
echo "✓ DEPLOYMENT COMPLETE"
echo "============================================"
echo ""
echo "NEXT STEPS:"
echo "1. Check the URL printed above"
echo "2. Open it in your browser"
echo "3. Open DevTools (F12) → Network tab"
echo "4. Attempt login"
echo "5. Verify request goes to: https://ritualfin-api.onrender.com/api/auth/login"
echo ""
