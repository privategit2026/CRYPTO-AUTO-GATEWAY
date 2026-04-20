# CryptoGate Admin — Backend API

Production-structured REST API for the CryptoGate Admin frontend.

Stack: **Node.js + TypeScript + Express + PostgreSQL + Prisma + Zod + JWT + bcrypt + Redis + pino**.

## Quick start

```bash
# 1. Install deps
cd server
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL and JWT_*_SECRET

# 3. Migrate + seed the database
npm run db:migrate   # creates tables from prisma/schema.prisma
npm run db:seed      # populates demo data

# 4. Run the API
npm run dev          # http://localhost:4000
```

The server prints `CryptoGate API listening` and is ready at `/api/health`.

## Folder structure

```
server/
├─ prisma/
│  ├─ schema.prisma       Models, enums, indexes
│  └─ seed.ts             Demo data aligned with frontend mocks
├─ src/
│  ├─ app.ts              Express wiring: helmet, CORS, rate-limit, routes
│  ├─ server.ts           HTTP listener + graceful shutdown
│  ├─ config/
│  │  └─ env.ts           Zod-validated environment loader
│  ├─ lib/
│  │  ├─ prisma.ts        Shared PrismaClient singleton
│  │  ├─ redis.ts         Optional cache (no-op when REDIS_URL missing)
│  │  ├─ logger.ts        pino logger (pretty in dev, JSON in prod)
│  │  ├─ activityLogger.ts  Audit-log helper used across modules
│  │  └─ apiResponse.ts   { success, message, data, meta } envelope
│  ├─ middleware/
│  │  ├─ authMiddleware.ts   JWT bearer auth
│  │  ├─ rbac.ts             Role-based access control
│  │  ├─ validate.ts         Zod body/query/params parser
│  │  ├─ requestContext.ts   Attaches X-Request-Id
│  │  └─ errorHandler.ts     Global error → JSON
│  ├─ modules/
│  │  ├─ auth/        login, register, me, refresh, logout
│  │  ├─ users/       CRUD + search/filter/sort/pagination
│  │  ├─ wallets/     CRUD + filter by network/status/assignee
│  │  ├─ deposits/    CRUD + status state-machine (advance-status)
│  │  ├─ dashboard/   summary, recent-deposits, network-health
│  │  ├─ apiKeys/     CRUD (secure gen + hash + one-time plaintext)
│  │  └─ activity/    Audit log list/detail
│  ├─ types/          Express Request augmentation
│  └─ utils/          errors, jwt, password, pagination, apiKey
└─ tests/             vitest + supertest smoke tests
```

## npm scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Watch-mode TS runtime via tsx |
| `npm run build` | Compile to `dist/` |
| `npm run start` | Run compiled server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Run vitest suite |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:migrate:deploy` | Prisma migrate deploy (production) |
| `npm run db:push` | Push schema without migration history (ephemeral envs) |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:reset` | Drop + re-create + seed (destructive, dev only) |
| `npm run db:studio` | Prisma Studio UI |

## Environment variables

See `.env.example` for the full list. Required: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. Optional: `REDIS_URL`, `CORS_ORIGINS` (comma-separated).

## Response envelope

Every endpoint returns the same JSON shape:

```jsonc
{
  "success": true,
  "message": "Deposits fetched successfully",
  "data": [ /* items */ ],
  "meta": { "page": 1, "limit": 20, "total": 124, "totalPages": 7 }  // lists only
}
```

Errors:

```jsonc
{ "success": false, "code": "NOT_FOUND", "message": "Deposit not found." }
```

## Authentication

`POST /api/auth/login` returns an access + refresh JWT:

```jsonc
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "ADMIN", ... },
    "accessToken": "ey...",
    "refreshToken": "ey..."
  }
}
```

Use `Authorization: Bearer <accessToken>` on every subsequent call.
Tokens expire per `JWT_ACCESS_TTL` (default `15m`) — refresh via
`POST /api/auth/refresh`.

## Roles

Four tiers, highest first:

| Role | Can |
| --- | --- |
| `SYSTEM_ADMIN` | Everything |
| `ADMIN` | Manage users, wallets, deposits, API keys |
| `MANAGER` | Operational records (wallets, deposits); cannot touch users or API keys |
| `VIEWER` | Read-only |

## Deposit status state machine

`PENDING → DETECTED → CONFIRMING → COMPLETED`

`POST /api/deposits/:id/advance-status` moves a deposit one step forward.
`COMPLETED` is terminal (no-op). `FAILED` / `EXPIRED` are unhappy-path
terminal states and are not advanced by the helper.

## Endpoint summary

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`  *(public by default — lock down in prod)*
- `GET  /api/auth/me`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Users *(admin+)*
- `GET    /api/users?search=&role=&status=&sortBy=&sortOrder=&page=&limit=`
- `GET    /api/users/:id`
- `POST   /api/users`
- `PATCH  /api/users/:id`
- `DELETE /api/users/:id`

### Wallets *(manager+ for mutations)*
- `GET    /api/wallets?search=&network=&status=&assignedUserId=&unassigned=`
- `GET    /api/wallets/:id`
- `POST   /api/wallets`
- `PATCH  /api/wallets/:id`
- `DELETE /api/wallets/:id`

### Deposits *(manager+ for mutations)*
- `GET    /api/deposits?search=&network=&status=&userId=&sortBy=&sortOrder=`
- `GET    /api/deposits/:id`
- `POST   /api/deposits`
- `PATCH  /api/deposits/:id`
- `DELETE /api/deposits/:id`  *(admin+)*
- `POST   /api/deposits/:id/advance-status`

### Dashboard
- `GET    /api/dashboard/summary`
- `GET    /api/dashboard/recent-deposits?limit=8`
- `GET    /api/dashboard/network-health`

### API Keys *(admin+)*
- `GET    /api/api-keys?search=&status=`
- `GET    /api/api-keys/:id`
- `POST   /api/api-keys` — *response includes `key` (plaintext) exactly once*
- `PATCH  /api/api-keys/:id`
- `DELETE /api/api-keys/:id`

### Activity
- `GET /api/activity?search=&category=&severity=&actorUserId=&sortOrder=`
- `GET /api/activity/:id`

## Production deployment

1. `npm ci` on the CI runner.
2. `npm run build` — emits `dist/`.
3. `npm run db:migrate:deploy` against your production database.
4. `node dist/server.js` behind your load balancer / reverse proxy.
5. Set `NODE_ENV=production`, real `JWT_*_SECRET`, and a production
   `DATABASE_URL` and `REDIS_URL`.

## Testing

```bash
npm test
```

Covers JWT round-trip, API-key generator, deposit state machine,
pagination defaults, Zod validation edges, health route, and a guarded
route returning 401 when unauthenticated. Full end-to-end tests against a
real database can be layered on later with `testcontainers` or a dedicated
Postgres in CI.
