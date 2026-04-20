# GitHub Copilot — Project Instructions

## Project: CryptoGate Admin Panel

Full-stack crypto payment gateway admin panel.

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Zustand + React Router v7
- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL + Redis + JWT
- **Testing**: Vitest (unit), Playwright (E2E)
- **Language**: TypeScript throughout

---

## Architecture Overview

```
/                       → Frontend (Vite React SPA)
  src/pages/            → Route-level page components
  src/components/       → Shared UI components
  src/store/            → Zustand state (useStore.ts, appSettings.ts)
  src/mock/             → Mock data (replace with real API calls)

/server/                → Backend (Express API)
  src/routes/           → Express routers (one file per resource)
  src/controllers/      → Business logic handlers
  src/middleware/        → Auth, rate-limit, error handling
  src/lib/              → Prisma client, Redis, logger
  src/utils/            → JWT, password, API key helpers
  prisma/schema.prisma  → PostgreSQL schema (source of truth)
```

---

## Coding Conventions

### TypeScript

- Strict mode is ON (`"strict": true`). No `any`.
- Use `zod` for all request body validation in the backend.
- Use named exports for components, default exports only for pages.

### React / Frontend

- Tailwind utility classes only — no inline styles, no CSS modules.
- Use `cx()` from `src/components/ui.ts` for conditional class names.
- All data fetching goes through a custom `useFetch` hook (to be created in `src/hooks/`).
- Replace mock data in `src/mock/` with real API calls once backend routes are available.
- Mobile-first: use `lg:` breakpoint for desktop-only layout (sidebar).

### Backend / API

- All responses use `apiResponse.ts` helpers: `sendSuccess`, `sendError`, `sendPaginated`.
- All routes require JWT auth middleware (`src/middleware/auth.ts`) unless marked public.
- Use Prisma transactions for any multi-table write.
- Passwords hashed with bcrypt (rounds = 12).
- API keys are SHA-256 hashed before storage.
- Rate-limit all public endpoints with `express-rate-limit`.

### Database

- Prisma is the single source of truth. Never write raw SQL.
- Always run `prisma migrate dev` to create migrations — never `db push` in production.
- Seed file: `server/prisma/seed.ts`.

### Security

- JWT secret from `process.env.JWT_SECRET` — never hardcode.
- CORS restricted to `process.env.ALLOWED_ORIGINS`.
- Helmet enabled on all routes.
- No secrets in source code or logs.

---

## AI Model Task Assignments

When working with multiple Copilot models/agents, assign work by domain:

| Domain                           | Recommended Model       | Notes                                          |
| -------------------------------- | ----------------------- | ---------------------------------------------- |
| Backend API routes & controllers | GPT-4.1 / Claude Sonnet | Strong at Node/Express/Prisma patterns         |
| Frontend React components & UI   | Claude Sonnet           | Strong at Tailwind, accessibility, React hooks |
| Database schema & migrations     | GPT-4.1                 | Precise SQL/Prisma schema generation           |
| Unit tests (Vitest)              | GPT-4o / Claude Haiku   | Fast, repetitive test generation               |
| E2E tests (Playwright)           | Claude Sonnet           | Complex user-flow scripting                    |
| Code review & security audit     | o3 / o1                 | Deep reasoning for security issues             |

---

## Key Environment Variables

```env
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:4000/api/v1

# Backend (server/.env)
DATABASE_URL=postgresql://user:password@localhost:5432/cryptogate
REDIS_URL=redis://localhost:6379
JWT_SECRET=<min-64-char-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
PORT=4000
NODE_ENV=development
```

---

## Completion Checklist (End-to-End)

### Backend — implement these routes

- [ ] `POST /api/v1/auth/login` — JWT login
- [ ] `POST /api/v1/auth/refresh` — refresh token
- [ ] `GET /api/v1/dashboard/stats` — summary stats
- [ ] `GET/POST/PATCH/DELETE /api/v1/users`
- [ ] `GET/POST/PATCH/DELETE /api/v1/wallets`
- [ ] `GET/POST/PATCH /api/v1/deposits`
- [ ] `GET/POST/PATCH /api/v1/transactions`
- [ ] `GET/POST/DELETE /api/v1/api-keys`
- [ ] `GET /api/v1/activity`

### Frontend — wire to real API

- [ ] Replace all `src/mock/*.ts` imports with `useFetch` hook calls
- [ ] Add login page (`/login`) and auth guard in router
- [ ] Show loading skeletons during data fetch
- [ ] Handle API errors with toast notifications

### Testing

- [ ] Unit tests for all utility functions in `server/src/utils/`
- [ ] Unit tests for Zustand store actions
- [ ] Integration tests for all API routes (Supertest + Vitest)
- [ ] E2E tests for: login, deposit flow, wallet CRUD, API key generation
