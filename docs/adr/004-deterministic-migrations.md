# ADR 004: Deterministic Migrations & Env Separation

## Status
Accepted

## Context
The project suffers from "schema drift" where local DBs differ from Prod, and migrations are often run manually or interactively (`drizzle-kit push`).

## Decision
We will enforce **Deterministic Migrations**:
1. No `db:push`. Only `db:migrate` consuming `.sql` files.
2. Migrations are generated against the Dev Schema but applied transactionally.
3. CI/CD runs migrations *before* code deploy.

## Environment Separation
- **Preview**: Every Pull Request gets a dedicated Neon Branch.
- **Production**: Protected branch. Migration only via CI.
- **Local**: Developers connect to their own Neon Dev Branch (or a shared Dev), strictly separated from Prod.

## Consequences
- **Positive**: Zero surprises in Prod. "It works on my machine" is valid.
- **Negative**: Must write migration scripts (or generate them) and commit them. Slightly slower dev loop than `db:push`.
