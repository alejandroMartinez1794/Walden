/**
 * Clinical Routes - Alert Management
 * 
 * All routes require authentication and psychologist role.
 */

import express from 'express';
import {
  getAlerts,
  detectRisks,
  acknowledgeAlert,
  resolveAlert,
  activateProtocol,
  getOverdueAlerts,
} from '../../Controllers/clinical/alertController.js';
import { authenticate, restrict } from '../../auth/verifyToken.js';

const router = express.Router();

// All clinical routes require authentication and psychologist role
router.use(authenticate);
router.use(restrict(['doctor']));

// Alert management
router.get('/', getAlerts);
router.get('/overdue', getOverdueAlerts);
router.post('/detect', detectRisks);

// Alert actions
router.put('/:alertId/acknowledge', acknowledgeAlert);
router.put('/:alertId/resolve', resolveAlert);
router.post('/:alertId/activate-protocol', activateProtocol);

export default router;
