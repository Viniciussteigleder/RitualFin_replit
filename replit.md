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

- **Frontend**: Vercel (ritual-fin-replit.vercel.app) - auto-deploys from main branch
- **Backend**: Render (ritualfin-api.onrender.com) - auto-deploys from main branch
- **Database**: Render PostgreSQL (dpg-d5e6moje5dus73es5aug-a, Frankfurt region)
- **Development DB**: Replit PostgreSQL (helium)

### Authentication
- **Google OAuth**: Configured with passport-google-oauth20
  - Callback URL: `https://ritualfin-api.onrender.com/api/auth/google/callback`
  - Credentials stored in Replit Secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  - Note: OAuth only works in production (Render) due to callback URL mismatch with Replit
- **Traditional login**: Username/password with bcrypt
- **Demo mode**: Fallback to demo user for unauthenticated access

### User Isolation
- `getAuthenticatedUser()`: Returns null if not authenticated
- `getAuthenticatedUserOrDemo()`: Returns demo user as fallback for testing
- All API endpoints use user-scoped queries

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Build Tool**: Vite

**Key Pages**:
- `/login` - Simple authentication
- `/dashboard` - Monthly spending overview with projections
- `/uploads` - CSV file import interface
- `/confirm` - Transaction confirmation queue (needs_review items)
- `/rules` - Categorization rule management

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON API under `/api/*` prefix
- **Development**: Vite middleware integration for HMR

**API Endpoints**:
- Auth: `/api/auth/login`, `/api/auth/me`
- Uploads: `/api/uploads`
- Transactions: `/api/transactions`, `/api/transactions/confirm-queue`
- Rules: `/api/rules`
- Dashboard: `/api/dashboard`

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
- Development: `npm run dev` starts Express with Vite middleware
- Production build: `npm run build` creates `dist/` with bundled server and client
- Database sync: `npm run db:push` applies schema changes

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