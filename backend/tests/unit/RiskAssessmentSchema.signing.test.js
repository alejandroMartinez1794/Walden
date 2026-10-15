import mongoose from 'mongoose';
import RiskAssessment from '../../models/RiskAssessmentSchema.js';

const buildAssessment = (overrides = {}) => new RiskAssessment({
  patientId: new mongoose.Types.ObjectId(),
  treatmentPlanId: new mongoose.Types.ObjectId(),
  assessedBy: new mongoose.Types.ObjectId(),
  assessmentDate: new Date('2026-10-14T12:00:00.000Z'),
  assessmentType: 'CRISIS',
  assessmentContext: 'Documented clinical change requiring formal assessment.',
  columbiaScale: { suicidalIdeationScore: 2 },
  clinicalImpression: {
    overallRiskLevel: 'HIGH',
    riskLevelJustification: 'Documented clinical rationale.',
  },
  interventionPlan: {},
  followUp: {},
  legalDocumentation: {
    dutyToProtectConsidered: true,
    informedConsentObtained: true,
  },
  signature: {
    clinicianId: new mongoose.Types.ObjectId(),
    clinicianName: 'Test Clinician',
    licenseNumber: 'TEST-LICENSE',
    signedAt: new Date('2026-10-14T12:00:00.000Z'),
  },
  locked: false,
  ...overrides,
});

describe('RiskAssessment signing and immutability methods', () => {
  test('signAndLock signs the record, locks it, and saves through the document session', async () => {
    const assessment = buildAssessment();
    const clinician = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Clinician',
      licenseNumber: 'TEST-LICENSE',
    };
    const save = jest.spyOn(assessment, 'save').mockResolvedValue(assessment);

    const result = await assessment.signAndLock(clinician);

    expect(result).toBe(assessment);
    expect(assessment.locked).toBe(true);
    expect(assessment.signature.clinicianId).toEqual(clinician._id);
    expect(assessment.signature.clinicianName).toBe(clinician.name);
    expect(assessment.signature.licenseNumber).toBe(clinician.licenseNumber);
    expect(assessment.signature.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(save).toHaveBeenCalledTimes(1);
    expect(assessment.$locals.allowSigning).toBe(false);
  });

  test('signAndLock rejects an already locked record without saving', async () => {
    const assessment = buildAssessment({ locked: true });
    const save = jest.spyOn(assessment, 'save').mockResolvedValue(assessment);

    await expect(assessment.signAndLock({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Clinician',
      licenseNumber: 'TEST-LICENSE',
    })).rejects.toThrow('Assessment already locked');

    expect(save).not.toHaveBeenCalled();
  });

  test('signing permission is cleared if the persistence operation fails', async () => {
    const assessment = buildAssessment();
    jest.spyOn(assessment, 'save').mockRejectedValue(new Error('database failure'));

    await expect(assessment.signAndLock({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Clinician',
      licenseNumber: 'TEST-LICENSE',
    })).rejects.toThrow('database failure');

    expect(assessment.$locals.allowSigning).toBe(false);
  });
});
