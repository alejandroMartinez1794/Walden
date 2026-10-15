/**
 * Clinical Routes - Treatment Plan Management
 * 
 * All routes require authentication and psychologist role.
 */

import express from 'express';
import {
  getTreatmentPlan,
  createTreatmentPlan,
  progressPhase,
  updateRiskAssessment,
  getProgressMetrics,
  getCaseload,
} from '../../Controllers/clinical/treatmentController.js';
import { authenticate, restrict } from '../../auth/verifyToken.js';
import { createFormalRiskAssessment } from '../../Controllers/clinical/formalRiskAssessmentController.js';

const router = express.Router();

// All clinical routes require authentication and psychologist role
router.use(authenticate);
router.use(restrict(['doctor'])); // In your system, doctors are psychologists

// Treatment plan management
router.get('/caseload', getCaseload);
router.post('/create', createTreatmentPlan);
router.get('/:treatmentPlanId', getTreatmentPlan);
router.get('/:treatmentPlanId/progress', getProgressMetrics);

// Phase progression
router.put('/:treatmentPlanId/phase', progressPhase);

// Legacy risk snapshot endpoint retained during migration.
router.post('/:treatmentPlanId/risk-assessment', updateRiskAssessment);

// Formal risk assessment: creates the immutable clinical authority record candidate.
router.post('/:treatmentPlanId/risk-assessments', createFormalRiskAssessment);

export default router;
