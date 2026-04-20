import type { NextFunction, Request, Response } from 'express';
import * as service from './dashboard.service.js';
import { ok } from '../../lib/apiResponse.js';

export const summary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getSummary();
    ok(res, data, 'Dashboard summary');
  } catch (err) {
    next(err);
  }
};

export const recentDeposits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 8;
    const limit = Number.isFinite(raw) ? raw : 8;
    const data = await service.getRecentDeposits(limit);
    ok(res, data, 'Recent deposits');
  } catch (err) {
    next(err);
  }
};

export const networkHealth = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getNetworkHealth();
    ok(res, data, 'Network health');
  } catch (err) {
    next(err);
  }
};
