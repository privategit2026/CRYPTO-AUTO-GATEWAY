import type { ApiKey, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { generateApiKey } from '../../utils/apiKey.js';
import {
  toPaginationParams,
  resolveSortField,
} from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';
import type {
  ListApiKeysQuery,
  CreateApiKeyInput,
  UpdateApiKeyInput,
} from './apiKeys.schemas.js';

const SORT_WHITELIST = ['createdAt', 'updatedAt', 'status', 'name', 'merchant'] as const;

export type ApiKeyDTO = {
  id: string;
  userId: string;
  name: string;
  merchant: string;
  keyPreview: string;
  permissions: ApiKey['permissions'];
  status: ApiKey['status'];
  rateLimit: number;
  requestsToday: number;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const toApiKeyDTO = (k: ApiKey): ApiKeyDTO => ({
  id: k.id,
  userId: k.userId,
  name: k.name,
  merchant: k.merchant,
  keyPreview: k.keyPreview,
  permissions: k.permissions,
  status: k.status,
  rateLimit: k.rateLimit,
  requestsToday: k.requestsToday,
  lastUsedAt: k.lastUsedAt,
  expiresAt: k.expiresAt,
  createdAt: k.createdAt,
  updatedAt: k.updatedAt,
});

export const listApiKeys = async (
  query: ListApiKeysQuery,
): Promise<{ items: ApiKeyDTO[]; total: number; page: number; limit: number }> => {
  const { skip, take, page, limit } = toPaginationParams(query);
  const sortBy = resolveSortField(query.sortBy, SORT_WHITELIST, 'createdAt');

  const where: Prisma.ApiKeyWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { merchant: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.apiKey.findMany({ where, skip, take, orderBy: { [sortBy]: query.sortOrder } }),
    prisma.apiKey.count({ where }),
  ]);

  return { items: items.map(toApiKeyDTO), total, page, limit };
};

export const getApiKeyById = async (id: string): Promise<ApiKeyDTO> => {
  const key = await prisma.apiKey.findUnique({ where: { id } });
  if (!key) throw new NotFoundError('API key not found.');
  return toApiKeyDTO(key);
};

/**
 * Creating an API key returns the plaintext exactly once. The caller is
 * responsible for surfacing it to the user and never persisting it.
 */
export const createApiKey = async (
  input: CreateApiKeyInput,
): Promise<{ apiKey: ApiKeyDTO; plaintext: string }> => {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new NotFoundError('Owner user not found.');

  const { plaintext, keyHash, keyPreview } = generateApiKey();

  const key = await prisma.apiKey.create({
    data: {
      userId: input.userId,
      name: input.name,
      merchant: input.merchant,
      keyHash,
      keyPreview,
      permissions: input.permissions,
      rateLimit: input.rateLimit,
      status: 'ACTIVE',
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  });

  return { apiKey: toApiKeyDTO(key), plaintext };
};

export const updateApiKey = async (id: string, input: UpdateApiKeyInput): Promise<ApiKeyDTO> => {
  const existing = await prisma.apiKey.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('API key not found.');

  const data: Prisma.ApiKeyUpdateInput = {
    name: input.name,
    merchant: input.merchant,
    permissions: input.permissions ? { set: input.permissions } : undefined,
    rateLimit: input.rateLimit,
    status: input.status,
    expiresAt:
      input.expiresAt === undefined
        ? undefined
        : input.expiresAt === null
        ? null
        : new Date(input.expiresAt),
  };

  const updated = await prisma.apiKey.update({ where: { id }, data });
  return toApiKeyDTO(updated);
};

export const deleteApiKey = async (id: string): Promise<ApiKey> => {
  const existing = await prisma.apiKey.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('API key not found.');
  return prisma.apiKey.delete({ where: { id } });
};
