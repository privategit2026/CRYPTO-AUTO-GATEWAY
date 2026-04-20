import { create } from 'zustand';
import { type ActivityEntry, activityLog as mockActivityLog } from '../mock/activityLog';
import { type ApiKey, apiKeys as mockApiKeys } from '../mock/apiKeys';
import { type Deposit, deposits as mockDeposits } from '../mock/deposits';
import { type Transaction, transactions as mockTransactions } from '../mock/transactions';
import { type User, users as mockUsers } from '../mock/users';
import { type Wallet, wallets as mockWallets } from '../mock/wallets';
import { type AppSettings, loadAppSettings, saveAppSettings } from './appSettings';

type CreateDeposit = Omit<Deposit, 'id'>;
type CreateWallet = Omit<Wallet, 'id'>;
type CreateUser = Omit<User, 'id'>;

interface StoreState {
  deposits: Deposit[];
  wallets: Wallet[];
  users: User[];
  transactions: Transaction[];
  apiKeys: ApiKey[];
  activityLog: ActivityEntry[];
  notificationReadIds: number[];
  appSettings: AppSettings;

  addDeposit: (deposit: CreateDeposit | Deposit) => Deposit;
  updateDeposit: (id: number, deposit: Partial<Deposit>) => void;
  deleteDeposit: (id: number) => void;
  confirmDeposit: (id: number) => void;

  addWallet: (wallet: CreateWallet | Wallet) => Wallet;
  updateWallet: (id: number, wallet: Partial<Wallet>) => void;
  deleteWallet: (id: number) => void;

  addUser: (user: CreateUser | User) => User;
  updateUser: (id: number, user: Partial<User>) => void;
  deleteUser: (id: number) => void;

  addApiKey: (apiKey: ApiKey) => void;
  updateApiKey: (id: number, apiKey: Partial<ApiKey>) => void;
  deleteApiKey: (id: number) => void;

  setAppSettings: (settings: AppSettings) => void;

  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
}

const nextId = <T extends { id: number }>(items: T[]) => Math.max(0, ...items.map((item) => item.id)) + 1;

const depositStatusFlow: Record<Deposit['status'], Deposit['status']> = {
  pending: 'detected',
  detected: 'confirming',
  confirming: 'completed',
  completed: 'completed',
};

const nowTimestamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

