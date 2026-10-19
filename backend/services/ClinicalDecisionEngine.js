/**
 * ClinicalDecisionEngine - Business Logic for CBT Treatment State Transitions
 *
 * This service implements the clinical decision-making logic for the therapy lifecycle.
 * It analyzes patient data and suggests (never auto-executes) clinical actions.
 *
 * Key Principles:
 * 1. SUGGEST, don't decide - Clinician has final say
 * 2. EXPLAIN reasoning - All suggestions must be traceable
 * 3. DETECT risk - Auto-flag, never auto-act
 * 4. TRACK adherence - Identify patterns early
 */

import TreatmentPlan from '../models/TreatmentPlanSchema.js';
import TherapySession from '../models/TherapySessionSchema.js';
import ClinicalAlert from '../models/ClinicalAlertSchema.js';
import ConsentForm from '../models/ConsentFormSchema.js';

class ClinicalDecisionEngine {
  static async assessPhaseProgression(treatmentPlanId) {
    const plan = await TreatmentPlan.findById(treatmentPlanId)
      .select('+riskLevel')
      .lean();

    if (!plan) throw new Error('Treatment plan not found');

    const sessions = await TherapySession.find({ treatmentPlanId })
      .sort({ sessionDate: -1 })
      .limit(5)
      .lean();

    switch (plan.currentPhase) {
      case 'INTAKE':
        return this._assessIntakeToAssessment(plan);
      case 'ASSESSMENT':
        return this._assessAssessmentToFormulation(plan, sessions);
      case 'FORMULATION':
        return this._assessFormulationToIntervention(plan);
      case 'INTERVENTION':
        return this._assessInterventionToConsolidation(plan, sessions);
      case 'CONSOLIDATION':
        return this._assessConsolidationToFollowUp(plan, sessions);
      default:
        return {
          canProgress: false,
          reasoning: 'Invalid phase or already at final stage',
          nextPhase: null,
        };
    }
  }

  static async detectRiskFactors(patientData) {
    const risks = [];

    if (patientData.phq9Responses) {
      const suicidalIdeationItem = patientData.phq9Responses[8];
      if (suicidalIdeationItem >= 2) {
        risks.push({
          type: 'SUICIDE_RISK',
          severity: suicidalIdeationItem === 3 ? 'CRITICAL' : 'WARNING',
          source: 'PHQ-9 Item #9',
          value: suicidalIdeationItem,
          recommendation: 'Immediate clinical review required. Consider Columbia Scale.',
        });
      }
    }

    if (patientData.baselineMetrics && patientData.currentMetrics) {
      const phq9Increase = patientData.currentMetrics.phq9 - patientData.baselineMetrics.phq9;
      const gad7Increase = patientData.currentMetrics.gad7 - patientData.baselineMetrics.gad7;

      if (phq9Increase >= 5 || gad7Increase >= 4) {
        risks.push({
          type: 'CLINICAL_DETERIORATION',
          severity: 'WARNING',
          source: 'Symptom Monitoring',
          details: `PHQ-9 +${phq9Increase}, GAD-7 +${gad7Increase}`,
          recommendation: 'Review treatment approach. Consider intensifying intervention.',
        });
      }
    }

    if (patientData.adherenceMetrics) {
      const { totalSessionsScheduled, totalSessionsAttended, homeworkCompletionRate } = patientData.adherenceMetrics;
      const attendanceRate = totalSessionsScheduled > 0 ? (totalSessionsAttended / totalSessionsScheduled) * 100 : 100;

      if (attendanceRate < 70 || homeworkCompletionRate < 30) {
        risks.push({
          type: 'NON_ADHERENCE',
          severity: attendanceRate < 50 ? 'WARNING' : 'INFO',
          source: 'Adherence Tracking',
          details: `Attendance: ${attendanceRate.toFixed(0)}%, Homework: ${homeworkCompletionRate}%`,
          recommendation: 'Explore barriers to engagement. Consider motivational interviewing.',
        });
      }
    }

    if (patientData.lastAttendedSession) {
      const daysSinceLastSession = Math.floor((new Date() - new Date(patientData.lastAttendedSession)) / (1000 * 60 * 60 * 24));

      if (daysSinceLastSession > 14 && daysSinceLastSession < 21) {
        risks.push({
          type: 'ABANDONMENT_RISK',
          severity: 'WARNING',
          source: 'Session Attendance',
          details: `${daysSinceLastSession} days since last session`,
          recommendation: 'Initiate patient contact. Activate abandonment protocol if no response.',
        });
      } else if (daysSinceLastSession >= 21) {
        risks.push({
          type: 'ABANDONMENT_RISK',
          severity: 'CRITICAL',
          source: 'Session Attendance',
          details: `${daysSinceLastSession} days since last session`,
          recommendation: 'Abandonment protocol activation required.',
        });
      }
    }

    if (patientData.journalEntries || patientData.sessionNotes) {
      const textContent = (patientData.journalEntries?.join(' ') || '') + ' ' + (patientData.sessionNotes || '');
      const suicideKeywords = [
        'suicidio', 'suicidarme', 'terminar todo', 'sin salida', 'mejor muerto',
        'acabar con mi vida', 'ya no quiero vivir', 'plan para morir'
      ];

      const detectedKeywords = suicideKeywords.filter((kw) =>
        textContent.toLowerCase().includes(kw)
      );

      if (detectedKeywords.length > 0) {
        risks.push({
          type: 'SUICIDE_RISK',
          severity: 'CRITICAL',
          source: 'Keyword Detection',
          details: `Detected: ${detectedKeywords.join(', ')}`,
          recommendation: 'Immediate clinical review. Assess for imminent risk.',
        });
      }
    }

    return risks;
  }

