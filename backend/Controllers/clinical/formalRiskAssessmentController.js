import mongoose from 'mongoose';
import RiskAssessment from '../../models/RiskAssessmentSchema.js';
import TreatmentPlan from '../../models/TreatmentPlanSchema.js';
import PsychologicalPatient from '../../models/PsychologicalPatientSchema.js';
import Doctor from '../../models/DoctorSchema.js';
import TherapySession from '../../models/TherapySessionSchema.js';
import { createRiskAssessmentSchema } from '../../validators/schemas/riskAssessment.schemas.js';
import logger from '../../utils/logger.js';

export const createFormalRiskAssessment = async (req, res) => {
  let session;
  try {
    const { treatmentPlanId } = req.params;
    const clinicianId = req.userId;

    if (!mongoose.isValidObjectId(treatmentPlanId)) {
      return res.status(400).json({ success: false, message: 'Invalid treatment plan id' });
    }

    const { error, value } = createRiskAssessmentSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: false,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid formal risk assessment',
        errors: error.details.map((detail) => detail.message),
      });
    }

    session = await mongoose.startSession();
    let createdAssessment;

    await session.withTransaction(async () => {
      const plan = await TreatmentPlan.findOne({
        _id: treatmentPlanId,
        psychologist: clinicianId,
        isDeleted: { $ne: true },
      }).select('+riskLevel').session(session);

      if (!plan) {
        const notFound = new Error('Treatment plan not found');
        notFound.statusCode = 404;
        throw notFound;
      }

      const patient = await PsychologicalPatient.findOne({
        _id: plan.patient,
        psychologist: clinicianId,
        isDeleted: { $ne: true },
      }).select('user psychologist').session(session);

      if (!patient?.user) {
        const identityError = new Error(
          'Clinical patient is not linked to a platform user; formal risk assessment requires a canonical patient identity',
        );
        identityError.statusCode = 409;
        throw identityError;
      }

      const doctor = await Doctor.findById(clinicianId)
        .select('name licenseNumber isApproved')
        .session(session);

      if (!doctor) {
        const clinicianError = new Error('Clinician not found');
        clinicianError.statusCode = 403;
        throw clinicianError;
      }

      if (doctor.isApproved !== 'approved' || !doctor.licenseNumber?.trim()) {
        const licenseError = new Error(
          'An approved clinician profile with a recorded professional license number is required to sign a formal risk assessment',
        );
        licenseError.statusCode = 409;
        throw licenseError;
      }

      if (value.sessionId) {
        const therapySession = await TherapySession.findOne({
          _id: value.sessionId,
          treatmentPlanId: plan._id,
          patient: plan.patient,
          psychologist: clinicianId,
        }).session(session);

        if (!therapySession) {
          const sessionError = new Error('Session does not belong to this patient and treatment plan');
          sessionError.statusCode = 400;
          throw sessionError;
        }
      }

      // Until source-record ownership checks are implemented, reject provenance IDs
      // rather than persisting unverified links supplied by a client.
      if (value.sourceAssessmentId || value.sourceMeasureId) {
        const provenanceError = new Error(
          'Source assessment and measure linkage is not yet enabled until patient ownership can be verified',
        );
        provenanceError.statusCode = 400;
        throw provenanceError;
      }

      const [riskAssessment] = await RiskAssessment.create([{
        patientId: patient.user,
        treatmentPlanId: plan._id,
        sessionId: value.sessionId,
        assessedBy: clinicianId,
        assessmentDate: value.assessmentDate,
        assessmentType: value.assessmentType,
        assessmentContext: value.assessmentContext,
        columbiaScale: value.columbiaScale,
        riskFactors: value.riskFactors,
        protectiveFactors: value.protectiveFactors,
        clinicalImpression: value.clinicalImpression,
        interventionPlan: value.interventionPlan,
        followUp: value.followUp,
        legalDocumentation: value.legalDocumentation,
        signature: {
          clinicianId,
          clinicianName: doctor.name,
          licenseNumber: doctor.licenseNumber,
          signedAt: new Date(),
        },
        locked: false,
      }], { session });

      riskAssessment.$session(session);
      await riskAssessment.signAndLock(doctor);

      plan.riskLevel = value.clinicalImpression.overallRiskLevel;
      plan.lastRiskAssessment = {
        date: riskAssessment.assessmentDate,
        assessedBy: clinicianId,
        columbiaScore: value.columbiaScale.suicidalIdeationScore,
        interventionRequired: ['HIGH', 'IMMINENT'].includes(value.clinicalImpression.overallRiskLevel),
        riskAssessmentId: riskAssessment._id,
      };

      plan.$locals.clinicalAuditActor = {
        userId: clinicianId,
        role: 'Doctor',
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };

      await plan.save({ session });
      createdAssessment = riskAssessment;
    });

    return res.status(201).json({
      success: true,
      message: 'Formal risk assessment recorded and locked',
      data: createdAssessment,
    });
  } catch (error) {
    logger.error('Error creating formal risk assessment:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error creating formal risk assessment',
    });
  } finally {
    if (session) await session.endSession();
  }
};
