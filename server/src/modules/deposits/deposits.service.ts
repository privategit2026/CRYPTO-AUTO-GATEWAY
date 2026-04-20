import type { Deposit, DepositStatus, Prisma } from '@prisma/client';
import { Prisma as P } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import {
  toPaginationParams,
  resolveSortField,
} from '../../utils/pagination.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../utils/errors.js';
import type {
  ListDepositsQuery,
  CreateDepositInput,
  UpdateDepositInput,
} from './deposits.schemas.js';

const SORT_WHITELIST = ['createdAt', 'updatedAt', 'amount', 'status'] as const;

/**
 * Status state machine per project spec:
 *   pending → detected → confirming → completed.
 * COMPLETED is a terminal "happy path" state. FAILED / EXPIRED are terminal
 * unhappy states and are not advanced by this helper.
 */
export const STATUS_FLOW: Record<DepositStatus, DepositStatus> = {
  PENDING: 'DETECTED',
  DETECTED: 'CONFIRMING',
  CONFIRMING: 'COMPLETED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
};

export type DepositDTO = {
  id: string;
  userId: string | null;
  userDisplayName: string;
  walletId: string | null;
  amount: string;
  assetSymbol: string;
  network: Deposit['network'];
  address: string;
  txid: string | null;
  status: DepositStatus;
  confirmations: number;
  requiredConfirmations: number | null;
  detectedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date | null;
  externalOrderId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const toDepositDTO = (d: Deposit): DepositDTO => ({
  id: d.id,
  userId: d.userId,
  userDisplayName: d.userDisplayName,
  walletId: d.walletId,
  amount: d.amount.toString(),
  assetSymbol: d.assetSymbol,
  network: d.network,
  address: d.address,
  txid: d.txid,
  status: d.status,
  confirmations: d.confirmations,
  requiredConfirmations: d.requiredConfirmations,
  detectedAt: d.detectedAt,
  completedAt: d.completedAt,
  expiresAt: d.expiresAt,
  externalOrderId: d.externalOrderId,
  createdAt: d.createdAt,
  updatedAt: d.updatedAt,
});

export const listDeposits = async (
  query: ListDepositsQuery,
): Promise<{ items: DepositDTO[]; total: number; page: number; limit: number }> => {
  const { skip, take, page, limit } = toPaginationParams(query);
  const sortBy = resolveSortField(query.sortBy, SORT_WHITELIST, 'createdAt');

  const where: Prisma.DepositWhereInput = {
    ...(query.network ? { network: query.network } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.search
      ? {
          OR: [
            { userDisplayName: { contains: query.search, mode: 'insensitive' } },
            { txid: { contains: query.search, mode: 'insensitive' } },
            { address: { contains: query.search, mode: 'insensitive' } },
            { externalOrderId: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.deposit.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: query.sortOrder },
    }),
    prisma.deposit.count({ where }),
  ]);

  return { items: items.map(toDepositDTO), total, page, limit };
};

export const getDepositById = async (id: string): Promise<DepositDTO> => {
  const deposit = await prisma.deposit.findUnique({ where: { id } });
  if (!deposit) throw new NotFoundError('Deposit not found.');
  return toDepositDTO(deposit);
};

const ensureTxidUnique = async (
  network: Deposit['network'],
  txid: string | null | undefined,
  ignoreId?: string,
) => {
  if (!txid) return;
  const existing = await prisma.deposit.findUnique({
    where: { network_txid: { network, txid } },
    select: { id: true },
  });
  if (existing && existing.id !== ignoreId) {
    throw new ConflictError('A deposit with this txid already exists on this network.');
  }
};

export const createDeposit = async (input: CreateDepositInput): Promise<DepositDTO> => {
  await ensureTxidUnique(input.network, input.txid ?? null);

  const deposit = await prisma.deposit.create({
    data: {
      userId: input.userId ?? null,
      userDisplayName: input.userDisplayName,
      walletId: input.walletId ?? null,
      amount: new P.Decimal(input.amount),
      assetSymbol: input.assetSymbol,
      network: input.network,
      address: input.address,
      txid: input.txid ?? null,
      status: input.status,
      confirmations: input.confirmations ?? 0,
      requiredConfirmations: input.requiredConfirmations ?? null,
      externalOrderId: input.externalOrderId,
      detectedAt: input.status === 'DETECTED' || input.status === 'CONFIRMING' || input.status === 'COMPLETED'
        ? new Date()
        : null,
      completedAt: input.status === 'COMPLETED' ? new Date() : null,
    },
  });
  return toDepositDTO(deposit);
};

export const updateDeposit = async (id: string, input: UpdateDepositInput): Promise<DepositDTO> => {
  const existing = await prisma.deposit.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Deposit not found.');

  const nextNetwork = input.network ?? existing.network;
  const nextTxid = input.txid === undefined ? existing.txid : input.txid;
  if (input.network !== undefined || input.txid !== undefined) {
    await ensureTxidUnique(nextNetwork, nextTxid, existing.id);
  }

  const data: Prisma.DepositUpdateInput = {
    userDisplayName: input.userDisplayName,
    amount: input.amount !== undefined ? new P.Decimal(input.amount) : undefined,
    assetSymbol: input.assetSymbol,
    network: input.network,
    address: input.address,
    txid: input.txid === undefined ? undefined : input.txid ?? null,
    status: input.status,
    confirmations: input.confirmations,
    requiredConfirmations: input.requiredConfirmations,
    externalOrderId: input.externalOrderId,
  };
  if (input.userId !== undefined) {
    data.user = input.userId ? { connect: { id: input.userId } } : { disconnect: true };
  }
  if (input.walletId !== undefined) {
    data.wallet = input.walletId ? { connect: { id: input.walletId } } : { disconnect: true };
  }

  const updated = await prisma.deposit.update({ where: { id }, data });
  return toDepositDTO(updated);
};

export const deleteDeposit = async (id: string): Promise<Deposit> => {
  const existing = await prisma.deposit.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Deposit not found.');
  return prisma.deposit.delete({ where: { id } });
};

/**
 * Move a deposit to the next status per the state machine. Noop when the
 * deposit is already COMPLETED, FAILED or EXPIRED.
 */
export const advanceStatus = async (id: string): Promise<DepositDTO> => {
  const existing = await prisma.deposit.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Deposit not found.');

  if (existing.status === 'FAILED' || existing.status === 'EXPIRED') {
    throw new BadRequestError(`Cannot advance a ${existing.status.toLowerCase()} deposit.`);
  }

  const nextStatus = STATUS_FLOW[existing.status];
  if (nextStatus === existing.status) {
    // Already terminal happy state — return as-is.
    return toDepositDTO(existing);
  }

  const now = new Date();
  const data: Prisma.DepositUpdateInput = { status: nextStatus };

  if (nextStatus === 'DETECTED' && !existing.detectedAt) data.detectedAt = now;
  if (nextStatus === 'COMPLETED' && !existing.completedAt) data.completedAt = now;

  const updated = await prisma.deposit.update({ where: { id }, data });
  return toDepositDTO(updated);
};
