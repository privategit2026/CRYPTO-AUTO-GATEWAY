export type DepositNetwork = 'TRC20' | 'ERC20' | 'BEP20';
export type DepositStatus = 'pending' | 'detected' | 'confirming' | 'completed';

export interface Deposit {
  id: number;
  user: string;
  amount: number;
  network: DepositNetwork;
  address: string;
  txid: string;
  status: DepositStatus;
  date: string;
}

export const deposits: Deposit[] = [
  {
    id: 1001,
    user: 'Alice Johnson',
    amount: 500,
    network: 'TRC20',
    address: 'TQq9zN7A3zUqV6xF2mW8rH4nKcE5pR1aBd',
    txid: '7f3c2e91a0bb41c99edc811d33a2e2d47b3a91e06f9d5bb67dc13ec04d2a9072',
    status: 'completed',
    date: '2026-04-17',
  },
  {
    id: 1002,
    user: 'Bob Smith',
    amount: 1200,
    network: 'TRC20',
    address: 'TY8mbTr7nLwKzX9eBtqj6bDBQWmweD4rtP',
    txid: 'b7ac351c89a94ea5ab3f7d0f8d152c216d904d640214bc928a9d9e534f433f12',
    status: 'pending',
    date: '2026-04-18',
  },
  {
    id: 1003,
    user: 'Carol White',
    amount: 250,
    network: 'ERC20',
    address: '0x63e7129d83460f431f3f8f31b0d5d7b24fe214d8',
    txid: '0x42f89ee3f6d12f001b6cf6dcb2128b9308d9ad56bff7c8a75f83d8e504aaf916',
    status: 'detected',
    date: '2026-04-18',
  },
  {
    id: 1004,
    user: 'David Brown',
    amount: 3000,
    network: 'TRC20',
    address: 'TG5cG1o8Q1r9yZqT7vV2UaKpW8qcnr44xS',
    txid: '9ef614ca8c3f4b55b6b4d56be014e011890bb0bd5e191a4fe2c47d231d638d2a',
    status: 'confirming',
    date: '2026-04-19',
  },
  {
    id: 1005,
    user: 'Eve Davis',
    amount: 750,
    network: 'BEP20',
    address: '0xa6dc4F5079Bb389f24673247659FBB76D2752B4e',
    txid: '0x653c8f676c49494aeaf7f208f1f0172a354ce887fd14753eca88e6fc41a5d7e2',
    status: 'pending',
    date: '2026-04-19',
  },
  {
    id: 1006,
    user: 'Frank Miller',
    amount: 100,
    network: 'TRC20',
    address: 'TNm7WwQp24s8bbtV7bHmj4Jq4KpxfY2EaM',
    txid: '127d67cd65054c068b0b3a532488042f582d3260e3451a0c087c99ca81a90f8b',
    status: 'completed',
    date: '2026-04-20',
  },
  {
    id: 1007,
    user: 'Grace Lee',
    amount: 2500,
    network: 'ERC20',
    address: '0x87F23394324D0789d7Cb4C6f85B94Af0cB682C92',
    txid: '0xaab04f5e9b604355879e97a31cc260789a7a9d0c53c80c47ca60637b363fe33d',
    status: 'completed',
    date: '2026-04-20',
  },
  {
    id: 1008,
    user: 'Henry Wilson',
    amount: 800,
    network: 'BEP20',
    address: '0xCc1e70a33a755CcBCBFf812A1Af21f36764A1747',
    txid: '0xbb728ad494f4c6e1843271dc78346fc9d31a3d24589f10a68eb01d515b928022',
    status: 'pending',
    date: '2026-04-21',
  },
];
