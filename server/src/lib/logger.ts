import pino from 'pino';
import { env } from '../config/env.js';

/**
 * Structured logger. In development we pretty-print; in production we emit
 * raw JSON so log collectors can parse it.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'cryptogate-api', env: env.NODE_ENV },
  ...(env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, singleLine: false, translateTime: 'SYS:standard' },
        },
      }
    : {}),
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.passwordHash',
      '*.keyHash',
      '*.secretHash',
    ],
    censor: '[redacted]',
  },
});

export type Logger = typeof logger;
