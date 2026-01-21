import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, verifyEmail, resendVerification, getCsrfToken, logout } from '../Controllers/authController.js';

const router = express.Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: 'Demasiados intentos. Intenta nuevamente en 15 minutos.',
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/csrf-token', getCsrfToken);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/logout', logout);

export default router;