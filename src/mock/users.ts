export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
}

export const users: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', status: 'active', createdAt: '2024-01-01' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user', status: 'active', createdAt: '2024-01-02' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'user', status: 'active', createdAt: '2024-01-03' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'user', status: 'inactive', createdAt: '2024-01-04' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'user', status: 'active', createdAt: '2024-01-05' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'admin', status: 'active', createdAt: '2024-01-06' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'user', status: 'active', createdAt: '2024-01-07' },
  { id: 8, name: 'Henry Wilson', email: 'henry@example.com', role: 'user', status: 'inactive', createdAt: '2024-01-08' },
];
