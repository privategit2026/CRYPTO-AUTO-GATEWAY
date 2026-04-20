---
mode: agent
model: gpt-4o
description: Write Vitest + Supertest integration tests for all backend API routes
tools:
  - read_file
  - create_file
  - run_in_terminal
---

# Task: Backend Integration Tests — Supertest (GPT-4o)

Write Vitest integration tests using Supertest for all API routes.

## Setup

Create `server/src/tests/integration/setup.ts`:
- Connect to test PostgreSQL (DATABASE_URL env var)
- Run migrations before all tests
- Seed a test admin user: `{ email: "test@admin.com", password: "TestPass123!" }`
- Clean relevant tables after each test suite

## Auth routes — `server/src/tests/integration/auth.test.ts`

```
POST /api/v1/auth/login
  ✓ returns 200 + accessToken + refreshToken for valid credentials
  ✓ returns 401 for wrong password
  ✓ returns 422 for missing email
  ✓ returns 429 after 10 failed attempts (rate limit)

POST /api/v1/auth/refresh
  ✓ returns new accessToken for valid refreshToken
  ✓ returns 401 for expired/invalid refreshToken
```

## Users routes — `server/src/tests/integration/users.test.ts`

```
GET /api/v1/users
  ✓ returns 200 + paginated list (requires auth)
  ✓ returns 401 without token

POST /api/v1/users
  ✓ creates a user, returns 201
  ✓ returns 409 for duplicate email
  ✓ returns 422 for invalid body

PATCH /api/v1/users/:id
  ✓ updates user, returns 200
  ✓ returns 404 for non-existent id

DELETE /api/v1/users/:id
  ✓ deletes user, returns 204
```

## Wallets routes — `server/src/tests/integration/wallets.test.ts`
Same CRUD pattern as users.

## Deposits routes — `server/src/tests/integration/deposits.test.ts`

```
GET /api/v1/deposits — paginated list
POST /api/v1/deposits — create deposit
PATCH /api/v1/deposits/:id — update status
```

## API Keys routes — `server/src/tests/integration/apiKeys.test.ts`

```
POST /api/v1/api-keys — creates key, returns raw key ONCE in response
GET /api/v1/api-keys  — lists keys (hashes only, no raw)
DELETE /api/v1/api-keys/:id — revokes key
```

## Dashboard route — `server/src/tests/integration/dashboard.test.ts`

```
GET /api/v1/dashboard/stats
  ✓ returns counts for users, wallets, deposits, transactions
  ✓ returns totalVolume as number
```

## Rules
- All tests use a real test database (from env DATABASE_URL)
- Reset data between suites using Prisma `deleteMany`
- Run tests sequentially (`--pool=forks --sequence=sequential`)
- JWT token obtained fresh in each suite via login helper
- Run `cd server && npm test` — must pass with zero errors
