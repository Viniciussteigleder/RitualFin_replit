# ADR 002: Auth.js (NextAuth) Replacement

## Status
Accepted

## Context
The current auth implementation uses `passport`, `express-session`, and custom cookie logic. This is a "roll your own crypto" risk. It places the burden of session fixation protection, CSRF token management, and cookie security flags entirely on the maintenance team.

## Decision
We will replace the custom auth stack with **Auth.js (formerly NextAuth) v5**.

## Consequences
- **Positive**:
    - Standard, battle-tested security (CSRF, encrypted cookies).
    - Built-in providers (Google, Email/Magic Link).
    - Database adapter (Drizzle) exists and is maintained.
- **Negative**:
    - Less granular control over the "Session" object (it's standardized).
    - Need to migrate existing users (password hashes must be compatible or reset).
- **Strategy**: We will keep the `users` table but let Auth.js manage `accounts` (OAuth links). We will use the Credentials provider to support existing bcrypt hashes if necessary, or force a password reset for security hygiene.
