# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are working on this repository as a senior engineer.
This operating manual applies to all tasks. Optimize for clarity, control, and minimal token usage. Avoid overengineering.

────────────────────────────────────────
## MODEL USAGE (COST-AWARE)
────────────────────────────────────────

**Principle**: Use the cheapest model that is fit for the task.

### Model Selection Guide

**Haiku** (Lowest cost - simple, deterministic work):
- SQL aggregation queries (SUM, COUNT, GROUP BY)
- CRUD endpoints (GET, POST, PATCH, DELETE)
- Database schema updates (add tables, columns)
- Simple data transformations
- Logging and tracking implementations
- Static data seeding

**Sonnet** (Default - moderate complexity):
- Integration-heavy logic (OpenAI, external APIs)
- Streaming implementations (SSE, WebSocket)
- Complex business logic with edge cases
- Multi-step orchestration
- Context-aware AI prompts
- Authentication/security logic

**Opus** (Highest cost - only when necessary):
- Architecture design for new features
- Complex cross-cutting decisions
- Detailed multi-phase planning
- Critical refactoring with high risk

### Rules

1. **Never switch models silently**
   - State which model you're using and why
   - If escalating, explain the complexity that requires it

2. **Default to lowest viable model**
   - Start with Haiku for backend CRUD work
   - Escalate to Sonnet only when integration/streaming needed
   - Escalate to Opus only for architectural decisions

3. **Switch back after complex tasks**
   - If you used Opus for planning, switch to Sonnet for execution
   - If you used Sonnet for streaming, switch to Haiku for CRUD

4. **If in doubt**
   - Explain why a stronger model is required
   - Ask permission before escalating
   - Err on the side of cheaper models

────────────────────────────────────────
## DOCUMENTATION (LIGHTWEIGHT BUT MANDATORY)
────────────────────────────────────────

Before writing or modifying code:

1) Ensure these files exist (create if missing, update if present):
   - `docs/IMPLEMENTATION_LOG.md`
   - `docs/ARCHITECTURE_AND_AI_LOGIC.md`

2) `IMPLEMENTATION_LOG.md` is a **concise running log**.
   Only log non-trivial steps:
   - what / why
   - files involved
   - key API examples or outputs
   - notes useful for debugging

   Maintain a short section:
   ### Decision Log
   - decision made
   - option A vs option B (1–2 lines each)
   - why A was chosen
   - when to revisit

3) `ARCHITECTURE_AND_AI_LOGIC.md` explains:
   - overall structure (client / server / shared)
   - main data flows
   - where AI is used vs not used
   - key assumptions and limitations

Keep both files **short, factual, and skimmable**.

────────────────────────────────────────
## FILES & DATA HANDLING
────────────────────────────────────────

- Assume referenced files exist if paths are given:
  - CSVs → `attached_assets/`
  - images → `design_assets/`
- For CSV analysis:
  - read **only first 20 rows**
  - expand only if needed
- Do not paste large raw file contents.

Images are **context only**:
- no redesign
- keep UI consistent
- app name is **RitualFin**

────────────────────────────────────────
## EXECUTION RULES
────────────────────────────────────────

- Do not change code unless explicitly asked.
- Before changing code:
  - list files to change
  - explain why (briefly)
  - wait for confirmation
- Prefer small, reversible steps.

────────────────────────────────────────
## RESPONSE STYLE
────────────────────────────────────────

- Be concise and practical.
- Avoid unnecessary explanations.
- No speculation without stating assumptions.
- End with:
  - current findings
  - next recommended step
  - whether approval is needed.

────────────────────────────────────────
## PROJECT OVERVIEW
────────────────────────────────────────

RitualFin is a personal finance management application built for Portuguese (Brazil) users with EUR currency. The app follows a "Lazy Mode" philosophy - automating as much categorization and processing as possible to minimize manual work.

## Development Commands

### Running the Application
```bash
npm run dev              # Start dev server (Express + Vite HMR on port 5000)
npm run dev:client       # Client-only dev mode (if needed)
npm run build            # Build for production (client + server bundle)
npm start                # Run production build
npm run check            # TypeScript type checking
```

