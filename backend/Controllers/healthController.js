import HealthMetric from '../models/HealthMetricSchema.js';
import MedicalRecord from '../models/MedicalRecordSchema.js';
import Medication from '../models/MedicationSchema.js';
import { clinicalMetrics } from '../services/ClinicalMetrics.js';
import { circuitBreakerRegistry } from '../services/CircuitBreaker.js';
import { clinicalWorker } from '../workers/clinicalWorker.js';
import logger from '../utils/logger.js';

const resolveUserId = (req) => req.user?.id || req.userId;

/**
 * Health check endpoint
 */
export const healthCheck = async (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Clinical automation metrics endpoint
 */
export const clinicalMetricsEndpoint = async (req, res) => {
  try {
    const metrics = clinicalMetrics.getMetrics();
    
    res.status(200).json({
      status: 'success',
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Clinical metrics error:', error);
    res.status(500).json({ error: 'Failed to retrieve clinical metrics' });
  }
};

/**
 * Circuit breaker status endpoint
 */
export const circuitBreakerStatus = async (req, res) => {
  try {
    const status = circuitBreakerRegistry.getAllStatus();
    
    res.status(200).json({
      status: 'success',
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Circuit breaker status error:', error);
    res.status(500).json({ error: 'Failed to retrieve circuit breaker status' });
  }
};

/**
 * Clinical worker status endpoint
 */
export const clinicalWorkerStatus = async (req, res) => {
  try {
    const status = clinicalWorker.getStatus();
    
    res.status(200).json({
      status: 'success',
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Clinical worker status error:', error);
    res.status(500).json({ error: 'Failed to retrieve clinical worker status' });
  }
};

/**
 * Manual circuit breaker reset endpoint (admin only)
 */
export const resetCircuitBreakers = async (req, res) => {
  try {
    clinicalWorker.resetCircuitBreakers();
    
    res.status(200).json({
      status: 'success',
      message: 'Circuit breakers reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Circuit breaker reset error:', error);
    res.status(500).json({ error: 'Failed to reset circuit breakers' });
  }
};

/**
 * Manual metrics reset endpoint (admin only)
 */
export const resetClinicalMetrics = async (req, res) => {
  try {
    clinicalWorker.resetMetrics();
    
    res.status(200).json({
      status: 'success',
      message: 'Clinical metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Clinical metrics reset error:', error);
    res.status(500).json({ error: 'Failed to reset clinical metrics' });
  }
};

export const getMyMedications = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const meds = await Medication.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: meds });
  } catch (error) {
    logger.error('Failed to fetch medications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medications' });
  }
};

export const createMedication = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const med = await Medication.create({ user: userId, ...req.body });
    res.status(201).json({ success: true, data: med });
  } catch (error) {
    logger.error('Failed to create medication:', error);
    res.status(400).json({ success: false, message: 'Failed to create medication' });
  }
};

export const updateMedication = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const med = await Medication.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { $set: req.body },
      { new: true }
    );

    if (!med) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    res.status(200).json({ success: true, data: med });
  } catch (error) {
    logger.error('Failed to update medication:', error);
    res.status(400).json({ success: false, message: 'Failed to update medication' });
  }
};

export const deleteMedication = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const med = await Medication.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!med) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    res.status(200).json({ success: true, message: 'Medication deleted' });
  } catch (error) {
    logger.error('Failed to delete medication:', error);
    res.status(400).json({ success: false, message: 'Failed to delete medication' });
  }
};

export const takeMedicationDose = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const med = await Medication.findOne({ _id: req.params.id, user: userId });

    if (!med) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    if (med.remainingDoses <= 0) {
      return res.status(400).json({ success: false, message: 'No remaining doses' });
    }

    med.remainingDoses -= 1;
    await med.save();

    res.status(200).json({ success: true, data: med });
  } catch (error) {
    logger.error('Failed to take medication dose:', error);
    res.status(400).json({ success: false, message: 'Failed to take dose' });
  }
};

export const getMyMetrics = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const metrics = await HealthMetric.find({ user: userId }).sort({ date: 1 });
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    logger.error('Failed to fetch metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch metrics' });
  }
};

export const addMetric = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const metric = await HealthMetric.create({ user: userId, ...req.body });
    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    logger.error('Failed to add metric:', error);
    res.status(400).json({ success: false, message: 'Failed to add metric' });
  }
};

export const getMyRecords = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const records = await MedicalRecord.find({ user: userId }).sort({ date: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    logger.error('Failed to fetch records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch records' });
  }
};

export const createRecord = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const record = new MedicalRecord({ user: userId, ...req.body });
    record.$locals.clinicalAuditActor = {
      userId: req.userId || userId,
      role: req.role || req.user?.role || 'Doctor',
      email: req.user?.email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    await record.save();
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    logger.error('Failed to create record:', error);
    res.status(400).json({ success: false, message: 'Failed to create record' });
  }
};