  static calculateProgressMetrics(treatmentPlan, sessions) {
    const metrics = {
      symptomReduction: 0,
      adherenceRate: 0,
      homeworkCompletion: 0,
      sessionCount: sessions.length,
      phaseCompliance: false,
    };

    if (treatmentPlan.baselineMetrics && treatmentPlan.currentMetrics) {
      const baselineTotal = (treatmentPlan.baselineMetrics.phq9 || 0) + (treatmentPlan.baselineMetrics.gad7 || 0);
      const currentTotal = (treatmentPlan.currentMetrics.phq9 || 0) + (treatmentPlan.currentMetrics.gad7 || 0);

      if (baselineTotal > 0) {
        metrics.symptomReduction = Math.round(((baselineTotal - currentTotal) / baselineTotal) * 100);
      }
    }

    if (treatmentPlan.adherenceMetrics) {
      const { totalSessionsScheduled, totalSessionsAttended } = treatmentPlan.adherenceMetrics;
      if (totalSessionsScheduled > 0) {
        metrics.adherenceRate = Math.round((totalSessionsAttended / totalSessionsScheduled) * 100);
      }
      metrics.homeworkCompletion = treatmentPlan.adherenceMetrics.homeworkCompletionRate || 0;
    }

    const phaseRequirements = {
      ASSESSMENT: 2,
      FORMULATION: 1,
      INTERVENTION: 8,
      CONSOLIDATION: 3,
    };
    const minSessions = phaseRequirements[treatmentPlan.currentPhase] || 0;
    metrics.phaseCompliance = sessions.length >= minSessions;

    return metrics;
  }

  static shouldActivateProtocol(alertType, context) {
    switch (alertType) {
      case 'SUICIDE_RISK':
        return {
          shouldActivate: context.severity === 'CRITICAL' || context.columbiaScore >= 3,
          protocolType: 'SUICIDE_PROTOCOL',
          urgency: 'IMMEDIATE',
          reasoning: 'Suicide risk detected. Columbia Scale assessment and safety planning required.',
        };
      case 'ABANDONMENT_RISK':
        return {
          shouldActivate: context.daysSinceContact >= 21,
          protocolType: 'ABANDONMENT_PROTOCOL',
          urgency: 'HIGH',
          reasoning: 'Patient has not been reached in 21+ days. Formal abandonment protocol recommended.',
        };
      case 'NON_ADHERENCE':
        return {
          shouldActivate: context.attendanceRate < 50 && context.sessionCount >= 4,
          protocolType: 'NON_ADHERENCE_PROTOCOL',
          urgency: 'MODERATE',
          reasoning: 'Persistent non-adherence pattern. Intervention to address barriers recommended.',
        };
      case 'CLINICAL_DETERIORATION':
        return {
          shouldActivate: context.symptomIncrease >= 30,
          protocolType: 'CRISIS_PROTOCOL',
          urgency: 'HIGH',
          reasoning: 'Significant symptom worsening. Treatment modification or crisis intervention needed.',
        };
      default:
        return { shouldActivate: false, reasoning: 'No protocol activation criteria met.' };
    }
  }

  static async _assessIntakeToAssessment(plan) {
    const blockers = [];

    if (!plan.patientId) {
      blockers.push('Canonical patient identity is missing');
    } else {
      const hasConsent = await ConsentForm.hasActiveConsent(plan.patientId, 'GENERAL_THERAPY');
      if (!hasConsent) {
        blockers.push('Active general therapy consent is not documented');
      }
    }

    return {
      canProgress: blockers.length === 0,
      nextPhase: 'ASSESSMENT',
      reasoning: blockers.length === 0
        ? 'Intake complete. Ready for clinical assessment.'
        : `Cannot proceed: ${blockers.join(', ')}`,
      confidence: blockers.length === 0 ? 'HIGH' : 'N/A',
      blockers,
    };
  }

