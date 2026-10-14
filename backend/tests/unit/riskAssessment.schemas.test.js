import { createRiskAssessmentSchema } from '../../validators/schemas/riskAssessment.schemas.js';

const objectId = '507f1f77bcf86cd799439011';

const validAssessment = () => ({
  assessmentType: 'CRISIS',
  assessmentContext: 'La persona comunica un cambio clínico que requiere valoración documentada.',
  columbiaScale: {
    suicidalIdeationScore: 2,
    screening: {
      suicidalThoughts: { lifetime: false, recent: true },
    },
  },
  clinicalImpression: {
    overallRiskLevel: 'HIGH',
    riskLevelJustification: 'La decisión clínica se fundamenta en la entrevista y los factores actuales.',
    timeFrame: 'ACUTE',
    clinicianConcernLevel: 8,
  },
  followUp: {
    nextAssessmentDue: '2026-10-15T12:00:00.000Z',
    nextAssessmentReason: 'Reevaluar evolución y medidas de seguridad.',
  },
  legalDocumentation: {
    dutyToProtectConsidered: true,
    informedConsentObtained: true,
  },
});

describe('createRiskAssessmentSchema', () => {
  test('accepts a complete clinician-authored assessment', () => {
    const { error, value } = createRiskAssessmentSchema.validate(validAssessment(), {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    expect(error).toBeUndefined();
    expect(value.clinicalImpression.overallRiskLevel).toBe('HIGH');
    expect(value.columbiaScale.suicidalIdeationScore).toBe(2);
  });

  test('accepts optional provenance IDs only in ObjectId format', () => {
    const input = { ...validAssessment(), treatmentPlanId: objectId, sessionId: objectId };
    // treatmentPlanId is obtained from the authorized URL, never accepted from the body.
    delete input.treatmentPlanId;
    input.sessionId = objectId;

    const { error, value } = createRiskAssessmentSchema.validate(input);
    expect(error).toBeUndefined();
    expect(value.sessionId).toBe(objectId);
  });

  test('rejects a screening score without documented clinical judgment', () => {
    const input = validAssessment();
    delete input.clinicalImpression.riskLevelJustification;

    const { error } = createRiskAssessmentSchema.validate(input, { abortEarly: false });
    expect(error).toBeDefined();
  });

  test('rejects unsupported risk levels and invalid C-SSRS score ranges', () => {
    const invalidRisk = validAssessment();
    invalidRisk.clinicalImpression.overallRiskLevel = 'SEVERE';
    expect(createRiskAssessmentSchema.validate(invalidRisk).error).toBeDefined();

    const invalidScore = validAssessment();
    invalidScore.columbiaScale.suicidalIdeationScore = 9;
    expect(createRiskAssessmentSchema.validate(invalidScore).error).toBeDefined();
  });

  test('requires legal documentation and rejects client-supplied signature data', () => {
    const missingLegal = validAssessment();
    delete missingLegal.legalDocumentation.informedConsentObtained;
    expect(createRiskAssessmentSchema.validate(missingLegal).error).toBeDefined();

  });

  test('rejects unknown top-level fields instead of silently accepting client-controlled data', () => {
    const input = { ...validAssessment(), patientId: objectId, assessedBy: objectId };
    const { error } = createRiskAssessmentSchema.validate(input);
    expect(error).toBeDefined();
  });
});
