import { z } from 'zod';
import { basePaginationSchema } from '../../utils/pagination.js';

export const ApiKeyStatusSchema = z.enum(['ACTIVE', 'REVOKED', 'EXPIRED']);
export const ApiKeyPermissionSchema = z.enum(['READ', 'WRITE', 'WEBHOOKS']);

export const listApiKeysQuerySchema = basePaginationSchema.extend({
  status: ApiKeyStatusSchema.optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status', 'name', 'merchant']).default('createdAt'),
});
export type ListApiKeysQuery = z.infer<typeof listApiKeysQuerySchema>;

export const apiKeyIdParamsSchema = z.object({
  id: z.string().trim().min(1).max(60),
});

export const createApiKeySchema = z.object({
  userId: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(120),
  merchant: z.string().trim().min(1).max(120),
  permissions: z.array(ApiKeyPermissionSchema).min(1).default(['READ']),
  rateLimit: z.coerce.number().int().min(1).max(1_000_000).default(5000),
  expiresAt: z.string().datetime().optional(),
});
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

export const updateApiKeySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    merchant: z.string().trim().min(1).max(120).optional(),
    permissions: z.array(ApiKeyPermissionSchema).min(1).optional(),
    rateLimit: z.coerce.number().int().min(1).max(1_000_000).optional(),
    status: ApiKeyStatusSchema.optional(),
    expiresAt: z.string().datetime().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'Provide at least one field to update.',
  });
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
