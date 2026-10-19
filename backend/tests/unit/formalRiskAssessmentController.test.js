import mongoose from 'mongoose';
import RiskAssessment from '../../models/RiskAssessmentSchema.js';
import TreatmentPlan from '../../models/TreatmentPlanSchema.js';
import PsychologicalPatient from '../../models/PsychologicalPatientSchema.js';
import Doctor from '../../models/DoctorSchema.js';
import TherapySession from '../../models/TherapySessionSchema.js';
import { createRiskAssessmentSchema } from '../../validators/schemas/riskAssessment.schemas.js';
import { createFormalRiskAssessment } from '../../Controllers/clinical/formalRiskAssessmentController.js';

jest.mock('mongoose', () => ({
  __esModule: true,
  default: {
    isValidObjectId: jest.fn(),
    startSession: jest.fn(),
  },
}));

jest.mock('../../models/RiskAssessmentSchema.js', () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));
jest.mock('../../models/TreatmentPlanSchema.js', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));
jest.mock('../../models/PsychologicalPatientSchema.js', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));
jest.mock('../../models/DoctorSchema.js', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));
jest.mock('../../models/TherapySessionSchema.js', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));
jest.mock('../../validators/schemas/riskAssessment.schemas.js', () => ({
  createRiskAssessmentSchema: { validate: jest.fn() },
}));
jest.mock('../../utils/logger.js', () => ({
  __esModule: true,
  default: { error: jest.fn() },
}));

const PLAN_ID = '507f1f77bcf86cd799439011';
const CLINICIAN_ID = '507f191e810c19729de860ea';
const PATIENT_ID = '507f1f77bcf86cd799439012';
const SESSION_ID = '507f1f77bcf86cd799439013';

const validPayload = () => ({
  assessmentType: 'INTAKE',
  assessmentContext: 'Clinical intake assessment with documented interview.',
  columbiaScale: { suicidalIdeationScore: 0 },
  clinicalImpression: {
    overallRiskLevel: 'LOW',
    riskLevelJustification: 'No acute indicators identified in this assessment.',
  },
  followUp: { nextAssessmentDue: '2026-10-20T12:00:00.000Z' },
  legalDocumentation: {
    dutyToProtectConsidered: false,
    informedConsentObtained: true,
  },
});

const responseMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const queryReturning = (value) => ({
  select: jest.fn().mockReturnThis(),
  session: jest.fn().mockResolvedValue(value),
});

