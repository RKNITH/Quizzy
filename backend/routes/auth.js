import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../../controllers/authController.js';
import { authenticate } from '../../middleware/auth.js';
import { validate, registerSchema, loginSchema } from '../../middleware/validate.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);

export default router;
