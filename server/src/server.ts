import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { disconnectPrisma } from './lib/prisma.js';
import { cache } from './lib/redis.js';

const app = buildApp();

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info({ host: env.HOST, port: env.PORT, env: env.NODE_ENV }, 'CryptoGate API listening');
});

const shutdown = (signal: string) => {
  logger.info({ signal }, 'received shutdown signal — closing');
  const forceTimer = setTimeout(() => {
    logger.warn('forcing exit after 10s');
    process.exit(1);
  }, 10_000);
  forceTimer.unref();

  server.close(async (err) => {
    if (err) logger.error({ err }, 'error while closing HTTP server');
    try {
      await disconnectPrisma();
      await cache.quit();
    } catch (e) {
      logger.error({ err: e }, 'error while closing clients');
    }
    process.exit(err ? 1 : 0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandled rejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaught exception — exiting');
  process.exit(1);
});
