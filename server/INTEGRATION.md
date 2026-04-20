# Frontend integration notes

This document maps the existing Zustand mock store (`src/store/useStore.ts`)
to the real REST API. The frontend can be moved off mocks page-by-page with
minimal change.

## 1. API client setup

Create `src/lib/api.ts` in the frontend:

```ts
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('cg_access_token');

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...init.headers,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) throw new Error(body.message ?? 'Request failed');
  return body.data as T;
}
```

## 2. Model mapping

Backend field names match the frontend mocks for the most part; these
differences need a small adapter per module.

| Frontend mock | Backend API | Notes |
| --- | --- | --- |
| `Deposit.user` (string) | `Deposit.userDisplayName` | Backend also exposes `userId` (nullable) |
| `Deposit.date` | `Deposit.createdAt` | ISO string |
| `Wallet.user` (string) | `Wallet.assignedUser.name` | `assignedUserId` is nullable |
| `ApiKey.key` / `secret` | `ApiKey.keyPreview` | Plaintext only returned once at creation under `data.key` |
| `ActivityEntry.user` | `ActivityLog.actorName` | `actorUserId` available when known |
| `ActivityEntry.timestamp` | `ActivityLog.createdAt` | ISO string |
| `User.createdAt` (YYYY-MM-DD) | `User.createdAt` | ISO string — format on the client |

The frontend's enum values map case-insensitively to the backend Prisma
enums (e.g. frontend `'pending'` ↔ backend `'PENDING'`). Do a quick
`toUpperCase()` when writing, and `toLowerCase()` when reading if you want
to keep current components as-is.

## 3. Zustand action replacements

Each action in `useStore.ts` has a direct REST counterpart:

### Deposits
| Zustand | REST |
| --- | --- |
| `fetchDeposits` | `GET /deposits` |
| `addDeposit(d)` | `POST /deposits` |
| `updateDeposit(id, patch)` | `PATCH /deposits/:id` |
| `deleteDeposit(id)` | `DELETE /deposits/:id` |
| `confirmDeposit(id)` / `advanceDeposit(id)` | `POST /deposits/:id/advance-status` |

### Wallets
| Zustand | REST |
| --- | --- |
| `fetchWallets` | `GET /wallets` |
| `addWallet` | `POST /wallets` |
| `updateWallet` | `PATCH /wallets/:id` |
| `deleteWallet` | `DELETE /wallets/:id` |

### Users
| Zustand | REST |
| --- | --- |
| `fetchUsers` | `GET /users` |
| `addUser` | `POST /users` |
| `updateUser` | `PATCH /users/:id` |
| `deleteUser` | `DELETE /users/:id` |

### API keys
| Zustand | REST |
| --- | --- |
| `fetchApiKeys` | `GET /api-keys` |
| `createApiKey` | `POST /api-keys` — **stash the returned `key` immediately** |
| `updateApiKey` | `PATCH /api-keys/:id` |
| `revokeApiKey(id)` | `PATCH /api-keys/:id` with `{ status: 'REVOKED' }` |
| `deleteApiKey(id)` | `DELETE /api-keys/:id` |

### Activity
| Zustand | REST |
| --- | --- |
| `fetchActivity` | `GET /activity` |

The backend writes activity entries automatically on every
create/update/delete and every `advance-status` call — the frontend no
longer needs to push to an in-memory log.

### Dashboard
| Zustand | REST |
| --- | --- |
| `stats` computed locally | `GET /dashboard/summary` |
| `recentDeposits` slice | `GET /dashboard/recent-deposits?limit=8` |
| *(new)* network cards | `GET /dashboard/network-health` |

## 4. Auth flow

1. Login screen posts to `POST /auth/login`.
2. Persist `accessToken` + `refreshToken` (localStorage is fine for an
   internal admin app; migrate to HTTP-only cookies when exposed
   externally).
3. On 401 from any call, try `POST /auth/refresh` with the refresh token;
   on failure route the user back to login.
4. A `GET /auth/me` on app bootstrap keeps the Zustand user slice fresh.

## 5. Filter / sort / pagination

Every list endpoint accepts the same shared query contract:

```
?search=<free text>
&sortBy=<whitelisted field>
&sortOrder=<asc|desc>
&page=<1-based int>
&limit=<1..100>
```

Plus module-specific filters (`status`, `network`, `role`, etc.). The
response envelope includes `meta.totalPages` so the existing pagination UI
components (`PaginationControls.tsx`) can be wired up directly.

## 6. Recommended migration order

1. **Auth page** — replace the mock login with `POST /auth/login`.
2. **Dashboard** — easiest one-shot read endpoints.
3. **Users** — simple CRUD.
4. **Wallets** — CRUD + filter.
5. **Deposits** — CRUD + `advance-status` wiring.
6. **API keys** — one-time-key reveal UX is the only real change.
7. **Activity** — reads only; remove all the Zustand-side activity writes.

After each page is moved, its mock file under `src/mock/` can be deleted.

## 7. CORS

The dev server defaults to `http://localhost:5173` (Vite) and
`http://localhost:4173` (Vite preview). If you use a different port, set
`CORS_ORIGINS=http://localhost:PORT` in `server/.env`.
