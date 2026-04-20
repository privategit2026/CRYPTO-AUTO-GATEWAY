import type { NextFunction, Request, Response } from 'express';
import * as service from './users.service.js';
import { ok, created, noContent, pageMeta } from '../../lib/apiResponse.js';
import { logActivity } from '../../lib/activityLogger.js';
import { ForbiddenError } from '../../utils/errors.js';

const actor = (req: Request) => ({ id: req.user?.id ?? null, name: req.user?.email ?? 'System' });

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.listUsers(req.query as unknown as Parameters<typeof service.listUsers>[0]);
    ok(res, result.items, 'Users fetched successfully', pageMeta(result));
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.getUserById((req.params.id as string));
    ok(res, user, 'User fetched');
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.createUser(req.body);
    await logActivity({
      action: 'user.create',
      category: 'USER',
      description: `Created user ${user.email}`,
      severity: 'SUCCESS',
      actor: actor(req),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
      targetUserId: user.id,
      metadata: { role: user.role, status: user.status },
    });
    created(res, user, 'User created');
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.updateUser((req.params.id as string), req.body);
    await logActivity({
      action: 'user.update',
      category: 'USER',
      description: `Updated user ${user.email}`,
      severity: 'INFO',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      targetUserId: user.id,
      metadata: req.body,
    });
    ok(res, user, 'User updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.id === (req.params.id as string)) {
      throw new ForbiddenError('You cannot delete your own account.');
    }
    const user = await service.deleteUser((req.params.id as string));
    await logActivity({
      action: 'user.delete',
      category: 'USER',
      description: `Deleted user ${user.email}`,
      severity: 'WARNING',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      targetUserId: user.id,
    });
    noContent(res);
  } catch (err) {
    next(err);
  }
};
