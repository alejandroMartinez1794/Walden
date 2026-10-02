import Measure from '../models/MeasureSchema.js';
import Alert from '../models/AlertSchema.js';
import ActivityLog from '../models/ActivityLogSchema.js';
import { scorePHQ9, scoreGAD7, assessRisk } from '../utils/clinicalRules.js';

const normalizeResponses = (responses = []) => (
  Array.isArray(responses)
    ? responses.map((response, index) => {
        if (typeof response === 'number') {
          return { itemNumber: index + 1, response };
        }

        return {
          ...response,
          itemNumber: response.itemNumber ?? index + 1,
          response: response.response ?? response.score,
        };
      })
    : []
);

const calculateMeasureScore = (name, responses) => {
  if (name === 'PHQ-9') {
    const result = scorePHQ9(responses);
    return { score: result.total, severity: result.severity, item9: result.item9 };
  }

  if (name === 'GAD-7') {
    const result = scoreGAD7(responses);
    return { score: result.total, severity: result.severity };
  }

  return {
    score: responses.reduce((total, response) => total + Number(response?.response ?? 0), 0),
  };
};

export const createClinicalMeasure = async ({
  patientId,
  clinicianId,
  name,
  responses,
  itemMap,
  assessmentId,
  takenAt,
}) => {
  const normalizedResponses = normalizeResponses(responses);
  const { score, severity, item9 } = calculateMeasureScore(name, normalizedResponses);

  const measure = await Measure.create({
    patient: patientId,
    clinician: clinicianId,
    assessmentId,
    name,
    responses: normalizedResponses,
    score,
    itemMap,
    ...(takenAt ? { takenAt } : {}),
  });

  const measuresPHQ9 = name === 'PHQ-9'
    ? [{ score, takenAt: measure.takenAt }]
    : await Measure.find({
        patient: patientId,
        clinician: clinicianId,
        name: 'PHQ-9',
      })
        .sort({ takenAt: 1 })
        .select('score takenAt');

  const risk = assessRisk({
    phq9: name === 'PHQ-9'
      ? { total: score, item9, severity }
      : measuresPHQ9.length
        ? { total: measuresPHQ9.at(-1).score }
        : undefined,
    measuresPHQ9,
  });

  const alertsCreated = [];
  for (const flag of risk.flags) {
    const severityMap = {
      suicide_risk: 'critical',
      high_depression: 'high',
      worsening_trend: 'moderate',
    };

    const alert = await Alert.create({
      patient: patientId,
      clinician: clinicianId,
      type: flag,
      severity: severityMap[flag] || 'moderate',
      relatedMeasureId: measure._id,
    });

    alertsCreated.push(alert);
  }

  await ActivityLog.create({
    actor: clinicianId,
    patient: patientId,
    action: 'create_measure',
    meta: {
      name,
      score,
      assessmentId,
      alerts: risk.flags,
    },
  });

  return { measure, score, severity, alertsCreated };
};
