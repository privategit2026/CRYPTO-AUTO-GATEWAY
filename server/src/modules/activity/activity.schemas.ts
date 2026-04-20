import { z } from 'zod';
import { basePaginationSchema } from '../../utils/pagination.js';

export const ActivityCategorySchema = z.enum([
  'DEPOSIT',
  'WALLET',
  'USER',
  'API',
  'SYSTEM',
  'SECURITY',
  'AUTH',
]);

export const ActivitySeveritySchema = z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']);

export const listActivityQuerySchema = basePaginationSchema.extend({
  category: ActivityCategorySchema.optional(),
  severity: ActivitySeveritySchema.optional(),
  actorUserId: z.string().trim().min(1).max(60).optional(),
  sortBy: z.enum(['createdAt']).default('createdAt'),
});
export type ListActivityQuery = z.infer<typeof listActivityQuerySchema>;

export const activityIdParamsSchema = z.object({
  id: z.string().trim().min(1).max(60),
});
