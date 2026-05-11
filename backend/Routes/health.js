// backend/Routes/health.js
import express from 'express';
import { 
  healthCheck, 
  clinicalMetricsEndpoint, 
  circuitBreakerStatus, 
  clinicalWorkerStatus,
  getMyMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  takeMedicationDose,
  getMyMetrics,
  addMetric,
  getMyRecords,
  createRecord,
  resetCircuitBreakers,
  resetClinicalMetrics
} from '../Controllers/healthController.js';
import { authenticate as verifyToken, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Basic health check
router.get('/health', healthCheck);

// Legacy patient health endpoints used by the frontend
router.use('/medications', verifyToken, restrict(['paciente', 'patient']));
router.get('/medications', getMyMedications);
router.post('/medications', createMedication);
router.put('/medications/:id', updateMedication);
router.delete('/medications/:id', deleteMedication);
router.post('/medications/:id/take-dose', takeMedicationDose);

router.use('/metrics', verifyToken, restrict(['paciente', 'patient']));
router.get('/metrics', getMyMetrics);
router.post('/metrics', addMetric);

router.use('/records', verifyToken, restrict(['paciente', 'patient', 'doctor']));
router.get('/records', getMyRecords);
router.post('/records', createRecord);

// Clinical metrics
router.get('/clinical/metrics', clinicalMetricsEndpoint);

// Circuit breaker status
router.get('/clinical/circuit-breakers', circuitBreakerStatus);

// Clinical worker status
router.get('/clinical/worker', clinicalWorkerStatus);

// Admin endpoints (require authentication)
router.post('/clinical/reset-circuit-breakers', verifyToken, resetCircuitBreakers);
router.post('/clinical/reset-metrics', verifyToken, resetClinicalMetrics);

export default router;