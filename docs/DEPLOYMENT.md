# RitualFin Deployment Guide

**Last Updated**: 2025-12-31
**Architecture**: Supabase (Database) + Render (Backend) + Vercel (Frontend)
**Source of Truth**: GitHub `main` branch

---

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│     Vercel      │  HTTPS  │      Render      │   PG    │    Supabase     │
│   (Frontend)    │ ──────► │    (Backend)     │ ──────► │   (Database)    │
│  React SPA      │         │   Express API    │         │   PostgreSQL    │
│  dist/public    │         │   dist/index.cjs │         │   Transaction   │
└─────────────────┘         └──────────────────┘         │     Pooler      │
                                                         └─────────────────┘
```

**Key Design Decisions:**
- Frontend calls backend via HTTPS (cross-origin)
- Backend handles all database operations
- Session-based auth (cookies with `credentials: include`)
- No serverless functions on Vercel (static SPA only)

---

## Environment Variables

### Vercel (Frontend)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `VITE_API_URL` | ✅ Yes | `https://ritualfin-api.onrender.com` | No trailing slash, no `/api` suffix |
| `VITE_APP_URL` | Optional | `https://ritualfin.vercel.app` | For OpenGraph image URLs |

**Important**: `VITE_API_URL` must NOT end with `/api`. The client code appends `/api` automatically.

### Render (Backend)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | ✅ Yes | `postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres` | Supabase Transaction Pooler (port 6543) |
| `CORS_ORIGIN` | ✅ Yes | `https://ritualfin.vercel.app,https://ritualfin-xxx.vercel.app` | Include preview URLs |
| `NODE_ENV` | ✅ Yes | `production` | |
| `SESSION_SECRET` | ✅ Yes | (random 32+ chars) | Generate with `openssl rand -base64 32` |
| `OPENAI_API_KEY` | Optional | `sk-...` | For AI categorization features |

---

## Standard Workflow

### Development

```bash
# 1. Clone and install
git clone https://github.com/your-org/ritualfin.git
cd ritualfin
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase DATABASE_URL

# 3. Apply schema
npm run db:push

# 4. Start development server
npm run dev
# Visit http://localhost:5000
```

### Deployment

1. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin main
   ```

2. **Backend (Render) auto-deploys** from `main` branch
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Wait ~3-5 minutes

3. **Frontend (Vercel) auto-deploys** from `main` branch
   - Build: `npm run build`
   - Output: `dist/public`
   - Wait ~2-3 minutes

4. **Verify deployment**
   ```bash
   # Backend health check
   curl -fsS https://ritualfin-api.onrender.com/api/health
   
   # Expected response:
   # {"status":"ok","timestamp":"...","database":"connected","version":"1.0.0"}
   ```

---

## Vercel Configuration

The `vercel.json` file uses `rewrites` (not `routes`) for SPA routing:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [...]
}
```

**Common Error**: `Cannot use 'routes' with 'rewrites'`
- **Fix**: Use only `rewrites`, never mix with legacy `routes` array
- The current config is correct and tested

---

## Frontend API Base URL Handling

The frontend (`client/src/lib/api.ts`) computes the API base URL as follows:

```typescript
function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (!envUrl) return "/api";  // Dev: relative URL
  
  const baseUrl = envUrl.replace(/\/+$/, "");  // Remove trailing slash
  
  if (baseUrl.endsWith("/api")) return baseUrl;  // Already has /api
  
  return `${baseUrl}/api`;  // Append /api
}
```

**Rules:**
- In development: Uses `/api` (same-origin, proxied by Vite)
- In production: Uses `VITE_API_URL` + `/api`
- If `VITE_API_URL` already ends with `/api`, doesn't append again

---

## CORS Configuration

The backend (`server/index.ts`) configures CORS based on `CORS_ORIGIN`:

```typescript
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim())
  : ["http://localhost:5000", "http://localhost:5173"];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

**For Vercel Preview Deployments:**
- Add wildcard or specific preview URLs to `CORS_ORIGIN`
- Example: `https://ritualfin.vercel.app,https://ritualfin-git-main-yourproject.vercel.app`

---

## Troubleshooting

### CORS Errors

**Symptoms**: Browser console shows `Access-Control-Allow-Origin` errors

**Solutions:**
1. Verify `CORS_ORIGIN` in Render includes the exact Vercel URL
2. Check for trailing slashes (don't include them)
3. For preview deployments, add preview URL patterns

### API Calls Return 404

**Symptoms**: Frontend loads but API calls fail

**Solutions:**
1. Verify `VITE_API_URL` in Vercel is set correctly (no trailing slash)
2. Check backend is running: `curl https://your-backend.onrender.com/api/health`
3. Ensure backend has completed deployment (Render shows "Live")

### Database Connection Timeout

**Symptoms**: 500 errors, "connection timeout" in Render logs

**Solutions:**
1. Use Transaction Pooler URL (port 6543), not direct connection
2. Check Supabase project isn't paused (free tier pauses after 7 days)
3. Verify `DATABASE_URL` format matches Supabase dashboard

### Vercel Build Fails

**Symptoms**: Vercel deployment fails with configuration errors

**Solutions:**
1. Ensure `vercel.json` doesn't mix `routes` with `rewrites/redirects/headers`
2. Check `outputDirectory` matches build output (`dist/public`)
3. Verify all environment variables are set in Vercel dashboard

### How to Find Deployed Commit

**Vercel:**
1. Dashboard → Deployments → Select deployment
2. Look for "Git Commit" section with SHA

**Render:**
1. Dashboard → Events tab
2. Each deployment shows commit SHA and message

---

## Vercel CLI Fallback

If Vercel Git integration fails:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from local
vercel --prod

# Link to existing project (if prompted)
vercel link
```

---

## QA Checklist

Before marking deployment complete:

- [ ] `npm run check` passes (no TypeScript errors)
- [ ] `npm run build` succeeds
- [ ] Backend health check returns `{"status":"ok","database":"connected"}`
- [ ] Frontend homepage loads
- [ ] Login flow works
- [ ] CSV upload processes successfully
- [ ] Dashboard displays data

**Runtime QA (if DATABASE_URL available):**
```bash
npm run dev
curl -fsS http://localhost:5000/api/health
```

---

## Cost Summary

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Supabase | Free | $0 |
| Vercel | Hobby | $0 |
| Render | Free | $0 |
| **Total** | | **$0/month** |

**Recommended Upgrades:**
- Render Starter ($7/mo): No cold starts
- Supabase Pro ($25/mo): 8GB database, better performance

---

## Security Checklist

- [ ] `SESSION_SECRET` is random 32+ character string
- [ ] `DATABASE_URL` uses Transaction Pooler (port 6543)
- [ ] `CORS_ORIGIN` only includes trusted domains
- [ ] No API keys in client-side code
- [ ] `.env` files are in `.gitignore`
- [ ] No secrets committed to repository
