/**
 * Clinical Routes - Protocol Management
 * 
 * All routes require authentication and psychologist role.
 */

import express from 'express';
import {
  getProtocols,
  getProtocolDetails,
  completeStep,
  finalizeProtocol,
  getFollowUpProtocols,
  getActiveProtocols,
  amendProtocol,
} from '../../Controllers/clinical/protocolController.js';
import { authenticate, restrict } from '../../auth/verifyToken.js';

const router = express.Router();

// All clinical routes require authentication and psychologist role
router.use(authenticate);
router.use(restrict(['doctor']));

// Protocol listing
router.get('/', getProtocols);
router.get('/active', getActiveProtocols);
router.get('/follow-up', getFollowUpProtocols);

// Protocol operations
router.get('/:protocolId', getProtocolDetails);
router.put('/:protocolId/steps/:stepNumber', completeStep);
router.post('/:protocolId/finalize', finalizeProtocol);
router.put('/:protocolId/amend', amendProtocol);

export default router;
