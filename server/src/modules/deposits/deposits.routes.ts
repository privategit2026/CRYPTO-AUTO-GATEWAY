import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { requireAtLeast, requireRoles } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  listDepositsQuerySchema,
  depositIdParamsSchema,
  createDepositSchema,
  updateDepositSchema,
} from './deposits.schemas.js';
import * as controller from './deposits.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireAtLeast('VIEWER'), validate({ query: listDepositsQuerySchema }), controller.list);
router.get('/:id', requireAtLeast('VIEWER'), validate({ params: depositIdParamsSchema }), controller.getOne);

router.post(
  '/',
  requireRoles('SYSTEM_ADMIN', 'ADMIN', 'MANAGER'),
  validate({ body: createDepositSchema }),
  controller.create,
);
router.patch(
  '/:id',
  requireRoles('SYSTEM_ADMIN', 'ADMIN', 'MANAGER'),
  validate({ params: depositIdParamsSchema, body: updateDepositSchema }),
  controller.update,
);
router.delete(
  '/:id',
  requireRoles('SYSTEM_ADMIN', 'ADMIN'),
  validate({ params: depositIdParamsSchema }),
  controller.remove,
);

router.post(
  '/:id/advance-status',
  requireRoles('SYSTEM_ADMIN', 'ADMIN', 'MANAGER'),
  validate({ params: depositIdParamsSchema }),
  controller.advance,
);

export default router;
