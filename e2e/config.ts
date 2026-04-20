import path from 'path';
import type { PlaywrightTestConfig } from '@playwright/test';

// Shared auth storage path used by all tests
export const STORAGE_STATE = path.join(__dirname, '.auth/user.json');

// Test credentials (must match the seeded admin user)
export const TEST_USER = {
  email: 'admin@cryptogate.dev',
  password: 'Admin1234!',
} as const;

export const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
