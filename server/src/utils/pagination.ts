import { z } from 'zod';

/**
 * Shared pagination / sorting query schema. Modules extend this with their
 * own filter fields to keep the list endpoints consistent.
 */
export const basePaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(200).optional(),
  sortBy: z.string().trim().min(1).max(60).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type BasePaginationQuery = z.infer<typeof basePaginationSchema>;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export const toPaginationParams = (
  input: Pick<BasePaginationQuery, 'page' | 'limit'>,
): PaginationParams => {
  const page = Math.max(1, input.page);
  const limit = Math.min(100, Math.max(1, input.limit));
  return { page, limit, skip: (page - 1) * limit, take: limit };
};

/**
 * Resolve an untrusted `sortBy` string against a whitelist. Returns the
 * default when the input is missing or not allowed.
 */
export const resolveSortField = <T extends string>(
  input: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  if (!input) return fallback;
  return (allowed as readonly string[]).includes(input) ? (input as T) : fallback;
};
