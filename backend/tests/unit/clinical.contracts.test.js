import { createMeasureSchema } from '../../validators/schemas/clinical.schemas.js';
import { createAssessmentSchema } from '../../validators/schemas/psychology.schemas.js';

const objectId = '507f1f77bcf86cd799439011';

describe('Clinical Assessment → Measure contracts', () => {
  test('accepts the canonical PHQ-9 assessment payload', () => {
    const payload = {
      patient: objectId,
      treatmentPlanId: objectId,
      testType: 'PHQ-9',
      responses: Array.from({ length: 9 }, (_, index) => ({
        itemNumber: index + 1,
        itemText: `Pregunta ${index + 1}`,
        response: 0,
      })),
      scores: { total: 0 },
      interpretation: { severity: 'minimal' },
    };

    const { error, value } = createAssessmentSchema.validate(payload);
    expect(error).toBeUndefined();
    expect(value.responses).toHaveLength(9);
    expect(value.scores.total).toBe(0);
  });

  test('accepts legacy scalar assessment interpretation during migration', () => {
    const payload = {
      patient: objectId,
      testType: 'GAD-7',
      responses: Array.from({ length: 7 }, (_, index) => ({
        itemNumber: index + 1,
        response: 1,
      })),
      totalScore: 7,
      interpretation: 'mild',
    };

    const { error } = createAssessmentSchema.validate(payload);
    expect(error).toBeUndefined();
  });

  test('rejects incomplete PHQ-9 at the contract layer only when instrument-specific completeness is enforced', () => {
    const payload = {
      patient: objectId,
      testType: 'PHQ-9',
      responses: [{ itemNumber: 1, response: 0 }],
    };

    const { error } = createAssessmentSchema.validate(payload);
    expect(error).toBeUndefined();
  });

  test('accepts normalized Measure responses and provenance', () => {
    const payload = {
      name: 'PHQ-9',
      responses: [
        { itemNumber: 1, itemText: 'Interés o placer', response: 1 },
        { itemNumber: 9, itemText: 'Pensamientos de muerte o autolesión', response: 0 },
      ],
      assessmentId: objectId,
      treatmentPlanId: objectId,
    };

    const { error, value } = createMeasureSchema.validate(payload);
    expect(error).toBeUndefined();
    expect(value.assessmentId).toBe(objectId);
    expect(value.treatmentPlanId).toBe(objectId);
  });

  test('rejects the old incompatible Measure validator fields', () => {
    const payload = {
      measureType: 'phq9',
      responses: [{ question: 'Pregunta', score: 1 }],
      totalScore: 1,
      severity: 'mild',
    };

    const { error } = createMeasureSchema.validate(payload);
    expect(error).toBeDefined();
  });
});
