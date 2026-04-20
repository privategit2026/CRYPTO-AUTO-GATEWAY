import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestContext } from './middleware/requestContext.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import walletRoutes from './modules/wallets/wallets.routes.js';
import depositRoutes from './modules/deposits/deposits.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import apiKeyRoutes from './modules/apiKeys/apiKeys.routes.js';
import activityRoutes from './modules/activity/activity.routes.js';

// Ensure the Express Request augmentation in src/types/auth.ts is picked up.
import './types/auth.js';

export const buildApp = (): Express => {
  const app = express();

  // Trust the first proxy hop so `req.ip` reflects the real client when
  // deployed behind a load balancer.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.use(
    cors({
      origin: (origin, cb) => {
        // Same-origin, curl, server-to-server.
        if (!origin) return cb(null, true);
        if (env.CORS_ORIGINS.includes('*') || env.CORS_ORIGINS.includes(origin)) {
          return cb(null, true);
        }
        return cb(new Error(`Origin ${origin} not allowed by CORS.`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  app.use(requestContext);
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ requestId: (req as Request).requestId }),
      autoLogging: {
        ignore: (req) => req.url === '/api/health' || req.url === '/health',
      },
    }),
  );

  // Global rate limit (can be tightened per-route in modules).
  const globalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again shortly.', code: 'RATE_LIMITED' },
  });
  app.use('/api', globalLimiter);

  // ─── Health ─────────────────────────────────────────────────────────────
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'OK',
      data: {
        service: 'cryptogate-api',
        env: env.NODE_ENV,
        time: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  // ─── Routes ─────────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/wallets', walletRoutes);
  app.use('/api/deposits', depositRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/api-keys', apiKeyRoutes);
  app.use('/api/activity', activityRoutes);

  // 404 + error handlers are last.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
