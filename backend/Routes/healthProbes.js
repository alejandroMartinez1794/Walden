/**
 * 🏥 HEALTH PROBES ROUTES
 * 
 * Differentiated health endpoints:
 * - /health/live: Process alive
 * - /health/ready: Dependencies ready
 * - /health/verify: Post-deployment verification
 */

import express from 'express';
import { 
  livenessProbe, 
  readinessProbe, 
  postDeployVerification 
} from '../Controllers/healthProbeController.js';

const router = express.Router();

// Liveness probe - is the process alive?
router.get('/live', livenessProbe);

// Readiness probe - are dependencies ready?
router.get('/ready', readinessProbe);

// Post-deployment verification
router.get('/verify', postDeployVerification);

export default router;