/**
 * 📊 INTERNAL CONTROLLER
 * 
 * Controller for internal metrics and operations endpoints
 */

import { clinicalMetricsService } from '../services/ClinicalMetricsService.js';
import { clinicalMetrics } from '../services/ClinicalMetrics.js';
import logger from '../utils/logger.js';

/**
 * Get metrics snapshot
 */
export const getMetricsSnapshot = async (req, res) => {
  try {
    const snapshot = clinicalMetricsService.getMetricsSnapshot();
    
    // Add clinical metrics from the other service
    snapshot.system = clinicalMetrics.getMetrics();
    
    res.status(200).json({
      success: true,
      data: snapshot,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting metrics snapshot', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving metrics snapshot'
    });
  }
};

/**
 * Get detailed system metrics
 */
export const getSystemMetrics = async (req, res) => {
  try {
    const systemMetrics = clinicalMetrics.getMetrics();
    
    res.status(200).json({
      success: true,
      data: systemMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting system metrics', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving system metrics'
    });
  }
};

/**
 * Health check with metrics
 */
export const healthCheckWithMetrics = async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        mongodb: req.dbConnectionStatus || 'unknown',
        redis: req.cacheConnectionStatus || 'unknown',
      },
      metrics: clinicalMetricsService.getMetricsSnapshot()
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get trace information for debugging
 */
export const getTraceInfo = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        traceId: req.traceId,
        requestId: req.requestId,
        spanId: req.spanId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting trace info', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving trace information'
    });
  }
};

export default {
  getMetricsSnapshot,
  getSystemMetrics,
  healthCheckWithMetrics,
  getTraceInfo
};