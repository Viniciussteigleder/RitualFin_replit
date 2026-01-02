# Security Policy

## 🚨 Current Security Status

**Production Readiness**: ❌ **NOT PRODUCTION READY**
**Suitable For**: Demo/Development with single trusted user only

RitualFin is currently in **Phase C (Pre-Production)** and has **known security limitations** that must be addressed before multi-user production deployment.

---

## Known Security Limitations

### Critical Limitations (Must Fix Before Production)

1. **No Authentication System**
   - Demo-only auth with hardcoded "demo" user
   - No session management
   - No password verification
   - All API endpoints are effectively public
   - **Status**: Planned for Phase D

2. **No Row Level Security (RLS)**
   - Database-level access control is disabled
   - All tables accessible with service role key
   - Application-level filtering only
   - **Status**: Planned for Phase D

3. **No Multi-User Support**
   - Single user architecture
   - All data belongs to "demo" user
   - Cannot isolate data between users
   - **Status**: Planned for Phase D

### High Priority Limitations

4. **Synchronous CSV Parsing**
   - Large files can block server
   - Timeout risk on serverless platforms
   - **Status**: Refactoring planned for Phase C.7

5. **Dependency Vulnerabilities (Audit)**
   - `xlsx` prototype pollution/ReDoS; no fix available in current version
   - `esbuild` dev-server exposure via `drizzle-kit` chain (dev-only)
   - **Status**: Mitigation required before production

6. **No Session Storage**
   - Cannot maintain persistent user sessions
   - No proper logout functionality
   - **Status**: Planned for Phase D

7. **Simplistic Duplicate Detection**
   - Can miss near-duplicates
   - Can block legitimate multiple transactions
   - **Status**: Improvement planned for Phase D

---

## Security Roadmap

### Phase D: Production Security (Planned)

**Timeline**: 2-3 weeks after Phase C completion

**Deliverables**:
1. ✅ Implement Supabase Auth (email/password)
2. ✅ Enable Row Level Security (RLS) on all tables
3. ✅ Add session management (express-session + PostgreSQL)
4. ✅ Implement proper password hashing (bcrypt/argon2)
5. ✅ Add CSRF protection
6. ✅ Add rate limiting
7. ✅ Security testing and audit

### Phase E: Advanced Security (Future)

**Timeline**: After Phase D completion

**Deliverables**:
1. ✅ Two-factor authentication (2FA)
2. ✅ Social login (Google, GitHub)
3. ✅ Penetration testing
4. ✅ Security monitoring and alerting
5. ✅ GDPR compliance features
6. ✅ Regular security audits

---

## Reporting a Vulnerability

If you discover a security vulnerability in RitualFin, please report it responsibly:

### For Critical Issues (Immediate Risk)

**Contact**: Open a GitHub Issue with label `security-critical`
**Response Time**: Within 24 hours

**Please Include**:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

### For Non-Critical Issues

**Contact**: Open a GitHub Issue with label `security-enhancement`
**Response Time**: Within 1 week

---

## Security Best Practices for Users

### Current System (Demo Mode)

1. **DO NOT use with sensitive financial data**
   - This is a demo/development system
   - No authentication or access control
   - Data is not encrypted at rest

2. **DO NOT deploy to public internet without**:
   - Completing Phase D security work
   - Changing default credentials
   - Enabling firewall/VPN restrictions

3. **DO use for**:
   - Personal demo/testing
   - Local development
   - Single-user prototyping
   - Learning/educational purposes

### After Phase D (Production Mode)

1. ✅ Use strong passwords (16+ characters)
2. ✅ Enable 2FA when available
3. ✅ Rotate database credentials regularly (every 90 days)
4. ✅ Keep dependencies updated
5. ✅ Monitor audit logs for suspicious activity
6. ✅ Use HTTPS only (enforced)

---

## Deployment Security

### Environment Variables

**NEVER commit these to version control**:
- `DATABASE_URL` - Database connection string
- `OPENAI_API_KEY` - OpenAI API key
- `SESSION_SECRET` - Session encryption key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key

**Safe to commit** (public values):
- `VITE_API_URL` - Frontend API base URL
- `CORS_ORIGIN` - CORS allowed origins

### Credential Rotation Schedule

| Credential | Rotation Frequency | Method |
|------------|-------------------|--------|
| Database Password | Every 90 days | Supabase Dashboard → Reset Password |
| OpenAI API Key | Every 90 days | OpenAI Dashboard → Revoke & Create |
| Session Secret | Every 30 days (prod) | Generate: `openssl rand -base64 32` |
| Service Role Key | After suspected leak | Supabase Dashboard → API Settings |

---

## Security Checklist

### Pre-Deployment (Current State)

- [x] Secrets in `.gitignore`
- [x] `.env.example` with placeholders
- [x] Security limitations documented
- [ ] Credentials rotated after exposure
- [ ] Pre-commit hooks for secret detection

### Phase D (Production Readiness)

- [ ] Supabase Auth implemented
- [ ] RLS enabled on all tables
- [ ] Session management configured
- [ ] Password hashing (bcrypt/argon2)
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Security audit completed
- [ ] Penetration testing passed

### Phase E (Advanced Security)

- [ ] 2FA implemented
- [ ] Social login options
- [ ] Security monitoring
- [ ] Audit logging
- [ ] GDPR compliance
- [ ] Regular security reviews

---

## Secure Development Guidelines

### For Contributors

1. **Never commit secrets**
   - Use `.env` for local secrets
   - Use `.env.example` for templates
   - Check with `git diff` before committing

2. **Validate all user input**
   - Use Zod schemas for validation
   - Sanitize SQL inputs (use Drizzle ORM)
   - Escape HTML output

3. **Follow principle of least privilege**
   - Use `anon` key for client-side
   - Use `service_role` key for backend only
   - Scope database queries to current user

4. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Fix high/critical vulnerabilities immediately
   - Review dependency changes before updating

---

## Security Contact

**Project Maintainer**: Vinicius Steigleder
**GitHub**: https://github.com/Viniciussteigleder/RitualFin_replit
**Security Issues**: Use GitHub Issues with `security` label

---

## Acknowledgments

We appreciate responsible disclosure of security issues. Contributors who report valid security vulnerabilities will be acknowledged in release notes (unless they prefer to remain anonymous).

---

**Last Updated**: 2026-01-02
**Next Review**: After Phase D completion
