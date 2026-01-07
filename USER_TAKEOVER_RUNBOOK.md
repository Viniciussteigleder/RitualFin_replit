# RitualFin User Takeover Runbook

## 1. Local Environment Setup (.env.local)

**ACTION:** Open `RitualFin_replit/.env.local` and REPLACE/UPDATE these values:

```bash
# Database (Render Production Instance)
# REQUIRED: Use this exact connection string to stop using Supabase locally
DATABASE_URL="<YOUR_RENDER_EXTERNAL_DB_URL>"

# Server Configuration
PORT=5001
NODE_ENV=development
# IMPORTANT: REMOVE VITE_API_URL if it exists (local dev uses Vite proxy to forward /api -> localhost:5001)

# Auth Configuration
SESSION_SECRET="dev-secret-local-only"
# Get these from Google Cloud Console (see Section 3)
GOOGLE_CLIENT_ID="<YOUR_CLIENT_ID>"
GOOGLE_CLIENT_SECRET="<YOUR_CLIENT_SECRET>"
# For local dev, frontend URL is localhost
FRONTEND_URL="http://localhost:5001"
```

## 2. Render Environment Variables (Backend)

**ACTION:** Go to Render Dashboard -> Environment -> Add/Edit:

**CRITICAL:** You must add `FRONTEND_URL` to match your `CLIENT_URL` because the code expects `FRONTEND_URL` for Google OAuth redirects.

| Key | Value / Instructions |
|-----|----------------------|
| `DATABASE_URL` | Use the internal connection string (starts with `postgres://`) or the external one above |
| `NODE_ENV` | `production` |
| `GOOGLE_CLIENT_ID` | From Google Cloud |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud |
| `FRONTEND_URL` | `https://ritual-fin-replit.vercel.app` (Same as CLIENT_URL) |
| `SESSION_SECRET` | Generate a long random string |
| `ALLOW_DEMO_AUTH_IN_PROD` | `false` (or remove; allow-list logic will handle OAuth) |

**Notes on Variables:**
- `CLIENT_URL` is likely unused by the backend code directly, but keeping it is fine.
- `ADMIN_API_KEY` is the correct name used in code. `ADMIN_KEY` appears unused but safe to keep.

## 3. Google Cloud Console Checklist

**ACTION:** Go to [Google Cloud Console](https://console.cloud.google.com/) -> APIs & Services -> Credentials.

1.  **Authorized JavaScript Origins**:
    *   `http://localhost:5001` (For local dev)
    *   `https://ritual-fin-replit.vercel.app` (For production)

2.  **Authorized Redirect URIs**:
    *   `http://localhost:5001/api/auth/google/callback` (Local)
    *   `https://ritualfin-api.onrender.com/api/auth/google/callback` (Production Backend URL)
    
    *Note: Since the backend handles the OAuth callback, use the Backend URL.*

## 4. Verification Steps

1.  **Local Logic Check**:
    ```bash
    npm run dev
    # Verify log output:
    # [DB] Selected provider: render
    # serving on port 5001 (printed EXACTLY ONCE)
    ```

2.  **API Smoke Test**:
    ```bash
    curl http://localhost:5001/api/health
    # Expect: {"status":"ok", "database":"connected", ...}
    ```

3.  **OAuth Smoke Test (Simulated)**:
    ```bash
    curl -v http://localhost:5001/api/auth/google
    # Expect: < HTTP/1.1 302 Found
    # Expect: < Location: https://accounts.google.com/o/oauth2/v2/auth...
    # (NOT "Demo auth is disabled")
    ```
