# Architecture Documentation: RitualFin Rebuild

## Overview
This document outlines the transition from the legacy "Hackathon" architecture to a production-grade Next.js Fullstack application.

## 1. High-Level Comparison

| Component | Current State (Legacy) | Target State (Rebuild) | Benefit |
|-----------|------------------------|------------------------|---------|
| **Frontend** | React SPA (Vite + Wouter) | Next.js 15 (App Router) | Server Components (RSC), SEO, Performance |
| **Backend** | Node.js Express Monolith | Next.js Server Actions & Route Handlers | Type-safety, Co-location, No custom server |
| **Database** | Postgres (Render) | Postgres (Neon Serverless) | Branching, Autoscaling, Serverless-ready |
| **ORM** | Drizzle ORM | Drizzle ORM | (Unchanged - Excellent choice) |
| **Auth** | Custom Passport (Sessions) | Auth.js (NextAuth) v5 | Security best practices, Less code |
| **Deploy** | Render Web Service | Vercel | Ephemeral Previews, Edge Network |

## 2. Directory Structure

### Legacy
```
/client       # React Code
/server       # Express Code
/shared       # Schema & Types
```

### Target
```
/app                 # Next.js App Router
  /api               # Route Handlers (Public API / Webhooks)
  /(dashboard)       # Protected Routes (Dashboard, Transactions)
  /(auth)            # Auth Routes (Login, Signup)
/src
  /lib
    /db              # Drizzle Config & Schema
    /ingest          # Import Logic (Screenshot, CSV)
    /rules           # Deterministic Engine
  /components        # UI Primitives & Features
```

## 3. Key Patterns

### Data Fetching
- **Legacy**: Client `useEffect` -> `fetch('/api/...')`
- **Target**: Server Components `await db.select(...)`. No API layer for internal data needed.

### Mutations
- **Legacy**: `fetch('/api/xyz', { method: 'POST' })`
- **Target**: Server Actions `export async function saveTransaction(data) { 'use server'; ... }`

### Ingestion Pipeline
- **Legacy**: Complex stateful streams in Express.
- **Target**:
    1. **Upload**: Client uploads directly to Blob/R2 (for screenshots) or Server Action (small CSVs).
    2. **Process**: Server Action triggers `IngestionService`.
    3. **State**: Saved to `ingestion_batches` table immediately (Async/Queue conceptual model for scale).

## 4. Environment Strategy
- **Local**: `.env.local` points to Neon Dev Branch.
- **Preview**: Vercel automatically creates Neon Branch per PR.
- **Production**: Vercel triggers `db:migrate` on promote.
