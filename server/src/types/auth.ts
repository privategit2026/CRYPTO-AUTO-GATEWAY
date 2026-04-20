import type { UserRole } from '@prisma/client';

/**
 * The shape of `req.user` after `authMiddleware` has run. Keep it narrow —
 * controllers that need more data should fetch the User row themselves.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      requestId?: string;
    }
  }
}

export {};
