import type { RequestHandler } from 'express';
import type { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

/**
 * Role hierarchy used by the `canAtLeast` helper. Higher index = more power.
 */
const ROLE_ORDER: UserRole[] = ['VIEWER', 'MANAGER', 'ADMIN', 'SYSTEM_ADMIN'];

export const rankOf = (role: UserRole): number => {
  const idx = ROLE_ORDER.indexOf(role);
  return idx < 0 ? 0 : idx;
};

/**
 * Factory: allow only requests where `req.user.role` is in the whitelist.
 * Always run after `authMiddleware`.
 */
export const requireRoles = (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Requires role: ${roles.join(', ')}`));
    }
    next();
  };

/**
 * Factory: allow roles at or above a minimum tier.
 * E.g. `requireAtLeast('MANAGER')` admits MANAGER, ADMIN, SYSTEM_ADMIN.
 */
export const requireAtLeast = (minRole: UserRole): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (rankOf(req.user.role) < rankOf(minRole)) {
      return next(new ForbiddenError(`Requires at least ${minRole} role.`));
    }
    next();
  };

export const roles = {
  admins: ['SYSTEM_ADMIN', 'ADMIN'] as UserRole[],
  admin_or_manager: ['SYSTEM_ADMIN', 'ADMIN', 'MANAGER'] as UserRole[],
  any_authenticated: ['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER'] as UserRole[],
};
