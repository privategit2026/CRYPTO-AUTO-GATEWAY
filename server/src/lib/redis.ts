import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Redis is optional in dev — if `REDIS_URL` is not set we expose a no-op
 * client so the rest of the code can call `.get` / `.set` without branching.
 */
export interface CacheLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: 'EX', ttlSeconds?: number): Promise<'OK' | null>;
  del(...keys: string[]): Promise<number>;
  quit(): Promise<'OK' | void>;
  isReady(): boolean;
}

class NoopCache implements CacheLike {
  async get() { return null; }
  async set() { return 'OK' as const; }
  async del() { return 0; }
  async quit() { return 'OK' as const; }
  isReady() { return false; }
}

let instance: CacheLike;

if (env.REDIS_URL) {
  const client = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
  });
  client.on('error', (err) => logger.error({ err }, 'redis error'));
  client.on('connect', () => logger.info('redis connected'));
  client.connect().catch((err) => logger.warn({ err }, 'redis initial connect failed'));

  instance = {
    get: (key) => client.get(key),
    set: async (key, value, mode, ttl) => {
      if (mode === 'EX' && typeof ttl === 'number') {
        return client.set(key, value, 'EX', ttl);
      }
      return client.set(key, value);
    },
    del: (...keys) => client.del(...keys),
    quit: () => client.quit(),
    isReady: () => client.status === 'ready',
  };
} else {
  logger.warn('REDIS_URL not set — using in-memory no-op cache');
  instance = new NoopCache();
}

export const cache: CacheLike = instance;
