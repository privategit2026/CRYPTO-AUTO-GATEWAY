export type UserRole = 'admin' | 'manager' | 'viewer';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export const users: User[] = [
  { id: 301, name: 'Alice Johnson', email: 'alice@cryptogate.local', role: 'admin', status: 'active', createdAt: '2026-03-28' },
  { id: 302, name: 'Bob Smith', email: 'bob@merchantdesk.local', role: 'manager', status: 'active', createdAt: '2026-03-30' },
  { id: 303, name: 'Carol White', email: 'carol@merchantdesk.local', role: 'viewer', status: 'active', createdAt: '2026-04-02' },
  { id: 304, name: 'David Brown', email: 'david@partnerpay.local', role: 'viewer', status: 'inactive', createdAt: '2026-04-05' },
  { id: 305, name: 'Eve Davis', email: 'eve@partnerpay.local', role: 'manager', status: 'active', createdAt: '2026-04-08' },
  { id: 306, name: 'Frank Miller', email: 'frank@cryptogate.local', role: 'admin', status: 'active', createdAt: '2026-04-10' },
  { id: 307, name: 'Grace Lee', email: 'grace@digitalgoods.local', role: 'viewer', status: 'active', createdAt: '2026-04-12' },
  { id: 308, name: 'Henry Wilson', email: 'henry@digitalgoods.local', role: 'viewer', status: 'inactive', createdAt: '2026-04-14' },
];
