import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { requireAtLeast } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  listActivityQuerySchema,
  activityIdParamsSchema,
} from './activity.schemas.js';
import * as controller from './activity.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(requireAtLeast('VIEWER'));

router.get('/', validate({ query: listActivityQuerySchema }), controller.list);
router.get('/:id', validate({ params: activityIdParamsSchema }), controller.getOne);

export default router;
