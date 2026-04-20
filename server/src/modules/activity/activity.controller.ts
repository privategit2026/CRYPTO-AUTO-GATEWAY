import type { NextFunction, Request, Response } from 'express';
import * as service from './activity.service.js';
import { ok, pageMeta } from '../../lib/apiResponse.js';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.listActivity(req.query as unknown as Parameters<typeof service.listActivity>[0]);
    ok(res, result.items, 'Activity fetched successfully', pageMeta(result));
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await service.getActivityById((req.params.id as string));
    ok(res, entry, 'Activity entry fetched');
  } catch (err) {
    next(err);
  }
};