describe('createFormalRiskAssessment', () => {
  let req;
  let res;
  let transaction;
  let plan;
  let assessment;
  let patient;
  let doctor;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: { treatmentPlanId: PLAN_ID },
      userId: CLINICIAN_ID,
      user: { email: 'clinician@example.test' },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-agent'),
      body: validPayload(),
    };
    res = responseMock();

    assessment = {
      _id: '507f1f77bcf86cd799439014',
      $session: jest.fn(),
      signAndLock: jest.fn().mockResolvedValue(undefined),
    };
    plan = {
      _id: PLAN_ID,
      patient: PATIENT_ID,
      $locals: {},
      save: jest.fn().mockResolvedValue(undefined),
    };
    patient = { user: '507f1f77bcf86cd799439015' };
    doctor = { name: 'Dr Test', licenseNumber: 'LIC-123', isApproved: 'approved' };

    transaction = {
      withTransaction: jest.fn(async (callback) => callback()),
      endSession: jest.fn().mockResolvedValue(undefined),
    };

    mongoose.isValidObjectId.mockReturnValue(true);
    mongoose.startSession.mockResolvedValue(transaction);
    createRiskAssessmentSchema.validate.mockImplementation((value) => ({ value }));
    TreatmentPlan.findOne.mockReturnValue(queryReturning(plan));
    PsychologicalPatient.findOne.mockReturnValue(queryReturning(patient));
    Doctor.findById.mockReturnValue(queryReturning(doctor));
    RiskAssessment.create.mockResolvedValue([assessment]);
  });

  it('rejects an invalid treatment plan identifier before starting a transaction', async () => {
    mongoose.isValidObjectId.mockReturnValue(false);

    await createFormalRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid treatment plan id',
    });
    expect(mongoose.startSession).not.toHaveBeenCalled();
  });

  it('rejects malformed assessment data before starting a transaction', async () => {
    createRiskAssessmentSchema.validate.mockReturnValue({
      error: { details: [{ message: '"assessmentType" is required' }] },
    });

    await createFormalRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid formal risk assessment',
      errors: ['"assessmentType" is required'],
    });
    expect(mongoose.startSession).not.toHaveBeenCalled();
  });

  it('returns 404 when the clinician has no matching active treatment plan', async () => {
    TreatmentPlan.findOne.mockReturnValue(queryReturning(null));

    await createFormalRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: false,
      message: 'Treatment plan not found',
    });
    expect(transaction.endSession).toHaveBeenCalledTimes(1);
  });

  it('rejects a clinical patient without a canonical platform user identity', async () => {
    PsychologicalPatient.findOne.mockReturnValue(queryReturning({ user: null }));

    await createFormalRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0].message).toContain('canonical patient identity');
    expect(RiskAssessment.create).not.toHaveBeenCalled();
    expect(transaction.endSession).toHaveBeenCalledTimes(1);
  });

  it('rejects an unknown clinician', async () => {
    Doctor.findById.mockReturnValue(queryReturning(null));

    await createFormalRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0][0].message).toBe('Clinician not found');
    expect(RiskAssessment.create).not.toHaveBeenCalled();
  });

  it('requires an approved clinician profile and recorded license number', async () => {
    doctor.isApproved = 'pending';

    await createFormalRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0].message).toContain('professional license number');
    expect(RiskAssessment.create).not.toHaveBeenCalled();
  });

  it('rejects a session that does not belong to the patient and treatment plan', async () => {
    req.body = { ...validPayload(), sessionId: SESSION_ID };
    TherapySession.findOne.mockReturnValue({
      session: jest.fn().mockResolvedValue(null),
    });

    await createFormalRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe('Session does not belong to this patient and treatment plan');
    expect(RiskAssessment.create).not.toHaveBeenCalled();
  });

  it('rejects client-supplied provenance IDs until ownership verification is supported', async () => {
    req.body = { ...validPayload(), sourceMeasureId: SESSION_ID };

    await createFormalRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toContain('ownership can be verified');
    expect(RiskAssessment.create).not.toHaveBeenCalled();
  });

  it('creates, signs, locks, and links a valid formal assessment inside a transaction', async () => {
    req.body = {
      ...validPayload(),
      clinicalImpression: {
        overallRiskLevel: 'HIGH',
        riskLevelJustification: 'Current findings require active intervention.',
      },
    };

    await createFormalRiskAssessment(req, res);

    expect(TreatmentPlan.findOne).toHaveBeenCalledWith({
      _id: PLAN_ID,
      psychologist: CLINICIAN_ID,
      isDeleted: { $ne: true },
    });
    expect(RiskAssessment.create).toHaveBeenCalledWith(
      [expect.objectContaining({
        patientId: patient.user,
        treatmentPlanId: plan._id,
        assessedBy: CLINICIAN_ID,
        assessmentType: 'INTAKE',
        signature: expect.objectContaining({
          clinicianId: CLINICIAN_ID,
          clinicianName: doctor.name,
          licenseNumber: doctor.licenseNumber,
        }),
        locked: false,
      })],
      { session: transaction },
    );
    expect(assessment.$session).toHaveBeenCalledWith(transaction);
    expect(assessment.signAndLock).toHaveBeenCalledWith(doctor);
    expect(plan.riskLevel).toBe('HIGH');
    expect(plan.lastRiskAssessment).toMatchObject({
      assessedBy: CLINICIAN_ID,
      interventionRequired: true,
      riskAssessmentId: assessment._id,
    });
    expect(plan.$locals.clinicalAuditActor).toMatchObject({
      userId: CLINICIAN_ID,
      role: 'Doctor',
      email: req.user.email,
      ip: req.ip,
      userAgent: 'test-agent',
    });
    expect(plan.save).toHaveBeenCalledWith({ session: transaction });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Formal risk assessment recorded and locked',
      data: assessment,
    }));
    expect(transaction.endSession).toHaveBeenCalledTimes(1);
  });

  it('returns a controlled server error and closes the transaction on unexpected failures', async () => {
    TreatmentPlan.findOne.mockImplementation(() => {
      throw new Error('database unavailable');
    });

    await createFormalRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: false,
      message: 'database unavailable',
    });
    expect(transaction.endSession).toHaveBeenCalledTimes(1);
  });
});
