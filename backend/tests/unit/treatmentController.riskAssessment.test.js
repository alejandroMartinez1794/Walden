import ClinicalAlert from '../../models/ClinicalAlertSchema.js';
import { assertTreatmentPlanAccess } from '../../services/clinicalAuthorization.js';
import { updateRiskAssessment } from '../../Controllers/clinical/treatmentController.js';

jest.mock('../../models/TreatmentPlanSchema.js', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../../models/TherapySessionSchema.js', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../../services/ClinicalDecisionEngine.js', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../../models/ClinicalAlertSchema.js', () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));
jest.mock('../../models/PsychologicalPatientSchema.js', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../../services/clinicalAuthorization.js', () => ({
  assertTreatmentPlanAccess: jest.fn(),
}));

const responseMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('updateRiskAssessment', () => {
  let req;
  let res;
  let plan;

  beforeEach(() => {
    jest.clearAllMocks();
    plan = {
      _id: '507f1f77bcf86cd799439011',
      patient: '507f1f77bcf86cd799439012',
      populate: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
    };
    req = {
      params: { treatmentPlanId: plan._id },
      userId: '507f1f77bcf86cd799439013',
      user: { email: 'clinician@example.test' },
      body: { riskLevel: 'LOW', columbiaScore: 0, interventionRequired: false },
    };
    res = responseMock();
    assertTreatmentPlanAccess.mockResolvedValue(plan);
  });

  it('rejects invalid snapshots before performing authorization or mutation', async () => {
    req.body = { riskLevel: 'UNRECOGNIZED' };

    await updateRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: false,
      message: 'Invalid risk snapshot',
    });
    expect(assertTreatmentPlanAccess).not.toHaveBeenCalled();
    expect(plan.save).not.toHaveBeenCalled();
  });

  it('requires an explicit intervention flag for high and imminent risk', async () => {
    req.body = { riskLevel: 'HIGH', columbiaScore: 5 };

    await updateRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors.join(' ')).toContain('intervention flag');
    expect(assertTreatmentPlanAccess).not.toHaveBeenCalled();
  });

  it('persists a low-risk snapshot without creating a crisis alert', async () => {
    req.body = {
      riskLevel: 'LOW',
      riskFactors: [{ factor: 'Insomnia', severity: 'MODERATE', mitigationPlan: 'Review sleep routine' }],
      columbiaScore: 0,
      interventionRequired: false,
    };

    await updateRiskAssessment(req, res);

    expect(assertTreatmentPlanAccess).toHaveBeenCalledWith({
      req,
      treatmentPlanId: plan._id,
      action: 'update clinical risk',
    });
    expect(plan.riskLevel).toBe('LOW');
    expect(plan.lastRiskAssessment).toMatchObject({
      assessedBy: req.userId,
      columbiaScore: 0,
      interventionRequired: false,
    });
    expect(plan.riskFactors).toHaveLength(1);
    expect(plan.save).toHaveBeenCalledTimes(1);
    expect(ClinicalAlert.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('creates a warning alert for high risk after saving the snapshot', async () => {
    req.body = {
      riskLevel: 'HIGH',
      riskFactors: [{ factor: 'Recent deterioration', severity: 'HIGH' }],
      columbiaScore: 4,
      interventionRequired: true,
    };

    await updateRiskAssessment(req, res);

    expect(plan.save).toHaveBeenCalledTimes(1);
    expect(ClinicalAlert.create).toHaveBeenCalledWith(expect.objectContaining({
      patientId: plan.patient,
      treatmentPlanId: plan._id,
      alertType: 'SUICIDE_RISK',
      severity: 'WARNING',
      triggeredBy: 'CLINICIAN_MANUAL',
      title: 'HIGH Suicide Risk Documented',
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('creates a critical alert for imminent risk with emergency recommendations', async () => {
    req.body = {
      riskLevel: 'IMMINENT',
      columbiaScore: 5,
      interventionRequired: true,
    };

    await updateRiskAssessment(req, res);

    expect(ClinicalAlert.create).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'CRITICAL',
      title: 'IMMINENT Suicide Risk Documented',
      recommendedActions: expect.arrayContaining([
        'Activate Suicide Protocol',
        'Ensure patient safety',
      ]),
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns authorization errors without exposing a successful mutation', async () => {
    const accessError = new Error('Forbidden');
    accessError.statusCode = 403;
    assertTreatmentPlanAccess.mockRejectedValue(accessError);

    await updateRiskAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Forbidden' });
    expect(plan.save).not.toHaveBeenCalled();
    expect(ClinicalAlert.create).not.toHaveBeenCalled();
  });
});
