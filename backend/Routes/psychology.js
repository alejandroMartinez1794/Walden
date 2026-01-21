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

// ✅ IMPORTAR VALIDACIÓN
import { validate, validateId } from '../validators/middleware/validate.js';
import { 
    createPsychologyPatientSchema,
    createSessionSchema,
    createAssessmentSchema,
    createTreatmentPlanSchema,
    updateTreatmentPlanSchema,
    getPsychologyQuerySchema
} from '../validators/schemas/psychology.schemas.js';

const router = express.Router();

/**
 * 🧠 RUTAS DE PSICOLOGÍA
 * 
 * Módulo especializado para terapia y salud mental
 * 
 * Componentes:
 * - Pacientes psicológicos (diferente de pacientes médicos)
 * - Sesiones de terapia (notas confidenciales)
 * - Evaluaciones psicológicas (tests estandarizados)
 * - Planes de tratamiento
 * - Historial clínico psicológico
 * 
 * Seguridad extrema:
 * - Solo doctores (psicólogos) pueden acceder
 * - Datos encriptados en BD
 * - Auditoría completa de accesos
 * - Cumplimiento HIPAA + APA Ethics Code
 */

// Todas las rutas requieren autenticación como doctor (psicólogo)
router.use(authenticate, restrict(['doctor']));

// ============ DASHBOARD ============
/**
 * Dashboard no requiere validación (sin params)
 */
router.get('/dashboard', getPsychologyDashboard);
router.get('/dashboard/cbt-overview', getCbtOverview);
router.post('/dashboard/seed-demo', seedCbtDemoData);

// ============ PACIENTES ============
/**
 * POST /api/v1/psychology/patients
 * 
 * Crear paciente psicológico
 * 
 * Validación:
 * - name: Obligatorio (2-100 caracteres)
 * - reasonForConsultation: Obligatorio (20-1000 caracteres)
 * - email, phone, age, gender: Opcionales
 */
router.post('/patients', validate(createPsychologyPatientSchema), createPatient);

/**
 * GET /api/v1/psychology/patients
 * 
 * Obtener mis pacientes (del psicólogo autenticado)
 * 
 * Query params: page, limit
 */
router.get('/patients', validate(getPsychologyQuerySchema, 'query'), getMyPatients);

/**
 * GET /api/v1/psychology/patients/:id
 * 
 * Obtener paciente por ID
 * 
 * Validación: ID debe ser MongoDB ObjectId válido
 */
router.get('/patients/:id', validateId, getPatientById);

/**
 * PUT /api/v1/psychology/patients/:id
 * 
 * Actualizar paciente
 * 
 * Validación: ID + campos opcionales
 */
router.put('/patients/:id', validateId, validate(createPsychologyPatientSchema), updatePatient);

// ============ SESIONES ============
/**
 * POST /api/v1/psychology/sessions
 * 
 * Crear sesión de terapia
 * 
 * Validación:
 * - patient: MongoDB ObjectId (obligatorio)
 * - sessionDate: ISO 8601 (obligatorio)
 * - duration: 15-180 minutos
 * - therapyType: cbt, dbt, psychodynamic, etc.
 * - notes: Mínimo 50 caracteres (confidencial)
 */
router.post('/sessions', validate(createSessionSchema), createSession);

/**
 * GET /api/v1/psychology/patients/:patientId/sessions
 * 
 * Obtener sesiones de un paciente
 */
router.get('/patients/:patientId/sessions', validateId, validate(getPsychologyQuerySchema, 'query'), getPatientSessions);

// ============ EVALUACIONES ============
/**
 * POST /api/v1/psychology/assessments
 * 
 * Crear evaluación psicológica (test estandarizado)
 * 
 * Validación:
 * - patient: MongoDB ObjectId
 * - testType: BDI-II, BAI, PHQ-9, GAD-7, etc.
 * - totalScore: 0-100
 * - interpretation: minimal, mild, moderate, severe
 */
router.post('/assessments', validate(createAssessmentSchema), createAssessment);

/**
 * GET /api/v1/psychology/patients/:patientId/assessments
 * 
 * Obtener evaluaciones de un paciente
 */
router.get('/patients/:patientId/assessments', validateId, validate(getPsychologyQuerySchema, 'query'), getPatientAssessments);

// ============ PLANES DE TRATAMIENTO ============
/**
 * POST /api/v1/psychology/treatment-plans
 * 
 * Crear plan de tratamiento
 * 
 * Validación:
 * - patient: MongoDB ObjectId
 * - goals: Array de objetivos (1-10)
 * - interventions: Array de intervenciones (1-15)
 * - estimatedDuration: 4-104 semanas
 * - sessionFrequency: 0.5-4 sesiones/semana
 */
router.post('/treatment-plans', validate(createTreatmentPlanSchema), createTreatmentPlan);

/**
 * GET /api/v1/psychology/patients/:patientId/treatment-plans
 * 
 * Obtener planes de tratamiento de un paciente
 */
router.get('/patients/:patientId/treatment-plans', validateId, validate(getPsychologyQuerySchema, 'query'), getPatientTreatmentPlans);

/**
 * PUT /api/v1/psychology/treatment-plans/:id
 * 
 * Actualizar plan de tratamiento
 */
router.put('/treatment-plans/:id', validateId, validate(updateTreatmentPlanSchema), updateTreatmentPlan);

// ============ HISTORIA CLÍNICA ============
/**
 * Historia clínica no tiene validación específica aún
 * TODO: Crear schema para historia clínica psicológica
 */
router.get('/patients/:patientId/clinical-history', validateId, getClinicalHistory);
router.put('/patients/:patientId/clinical-history', validateId, upsertClinicalHistory);

export default router;
