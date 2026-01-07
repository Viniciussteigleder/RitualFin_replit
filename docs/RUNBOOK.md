
# RitualFin Operational Runbook

## 1. Environment Setup

### 1.1 Local Development
1. Copy `.env.example` to `.env.local`.
2. Fill in:
   - `DATABASE_URL`: Neon Connection string.
   - `AUTH_SECRET`: Generate via `openssl rand -base64 32`.
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`: From Google Cloud Console.
   - `OPENAI_API_KEY`: For AI features.

### 1.2 CI/CD (GitHub Actions)
RitualFin uses the **Vercel CLI** to securely fetch environment variables during CI. No production secrets are stored in GitHub.

#### Required GitHub Secrets:
- `VERCEL_TOKEN`: Personal Access Token from Vercel settings.
- `VERCEL_ORG_ID`: Your Vercel scope ID.
- `VERCEL_PROJECT_ID`: The Project ID (found in `.vercel/project.json`).

#### CI Workflow:
The CI pulls **Preview** environment variables into `.env.ci`.
```bash
vercel env pull --yes --environment preview .env.ci --token ${{ secrets.VERCEL_TOKEN }}
```

## 2. AI Features End-to-End
AI features are server-side only and use `gpt-4o-mini`.

### Features List:
- **Categorization**: `src/lib/ai/openai.ts`.
- **UI Screen**: `/ai-keywords`.
- **Database Schema**: `transactions.confidence`, `transactions.suggested_keyword`.

### Feature Flagging:
If `OPENAI_API_KEY` is missing:
- Server actions will return `null` or skip AI categorization.
- UI elements like "Run AI Analysis" will be disabled or show a warning.

### 1.3 Vercel Deployment Hardening
For **Auth.js v5** to work on Vercel, the following environment variables **MUST** be set in Vercel (Project Settings -> Environment Variables) for both **Production** and **Preview**:

- `AUTH_SECRET`: Generate locally and paste (must match across app instances if using cookies, but for database sessions it's the key for signing).
- `AUTH_URL`: `https://ritual-fin-replit.vercel.app` (No trailing slash).
- `AUTH_TRUST_HOST`: `true`
- `AUTH_GOOGLE_ID`: From Google Cloud.
- `AUTH_GOOGLE_SECRET`: From Google Cloud.
- `DATABASE_URL`: Connection string.

## 2. AI Features End-to-End
... (keep existing)

## 3. Google OAuth Setup
Ensure these Authorized Redirect URIs are in Google Cloud Console:
- `http://localhost:3000/api/auth/callback/google`
- `https://ritual-fin-replit.vercel.app/api/auth/callback/google`

### Troubleshooting "Configuration" Error:
1. **Logs**: Go to Vercel Dashboard -> Logs. Search for `/api/auth`.
2. **Diagnostic Endpoint**: Hit `https://ritual-fin-replit.vercel.app/api/auth/debug` to verify which env variables are detected by the server.
3. **Runtime**: Ensure `src/app/api/auth/[...nextauth]/route.ts` has `export const runtime = "nodejs"`.
4. **JavaScript Origins**: Ensure `https://ritual-fin-replit.vercel.app` is in Authorized JavaScript origins.

## 4. Deployment
Deployments are triggered by pushes to `main`.
Manual deployment: `vercel --prod --yes`.
