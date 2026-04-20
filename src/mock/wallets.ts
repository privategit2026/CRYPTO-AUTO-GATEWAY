export interface Wallet {
  id: number;
  address: string;
  user: string;
  network: string;
  status: 'active' | 'used' | 'inactive';
  createdAt: string;
}

export const wallets: Wallet[] = [
  { id: 1, address: 'TRX9xAb1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9', user: 'Alice Johnson', network: 'TRC20', status: 'active', createdAt: '2024-01-10' },
  { id: 2, address: 'TRX7yCd2Ef3Gh4Ij5Kl6Mn7Op8Qr9St0', user: 'Bob Smith', network: 'TRC20', status: 'used', createdAt: '2024-01-11' },
  { id: 3, address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p', user: 'Carol White', network: 'ERC20', status: 'active', createdAt: '2024-01-12' },
  { id: 4, address: '0xAa1bBb2cCc3dDd4eEe5fFf6gGg7hHh8i', user: 'David Brown', network: 'BEP20', status: 'inactive', createdAt: '2024-01-13' },
  { id: 5, address: 'TRX5zEf3Gh4Ij5Kl6Mn7Op8Qr9St0Uv1', user: 'Eve Davis', network: 'TRC20', status: 'active', createdAt: '2024-01-14' },
  { id: 6, address: '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', user: 'Frank Miller', network: 'ERC20', status: 'used', createdAt: '2024-01-15' },
];
