import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import { ok, created } from '../../lib/apiResponse.js';
import { UnauthorizedError } from '../../utils/errors.js';
import { logActivity } from '../../lib/activityLogger.js';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    await logActivity({
      action: 'auth.login',
      category: 'AUTH',
      description: `${result.user.email} signed in`,
      severity: 'SUCCESS',
      actor: { id: result.user.id, name: result.user.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
      targetUserId: result.user.id,
    });
    ok(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    await logActivity({
      action: 'auth.register',
      category: 'AUTH',
      description: `New user ${result.user.email} registered`,
      severity: 'INFO',
      actor: req.user ? { id: req.user.id, name: req.user.email } : { id: null, name: 'System' },
      ipAddress: req.ip,
      requestId: req.requestId,
      targetUserId: result.user.id,
    });
    created(res, result, 'User registered');
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new UnauthorizedError();
    const user = await authService.getMe(req.user.id);
    ok(res, { user }, 'Current user');
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    ok(res, result, 'Tokens refreshed');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Stateless JWT logout — the client drops the tokens. We still log the event.
    if (req.user) {
      await logActivity({
        action: 'auth.logout',
        category: 'AUTH',
        description: `${req.user.email} signed out`,
        severity: 'INFO',
        actor: { id: req.user.id, name: req.user.email },
        ipAddress: req.ip,
        requestId: req.requestId,
      });
    }
    ok(res, null, 'Logged out');
  } catch (err) {
    next(err);
  }
};
