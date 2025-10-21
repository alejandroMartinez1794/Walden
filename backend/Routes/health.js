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

const router = express.Router();

router.use(authenticate, restrict(['paciente']));

// Medications
router.get('/medications', getMyMedications);
router.post('/medications', createMedication);
router.put('/medications/:id', updateMedication);
router.delete('/medications/:id', deleteMedication);
router.post('/medications/:id/take-dose', takeMedicationDose);

// Health metrics
router.get('/metrics', getMyMetrics);
router.post('/metrics', addMetric);

// Medical records
router.get('/records', getMyRecords);
router.post('/records', createRecord);

export default router;
