export interface ApiKey {
  id: number;
  name: string;
  key: string;
  secret: string;
  merchant: string;
  permissions: ('read' | 'write' | 'webhooks')[];
  status: 'active' | 'revoked' | 'expired';
  lastUsed: string;
  requestsToday: number;
  rateLimit: number;
  createdAt: string;
  expiresAt: string;
}

export const apiKeys: ApiKey[] = [
  { id: 1, name: 'Production Key', key: 'pk_live_TRX9xAb1Cd2Ef3Gh4...', secret: 'sk_live_xxxxxxxxxxxx', merchant: 'GameStore Pro', permissions: ['read', 'write', 'webhooks'], status: 'active', lastUsed: '2024-01-25 14:30:00', requestsToday: 1247, rateLimit: 5000, createdAt: '2024-01-01', expiresAt: '2025-01-01' },
  { id: 2, name: 'Test Key', key: 'pk_test_7yCd2Ef3Gh4Ij5Kl...', secret: 'sk_test_xxxxxxxxxxxx', merchant: 'GameStore Pro', permissions: ['read', 'write'], status: 'active', lastUsed: '2024-01-24 09:15:00', requestsToday: 89, rateLimit: 1000, createdAt: '2024-01-05', expiresAt: '2025-01-05' },
  { id: 3, name: 'Main API Key', key: 'pk_live_1a2b3c4d5e6f7g8h...', secret: 'sk_live_xxxxxxxxxxxx', merchant: 'Digital Goods Inc', permissions: ['read', 'write', 'webhooks'], status: 'active', lastUsed: '2024-01-25 16:00:00', requestsToday: 3421, rateLimit: 10000, createdAt: '2024-01-02', expiresAt: '2025-01-02' },
  { id: 4, name: 'Webhook Only', key: 'pk_live_Aa1bBb2cCc3dDd4e...', secret: 'sk_live_xxxxxxxxxxxx', merchant: 'VPN Premium', permissions: ['webhooks'], status: 'active', lastUsed: '2024-01-25 12:45:00', requestsToday: 567, rateLimit: 2000, createdAt: '2024-01-08', expiresAt: '2025-01-08' },
  { id: 5, name: 'Legacy Key', key: 'pk_live_5zEf3Gh4Ij5Kl6Mn...', secret: 'sk_live_xxxxxxxxxxxx', merchant: 'Cloud Hosting', permissions: ['read'], status: 'revoked', lastUsed: '2024-01-10 08:00:00', requestsToday: 0, rateLimit: 5000, createdAt: '2023-06-15', expiresAt: '2024-06-15' },
  { id: 6, name: 'Integration Key', key: 'pk_live_5e6f7g8h9i0j1k2l...', secret: 'sk_live_xxxxxxxxxxxx', merchant: 'SaaS Platform', permissions: ['read', 'write', 'webhooks'], status: 'active', lastUsed: '2024-01-25 15:20:00', requestsToday: 2103, rateLimit: 8000, createdAt: '2024-01-03', expiresAt: '2025-01-03' },
  { id: 7, name: 'Expired Key', key: 'pk_live_3wGh4Ij5Kl6Mn7Op...', secret: 'sk_live_xxxxxxxxxxxx', merchant: 'E-Learning Hub', permissions: ['read', 'write'], status: 'expired', lastUsed: '2023-12-31 23:59:00', requestsToday: 0, rateLimit: 3000, createdAt: '2023-01-01', expiresAt: '2023-12-31' },
  { id: 8, name: 'Read-Only Key', key: 'pk_live_Bb2c3d4eEe5fFf6g...', secret: 'sk_live_xxxxxxxxxxxx', merchant: 'Digital Goods Inc', permissions: ['read'], status: 'active', lastUsed: '2024-01-25 10:30:00', requestsToday: 412, rateLimit: 5000, createdAt: '2024-01-10', expiresAt: '2025-01-10' },
];
