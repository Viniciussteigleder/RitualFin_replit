# ADR 001: Migration to Next.js App Router

## Status
Accepted

## Context
The current application is a React SPA (Vite) with a separate Express backend. This separation causes:
- Duplicate typing (API contracts).
- Client-side bundles that are too large (`settings.tsx` > 100KB).
- Complexity in data fetching/caching logic.

## Decision
We will migrate to **Next.js 15 App Router**.

## Consequences
- **Positive**:
    - **Server Components**: Heavy logic (Settings, Dashboard calculations) moves to server.
    - **Server Actions**: Type-safe mutations without manual API routes.
    - **Performance**: Automatic code splitting and image optimization.
- **Negative**:
    - Strict Server/Client boundary requires learning curve.
    - Migration effort: "Page by Page" rewrite.
- **Mitigation**: We will construct the Next.js app in the root `app/` directory while leaving `client/` and `server/` untouched during the transition phase.
