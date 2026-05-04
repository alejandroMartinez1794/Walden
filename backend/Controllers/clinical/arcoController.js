import ARCORequest from '../../models/ARCORequestSchema.js';
import ClinicalAuditLog from '../../models/ClinicalAuditLogSchema.js';
import MedicalRecord from '../../models/MedicalRecordSchema.js';
import PsychologicalPatient from '../../models/PsychologicalPatientSchema.js';
import PsychologicalClinicalHistory from '../../models/PsychologicalClinicalHistorySchema.js';
import TreatmentPlan from '../../models/TreatmentPlanSchema.js';
import logger from '../../utils/logger.js';
import {
  buildArcoExportBundle,
  executeArcoRectification,
  getArcoMetricsSnapshot,
  recordArcoMetric,
} from '../../utils/arcoWorkflow.js';

const REQUEST_TYPES = {
  ACCESS: 'ACCESS',
  RECTIFICATION: 'RECTIFICATION',
  CANCELLATION: 'CANCELLATION',
  OPPOSITION: 'OPPOSITION',
};

const AUDIT_ROLE_MAP = {
  paciente: 'User',
  user: 'User',
  doctor: 'Doctor',
  admin: 'Admin',
  system: 'system',
  unknown: 'unknown',
};

const normalizeAuditRole = (role = 'unknown') => {
  const key = String(role).toLowerCase();
  return AUDIT_ROLE_MAP[key] || 'unknown';
};

const isAdminUser = (req) => normalizeAuditRole(req.role || req.user?.role) === 'Admin';

const buildRequester = (req) => ({
  userId: req.userId,
  role: req.role || req.user?.role || 'unknown',
  email: req.user?.email || null,
});

const buildAuditActor = (req) => ({
  userId: req.userId,
  role: normalizeAuditRole(req.role || req.user?.role),
  email: req.user?.email || null,
  ip: req.ip,
  userAgent: req.get('user-agent') || null,
});

const writeAudit = async (payload) => {
  try {
    await ClinicalAuditLog.log(payload);
  } catch (error) {
    logger.error('Error writing ARCO audit log:', error);
  }
};

const finalizeMetric = (operation, requestType, startedAt, outcome, error = null) => {
  recordArcoMetric({
    operation,
    requestType,
    outcome,
    durationMs: Date.now() - startedAt,
    error: error ? error.message || String(error) : null,
  });
};

const buildRequestPayload = (req, requestType) => {
  const requester = buildRequester(req);
  const subjectUserId = isAdminUser(req) && req.body.subjectUserId ? req.body.subjectUserId : req.userId;

  return {
    requester,
    subject: {
      userId: subjectUserId,
      role: isAdminUser(req) ? req.body.subjectRole || requester.role : requester.role,
      email: isAdminUser(req) ? req.body.subjectEmail || null : requester.email,
    },
    requestType,
    reason: req.body.reason,
    details: req.body.details,
    requestedFields: req.body.requestedFields || [],
    requestedChanges: req.body.requestedChanges || {},
    metadata: {
      ip: req.ip,
      userAgent: req.get('user-agent') || null,
    },
  };
};

const createRequest = (requestType) => async (req, res) => {
  const startedAt = Date.now();

  try {
    const arcoRequest = await ARCORequest.create(buildRequestPayload(req, requestType));

    await writeAudit({
      actor: buildAuditActor(req),
      action: 'CREATE',
      resource: { entity: 'ARCORequest', entityId: arcoRequest._id },
      changes: [
        { path: 'requestType', previousValue: null, newValue: requestType },
        { path: 'status', previousValue: null, newValue: 'PENDING' },
      ],
      newValue: arcoRequest.toObject(),
      context: { status: 'SUCCESS' },
    });

    finalizeMetric('createRequest', requestType, startedAt, 'SUCCESS');

    return res.status(201).json({
      success: true,
      message: 'Solicitud ARCO creada',
      data: arcoRequest,
    });
  } catch (error) {
    finalizeMetric('createRequest', requestType, startedAt, 'FAILURE', error);
    logger.error('Error creating ARCO request:', error);
    return res.status(400).json({ success: false, message: 'No se pudo crear la solicitud ARCO' });
  }
};

const softDeleteMany = async (documents, actor, reason, summary) => {
  for (const document of documents) {
    if (document.isDeleted) continue;

    try {
      await document.softDelete(actor, reason);
      summary.deleted += 1;
    } catch (error) {
      summary.blockedByLegalHold += 1;
      logger.warn('ARCO soft delete blocked:', {
        entity: summary.entity,
        id: document._id?.toString?.(),
        error: error.message,
      });
    }
  }
};

