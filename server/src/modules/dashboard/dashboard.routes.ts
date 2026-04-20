import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { requireAtLeast } from '../../middleware/rbac.js';
import * as controller from './dashboard.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(requireAtLeast('VIEWER'));

router.get('/summary', controller.summary);
router.get('/recent-deposits', controller.recentDeposits);
router.get('/network-health', controller.networkHealth);

export default router;
