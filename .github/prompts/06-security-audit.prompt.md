---
mode: agent
model: o3
description: Full security audit — OWASP Top 10, dependency vulnerabilities, JWT config, CORS, secrets
tools:
  - read_file
  - grep_search
  - run_in_terminal
---

# Task: Security Audit (o3)

Audit the entire CryptoGate codebase for security vulnerabilities. Focus on OWASP Top 10.

## Files to audit

### Backend
- `server/src/middleware/auth.ts` — JWT verification
- `server/src/routes/*.ts` — route exposure, missing auth
- `server/src/controllers/*.ts` — input handling, SQL injection via Prisma
- `server/src/config/env.ts` — env variable validation
- `server/src/lib/redis.ts` — connection security
- `server/src/utils/password.ts` — hashing strength
- `server/src/utils/apiKey.ts` — key entropy, hashing
- `server/src/utils/jwt.ts` — algorithm (must be HS256 minimum), expiry

### Frontend
- `src/hooks/useFetch.ts` — token storage (localStorage vs httpOnly cookie)
- `src/pages/Login.tsx` — XSS, CSRF
- `src/App.tsx` — auth guard coverage

## Checklist

### A01 — Broken Access Control
- [ ] Every non-public route has JWT middleware
- [ ] PATCH/DELETE check ownership or admin role
- [ ] No IDOR (sequential IDs exposed without ownership check)

### A02 — Cryptographic Failures
- [ ] JWT uses HS256 or RS256 (never `none`)
- [ ] JWT secret is ≥ 64 chars from env
- [ ] Passwords hashed with bcrypt rounds ≥ 12
- [ ] API keys SHA-256 hashed, never stored raw

### A03 — Injection
- [ ] All Prisma queries use parameterized inputs (no raw SQL)
- [ ] All request bodies validated with Zod before use

### A05 — Security Misconfiguration
- [ ] Helmet enabled with good defaults
- [ ] CORS restricted to ALLOWED_ORIGINS env var
- [ ] No default credentials in seed file committed

### A07 — Auth Failures
- [ ] Rate limit on login endpoint
- [ ] Refresh tokens are rotated or revoked on logout
- [ ] Token expiry is short (≤ 15m access, ≤ 7d refresh)

### A09 — Logging Failures
- [ ] No passwords, tokens, or API keys in log output
- [ ] Error messages don't leak stack traces to client

## Output format

For each finding:
```
SEVERITY: HIGH | MEDIUM | LOW | INFO
FILE: server/src/...
LINE: ~42
ISSUE: Description of the vulnerability
FIX: Concrete code fix or configuration change required
```

After auditing, apply fixes directly to the files. Then run:
`cd server && npm run typecheck && npm run lint` — must pass.
