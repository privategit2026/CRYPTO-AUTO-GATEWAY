import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { UserRole } from '@prisma/client';

const extractBearerToken = (header: string | undefined): string | null => {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
};

/**
 * Required auth — rejects with 401 when the Bearer token is missing, invalid,
 * or expired. Attaches the decoded user to `req.user`.
 */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) return next(new UnauthorizedError('Missing Authorization header.'));
  const payload = verifyAccessToken(token);
  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role as UserRole,
  };
  next();
};

/**
 * Optional auth — populates `req.user` if a valid token is present but does
 * not fail the request otherwise. Useful on endpoints that tailor behavior
 * based on identity but can still serve anonymous callers.
 */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role as UserRole };
  } catch {
    // Swallow — treat invalid token as anonymous.
  }
  next();
};
