# Deployment Sync Checklist (Repo → Vercel)

## Goal
Ensure `main` in this repo is exactly what is running at `https://ritual-fin-replit.vercel.app`, and that production points to the intended database.

## 1) Confirm repo state
- `git status -sb` should show `main...origin/main` with no local changes (untracked files are OK but should not contain secrets).
- `git rev-parse HEAD` should match `git rev-parse origin/main`.

## 2) Confirm Vercel project linkage
- `cat .vercel/project.json` should match the intended Vercel project.
- `npx vercel env pull .env.vercel.production --environment=production --yes`

## 3) Confirm production DB target
- Check `DATABASE_URL` inside `.env.vercel.production` and compare to your expected Neon host.
- If you expect local and prod to be the same DB, align `.env.local` with the production `DATABASE_URL`.

## 4) Deploy the current repo state to production
- `npx vercel deploy --prod --yes`
- Then verify alias points to the new deployment:
  - `npx vercel inspect https://ritual-fin-replit.vercel.app --timeout 60`

## 5) Post-deploy sanity checks
- Open `https://ritual-fin-replit.vercel.app/settings/rules` and confirm:
  - No rules render without an App Category (fallback is `OPEN`).
  - Group expand/collapse works.

