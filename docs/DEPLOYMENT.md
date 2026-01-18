# Deployment Guide

## Quick Reference

### Verify What's Deployed

```bash
# Check deployed commit SHA
curl -s https://ritual-fin-replit.vercel.app/api/health | jq '.build'

# Compare with local
git rev-parse HEAD | cut -c1-7
```

### Force Redeploy

1. **Via Vercel Dashboard**: Project → Deployments → "..." → Redeploy
2. **Via Git**: Push any commit to `main`
3. **Clean build**: Vercel Dashboard → Settings → General → "Clear Build Cache"

## Deployment Architecture

```
GitHub (main branch)
        ↓
   Vercel Build
        ↓
   Production
```

- **Production Branch**: `main`
- **Auto-Deploy**: Enabled for all pushes to `main`
- **Preview**: Enabled for PRs

## Build Metadata

The `/api/health` endpoint returns:

```json
{
  "status": "ok",
  "timestamp": "2026-01-18T...",
  "build": {
    "sha": "abc1234",
    "shaFull": "abc1234567890...",
    "branch": "main",
    "env": "production",
    "node": "v20.x.x"
  }
}
```

## Common Issues

### Changes Not Appearing

1. **Check branch**: Are changes on `main`? (`git log origin/main --oneline -5`)
2. **Check deployment**: Vercel Dashboard → Deployments → Latest should match your commit
3. **Check build**: Look for build errors in Vercel logs
4. **Clear cache**: Browser hard refresh (Cmd+Shift+R) or Vercel cache clear

### Toasts Not Showing

The `<Toaster>` component must be in `src/app/layout.tsx`. Without it, all `toast.*` calls silently fail.

### Upload Errors Silent

If uploads fail without error messages:
1. Check browser console for JS errors
2. Check Vercel function logs
3. Verify Toaster is rendered

## Parity Verification

Run locally to compare local vs deployed:

```bash
# Get deployed SHA
DEPLOYED=$(curl -s https://ritual-fin-replit.vercel.app/api/health | jq -r '.build.shaFull')

# Get local main SHA
LOCAL=$(git rev-parse origin/main)

# Compare
if [ "$DEPLOYED" = "$LOCAL" ]; then
  echo "✓ Parity OK: $DEPLOYED"
else
  echo "✗ Mismatch!"
  echo "  Deployed: $DEPLOYED"
  echo "  Local:    $LOCAL"
fi
```

## Environment Variables

Required in Vercel:
- `DATABASE_URL` - Neon PostgreSQL connection
- `AUTH_SECRET` - NextAuth secret
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` - OAuth

Optional:
- `OPENAI_API_KEY` - AI categorization

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Changes not live | Wrong branch | Merge to main |
| Build fails | Type errors | Fix locally, push |
| Stale content | Cache | Clear Vercel cache |
| No toasts | Missing Toaster | Add to layout.tsx |
| DB errors | Wrong DATABASE_URL | Check Vercel env vars |
