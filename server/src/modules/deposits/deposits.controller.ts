import type { NextFunction, Request, Response } from 'express';
import * as service from './deposits.service.js';
import { ok, created, noContent, pageMeta } from '../../lib/apiResponse.js';
import { logActivity } from '../../lib/activityLogger.js';

const actor = (req: Request) => ({ id: req.user?.id ?? null, name: req.user?.email ?? 'System' });

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.listDeposits(req.query as unknown as Parameters<typeof service.listDeposits>[0]);
    ok(res, result.items, 'Deposits fetched successfully', pageMeta(result));
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deposit = await service.getDepositById((req.params.id as string));
    ok(res, deposit, 'Deposit fetched');
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deposit = await service.createDeposit(req.body);
    await logActivity({
      action: 'deposit.create',
      category: 'DEPOSIT',
      description: `New ${deposit.network} deposit of ${deposit.amount} ${deposit.assetSymbol} for ${deposit.userDisplayName}`,
      severity: 'INFO',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      depositId: deposit.id,
      metadata: { network: deposit.network, amount: deposit.amount, status: deposit.status },
    });
    created(res, deposit, 'Deposit created');
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deposit = await service.updateDeposit((req.params.id as string), req.body);
    await logActivity({
      action: 'deposit.update',
      category: 'DEPOSIT',
      description: `Updated deposit ${deposit.id}`,
      severity: 'INFO',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      depositId: deposit.id,
      metadata: req.body,
    });
    ok(res, deposit, 'Deposit updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deposit = await service.deleteDeposit((req.params.id as string));
    await logActivity({
      action: 'deposit.delete',
      category: 'DEPOSIT',
      description: `Deleted deposit ${deposit.id}`,
      severity: 'WARNING',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      depositId: deposit.id,
    });
    noContent(res);
  } catch (err) {
    next(err);
  }
};

export const advance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deposit = await service.advanceStatus((req.params.id as string));
    await logActivity({
      action: 'deposit.advance',
      category: 'DEPOSIT',
      description: `Deposit ${deposit.id} advanced to ${deposit.status}`,
      severity: deposit.status === 'COMPLETED' ? 'SUCCESS' : 'INFO',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      depositId: deposit.id,
      metadata: { status: deposit.status },
    });
    ok(res, deposit, 'Deposit status advanced');
  } catch (err) {
    next(err);
  }
};
