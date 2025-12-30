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

## Architecture

### Monorepo Structure
- **`client/`** - React frontend (Vite)
- **`server/`** - Express backend (TypeScript ESM)
- **`shared/`** - Shared types and database schema (Drizzle ORM)
- **`script/`** - Build scripts

### TypeScript Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

### Key Technologies
- **Frontend**: React 19, Wouter (routing), TanStack Query, shadcn/ui, Tailwind CSS v4
- **Backend**: Express, Passport (local auth), OpenAI API
- **Database**: PostgreSQL via Drizzle ORM
- **Build**: Vite (client), esbuild (server)

## Core Data Model

### Schema Location
All database tables are defined in `shared/schema.ts` using Drizzle ORM with PostgreSQL enums.

### Transaction Categorization System
Transactions use a hierarchical categorization model:
- `type`: "Despesa" (Expense) | "Receita" (Income)
- `fix_var`: "Fixo" (Fixed) | "Variável" (Variable)
- `category_1`: Primary category (see `category1Enum` in schema)
- `category_2`: Optional subcategory (free text)

Special transaction flags:
- `internal_transfer`: Marks internal account movements (excluded from budgets)
- `exclude_from_budget`: Manual per-transaction budget exclusion
- `needs_review`: True when transaction requires manual confirmation
- `manual_override`: User has manually edited categorization

### Key Tables
- **`transactions`** - Canonical ledger with categorization fields
- **`rules`** - Keyword-based auto-categorization rules (AI-assisted)
- **`uploads`** - CSV import history with status tracking
- **`budgets`** - Monthly budget targets per category
- **`calendar_events`** - Recurring payment tracking
- **`goals`** - Monthly financial targets with category breakdowns

## CSV Import Flow

1. User uploads Miles & More bank CSV via `/uploads` page
2. Backend parses CSV using `server/csv-parser.ts`
3. Each transaction is processed through `server/rules-engine.ts`:
   - Keyword matching against user rules
   - AI-powered keyword suggestion (OpenAI API)
   - Bulk categorization for multiple similar transactions
4. Transactions with low confidence → `needs_review = true`
5. User reviews and confirms via `/confirm` page
6. Confirmed transactions update existing rules or create new ones

### CSV Parser
- Expects Miles & More format (Portuguese headers)
- Required columns: "Authorised on", "Amount", "Currency", "Description", "Payment type", "Status"
- Generates unique `key` field for duplicate detection (user_id + date + desc + amount)

### Rules Engine
- Matches keywords using normalized text (uppercase, no accents)
- Priority-based rule application (higher priority wins)
- "Strict" rules auto-categorize without review
- Confidence levels (0-100) determine if review is needed

## API Structure

All backend routes are in `server/routes.ts`:

**Authentication** (auto-creates demo user if missing):
- `POST /api/auth/login` - Login/create user
- `GET /api/auth/me` - Get current user

**Core Features**:
- `GET /api/uploads` - List upload history
- `POST /api/uploads/process` - Process CSV file
- `GET /api/transactions` - List transactions (with filters)
- `GET /api/transactions/confirm-queue` - Get pending review items
- `POST /api/transactions/bulk-confirm` - Batch confirmation
- `GET /api/rules` - List categorization rules
- `POST /api/rules` - Create new rule
- `GET /api/dashboard` - Monthly spending overview with projections

**AI Features**:
- `POST /api/ai/suggest-keyword` - Get AI keyword suggestion for transaction
- `POST /api/ai/bulk-categorize` - Categorize multiple similar transactions at once

## Frontend Pages

Located in `client/src/pages/`:
- **`dashboard.tsx`** - Monthly spending overview with budget projections
- **`uploads.tsx`** - CSV file upload interface
- **`confirm.tsx`** - Transaction confirmation queue (needs_review items)
- **`rules.tsx`** - Manage categorization rules
- **`calendar.tsx`** - Recurring payment tracking
- **`goals.tsx`** - Monthly budget planning
- **`ai-keywords.tsx`** - Bulk AI-powered keyword analysis

## Development Notes

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `OPENAI_API_KEY` - For AI categorization features
- `NODE_ENV` - Set automatically by scripts

### Authentication
The app currently uses a simplified auth system that auto-creates a "demo" user. All data is scoped to `userId` in database queries.

### Session Storage
- Development: In-memory store (memorystore)
- Production: Should use connect-pg-simple with PostgreSQL

### Build Process
`script/build.ts` performs a two-stage build:
1. Vite builds client → `dist/`
2. esbuild bundles server → `dist/index.cjs` (with select deps bundled to reduce cold start time)

### AI Integration
The app uses OpenAI API for:
- **Keyword suggestion**: Analyzing transaction descriptions to suggest categorization keywords
- **Bulk categorization**: Processing multiple similar transactions at once
- Users must provide their own OpenAI API key in settings

### Currency & Locale
- Default currency: EUR
- Locale: Portuguese (Brazil) - pt-BR
- Date format: DD.MM.YYYY (Miles & More format)

## Testing Approach

When adding tests, note:
- No test framework is currently configured
- Manual testing via `/confirm` queue is primary validation
- Database operations use Drizzle ORM typed queries
