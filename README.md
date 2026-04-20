# CryptoGate Admin

CryptoGate Admin is a production-style, frontend-only admin dashboard for managing a mock crypto payment gateway. It is designed as a polished static React app with realistic local data, reusable UI components, and CRUD flows that can later be connected to real services.

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- React Router
- Zustand
- Lucide icons

## Current Scope

This project is intentionally frontend-only.

- No backend
- No API calls
- No blockchain logic
- No persistence beyond in-memory Zustand state
- Static-build friendly
- Mock data only

All create, edit, delete, filter, sort, and status-change actions update local state instantly for the current browser session.

## Folder Structure

```text
src/
  components/      Reusable app shell, table, forms, filters, badges, toast, and empty states
  mock/            Static sample data for deposits, wallets, users, transactions, API keys, and activity
  pages/           Dashboard and admin management pages
  store/           Zustand store and mock CRUD actions
  App.tsx          Routes, app shell, and toast provider
  main.tsx         React entry point
  index.css        Tailwind import and global base styles
```

## Available Pages

- Dashboard: summary cards, recent deposits, network activity, and system status
- Deposits: searchable, filterable, sortable mock deposit ledger with add, edit, delete, and simulated confirmation
- Wallets: wallet inventory with add, edit, delete, assignment, status, and network filters
- Users: user directory with roles, statuses, add, edit, delete, and frontend validation
- Transactions: mock transaction monitoring
- API Keys: mock key management
- Activity: mock operational activity log
- Settings: local UI-only settings controls

## Mock CRUD Behavior

The core management pages use Zustand for in-memory CRUD:

- `addDeposit`, `updateDeposit`, `deleteDeposit`, `confirmDeposit`
- `addWallet`, `updateWallet`, `deleteWallet`
- `addUser`, `updateUser`, `deleteUser`

Forms validate required fields on the frontend. Delete actions use confirmation dialogs. Successful actions show toast feedback. Refreshing the browser resets data to the mock seed state.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Future Integration Notes

The current Zustand actions are intentionally shaped like frontend service operations, so a future backend integration can replace local state updates with API-backed calls without changing most page-level UI code. Suggested future additions include authentication, persisted settings, real transaction ingestion, role-based access control, and backend-backed audit logs.
