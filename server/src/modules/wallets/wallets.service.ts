import type { Prisma, Wallet } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import {
  toPaginationParams,
  resolveSortField,
} from '../../utils/pagination.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import type {
  ListWalletsQuery,
  CreateWalletInput,
  UpdateWalletInput,
} from './wallets.schemas.js';

const SORT_WHITELIST = ['createdAt', 'updatedAt', 'status', 'network', 'label'] as const;

export type WalletDTO = {
  id: string;
  label: string | null;
  address: string;
  network: Wallet['network'];
  status: Wallet['status'];
  assignedUserId: string | null;
  assignedUser: { id: string; name: string; email: string } | null;
  createdAt: Date;
  updatedAt: Date;
};

export const toWalletDTO = (
  w: Wallet & { assignedUser?: { id: string; name: string; email: string } | null },
): WalletDTO => ({
  id: w.id,
  label: w.label,
  address: w.address,
  network: w.network,
  status: w.status,
  assignedUserId: w.assignedUserId,
  assignedUser: w.assignedUser ?? null,
  createdAt: w.createdAt,
  updatedAt: w.updatedAt,
});

export const listWallets = async (
  query: ListWalletsQuery,
): Promise<{ items: WalletDTO[]; total: number; page: number; limit: number }> => {
  const { skip, take, page, limit } = toPaginationParams(query);
  const sortBy = resolveSortField(query.sortBy, SORT_WHITELIST, 'createdAt');

  const where: Prisma.WalletWhereInput = {
    ...(query.network ? { network: query.network } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.unassigned ? { assignedUserId: null } : {}),
    ...(query.assignedUserId ? { assignedUserId: query.assignedUserId } : {}),
    ...(query.search
      ? {
          OR: [
            { address: { contains: query.search, mode: 'insensitive' } },
            { label: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.wallet.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: query.sortOrder },
      include: { assignedUser: { select: { id: true, name: true, email: true } } },
    }),
    prisma.wallet.count({ where }),
  ]);

  return { items: items.map(toWalletDTO), total, page, limit };
};

export const getWalletById = async (id: string): Promise<WalletDTO> => {
  const wallet = await prisma.wallet.findUnique({
    where: { id },
    include: { assignedUser: { select: { id: true, name: true, email: true } } },
  });
  if (!wallet) throw new NotFoundError('Wallet not found.');
  return toWalletDTO(wallet);
};

const ensureAssignedUserExists = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('Assigned user not found.');
};

const assertAddressUnique = async (network: Wallet['network'], address: string, ignoreId?: string) => {
  const existing = await prisma.wallet.findUnique({
    where: { network_address: { network, address } },
    select: { id: true },
  });
  if (existing && existing.id !== ignoreId) {
    throw new ConflictError('A wallet with this address and network already exists.');
  }
};

export const createWallet = async (input: CreateWalletInput): Promise<WalletDTO> => {
  if (input.assignedUserId) await ensureAssignedUserExists(input.assignedUserId);
  await assertAddressUnique(input.network, input.address);

  const wallet = await prisma.wallet.create({
    data: {
      label: input.label ?? null,
      address: input.address,
      network: input.network,
      status: input.status,
      assignedUserId: input.assignedUserId ?? null,
    },
    include: { assignedUser: { select: { id: true, name: true, email: true } } },
  });
  return toWalletDTO(wallet);
};

export const updateWallet = async (id: string, input: UpdateWalletInput): Promise<WalletDTO> => {
  const existing = await prisma.wallet.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Wallet not found.');

  if (input.assignedUserId) await ensureAssignedUserExists(input.assignedUserId);

  const nextNetwork = input.network ?? existing.network;
  const nextAddress = input.address ?? existing.address;
  if (input.network || input.address) {
    await assertAddressUnique(nextNetwork, nextAddress, existing.id);
  }

  const wallet = await prisma.wallet.update({
    where: { id },
    data: {
      label: input.label,
      address: input.address,
      network: input.network,
      status: input.status,
      assignedUserId:
        input.assignedUserId === undefined
          ? undefined
          : input.assignedUserId ?? null,
    },
    include: { assignedUser: { select: { id: true, name: true, email: true } } },
  });
  return toWalletDTO(wallet);
};

export const deleteWallet = async (id: string): Promise<Wallet> => {
  const existing = await prisma.wallet.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Wallet not found.');
  return prisma.wallet.delete({ where: { id } });
};
