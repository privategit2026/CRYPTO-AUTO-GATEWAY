---
mode: agent
model: gpt-4.1
description: Implement all backend API routes — auth, dashboard, users, wallets, deposits, transactions, api-keys, activity
tools:
  - read_file
  - replace_string_in_file
  - create_file
  - run_in_terminal
---

# Task: Build Complete Backend API (GPT-4.1)

You are implementing the complete Express + Prisma backend for the CryptoGate Admin Panel.

## What must be built

Create the following files inside `server/src/`:

### Routes (one file each)

- `routes/auth.ts` — POST /login, POST /refresh, POST /logout
- `routes/dashboard.ts` — GET /stats
- `routes/users.ts` — GET / POST / PATCH /:id / DELETE /:id
- `routes/wallets.ts` — GET / POST / PATCH /:id / DELETE /:id
- `routes/deposits.ts` — GET / POST / PATCH /:id
- `routes/transactions.ts` — GET / PATCH /:id
- `routes/apiKeys.ts` — GET / POST / DELETE /:id
- `routes/activity.ts` — GET /

### Controllers (one file each, matching routes)

- `controllers/authController.ts`
- `controllers/dashboardController.ts`
- `controllers/usersController.ts`
- `controllers/walletsController.ts`
- `controllers/depositsController.ts`
- `controllers/transactionsController.ts`
- `controllers/apiKeysController.ts`
- `controllers/activityController.ts`

### Middleware

- `middleware/auth.ts` — JWT verification middleware
- `middleware/validate.ts` — Zod schema validation wrapper
- `middleware/rateLimiter.ts`— express-rate-limit config

### Entry point

- `server.ts` — Express app setup, routes mounted at `/api/v1`, Helmet, CORS, pino-http logger

## Rules

- Use `sendSuccess`, `sendError`, `sendPaginated` from `src/lib/apiResponse.ts`
- Use `prismaClient` from `src/lib/prisma.ts`
- Validate all request bodies with Zod schemas
- All routes except `/api/v1/auth/login` require the JWT auth middleware
- Passwords hashed with bcrypt (rounds=12)
- API keys are SHA-256 hashed before storage
- Rate-limit `/api/v1/auth/login` to 10 req/min

## After implementing

Run: `cd server && npm run typecheck` — must pass with zero errors.
