import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../utils/errors.js';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

interface ErrorBody {
  success: false;
  message: string;
  code: string;
  details?: unknown;
  stack?: string;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong.';
  let details: unknown;

  if (err instanceof ApiError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request payload.';
    details = err.issues.map((i) => ({ path: i.path, message: i.message, code: i.code }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      status = 409;
      code = 'DUPLICATE';
      message = `Resource with this ${(err.meta?.target as string[] | undefined)?.join(', ') ?? 'field'} already exists.`;
    } else if (err.code === 'P2025') {
      status = 404;
      code = 'NOT_FOUND';
      message = 'Record not found.';
    } else {
      status = 400;
      code = `PRISMA_${err.code}`;
      message = 'Database request failed.';
    }
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  const body: ErrorBody = { success: false, message, code };
  if (details !== undefined) body.details = details;
  if (env.NODE_ENV !== 'production' && err instanceof Error && err.stack) {
    body.stack = err.stack;
  }

  if (status >= 500) {
    logger.error({ err, path: req.path, method: req.method, requestId: req.requestId }, 'unhandled error');
  } else {
    logger.warn({ code, path: req.path, method: req.method, requestId: req.requestId }, message);
  }

  res.status(status).json(body);
};

export const notFoundHandler = (_req: import('express').Request, res: import('express').Response) => {
  res.status(404).json({ success: false, message: 'Route not found.', code: 'NOT_FOUND' });
};
