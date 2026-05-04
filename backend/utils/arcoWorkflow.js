import MedicalRecord from '../models/MedicalRecordSchema.js';
import PsychologicalPatient from '../models/PsychologicalPatientSchema.js';
import PsychologicalClinicalHistory from '../models/PsychologicalClinicalHistorySchema.js';
import TreatmentPlan from '../models/TreatmentPlanSchema.js';
import tracer from '../datadog.js';

const REQUEST_TYPES = ['ACCESS', 'RECTIFICATION', 'CANCELLATION', 'OPPOSITION'];

const createOperationStats = () => ({
  count: 0,
  success: 0,
  failure: 0,
  totalMs: 0,
  maxMs: 0,
  lastDurationMs: 0,
  lastOutcome: 'NONE',
  lastError: null,
});

const createMetricsState = () => ({
  totalRequests: 0,
  byRequestType: REQUEST_TYPES.reduce((accumulator, requestType) => {
    accumulator[requestType] = 0;
    return accumulator;
  }, {}),
  byOutcome: {
    SUCCESS: 0,
    FAILURE: 0,
    DENIED: 0,
    PARTIAL: 0,
  },
  operations: {
    createRequest: createOperationStats(),
    approveRequest: createOperationStats(),
    rejectRequest: createOperationStats(),
  },
  recentOperations: [],
});

let metricsState = createMetricsState();

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const deepMerge = (target, source) => {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return deepClone(source);
  }

  const output = deepClone(target);

  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (isPlainObject(value) && isPlainObject(output[key])) {
      output[key] = deepMerge(output[key], value);
      return;
    }

    output[key] = deepClone(value);
  });

  return output;
};

const isPlainObject = (value) => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !(value instanceof Date)
);

const normalizeRequestedFields = (requestedFields = []) => (
  requestedFields
    .filter(Boolean)
    .map((field) => String(field).trim().toLowerCase())
    .filter(Boolean)
);

const shouldIncludeSection = (requestedFields, keywords) => (
  requestedFields.length === 0 || keywords.some((keyword) => requestedFields.some((field) => field.includes(keyword)))
);

const toLeanObject = (document) => document.toObject({ depopulate: true, getters: false, virtuals: false });

const resolveOperationStats = (operation) => {
  if (!metricsState.operations[operation]) {
    metricsState.operations[operation] = createOperationStats();
  }

  return metricsState.operations[operation];
};

export const recordArcoMetric = ({ operation, requestType, outcome = 'SUCCESS', durationMs = 0, error = null }) => {
  const operationStats = resolveOperationStats(operation);
  operationStats.count += 1;
  operationStats.totalMs += durationMs;
  operationStats.lastDurationMs = durationMs;
  operationStats.maxMs = Math.max(operationStats.maxMs, durationMs);
  operationStats.lastOutcome = outcome;

  if (outcome === 'SUCCESS') {
    operationStats.success += 1;
  } else {
    operationStats.failure += 1;
    operationStats.lastError = error || null;
  }

  if (requestType && metricsState.byRequestType[requestType] !== undefined) {
    metricsState.byRequestType[requestType] += 1;
  }

  if (metricsState.byOutcome[outcome] !== undefined) {
    metricsState.byOutcome[outcome] += 1;
  }

  metricsState.totalRequests += 1;
  metricsState.recentOperations.unshift({
    operation,
    requestType: requestType || null,
    outcome,
    durationMs,
    error: error || null,
    timestamp: new Date().toISOString(),
  });

  metricsState.recentOperations = metricsState.recentOperations.slice(0, 20);
};

export const getArcoMetricsSnapshot = () => {
  const snapshot = deepClone(metricsState);

  Object.values(snapshot.operations).forEach((stats) => {
    stats.averageMs = stats.count > 0 ? Number((stats.totalMs / stats.count).toFixed(2)) : 0;
  });

  return snapshot;
};

export const resetArcoMetrics = () => {
  metricsState = createMetricsState();
};

const traceWithDatadog = async (operation, tags, handler) => {
  const spanName = `arco.${operation}`;
  const spanTags = { feature: 'arco', operation, ...tags };

  if (typeof tracer?.trace === 'function') {
    return tracer.trace(spanName, { tags: spanTags }, handler);
  }

  return handler();
};

const normalizePatch = (value) => {
  if (!isPlainObject(value)) {
    return { id: null, patch: null };
  }

  if (isPlainObject(value.changes)) {
    return {
      id: value.id || value._id || null,
      patch: value.changes,
    };
  }

  const { id, _id, ...patch } = value;
  return {
    id: id || _id || null,
    patch,
  };
};

const resolveDocument = async (model, query, targetId = null) => {
  if (targetId) {
    return model.findOne({ ...query, _id: targetId }).setOptions({ includeDeleted: true });
  }

  return model.findOne(query).sort({ updatedAt: -1, createdAt: -1 }).setOptions({ includeDeleted: true });
};

const applyRectificationPatch = async ({ model, query, targetId, patch, actor, requestId, entity }) => {
  const normalized = normalizePatch(patch);
  if (!normalized.patch) {
    return {
      entity,
      applied: false,
      reason: 'EMPTY_PATCH',
      changedPaths: [],
    };
  }

  const document = await resolveDocument(model, query, targetId || normalized.id);
  if (!document) {
    return {
      entity,
      applied: false,
      reason: 'NOT_FOUND',
      changedPaths: [],
    };
  }

  if (document.isDeleted) {
    return {
      entity,
      applied: false,
      reason: 'DELETED',
      changedPaths: [],
    };
  }

  const mergedDocument = deepMerge(document.toObject({ depopulate: false, getters: false, virtuals: false }), normalized.patch);

  document.set(mergedDocument);
  document.$locals = document.$locals || {};
  document.$locals.clinicalAuditActor = actor;
  document.$locals.clinicalAuditReason = `ARCO rectification request ${requestId}`;

  await document.save();

  return {
    entity,
    applied: true,
    documentId: document._id.toString(),
    changedPaths: Object.keys(normalized.patch),
  };
};

