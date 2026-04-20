import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { requireAtLeast, requireRoles } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  listWalletsQuerySchema,
  walletIdParamsSchema,
  createWalletSchema,
  updateWalletSchema,
} from './wallets.schemas.js';
import * as controller from './wallets.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireAtLeast('VIEWER'), validate({ query: listWalletsQuerySchema }), controller.list);
router.get('/:id', requireAtLeast('VIEWER'), validate({ params: walletIdParamsSchema }), controller.getOne);

router.post(
  '/',
  requireRoles('SYSTEM_ADMIN', 'ADMIN', 'MANAGER'),
  validate({ body: createWalletSchema }),
  controller.create,
);
router.patch(
  '/:id',
  requireRoles('SYSTEM_ADMIN', 'ADMIN', 'MANAGER'),
  validate({ params: walletIdParamsSchema, body: updateWalletSchema }),
  controller.update,
);
router.delete(
  '/:id',
  requireRoles('SYSTEM_ADMIN', 'ADMIN'),
  validate({ params: walletIdParamsSchema }),
  controller.remove,
);

export default router;
