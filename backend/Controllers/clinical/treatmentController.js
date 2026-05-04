/**
 * Clinical Treatment Controller
 * 
 * Handles all treatment plan operations, phase transitions, and clinical decision support.
 * Psychologist-only endpoints.
 */

import TreatmentPlan from '../../models/TreatmentPlanSchema.js';
import ClinicalDecisionEngine from '../../services/ClinicalDecisionEngine.js';
import ClinicalAlert from '../../models/ClinicalAlertSchema.js';

/**
 * GET /api/v1/clinical/treatment/:treatmentPlanId
 * Get full treatment plan (clinician view)
 */
export const getTreatmentPlan = async (req, res) => {
  try {
    const { treatmentPlanId } = req.params;

    const plan = await TreatmentPlan.findById(treatmentPlanId)
      .select('+riskLevel') // Include hidden risk data for clinician
      .populate('patient psychologist', 'name email photo')
      .populate({
        path: 'sessions',
        options: { sort: { sessionDate: -1 }, limit: 5 },
      });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Treatment plan not found' });
    }

    // Verify clinician has access
    if (plan.psychologist._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/clinical/treatment/create
 * Create new treatment plan
 */
export const createTreatmentPlan = async (req, res) => {
  try {
    const { patientId, theoreticalOrientation, initialGoals } = req.body;

    // Create with audit context - captured automatically by lifecycle plugin
    const plan = new TreatmentPlan({
      patient: patientId,
      patientId,
      psychologist: req.userId,
      psychologistId: req.userId,
      theoreticalOrientation: theoreticalOrientation || 'CBT',
      treatmentGoals: initialGoals || [],
      currentPhase: 'INTAKE',
      status: 'ACTIVE',
      consentHistory: [
        {
          consentType: 'INITIAL',
          consentedAt: new Date(),
          ipAddress: req.ip,
        },
      ],
    });
    plan.$locals.clinicalAuditActor = {
      userId: req.userId,
      role: 'Doctor', // Must match ClinicalAuditLogSchema enum: ['User', 'Doctor', 'Admin', 'system', 'unknown']
      email: req.user?.email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Treatment plan created',
      data: plan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/v1/clinical/treatment/:treatmentPlanId/phase
 * Progress treatment to next phase (with clinical decision support)
 */
export const progressPhase = async (req, res) => {
  try {
    const { treatmentPlanId } = req.params;
    const { clinicianNotes, overrideReason } = req.body;

    const plan = await TreatmentPlan.findById(treatmentPlanId).select('+riskLevel');
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Treatment plan not found' });
    }

    // Verify access
    if (plan.psychologist.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get clinical decision engine assessment
    const assessment = await ClinicalDecisionEngine.assessPhaseProgression(treatmentPlanId);

    if (!assessment.canProgress && !overrideReason) {
      return res.status(400).json({
        success: false,
        message: 'Cannot progress phase',
        assessment,
        hint: 'Provide overrideReason if clinical judgment dictates progression',
      });
    }

    // Progress phase
    const currentPhaseHistory = plan.phaseHistory[plan.phaseHistory.length - 1];
    if (currentPhaseHistory) {
      currentPhaseHistory.exitedAt = new Date();
      currentPhaseHistory.clinicianNotes = clinicianNotes || overrideReason;
    }

    plan.currentPhase = assessment.nextPhase;
    plan.phaseHistory.push({
      phase: assessment.nextPhase,
      enteredAt: new Date(),
      clinicianNotes: overrideReason ? `Override: ${overrideReason}` : assessment.reasoning,
    });

    // Inject clinical audit context before save
    plan.$locals.clinicalAuditActor = {
      userId: req.userId,
      role: 'Doctor', // Must match ClinicalAuditLogSchema enum: ['User', 'Doctor', 'Admin', 'system', 'unknown']
      email: req.user?.email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Treatment progressed to ${assessment.nextPhase}`,
      data: plan,
      assessment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/clinical/treatment/:treatmentPlanId/risk-assessment
 * Update patient risk level
 */
export const updateRiskAssessment = async (req, res) => {
  try {
    const { treatmentPlanId } = req.params;
    const { riskLevel, riskFactors, columbiaScore, interventionRequired } = req.body;

    const plan = await TreatmentPlan.findById(treatmentPlanId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Treatment plan not found' });
    }

    // Update risk assessment
    plan.riskLevel = riskLevel;
    plan.lastRiskAssessment = {
      date: new Date(),
      assessedBy: req.userId,
      columbiaScore,
      interventionRequired,
    };

    if (riskFactors && riskFactors.length > 0) {
      plan.riskFactors = riskFactors.map(factor => ({
        factor: factor.factor,
        severity: factor.severity,
        identifiedAt: new Date(),
        mitigationPlan: factor.mitigationPlan,
      }));
    }

    await plan.save();

    // Create alert if risk is HIGH or IMMINENT
    if (riskLevel === 'HIGH' || riskLevel === 'IMMINENT') {
      await ClinicalAlert.create({
        patientId: plan.patient,
        treatmentPlanId: plan._id,
        alertType: 'SUICIDE_RISK',
        severity: riskLevel === 'IMMINENT' ? 'CRITICAL' : 'WARNING',
        triggeredBy: 'CLINICIAN_MANUAL',
        title: `${riskLevel} Suicide Risk Documented`,
        description: `Clinician assessed risk as ${riskLevel}. Columbia Score: ${columbiaScore || 'N/A'}`,
        recommendedActions: riskLevel === 'IMMINENT' 
          ? ['Activate Suicide Protocol', 'Ensure patient safety', 'Contact emergency services if needed']
          : ['Review safety plan', 'Increase monitoring frequency', 'Consider protocol activation'],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Risk assessment updated',
      data: plan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/clinical/treatment/:treatmentPlanId/progress
 * Get treatment progress metrics
 */
export const getProgressMetrics = async (req, res) => {
  try {
    const { treatmentPlanId } = req.params;

    const plan = await TreatmentPlan.findById(treatmentPlanId).populate('sessions');
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Treatment plan not found' });
    }

    const metrics = ClinicalDecisionEngine.calculateProgressMetrics(plan, plan.sessions || []);

    res.status(200).json({
      success: true,
      data: {
        treatmentPlanId: plan._id,
        currentPhase: plan.currentPhase,
        status: plan.status,
        metrics,
        phaseHistory: plan.phaseHistory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/clinical/treatment/caseload
 * Get clinician's active caseload
 */
export const getCaseload = async (req, res) => {
  try {
    const { status, phase, riskLevel } = req.query;

    const query = { psychologist: req.userId };
    if (status) query.status = status;
    if (phase) query.currentPhase = phase;
    if (riskLevel) query.riskLevel = riskLevel;

    const caseload = await TreatmentPlan.find(query)
      .select('+riskLevel')
      .populate('patient', 'name email photo')
      .sort({ lastReviewDate: 1, createdAt: -1 })
      .lean();

    // Enrich with quick stats
    const enriched = caseload.map(plan => ({
      ...plan,
      adherenceRate: plan.adherenceMetrics
        ? Math.round((plan.adherenceMetrics.totalSessionsAttended / plan.adherenceMetrics.totalSessionsScheduled) * 100)
        : 0,
      daysSinceLastSession: plan.adherenceMetrics?.lastAttendedSession
        ? Math.floor((new Date() - new Date(plan.adherenceMetrics.lastAttendedSession)) / (1000 * 60 * 60 * 24))
        : null,
    }));

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
