import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { requireAtLeast, requireRoles } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  listApiKeysQuerySchema,
  apiKeyIdParamsSchema,
  createApiKeySchema,
  updateApiKeySchema,
} from './apiKeys.schemas.js';
import * as controller from './apiKeys.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireAtLeast('VIEWER'), validate({ query: listApiKeysQuerySchema }), controller.list);
router.get('/:id', requireAtLeast('VIEWER'), validate({ params: apiKeyIdParamsSchema }), controller.getOne);

router.post('/', requireRoles('SYSTEM_ADMIN', 'ADMIN'), validate({ body: createApiKeySchema }), controller.create);
router.patch(
  '/:id',
  requireRoles('SYSTEM_ADMIN', 'ADMIN'),
  validate({ params: apiKeyIdParamsSchema, body: updateApiKeySchema }),
  controller.update,
);
router.delete(
  '/:id',
  requireRoles('SYSTEM_ADMIN', 'ADMIN'),
  validate({ params: apiKeyIdParamsSchema }),
  controller.remove,
);

export default router;
