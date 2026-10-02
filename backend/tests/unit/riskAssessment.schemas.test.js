import { createRiskAssessmentSchema } from '../../validators/schemas/riskAssessment.schemas.js';

describe('Risk assessment schema', () => {
  const valid = {
    assessmentType: 'SYMPTOM_WORSENING',
    assessmentContext: 'PHQ-9 item 9 was positive and requires formal clinical review.',
    columbiaScale: {
      suicidalIdeationScore: 2,
      intensityScore: 4,
      behaviorScore: 0,
    },
    clinicalImpression: {
      overallRiskLevel: 'MODERATE',
      riskLevelJustification: 'Formal clinical assessment indicates moderate current risk based on the documented findings.',
      timeFrame: 'ACUTE',
      clinicianConcernLevel: 6,
    },
    legalDocumentation: {
      dutyToProtectConsidered: true,
      informedConsentObtained: true,
    },
    signature: {
      licenseNumber: 'TP-TEST-001',
    },
  };

  test('accepts a complete formal assessment', () => {
    const { error } = createRiskAssessmentSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  test('requires explicit clinical risk judgment', () => {
    const { error } = createRiskAssessmentSchema.validate({
      ...valid,
      clinicalImpression: undefined,
    });
    expect(error).toBeDefined();
  });

  test('requires C-SSRS composite scores', () => {
    const { error } = createRiskAssessmentSchema.validate({
      ...valid,
      columbiaScale: { suicidalIdeationScore: 2, intensityScore: 4 },
    });
    expect(error).toBeDefined();
  });

  test('requires legal documentation and clinician credential', () => {
    const { error } = createRiskAssessmentSchema.validate({
      ...valid,
      legalDocumentation: undefined,
      signature: undefined,
    });
    expect(error).toBeDefined();
  });
});
