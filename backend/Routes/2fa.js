
import express from 'express';
import { authenticate } from '../auth/verifyToken.js';
import * as twoFactorController from '../Controllers/twoFactorController.js';

const router = express.Router();

router.post('/setup', authenticate, twoFactorController.setup2FA);
router.post('/verify', authenticate, twoFactorController.verify2FA);
router.post('/validate', twoFactorController.validate2FALogin); // No auth required, used during login process
router.post('/disable', authenticate, twoFactorController.disable2FA);

export default router;
