import type { Prisma, ActivityCategory, ActivitySeverity } from '@prisma/client';
import { prisma } from './prisma.js';
import { logger } from './logger.js';
import type { AuthenticatedUser } from '../types/auth.js';

export interface LogActivityInput {
  action: string;
  category: ActivityCategory;
  description: string;
  severity?: ActivitySeverity;

  actor?: { id?: string | null; name?: string | null } | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;

  targetUserId?: string | null;
  depositId?: string | null;
  walletId?: string | null;
  apiKeyId?: string | null;

  metadata?: Prisma.InputJsonValue | null;
}

/**
 * Fire-and-forget activity recorder. Callers should not await this in a hot
 * path — it swallows errors so an auditing glitch never breaks a mutation.
 */
export const logActivity = async (input: LogActivityInput): Promise<void> => {
  try {
    await prisma.activityLog.create({
      data: {
        action: input.action,
        category: input.category,
        description: input.description,
        severity: input.severity ?? 'INFO',
        actorUserId: input.actor?.id ?? null,
        actorName: input.actor?.name ?? 'System',
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        requestId: input.requestId ?? null,
        targetUserId: input.targetUserId ?? null,
        depositId: input.depositId ?? null,
        walletId: input.walletId ?? null,
        apiKeyId: input.apiKeyId ?? null,
        metadata: input.metadata ?? undefined,
      },
    });
  } catch (err) {
    logger.warn({ err, input }, 'activity log write failed');
  }
};

export const actorFromUser = (
  user: AuthenticatedUser | undefined,
  fallbackName: string = 'System',
): { id?: string | null; name?: string | null } | null => {
  if (!user) return { id: null, name: fallbackName };
  return { id: user.id, name: user.email };
};
