
import express from 'express';
import { authenticate } from '../auth/verifyToken.js';
import * as paymentController from '../Controllers/paymentController.js';
import { validate } from '../validators/middleware/validate.js';
import { generatePaymentSignatureSchema, wompiWebhookSchema } from '../validators/schemas/payment.schemas.js';

const router = express.Router();

// Generar firma para el widget (Frontend -> Backend)
router.post('/signature', authenticate, validate(generatePaymentSignatureSchema), paymentController.generatePaymentSignature);

// Webhook (Wompi -> Backend)
// NOTA: Este endpoint no lleva 'authenticate' porque lo llama el servidor de Wompi, no un usuario logueado.
// La seguridad se maneja validando la firma (checksum/secret).
router.post('/webhook', validate(wompiWebhookSchema), paymentController.wompiWebhook);

export default router;
