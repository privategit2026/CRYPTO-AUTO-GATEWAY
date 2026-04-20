import type { DepositNetwork } from './deposits';

export type WalletStatus = 'active' | 'used' | 'inactive';

export interface Wallet {
  id: number;
  address: string;
  user: string;
  network: DepositNetwork;
  status: WalletStatus;
  createdAt: string;
}

export const wallets: Wallet[] = [
  {
    id: 201,
    address: 'TQq9zN7A3zUqV6xF2mW8rH4nKcE5pR1aBd',
    user: 'Alice Johnson',
    network: 'TRC20',
    status: 'used',
    createdAt: '2026-04-01',
  },
  {
    id: 202,
    address: 'TY8mbTr7nLwKzX9eBtqj6bDBQWmweD4rtP',
    user: 'Bob Smith',
    network: 'TRC20',
    status: 'active',
    createdAt: '2026-04-04',
  },
  {
    id: 203,
    address: '0x63e7129d83460f431f3f8f31b0d5d7b24fe214d8',
    user: 'Carol White',
    network: 'ERC20',
    status: 'active',
    createdAt: '2026-04-07',
  },
  {
    id: 204,
    address: '0xa6dc4F5079Bb389f24673247659FBB76D2752B4e',
    user: 'Eve Davis',
    network: 'BEP20',
    status: 'active',
    createdAt: '2026-04-11',
  },
  {
    id: 205,
    address: 'TG5cG1o8Q1r9yZqT7vV2UaKpW8qcnr44xS',
    user: 'David Brown',
    network: 'TRC20',
    status: 'used',
    createdAt: '2026-04-12',
  },
  {
    id: 206,
    address: '0x87F23394324D0789d7Cb4C6f85B94Af0cB682C92',
    user: 'Grace Lee',
    network: 'ERC20',
    status: 'inactive',
    createdAt: '2026-04-14',
  },
  {
    id: 207,
    address: '0xCc1e70a33a755CcBCBFf812A1Af21f36764A1747',
    user: 'Henry Wilson',
    network: 'BEP20',
    status: 'active',
    createdAt: '2026-04-16',
  },
];
