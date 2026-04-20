import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware, optionalAuth } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './auth.controller.js';
import { loginSchema, registerSchema, refreshSchema } from './auth.schemas.js';

const router = Router();

// Tighter limit on auth surface — mitigates brute force / credential stuffing.
const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts.', code: 'RATE_LIMITED' },
});

router.post('/login', authLimiter, validate({ body: loginSchema }), controller.login);

// Register remains public in dev; an operator can lock it down later by
// wrapping this route with `authMiddleware` + `requireRoles('SYSTEM_ADMIN')`.
router.post('/register', authLimiter, optionalAuth, validate({ body: registerSchema }), controller.register);

router.get('/me', authMiddleware, controller.me);
router.post('/refresh', authLimiter, validate({ body: refreshSchema }), controller.refresh);
router.post('/logout', optionalAuth, controller.logout);

export default router;
