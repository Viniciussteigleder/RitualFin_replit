# RitualFin

## Overview

RitualFin is a personal finance management web application designed for minimalist, audit-friendly expense tracking. The application is built for Portuguese (Brazil) users with EUR currency, focusing on a "Lazy Mode" philosophy where the app automates as much categorization and processing as possible.

The core workflow centers around:
1. Uploading bank CSV files (Miles & More, American Express, Sparkasse formats)
2. Automatic transaction processing with AI-powered + rule-based categorization
3. Manual confirmation queue for unresolved items
4. Dashboard with budget projections and spending breakdowns

## User Preferences

Preferred communication style: Simple, everyday language.

## Deployment Architecture (January 2026)

- **Platform**: Vercel (ritual-fin-replit.vercel.app)
- **Framework**: Next.js 15+ (App Router)
- **Database**: Neon PostgreSQL
- **Environment**: Single deployment (Frontend + Server Actions)

### Authentication
- **Auth.js v5 (NextAuth)**: Google Provider
- **Traditional login**: Credentials provider with bcryptjs
- **Session management**: Database sessions via Drizzle Adapter

### User Isolation
- Multi-tenant architecture using `userId` in all schemas.
- Middleware handles session validation and redirection.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15+ (React 19)
- **Routing**: Next.js App Router
- **State Management**: React Server Components + Client-side State with React Query
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Icons**: Lucide React

### Backend Architecture
- **Environment**: Next.js Edge/Serverless Runtime
- **API Pattern**: Server Actions & Next.js API Routes
- **Database Access**: Drizzle ORM (PostgreSQL)
- **Security**: Auth.js with Middleware protection

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for validation
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Generated via `drizzle-kit push`

**Core Tables**:
- `users` - Authentication
- `uploads` - Import history with status tracking
- `transactions` - Canonical ledger with categorization fields
- `rules` - Keyword-based auto-categorization rules
- `budgets` - Monthly budget targets per category

### Transaction Categorization Model
Transactions use a multi-level category system:
- `type`: Despesa (Expense) | Receita (Income)
- `fix_var`: Fixo (Fixed) | Variável (Variable)
- `category_1`: Primary categories (Moradia, Mercado, Transporte, etc.)
- `category_2`: Optional subcategory

Special flags:
- `internal_transfer`: Marks internal movements (excluded from budget)
- `exclude_from_budget`: Per-transaction budget exclusion toggle
- `needs_review`: Items requiring manual confirmation

### Build & Deployment
- Development: `npm run dev` starts Next.js in development mode
- Production build: `npm run build` creates `.next/` production artifacts
- Database sync: `npm run db:push` applies schema changes directly to Neon via Drizzle-kit

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- **Session Store**: connect-pg-simple for Express sessions

### UI Libraries
- **Radix UI**: Full primitive set for accessible components
- **Lucide React**: Icon library
- **date-fns**: Date formatting and manipulation
- **embla-carousel-react**: Carousel component
- **vaul**: Drawer component
- **react-day-picker**: Calendar component
- **recharts**: Chart visualization
- **cmdk**: Command palette

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner
- **esbuild**: Server bundling for production