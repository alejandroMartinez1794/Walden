/**
 * Clinical Alert Controller
 * 
 * Manages clinical alerts, risk detection, and alert resolution.
 * Psychologist-only endpoints.
 */

import ClinicalAlert from '../../models/ClinicalAlertSchema.js';
import ClinicalDecisionEngine from '../../services/ClinicalDecisionEngine.js';
import ProtocolExecutor from '../../services/ProtocolExecutor.js';

/**
 * GET /api/v1/clinical/alerts
 * Get all alerts for clinician's caseload
 */
export const getAlerts = async (req, res) => {
  try {
    const { severity, status, alertType } = req.query;

    // Get critical alerts for this psychologist's patients
    const criticalAlerts = await ClinicalAlert.getCriticalAlerts(req.userId);

    // Get all alerts with filters
    const query = {};
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (alertType) query.alertType = alertType;

    // Find treatment plans for this psychologist
    const TreatmentPlan = require('../../models/TreatmentPlanSchema.js').default;
    const plans = await TreatmentPlan.find({ psychologist: req.userId }).select('_id');
    const planIds = plans.map(p => p._id);

    query.treatmentPlanId = { $in: planIds };

    const alerts = await ClinicalAlert.find(query)
      .populate('patientId', 'name email')
      .populate('treatmentPlanId', 'currentPhase status')
      .sort({ severity: -1, triggeredAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        critical: criticalAlerts,
        all: alerts,
        counts: {
          critical: criticalAlerts.length,
          warning: alerts.filter(a => a.severity === 'WARNING' && a.status !== 'RESOLVED').length,
          open: alerts.filter(a => a.status === 'OPEN').length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/clinical/alerts/detect
 * Run risk detection on patient data (manual trigger)
 */
export const detectRisks = async (req, res) => {
  try {
    const { patientId, treatmentPlanId, patientData } = req.body;

    // Run risk detection
    const risks = await ClinicalDecisionEngine.detectRiskFactors(patientData);

    // Create alerts for detected risks
    const createdAlerts = [];
    for (const risk of risks) {
      const alert = await ClinicalAlert.create({
        patientId,
        treatmentPlanId,
        alertType: risk.type,
        severity: risk.severity,
        triggeredBy: 'SYSTEM_AUTO',
        title: `${risk.type.replace(/_/g, ' ')} Detected`,
        description: risk.details || risk.recommendation,
        recommendedActions: [risk.recommendation],
        triggerDetails: {
          source: risk.source,
          dataSnapshot: risk,
        },
      });
      createdAlerts.push(alert);
    }

    res.status(200).json({
      success: true,
      message: `${risks.length} risks detected`,
      data: {
        risks,
        alerts: createdAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/v1/clinical/alerts/:alertId/acknowledge
 * Acknowledge an alert
 */
export const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await ClinicalAlert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    await alert.acknowledge(req.userId);

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/v1/clinical/alerts/:alertId/resolve
 * Resolve an alert
 */
export const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolutionNotes, outcome } = req.body;

    const alert = await ClinicalAlert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    await alert.resolve(req.userId, resolutionNotes);

    res.status(200).json({
      success: true,
      message: 'Alert resolved',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/clinical/alerts/:alertId/activate-protocol
 * Activate a clinical protocol from an alert
 */
export const activateProtocol = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { protocolType, reason, context } = req.body;

    const alert = await ClinicalAlert.findById(alertId).populate('treatmentPlanId');
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    // Check if protocol should be activated
    const shouldActivate = ClinicalDecisionEngine.shouldActivateProtocol(alert.alertType, {
      severity: alert.severity,
      ...alert.triggerDetails?.dataSnapshot,
    });

    if (!shouldActivate.shouldActivate && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Protocol activation not recommended by decision engine',
        suggestion: shouldActivate,
        hint: 'Provide explicit reason to override',
      });
    }

    // Initialize protocol
    const protocolLog = await ProtocolExecutor.initiateProtocol({
      alertId: alert._id,
      patientId: alert.patientId,
      treatmentPlanId: alert.treatmentPlanId._id,
      protocolType: protocolType || shouldActivate.protocolType,
      clinicianId: req.userId,
      reason: reason || shouldActivate.reasoning,
      context,
    });

    res.status(201).json({
      success: true,
      message: `${protocolType || shouldActivate.protocolType} activated`,
      data: protocolLog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/clinical/alerts/overdue
 * Get overdue alerts (not addressed within required timeframe)
 */
export const getOverdueAlerts = async (req, res) => {
  try {
    const TreatmentPlan = require('../../models/TreatmentPlanSchema.js').default;
    const plans = await TreatmentPlan.find({ psychologist: req.userId }).select('_id');
    const planIds = plans.map(p => p._id);

    const alerts = await ClinicalAlert.find({
      treatmentPlanId: { $in: planIds },
      status: { $in: ['OPEN', 'ACKNOWLEDGED'] },
    })
      .populate('patientId', 'name email')
      .lean();

    // Filter overdue using virtual property logic
    const now = new Date();
    const overdue = alerts.filter(alert => {
      const hoursOpen = Math.floor((now - new Date(alert.triggeredAt)) / (1000 * 60 * 60));
      switch (alert.severity) {
        case 'CRITICAL':
          return hoursOpen > 2;
        case 'WARNING':
          return hoursOpen > 24;
        case 'INFO':
          return hoursOpen > 72;
        default:
          return false;
      }
    });

    res.status(200).json({
      success: true,
      data: overdue,
      count: overdue.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
