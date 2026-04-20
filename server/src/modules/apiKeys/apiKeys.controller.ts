import type { NextFunction, Request, Response } from 'express';
import * as service from './apiKeys.service.js';
import { ok, created, noContent, pageMeta } from '../../lib/apiResponse.js';
import { logActivity } from '../../lib/activityLogger.js';

const actor = (req: Request) => ({ id: req.user?.id ?? null, name: req.user?.email ?? 'System' });

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.listApiKeys(req.query as unknown as Parameters<typeof service.listApiKeys>[0]);
    ok(res, result.items, 'API keys fetched', pageMeta(result));
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = await service.getApiKeyById((req.params.id as string));
    ok(res, key, 'API key fetched');
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { apiKey, plaintext } = await service.createApiKey(req.body);
    await logActivity({
      action: 'apiKey.create',
      category: 'API',
      description: `Issued API key "${apiKey.name}" for ${apiKey.merchant}`,
      severity: 'SUCCESS',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      apiKeyId: apiKey.id,
      metadata: { permissions: apiKey.permissions, rateLimit: apiKey.rateLimit },
    });
    // The plaintext key is returned exactly once; clients must store it.
    created(res, { ...apiKey, key: plaintext }, 'API key created — store this key, it will not be shown again.');
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = await service.updateApiKey((req.params.id as string), req.body);
    await logActivity({
      action: 'apiKey.update',
      category: 'API',
      description: `Updated API key "${key.name}"`,
      severity: 'INFO',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      apiKeyId: key.id,
      metadata: req.body,
    });
    ok(res, key, 'API key updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = await service.deleteApiKey((req.params.id as string));
    await logActivity({
      action: 'apiKey.delete',
      category: 'API',
      description: `Deleted API key "${key.name}"`,
      severity: 'WARNING',
      actor: actor(req),
      ipAddress: req.ip,
      requestId: req.requestId,
      apiKeyId: key.id,
    });
    noContent(res);
  } catch (err) {
    next(err);
  }
};
