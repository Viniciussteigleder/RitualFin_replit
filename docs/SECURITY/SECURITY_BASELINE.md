# Security Baseline

**Date**: 2026-01-02
**Version**: Phase C (Demo Auth)  **Status**: Production-ready with documented limitations

---

## Executive Summary

RitualFin is currently in **Phase C** with **demo authentication** enabled. This configuration is suitable for single-user deployments or development environments but NOT recommended for multi-user production use without additional security measures.

**Critical Limitation**: Demo authentication auto-creates a "demo" user with no password verification. All authenticated users share the same database access.

**Production Path**: Phase D will implement Supabase Auth with Row Level Security (RLS) for true multi-user support.

---

## Authentication & Authorization

### Current Implementation (Phase C)

**Demo Authentication**:
- Location: `server/auth.ts`
- Mechanism: Auto-creates user with username "demo" if it doesn't exist
- Login flow: ANY username/password combination succeeds (creates "demo" user)
- Session management: Express session with `connect-pg-simple` (PostgreSQL-backed sessions)

**Security Characteristics**:
✅ Sessions stored server-side in PostgreSQL (not client-side)
✅ Session secret configurable via `SESSION_SECRET` environment variable
✅ Cookies use `httpOnly` flag (XSS protection)
✅ CORS credentials enabled for cross-origin requests
❌ No password verification
❌ No user isolation (all users share "demo" user ID)
❌ No Row Level Security (RLS) on database

**Warning Banner**:
- Component: `client/src/components/auth-warning-banner.tsx`
- Displays prominent amber warning in demo mode
- User-dismissible (per session)
- Message: "Modo Demonstração: Este aplicativo usa autenticação simplificada. Não adequado para produção."

### Planned Upgrade (Phase D)

**Supabase Auth**:
- Email/password authentication
- Social login options (Google, GitHub)
- Row Level Security (RLS) policies
- User-scoped data isolation
- JWT-based session management

---

## Secrets Management

### Repository Scan Results

**Scan Date**: 2026-01-02
**Tools**: Manual grep with regex patterns
**Scope**: All source files (excluding node_modules, dist, .git)

**Results**: ✅ **No secrets found**

**Patterns Scanned**:
- API keys (`api_key`, `api-key`)
- Secret keys (`secret_key`, `secret-key`)
- Tokens (`token`, `sk-xxx`, `ghp_xxx`)
- Database URLs with embedded credentials
- Hardcoded passwords