export const useStore = create<StoreState>((set, get) => ({
  deposits: mockDeposits,
  wallets: mockWallets,
  users: mockUsers,
  transactions: mockTransactions,
  apiKeys: mockApiKeys,
  activityLog: mockActivityLog,
  notificationReadIds: [],
  appSettings: loadAppSettings(),

  setAppSettings: (settings) => {
    set({ appSettings: settings });
    saveAppSettings(settings);
  },

  markNotificationRead: (id) =>
    set((state) =>
      state.notificationReadIds.includes(id)
        ? state
        : { notificationReadIds: [...state.notificationReadIds, id] },
    ),
  markAllNotificationsRead: () =>
    set((state) => ({ notificationReadIds: state.activityLog.map((entry) => entry.id) })),

  // Activity log is frontend-only: we append mock entries on user actions to support notifications and auditing.
  // This keeps the UI "enterprise-feel" without any backend.
  // NOTE: This is intentionally minimal and can be replaced by a real audit/event stream later.
  // Deposits

  addDeposit: (deposit) => {
    const created = { ...deposit, id: 'id' in deposit ? deposit.id : nextId(get().deposits) } as Deposit;
    set((state) => ({
      deposits: [created, ...state.deposits],
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'Deposit Created',
          category: 'deposit',
          description: `Deposit #${created.id} for $${created.amount} (${created.network}) created for ${created.user}.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'info',
        },
        ...state.activityLog,
      ],
    }));
    return created;
  },
  updateDeposit: (id, updatedDeposit) =>
    set((state) => ({
      deposits: state.deposits.map((deposit) =>
        deposit.id === id ? { ...deposit, ...updatedDeposit, id: deposit.id } : deposit,
      ),
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'Deposit Updated',
          category: 'deposit',
          description: `Deposit #${id} updated.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'info',
        },
        ...state.activityLog,
      ],
    })),
  deleteDeposit: (id) =>
    set((state) => ({
      deposits: state.deposits.filter((deposit) => deposit.id !== id),
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'Deposit Deleted',
          category: 'deposit',
          description: `Deposit #${id} deleted.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'warning',
        },
        ...state.activityLog,
      ],
    })),
  confirmDeposit: (id) =>
    set((state) => ({
      deposits: state.deposits.map((deposit) => {
        if (deposit.id !== id) return deposit;
        return { ...deposit, status: depositStatusFlow[deposit.status] };
      }),
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'Deposit Status Advanced',
          category: 'deposit',
          description: `Deposit #${id} status advanced.`,
          user: 'System',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'success',
        },
        ...state.activityLog,
      ],
    })),

  // Wallets
  addWallet: (wallet) => {
    const created = { ...wallet, id: 'id' in wallet ? wallet.id : nextId(get().wallets) } as Wallet;
    set((state) => ({
      wallets: [created, ...state.wallets],
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'Wallet Created',
          category: 'wallet',
          description: `Wallet #${created.id} created for ${created.user} (${created.network}).`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'info',
        },
        ...state.activityLog,
      ],
    }));
    return created;
  },
  updateWallet: (id, updatedWallet) =>
    set((state) => ({
      wallets: state.wallets.map((wallet) =>
        wallet.id === id ? { ...wallet, ...updatedWallet, id: wallet.id } : wallet,
      ),
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'Wallet Updated',
          category: 'wallet',
          description: `Wallet #${id} updated.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'info',
        },
        ...state.activityLog,
      ],
    })),
  deleteWallet: (id) =>
    set((state) => ({
      wallets: state.wallets.filter((wallet) => wallet.id !== id),
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'Wallet Deleted',
          category: 'wallet',
          description: `Wallet #${id} deleted.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'warning',
        },
        ...state.activityLog,
      ],
    })),

  // Users
  addUser: (user) => {
    const created = { ...user, id: 'id' in user ? user.id : nextId(get().users) } as User;
    set((state) => ({
      users: [created, ...state.users],
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'User Created',
          category: 'user',
          description: `User ${created.name} created with role ${created.role}.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'info',
        },
        ...state.activityLog,
      ],
    }));
    return created;
  },
  updateUser: (id, updatedUser) =>
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, ...updatedUser, id: user.id } : user)),
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'User Updated',
          category: 'user',
          description: `User #${id} updated.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'info',
        },
        ...state.activityLog,
      ],
    })),
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'User Deleted',
          category: 'user',
          description: `User #${id} deleted.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'warning',
        },
        ...state.activityLog,
      ],
    })),

  // API Keys
  addApiKey: (apiKey) =>
    set((state) => ({
      apiKeys: [apiKey, ...state.apiKeys],
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'API Key Created',
          category: 'api',
          description: `API key ${apiKey.name} created for ${apiKey.merchant}.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'info',
        },
        ...state.activityLog,
      ],
    })),
  updateApiKey: (id, updatedApiKey) =>
    set((state) => ({
      apiKeys: state.apiKeys.map((apiKey) =>
        apiKey.id === id ? { ...apiKey, ...updatedApiKey, id: apiKey.id } : apiKey,
      ),
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'API Key Updated',
          category: 'api',
          description: `API key #${id} updated.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'info',
        },
        ...state.activityLog,
      ],
    })),
  deleteApiKey: (id) =>
    set((state) => ({
      apiKeys: state.apiKeys.filter((apiKey) => apiKey.id !== id),
      activityLog: [
        {
          id: nextId(state.activityLog),
          action: 'API Key Deleted',
          category: 'api',
          description: `API key #${id} deleted.`,
          user: 'Admin',
          ipAddress: '-',
          timestamp: nowTimestamp(),
          severity: 'warning',
        },
        ...state.activityLog,
      ],
    })),
}));

export type { Deposit, User, Wallet };
