# RitualFin Runbook & Secrets Guide

## 1. Environment Variables Setup

### `AUTH_SECRET`
Required for session encryption.
**How to get it:**
Run this command in your terminal:
```bash
openssl rand -base64 32
```
Copy the output and paste it into `.env.local` as `AUTH_SECRET`.

### `DATABASE_URL`
Required for connecting to Neon Postgres.
**How to get it:**
1. Log in to the [Neon Console](https://console.neon.tech).
2. Select your project.
3. Go to **Dashboard**.
4. Under **Connection Details**, select "Pooled connection" to get the transaction pooler URL (fixes connection limit issues).
5. Copy the connection string (starts with `postgresql://...`).

### `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`
Required for "Login with Google".
**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "RitualFin").
3. Go to **APIs & Services** > **OAuth consent screen**.
   - User Type: **External**.
   - Fill in app name and email.
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized javascript origins**:
     - `http://localhost:3000` (Dev)
     - `https://ritual-fin-replit.vercel.app` (Prod)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://ritual-fin-replit.vercel.app/api/auth/callback/google`
5. Copy the **Client ID** (`AUTH_GOOGLE_ID`) and **Client Secret** (`AUTH_GOOGLE_SECRET`).

## 2. Local Development
Start the dev server:
```bash
npm run dev
# Or specific port:
PORT=3001 npm run dev
```

## 3. Deployment (Vercel)
Ensure all environment variables above are added to your Vercel Project Settings.
- `AUTH_URL` is not needed on Vercel (it detects it automatically).
- `AUTH_SECRET` MUST be set.
