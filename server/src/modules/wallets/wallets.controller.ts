import type { NextFunction, Request, Response } from 'express';
import * as service from './wallets.service.js';
import { ok, created, noContent, pageMeta } from '../../lib/apiResponse.js';
import { logActivity } from '../../lib/activityLogger.js';

const actor = (req: Request) => ({ id: req.user?.id ?? null, name: req.user?.email ?? 'System' });

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.listWallets(req.query as unknown as Parameters<typeof service.listWallets>[0]);
    ok(res, result.items, 'Wallets fetched successfully', pageMeta(result));
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await service.getWalletById((req.params.id as string));
    ok(res, wallet, 'Wallet fetched');
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await service.createWallet(req.body);
    await logActivity({
      action: 'wallet.create',
      category: 'WALLET',
      description: `Added ${wallet.network} wallet ${wallet.address}`,
      severity: 'SUCCESS',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      walletId: wallet.id,
      metadata: { network: wallet.network, assignedUserId: wallet.assignedUserId },
    });
    created(res, wallet, 'Wallet created');
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await service.updateWallet((req.params.id as string), req.body);
    await logActivity({
      action: 'wallet.update',
      category: 'WALLET',
      description: `Updated wallet ${wallet.address}`,
      severity: 'INFO',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      walletId: wallet.id,
      metadata: req.body,
    });
    ok(res, wallet, 'Wallet updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await service.deleteWallet((req.params.id as string));
    await logActivity({
      action: 'wallet.delete',
      category: 'WALLET',
      description: `Deleted wallet ${wallet.address}`,
      severity: 'WARNING',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      walletId: wallet.id,
    });
    noContent(res);
  } catch (err) {
    next(err);
  }
};
