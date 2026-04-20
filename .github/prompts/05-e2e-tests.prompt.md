---
mode: agent
model: claude-sonnet
description: Write full Playwright E2E tests for login, deposits, wallets, users, and API keys flows
tools:
  - read_file
  - create_file
  - run_in_terminal
---

# Task: Playwright E2E Tests (Claude Sonnet)

Write complete end-to-end tests for all critical user flows in the CryptoGate Admin Panel.

## Setup

Create `playwright.config.ts` at the repo root:
```ts
// baseURL: process.env.E2E_BASE_URL || 'http://localhost:5174'
// Use Chromium + Firefox
// Reporter: html
// Trace: on-first-retry
// globalSetup: './e2e/global-setup.ts'
```

Create `e2e/global-setup.ts`:
- Call POST /api/v1/auth/login with test credentials
- Store auth token in `e2e/.auth/token.json`

Create `e2e/fixtures/auth.fixture.ts`:
- Extend Playwright test with an authenticated `page` that has the token set in localStorage

## Test Suites

### `e2e/tests/login.spec.ts`
```
✓ shows login form
✓ logs in with valid credentials, redirects to dashboard
✓ shows error for wrong password
✓ clears token and redirects to /login on 401
```

### `e2e/tests/dashboard.spec.ts`
```
✓ shows stat cards (Total Deposits, Volume, Wallets, Users)
✓ stat cards show non-zero numbers after seeding
✓ sidebar nav links all visible on desktop
✓ bottom nav visible on mobile viewport (375px)
✓ bottom nav Dashboard / Incoming / Logs / Wallets links work
```

### `e2e/tests/deposits.spec.ts`
```
✓ lists deposits table with rows
✓ can filter by status (Pending, Completed)
✓ can open "Add Deposit" form modal
✓ fills form and submits — new row appears in table
✓ can change deposit status via PATCH
```

### `e2e/tests/wallets.spec.ts`
```
✓ lists wallets with address and network columns
✓ can add a wallet (TRC20, test address)
✓ can edit a wallet
✓ can delete a wallet with confirm dialog
```

### `e2e/tests/users.spec.ts`
```
✓ lists users table
✓ can create a user
✓ can edit user role
✓ can delete a user
```

### `e2e/tests/api-keys.spec.ts`
```
✓ can generate an API key — raw key shown once in modal
✓ copy button copies key to clipboard
✓ key appears in list (masked)
✓ can revoke/delete an API key
```

### `e2e/tests/activity.spec.ts`
```
✓ activity log shows entries
✓ can filter by severity
✓ clicking a notification in header navigates to activity with correct item highlighted
```

## Rules
- Use `page.getByRole`, `page.getByLabel`, `page.getByTestId` — no CSS selectors
- Add `data-testid` attributes to key interactive elements as needed
- Mobile tests use `page.setViewportSize({ width: 375, height: 812 })`
- Each spec file is independent — no shared state between tests
- Run `npx playwright test` — must pass on Chromium
