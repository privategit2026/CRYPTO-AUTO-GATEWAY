import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';

/**
 * Attach (or propagate) an `X-Request-Id` so logs and activity entries can be
 * correlated end-to-end.
 */
export const requestContext: RequestHandler = (req, res, next) => {
  const existing = req.header('x-request-id');
  const id = existing && existing.length <= 64 ? existing : randomUUID();
  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
};
