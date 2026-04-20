---
mode: agent
model: claude-sonnet
description: Wire all frontend pages to real API endpoints, replace mock data, add auth guard and login page
tools:
  - read_file
  - replace_string_in_file
  - create_file
  - run_in_terminal
---

# Task: Wire Frontend to Real API (Claude Sonnet)

You are replacing all mock data imports in the CryptoGate frontend with real API calls.

## Step 1 — Create the `useFetch` hook

Create `src/hooks/useFetch.ts`:
```ts
// Generic data-fetching hook
// - Reads VITE_API_BASE_URL from import.meta.env
// - Attaches JWT token from localStorage (key: "cg_token")
// - Returns { data, loading, error, refetch }
// - On 401 response: clear token and redirect to /login
```

## Step 2 — Create the `useApi` hook

Create `src/hooks/useApi.ts`:
```ts
// Mutation hook for POST/PATCH/DELETE
// - Returns { mutate(method, path, body), loading, error }
// - Handles optimistic updates via callback
```

## Step 3 — Add Login Page

Create `src/pages/Login.tsx`:
- Form: email + password fields
- On submit: POST /api/v1/auth/login
- On success: store JWT token in localStorage, redirect to /
- Show error toast on failure
- Tailwind styled, dark theme matching the rest of the app

## Step 4 — Auth Guard

Create `src/components/AuthGuard.tsx`:
- If no token in localStorage → redirect to /login
- Wrap all protected routes in App.tsx

## Step 5 — Replace mock data in each page

For each page, replace the mock import with a `useFetch` call:

| Page | Mock file | API endpoint |
|---|---|---|
| Dashboard.tsx | — | GET /api/v1/dashboard/stats |
| Deposits.tsx | mock/deposits.ts | GET /api/v1/deposits |
| Wallets.tsx | mock/wallets.ts | GET /api/v1/wallets |
| Users.tsx | mock/users.ts | GET /api/v1/users |
| Transactions.tsx | mock/transactions.ts | GET /api/v1/transactions |
| ApiKeys.tsx | mock/apiKeys.ts | GET /api/v1/api-keys |
| Activity.tsx | mock/activityLog.ts | GET /api/v1/activity |

## Step 6 — Loading skeletons

For each replaced page, show a skeleton loader (`animate-pulse` divs) while `loading === true`.

## Step 7 — Error handling

On API error show a toast: `showToast(error.message, 'error')` using the existing toast context.

## Rules
- No inline styles. Tailwind only.
- No `any` types in TypeScript.
- Keep existing UI layout — only replace the data source.
- Run `npm run build` at the end — must pass with zero errors.
