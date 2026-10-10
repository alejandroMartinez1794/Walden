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
  const instrument = {
    'PHQ-9': { itemCount: 9, maxResponse: 3 },
    'GAD-7': { itemCount: 7, maxResponse: 3 },
  }[name];

  if (!instrument) {
    const error = new Error(`Automated scoring is not configured for instrument: ${name}`);
    error.statusCode = 422;
    throw error;
  }

  if (responses.length !== instrument.itemCount) {
    const error = new Error(`${name} requires exactly ${instrument.itemCount} responses`);
    error.statusCode = 400;
    throw error;
  }

  const invalidResponse = responses.find(({ response }) => {
    const value = Number(response);
    return !Number.isInteger(value) || value < 0 || value > instrument.maxResponse;
  });

  if (invalidResponse) {
    const error = new Error(`${name} responses must be integers between 0 and ${instrument.maxResponse}`);
    error.statusCode = 400;
    throw error;
  }

  const validatedResponses = responses.map((response) => ({
    ...response,
    response: Number(response.response),
  }));

  if (name === 'PHQ-9') {
    const result = scorePHQ9(validatedResponses);
    return { score: result.total, severity: result.severity, item9: result.item9 };
  }

  const result = scoreGAD7(validatedResponses);
  return { score: result.total, severity: result.severity };
};

const ensureRiskArtifacts = async ({
  patientId,
  clinicianId,
  measure,
  name,
  score,
  severity,
  item9,
  session,
  isNewMeasure,
}) => {
  const measuresPHQ9 = await Measure.find({
    patient: patientId,
    clinician: clinicianId,
    name: 'PHQ-9',
  })
    .sort({ takenAt: 1 })
    .select('score takenAt responses')
    .session(session);

  // A new PHQ-9 is already visible inside the transaction. For a replay,
  // recover item 9 from the persisted Measure instead of dropping the signal.
  const currentPHQ9 = name === 'PHQ-9'
    ? measuresPHQ9.find((candidate) => candidate._id?.toString() === measure._id.toString())
    : null;
  const currentItem9 = item9 ?? currentPHQ9?.responses?.find((response) => response?.itemNumber === 9)?.response;

  const risk = assessRisk({
    phq9: measuresPHQ9.length
      ? {
          total: name === 'PHQ-9' ? score : measuresPHQ9.at(-1).score,
          item9: currentItem9,
          severity,
        }
      : undefined,
    measuresPHQ9,
  });

  // BDI-II item 9 is also a suicide-risk signal; do not let the PHQ-9-only
  // trend engine suppress an explicit positive response from this instrument.
  if (name === 'BDI-II' && Number(item9 ?? currentItem9 ?? 0) > 0 && !risk.flags.includes('suicide_risk')) {
    risk.flags.push('suicide_risk');
    risk.reasons.push('BDI-II ítem 9 positivo');
  }

  const alertsCreated = [];
  const severityMap = {
    suicide_risk: 'critical',
    high_depression: 'high',
    worsening_trend: 'moderate',
  };

  for (const flag of risk.flags) {
    const existingAlert = await Alert.findOne({
      patient: patientId,
      clinician: clinicianId,
      type: flag,
      relatedMeasureId: measure._id,
    }).session(session);

    if (existingAlert) {
      alertsCreated.push(existingAlert);
      continue;
    }

    const [alert] = await Alert.create([{
      patient: patientId,
      clinician: clinicianId,
      type: flag,
      severity: severityMap[flag] || 'moderate',
      relatedMeasureId: measure._id,
      ...(flag === 'suicide_risk' ? {
        mitigation: { urgentAppointment: true },
        notes: `${name} score ${score}. Respuesta positiva en el ítem 9; requiere evaluación clínica inmediata.`,
      } : {
        notes: `${name} score ${score}. Señal de depresión elevada detectada; requiere revisión clínica.`,
      }),
    }], { session });

    alertsCreated.push(alert);
  }

  await ActivityLog.create([{
    actor: clinicianId,
    patient: patientId,
    action: isNewMeasure ? 'create_measure' : 'reconcile_measure',
    meta: {
      name,
      score,
      assessmentId: measure.assessmentId,
      alerts: risk.flags,
    },
  }], { session });

  return { risk, alertsCreated };
};

/**
 * Canonical domain write path for Assessment -> Measure.
 *
 * All callers must use this service rather than creating Measure records
 * directly. When a MongoDB session is supplied, the Measure, risk alerts
 * and audit log participate in the same transaction as the Assessment.
 */
export const createClinicalMeasure = async ({
  patientId,
  clinicianId,
  name,
  responses,
  itemMap,
  assessmentId,
  takenAt,
  session = null,
}) => {
  const normalizedResponses = normalizeResponses(responses);
  const { score, severity, item9 } = calculateMeasureScore(name, normalizedResponses);

  // assessmentId is the provenance key. Application-level idempotency is used
  // here deliberately; the unique DB index is deferred until legacy data has
  // been checked for duplicate/non-provenance records.
  let measure = assessmentId
    ? await Measure.findOne({ assessmentId }).session(session)
    : null;

  let isNewMeasure = false;

  if (measure) {
    const sameOwner =
      measure.patient?.toString() === patientId?.toString()
      && measure.clinician?.toString() === clinicianId?.toString()
      && measure.name === name;

    if (!sameOwner) {
      const error = new Error('Assessment provenance is already linked to a different clinical owner or instrument');
      error.statusCode = 409;
      throw error;
    }
  } else {
    const payload = {
      patient: patientId,
      clinician: clinicianId,
      assessmentId,
      name,
      responses: normalizedResponses,
      score,
      itemMap,
      ...(takenAt ? { takenAt } : {}),
    };

    const [createdMeasure] = await Measure.create([payload], { session });
    measure = createdMeasure;
    isNewMeasure = true;
  }

  const { risk, alertsCreated } = await ensureRiskArtifacts({
    patientId,
    clinicianId,
    measure,
    name,
    score: measure.score,
    severity,
    item9,
    session,
    isNewMeasure,
  });

  return {
    measure,
    score: measure.score,
    severity,
    alertsCreated,
    risk,
    created: isNewMeasure,
  };
};
