
import express from 'express';
import { authenticate } from '../auth/verifyToken.js';
import * as twoFactorController from '../Controllers/twoFactorController.js';
import { validate } from '../validators/middleware/validate.js';
import { twoFactorSetupSchema, twoFactorLoginSchema } from '../validators/schemas/auth.schemas.js';

const router = express.Router();

router.post('/setup', authenticate, twoFactorController.setup2FA);
router.post('/verify', authenticate, validate(twoFactorSetupSchema), twoFactorController.verify2FA);
router.post('/validate', validate(twoFactorLoginSchema), twoFactorController.validate2FALogin); // No auth required, used during login process
router.post('/disable', authenticate, twoFactorController.disable2FA);

export default router;