  static _assessAssessmentToFormulation(plan, sessions) {
    const blockers = [];

    if (
      plan.baselineMetrics?.phq9 == null ||
      plan.baselineMetrics?.gad7 == null
    ) {
      blockers.push('Missing baseline PHQ-9/GAD-7 scores');
    }

    if (sessions.length < 2) {
      blockers.push(`Insufficient assessment sessions (${sessions.length}/2)`);
    }

    if (plan.riskLevel === 'IMMINENT') {
      blockers.push('Imminent risk detected. Crisis protocol must be completed first.');
    }

    return {
      canProgress: blockers.length === 0,
      nextPhase: 'FORMULATION',
      reasoning: blockers.length === 0
        ? 'Assessment phase complete. Sufficient data for case formulation.'
        : `Blockers present: ${blockers.join('; ')}`,
      confidence: blockers.length === 0 ? 'HIGH' : 'N/A',
      blockers,
    };
  }

  static _assessFormulationToIntervention(plan) {
    const blockers = [];

    if (!plan.clinicalHypothesis || plan.clinicalHypothesis.length < 50) {
      blockers.push('CBT case formulation not documented or incomplete');
    }

    if (!plan.goals || plan.goals.length === 0) {
      blockers.push('No treatment goals defined');
    }

    if (plan.riskLevel !== 'LOW' && (!plan.riskFactors || plan.riskFactors.length === 0)) {
      blockers.push('Risk identified but no risk-factor mitigation documented');
    }

    return {
      canProgress: blockers.length === 0,
      nextPhase: 'INTERVENTION',
      reasoning: blockers.length === 0
        ? 'Case formulation complete. Ready to begin CBT intervention.'
        : `Cannot progress: ${blockers.join('; ')}`,
      confidence: blockers.length === 0 ? 'HIGH' : 'N/A',
      blockers,
    };
  }

  static _assessInterventionToConsolidation(plan, sessions) {
    const blockers = [];
    const metrics = this.calculateProgressMetrics(plan, sessions);

    if (sessions.length < 8) {
      blockers.push(`Minimum intervention duration not met (${sessions.length}/8 sessions)`);
    }

    if (metrics.symptomReduction < 30) {
      return {
        canProgress: false,
        nextPhase: null,
        reasoning: `Insufficient clinical improvement (${metrics.symptomReduction}% reduction). Consider: 1) Continue intervention with adjusted approach, 2) Re-assess case formulation, 3) Refer if no improvement after 12-16 sessions.`,
        confidence: 'MEDIUM',
        blockers: ['Symptom reduction below threshold'],
        alternatives: ['CONTINUE_INTERVENTION', 'RE_ASSESS', 'CONSIDER_REFERRAL'],
      };
    }

    if (metrics.adherenceRate < 70) {
      blockers.push(`Low adherence (${metrics.adherenceRate}%) may indicate premature consolidation`);
    }

    return {
      canProgress: blockers.length === 0,
      nextPhase: 'CONSOLIDATION',
      reasoning: blockers.length === 0
        ? `Significant clinical improvement (${metrics.symptomReduction}% reduction). Ready for consolidation phase.`
        : `Progress present but concerns: ${blockers.join('; ')}`,
      confidence: blockers.length === 0 ? 'HIGH' : 'MODERATE',
      blockers,
    };
  }

  static _assessConsolidationToFollowUp(plan, sessions) {
    const blockers = [];

    if (!plan.currentMetrics || plan.currentMetrics.phq9 > 5 || plan.currentMetrics.gad7 > 5) {
      blockers.push('Symptoms not in remission (PHQ-9 >5 or GAD-7 >5)');
    }

    const hasRelapsePlan = sessions.some(s =>
      s.soapNotes?.plan?.includes('relapse') || s.soapNotes?.plan?.includes('recaída')
    );
    if (!hasRelapsePlan) {
      blockers.push('Relapse prevention plan not documented');
    }

    return {
      canProgress: blockers.length === 0,
      nextPhase: 'FOLLOW_UP',
      reasoning: blockers.length === 0
        ? 'Patient in remission. Relapse prevention complete. Ready for follow-up phase.'
        : `Not ready for discharge: ${blockers.join('; ')}`,
      confidence: blockers.length === 0 ? 'HIGH' : 'N/A',
      blockers,
    };
  }

  static _getNextPhase(currentPhase) {
    const phases = ['INTAKE', 'ASSESSMENT', 'FORMULATION', 'INTERVENTION', 'CONSOLIDATION', 'FOLLOW_UP'];
    const currentIndex = phases.indexOf(currentPhase);
    return currentIndex >= 0 && currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  }
}

export default ClinicalDecisionEngine;
