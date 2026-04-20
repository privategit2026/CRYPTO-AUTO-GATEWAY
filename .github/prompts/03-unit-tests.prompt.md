---
mode: agent
model: gpt-4o
description: Write Vitest unit tests for all backend utilities and Zustand store actions
tools:
  - read_file
  - create_file
  - run_in_terminal
---

# Task: Unit Tests — Backend Utils + Frontend Store (GPT-4o)

Write complete Vitest unit tests for the following:

## Backend — `server/src/utils/`

### `server/src/utils/jwt.ts`
Create `server/src/tests/unit/jwt.test.ts`:
- Test `generateAccessToken(userId)` returns a valid JWT string
- Test `generateRefreshToken(userId)` returns a valid JWT string
- Test `verifyAccessToken(token)` returns correct payload
- Test `verifyAccessToken(invalidToken)` throws
- Test expired token is rejected

### `server/src/utils/password.ts`
Create `server/src/tests/unit/password.test.ts`:
- Test `hashPassword(plain)` returns a bcrypt hash (not equal to input)
- Test `comparePassword(plain, hash)` returns true for matching pair
- Test `comparePassword(wrong, hash)` returns false

### `server/src/utils/apiKey.ts`
Create `server/src/tests/unit/apiKey.test.ts`:
- Test `generateApiKey()` returns a string of expected length/format
- Test `hashApiKey(key)` returns a deterministic SHA-256 hex string
- Test two different keys produce different hashes

### `server/src/utils/pagination.ts`
Create `server/src/tests/unit/pagination.test.ts`:
- Test `parsePagination({ page: '2', limit: '10' })` returns `{ skip: 10, take: 10, page: 2 }`
- Test defaults when params are undefined
- Test clamps `limit` to a max of 100

## Frontend — `src/store/`

### `src/store/useStore.ts`
Create `src/tests/unit/useStore.test.ts`:
- Test initial state shape
- Test `addDeposit` action appends to deposits array
- Test `updateDepositStatus` changes a deposit's status
- Test `addWallet` action
- Test `deleteWallet` removes a wallet by id
- Test `addActivityLog` prepends to activityLog

## Rules
- Use `vitest` + `@testing-library/react` (for store tests only)
- No real DB or network calls — mock all external dependencies
- Each test file should have a `describe` block per function
- Run `npm test` in both root and `server/` at the end — must pass
