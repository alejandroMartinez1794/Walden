import express from 'express';
import { authenticate, restrict } from '../../auth/verifyToken.js';
import {
  approveARCORequest,
  getARCOMetrics,
  listARCORequests,
  listMyARCORequests,
  rejectARCORequest,
  submitAccessRequest,
  submitCancellationRequest,
  submitOppositionRequest,
  submitRectificationRequest,
} from '../../Controllers/clinical/arcoController.js';
import { validate, validateId } from '../../validators/middleware/validate.js';
import {
  createARCORequestSchema,
  listARCORequestsQuerySchema,
  reviewARCORequestSchema,
} from '../../validators/schemas/arco.schemas.js';

const router = express.Router();

router.use(authenticate);

router.post('/request-access', validate(createARCORequestSchema), submitAccessRequest);
router.post('/request-rectification', validate(createARCORequestSchema), submitRectificationRequest);
router.post('/request-cancellation', validate(createARCORequestSchema), submitCancellationRequest);
router.post('/request-opposition', validate(createARCORequestSchema), submitOppositionRequest);

router.get('/my-requests', listMyARCORequests);
router.get('/metrics', restrict(['admin']), getARCOMetrics);
router.get('/requests', restrict(['admin']), validate(listARCORequestsQuerySchema, 'query'), listARCORequests);
router.post('/requests/:id/approve', restrict(['admin']), validateId, validate(reviewARCORequestSchema), approveARCORequest);
router.post('/requests/:id/reject', restrict(['admin']), validateId, validate(reviewARCORequestSchema), rejectARCORequest);

export default router;