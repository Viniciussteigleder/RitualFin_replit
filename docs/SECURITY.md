# Security Policy

## Authentication Model
- **Provider**: Auth.js (NextAuth) v5.
- **Methods**:
    - Google OAuth (Primary).
    - Email/Password (Legacy support via Credentials provider, bcrypt hashing).
- **Session Strategy**: Database Sessions (stored in Postgres). JWTs allowed for edge compatibility if needed, but DB preferred for revocation control.

## Authorization
- **Role Based Access Control (RBAC)**: Currently single role (User).
- **Row Level Security (RLS)**:
    - **Logical RLS**: All Drizzle queries MUST include `.where(eq(table.userId, ctx.userId))`.
    - **Database RLS**: Not enabled at Postgres level yet (future hardening).

## Data Protection
- **Secrets**: stored in Vercel Encrypted Env Vars.
- **OCR Data**: Receipt images are private user data. Accessible only via signed URLs (if utilizing object storage) or protected API routes.

## Ingestion Risks
- **Malicious CSV**: Parsers must strict-validate headers and row counts (limit 1000 rows/batch).
- **Image Bombs**: Screenshot upload size limited to 5MB.
