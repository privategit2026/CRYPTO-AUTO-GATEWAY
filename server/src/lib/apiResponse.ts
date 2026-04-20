import type { Response } from 'express';

/**
 * Standard JSON envelope. Every controller returns this shape so the frontend
 * can swap Zustand calls for `fetch` with a single parser.
 */
export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export const ok = <T>(res: Response, data: T, message = 'OK', meta?: ApiMeta, status = 200) => {
  const body: ApiEnvelope<T> = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

export const created = <T>(res: Response, data: T, message = 'Created') => ok(res, data, message, undefined, 201);

export const noContent = (res: Response) => res.status(204).send();

export interface PageMetaInput {
  page: number;
  limit: number;
  total: number;
}

export const pageMeta = ({ page, limit, total }: PageMetaInput): ApiMeta => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / Math.max(1, limit))),
});