export const executeArcoRectification = async ({ subjectUserId, requestedChanges = {}, actor, requestId }) => {
  return traceWithDatadog('rectification', { requestType: 'RECTIFICATION', subjectUserId: String(subjectUserId) }, async () => {
    const rectificationChanges = isPlainObject(requestedChanges) ? requestedChanges : {};
    const primaryPatient = await PsychologicalPatient.findOne({ user: subjectUserId }).setOptions({ includeDeleted: true });
    const patientIds = primaryPatient ? [primaryPatient._id] : [];

    const results = [];

    if (rectificationChanges.psychologicalPatient) {
      results.push(
        await applyRectificationPatch({
          model: PsychologicalPatient,
          query: { user: subjectUserId },
          patch: rectificationChanges.psychologicalPatient,
          actor,
          requestId,
          entity: 'PsychologicalPatient',
        })
      );
    }

    if (rectificationChanges.medicalRecord) {
      results.push(
        await applyRectificationPatch({
          model: MedicalRecord,
          query: { user: subjectUserId },
          targetId: rectificationChanges.medicalRecord.id || rectificationChanges.medicalRecord._id,
          patch: rectificationChanges.medicalRecord,
          actor,
          requestId,
          entity: 'MedicalRecord',
        })
      );
    }

    if (rectificationChanges.clinicalHistory) {
      results.push(
        await applyRectificationPatch({
          model: PsychologicalClinicalHistory,
          query: patientIds.length > 0 ? { patient: { $in: patientIds } } : { patient: null },
          targetId: rectificationChanges.clinicalHistory.id || rectificationChanges.clinicalHistory._id,
          patch: rectificationChanges.clinicalHistory,
          actor,
          requestId,
          entity: 'PsychologicalClinicalHistory',
        })
      );
    }

    if (rectificationChanges.treatmentPlan) {
      results.push(
        await applyRectificationPatch({
          model: TreatmentPlan,
          query: patientIds.length > 0 ? { patient: { $in: patientIds } } : { patient: null },
          targetId: rectificationChanges.treatmentPlan.id || rectificationChanges.treatmentPlan._id,
          patch: rectificationChanges.treatmentPlan,
          actor,
          requestId,
          entity: 'TreatmentPlan',
        })
      );
    }

    const appliedCount = results.filter((result) => result.applied).length;
    const skippedCount = results.length - appliedCount;

    return {
      results,
      appliedCount,
      skippedCount,
      patientIds: patientIds.map((patientId) => patientId.toString()),
      hasPrimaryPatient: Boolean(primaryPatient),
    };
  });
};

export const buildArcoExportBundle = async ({ subjectUserId, requestedFields = [] }) => {
  return traceWithDatadog('export', { requestType: 'ACCESS', subjectUserId: String(subjectUserId) }, async () => {
    const normalizedRequestedFields = normalizeRequestedFields(requestedFields);
    const patientProfiles = await PsychologicalPatient.find({ user: subjectUserId }).setOptions({ includeDeleted: true }).sort({ updatedAt: -1 });
    const patientIds = patientProfiles.map((patientProfile) => patientProfile._id);

    const medicalRecords = await MedicalRecord.find({ user: subjectUserId }).setOptions({ includeDeleted: true }).sort({ createdAt: -1 });
    const clinicalHistories = patientIds.length > 0
      ? await PsychologicalClinicalHistory.find({ patient: { $in: patientIds } }).setOptions({ includeDeleted: true }).sort({ updatedAt: -1 })
      : [];
    const treatmentPlans = patientIds.length > 0
      ? await TreatmentPlan.find({ patient: { $in: patientIds } }).setOptions({ includeDeleted: true }).sort({ updatedAt: -1 })
      : [];

    const exportBundle = {
      generatedAt: new Date().toISOString(),
      subjectUserId: subjectUserId?.toString?.() || String(subjectUserId),
      requestedFields: normalizedRequestedFields,
      sections: {},
      summary: {
        patientProfiles: patientProfiles.length,
        medicalRecords: medicalRecords.length,
        clinicalHistories: clinicalHistories.length,
        treatmentPlans: treatmentPlans.length,
        totalDocuments: patientProfiles.length + medicalRecords.length + clinicalHistories.length + treatmentPlans.length,
      },
    };

    if (shouldIncludeSection(normalizedRequestedFields, ['patient', 'profile', 'psychological'])) {
      exportBundle.sections.psychologicalPatients = patientProfiles.map((profile) => toLeanObject(profile));
    }

    if (shouldIncludeSection(normalizedRequestedFields, ['medical', 'record', 'health'])) {
      exportBundle.sections.medicalRecords = medicalRecords.map((record) => toLeanObject(record));
    }

    if (shouldIncludeSection(normalizedRequestedFields, ['history', 'clinical', 'psychological'])) {
      exportBundle.sections.clinicalHistories = clinicalHistories.map((history) => toLeanObject(history));
    }

    if (shouldIncludeSection(normalizedRequestedFields, ['treatment', 'plan', 'therapy'])) {
      exportBundle.sections.treatmentPlans = treatmentPlans.map((plan) => toLeanObject(plan));
    }

    return exportBundle;
  });
};
