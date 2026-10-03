import mongoose from 'mongoose';
import RiskAssessment from '../../models/RiskAssessmentSchema.js';
import TreatmentPlan from '../../models/TreatmentPlanSchema.js';
import PsychologicalPatient from '../../models/PsychologicalPatientSchema.js';
import PsychologicalAssessment from '../../models/PsychologicalAssessmentSchema.js';
import Measure from '../../models/MeasureSchema.js';
import TherapySession from '../../models/TherapySessionSchema.js';
import Doctor from '../../models/DoctorSchema.js';
import { createRiskAssessmentSchema } from '../../validators/schemas/riskAssessment.schemas.js';
import logger from '../../utils/logger.js';

export const createFormalRiskAssessment = async (req, res) => {
  try {
    const { treatmentPlanId } = req.params;
    const clinicianId = req.userId;

    if (!mongoose.isValidObjectId(treatmentPlanId)) {
      return res.status(400).json({ success: false, message: 'Invalid treatment plan id' });
    }

    const { error, value } = createRiskAssessmentSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid formal risk assessment',
        errors: error.details.map((detail) => detail.message),
      });
    }

    const plan = await TreatmentPlan.findOne({
      _id: treatmentPlanId,
      psychologist: clinicianId,
    }).select('+riskLevel');

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Treatment plan not found' });
    }

    const patient = await PsychologicalPatient.findOne({
      _id: plan.patient,
      psychologist: clinicianId,
    }).select('user psychologist');

    if (!patient?.user) {
      return res.status(409).json({
        success: false,
        message: 'Clinical patient is not linked to a platform user; formal risk assessment requires a canonical patient identity',
      });
    }

    const doctor = await Doctor.findById(clinicianId).select('name');
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Clinician not found' });
    }

    // Provenance is part of the clinical record, not just metadata. Every
    // source must belong to the same patient and clinician as the authorized
    // TreatmentPlan; otherwise a valid clinician token could link another
    // patient's assessment/session into this risk record.
    if (value.sourceAssessmentId) {
      const sourceAssessment = await PsychologicalAssessment.findOne({
        _id: value.sourceAssessmentId,
        patient: plan.patient,
        psychologist: clinicianId,
      }).select('_id');

      if (!sourceAssessment) {
        return res.status(404).json({
          success: false,
          message: 'Source assessment not found',
        });
      }
    }

    if (value.sourceMeasureId) {
      const sourceMeasure = await Measure.findOne({
        _id: value.sourceMeasureId,
        patient: plan.patient,
        clinician: clinicianId,
      }).select('_id');

      if (!sourceMeasure) {
        return res.status(404).json({
          success: false,
          message: 'Source measure not found',
        });
      }
    }

    if (value.sessionId) {
      const sourceSession = await TherapySession.findOne({
        _id: value.sessionId,
        patient: plan.patient,
        psychologist: clinicianId,
      }).select('_id');

      if (!sourceSession) {
        return res.status(404).json({
          success: false,
          message: 'Source therapy session not found',
        });
      }
    }

    const riskAssessment = await RiskAssessment.create({
      patientId: patient.user,
      treatmentPlanId: plan._id,
      sessionId: value.sessionId,
      sourceAssessmentId: value.sourceAssessmentId,
      sourceMeasureId: value.sourceMeasureId,
      assessedBy: clinicianId,
      assessmentDate: value.assessmentDate,
      assessmentType: value.assessmentType,
      assessmentContext: value.assessmentContext,
      columbiaScale: value.columbiaScale,
      riskFactors: value.riskFactors,
      protectiveFactors: value.protectiveFactors,
      clinicalImpression: value.clinicalImpression,
      interventionPlan: value.interventionPlan,
      legalDocumentation: value.legalDocumentation,
      signature: {
        clinicianId,
        clinicianName: doctor.name,
        licenseNumber: value.signature.licenseNumber,
        signedAt: new Date(),
      },
      locked: false,
    });

    plan.riskLevel = value.clinicalImpression.overallRiskLevel;
    plan.lastRiskAssessment = {
      date: riskAssessment.assessmentDate,
      assessedBy: clinicianId,
      columbiaScore: value.columbiaScale.suicidalIdeationScore,
      interventionRequired: value.clinicalImpression.overallRiskLevel === 'HIGH'
        || value.clinicalImpression.overallRiskLevel === 'IMMINENT',
      riskAssessmentId: riskAssessment._id,
    };

    plan.$locals.clinicalAuditActor = {
      userId: clinicianId,
      role: 'Doctor',
      email: req.user?.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    await plan.save();

    return res.status(201).json({
      success: true,
      message: 'Formal risk assessment recorded',
      data: riskAssessment,
    });
  } catch (error) {
    logger.error('Error creating formal risk assessment:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error creating formal risk assessment',
    });
  }
};
