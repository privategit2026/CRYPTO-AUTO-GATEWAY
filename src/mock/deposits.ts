export interface Deposit {
  id: number;
  user: string;
  amount: number;
  network: string;
  address: string;
  txid: string;
  status: 'pending' | 'detected' | 'detecting' | 'confirming' | 'completed';
  date: string;
}

export const deposits: Deposit[] = [
  { id: 1, user: 'Alice Johnson', amount: 500, network: 'TRC20', address: 'TRX9x...Ab1', txid: 'TX001ABC...', status: 'completed', date: '2024-01-15' },
  { id: 2, user: 'Bob Smith', amount: 1200, network: 'TRC20', address: 'TRX7y...Cd2', txid: 'TX002DEF...', status: 'pending', date: '2024-01-16' },
  { id: 3, user: 'Carol White', amount: 250, network: 'ERC20', address: '0x1a2b...3c4d', txid: 'TX003GHI...', status: 'detected', date: '2024-01-17' },
  { id: 4, user: 'David Brown', amount: 3000, network: 'TRC20', address: 'TRX5z...Ef3', txid: 'TX004JKL...', status: 'confirming', date: '2024-01-18' },
  { id: 5, user: 'Eve Davis', amount: 750, network: 'BEP20', address: '0xAa1b...2c3D', txid: 'TX005MNO...', status: 'pending', date: '2024-01-19' },
  { id: 6, user: 'Frank Miller', amount: 100, network: 'TRC20', address: 'TRX3w...Gh4', txid: 'TX006PQR...', status: 'completed', date: '2024-01-20' },
  { id: 7, user: 'Grace Lee', amount: 2500, network: 'ERC20', address: '0x5e6f...7g8h', txid: 'TX007STU...', status: 'completed', date: '2024-01-21' },
  { id: 8, user: 'Henry Wilson', amount: 800, network: 'BEP20', address: '0xBb2c...3d4E', txid: 'TX008VWX...', status: 'pending', date: '2024-01-22' },
  { id: 9, user: 'Iris Taylor', amount: 1500, network: 'TRC20', address: 'TRX1v...Ij5', txid: 'TX009YZA...', status: 'confirming', date: '2024-01-23' },
  { id: 10, user: 'Jack Anderson', amount: 4000, network: 'ERC20', address: '0x9i0j...1k2l', txid: 'TX010BCD...', status: 'completed', date: '2024-01-24' },
];
