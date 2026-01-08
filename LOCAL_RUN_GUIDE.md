# RitualFin Local Development & Integration Guide

This guide ensures your account is correctly connected to **Vercel** and **Neon**, and provides steps to run the application locally.

## 1. Account Connections & Extensions

I have automated the following for your account:
- **VS Code Extensions**: Created `.vscode/extensions.json` with recommendations for:
    - `Vercel` (official)
    - `Neon Postgres` (official)
    - `Drizzle All-in-One`
    - `Tailwind CSS IntelliSense`
- **Project Extensions**: Added `@neondatabase/serverless` to ensure high-performance database connections when deploying to Vercel.
- **Verification**: Confirmed that your project is linked to Vercel account `viniciussteigleder-5797` and Neon project `RitualFin`.

## 2. Local Setup (One-time)

Ensure your environment variables are synced from Vercel:

```bash
# 1. Login to Vercel (if not already)
vercel login

# 2. Sync environment variables to .env.local
# This pulls secrets managed on Vercel to your local machine
vercel env pull .env.local
```

## 3. Database Migration

Since you are using Neon, ensure your database schema is up to date:

```bash
# Push your current schema to Neon
npm run db:push

# (Optional) Open Drizzle Studio to view your data
npm run db:studio
```

## 4. Running the App Locally

To start the development server:

```bash
# Install dependencies (if you haven't recently)
npm install

# Start the Next.js development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Troubleshooting Extensions

- **Vercel Extension**: Link your account in VS Code to see deployment status and logs directly in the editor.
- **Neon Extension**: Use the SQL editor in VS Code to query your Neon database without leaving the IDE.
- **Chrome Extension**: Install the [Vercel Chrome Extension](https://vercel.com/docs/concepts/deployments/vercel-toolbar) to see the Vercel Toolbar on your preview and production sites.
