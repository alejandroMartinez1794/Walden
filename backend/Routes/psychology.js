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
import mongoose from 'mongoose';
import PsychologicalPatient from '../models/PsychologicalPatientSchema.js';
import PsychologicalAssessment from '../models/PsychologicalAssessmentSchema.js';
import { createClinicalAssessment } from '../services/clinicalAssessmentService.js';

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

const submitPatientAssessment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    // Legacy patient-facing route: identity comes from the verified token,
    // never from a client-supplied patientId.
    if (!['paciente', 'patient'].includes(String(req.role || '').toLowerCase()) || (req.body.patientId && req.body.patientId !== req.userId)) {
      return res.status(403).json({ success: false, message: 'No autorizado para enviar esta evaluación' });
    }

    session.startTransaction();
    const patientProfiles = await PsychologicalPatient.find({
      user: req.userId,
      status: 'active',
      isDeleted: { $ne: true },
    }).session(session);

    if (patientProfiles.length !== 1) {
      await session.abortTransaction();
      return res.status(patientProfiles.length ? 409 : 404).json({
        success: false,
        message: patientProfiles.length
          ? 'Hay más de un expediente clínico asociado; contacte al profesional tratante'
          : 'No existe un expediente psicológico activo asociado a esta cuenta',
      });
    }

    const patient = patientProfiles[0];
    const Doctor = (await import('../models/DoctorSchema.js')).default;
    const doctor = await Doctor.findOne({
      _id: patient.psychologist,
      isApproved: 'approved',
    }).session(session);

    if (!doctor) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: 'El profesional asignado no está disponible para recibir la evaluación' });
    }

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const testType = req.body.assessmentType || req.body.testType || 'PHQ-9';
    const supportedTypes = new Set(['PHQ-9', 'GAD-7', 'BDI-II', 'BAI', 'PCL-5', 'OCI-R', 'YBOCS', 'AUDIT', 'PSS']);
    if (!supportedTypes.has(testType)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Instrumento no compatible con el registro clínico' });
    }

    const responses = answers.map((response, index) => ({
      itemNumber: index + 1,
      response: Number(response),
    }));
    const calculatedTotal = responses.reduce((sum, item) => sum + item.response, 0);
    const totalScore = req.body.totalScore === undefined ? calculatedTotal : Number(req.body.totalScore);

    if (!Number.isFinite(totalScore) || totalScore !== calculatedTotal) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'El puntaje enviado no coincide con las respuestas' });
    }

    const severity = testType === 'PHQ-9'
      ? (totalScore >= 20 ? 'severe' : totalScore >= 15 ? 'moderately-severe' : totalScore >= 10 ? 'moderate' : totalScore >= 5 ? 'mild' : 'minimal')
      : testType === 'GAD-7'
        ? (totalScore >= 15 ? 'severe' : totalScore >= 10 ? 'moderate' : totalScore >= 5 ? 'mild' : 'minimal')
        : (totalScore >= 29 ? 'severe' : totalScore >= 20 ? 'moderate' : totalScore >= 14 ? 'mild' : 'minimal');

    const assessmentData = {
      testType,
      testDate: req.body.dateTaken || new Date(),
      responses,
      scores: { total: totalScore },
      interpretation: {
        severity,
        clinicalNotes: req.body.detailedNotes,
      },
      ...((testType === 'PHQ-9' || testType === 'BDI-II') && Number(answers[8]) > 0 ? {
        riskAlert: {
          flagged: true,
          reason: 'Respuesta positiva en ítem 9; requiere evaluación clínica directa',
          action: 'Evaluar riesgo y activar el protocolo clínico correspondiente',
        },
      } : {}),
    };

    const { assessment, measureResult } = await createClinicalAssessment({
      assessmentData,
      patientId: patient._id,
      clinicianId: doctor._id,
      measureName: testType,
      responses,
      takenAt: assessmentData.testDate,
      session,
    });

    await session.commitTransaction();
    return res.status(201).json({
      success: true,
      data: {
        ...assessment.toObject(),
        totalScore,
        measureId: measureResult?.measure?._id,
        alertsCreated: measureResult?.alertsCreated?.length || 0,
      },
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: status === 500 ? 'Error al registrar evaluación' : error.message,
    });
  } finally {
    await session.endSession();
  }
};
const getSubmittedAssessment = async (req, res) => {
  const assessment = await PsychologicalAssessment.findById(req.params.id);
  if (!assessment) {
    return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
  }

  if (req.role === 'doctor') {
    if (assessment.psychologist?.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
  } else {
    const patient = await PsychologicalPatient.findOne({ _id: assessment.patient, user: req.userId });
    if (!patient) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
  }

  return res.status(200).json({ success: true, data: assessment });
};

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

router.post('/assessments/submit', authenticate, submitPatientAssessment);
router.get('/assessments/:id', authenticate, getSubmittedAssessment);

// Todas las rutas restantes requieren autenticación como doctor (psicólogo)
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
