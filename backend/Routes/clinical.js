// backend/Routes/clinical.js
import express from 'express';
import { authenticate, restrict } from '../auth/verifyToken.js';
import { createMeasure, generateClinicalSummaryHandler, listAlerts, resolveAlert, updateAlertMitigation, acceptSuggestion, sendConsentEmail } from '../Controllers/clinicalController.js';

const router = express.Router();

router.use(authenticate, restrict(['doctor']));

// Tools
router.post('/send-consent', sendConsentEmail);

// Measures (creates score, risk, and alerts)
router.post('/patients/:id/measures', createMeasure);

// Clinical summary and suggestion log
router.post('/patients/:id/clinical-summary', generateClinicalSummaryHandler);

// Alerts
router.get('/patients/:id/alerts', listAlerts);
router.patch('/alerts/:alertId/resolve', resolveAlert);
router.patch('/alerts/:alertId/mitigation', updateAlertMitigation);

// Clinical suggestion acceptance
router.patch('/suggestions/:logId/accept', acceptSuggestion);

export default router;