**Client Bundle Scan**: ✅ **No secrets in dist/public/**

### Environment Variables (Secrets)

**Backend** (`server/`):
```bash
DATABASE_URL         # PostgreSQL connection string (Supabase Transaction Pooler)
SESSION_SECRET       # Session encryption key (min 32 chars recommended)
OPENAI_API_KEY       # Optional - for AI categorization features
CORS_ORIGIN          # Comma-separated allowed frontend origins
```

**Frontend** (`client/`):
```bash
VITE_API_URL         # Backend API URL (not a secret, but configuration)
```

**Best Practices**:
- ✅ All secrets stored in environment variables (not committed)
- ✅ `.env` file in `.gitignore`
- ✅ `.env.example` provided as template
- ✅ No secrets in client bundle
- ✅ Database connection uses Transaction Pooler (not direct connection)

---

## CORS Configuration

**Location**: `server/index.ts`

**Configuration**:
```typescript
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim())
  : ["http://localhost:5000", "http://localhost:5173"]; // Default: local dev

app.use(cors({
  origin: corsOrigins,
  credentials: true,          // Allow cookies for authentication
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

**Production Setup**:
```bash
# Render (Backend)
CORS_ORIGIN=https://ritualfin.vercel.app,https://ritualfin-git-main.vercel.app

# Multiple domains supported (comma-separated)
CORS_ORIGIN=https://app.ritualfin.com,https://ritualfin.com
```

**Security Characteristics**:
✅ Origin whitelist (no wildcard `*`)
✅ Credentials enabled for cookie-based auth
✅ Specific HTTP methods allowed
✅ Content-Type and Authorization headers allowed
✅ Environment-driven configuration
⚠️ Local development allows localhost origins by default

---

## Input Validation

### API Endpoints

**File Upload Validation**:
- Location: `server/routes.ts` - `/api/uploads/process`
- Validation:
  - ✅ File type check (CSV only via `.csv` extension)
  - ✅ File size limit (Express `body-parser` default 100kb for JSON, 50MB for raw)
  - ✅ CSV parsing with error handling (malformed CSV rejected)
  - ✅ Column header validation (required columns checked)
  - ✅ Data type validation (dates, amounts, transaction types)

**Transaction API**:
- SQL Injection: ✅ **Protected** (using Drizzle ORM with parameterized queries)
- XSS: ✅ **Mitigated** (React auto-escapes JSX, shadcn/ui components sanitize)
- Type validation: ✅ TypeScript schemas + Drizzle schema validation

**Rules API**:
- Keyword input: ✅ Stored as-is, normalized for matching (no eval/exec)
- Category names: ✅ Enum validation (category1Enum in schema)
- Priority: ✅ Number validation

### CSV Parser Validation

**Sparkasse**:
- Required columns validated
- Date format validation (DD.MM.YY)
- Amount parsing with error handling
- Diagnostic reporting on validation failures

**Amex**:
- German column header detection
- Date format: DD.MM.YYYY
- Amount format: German decimal (comma)

**Miles & More**:
- English column headers
- ISO date formats
- Standard decimal amounts

### Client-Side Validation

**Forms**:
- React Hook Form with Zod schemas (type-safe validation)
- shadcn/ui components with built-in validation
- Input sanitization via controlled components

---

## Database Security

### Current Configuration

**Connection Type**:
- ✅ Transaction Pooler (Supabase port 6543) - NOT direct connection
- ✅ SSL/TLS enforced (Supabase default)
- ✅ Connection pooling limits simultaneous connections

**Query Safety**:
- ✅ Drizzle ORM (parameterized queries, no string concatenation)
- ✅ TypeScript schemas enforce data types
- ✅ No raw SQL (except for specific optimized queries with parameterization)

**Data Access**:
- ⚠️ No Row Level Security (RLS) - planned for Phase D
- ⚠️ All users access same "demo" user data
- ✅ User ID scoping in application layer (userId filter in queries)

### Migration Strategy

**Current**: Drizzle Kit Push (schema changes applied directly)
**Future**: Consider migration files for production schema versioning

---

## Transport Security

### HTTPS/TLS

**Production**:
- ✅ Vercel enforces HTTPS (automatic SSL certificates)
- ✅ Render enforces HTTPS (automatic SSL certificates)
- ✅ Supabase enforces SSL/TLS for database connections

**Development**:
- ⚠️ HTTP only (localhost:5000)
- Acceptable for local development

### Security Headers

**Vercel** (via `vercel.json`):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

✅ **X-Content-Type-Options**: Prevents MIME type sniffing
✅ **X-Frame-Options**: Prevents clickjacking (DENY)
✅ **X-XSS-Protection**: Browser XSS filter enabled

**Additional Recommended Headers** (Future):
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- Permissions-Policy

---

## Third-Party Dependencies

### Dependency Security

**npm audit** (as of 2026-01-02):
- 10 vulnerabilities (2 low, 4 moderate, 4 high)
- Most are transitive dependencies (not directly used)
- Non-blocking for current phase

**Recommendations**:
- Run `npm audit fix` for non-breaking fixes
- Review high-severity vulnerabilities in transitive deps
- Consider upgrading major dependencies quarterly
- Use Dependabot or Snyk for automated vulnerability alerts

### OpenAI API Integration

**Security**:
- ✅ API key stored in environment variable (not committed)
- ✅ API calls server-side only (never from client)
- ✅ User input sanitized before sending to OpenAI
- ✅ Responses validated before storing in database

**Rate Limiting**:
- ⚠️ No application-level rate limiting yet
- Relies on OpenAI API rate limits
- Consider implementing per-user rate limits in Phase D

---

## Logging & Monitoring

### Current Logging

**Server**:
- Console logging for development (`console.log`, `console.error`)
- CSV parser diagnostics (encoding, delimiter, header validation)
- No centralized logging service

**Client**:
- React error boundaries (display errors, don't crash app)
- Toast notifications for user-facing errors

### Recommendations (Future)

**Backend**:
- Implement structured logging (Winston, Pino)
- Log to external service (Sentry, Datadog, CloudWatch)
- Log levels: ERROR, WARN, INFO, DEBUG
- Sanitize logs (no passwords, API keys)

**Frontend**:
- Error tracking (Sentry for React)
- User session replay (optional, privacy considerations)

---

## Known Security Limitations (Phase C)

| Issue | Severity | Impact | Mitigation | Phase D Solution |
|-------|----------|--------|------------|------------------|
| Demo auth (no password) | 🔴 Critical | Anyone can access data | Warning banner, single-user only | Supabase Auth |
| No RLS on database | 🔴 Critical | Shared data access | App-layer user scoping | Supabase RLS policies |
| No rate limiting | 🟡 Medium | API abuse possible | Reverse proxy limits | Application-level rate limits |
| No CSP headers | 🟡 Medium | XSS risk increased | React auto-escape mitigates | Add CSP header |
| No audit logging | 🟡 Medium | Can't track user actions | - | Implement audit log table |
| npm vulnerabilities | 🟡 Medium | Transitive dep risk | Regular audits | Automated Dependabot |

---

## Security Checklist

### Pre-Deployment

- [x] No secrets committed to repository
- [x] Environment variables documented
- [x] CORS configured for production domains
- [x] HTTPS enforced (Vercel/Render automatic)
- [x] Database uses Transaction Pooler (not direct connection)
- [x] Session secret is strong (32+ characters)
- [x] Demo auth warning banner visible
- [ ] npm audit reviewed and acceptable vulnerabilities documented
- [ ] Penetration testing (optional for Phase C)

### Post-Deployment

- [ ] Verify CORS in production (test from frontend)
- [ ] Verify session persistence across refreshes
- [ ] Test file upload limits
- [ ] Monitor error logs for security issues
- [ ] Review Supabase connection pool metrics

---

## Incident Response

### Security Contact

**For security issues**:
- Email: [TO BE CONFIGURED]
- GitHub Security Advisories: https://github.com/[REPO]/security/advisories

### Reporting Process

1. Do NOT open public GitHub issues for security vulnerabilities
2. Email security contact with:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested remediation (if any)
3. Expect response within 48 hours
4. Coordinated disclosure timeline: 90 days

---

## Compliance Notes

### GDPR Considerations

**Current State** (Phase C):
- Single-user deployment: Likely exempt (personal use)
- Multi-user deployment: ⚠️ GDPR applies

**Data Collected**:
- User session data (username, session ID)
- Financial transaction data (dates, amounts, merchant names)
- AI usage logs (prompts, responses)

**User Rights** (Phase D requirements):
- Right to access data (export feature)
- Right to deletion (account deletion + cascade)
- Right to portability (CSV/Excel export)
- Right to rectification (edit transactions)

### Financial Data Protection

**PCI-DSS**: ⚠️ **Not applicable** - app does NOT store credit card numbers, CVVs, or PINs
**Data Stored**: Transaction history from bank statements (post-transaction data only)

---

## Security Roadmap

### Phase D (Multi-User + Auth)

- [ ] Implement Supabase Auth (email/password)
- [ ] Enable Row Level Security (RLS) policies
- [ ] Add user registration/login flows
- [ ] Implement password reset
- [ ] Add account deletion
- [ ] Audit logging (user actions)

### Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] API rate limiting (per user)
- [ ] Content Security Policy (CSP)
- [ ] Automated security scanning (Snyk, Dependabot)
- [ ] Penetration testing
- [ ] Security headers audit
- [ ] SIEM integration (if enterprise)

---

**Last Updated**: 2026-01-02
**Next Review**: Before Phase D deployment or quarterly (whichever comes first)
