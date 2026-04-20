import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { requireAtLeast, requireRoles } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  listUsersQuerySchema,
  userIdParamsSchema,
  createUserSchema,
  updateUserSchema,
} from './users.schemas.js';
import * as controller from './users.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireAtLeast('VIEWER'), validate({ query: listUsersQuerySchema }), controller.list);
router.get('/:id', requireAtLeast('VIEWER'), validate({ params: userIdParamsSchema }), controller.getOne);

router.post('/', requireRoles('SYSTEM_ADMIN', 'ADMIN'), validate({ body: createUserSchema }), controller.create);
router.patch(
  '/:id',
  requireRoles('SYSTEM_ADMIN', 'ADMIN'),
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  controller.update,
);
router.delete(
  '/:id',
  requireRoles('SYSTEM_ADMIN', 'ADMIN'),
  validate({ params: userIdParamsSchema }),
  controller.remove,
);

export default router;
