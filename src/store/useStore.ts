import { create } from 'zustand';
import { type Deposit, deposits as mockDeposits } from '../mock/deposits';
import { type Wallet, wallets as mockWallets } from '../mock/wallets';
import { type User, users as mockUsers } from '../mock/users';

interface StoreState {
  deposits: Deposit[];
  wallets: Wallet[];
  users: User[];

  addDeposit: (deposit: Deposit) => void;
  updateDeposit: (id: number, deposit: Partial<Deposit>) => void;
  deleteDeposit: (id: number) => void;

  addWallet: (wallet: Wallet) => void;
  updateWallet: (id: number, wallet: Partial<Wallet>) => void;
  deleteWallet: (id: number) => void;

  addUser: (user: User) => void;
  updateUser: (id: number, user: Partial<User>) => void;
  deleteUser: (id: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  deposits: mockDeposits,
  wallets: mockWallets,
  users: mockUsers,

  addDeposit: (deposit) =>
    set((state) => ({ deposits: [...state.deposits, deposit] })),
  updateDeposit: (id, updatedDeposit) =>
    set((state) => ({
      deposits: state.deposits.map((d) => (d.id === id ? { ...d, ...updatedDeposit } : d)),
    })),
  deleteDeposit: (id) =>
    set((state) => ({ deposits: state.deposits.filter((d) => d.id !== id) })),

  addWallet: (wallet) =>
    set((state) => ({ wallets: [...state.wallets, wallet] })),
  updateWallet: (id, updatedWallet) =>
    set((state) => ({
      wallets: state.wallets.map((w) => (w.id === id ? { ...w, ...updatedWallet } : w)),
    })),
  deleteWallet: (id) =>
    set((state) => ({ wallets: state.wallets.filter((w) => w.id !== id) })),

  addUser: (user) =>
    set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updatedUser) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)),
    })),
  deleteUser: (id) =>
    set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
}));
