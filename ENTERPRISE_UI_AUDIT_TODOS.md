# CryptoGate Admin - Enterprise Frontend UI Audit + TODO Backlog

This is a frontend-only audit of the current UI (pages + shared components). It lists remaining gaps and high-impact TODOs to push the dashboard into an enterprise-level admin experience while staying static-build friendly with mock data only.

## Current Coverage (What Exists Now)

Implemented patterns across the app:
- Premium dark shell (sidebar + sticky header) with active routes.
- Header search + Command Palette (Ctrl/Cmd+K) to jump to entity details.
- Notifications popover (derived from in-memory activity log) with unread state + mark-all-read.
- Page structure: `PageHeader`, summary stat cards, tabs, filter/search bar.
- Data view responsive rules:
  - Desktop: table
  - Tablet/mobile: card grid/list (no wide tables for core data)
- Mock CRUD (frontend-only, Zustand):
  - Deposits: add/edit/delete, confirm/advance status, details modal actions
  - Wallets: add/edit/delete, details modal actions
  - Users: add/edit/delete, details modal actions
  - API Keys: add/edit/delete, edit, revoke, rotate, details modal actions
- Shared UI components exist and are used across pages: `DataTable`, `Tabs`, `FilterBar`, `FormModal`, `ConfirmDialog`, `EmptyState`, `StatCard`, `StatusBadge`, `CopyButton`, `ToastProvider`.

## P0 - Must Fix (Enterprise Baseline)

### 1) Selection + details consistency (stale selection risk)
Several pages store `selectedX` as an object in local state. If the underlying list item changes in Zustand while the dialog is open, the dialog can show stale data.
- TODO: Standardize selection as `selectedId` per page and derive the selected record from Zustand each render.
- TODO: When a selected record is deleted, auto-close the details dialog gracefully.

### 2) Accessibility baseline (keyboard + focus)
- TODO: Tabs should support roving focus (ArrowLeft/ArrowRight moves focus) and Enter/Space selects.
- TODO: DataTable row-click remains heavy for keyboard users on large lists (every row is tabbable when `onRowClick` is used).
  - Option A: Make only the first cell a focusable "View details" button (still no edit/delete icons).
  - Option B: Keep row focusable but add `aria-label` per row and support `Home/End`.
- TODO: Popovers should set proper `aria-haspopup`, and anchors should own `aria-expanded`/`aria-controls` (today those props are on a wrapper).

### 3) Global search semantics (define enterprise behavior)
The header search currently acts as a Command Palette launcher.
- TODO: Decide and implement one enterprise-grade meaning:
  - Route-aware: affects current page filter state.
  - Global results: shows inline results dropdown (not just Ctrl+K).
  - Dedicated Search page with result groups + deep links.

## P1 - Enterprise Completeness + Workflow Polish

### 1) Tables: maturity features
- TODO: Add client-side pagination (page size selector, next/prev, “x-y of N”).
- TODO: Column visibility + density toggle (persist to localStorage).
- TODO: Export CSV (frontend-only) per list.

### 2) Details dialogs: maturity features
- TODO: Standardize one DetailsDialog footer pattern:
  - Primary actions (Confirm/Rotate/Save) vs destructive (Delete) spacing
  - “Copy all” for relevant entities (addresses/txids/keys)
- TODO: Add “Related records” blocks in details dialogs:
  - Deposit -> wallet/user references
  - Wallet -> assigned user
  - User -> owned wallets/deposits

### 3) Settings: enterprise behavior
- TODO: Add in-page validation + helper text for key settings fields (min/max deposit, confirmations, timeouts).
- TODO: Add per-section reset (General/Payments/Networks/Security).
- TODO: Add “last saved” indicator and mock audit event on save.

### 4) Notifications: enterprise behavior
Current notifications are activity-log entries with read state.
- TODO: Add severity/category filtering in the notifications popover.
- TODO: Add “snooze” (mock) and “copy event id” action.
- TODO: Add a dedicated Notifications page (optional) with full list + filters.

## P2 - Enterprise UX Extras (Optional, High Polish)

- TODO: Persist UI preferences in localStorage:
  - sidebar open/collapsed
  - last used filters per page
  - last active tabs
- TODO: Add bulk selection + bulk actions (optional per page).
- TODO: Add keyboard shortcuts overlay (modal).
- TODO: Add a “Help” menu (docs links placeholders, version info).
- TODO: Add skeleton states (for perceived performance) even though data is local.

## Page-by-Page Remaining Enhancements

### Dashboard (`src/pages/Dashboard.tsx`)
- TODO: Add “Recent activity” preview card (latest 5 events).
- TODO: Add quick navigation tiles: “Pending deposits”, “Revoked keys”, “Inactive users”.

### Deposits (`src/pages/Deposits.tsx`)
- TODO: Add pagination.
- TODO: Add “simulate status” explanatory text in details modal (what changes when advancing).

### Wallets (`src/pages/Wallets.tsx`)
- TODO: Add a details-modal quick action to change wallet status (active/used/inactive).
- TODO: Add an assigned-user picker (mock) rather than free text.

### Users (`src/pages/Users.tsx`)
- TODO: Add a role-change warning when demoting an admin.
- TODO: Add a mock “Reset password” action inside the details dialog.

### API Keys (`src/pages/ApiKeys.tsx`)
- TODO: Add expiration management (mock): extend expiry and show “expiring soon” badge.
- TODO: Add permission presets (read-only, full-access) for faster setup.

### Transactions (`src/pages/Transactions.tsx`)
- TODO: Add merchant/network summary blocks and pagination.

### Activity (`src/pages/Activity.tsx`)
- TODO: Add “export CSV” and pagination.

### Not Found (`src/pages/NotFound.tsx`)
- TODO: Add a list of suggested destinations based on routes.

## Cross-cutting QA Checklist

- TODO: Verify 360px, 768px, 1024px, 1280px breakpoints for every page.
- TODO: Verify there is no horizontal scrolling on mobile core views (lists use cards).
- TODO: Verify keyboard navigation for: sidebar, tabs, popovers, modals, dialogs.
- TODO: Verify lint/build pass: `npm run lint` + `npm run build`.

