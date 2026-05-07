/**
 * 📊 INTERNAL ROUTES
 * 
 * Routes for internal metrics and operations
 */

import express from 'express';
import { 
  getMetricsSnapshot, 
  getSystemMetrics, 
  healthCheckWithMetrics,
  getTraceInfo
} from '../Controllers/internalController.js';
import { authenticate as verifyToken } from '../auth/verifyToken.js';

const router = express.Router();

// Internal metrics endpoints - protected
router.get('/metrics', verifyToken, getMetricsSnapshot);
router.get('/system-metrics', verifyToken, getSystemMetrics);
router.get('/trace-info', verifyToken, getTraceInfo);

// Public health check with metrics
router.get('/health', healthCheckWithMetrics);

export default router;