export interface Transaction {
  id: number;
  orderId: string;
  merchant: string;
  amount: number;
  currency: string;
  network: string;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  status: 'pending' | 'processing' | 'confirmed' | 'completed' | 'failed' | 'expired';
  confirmations: number;
  requiredConfirmations: number;
  fee: number;
  callbackUrl: string;
  createdAt: string;
  updatedAt: string;
}

export const transactions: Transaction[] = [
  { id: 1, orderId: 'ORD-10001', merchant: 'GameStore Pro', amount: 49.99, currency: 'USDT', network: 'TRC20', fromAddress: 'TRX9xAb1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9', toAddress: 'TRX1vIj5Kl6Mn7Op8Qr9St0Uv1Wx2Yz3', txHash: '0xabc123def456...', status: 'completed', confirmations: 20, requiredConfirmations: 20, fee: 1.00, callbackUrl: 'https://gamestore.com/callback', createdAt: '2024-01-15 09:30:00', updatedAt: '2024-01-15 09:45:00' },
  { id: 2, orderId: 'ORD-10002', merchant: 'Digital Goods Inc', amount: 150.00, currency: 'USDT', network: 'ERC20', fromAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p', toAddress: '0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x', txHash: '0xdef789ghi012...', status: 'confirmed', confirmations: 12, requiredConfirmations: 12, fee: 5.50, callbackUrl: 'https://digitalgoodsinc.com/pay/cb', createdAt: '2024-01-16 14:20:00', updatedAt: '2024-01-16 14:38:00' },
  { id: 3, orderId: 'ORD-10003', merchant: 'VPN Premium', amount: 9.99, currency: 'USDT', network: 'BEP20', fromAddress: '0xAa1bBb2cCc3dDd4eEe5fFf6gGg7hHh8i', toAddress: '0xZz9yYy8xXx7wWw6vVv5uUu4tTt3sSs2r', txHash: '0xghi345jkl678...', status: 'processing', confirmations: 5, requiredConfirmations: 15, fee: 0.30, callbackUrl: 'https://vpnpremium.io/webhook', createdAt: '2024-01-17 11:05:00', updatedAt: '2024-01-17 11:10:00' },
  { id: 4, orderId: 'ORD-10004', merchant: 'GameStore Pro', amount: 299.00, currency: 'USDT', network: 'TRC20', fromAddress: 'TRX5zEf3Gh4Ij5Kl6Mn7Op8Qr9St0Uv1', toAddress: 'TRX1vIj5Kl6Mn7Op8Qr9St0Uv1Wx2Yz3', txHash: '0xjkl901mno234...', status: 'pending', confirmations: 0, requiredConfirmations: 20, fee: 1.00, callbackUrl: 'https://gamestore.com/callback', createdAt: '2024-01-18 16:45:00', updatedAt: '2024-01-18 16:45:00' },
  { id: 5, orderId: 'ORD-10005', merchant: 'Cloud Hosting', amount: 75.00, currency: 'USDT', network: 'ERC20', fromAddress: '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', toAddress: '0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x', txHash: '0xmno567pqr890...', status: 'failed', confirmations: 0, requiredConfirmations: 12, fee: 0, callbackUrl: 'https://cloudhost.net/payments/hook', createdAt: '2024-01-19 08:15:00', updatedAt: '2024-01-19 08:45:00' },
  { id: 6, orderId: 'ORD-10006', merchant: 'SaaS Platform', amount: 199.00, currency: 'USDT', network: 'TRC20', fromAddress: 'TRX7yCd2Ef3Gh4Ij5Kl6Mn7Op8Qr9St0', toAddress: 'TRX1vIj5Kl6Mn7Op8Qr9St0Uv1Wx2Yz3', txHash: '0xpqr123stu456...', status: 'completed', confirmations: 20, requiredConfirmations: 20, fee: 1.00, callbackUrl: 'https://saasplatform.com/api/webhook', createdAt: '2024-01-20 10:30:00', updatedAt: '2024-01-20 10:50:00' },
  { id: 7, orderId: 'ORD-10007', merchant: 'Digital Goods Inc', amount: 500.00, currency: 'USDT', network: 'BEP20', fromAddress: '0xBb2c3d4eEe5fFf6gGg7hHh8iIi9jJj0k', toAddress: '0xZz9yYy8xXx7wWw6vVv5uUu4tTt3sSs2r', txHash: '0xstu789vwx012...', status: 'expired', confirmations: 0, requiredConfirmations: 15, fee: 0, callbackUrl: 'https://digitalgoodsinc.com/pay/cb', createdAt: '2024-01-21 13:00:00', updatedAt: '2024-01-21 13:30:00' },
  { id: 8, orderId: 'ORD-10008', merchant: 'E-Learning Hub', amount: 29.99, currency: 'USDT', network: 'TRC20', fromAddress: 'TRX3wGh4Ij5Kl6Mn7Op8Qr9St0Uv1Wx2', toAddress: 'TRX1vIj5Kl6Mn7Op8Qr9St0Uv1Wx2Yz3', txHash: '0xvwx345yza678...', status: 'completed', confirmations: 20, requiredConfirmations: 20, fee: 1.00, callbackUrl: 'https://elearninghub.com/hooks/pay', createdAt: '2024-01-22 07:50:00', updatedAt: '2024-01-22 08:10:00' },
  { id: 9, orderId: 'ORD-10009', merchant: 'VPN Premium', amount: 59.99, currency: 'USDT', network: 'ERC20', fromAddress: '0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x', toAddress: '0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x', txHash: '0xyza901bcd234...', status: 'processing', confirmations: 8, requiredConfirmations: 12, fee: 5.50, callbackUrl: 'https://vpnpremium.io/webhook', createdAt: '2024-01-23 15:20:00', updatedAt: '2024-01-23 15:30:00' },
  { id: 10, orderId: 'ORD-10010', merchant: 'Cloud Hosting', amount: 120.00, currency: 'USDT', network: 'TRC20', fromAddress: 'TRX9xAb1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9', toAddress: 'TRX1vIj5Kl6Mn7Op8Qr9St0Uv1Wx2Yz3', txHash: '0xbcd567efg890...', status: 'completed', confirmations: 20, requiredConfirmations: 20, fee: 1.00, callbackUrl: 'https://cloudhost.net/payments/hook', createdAt: '2024-01-24 12:00:00', updatedAt: '2024-01-24 12:20:00' },
  { id: 11, orderId: 'ORD-10011', merchant: 'GameStore Pro', amount: 14.99, currency: 'USDT', network: 'BEP20', fromAddress: '0xCc3dDd4eEe5fFf6gGg7hHh8iIi9jJj0k', toAddress: '0xZz9yYy8xXx7wWw6vVv5uUu4tTt3sSs2r', txHash: '0xefg123hij456...', status: 'pending', confirmations: 0, requiredConfirmations: 15, fee: 0.30, callbackUrl: 'https://gamestore.com/callback', createdAt: '2024-01-25 09:00:00', updatedAt: '2024-01-25 09:00:00' },
  { id: 12, orderId: 'ORD-10012', merchant: 'SaaS Platform', amount: 399.00, currency: 'USDT', network: 'ERC20', fromAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p', toAddress: '0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x', txHash: '0xhij789klm012...', status: 'confirmed', confirmations: 12, requiredConfirmations: 12, fee: 5.50, callbackUrl: 'https://saasplatform.com/api/webhook', createdAt: '2024-01-25 11:30:00', updatedAt: '2024-01-25 11:50:00' },
];
