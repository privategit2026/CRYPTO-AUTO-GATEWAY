import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';
import { logger } from './logger.js';

/**
 * A single PrismaClient per process, re-used across requests. In development
 * we also guard against HMR creating a second client.
 */
declare global {
  // eslint-disable-next-line no-var
  var __cryptogatePrisma: PrismaClient | undefined;
}

export const prisma =
  global.__cryptogatePrisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [{ level: 'warn', emit: 'event' }, { level: 'error', emit: 'event' }]
        : [{ level: 'error', emit: 'event' }],
  });

// Forward Prisma events to pino so all logs flow through one pipeline.
// @ts-expect-error — Prisma event types depend on the `log` option shape.
prisma.$on('warn', (e) => logger.warn({ prisma: e }, 'prisma warn'));
// @ts-expect-error — same as above.
prisma.$on('error', (e) => logger.error({ prisma: e }, 'prisma error'));

if (env.NODE_ENV !== 'production') global.__cryptogatePrisma = prisma;

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
