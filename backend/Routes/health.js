import express from 'express';
import { authenticate, restrict } from '../auth/verifyToken.js';
import {
  getMyMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  takeMedicationDose,
  getMyMetrics,
  addMetric,
  getMyRecords,
  createRecord,
} from '../Controllers/healthController.js';

// ✅ IMPORTAR VALIDACIÓN
import { validate, validateId } from '../validators/middleware/validate.js';
import { 
  createHealthMetricSchema,
  getHealthMetricsQuerySchema,
  createMedicationSchema,
  updateMedicationSchema,
  createMedicalRecordSchema
} from '../validators/schemas/health.schemas.js';

const router = express.Router();

/**
 * 🏥 RUTAS DE SALUD
 * 
 * Módulo de seguimiento de salud personal
 * 
 * Componentes:
 * - Medicamentos (recordatorios, dosis)
 * - Métricas de salud (presión, peso, glucosa, etc.)
 * - Registros médicos (documentos, análisis)
 * 
 * Seguridad:
 * - Solo pacientes autenticados
 * - Datos altamente sensibles (HIPAA)
 * - Encriptación en tránsito y reposo
 */

// Todas las rutas requieren autenticación como paciente
router.use(authenticate, restrict(['paciente']));

// ============ MEDICAMENTOS ============
/**
 * TODO: Crear schemas para medicamentos
 * - Nombre, dosis, frecuencia, duración
 * - Recordatorios automáticos
 * - Seguimiento de adherencia
 */
router.get('/medications', getMyMedications);
router.post('/medications', validate(createMedicationSchema), createMedication);
router.put('/medications/:id', validateId, validate(updateMedicationSchema), updateMedication);
router.delete('/medications/:id', validateId, deleteMedication);
router.post('/medications/:id/take-dose', validateId, takeMedicationDose);

// ============ MÉTRICAS DE SALUD ============
/**
 * GET /api/v1/health/metrics
 * 
 * Obtener métricas de salud del usuario
 * 
 * Query params:
 * - dateFrom, dateTo: Rango de fechas
 * - metricType: bloodPressure, heartRate, weight, etc.
 * - page, limit: Paginación
 */
router.get('/metrics', validate(getHealthMetricsQuerySchema, 'query'), getMyMetrics);

/**
 * POST /api/v1/health/metrics
 * 
 * Registrar nueva métrica de salud
 * 
 * Validación:
 * - Todos los campos opcionales excepto date
 * - Valores dentro de rangos médicos realistas
 * - Presión arterial: sistólica > diastólica
 * - Alertas automáticas para valores críticos
 */
router.post('/metrics', validate(createHealthMetricSchema), addMetric);

// ============ REGISTROS MÉDICOS ============
/**
 * TODO: Crear schemas para registros médicos
 * - Tipo de documento (análisis, radiografía, receta)
 * - Fecha, descripción, archivo adjunto
 * - Validar formato de archivos (PDF, JPEG, PNG)
 */
router.get('/records', getMyRecords);
router.post('/records', validate(createMedicalRecordSchema), createRecord);

export default router;
