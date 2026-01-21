/**
 * ProtocolExecutor - Guided Execution of Clinical Protocols
 * 
 * This service provides step-by-step workflows for clinical protocols.
 * It ensures consistency, completeness, and auditability of protocol execution.
 * 
 * Key Principles:
 * 1. GUIDE, don't automate - Each step requires clinician confirmation
 * 2. DOCUMENT everything - Full audit trail
 * 3. ENFORCE completeness - Can't skip required steps
 * 4. ENSURE safety - Built-in safeguards
 */

import ProtocolLog from '../models/ProtocolLogSchema.js';
import ClinicalAlert from '../models/ClinicalAlertSchema.js';
import TreatmentPlan from '../models/TreatmentPlanSchema.js';

class ProtocolExecutor {
  /**
   * Initialize a new protocol execution
   * @param {Object} params - { alertId, patientId, treatmentPlanId, protocolType, clinicianId, reason }
   * @returns {Object} ProtocolLog document
   */
  static async initiateProtocol({ alertId, patientId, treatmentPlanId, protocolType, clinicianId, reason, context }) {
    // Get protocol template
    const protocolTemplate = this._getProtocolTemplate(protocolType);

    // Create protocol log
    const protocolLog = await ProtocolLog.create({
      alertId,
      patientId,
      treatmentPlanId,
      activatedBy: clinicianId,
      protocolType,
      protocolVersion: protocolTemplate.version,
      activatedAt: new Date(),
      activationReason: reason,
      immediateContext: context,
      steps: protocolTemplate.steps,
      status: 'ACTIVE',
    });

    // Update alert to link protocol
    await ClinicalAlert.findByIdAndUpdate(alertId, {
      protocolActivated: true,
      protocolLogId: protocolLog._id,
      status: 'IN_PROGRESS',
    });

    return protocolLog;
  }

  /**
   * Complete a protocol step
   * @param {String} protocolLogId
   * @param {Number} stepNumber
   * @param {Object} data - { clinicianId, notes, outcome, evidence }
   */
  static async completeStep(protocolLogId, stepNumber, data) {
    const protocolLog = await ProtocolLog.findById(protocolLogId);
    if (!protocolLog) throw new Error('Protocol log not found');
    if (protocolLog.isSigned) throw new Error('Cannot modify signed protocol');

    const step = protocolLog.steps.find(s => s.stepNumber === stepNumber);
    if (!step) throw new Error(`Step ${stepNumber} not found`);
    if (step.completed) throw new Error('Step already completed');

    // Update step
    step.completed = true;
    step.completedAt = new Date();
    step.completedBy = data.clinicianId;
    step.notes = data.notes;
    step.outcome = data.outcome;

    if (data.evidence) {
      step.evidence = step.evidence || [];
      step.evidence.push({
        type: data.evidence.type,
        content: data.evidence.content,
        timestamp: new Date(),
      });
    }

    await protocolLog.save();

    // Check if all steps complete
    const allComplete = protocolLog.steps.every(s => s.completed);
    if (allComplete) {
      await this._requestProtocolCompletion(protocolLogId);
    }

    return protocolLog;
  }

  /**
   * Finalize and sign protocol
   * @param {String} protocolLogId
   * @param {Object} completion - { clinicianId, clinicalDecision, justification, outcome, followUpPlan }
   */
  static async finalizeProtocol(protocolLogId, completion) {
    const protocolLog = await ProtocolLog.findById(protocolLogId);
    if (!protocolLog) throw new Error('Protocol log not found');
    if (protocolLog.isSigned) throw new Error('Protocol already finalized');

    // Verify all steps completed
    const incompleteSteps = protocolLog.steps.filter(s => !s.completed);
    if (incompleteSteps.length > 0) {
      throw new Error(`Cannot finalize: ${incompleteSteps.length} steps incomplete`);
    }

    // Update protocol log
    protocolLog.clinicalDecision = completion.clinicalDecision;
    protocolLog.clinicalJustification = completion.justification;
    protocolLog.outcome = completion.outcome;
    protocolLog.followUpPlan = completion.followUpPlan;
    protocolLog.status = 'COMPLETED';
    protocolLog.completedAt = new Date();

    // Sign the protocol
    await protocolLog.sign(completion.clinicianId);

    // Update related alert
    await ClinicalAlert.findByIdAndUpdate(protocolLog.alertId, {
      status: 'RESOLVED',
      resolutionNotes: `Protocol completed: ${completion.clinicalDecision}`,
      resolvedBy: completion.clinicianId,
      resolvedAt: new Date(),
    });

    // Update treatment plan risk level if applicable
    if (protocolLog.protocolType === 'SUICIDE_PROTOCOL' && completion.outcome === 'RESOLVED') {
      await TreatmentPlan.findByIdAndUpdate(protocolLog.treatmentPlanId, {
        riskLevel: 'MODERATE', // Downgrade from HIGH/IMMINENT after protocol
      });
    }

    return protocolLog;
  }

