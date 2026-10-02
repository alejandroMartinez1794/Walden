// backend/services/clinicalAuthorization.js
import mongoose from 'mongoose';
import TreatmentPlan from '../models/TreatmentPlanSchema.js';

/**
 * Object-level authorization for clinical resources.
 *
 * Function-level role checks (restrict(['doctor'])) answer:
 *   "May this actor call a clinical endpoint?"
 *
 * This service answers the separate question:
 *   "May this actor operate on THIS patient's clinical record?"
 *
 * TreatmentPlan is the authorization boundary for the current clinical core.
 * Resource-specific records must resolve back to a treatment plan before a
 * clinician is allowed to read or mutate them.
 */

const toObjectId = (value, fieldName) => {
  if (!value || !mongoose.isValidObjectId(value)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
  return new mongoose.Types.ObjectId(value);
};

const deny = (message = 'Clinical resource access denied') => {
  const error = new Error(message);
  error.statusCode = 403;
  throw error;
};

export const loadTreatmentPlanForClinicalAuthorization = async (
  treatmentPlanId,
  { session } = {}
) => {
  const id = toObjectId(treatmentPlanId, 'treatmentPlanId');

  const query = TreatmentPlan.findById(id)
    .select('_id patient patientId psychologist psychologistId status isDeleted');

  if (session) query.session(session);

  const plan = await query;
  if (!plan || plan.isDeleted) {
    const error = new Error('Treatment plan not found');
    error.statusCode = 404;
    throw error;
  }

  return plan;
};

/**
 * Assert that the authenticated actor may operate on a treatment plan.
 *
 * Admins are intentionally NOT treated as clinical owners. Technical
 * administration and clinical authority are separate concerns.
 */
export const assertTreatmentPlanAccess = async ({
  req,
  treatmentPlanId,
  action = 'read',
  session,
}) => {
  const actorId = req.userId || req.user?.id;
  const actorRole = String(req.role || req.user?.role || '').toLowerCase();

  if (!actorId || !mongoose.isValidObjectId(actorId)) {
    deny();
  }

  if (actorRole !== 'doctor' && actorRole !== 'medico') {
    deny('Clinical action requires an authorized clinician');
  }

  const plan = await loadTreatmentPlanForClinicalAuthorization(treatmentPlanId, { session });

  const clinicianId = plan.psychologistId || plan.psychologist;
  if (!clinicianId || clinicianId.toString() !== actorId.toString()) {
    deny(`Clinician is not assigned to this treatment plan for action: ${action}`);
  }

  return plan;
};

/**
 * Assert a resource whose document already carries treatmentPlanId.
 *
 * The resource is loaded with the supplied loader only after the treatment
 * plan relationship has been checked. The returned resource is therefore
 * safe to pass to the controller/service layer.
 */
export const assertResourceAccess = async ({
  req,
  treatmentPlanId,
  action,
  loadResource,
  session,
}) => {
  const plan = await assertTreatmentPlanAccess({
    req,
    treatmentPlanId,
    action,
    session,
  });

  const resource = await loadResource(plan, session);
  if (!resource) {
    const error = new Error('Clinical resource not found');
    error.statusCode = 404;
    throw error;
  }

  return { plan, resource };
};

/**
 * For endpoints receiving patientId directly, never trust the patientId as
 * an ownership assertion. Resolve it through the clinician's treatment plan.
 *
 * patientId may be either the User id or the PsychologicalPatient id during
 * the current migration; the canonical relationship is still enforced by
 * TreatmentPlan.
 */
export const assertPatientAccess = async ({
  req,
  patientId,
  action = 'read',
  session,
}) => {
  const requestedPatientId = toObjectId(patientId, 'patientId');
  const actorId = req.userId || req.user?.id;

  if (!actorId || !mongoose.isValidObjectId(actorId)) {
    deny();
  }

  const query = {
    $and: [
      {
        $or: [
          { patientId: requestedPatientId },
          { patient: requestedPatientId },
        ],
      },
      {
        $or: [
          { psychologist: actorId },
          { psychologistId: actorId },
        ],
      },
    ],
    isDeleted: { $ne: true },
  };

  let planQuery = TreatmentPlan.findOne(query).select(
    '_id patient patientId psychologist psychologistId status isDeleted'
  );
  if (session) planQuery = planQuery.session(session);

  const plan = await planQuery;
  if (!plan) {
    // Do not disclose whether another clinician owns the patient.
    deny(`Clinician has no authorized treatment relationship for action: ${action}`);
  }

  return plan;
};

export const assertActorCanAccessResource = async ({
  req,
  treatmentPlanId,
  action,
  session,
}) => assertTreatmentPlanAccess({ req, treatmentPlanId, action, session });

export default {
  loadTreatmentPlanForClinicalAuthorization,
  assertTreatmentPlanAccess,
  assertResourceAccess,
  assertPatientAccess,
  assertActorCanAccessResource,
};