### Database
```bash
npm run db:push          # Push schema changes to PostgreSQL (no migrations)
```

**Important**: This project uses `drizzle-kit push` for schema updates, NOT traditional migrations. The schema is in `shared/schema.ts`, and changes are applied directly to the database.

### Deployment

**Architecture**: Single deployment on Vercel (Frontend + Server Actions) with Neon PostgreSQL.

```
┌─────────────┐         ┌─────────────┐
│   Vercel    │ ──────> │    Neon     │
│ (App Router)│  HTTPS  │  (Database) │
│ Next.js 15+ │   PG    │  PostgreSQL │
└─────────────┘         └─────────────┘
```

**Required Environment Variables**:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `AUTH_SECRET` - Secret for Auth.js v5
- `AUTH_GOOGLE_ID` - Google OAuth Client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth Client Secret
- `OPENAI_API_KEY` (optional) - For AI features

**Key Points**:
- Next.js App Router handles both UI and Backend logic (Server Actions)
- Drizzle ORM used for database operations
- Auth.js v5 for authentication
- Deployed entirely on Vercel


## Architecture

### Structure
- **`src/app/`** - Next.js App Router pages and API routes
- **`src/components/`** - React components (UI and shared)
- **`src/lib/`** - Core business logic, DB schema, and utilities
  - **`actions/`** - Server Actions (Backend logic replacement)
  - **`db/`** - Drizzle ORM schema and connection
  - **`ingest/`** - CSV parsing logic (Sparkasse, Amex, M&M)
  - **`rules/`** - Categorization rules engine
- **`scripts/`** - Utility scripts for seeding and data management

### TypeScript Path Aliases
- `@/*` → `src/*`

### Key Technologies
- **Frontend**: Next.js 15+, React 19, Tailwind CSS v4, shadcn/ui, Lucide icons
- **Backend/API**: Next.js Server Actions & API Routes
- **Authentication**: Auth.js v5 (NextAuth) with Google Provider
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **AI**: OpenAI API for categorization suggestions

## Core Data Model

### Schema Location
All database tables are defined in `src/lib/db/schema.ts` using Drizzle ORM.

### Key Tables
- **`users`** - User profiles and Auth.js integration
- **`transactions`** - Canonical ledger with categorization and metadata
- **`ingestion_batches`** - History of file uploads/imports
- **`ingestion_items`** - Individual records extracted before commit
- **`rules`** - Keyword-based categorization rules
- **`taxonomy_*`** - Multi-level category definitions
- **`accounts`** - Financial accounts (Bank, Credit Card, etc.)

## Ingestion Flow

1. User uploads a CSV file (Sparkasse, Amex, or Miles & More) via `/uploads`
2. `uploadIngestionFile` Server Action parses the file using `src/lib/ingest`
3. Forensic fingerprinting prevents duplicates at the `ingestion_items` level
4. User reviews the "Preview" in the UI
5. `commitBatch` Server Action processes items:
   - Applies deterministic rules first
   - Uses AI (OpenAI) as fallback for categorization
   - Normalizes descriptions and extracts metadata
6. Transactions are saved to the `transactions` table

## Key Pages

- **`/dashboard`** - Spending overview, balance tracking, and monthly health
- **`/transactions`** - Searchable ledger of all financial activities
- **`/uploads`** - File ingestion and import history
- **`/confirm`** - Review queue for low-confidence categorizations
- **`/rules`** - Management of auto-categorization keywords
- **`/calendar`** - Recurring payment tracking and visualization
- **`/settings`** - User preferences and system configuration

## Development Notes

### Environment Variables
- `DATABASE_URL` - Neon PostgreSQL connection string (required)
- `AUTH_SECRET` - NextAuth secret (required for prod)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` - Google OAuth credentials
- `OPENAI_API_KEY` - Optional, for AI-powered categorization

### Locale & Currency
- Default currency: **EUR**
- Primary Locale: **Portuguese (Brazil) - pt-BR**
- Supports: EN (English), DE (German)

## Testing Approach
- **E2E Testing**: Playwright configured in `playwright.config.ts`
- **Manual QA**: Verification via the confirm queue and history logs
- **Type Safety**: Full TypeScript integration across the stack