const executeCancellationCascade = async (subjectUserId, actor, requestId) => {
  const reason = `ARCO cancellation request ${requestId}`;
  const summary = {
    medicalRecords: { entity: 'MedicalRecord', deleted: 0, blockedByLegalHold: 0 },
    psychologicalPatients: { entity: 'PsychologicalPatient', deleted: 0, blockedByLegalHold: 0 },
    clinicalHistories: { entity: 'PsychologicalClinicalHistory', deleted: 0, blockedByLegalHold: 0 },
    treatmentPlans: { entity: 'TreatmentPlan', deleted: 0, blockedByLegalHold: 0 },
  };

  const patientProfiles = await PsychologicalPatient.find({ user: subjectUserId }).setOptions({ includeDeleted: true });
  const patientIds = patientProfiles.map((patient) => patient._id);

  await softDeleteMany(
    await MedicalRecord.find({ user: subjectUserId }).setOptions({ includeDeleted: true }),
    actor,
    reason,
    summary.medicalRecords
  );
  await softDeleteMany(patientProfiles, actor, reason, summary.psychologicalPatients);
  await softDeleteMany(
    await PsychologicalClinicalHistory.find({ patient: { $in: patientIds } }).setOptions({ includeDeleted: true }),
    actor,
    reason,
    summary.clinicalHistories
  );
  await softDeleteMany(
    await TreatmentPlan.find({ patient: { $in: patientIds } }).setOptions({ includeDeleted: true }),
    actor,
    reason,
    summary.treatmentPlans
  );

  return {
    reason,
    patientCount: patientProfiles.length,
    summary,
    patientIds: patientIds.map((id) => id.toString()),
  };
};

export const submitAccessRequest = createRequest(REQUEST_TYPES.ACCESS);
export const submitRectificationRequest = createRequest(REQUEST_TYPES.RECTIFICATION);
export const submitCancellationRequest = createRequest(REQUEST_TYPES.CANCELLATION);
export const submitOppositionRequest = createRequest(REQUEST_TYPES.OPPOSITION);

