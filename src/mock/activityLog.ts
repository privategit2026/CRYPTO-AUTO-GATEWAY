export interface ActivityEntry {
  id: number;
  action: string;
  category: 'deposit' | 'wallet' | 'user' | 'api' | 'system' | 'security';
  description: string;
  user: string;
  ipAddress: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export const activityLog: ActivityEntry[] = [
  { id: 1, action: 'Deposit Completed', category: 'deposit', description: 'Deposit #1 for $500 USDT (TRC20) completed with 20 confirmations', user: 'System', ipAddress: '-', timestamp: '2024-01-25 16:45:00', severity: 'success' },
  { id: 2, action: 'New User Registered', category: 'user', description: 'User "Jack Anderson" created with role: user', user: 'Admin', ipAddress: '192.168.1.100', timestamp: '2024-01-25 16:30:00', severity: 'info' },
  { id: 3, action: 'API Key Created', category: 'api', description: 'New API key "Read-Only Key" created for Digital Goods Inc', user: 'Admin', ipAddress: '192.168.1.100', timestamp: '2024-01-25 16:15:00', severity: 'info' },
  { id: 4, action: 'Wallet Deactivated', category: 'wallet', description: 'Wallet 0xAa1b...Hh8i marked as inactive', user: 'Admin', ipAddress: '192.168.1.100', timestamp: '2024-01-25 15:50:00', severity: 'warning' },
  { id: 5, action: 'Deposit Failed', category: 'deposit', description: 'Deposit #5 for $75 USDT (ERC20) failed - timeout exceeded', user: 'System', ipAddress: '-', timestamp: '2024-01-25 15:30:00', severity: 'error' },
  { id: 6, action: 'Rate Limit Warning', category: 'api', description: 'API key "Main API Key" reached 80% of rate limit (8000/10000)', user: 'System', ipAddress: '-', timestamp: '2024-01-25 15:00:00', severity: 'warning' },
  { id: 7, action: 'Login Detected', category: 'security', description: 'Admin login from new IP address 203.0.113.50', user: 'Admin', ipAddress: '203.0.113.50', timestamp: '2024-01-25 14:45:00', severity: 'warning' },
  { id: 8, action: 'System Health Check', category: 'system', description: 'All blockchain nodes (TRC20, ERC20, BEP20) are operational', user: 'System', ipAddress: '-', timestamp: '2024-01-25 14:00:00', severity: 'success' },
  { id: 9, action: 'Deposit Detected', category: 'deposit', description: 'New deposit of $150 USDT detected on ERC20 network for order ORD-10002', user: 'System', ipAddress: '-', timestamp: '2024-01-25 13:30:00', severity: 'info' },
  { id: 10, action: 'API Key Revoked', category: 'api', description: 'API key "Legacy Key" for Cloud Hosting was revoked', user: 'Admin', ipAddress: '192.168.1.100', timestamp: '2024-01-25 13:00:00', severity: 'warning' },
  { id: 11, action: 'Wallet Created', category: 'wallet', description: 'New TRC20 wallet assigned to user Eve Davis', user: 'System', ipAddress: '-', timestamp: '2024-01-25 12:30:00', severity: 'info' },
  { id: 12, action: 'Failed Login Attempt', category: 'security', description: '3 failed login attempts from IP 45.33.32.156', user: 'Unknown', ipAddress: '45.33.32.156', timestamp: '2024-01-25 12:00:00', severity: 'error' },
  { id: 13, action: 'Config Updated', category: 'system', description: 'Minimum confirmations for BEP20 updated from 12 to 15', user: 'Admin', ipAddress: '192.168.1.100', timestamp: '2024-01-25 11:30:00', severity: 'info' },
  { id: 14, action: 'Deposit Expired', category: 'deposit', description: 'Deposit #7 for $500 USDT (BEP20) expired - no payment received within 30 minutes', user: 'System', ipAddress: '-', timestamp: '2024-01-25 11:00:00', severity: 'error' },
  { id: 15, action: 'User Deactivated', category: 'user', description: 'User "Henry Wilson" account deactivated', user: 'Admin', ipAddress: '192.168.1.100', timestamp: '2024-01-25 10:30:00', severity: 'warning' },
  { id: 16, action: 'Callback Delivered', category: 'system', description: 'Webhook callback for order ORD-10001 delivered successfully (200 OK)', user: 'System', ipAddress: '-', timestamp: '2024-01-25 10:00:00', severity: 'success' },
  { id: 17, action: 'Callback Failed', category: 'system', description: 'Webhook callback for order ORD-10005 failed (502 Bad Gateway) - retry scheduled', user: 'System', ipAddress: '-', timestamp: '2024-01-25 09:30:00', severity: 'error' },
  { id: 18, action: 'Database Backup', category: 'system', description: 'Automated daily backup completed successfully (245 MB)', user: 'System', ipAddress: '-', timestamp: '2024-01-25 03:00:00', severity: 'success' },
  { id: 19, action: 'Node Reconnected', category: 'system', description: 'ERC20 node connection restored after 2 minute outage', user: 'System', ipAddress: '-', timestamp: '2024-01-24 22:15:00', severity: 'warning' },
  { id: 20, action: 'Bulk Deposit Import', category: 'deposit', description: 'Imported 15 historical deposits from CSV file', user: 'Admin', ipAddress: '192.168.1.100', timestamp: '2024-01-24 18:00:00', severity: 'info' },
];
