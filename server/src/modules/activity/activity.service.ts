import type { ActivityLog, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { toPaginationParams } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';
import type { ListActivityQuery } from './activity.schemas.js';

export type ActivityLogDTO = {
  id: string;
  action: string;
  category: ActivityLog['category'];
  description: string;
  severity: ActivityLog['severity'];
  actorUserId: string | null;
  actorName: string;
  ipAddress: string | null;
  userAgent: string | null;
  targetUserId: string | null;
  depositId: string | null;
  walletId: string | null;
  apiKeyId: string | null;
  requestId: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

export const toActivityDTO = (a: ActivityLog): ActivityLogDTO => ({
  id: a.id,
  action: a.action,
  category: a.category,
  description: a.description,
  severity: a.severity,
  actorUserId: a.actorUserId,
  actorName: a.actorName,
  ipAddress: a.ipAddress,
  userAgent: a.userAgent,
  targetUserId: a.targetUserId,
  depositId: a.depositId,
  walletId: a.walletId,
  apiKeyId: a.apiKeyId,
  requestId: a.requestId,
  metadata: a.metadata,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

export const listActivity = async (
  query: ListActivityQuery,
): Promise<{ items: ActivityLogDTO[]; total: number; page: number; limit: number }> => {
  const { skip, take, page, limit } = toPaginationParams(query);

  const where: Prisma.ActivityLogWhereInput = {
    ...(query.category ? { category: query.category } : {}),
    ...(query.severity ? { severity: query.severity } : {}),
    ...(query.actorUserId ? { actorUserId: query.actorUserId } : {}),
    ...(query.search
      ? {
          OR: [
            { action: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { actorName: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: query.sortOrder },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { items: items.map(toActivityDTO), total, page, limit };
};

export const getActivityById = async (id: string): Promise<ActivityLogDTO> => {
  const entry = await prisma.activityLog.findUnique({ where: { id } });
  if (!entry) throw new NotFoundError('Activity entry not found.');
  return toActivityDTO(entry);
};