  /**
   * Get protocol progress/status
   * @param {String} protocolLogId
   * @returns {Object} Progress summary
   */
  static async getProtocolStatus(protocolLogId) {
    const protocolLog = await ProtocolLog.findById(protocolLogId)
      .populate('activatedBy', 'name')
      .populate('patientId', 'name')
      .lean();

    if (!protocolLog) throw new Error('Protocol log not found');

    const totalSteps = protocolLog.steps.length;
    const completedSteps = protocolLog.steps.filter(s => s.completed).length;
    const currentStep = protocolLog.steps.find(s => !s.completed);

    return {
      protocolType: protocolLog.protocolType,
      status: protocolLog.status,
      progress: Math.round((completedSteps / totalSteps) * 100),
      totalSteps,
      completedSteps,
      currentStep: currentStep ? {
        number: currentStep.stepNumber,
        name: currentStep.stepName,
        description: currentStep.description,
      } : null,
      activatedBy: protocolLog.activatedBy.name,
      activatedAt: protocolLog.activatedAt,
      durationHours: protocolLog.durationHours,
      isSigned: protocolLog.isSigned,
    };
  }

  // ========== PROTOCOL TEMPLATES ==========

  static _getProtocolTemplate(protocolType) {
    const templates = {
      SUICIDE_PROTOCOL: {
        version: 'v1.0',
        steps: [
          {
            stepNumber: 1,
            stepName: 'Assess Immediate Safety',
            description: 'Determine if patient has immediate access to lethal means and if they are alone.',
            completed: false,
          },
          {
            stepNumber: 2,
            stepName: 'Administer Columbia Scale',
            description: 'Complete Columbia-Suicide Severity Rating Scale (C-SSRS) to quantify risk.',
            completed: false,
          },
          {
            stepNumber: 3,
            stepName: 'Remove/Secure Lethal Means',
            description: 'Work with patient/support network to remove or secure access to methods.',
            completed: false,
          },
          {
            stepNumber: 4,
            stepName: 'Activate Safety Plan',
            description: 'Review and implement patient safety plan. Identify warning signs, coping strategies.',
            completed: false,
          },
          {
            stepNumber: 5,
            stepName: 'Contact Support Network',
            description: 'Reach out to emergency contacts. Ensure patient is not alone.',
            completed: false,
          },
          {
            stepNumber: 6,
            stepName: 'Determine Level of Care',
            description: 'Decide if patient can continue outpatient care or requires higher level (e.g., inpatient).',
            completed: false,
          },
          {
            stepNumber: 7,
            stepName: 'Document Clinical Decision',
            description: 'Document assessment, rationale for care level decision, and follow-up plan.',
            completed: false,
          },
          {
            stepNumber: 8,
            stepName: 'Schedule Immediate Follow-Up',
            description: 'Set next contact within 24-48 hours. Ensure patient has crisis hotline numbers.',
            completed: false,
          },
        ],
      },

      CRISIS_PROTOCOL: {
        version: 'v1.0',
        steps: [
          {
            stepNumber: 1,
            stepName: 'Assess Crisis Nature',
            description: 'Identify type of crisis (symptom exacerbation, psychosocial stressor, etc.).',
            completed: false,
          },
          {
            stepNumber: 2,
            stepName: 'Rule Out Suicide Risk',
            description: 'Screen for suicidal ideation. If present, activate Suicide Protocol.',
            completed: false,
          },
          {
            stepNumber: 3,
            stepName: 'Stabilization Intervention',
            description: 'Implement crisis stabilization techniques (grounding, safety planning).',
            completed: false,
          },
          {
            stepNumber: 4,
            stepName: 'Mobilize Resources',
            description: 'Connect patient with immediate supports (family, crisis services).',
            completed: false,
          },
          {
            stepNumber: 5,
            stepName: 'Develop Crisis Resolution Plan',
            description: 'Create short-term plan to address immediate crisis.',
            completed: false,
          },
          {
            stepNumber: 6,
            stepName: 'Schedule Follow-Up',
            description: 'Set next session within 48-72 hours to monitor stability.',
            completed: false,
          },
        ],
      },

      REFERRAL_PROTOCOL: {
        version: 'v1.0',
        steps: [
          {
            stepNumber: 1,
            stepName: 'Identify Referral Need',
            description: 'Document clinical reason for referral (out of scope, need for specialized care).',
            completed: false,
          },
          {
            stepNumber: 2,
            stepName: 'Discuss with Patient',
            description: 'Explain referral rationale to patient. Address concerns and obtain consent.',
            completed: false,
          },
          {
            stepNumber: 3,
            stepName: 'Identify Appropriate Provider',
            description: 'Research and suggest 2-3 appropriate providers/facilities.',
            completed: false,
          },
          {
            stepNumber: 4,
            stepName: 'Prepare Referral Documentation',
            description: 'Create comprehensive clinical summary for receiving provider.',
            completed: false,
          },
          {
            stepNumber: 5,
            stepName: 'Coordinate Transition',
            description: 'Facilitate warm handoff if possible. Ensure patient has appointment.',
            completed: false,
          },
          {
            stepNumber: 6,
            stepName: 'Follow-Up Confirmation',
            description: 'Confirm patient attended first appointment with new provider.',
            completed: false,
          },
        ],
      },

      ABANDONMENT_PROTOCOL: {
        version: 'v1.0',
        steps: [
          {
            stepNumber: 1,
            stepName: 'Attempt Contact - Phone',
            description: 'Call patient at all available numbers. Leave voicemail.',
            completed: false,
          },
          {
            stepNumber: 2,
            stepName: 'Attempt Contact - Email',
            description: 'Send professional email expressing concern and offering to resume.',
            completed: false,
          },
          {
            stepNumber: 3,
            stepName: 'Contact Emergency Contact',
            description: 'If risk history exists, contact emergency contact to check on patient.',
            completed: false,
          },
          {
            stepNumber: 4,
            stepName: 'Send Formal Letter',
            description: 'Send certified letter documenting termination of therapeutic relationship.',
            completed: false,
          },
          {
            stepNumber: 5,
            stepName: 'Provide Referrals',
            description: 'Include list of alternative providers and crisis resources in letter.',
            completed: false,
          },
          {
            stepNumber: 6,
            stepName: 'Close Case',
            description: 'Document all attempts made. Close case in system with notes for potential reactivation.',
            completed: false,
          },
        ],
      },

      NON_ADHERENCE_PROTOCOL: {
        version: 'v1.0',
        steps: [
          {
            stepNumber: 1,
            stepName: 'Assess Barriers',
            description: 'Explore patient barriers to adherence (practical, motivational, therapeutic relationship).',
            completed: false,
          },
          {
            stepNumber: 2,
            stepName: 'Re-evaluate Goals',
            description: 'Ensure treatment goals align with patient values and priorities.',
            completed: false,
          },
          {
            stepNumber: 3,
            stepName: 'Problem-Solve Barriers',
            description: 'Collaboratively develop solutions to identified barriers.',
            completed: false,
          },
          {
            stepNumber: 4,
            stepName: 'Adjust Treatment Approach',
            description: 'Modify intervention style, homework, or frequency if needed.',
            completed: false,
          },
          {
            stepNumber: 5,
            stepName: 'Set Adherence Goals',
            description: 'Establish clear, achievable adherence targets with patient.',
            completed: false,
          },
          {
            stepNumber: 6,
            stepName: 'Monitor Progress',
            description: 'Track adherence over next 3 sessions. Re-assess if no improvement.',
            completed: false,
          },
        ],
      },
    };

    const template = templates[protocolType];
    if (!template) throw new Error(`No template found for protocol type: ${protocolType}`);
    return template;
  }

  static async _requestProtocolCompletion(protocolLogId) {
    // This would trigger a notification to the clinician
    // that all steps are complete and protocol needs finalization
    console.log(`Protocol ${protocolLogId} ready for finalization`);
    // In production: send email/notification to clinician
  }

  /**
   * Get all active protocols for a clinician
   * @param {String} clinicianId
   * @returns {Array} Active protocols
   */
  static async getActiveProtocols(clinicianId) {
    return await ProtocolLog.find({
      activatedBy: clinicianId,
      status: 'ACTIVE',
    })
      .populate('patientId', 'name email')
      .populate('treatmentPlanId', 'currentPhase')
      .sort({ activatedAt: -1 })
      .lean();
  }

  /**
   * Get protocols requiring follow-up
   * @param {String} clinicianId
   * @returns {Array} Protocols needing follow-up
   */
  static async getProtocolsRequiringFollowUp(clinicianId) {
    return await ProtocolLog.getFollowUpRequired(clinicianId);
  }
}

export default ProtocolExecutor;