export const listMyARCORequests = async (req, res) => {
  try {
    const requests = await ARCORequest.find({ 'requester.userId': req.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    logger.error('Error listing my ARCO requests:', error);
    return res.status(500).json({ success: false, message: 'No se pudieron listar las solicitudes ARCO' });
  }
};

export const listARCORequests = async (req, res) => {
  try {
    const { status, requestType, subjectUserId, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (requestType) filter.requestType = requestType;
    if (subjectUserId) filter['subject.userId'] = subjectUserId;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      ARCORequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      ARCORequest.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error) {
    logger.error('Error listing ARCO requests:', error);
    return res.status(500).json({ success: false, message: 'No se pudieron listar las solicitudes ARCO' });
  }
};

export const approveARCORequest = async (req, res) => {
  const startedAt = Date.now();

  try {
    const { id: requestId } = req.params;
    const { reviewNotes } = req.body || {};

    const arcoRequest = await ARCORequest.findById(requestId);
    if (!arcoRequest) {
      finalizeMetric('approveRequest', null, startedAt, 'FAILURE', new Error('Solicitud ARCO no encontrada'));
      return res.status(404).json({ success: false, message: 'Solicitud ARCO no encontrada' });
    }

    if (['REJECTED', 'FULFILLED'].includes(arcoRequest.status)) {
      finalizeMetric('approveRequest', arcoRequest.requestType, startedAt, 'DENIED', new Error('La solicitud ya fue cerrada'));
      return res.status(409).json({ success: false, message: 'La solicitud ya fue cerrada' });
    }

    const actor = buildAuditActor(req);
    const previousStatus = arcoRequest.status;

    arcoRequest.review.reviewedBy = req.userId;
    arcoRequest.review.reviewedByRole = req.role || req.user?.role || 'admin';
    arcoRequest.review.reviewedAt = new Date();
    arcoRequest.review.reviewNotes = reviewNotes || null;

    let fulfillment = null;
    if (arcoRequest.requestType === REQUEST_TYPES.CANCELLATION) {
      fulfillment = await executeCancellationCascade(arcoRequest.subject.userId, actor, arcoRequest._id);
      arcoRequest.status = 'FULFILLED';
      arcoRequest.fulfillment.fulfilledAt = new Date();
      arcoRequest.fulfillment.fulfilledBy = req.userId;
      arcoRequest.fulfillment.summary = `Cascada de soft-delete completada para ${fulfillment.patientCount} expediente(s) psicologico(s).`;
      arcoRequest.fulfillment.affectedEntities = Object.values(fulfillment.summary).map((entity) => ({
        entity: entity.entity,
        count: entity.deleted,
        blockedByLegalHold: entity.blockedByLegalHold,
      }));
    } else if (arcoRequest.requestType === REQUEST_TYPES.ACCESS) {
      const exportBundle = await buildArcoExportBundle({
        subjectUserId: arcoRequest.subject.userId,
        requestedFields: arcoRequest.requestedFields,
      });

      arcoRequest.status = 'FULFILLED';
      arcoRequest.fulfillment.fulfilledAt = new Date();
      arcoRequest.fulfillment.fulfilledBy = req.userId;
      arcoRequest.fulfillment.summary = 'Solicitud de acceso atendida y exportación clínica preparada.';
      arcoRequest.fulfillment.exportBundle = exportBundle;
    } else if (arcoRequest.requestType === REQUEST_TYPES.RECTIFICATION) {
      const rectificationOutcome = await executeArcoRectification({
        subjectUserId: arcoRequest.subject.userId,
        requestedChanges: arcoRequest.requestedChanges,
        actor,
        requestId: arcoRequest._id,
      });

      arcoRequest.status = rectificationOutcome.skippedCount > 0 && rectificationOutcome.appliedCount > 0
        ? 'PARTIALLY_FULFILLED'
        : 'FULFILLED';
      arcoRequest.fulfillment.fulfilledAt = new Date();
      arcoRequest.fulfillment.fulfilledBy = req.userId;
      arcoRequest.fulfillment.summary = rectificationOutcome.appliedCount > 0
        ? `Rectificación aplicada en ${rectificationOutcome.appliedCount} documento(s).`
        : 'Rectificación revisada sin cambios aplicables.';
      arcoRequest.fulfillment.rectificationResults = rectificationOutcome.results;
      fulfillment = rectificationOutcome;
    } else {
      arcoRequest.status = 'APPROVED';
      arcoRequest.fulfillment.fulfilledAt = new Date();
      arcoRequest.fulfillment.fulfilledBy = req.userId;
      arcoRequest.fulfillment.summary = 'Solicitud aprobada para seguimiento administrativo.';
    }

    await arcoRequest.save();

    await writeAudit({
      actor,
      action: 'UPDATE',
      resource: { entity: 'ARCORequest', entityId: arcoRequest._id },
      changes: [
        { path: 'status', previousValue: previousStatus, newValue: arcoRequest.status },
      ],
      previousValue: { status: previousStatus },
      newValue: arcoRequest.toObject(),
      context: {
        status: 'SUCCESS',
        reason: reviewNotes || arcoRequest.review.reviewNotes || null,
      },
    });

    finalizeMetric('approveRequest', arcoRequest.requestType, startedAt, 'SUCCESS');

    return res.status(200).json({
      success: true,
      message: 'Solicitud ARCO aprobada',
      data: arcoRequest,
      cascade: fulfillment,
    });
  } catch (error) {
    finalizeMetric('approveRequest', null, startedAt, 'FAILURE', error);
    logger.error('Error approving ARCO request:', error);
    return res.status(500).json({ success: false, message: 'No se pudo aprobar la solicitud ARCO' });
  }
};

export const rejectARCORequest = async (req, res) => {
  const startedAt = Date.now();

  try {
    const { id: requestId } = req.params;
    const { reviewNotes } = req.body || {};

    const arcoRequest = await ARCORequest.findById(requestId);
    if (!arcoRequest) {
      finalizeMetric('rejectRequest', null, startedAt, 'FAILURE', new Error('Solicitud ARCO no encontrada'));
      return res.status(404).json({ success: false, message: 'Solicitud ARCO no encontrada' });
    }

    const previousStatus = arcoRequest.status;
    arcoRequest.status = 'REJECTED';
    arcoRequest.review.reviewedBy = req.userId;
    arcoRequest.review.reviewedByRole = req.role || req.user?.role || 'admin';
    arcoRequest.review.reviewedAt = new Date();
    arcoRequest.review.reviewNotes = reviewNotes || 'Solicitud rechazada por revisión administrativa.';

    await arcoRequest.save();

    await writeAudit({
      actor: buildAuditActor(req),
      action: 'UPDATE',
      resource: { entity: 'ARCORequest', entityId: arcoRequest._id },
      changes: [
        { path: 'status', previousValue: previousStatus, newValue: arcoRequest.status },
      ],
      previousValue: { status: previousStatus },
      newValue: arcoRequest.toObject(),
      context: {
        status: 'SUCCESS',
        reason: arcoRequest.review.reviewNotes,
      },
    });

    finalizeMetric('rejectRequest', arcoRequest.requestType, startedAt, 'SUCCESS');

    return res.status(200).json({
      success: true,
      message: 'Solicitud ARCO rechazada',
      data: arcoRequest,
    });
  } catch (error) {
    finalizeMetric('rejectRequest', null, startedAt, 'FAILURE', error);
    logger.error('Error rejecting ARCO request:', error);
    return res.status(500).json({ success: false, message: 'No se pudo rechazar la solicitud ARCO' });
  }
};

export const getARCOMetrics = async (req, res) => {
  const startedAt = Date.now();

  try {
    const snapshot = getArcoMetricsSnapshot();
    finalizeMetric('getMetrics', null, startedAt, 'SUCCESS');

    return res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    finalizeMetric('getMetrics', null, startedAt, 'FAILURE', error);
    logger.error('Error getting ARCO metrics:', error);
    return res.status(500).json({ success: false, message: 'No se pudieron obtener las métricas ARCO' });
  }
};