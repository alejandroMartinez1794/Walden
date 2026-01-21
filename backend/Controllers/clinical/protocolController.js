/**
 * Clinical Protocol Controller
 * 
 * Manages protocol execution, step completion, and protocol finalization.
 * Psychologist-only endpoints.
 */

import ProtocolLog from '../../models/ProtocolLogSchema.js';
import ProtocolExecutor from '../../services/ProtocolExecutor.js';

/**
 * GET /api/v1/clinical/protocols
 * Get all protocols for clinician
 */
export const getProtocols = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { activatedBy: req.userId };
    if (status) query.status = status;

    const protocols = await ProtocolLog.find(query)
      .populate('patientId', 'name email photo')
      .populate('treatmentPlanId', 'currentPhase status')
      .sort({ activatedAt: -1 })
      .lean();

    // Add progress info
    const enriched = protocols.map(protocol => {
      const totalSteps = protocol.steps.length;
      const completedSteps = protocol.steps.filter(s => s.completed).length;
      return {
        ...protocol,
        progress: Math.round((completedSteps / totalSteps) * 100),
        completedSteps,
        totalSteps,
      };
    });

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/clinical/protocols/:protocolId
 * Get detailed protocol status
 */
export const getProtocolDetails = async (req, res) => {
  try {
    const { protocolId } = req.params;

    const status = await ProtocolExecutor.getProtocolStatus(protocolId);

    res.status(200).json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/v1/clinical/protocols/:protocolId/steps/:stepNumber
 * Complete a protocol step
 */
export const completeStep = async (req, res) => {
  try {
    const { protocolId, stepNumber } = req.params;
    const { notes, outcome, evidence } = req.body;

    if (!notes || !outcome) {
      return res.status(400).json({
        success: false,
        message: 'Notes and outcome are required for step completion',
      });
    }

    const protocol = await ProtocolExecutor.completeStep(protocolId, parseInt(stepNumber), {
      clinicianId: req.userId,
      notes,
      outcome,
      evidence,
    });

    res.status(200).json({
      success: true,
      message: `Step ${stepNumber} completed`,
      data: protocol,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/clinical/protocols/:protocolId/finalize
 * Finalize and sign protocol
 */
export const finalizeProtocol = async (req, res) => {
  try {
    const { protocolId } = req.params;
    const { clinicalDecision, justification, outcome, followUpPlan } = req.body;

    if (!clinicalDecision || !justification || !outcome) {
      return res.status(400).json({
        success: false,
        message: 'Clinical decision, justification, and outcome are required',
      });
    }

    const protocol = await ProtocolExecutor.finalizeProtocol(protocolId, {
      clinicianId: req.userId,
      clinicalDecision,
      justification,
      outcome,
      followUpPlan: followUpPlan || {},
    });

    res.status(200).json({
      success: true,
      message: 'Protocol finalized and signed',
      data: protocol,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/clinical/protocols/follow-up
 * Get protocols requiring follow-up
 */
export const getFollowUpProtocols = async (req, res) => {
  try {
    const protocols = await ProtocolExecutor.getProtocolsRequiringFollowUp(req.userId);

    res.status(200).json({
      success: true,
      data: protocols,
      count: protocols.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/clinical/protocols/active
 * Get active (in-progress) protocols
 */
export const getActiveProtocols = async (req, res) => {
  try {
    const protocols = await ProtocolExecutor.getActiveProtocols(req.userId);

    res.status(200).json({
      success: true,
      data: protocols,
      count: protocols.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/v1/clinical/protocols/:protocolId/amend
 * Amend a signed protocol (creates audit trail)
 */
export const amendProtocol = async (req, res) => {
  try {
    const { protocolId } = req.params;
    const { reason, changes } = req.body;

    if (!reason || !changes) {
      return res.status(400).json({
        success: false,
        message: 'Reason and changes description are required for amendments',
      });
    }

    const protocol = await ProtocolLog.findById(protocolId);
    if (!protocol) {
      return res.status(404).json({ success: false, message: 'Protocol not found' });
    }

    await protocol.amend(req.userId, reason, changes);

    res.status(200).json({
      success: true,
      message: 'Protocol amended',
      data: protocol,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
