// backend/Routes/psychology.js
import express from 'express';
import {
  // Pacientes
  createPatient,
  getMyPatients,
  getPatientById,
  updatePatient,
  
  // Sesiones
  createSession,
  getPatientSessions,
  
  // Evaluaciones
  createAssessment,
  getPatientAssessments,
  
  // Planes de tratamiento
  createTreatmentPlan,
  getPatientTreatmentPlans,
  updateTreatmentPlan,
  // Historia clínica
  upsertClinicalHistory,
  getClinicalHistory,
  
  // Dashboard
  getPsychologyDashboard,
  getCbtOverview,
  seedCbtDemoData,
} from '../Controllers/psychologyController.js';

import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Todas las rutas requieren autenticación como doctor (psicólogo)
router.use(authenticate, restrict(['doctor']));

// ============ DASHBOARD ============
router.get('/dashboard', getPsychologyDashboard);
router.get('/dashboard/cbt-overview', getCbtOverview);
router.post('/dashboard/seed-demo', seedCbtDemoData);

// ============ PACIENTES ============
router.post('/patients', createPatient);
router.get('/patients', getMyPatients);
router.get('/patients/:id', getPatientById);
router.put('/patients/:id', updatePatient);

// ============ SESIONES ============
router.post('/sessions', createSession);
router.get('/patients/:patientId/sessions', getPatientSessions);

// ============ EVALUACIONES ============
router.post('/assessments', createAssessment);
router.get('/patients/:patientId/assessments', getPatientAssessments);

// ============ PLANES DE TRATAMIENTO ============
router.post('/treatment-plans', createTreatmentPlan);
router.get('/patients/:patientId/treatment-plans', getPatientTreatmentPlans);
router.put('/treatment-plans/:id', updateTreatmentPlan);

// ============ HISTORIA CLÍNICA ============
router.get('/patients/:patientId/clinical-history', getClinicalHistory);
router.put('/patients/:patientId/clinical-history', upsertClinicalHistory);

export default router;
