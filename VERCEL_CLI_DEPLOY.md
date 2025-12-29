# Emergency Vercel CLI Deployment Instructions

## If Vercel Dashboard Won't Deploy Latest Commit

Run these commands in the repository root:

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel (opens browser)
vercel login

# 3. Link this directory to your Vercel project
vercel link
# When prompted:
#   - Set up and deploy? Y
#   - Scope: Select your team/account
#   - Link to existing project? Y
#   - Project name: Select "ritualfin" (or your project name)

# 4. Verify you're linked to correct project
vercel ls

# 5. Deploy to production
vercel --prod
# This will:
#   - Upload current code (with fix)
#   - Build on Vercel servers
#   - Deploy to production URL
#   - Bypass any Git integration issues

# 6. Verify deployment
# The command will output a URL like: https://ritual-fin-replit.vercel.app
# Open it and test login
```

## Verification After CLI Deploy

1. Check build output for:
   ```
   ✓ Built successfully
   ```

2. Open deployed URL in browser

3. DevTools → Network → Attempt login

4. Verify request goes to: `https://ritualfin-api.onrender.com/api/auth/login`

## If CLI Deploy Also Fails

The error message will tell you exactly what's wrong:
- Wrong project linked? Re-run `vercel link`
- Build errors? Check TypeScript/Vite errors
- Environment variables missing? Set via `vercel env add`
