import type { CryptoNetwork } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { toDepositDTO, type DepositDTO } from '../deposits/deposits.service.js';

export interface DashboardSummary {
  totalDepositAmount: string;
  totalDepositCount: number;
  pendingCount: number;
  detectedCount: number;
  confirmingCount: number;
  completedCount: number;
  walletCount: number;
  activeWalletCount: number;
  userCount: number;
  activeUserCount: number;
  generatedAt: string;
}

export const getSummary = async (): Promise<DashboardSummary> => {
  const [
    totalCount,
    pendingCount,
    detectedCount,
    confirmingCount,
    completedCount,
    walletCount,
    activeWalletCount,
    userCount,
    activeUserCount,
    sumResult,
  ] = await Promise.all([
    prisma.deposit.count(),
    prisma.deposit.count({ where: { status: 'PENDING' } }),
    prisma.deposit.count({ where: { status: 'DETECTED' } }),
    prisma.deposit.count({ where: { status: 'CONFIRMING' } }),
    prisma.deposit.count({ where: { status: 'COMPLETED' } }),
    prisma.wallet.count(),
    prisma.wallet.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    }),
  ]);

  return {
    totalDepositAmount: (sumResult._sum.amount ?? 0).toString(),
    totalDepositCount: totalCount,
    pendingCount,
    detectedCount,
    confirmingCount,
    completedCount,
    walletCount,
    activeWalletCount,
    userCount,
    activeUserCount,
    generatedAt: new Date().toISOString(),
  };
};

export const getRecentDeposits = async (limit = 8): Promise<DepositDTO[]> => {
  const deposits = await prisma.deposit.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 50),
  });
  return deposits.map(toDepositDTO);
};

export interface NetworkHealthEntry {
  network: CryptoNetwork;
  depositCount: number;
  walletCount: number;
  activeWalletCount: number;
  completedDepositCount: number;
  pendingDepositCount: number;
  status: 'online' | 'offline' | 'mock';
}

export const getNetworkHealth = async (): Promise<NetworkHealthEntry[]> => {
  const [depositGroups, walletGroups, completedGroups, pendingGroups, activeWalletGroups] = await Promise.all([
    prisma.deposit.groupBy({ by: ['network'], _count: { _all: true } }),
    prisma.wallet.groupBy({ by: ['network'], _count: { _all: true } }),
    prisma.deposit.groupBy({
      by: ['network'],
      where: { status: 'COMPLETED' },
      _count: { _all: true },
    }),
    prisma.deposit.groupBy({
      by: ['network'],
      where: { status: 'PENDING' },
      _count: { _all: true },
    }),
    prisma.wallet.groupBy({
      by: ['network'],
      where: { status: 'ACTIVE' },
      _count: { _all: true },
    }),
  ]);

  const allNetworks = new Set<CryptoNetwork>([
    ...depositGroups.map((g) => g.network),
    ...walletGroups.map((g) => g.network),
  ]);

  return Array.from(allNetworks).map<NetworkHealthEntry>((network) => {
    const deposits = depositGroups.find((g) => g.network === network)?._count._all ?? 0;
    const wallets = walletGroups.find((g) => g.network === network)?._count._all ?? 0;
    const activeWallets = activeWalletGroups.find((g) => g.network === network)?._count._all ?? 0;
    const completed = completedGroups.find((g) => g.network === network)?._count._all ?? 0;
    const pending = pendingGroups.find((g) => g.network === network)?._count._all ?? 0;
    // Until we wire real chain listeners, networks with any active wallet are
    // reported as "mock"; networks with none look "offline".
    const status: NetworkHealthEntry['status'] = activeWallets > 0 ? 'mock' : 'offline';
    return {
      network,
      depositCount: deposits,
      walletCount: wallets,
      activeWalletCount: activeWallets,
      completedDepositCount: completed,
      pendingDepositCount: pending,
      status,
    };
  });
};
